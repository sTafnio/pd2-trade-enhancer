// Livesearch on /market/exchange, on the same shared poll loop as /market's (livesearch/poll.ts): the
// page's own search (its currencies, modes and toggles, matched exactly as loosely as its Search button
// matches them) polled for exchange listings saved (created or bumped: updated_at) after Start. The
// results area becomes a feed of only those, and they alert like market hits (without the market panel's
// Recent Hits, which stays market-only). It runs only while /market/exchange is open.
import { unlockSound } from "../notifications/sound";
import { getListingService, onPageFind } from "../pd2/vue-bridge";
import type { Query } from "../pd2/vue-bridge";
import { getCurrencyNames, getExchangePage, hasPicks, isExchangeSearchQuery, readForm } from "../pd2/exchange-bridge";
import type { CurrencyPicks, ExchangeEntry, ExchangeForm, ExchangeListing, ExchangePage } from "../pd2/exchange-bridge";
import {
  CAPTURE_ATTEMPTS,
  CAPTURE_TIMEOUT_MS,
  createPollLoop,
  createRunMarker,
  searchBaseOf,
  timeOf,
} from "../livesearch/poll";
import type { PollLoop, StatusTone, WatchedSearch } from "../livesearch/poll";
import { createFeedTracker } from "../livesearch/feed-tracker";
import type { Hit } from "../trade/hits";
import { clockTime, errorMessage, isExchangePath, stableStringify } from "../utils";
import { setExchangeRunning, setExchangeStatus, setWatchedLabel } from "./exchange-ui";

const LOG = "[pd2-trade-enhancer]";

const marker = createRunMarker("pd2te-exchange-livesearch-running", "Exchange livesearch", "Livesearch");

// What the site's own cards call these (they aren't in its item table)
const SPECIAL_NAMES: Record<string, string> = { hrs: "HRs", gold: "Gold", pgems: "PGems" };

interface WatchedExchange extends WatchedSearch {
  label: string;
}

interface Session {
  signal: AbortSignal;
  finalStatus: [string, StatusTone] | null; // why it stopped; stays until the next Start
  sync: () => void; // re-attach to the visible exchange page
}

let session: Session | null = null;
let controller: AbortController | null = null;

export const isExchangeLivesearchRunning = () => controller !== null;

const currencyName = (code: string, names: Record<string, string>) => SPECIAL_NAMES[code] ?? names[code] ?? code;

const entriesText = (entries: ExchangeEntry[] | null | undefined, names: Record<string, string>) =>
  (entries ?? [])
    .map((entry) => {
      const quantity = Number(entry.quantity);
      return `${currencyName(entry.base_code ?? "?", names)}${quantity > 1 ? ` x${quantity}` : ""}`;
    })
    .join(", ");

const picksText = (picks: CurrencyPicks, names: Record<string, string>) =>
  Object.keys(picks)
    .map((code) => currencyName(code, names))
    .join(", ");

const describe = (form: ExchangeForm, names: Record<string, string>) =>
  `${picksText(form.want, names) || "anything"} for ${picksText(form.have, names) || "anything"}`;

const toHit = (listing: ExchangeListing, names: Record<string, string>): Hit => ({
  id: listing._id,
  name: `${entriesText(listing.exchange?.have, names) || "?"} for ${entriesText(listing.exchange?.want, names) || "?"}`,
  price: listing.price?.trim() || undefined, // the seller's note
  savedAt: timeOf(listing) || undefined,
});

// Called whenever the exchange page (re)mounts: a running livesearch re-attaches to it, else a run this
// tab lost to a reload is reported
export const onExchangePageMounted = () => {
  if (session) {
    session.sync();
    return;
  }
  marker.reportLost(setExchangeStatus);
};

// --- Start / Stop ---
export const startExchangeLivesearch = () => {
  if (controller) return;
  const page = getExchangePage();
  const service = getListingService();
  if (!page || !service) {
    console.warn(LOG, `Exchange livesearch can't start: ${page ? "the site's API client" : "the exchange page"} wasn't found.`);
    setExchangeStatus("Can't start: the site's app isn't reachable (see console)", "error");
    return;
  }
  if (!hasPicks(page)) {
    setExchangeStatus("Pick what you want or have first", "warn");
    return;
  }

  unlockSound(); // user gesture: loads the alert sound so the first hit plays right away
  const current = new AbortController();
  controller = current;
  const s: Session = { signal: current.signal, finalStatus: null, sync: () => {} };
  session = s;
  marker.set(true);
  setExchangeRunning(true);
  setExchangeStatus("Starting...");
  void livesearch(s, page);
};

export const stopExchangeLivesearch = (reason: string) => {
  if (!controller || !session) return;
  session.finalStatus ??= [reason, "info"];
  controller.abort(); // every wait resolves on abort; livesearch()'s finally cleans up
};

// It runs only while /market/exchange is open: leaving it (another market tab, any other page of the site)
// stops it, so nothing keeps running unseen. A background browser tab still counts as open.
export const stopExchangeLivesearchOffPage = () => {
  if (controller && !isExchangePath()) stopExchangeLivesearch(`Stopped at ${clockTime()}: you left the Exchange page`);
};

const livesearch = async (s: Session, startPage: ExchangePage) => {
  const { signal } = s;
  const service = getListingService();
  let shown: { page: ExchangePage; signature: string } | null = null; // what the visible page searched last
  let names = getCurrencyNames(startPage); // base_code -> name

  let loop!: PollLoop<WatchedExchange>; // assigned right below; the closures only run afterwards
  const tracker = createFeedTracker<ExchangePage, ExchangeListing>({
    signal,
    what: "exchange",
    rowsKey: "exchanges",
    getPage: () => getExchangePage(),
    showsWatchedSearch: (page) => {
      const current = loop.currentSearch();
      return !loop.hasPending() && current !== null && shown?.page === page && shown.signature === current.signature;
    },
    refetch: (page) => page.searchExchanges(Number(page.page) || 1),
    hasUnsearchedEdits: (page, searchedForm) =>
      searchedForm === null || stableStringify(readForm(page)) !== searchedForm,
    status: setExchangeStatus,
  });

  const offFind = service
    ? onPageFind({
        // Only searchExchanges(): it sets `loading` before its find, and the hooks run after that
        found: (query: Query, call: object) => {
          const page = getExchangePage();
          if (!page || page.loading !== true || !isExchangeSearchQuery(query)) return;

          const form = readForm(page);
          tracker.pageSearched(call, stableStringify(form));
          const base = searchBaseOf(query);
          const signature = stableStringify(base);
          shown = { page, signature };
          names = { ...names, ...getCurrencyNames(page) };
          loop.propose({ base, resolve: query.$resolve, signature, label: describe(form, names) });
        },
        failed: (query: Query, call: object, error: unknown) => {
          const page = getExchangePage();
          if (!page || page.loading !== true || !isExchangeSearchQuery(query)) return;
          tracker.pageSearchFailed(call, error);
        },
      })
    : null;

  try {
    if (!service || !offFind) {
      console.warn(LOG, "Exchange livesearch can't start: the market/listing find hooks couldn't be installed.");
      s.finalStatus ??= ["Can't start: the site's app isn't reachable (see console)", "error"];
      return;
    }

    loop = createPollLoop<WatchedExchange, ExchangeListing>({
      signal,
      service,
      tracker,
      label: "Exchange livesearch",
      goneType: "exchange",
      recentHits: false,
      status: setExchangeStatus,
      // Whole listings with the page's $resolve: exchange listings are few, and the feed shows them as they come
      findPage: (find, search, since, skip, limit) => {
        const query: Query = {
          ...search.base,
          updated_at: { $gt: new Date(since).toISOString() },
          $sort: { updated_at: -1, _id: -1 },
          $skip: skip,
          $limit: limit,
        };
        if (search.resolve !== undefined) query.$resolve = search.resolve;
        return find(query);
      },
      toHit: (row) => toHit(row, names),
      feedRows: (_find, _search, fresh) => Promise.resolve(fresh), // polled complete, ready for the page's cards
      onSwitch: (search) => setWatchedLabel(search.label),
    });

    s.sync = () => {
      tracker.sync();
    };
    tracker.sync();

    // Start: the page's own search, exactly as its Search button runs it; the find hook captures the query
    let captured = false;
    let attempt = 0;
    while (attempt < CAPTURE_ATTEMPTS && !signal.aborted) {
      // Still disconnected: the page's search would be held in socket.io's buffer too
      if (!(await loop.waitForConnection())) continue;
      attempt++;

      setExchangeStatus("Searching...");
      try {
        (getExchangePage() ?? startPage).searchExchanges(1);
      } catch (error) {
        console.warn(LOG, "Calling the exchange page's search failed.", error);
        break;
      }
      if (await loop.waitForSearch(CAPTURE_TIMEOUT_MS)) {
        captured = true;
        break;
      }
    }
    if (!captured) {
      if (!signal.aborted) {
        console.warn(LOG, "The exchange page's search never reached the market/listing find hook.");
        s.finalStatus ??= ["Stopped: couldn't capture the page's search (see console)", "error"];
      }
      return;
    }

    await loop.run();
  } catch (error) {
    console.error(LOG, "Exchange livesearch stopped after an error:", error);
    s.finalStatus ??= [`Stopped: ${errorMessage(error)} (see console)`, "error"];
  } finally {
    offFind?.();
    tracker.release();
    loop?.release();
    if (session === s) session = null;
    controller?.abort(); // this run's: only one runs at a time
    controller = null;
    marker.set(false);
    setExchangeRunning(false);
    setWatchedLabel("");
    setExchangeStatus(...(s.finalStatus ?? ["Stopped", "info"]));
    console.info(LOG, "Exchange livesearch stopped.");
  }
};
