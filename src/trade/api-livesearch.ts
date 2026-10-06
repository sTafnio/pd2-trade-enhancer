// Livesearch over the site's own API on /market: the query for the user's search (built from the filter
// panel by the site's own helper, or captured from the page's search), watched by the shared poll loop
// (livesearch/poll.ts) for listings saved (updated_at: created, bumped or edited) after Start was pressed.
import { errorCode, errorMessage, stableStringify } from "../utils";
import {
  DEFAULT_RESOLVE,
  adoptForm,
  getListingService,
  getMarketFilters,
  getMarketPage,
  getQueryBuilder,
  isMarketSearchQuery,
  marketSearchQuery,
  onPageFind,
  snapshotForm,
} from "../pd2/vue-bridge";
import type { FormSnapshot, Listing, MarketPage, Query } from "../pd2/vue-bridge";
import {
  CAPTURE_ATTEMPTS,
  CAPTURE_TIMEOUT_MS,
  MAX_PAGE_LIMIT,
  createPollLoop,
  isListing,
  searchBaseOf,
  timeOf,
} from "../livesearch/poll";
import type { FindFn, FindOutcome, PollLoop, WatchedSearch } from "../livesearch/poll";
import { PAGE_SIZE, createFeedTracker } from "../livesearch/feed-tracker";
import { isOwnSearch, modNamesIn, ownCheckFields, ownStillMatches, selectPaths } from "../filters/socketed";
import type { SocketItem } from "../filters/socketed";
import { formatAmount, itemSums, reachesAll, sumsOf } from "../filters/sums";
import type { SumSpec } from "../filters/sums";
import { clearRecentHits, setStatus } from "./livesearch-ui";
import { listingPath } from "./hits";
import type { Hit } from "./hits";

const LOG = "[pd2-trade-enhancer]";

// Fired on document whenever the watched search changes or the run ends
export const LIVESEARCH_CHANGED_EVENT = "pd2te:livesearch-changed";

let watchedFilters: Record<string, unknown> | null = null;

// The filter form of the search the running livesearch watches; null when not running or captured
// without a form
export const getWatchedFilters = () => watchedFilters;

const setWatched = (filters: Record<string, unknown> | null) => {
  watchedFilters = filters;
  document.dispatchEvent(new Event(LIVESEARCH_CHANGED_EVENT));
};

// Most to least trimmed. The last one is the page's own response shape, used only if the server
// rejects the others
const RESPONSE_SHAPES: { select: string[] | null; resolve: boolean }[] = [
  { select: ["_id", "updated_at", "user_id", "price", "hr_price", "item.name"], resolve: false },
  { select: ["_id", "updated_at", "user_id", "price", "hr_price", "item"], resolve: false },
  { select: null, resolve: true },
];

// fetch() adds this whenever it sorts by price: part of the sort, not of the user's filters
const PRICE_SORT_FILTER = stableStringify({ $gt: 0 });

interface WatchedMarketSearch extends WatchedSearch {
  form: FormSnapshot | null; // filter form state, for the filter column's "watched by livesearch" note
  // The search ignores socketed items and has mod values: new listings are re-checked on the item's own stats
  // (the server matches the merged ones), see filters/socketed.ts
  ownStats: boolean;
  sums: SumSpec[]; // new listings are added up here (the server can't, see filters/sums.ts)
}

// The search ignores socketed items and some condition reads mod values
const readsOwnStats = (base: Query) => isOwnSearch(base) && modNamesIn(base)?.length !== 0;

// Errors a fuller query could fix (bad $select), as opposed to timeouts, auth or rate limits
const isQueryShapeError = (error: unknown) => [400, 500].includes(errorCode(error));

const toHit = (listing: Listing): Hit => ({
  id: listing._id,
  name: listing.item?.name?.trim() || listing.item?.base?.name?.trim() || "Unnamed item",
  price: `${listing.hr_price ? `${listing.hr_price} HR ` : ""}${listing.price ?? ""}`.trim() || undefined,
  savedAt: timeOf(listing) || undefined,
});

// The user's search: the page's query minus per-request keys and the price sort's own filter
const marketSearchBase = (query: Query): Query =>
  searchBaseOf(query, (base) => {
    const sort = base.$sort;
    const sortsByPrice = typeof sort === "object" && sort !== null && "hr_price" in sort;
    if (sortsByPrice && stableStringify(base.hr_price) === PRICE_SORT_FILTER) delete base.hr_price;
  });

// Newest saves first; _id breaks updated_at ties (bulk bumps save many listings in one go), so paging is stable
const buildQuery = (search: WatchedMarketSearch, since: number, skip: number, limit: number, shapeIndex: number) => {
  const shape = RESPONSE_SHAPES[shapeIndex];
  const query: Query = {
    ...search.base,
    updated_at: { $gt: new Date(since).toISOString() },
    $sort: { updated_at: -1, _id: -1 },
    $skip: skip,
    $limit: limit,
  };
  if (shape.select) {
    const own = search.ownStats || (search.sums.length > 0 && isOwnSearch(search.base)) ? ownCheckFields(search.base) : [];
    const mods = search.sums.length > 0 ? ["item.modifiers"] : [];
    query.$select = own.length + mods.length > 0 ? selectPaths([...shape.select, ...mods, ...own]) : shape.select;
  }
  if (shape.resolve) query.$resolve = search.resolve ?? DEFAULT_RESOLVE;
  return query;
};

// A new listing an own-stats search still wants; the others are logged, never alerted
const passesOwnStats = (search: WatchedMarketSearch, listing: Listing): boolean => {
  if (!search.ownStats || ownStillMatches(listing as unknown as Record<string, unknown>, search.base)) return true;
  console.info(
    LOG,
    `Livesearch left out ${toHit(listing).name} (${location.origin}${listingPath(listing._id)}): it meets the search only with its socketed items' stats.`
  );
  return false;
};

// A new listing that reaches the search's sums; the others are logged, never alerted
const passesSums = (search: WatchedMarketSearch, listing: Listing): boolean => {
  if (search.sums.length === 0 || !listing.item) return true;
  const results = itemSums(listing.item as SocketItem, search.sums, isOwnSearch(search.base));
  if (reachesAll(search.sums, results)) return true;
  const totals = results.map((result) => formatAmount(result.total)).join(", ");
  console.info(
    LOG,
    `Livesearch left out ${toHit(listing).name} (${location.origin}${listingPath(listing._id)}): its sum comes to ${totals}.`
  );
  return false;
};

const formSignatureOf = (form: FormSnapshot | null) => (form ? stableStringify(form) : null);

let activePageSync: (() => void) | null = null;

// tradeOnLoad calls this on every /market mount; a running livesearch re-attaches if the page remounted
export const onApiMarketPageMounted = () => activePageSync?.();

export const runApiLivesearch = async (signal: AbortSignal): Promise<"stopped" | "unavailable"> => {
  const service = getListingService();
  if (!service) return "unavailable";

  let pageSignature: string | null = null; // the search the visible page ran last
  let shapeIndex = 0;
  let shapeConfirmed = false;

  let loop!: PollLoop<WatchedMarketSearch>; // assigned right below; the closures only run afterwards
  const tracker = createFeedTracker<MarketPage, Listing>({
    signal,
    what: "market",
    rowsKey: "listings",
    getPage: () => getMarketPage(),
    showsWatchedSearch: () => {
      const current = loop.currentSearch();
      return !loop.hasPending() && current !== null && pageSignature === current.signature;
    },
    refetch: (page) => {
      const pageNo = Number(page.page) || 1;
      // The explicit 10/skip args are overridden by the paging wrapper while it's installed
      page.fetch(pageNo, PAGE_SIZE, (pageNo - 1) * PAGE_SIZE);
    },
    hasUnsearchedEdits: (page, searchedForm) => {
      // After search(), page.filters IS the form's object: fetch() would submit edits the user hasn't searched
      const filters = getMarketFilters(page);
      if (!filters) return false; // no form: fetch() repeats the last search
      const now = formSignatureOf(snapshotForm(filters));
      return now === null || now !== searchedForm;
    },
    status: setStatus,
    onStartFeed: (page) => {
      clearRecentHits();
      // Started from the filter panel before any search: the page shows "Search to see results" until this is off
      if (page?.noFilters) page.noFilters = false;
    },
  });

  // One page of saves, stepping down to a fuller response shape when the server rejects a trimmed one
  const findPage = async (
    find: FindFn,
    search: WatchedMarketSearch,
    since: number,
    skip: number,
    limit: number
  ): Promise<FindOutcome> => {
    for (;;) {
      const outcome = await find(buildQuery(search, since, skip, limit, shapeIndex));

      if (outcome.ok) {
        const rows = outcome.result.data ?? [];
        if (shapeIndex === 0 && rows.some((row) => isListing(row) && !row.item)) {
          shapeIndex = 1; // the nested item.name projection was ignored
          console.warn(LOG, "The trimmed $select returned no item names; selecting whole items instead.");
          continue;
        }
        shapeConfirmed = true;
        return outcome;
      }

      const canStepDown = !shapeConfirmed && shapeIndex < RESPONSE_SHAPES.length - 1;
      if (outcome.aborted || !canStepDown || !isQueryShapeError(outcome.error)) return outcome;

      shapeIndex++;
      console.warn(LOG, `The site rejected the trimmed query (${errorMessage(outcome.error)}); retrying with a fuller one.`);
    }
  };

  // Full listings (item, seller) for the feed's cards, with the page's own $resolve. The watched search plus
  // the ids, so the server treats it as a market search. Only the requested ids, in the hits' own order,
  // so the feed always shows exactly the listings that alerted
  const feedRows = async (find: FindFn, search: WatchedMarketSearch, hits: Listing[]): Promise<Listing[]> => {
    const byId = new Map<string, Listing>();
    for (let i = 0; i < hits.length; i += MAX_PAGE_LIMIT) {
      const ids = hits.slice(i, i + MAX_PAGE_LIMIT).map((hit) => hit._id);
      const wanted = new Set(ids);
      const query = {
        ...search.base,
        _id: { $in: ids },
        $resolve: search.resolve ?? DEFAULT_RESOLVE,
        $limit: ids.length,
      };
      const outcome = await find(query);
      if (!outcome.ok) {
        if (!outcome.aborted) console.warn(LOG, `Could not load the new listings for the feed: ${errorMessage(outcome.error)}`);
        break;
      }

      const rows = (outcome.result.data ?? []).filter(isListing);
      const unasked = rows.filter((row) => !wanted.has(row._id)).length;
      if (unasked > 0) {
        console.warn(LOG, `Asked the site for ${ids.length} listings by id and got ${unasked} others; leaving those out of the feed.`);
      }
      rows.forEach((row) => {
        if (wanted.has(row._id)) byId.set(row._id, row);
      });
    }

    const full = hits.map((hit) => byId.get(hit._id)).filter((row): row is Listing => row !== undefined);
    if (full.length < hits.length) {
      console.warn(LOG, `${hits.length - full.length} of ${hits.length} new listings could not be loaded for the feed (see Recent Hits).`);
    }
    return full;
  };

  loop = createPollLoop<WatchedMarketSearch, Listing>({
    signal,
    service,
    tracker,
    label: "Livesearch",
    goneType: "item",
    recentHits: true,
    status: setStatus,
    findPage,
    toHit,
    keep: (search, listing) => passesOwnStats(search, listing) && passesSums(search, listing),
    feedRows,
  });

  // A search the page ran, or at Start the one the filter panel shows
  const watchSearch = (query: Query, call: object, form: FormSnapshot | null) => {
    tracker.pageSearched(call, formSignatureOf(form));

    const base = marketSearchBase(query);
    const signature = stableStringify(base);
    pageSignature = signature;
    const outcome = loop.propose({ base, resolve: query.$resolve, signature, form, ownStats: readsOwnStats(base), sums: sumsOf(base) });
    if (outcome === "reverted") setWatched(loop.currentSearch()?.form?.filters ?? null);
    else if (outcome === "queued") setWatched(form?.filters ?? null);
  };

  // --- The page's own searches (Search clicks, saved filters, our retries) ---
  const onFind = (query: Query, call: object) => {
    // Only PageGameMarket.fetch: it sets `loading` before its find, and the hooks run after that.
    // DashboardFilters (/dashboard) sends the same query shape.
    const page = getMarketPage();
    if (!page || page.loading !== true || !isMarketSearchQuery(query)) return;

    const filters = getMarketFilters(page);
    watchSearch(query, call, filters ? snapshotForm(filters) : null);
  };

  const onFindFailed = (query: Query, call: object, error: unknown) => {
    const page = getMarketPage();
    if (!page || page.loading !== true || !isMarketSearchQuery(query)) return;
    tracker.pageSearchFailed(call, error);
  };

  // Start: the query for what the filter panel shows, from the site's own helper, as if the page had just
  // searched it (the feed replaces the results anyway, so no search has to have run)
  const startFromPanel = async (): Promise<boolean> => {
    const build = await getQueryBuilder();
    const page = getMarketPage();
    const filters = getMarketFilters(page);
    if (!build || !page || !filters || signal.aborted) return false;
    const form = snapshotForm(filters);
    if (!form) return false;

    watchSearch(marketSearchQuery(build, form.filters), {}, form);
    adoptForm(page, filters); // refresh on hit then reloads this search
    return true;
  };

  // Start without the helper: run the page's own search once, so the page shows results and the hook
  // captures the query
  const captureSearch = async (): Promise<boolean> => {
    let attempt = 0;
    while (attempt < CAPTURE_ATTEMPTS && !signal.aborted) {
      // Still disconnected: the page's search would be held in socket.io's buffer too
      if (!(await loop.waitForConnection())) continue;
      attempt++;

      const filters = getMarketFilters();
      if (!filters) return false;

      setStatus("Searching...");
      try {
        filters.search(); // exactly what the Search button does
      } catch (error) {
        console.warn(LOG, "Calling the page's search() failed.", error);
        return false;
      }
      if (await loop.waitForSearch(CAPTURE_TIMEOUT_MS)) return true;
    }
    if (!signal.aborted) console.warn(LOG, "The page's search never reached the market/listing find hook.");
    return false;
  };

  const offFind = onPageFind({ found: onFind, failed: onFindFailed });
  if (!offFind) {
    tracker.release();
    loop.release();
    return "unavailable";
  }

  const pageSync = () => {
    tracker.sync();
  };

  try {
    activePageSync = pageSync;
    tracker.sync();
    if (!(await startFromPanel()) && !(await captureSearch())) return signal.aborted ? "stopped" : "unavailable";

    await loop.run();
    return "stopped";
  } finally {
    offFind();
    setWatched(null);
    if (activePageSync === pageSync) activePageSync = null;
    tracker.release();
    loop.release();
  }
};
