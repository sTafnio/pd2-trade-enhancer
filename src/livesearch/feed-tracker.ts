// The visible results page while a livesearch runs, shared by /market and /market/exchange: the results
// area becomes a feed of only the new listings (with listings that have since left the market marked as
// gone), and the page's own failed searches are recovered - its fetch has no .catch, so after a failed
// request `loading` would stay true forever.
import { getSocket, watchState } from "../pd2/vue-bridge";
import type { Unwatch, VueComponent } from "../pd2/vue-bridge";
import { LISTING_LINK_SELECTOR, listingIdFromHref } from "../trade/hits";
import { errorMessage, isRateLimitError } from "../utils";
import type { StatusTone } from "./poll";

const LOG = "[pd2-trade-enhancer]";
const STUCK_MS = 12_000; // backstop for requests that never fail (held by the auth hook, lost emits)
export const PAGE_SIZE = 10; // neither page passes a limit to its Pagination, which defaults to 10
const FEED_MAX = 50;
const EMPTY_RESULTS_TEXT = "no items match query"; // both pages' own empty state
const EMPTY_FEED_TEXT = "Waiting for new listings...";
const GONE_BADGE_TEXT = "Gone: sold or removed";

// The page's empty state reads "No items match query"; while the feed is empty it's still waiting
const relabelEmptyResults = (page: VueComponent) => {
  const root = page.$.subTree?.el;
  if (!(root instanceof Element)) return;
  root.querySelectorAll("h1, h2, h3, p, div").forEach((element) => {
    if (element.childElementCount === 0 && element.textContent?.trim().toLowerCase() === EMPTY_RESULTS_TEXT) {
      element.textContent = EMPTY_FEED_TEXT;
    }
  });
};

// Feed cards whose listing has left the market since: dimmed and badged, kept for context. Vue keeps a
// card's element across feed re-renders (keyed by id), so the mark is also taken off again when a listing
// comes back (saved again after a cancelled offer)
const markGoneCards = (page: VueComponent, gone: Set<string>) => {
  const root = page.$.subTree?.el;
  if (!(root instanceof Element)) return;
  root.querySelectorAll<HTMLElement>(".listing").forEach((card) => {
    const id = listingIdFromHref(card.querySelector<HTMLAnchorElement>(LISTING_LINK_SELECTOR)?.getAttribute("href") ?? null);
    if (!id) return;
    const marked = card.classList.contains("pd2te-gone");
    if (gone.has(id) && !marked) {
      card.classList.add("pd2te-gone");
      const badge = document.createElement("span");
      badge.className = "pd2te-gone-badge pd2te-own";
      badge.textContent = GONE_BADGE_TEXT;
      (card.querySelector(".meta .time .flex-grow") ?? card.querySelector(".meta") ?? card).append(badge);
    } else if (!gone.has(id) && marked) {
      card.classList.remove("pd2te-gone");
      card.querySelector(".pd2te-gone-badge")?.remove();
    }
  });
};

export interface FeedPage extends VueComponent {
  loading: boolean;
  total: number;
  page: number;
}

export interface FeedTrackerConfig<P extends FeedPage> {
  signal: AbortSignal;
  what: string; // "market" / "exchange", for console and status lines
  rowsKey: string; // the page's results field the feed replaces: "listings" / "exchanges"
  getPage(): P | null;
  showsWatchedSearch(page: P): boolean; // the page's last search is the one being watched
  refetch(page: P): void; // search again on the same results page, like a Search click
  // Edits the user hasn't searched (compared against the form captured at the last search): a retry
  // would silently submit them
  hasUnsearchedEdits(page: P, searchedForm: string | null): boolean;
  status(text: string, tone: StatusTone): void;
  onStartFeed?(page: P | null): void;
}

interface Attached<P> {
  page: P;
  unwatch: Unwatch[];
  stuckTimer?: ReturnType<typeof setTimeout>;
  retried: boolean;
  recovering: boolean; // inside recover()'s own refetch: its find hook must not hand back the retry budget
  loadingSince: number;
}

export const createFeedTracker = <P extends FeedPage, R extends { _id: string }>(config: FeedTrackerConfig<P>) => {
  const { signal, what, rowsKey } = config;
  let attached: Attached<P> | null = null;
  let searchedForm: string | null = null; // the page's form at its last search
  let lastCall = 0;
  const calls = new WeakMap<object, number>();
  let feed: R[] | null = null; // shown instead of the search results once the livesearch has its baseline, newest first
  const gone = new Set<string>(); // feed listings the market no longer returns

  // Replaces the page's results with the feed. Only while the page shows the watched search; after any
  // search of it (a repeat, recovery) the loading watcher puts the feed back.
  // At most one page's worth of `total`: above that the site shows pagination, which loads real results.
  const showFeed = () => {
    if (!feed || signal.aborted) return;
    const page = sync();
    if (!page || page.loading || !config.showsWatchedSearch(page)) return;

    (page as Record<string, unknown>)[rowsKey] = [...feed];
    page.total = Math.min(feed.length, PAGE_SIZE);
  };

  const armWatchdog = (entry: Attached<P>) => {
    clearTimeout(entry.stuckTimer);
    entry.stuckTimer = setTimeout(() => recover(entry, null), STUCK_MS);
  };

  // The page's fetch has no .catch: after a failed request `loading` stays true forever.
  // Search again once, on the same results page, like a Search click; else show the previous results.
  const recover = (entry: Attached<P>, error: unknown) => {
    const { page } = entry;
    if (attached !== entry || page.$.isUnmounted || !page.loading) return;
    clearTimeout(entry.stuckTimer);

    const reason = error === null ? `no answer after ${STUCK_MS / 1000}s` : errorMessage(error);
    const retry =
      !entry.retried &&
      !isRateLimitError(error) &&
      getSocket()?.connected !== false &&
      !config.hasUnsearchedEdits(page, searchedForm);

    if (retry) {
      entry.retried = true;
      console.warn(LOG, `The ${what} page's search failed (${reason}); searching again.`);
      config.status(`The page's search failed (${reason}): searching again`, "warn");
      entry.recovering = true;
      try {
        config.refetch(page);
      } catch (fetchError) {
        console.warn(LOG, `Retrying the ${what} page's search failed.`, fetchError);
      } finally {
        entry.recovering = false;
      }
      armWatchdog(entry); // loading stays true: no watcher call
      return;
    }
    console.warn(LOG, `The ${what} page's search failed (${reason}); showing the previous results.`);
    config.status(`The page's search failed (${reason}): showing the previous results`, "warn");
    page.loading = false;
  };

  const detach = () => {
    if (!attached) return;
    clearTimeout(attached.stuckTimer);
    attached.unwatch.forEach((stop) => stop());
    attached = null;
  };

  const sync = (): P | null => {
    const page = config.getPage();
    if (attached?.page === page) return page;

    detach();
    if (!page) return null;

    const entry: Attached<P> = { page, unwatch: [], retried: false, recovering: false, loadingSince: 0 };
    attached = entry;
    entry.unwatch.push(
      watchState(
        page,
        "loading",
        (loading) => {
          clearTimeout(entry.stuckTimer);
          if (loading) {
            entry.loadingSince = Date.now();
            armWatchdog(entry);
          } else {
            entry.loadingSince = 0;
            entry.retried = false;
            showFeed();
          }
        },
        { immediate: true }
      ),
      // After the render: the empty-state text and the cards exist by then
      watchState(
        page,
        rowsKey,
        () => {
          if (!feed) return;
          if (feed.length === 0) relabelEmptyResults(page);
          markGoneCards(page, gone);
        },
        { flush: "post" }
      )
    );
    return page;
  };

  return {
    sync,

    // A search the page sent (seen by the before-find hook), with its form as one comparable string
    pageSearched: (call: object, formSignature: string | null) => {
      calls.set(call, ++lastCall);
      searchedForm = formSignature;
      // A fresh request while an older one hangs (`loading` never flipped): the watchdog and the one-retry
      // budget belong to this request now — except during recover()'s own refetch, which keeps its budget
      const entry = attached;
      if (entry && !entry.recovering && entry.page.loading) {
        entry.retried = false;
        entry.loadingSince = Date.now();
        armWatchdog(entry);
      }
    },

    // The page's own search failed (error hook): recover now instead of waiting for the watchdog
    pageSearchFailed: (call: object, error: unknown) => {
      const seq = calls.get(call);
      if (seq !== undefined && seq < lastCall) return; // an older request: a newer search is still running
      sync();
      if (attached) recover(attached, error);
    },

    // The livesearch has its baseline: clear the results; from now on only listings it finds are shown
    startFeed: () => {
      feed = [];
      gone.clear();
      config.onStartFeed?.(sync());
      showFeed();
    },

    // Newest first; a listing saved again (price change, bump) moves to the top with its new data
    addToFeed: (listings: R[]) => {
      if (!feed || listings.length === 0) return;
      const ids = new Set(listings.map((listing) => listing._id));
      ids.forEach((id) => gone.delete(id)); // saved again: back on the market
      feed = [...listings, ...feed.filter((listing) => !ids.has(listing._id))].slice(0, FEED_MAX);
      showFeed();
    },

    // Feed listings still believed to be on the market, for the gone check
    liveFeedIds: (): string[] => (feed ?? []).map((listing) => listing._id).filter((id) => !gone.has(id)),

    // These feed listings are no longer returned by the market: sold/taken (offer accepted) or removed
    markGone: (ids: string[]) => {
      ids.forEach((id) => gone.add(id));
      const page = sync();
      if (page) markGoneCards(page, gone);
    },

    release: () => {
      feed = null; // Stop: the feed stays on screen until the next search
      // On Stop, don't leave a spinner that the watchdog would have cleared
      const entry = attached;
      if (entry && entry.page.loading && entry.loadingSince > 0 && Date.now() - entry.loadingSince > STUCK_MS) {
        entry.page.loading = false;
      }
      detach();
    },
  };
};
