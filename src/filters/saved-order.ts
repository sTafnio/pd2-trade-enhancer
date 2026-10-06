// The order of the saved filters. Each one has an `order` key, a string over the characters '0'..'z', and
// the server lists them sorted by it. The site makes keys between two neighbours when a filter is dragged on
// /market/filters, and puts a new filter before the first one. Its midpoint function can return a key below
// the lower neighbour (between "VNU" and "WLV79" it gives "VM"), so the keys here come from a correct one;
// any key string works with the site's page.
import { errorCode, isRateLimitError, sleep } from "../utils";
import { fetchAllSavedFilters, requireFilterService } from "./site";
import type { FilterService, SavedFilter } from "./site";

const LOG = "[pd2-trade-enhancer]";
const ZERO = 48; // "0", the lowest digit
const DIGITS = 75; // "0".."z"
const PATCH_GAP_MS = 200;
const RATE_LIMIT_WAIT_MS = 30_000;
const MAX_ATTEMPTS = 3;

const digit = (value: number) => String.fromCharCode(ZERO + value);

// Keys as fractions: a missing digit of the lower key counts as "0". `high` null: no upper bound. Keys it
// makes never end in "0", which keeps room below every one of them
const midpoint = (low: string, high: string | null): string | null => {
  if (high === "") return null;
  if (high !== null) {
    let common = 0;
    while (common < high.length && (low.charCodeAt(common) || ZERO) === high.charCodeAt(common)) common++;
    if (common > 0) {
      const rest = midpoint(low.slice(common), high.slice(common));
      return rest === null ? null : high.slice(0, common) + rest;
    }
  }
  const a = low === "" ? 0 : low.charCodeAt(0) - ZERO;
  const b = high === null ? DIGITS : high.charCodeAt(0) - ZERO;
  if (b - a > 1) return digit(Math.round((a + b) / 2));
  if (high !== null && high.length > 1) return high.slice(0, 1);
  const rest = midpoint(low.slice(1), null);
  return rest === null ? null : digit(a) + rest;
};

// The site's drag and drop computes keys below "z" (its ceiling when a filter goes last), so ours stay below it too
const CEILING = "z";

// A key after `before` and before `after` (either may be missing). null: none fits
const keyBetween = (before = "", after = CEILING): string | null => {
  if (before >= after) return null;
  const key = midpoint(before, after);
  return key !== null && key > before && key < after ? key : null;
};

// `count` rising keys between two keys, spread by halving so they stay short
const keysBetween = (before: string | undefined, after: string | undefined, count: number): string[] | null => {
  if (count <= 0) return [];
  const middle = keyBetween(before, after);
  if (middle === null) return null;
  const leftCount = Math.floor((count - 1) / 2);
  const left = keysBetween(before, middle, leftCount);
  const right = keysBetween(middle, after, count - 1 - leftCount);
  return left && right ? [...left, middle, ...right] : null;
};

const isKey = (key: unknown): key is string =>
  typeof key === "string" && key !== "" && key < CEILING && [...key].every((char) => char >= "0" && char <= "z");

// Punctuation counts, so names starting with ", " or ". " still come first; "Filter 10" after "Filter 9"
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const compareNames = (a: Pick<SavedFilter, "_id" | "name">, b: Pick<SavedFilter, "_id" | "name">) =>
  collator.compare(a.name.trim(), b.name.trim()) || (a._id < b._id ? -1 : a._id > b._id ? 1 : 0);

// The longest run of keys, in list order, that already rise: those filters can keep theirs
const risingKeys = (keys: (string | undefined)[]): Set<number> => {
  const length = keys.map(() => 0);
  const previous = keys.map(() => -1);
  let best = -1;
  keys.forEach((key, i) => {
    if (!isKey(key)) return;
    length[i] = 1;
    for (let j = 0; j < i; j++) {
      const other = keys[j];
      if (isKey(other) && other < key && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1;
        previous[i] = j;
      }
    }
    if (best < 0 || length[i] > length[best]) best = i;
  });
  const kept = new Set<number>();
  for (let i = best; i >= 0; i = previous[i]) kept.add(i);
  return kept;
};

// Keys for the filters between the kept ones. null: some gap has no room
const fillGaps = (keys: (string | undefined)[], kept: Set<number>): string[] | null => {
  const out: string[] = [];
  let waiting: number[] = [];
  let before: string | undefined;
  const flush = (after: string | undefined) => {
    const made = keysBetween(before, after, waiting.length);
    if (!made) return false;
    waiting.forEach((index, n) => (out[index] = made[n]));
    waiting = [];
    return true;
  };
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!kept.has(i) || !isKey(key)) {
      waiting.push(i);
      continue;
    }
    if (!flush(key)) return null;
    out[i] = key;
    before = key;
  }
  return flush(undefined) ? out : null;
};

export interface OrderPatch {
  id: string;
  order: string;
}

// The key changes that list the filters by name. Filters whose keys already rise in name order keep them and
// the others get keys between; when most would move anyway (or a gap has no room) every filter gets a fresh
// short key. Empty: already in name order
export const planSort = (filters: SavedFilter[]): OrderPatch[] => {
  const target = [...filters].sort(compareNames);
  const keys = target.map((filter) => filter.order);
  const kept = risingKeys(keys);
  const fresh =
    (kept.size * 2 >= target.length ? fillGaps(keys, kept) : null) ?? keysBetween(undefined, undefined, target.length);
  if (!fresh) throw new Error("no order keys left"); // fresh keys from an empty range always fit
  return target.flatMap((filter, index) => (fresh[index] === filter.order ? [] : [{ id: filter._id, order: fresh[index] }]));
};

// The key for a new filter called `name`: its place in name order when `sorted`, else first, like the site's
// own Save. undefined: no room, and the server lists it first
export const keyForNew = (filters: SavedFilter[], name: string, sorted: boolean): string | undefined => {
  if (!sorted) return keyBetween(undefined, filters.find((filter) => isKey(filter.order))?.order) ?? undefined;
  const probe = { _id: "~", name }; // after any existing filter of the same name
  const index = filters.findIndex((filter) => compareNames(probe, filter) < 0);
  const before = index < 0 ? filters[filters.length - 1] : filters[index - 1];
  const after = index < 0 ? undefined : filters[index];
  return keyBetween(before?.order, after?.order) ?? undefined;
};

// Patching a key again is harmless, so a rate limit or a timeout is retried
const retryable = (error: unknown) => isRateLimitError(error) || errorCode(error) === 408;

const patchOrder = async (service: FilterService, patch: OrderPatch, signal: AbortSignal) => {
  for (let attempt = 1; ; attempt++) {
    try {
      await service.patch(patch.id, { order: patch.order });
      return;
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || signal.aborted || !retryable(error)) throw error;
      if (isRateLimitError(error)) {
        console.warn(LOG, `Rate limited while sorting the saved filters; waiting ${RATE_LIMIT_WAIT_MS / 1000}s.`);
        await sleep(RATE_LIMIT_WAIT_MS, signal); // resolves early on abort: no retry goes out after it
        if (signal.aborted) throw new Error("stopped while waiting out a rate limit: you left the page");
      }
    }
  }
};

export interface SortResult {
  moved: number;
  total: number;
}

const pagePath = () => window.location.pathname.replace(/\/+$/, "");

let running: { promise: Promise<SortResult>; controller: AbortController; path: string } | null = null;

// Puts every saved filter in name order on the server, with as few writes as it takes, one at a time. A call
// while a sort runs on the same page gets that one; a sort started on another page has just been aborted by
// stopFilterSortOffPage (same MutationObserver tick), so the caller gets a fresh run, not the doomed promise
export const sortSavedFilters = (onProgress?: (done: number, total: number) => void): Promise<SortResult> => {
  if (running && running.path === pagePath() && !running.controller.signal.aborted) return running.promise;
  const previous = running?.promise;
  const controller = new AbortController();
  const promise = (async () => {
    if (previous) await previous.catch(() => {}); // let the aborted run finish its current write first
    if (controller.signal.aborted) throw new Error("stopped: you left the page");
    const service = requireFilterService();
    const filters = await fetchAllSavedFilters(service);
    const patches = planSort(filters);
    for (const [index, patch] of patches.entries()) {
      if (controller.signal.aborted) throw new Error(`stopped after ${index} of ${patches.length}: you left the page`);
      await patchOrder(service, patch, controller.signal);
      onProgress?.(index + 1, patches.length);
      if (index < patches.length - 1) await sleep(PATCH_GAP_MS, controller.signal);
    }
    return { moved: patches.length, total: filters.length };
  })().finally(() => {
    if (running?.controller === controller) running = null;
  });
  running = { promise, controller, path: pagePath() };
  return promise;
};

// Like every longer job: a sort stops (after the current write) when the user leaves the page it started on
export const stopFilterSortOffPage = () => {
  if (running && pagePath() !== running.path) running.controller.abort();
};
