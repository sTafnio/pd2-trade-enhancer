// Market searches that ignore socketed items (see socketed.ts). Before the page's search goes out, the listings
// it would show where something socketed adds to a searched mod are fetched (their mods only; the whole market
// has a few hundred listings with anything socketed), re-checked on the item's own stats, and the ones that fall
// short are left out of the search by their item hash: the server casts _id for $in but not for $nin, and
// item.hash is a plain string every listing has. So the server still does the paging, the sort and the count.
// That's one extra request per new search, none when no mod value is searched; page changes reuse the answer.
import { MAX_PAGE_LIMIT, findOnce } from "../livesearch/poll";
import { getListingService, isMarketSearchQuery, isObject } from "../pd2/vue-bridge";
import type { Query } from "../pd2/vue-bridge";
import { errorMessage, stableStringify } from "../utils";
import { isOwnSearch, modNamesIn, ownCheckFields, ownStillMatches, selectPaths } from "./socketed";

const LOG = "[pd2-trade-enhancer]";

// Fired on document after each new check, with a SocketedCheck as its detail
export const SOCKETED_CHECK_EVENT = "pd2te:socketed-check";

export interface SocketedCheck {
  checked: number; // listings with socketed items the search was re-checked on
  excluded: number; // those that meet it only with their socketed items: left out
  error?: string; // the check failed: the search went out leaving none out
}

interface Short {
  hashes: string[];
  checked: number;
  excluded: number; // listings: an item listed twice has one hash
}

const HASH = "item.hash";
const PER_REQUEST = new Set(["$skip", "$limit", "$sort", "$select", "$resolve"]);
const REUSE_MS = 2 * 60_000; // page changes within this reuse the last check
const CHECK_TIMEOUT_MS = 8_000; // under the livesearch feed's 12 s watchdog for a stuck page search
const MAX_CANDIDATES = 1500; // about twice every listing with something socketed on the whole market

let last: { key: string; at: number; result: Promise<Short> } | null = null;

// The listings this search matches only thanks to what's socketed in them
const shortListings = async (search: Query, signal: AbortSignal): Promise<Short> => {
  const names = modNamesIn(search);
  if (names !== null && names.length === 0) return { hashes: [], checked: 0, excluded: 0 }; // no mod value is searched
  const service = getListingService();
  if (!service) throw new Error("the site's listing service wasn't found");

  // Only listings where a socketed item has one of the searched mods (or anything socketed, when a condition
  // names no mod)
  const candidates: Query = { ...search };
  if (names && !("item.socketed.modifiers.name" in candidates)) candidates["item.socketed.modifiers.name"] = { $in: names };
  else if (!("item.socketed.0" in candidates)) candidates["item.socketed.0"] = { $exists: true };
  const select = selectPaths(["_id", HASH, ...ownCheckFields(search)]);

  const hashes = new Set<string>();
  let checked = 0;
  let excluded = 0;
  for (let skip = 0; ; skip += MAX_PAGE_LIMIT) {
    const query = { ...candidates, $select: select, $sort: { _id: 1 }, $skip: skip, $limit: MAX_PAGE_LIMIT };
    const outcome = await findOnce(service, query, signal);
    if (!outcome.ok) throw outcome.aborted ? new Error(`no answer after ${CHECK_TIMEOUT_MS / 1000} s`) : outcome.error;
    const total = outcome.result.total ?? 0;
    if (total > MAX_CANDIDATES) throw new Error(`${total} listings with socketed items to re-check; narrow the search`);
    const rows: unknown[] = outcome.result.data ?? [];
    rows.forEach((row) => {
      if (!isObject(row)) return;
      checked++;
      const { item } = row;
      if (ownStillMatches(row, search) || !isObject(item) || typeof item.hash !== "string") return;
      hashes.add(item.hash);
      excluded++;
    });
    if (rows.length === 0 || skip + rows.length >= total) return { hashes: [...hashes], checked, excluded };
  }
};

const check = (search: Query): Promise<Short> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  return shortListings(search, controller.signal).finally(() => clearTimeout(timer));
};

// Adds the hashes to the query's item.hash condition. false: that condition pins one item already
const leaveOut = (query: Query, hashes: string[]): boolean => {
  const current = query[HASH];
  if (current === undefined) {
    query[HASH] = { $nin: hashes };
    return true;
  }
  if (!isObject(current) || Array.isArray(current) || !Object.keys(current).every((key) => key.startsWith("$"))) return false;
  const nin = current.$nin ?? [];
  if (!Array.isArray(nin)) return false;
  query[HASH] = { ...current, $nin: [...nin, ...hashes] };
  return true;
};

const report = (detail: SocketedCheck) => document.dispatchEvent(new CustomEvent<SocketedCheck>(SOCKETED_CHECK_EVENT, { detail }));

// The page's own market searches that carry the marker; undefined for anything else, which goes out untouched
export const socketedRewrite = (query: Query): Promise<void> | undefined => {
  if (!isOwnSearch(query) || !isMarketSearchQuery(query)) return undefined;
  const search = Object.fromEntries(Object.entries(query).filter(([key]) => !PER_REQUEST.has(key)));
  const key = stableStringify(search);
  const reused = last !== null && last.key === key && Date.now() - last.at < REUSE_MS;
  const current = reused && last ? last : { key, at: Date.now(), result: check(search) };
  last = current;
  return current.result.then(
    ({ hashes, checked, excluded }) => {
      if (hashes.length > 0 && !leaveOut(query, hashes)) {
        console.warn(LOG, "The search asks for one item hash already: listings that fall short without their socketed items stay in.");
      }
      if (!reused) report({ checked, excluded });
    },
    (error: unknown) => {
      if (last === current) last = null; // the next search tries again
      console.warn(LOG, `Couldn't re-check the listings with socketed items (${errorMessage(error)}); searching without leaving any out.`);
      if (!reused) report({ checked: 0, excluded: 0, error: errorMessage(error) });
    }
  );
};

