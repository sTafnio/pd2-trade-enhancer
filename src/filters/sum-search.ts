// Market searches with sums (sums.ts). Before the page's search goes out, every listing it matches that could
// reach the sums is fetched, ids and mods only: the search plus, per sum, "one term worth at least min / k",
// which is as far as the server can go. The sums are added up here (with "Ignore socketed jewels/runes" on the
// item's own stats, its other mod conditions re-checked as socketed-search.ts does), and the search goes out
// with `_id: {$in: [the ones that reach them]}`, so the server still pages, sorts and counts. Sorted by sum,
// the page's search is answered here instead: that page's listings, fetched by id with the page's own
// $resolve, in sum order. One scan per new search (250 listings a request, a few at a time); page changes
// reuse it.
import { MAX_PAGE_LIMIT, findOnce } from "../livesearch/poll";
import { getListingService, isMarketSearchQuery, isObject } from "../pd2/vue-bridge";
import type { FindResult, ListingService, PageAnswer, Query } from "../pd2/vue-bridge";
import { errorMessage, stableStringify } from "../utils";
import { withOrDimensions } from "./model";
import { isOwnSearch, ownCheckFields, ownStillMatches, selectPaths } from "./socketed";
import type { SocketItem } from "./socketed";
import { SUM_SORT_FIELD, itemSums, reachesAll, sumCandidates, sumsOf } from "./sums";
import type { SumSpec } from "./sums";

const LOG = "[pd2-trade-enhancer]";

// Fired on document after each new scan, with a SumsCheck as its detail
export const SUMS_CHECK_EVENT = "pd2te:sums-check";

export interface SumsCheck {
  candidates: number; // listings that could reach the sums: added up here
  matched: number; // the ones that reach every sum
  error?: string; // the scan failed: the search showed nothing
}

interface Ranked {
  id: string;
  sum: number; // the first sum's total: what "Sort by sum" orders by
  bumped: string; // ties: the most recently bumped first
}

interface Scan {
  ranked: Ranked[]; // highest first
  candidates: number;
}

const PER_REQUEST = new Set(["$skip", "$limit", "$sort", "$select", "$resolve"]);
const REUSE_MS = 2 * 60_000; // page changes within this reuse the last scan
// A new scan's first request is slow (the server counts every match for `total`)
const SCAN_TIMEOUT_MS = 15_000;
const PAGE_TIMEOUT_MS = 8_000;
const MAX_CANDIDATES = 3000; // 12 requests: every listing with any resistance of 20 or more is about 2,100
const PARALLEL = 3; // requests at a time after the first one, which tells how many there are

let last: { key: string; at: number; result: Promise<Scan> } | null = null;

// Aborts the task after `ms`
const timed = <T>(ms: number, task: (signal: AbortSignal) => Promise<T>): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return task(controller.signal).finally(() => clearTimeout(timer));
};

const requireService = (): ListingService => {
  const service = getListingService();
  if (!service) throw new Error("the site's listing service wasn't found");
  return service;
};

// The search narrowed down to listings that could reach every sum. Too many OR combinations with the
// search's own $or: the whole search, which the candidate limit then has to allow
const candidatesQuery = (search: Query, sums: SumSpec[]): Query => {
  const dimensions = sums.map(sumCandidates).filter((branches): branches is Query[] => branches !== null);
  return withOrDimensions(search, dimensions) ?? search;
};

const scan = async (search: Query, sums: SumSpec[], signal: AbortSignal): Promise<Scan> => {
  const service = requireService();
  const own = isOwnSearch(search);
  const query = candidatesQuery(search, sums);
  const select = selectPaths(["_id", "bumped_at", "item.modifiers", ...(own ? ownCheckFields(search) : [])]);
  const page = async (skip: number): Promise<FindResult<unknown>> => {
    const outcome = await findOnce(service, { ...query, $select: select, $sort: { _id: 1 }, $skip: skip, $limit: MAX_PAGE_LIMIT }, signal);
    if (!outcome.ok) throw outcome.aborted ? new Error(`no answer after ${SCAN_TIMEOUT_MS / 1000} s`) : outcome.error;
    return outcome.result;
  };

  const first = await page(0);
  const total = first.total ?? 0;
  if (total > MAX_CANDIDATES) {
    throw new Error(`${total} listings could reach the sum, more than ${MAX_CANDIDATES}: narrow the search (type, rarity, price)`);
  }
  const rows: unknown[] = [...(first.data ?? [])];
  const skips: number[] = [];
  for (let skip = MAX_PAGE_LIMIT; skip < total; skip += MAX_PAGE_LIMIT) skips.push(skip);
  for (let i = 0; i < skips.length; i += PARALLEL) {
    const pages = await Promise.all(skips.slice(i, i + PARALLEL).map(page));
    pages.forEach((result) => rows.push(...(result.data ?? [])));
  }

  const seen = new Set<string>(); // a listing saved during the scan can show up on two pages
  const ranked: Ranked[] = [];
  rows.forEach((row) => {
    if (!isObject(row) || typeof row._id !== "string" || seen.has(row._id) || !isObject(row.item)) return;
    seen.add(row._id);
    const results = itemSums(row.item as SocketItem, sums, own);
    if (!reachesAll(sums, results) || (own && !ownStillMatches(row, search))) return;
    ranked.push({ id: row._id, sum: results[0].total, bumped: typeof row.bumped_at === "string" ? row.bumped_at : "" });
  });
  ranked.sort((a, b) => b.sum - a.sum || (a.bumped < b.bumped ? 1 : a.bumped > b.bumped ? -1 : 0));
  return { ranked, candidates: seen.size };
};

// Only these listings. A custom query's own _id condition stays: the ids are narrowed by it
const onlyIds = (query: Query, ids: string[]) => {
  const current = query._id;
  if (current === undefined) query._id = { $in: ids };
  else if (typeof current === "string") query._id = { $in: ids.includes(current) ? [current] : [] };
  else if (isObject(current) && !Array.isArray(current) && Object.keys(current).every((key) => key.startsWith("$"))) {
    const within = Array.isArray(current.$in) ? ids.filter((id) => (current.$in as unknown[]).includes(id)) : ids;
    query._id = { ...current, $in: within };
  } else query._id = { $in: [] };
};

// null: not sorted by sum. 1: lowest first
const sumDirection = (query: Query): 1 | -1 | null => {
  const sort = query.$sort;
  if (!isObject(sort) || !(SUM_SORT_FIELD in sort)) return null;
  return Number(sort[SUM_SORT_FIELD]) === 1 ? 1 : -1;
};

// One results page in sum order: the listings on it, fetched as the page would. null: that fetch failed
const sortedPage = async (query: Query, search: Query, scanned: Scan, direction: 1 | -1): Promise<PageAnswer | null> => {
  const skip = Math.max(0, Number(query.$skip) || 0);
  const limit = Math.max(1, Number(query.$limit) || 10);
  const order =
    direction === -1
      ? scanned.ranked
      : [...scanned.ranked].sort((a, b) => a.sum - b.sum || (a.bumped < b.bumped ? 1 : a.bumped > b.bumped ? -1 : 0));
  const ids = order.slice(skip, skip + limit).map((entry) => entry.id);
  const total = scanned.ranked.length;
  if (ids.length === 0) return { result: { total, limit, skip, data: [] } };

  const pageQuery: Query = { ...search, _id: { $in: ids }, $limit: ids.length };
  if (query.$resolve !== undefined) pageQuery.$resolve = query.$resolve;
  if (query.$select !== undefined) pageQuery.$select = query.$select;
  const outcome = await timed(PAGE_TIMEOUT_MS, (signal) => findOnce(requireService(), pageQuery, signal));
  if (!outcome.ok) {
    console.warn(LOG, `Couldn't load this page in sum order (${errorMessage(outcome.error)}); showing it in the server's order.`);
    return null;
  }
  const byId = new Map((outcome.result.data ?? []).map((row) => [row._id, row]));
  const data = ids.map((id) => byId.get(id)).filter((row) => row !== undefined);
  return { result: { total, limit, skip, data } };
};

const report = (detail: SumsCheck) => document.dispatchEvent(new CustomEvent<SumsCheck>(SUMS_CHECK_EVENT, { detail }));

// The page's own market searches with sums; undefined for any other search, which goes on untouched
export const sumRewrite = (query: Query): Promise<PageAnswer | void> | undefined => {
  const sums = sumsOf(query);
  if (sums.length === 0 || !isMarketSearchQuery(query)) return undefined;
  const search = Object.fromEntries(Object.entries(query).filter(([key]) => !PER_REQUEST.has(key)));
  const key = stableStringify(search);
  const reused = last !== null && last.key === key && Date.now() - last.at < REUSE_MS;
  const current = reused && last ? last : { key, at: Date.now(), result: timed(SCAN_TIMEOUT_MS, (signal) => scan(search, sums, signal)) };
  last = current;
  return current.result.then(
    async (scanned): Promise<PageAnswer | void> => {
      if (!reused) report({ candidates: scanned.candidates, matched: scanned.ranked.length });
      const direction = sumDirection(query);
      const answer = direction === null ? null : await sortedPage(query, search, scanned, direction).catch(() => null);
      if (answer) return answer;
      onlyIds(query, scanned.ranked.map((entry) => entry.id));
    },
    (error: unknown) => {
      if (last === current) last = null; // the next search tries again
      console.warn(LOG, `Couldn't add up the sums (${errorMessage(error)}); the search shows nothing.`);
      if (!reused) report({ candidates: 0, matched: 0, error: errorMessage(error) });
      onlyIds(query, []); // the search without its sums would look like matches
    }
  );
};
