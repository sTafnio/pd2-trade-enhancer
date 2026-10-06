// The livesearch engine shared by /market and /market/exchange: it holds one watched search (the page's
// own query minus per-request keys), polls market/listing for saves after Start, dedupes them across the
// overlap window, alerts, feeds the page tracker, backs off on failures, pauses on rate limits and while
// the socket is down. The adapters (trade/api-livesearch.ts, exchange/exchange-livesearch.ts) say what a
// search looks like, how a row becomes a hit and what the feed's cards need.
import { getMyUserId, getSocket } from "../pd2/vue-bridge";
import type { FindResult, Listing, ListingService, Query } from "../pd2/vue-bridge";
import { reportHits } from "../trade/hits";
import type { Hit } from "../trade/hits";
import { Settings } from "../trade/settings";
import { clockTime, errorMessage, isRateLimitError, sleep } from "../utils";

const LOG = "[pd2-trade-enhancer]";

export type StatusTone = "info" | "warn" | "error";

const FIRST_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 250; // the server caps $limit here
const MAX_PAGES = 5;
// Each check re-reads this much before the newest save it has seen: saves running at the same time can
// become visible slightly out of order. Saves in that overlap are recognised by id + updated_at.
const OVERLAP_MS = 15_000;
const REQUEST_TIMEOUT_MS = 15_000; // the client rejects at 10 s; the auth hook can hold a call longer
export const CAPTURE_TIMEOUT_MS = 8_000;
export const CAPTURE_ATTEMPTS = 2;
const BACKOFF_BASE_MS = 5_000;
const BACKOFF_MAX_MS = 60_000;
const RATE_LIMIT_PAUSE_MS = 60_000;
const RECONNECT_WAIT_MS = 60_000;
const MIN_REQUEST_GAP_MS = 2_000;
const GONE_CHECK_MS = 60_000; // how often the feed's listings are checked (one request) for having left the market
// The Start time never lies further back than this before this computer's clock: a wrong answer from the
// server can then add at most this much of old listings. Generous, so a computer clock that runs ahead of
// the server never makes the Start time skip real listings
const MAX_START_LAG_MS = 10 * 60_000;

// Recomputed per request; everything else in the page's query is the user's search
const VOLATILE_KEYS = ["$limit", "$skip", "$sort", "$select", "$resolve", "updated_at", "bumped_at"];

// The user's search: the page's query minus the per-request keys; `prune` first removes whatever else the
// page adds per request (the market page's price-sort filter)
export const searchBaseOf = (query: Query, prune?: (base: Query) => void): Query => {
  const base = JSON.parse(JSON.stringify(query)) as Query;
  prune?.(base);
  VOLATILE_KEYS.forEach((key) => delete base[key]);
  return base;
};

type Failure = { ok: false; aborted: boolean; error: unknown };
export type FindOutcome = { ok: true; result: FindResult<Listing> } | Failure;
export type FindFn = (query: Query) => Promise<FindOutcome>;

export const timeOf = (listing: Listing) => Date.parse(listing.updated_at ?? "") || 0;

// One save of one listing: a later price change or bump of the same listing is a new event
const saveKey = (listing: Listing) => `${listing._id}|${listing.updated_at ?? ""}`;

export const isListing = (row: unknown): row is Listing =>
  typeof row === "object" && row !== null && typeof (row as Listing)._id === "string";

// Newest save first, ties by _id: the order the checks return rows in, so the feed and Recent Hits match
const newestFirst = (a: Listing, b: Listing) => timeOf(b) - timeOf(a) || (a._id < b._id ? 1 : a._id > b._id ? -1 : 0);

// One find with our own timeout; a late answer after a timeout or Stop is ignored (socket emits can't be cancelled)
export const findOnce = (service: ListingService, query: Query, signal: AbortSignal): Promise<FindOutcome> =>
  new Promise((resolve) => {
    if (signal.aborted) return resolve({ ok: false, aborted: true, error: null });

    let settled = false;
    const finish = (outcome: FindOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      resolve(outcome);
    };
    const onAbort = () => finish({ ok: false, aborted: true, error: null });
    const timeoutId = setTimeout(() => {
      const error = { name: "Timeout", code: 408, message: `no answer after ${REQUEST_TIMEOUT_MS / 1000}s` };
      finish({ ok: false, aborted: false, error });
    }, REQUEST_TIMEOUT_MS);
    signal.addEventListener("abort", onAbort, { once: true });

    try {
      service.find({ query, pd2: true }).then(
        (result) => finish({ ok: true, result }),
        (error: unknown) => finish({ ok: false, aborted: false, error })
      );
    } catch (error) {
      finish({ ok: false, aborted: false, error });
    }
  });

// Where a livesearch starts watching: the server's clock, read as the newest save anywhere on the market,
// whatever the user's search matches. Shaped like the market page's own search (type + accepted_offer_id):
// without them the server may answer for the user's own listings instead, as the create page asks it to
const fetchStartTime = async (
  service: ListingService,
  signal: AbortSignal
): Promise<{ ok: true; time: number } | Failure> => {
  const query = {
    type: "item",
    accepted_offer_id: null,
    $sort: { updated_at: -1, _id: -1 },
    $limit: 1,
    $select: ["_id", "updated_at"],
  };
  const outcome = await findOnce(service, query, signal);
  if (!outcome.ok) return outcome;

  const newest = (outcome.result.data ?? []).find(isListing);
  const serverTime = newest ? timeOf(newest) : 0;
  const floor = Date.now() - MAX_START_LAG_MS;
  if (serverTime >= floor) {
    console.info(LOG, `Watching saves after ${new Date(serverTime).toISOString()} (newest save on the market).`);
    return { ok: true, time: serverTime };
  }

  const found = serverTime > 0 ? `was saved at ${new Date(serverTime).toISOString()}` : "could not be read";
  console.warn(
    LOG,
    `The newest save on the market ${found}, more than ${MAX_START_LAG_MS / 60_000} min before this computer's ` +
      `clock (${new Date().toISOString()}). Watching saves after ${new Date(floor).toISOString()} instead. ` +
      "(A quiet market does this too; if listings keep showing up late, reload the page.)"
  );
  return { ok: true, time: floor };
};

// Per tab, and kept across a reload and Firefox's low-memory tab unloading, which both end a run silently
export const createRunMarker = (storageKey: string, label: string, resumeButton: string) => ({
  set: (running: boolean) => {
    try {
      if (running) sessionStorage.setItem(storageKey, String(Date.now()));
      else sessionStorage.removeItem(storageKey);
    } catch {
      // storage blocked: the reload notice is best effort
    }
  },
  // Reports a run this tab lost to a reload, once; quiet when there was none
  reportLost: (status: (text: string, tone: StatusTone) => void) => {
    let value: string | null = null;
    try {
      value = sessionStorage.getItem(storageKey);
      if (value !== null) sessionStorage.removeItem(storageKey);
    } catch {
      return;
    }
    if (value === null) return;
    const startedAt = Number(value) || 0;
    const since = startedAt > 0 ? ` (started ${clockTime(startedAt)})` : "";
    console.warn(
      `${LOG} ${label}${since} ended when this page reloaded: a reload, or Firefox unloading the background tab ` +
        "to save memory (pinned tabs are unloaded last; about:config browser.tabs.unloadOnLowMemory turns it off)."
    );
    status(`Not running: the page reloaded while livesearch was on${since}. Press ${resumeButton} to resume`, "warn");
  },
});

export interface WatchedSearch {
  base: Query;
  resolve: unknown; // the page's $resolve: feed-ready listings are fetched with it
  signature: string;
}

// What the loop needs from the page tracker (livesearch/feed-tracker.ts provides the rest)
export interface FeedSink<R extends Listing> {
  sync(): unknown;
  startFeed(): void;
  addToFeed(rows: R[]): void;
  liveFeedIds(): string[];
  markGone(ids: string[]): void;
}

export interface PollConfig<S extends WatchedSearch, R extends Listing> {
  signal: AbortSignal;
  service: ListingService;
  tracker: FeedSink<R>;
  label: string; // console wording: "Livesearch" / "Exchange livesearch"
  goneType: string; // the listing `type` the feed's existence check asks for
  recentHits: boolean; // hits also go to the market panel's Recent Hits list
  status(text: string, tone?: StatusTone): void;
  // One page of saves for this search and window, through `find` (which paces requests)
  findPage(find: FindFn, search: S, since: number, skip: number, limit: number): Promise<FindOutcome>;
  toHit(row: R): Hit;
  // false: a save the server matched that the search still doesn't want (checked here, like "ignore socketed
  // items"); it's never alerted, and counts as seen
  keep?(search: S, row: R): boolean;
  // The rows the feed's cards need for these fresh hits (rows polled complete come back as they are)
  feedRows(find: FindFn, search: S, fresh: R[]): Promise<R[]>;
  onSwitch?(search: S): void; // the loop starts watching this search
}

export interface PollLoop<S extends WatchedSearch> {
  // A search the page ran: "queued" (watched from the next cycle), "reverted" (back to the search already
  // watched before a queued one replaced it) or "same" (pagination, a sort change or a repeat click)
  propose(next: S): "same" | "reverted" | "queued";
  currentSearch(): S | null;
  hasPending(): boolean;
  find: FindFn;
  waitForConnection(): Promise<boolean>;
  // For Start-by-capture: waits until a search is proposed, at most `ms`
  waitForSearch(ms: number): Promise<boolean>;
  run(): Promise<void>;
  release(): void;
}

export const createPollLoop = <S extends WatchedSearch, R extends Listing>(config: PollConfig<S, R>): PollLoop<S> => {
  const { signal, service, tracker, label, status } = config;

  let current: S | null = null;
  let pending: S | null = null; // a search the user just ran; replaces `current` next cycle
  let startedAt: number | null = null; // server time the current search started watching; null: not yet known
  let cursor = 0; // newest updated_at (ms) seen for the current search
  const recent = new Map<string, number>(); // saves inside the overlap window -> their updated_at
  let failures = 0;
  let pausedUntil = 0;
  let lastRequestAt = 0;
  let lastGoneCheckAt = 0;
  let hitCount = 0;
  let wake = new AbortController(); // cuts the delay short when the user searches

  const nextWait = () => {
    const delay = Settings.getSettings().delay * 1000;
    const base =
      failures > 0
        ? Math.max(delay, Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (failures - 1)))
        : startedAt === null
          ? 0
          : delay;
    const now = Date.now();
    return Math.max(base, lastRequestAt + MIN_REQUEST_GAP_MS - now, pausedUntil - now);
  };
  const nextCheckText = () => `next ~${clockTime(Date.now() + nextWait())}`;

  const onRateLimit = () => {
    pausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
    console.warn(LOG, `The site reported a rate limit; pausing ${label.toLowerCase()} requests for 60 s.`);
    status(`Rate limited by the site: paused until ${clockTime(pausedUntil)}`, "warn");
  };
  const socket = getSocket();
  socket?.on("error.rate-limit", onRateLimit);

  const find: FindFn = (query) => {
    lastRequestAt = Date.now();
    return findOnce(service, query, signal);
  };

  // socket.io buffers emits while disconnected; don't pile polls into that buffer
  const waitForConnection = async (): Promise<boolean> => {
    const currentSocket = getSocket();
    if (!currentSocket || currentSocket.connected !== false) return true;

    status("Disconnected from the site: waiting for it to reconnect", "warn");
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timeoutId);
        currentSocket.off("connect", done);
        signal.removeEventListener("abort", done);
        resolve();
      };
      const timeoutId = setTimeout(done, RECONNECT_WAIT_MS);
      currentSocket.on("connect", done);
      signal.addEventListener("abort", done, { once: true });
    });
    return !signal.aborted && currentSocket.connected !== false;
  };

  // Every save after `since`, newest first, paging while pages come back full
  const fetchRows = async (search: S, since: number): Promise<{ ok: true; rows: R[]; truncated: boolean } | Failure> => {
    const rows: R[] = [];
    const ids = new Set<string>();
    let skip = 0;
    let limit = FIRST_PAGE_LIMIT;

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
      const outcome = await config.findPage(find, search, since, skip, limit);
      if (!outcome.ok) return outcome;

      const raw = outcome.result.data ?? [];
      raw.filter(isListing).forEach((row) => {
        if (ids.has(row._id)) return; // rows shift down a page when new saves arrive meanwhile
        ids.add(row._id);
        rows.push(row as R);
      });

      const pageSize = Math.min(limit, outcome.result.limit ?? limit);
      if (raw.length === 0 || raw.length < pageSize) return { ok: true, rows, truncated: false };

      skip += raw.length;
      limit = MAX_PAGE_LIMIT;
    }
    return { ok: true, rows, truncated: true };
  };

  // Feed listings the market no longer returns: sold or taken (an offer was accepted) or removed. Only
  // existence is asked, in the search type's own shape (type + accepted_offer_id), so the mode filters
  // don't matter. On an error nothing is marked; the next check asks again
  const findGoneListings = async (ids: string[]): Promise<string[]> => {
    const gone: string[] = [];
    for (let i = 0; i < ids.length; i += MAX_PAGE_LIMIT) {
      const batch = ids.slice(i, i + MAX_PAGE_LIMIT);
      const query = { type: config.goneType, accepted_offer_id: null, _id: { $in: batch }, $select: ["_id"], $limit: batch.length };
      const outcome = await find(query);
      if (!outcome.ok) return [];
      const present = new Set((outcome.result.data ?? []).filter(isListing).map((row) => row._id));
      batch.forEach((id) => {
        if (!present.has(id)) gone.push(id);
      });
    }
    return gone;
  };

  // Returns the saves not seen yet (own listings never alert) and moves the cursor forward
  const absorb = (rows: R[], since: number): R[] => {
    const me = getMyUserId();
    const fresh: R[] = [];
    rows.forEach((row) => {
      const time = timeOf(row);
      if (time <= since) return; // outside the window asked for: never alert on it, even if the server sent it
      cursor = Math.max(cursor, time);
      const key = saveKey(row);
      if (recent.has(key)) return;
      recent.set(key, time);
      if (!(me && row.user_id === me)) fresh.push(row);
    });
    // Saves older than the overlap are never read again
    recent.forEach((time, key) => {
      if (time <= cursor - OVERLAP_MS) recent.delete(key);
    });
    return fresh;
  };

  const reportFailure = (error: unknown) => {
    if (isRateLimitError(error)) pausedUntil = Math.max(pausedUntil, Date.now() + RATE_LIMIT_PAUSE_MS);
    const message = errorMessage(error);
    const wait = nextWait();
    console.warn(LOG, `${label} check failed (${failures}x): ${message}. Retrying in ${Math.round(wait / 1000)}s.`);
    status(`Check failed (${failures}x): ${message} - retry ~${clockTime(Date.now() + wait)}`, "error");
  };

  const run = async (): Promise<void> => {
    while (!signal.aborted) {
      if (pending) {
        // A new search: watch it from now on. The user just searched, so start right away
        current = pending;
        pending = null;
        startedAt = null;
        recent.clear();
        failures = 0;
        hitCount = 0; // the count belongs to one watched search
        config.onSwitch?.(current);
      }
      const search = current;
      if (!search) break;

      const wait = nextWait();
      if (wait > 0) {
        wake = new AbortController();
        await sleep(wait, signal, wake.signal);
        if (signal.aborted) break;
        if (pending || Date.now() < pausedUntil) continue; // new search, or a rate limit arrived
      }
      if (!(await waitForConnection()) || pending) continue;

      if (startedAt === null) {
        lastRequestAt = Date.now();
        const start = await fetchStartTime(service, signal);
        if (signal.aborted) break;
        if (pending) continue;
        if (!start.ok) {
          failures++;
          reportFailure(start.error);
          continue;
        }
        failures = 0;
        startedAt = start.time;
        cursor = start.time;
        tracker.startFeed(); // the results area now shows only new listings
        status(`Live since ${clockTime(startedAt)} - waiting for new listings - ${nextCheckText()}`);
        continue;
      }

      // Never before Start; otherwise the newest save seen minus the overlap
      const since = Math.max(startedAt, cursor - OVERLAP_MS);
      const outcome = await fetchRows(search, since);
      if (signal.aborted) break;
      if (pending) continue; // the user searched meanwhile: these rows belong to the old search

      if (!outcome.ok) {
        failures++;
        reportFailure(outcome.error);
        continue;
      }

      failures = 0;
      const fresh = absorb(outcome.rows, since).filter((row) => config.keep?.(search, row) ?? true);
      if (outcome.truncated) {
        console.warn(LOG, `More than ${outcome.rows.length} listings were saved since the last check; older ones may be missed.`);
      }

      if (fresh.length > 0) {
        hitCount += fresh.length;
        const saved = fresh.map(timeOf);
        console.info(
          LOG,
          `${label} check after ${new Date(since).toISOString()}: ${fresh.length} new, saved ` +
            `${new Date(Math.min(...saved)).toISOString()} .. ${new Date(Math.max(...saved)).toISOString()}.`
        );
        fresh.sort(newestFirst);
        reportHits(fresh.map(config.toHit), { recent: config.recentHits });
        tracker.addToFeed(await config.feedRows(find, search, fresh));
        if (signal.aborted) break;
      }

      // Feed listings that have since left the market are marked, at most every minute
      if (Date.now() - lastGoneCheckAt >= GONE_CHECK_MS) {
        const liveIds = tracker.liveFeedIds();
        if (liveIds.length > 0) {
          lastGoneCheckAt = Date.now();
          const gone = await findGoneListings(liveIds);
          if (signal.aborted) break;
          if (pending) continue;
          if (gone.length > 0) tracker.markGone(gone);
        }
      }

      tracker.sync();
      status(`Live since ${clockTime(startedAt)}: checked ${clockTime()} - ${hitCount} new - ${nextCheckText()}`);
    }
  };

  return {
    propose: (next) => {
      if (next.signature === (pending ?? current)?.signature) return "same";
      if (next.signature === current?.signature) {
        pending = null; // back to the watched search before the loop switched: keep watching it
        return "reverted";
      }
      pending = next;
      wake.abort();
      return "queued";
    },
    currentSearch: () => current,
    hasPending: () => pending !== null,
    find,
    waitForConnection,
    waitForSearch: async (ms) => {
      if (!pending) {
        wake = new AbortController();
        await sleep(ms, signal, wake.signal);
      }
      return pending !== null;
    },
    run,
    release: () => {
      socket?.off("error.rate-limit", onRateLimit);
      wake.abort();
    },
  };
};
