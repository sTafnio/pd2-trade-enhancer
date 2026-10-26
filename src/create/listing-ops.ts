// Creating, bumping, re-pricing and deleting the user's listings through the site's own API client. Every
// step is awaited, and anything the server may or may not have applied (a timeout) is checked by re-reading
// the user's listings instead of guessing or sending it again.
import { getListingCrud, getMyUserId } from "../pd2/create-bridge";
import type { ListingService, OwnListing, StashItem } from "../pd2/create-bridge";
import { getSocket } from "../pd2/vue-bridge";
import { errorCode, errorMessage, isRateLimitError, sleep } from "../utils";

const LOG = "[pd2-trade-enhancer]";

const REQUEST_TIMEOUT_MS = 15_000; // the site's client gives up at 10 s; the request may still be applied
const RECONNECT_WAIT_MS = 60_000;
const RATE_LIMIT_WAIT_MS = 30_000;
const MAX_SEND_ATTEMPTS = 3; // only for answers that guarantee nothing was applied
const VERIFY_DELAY_MS = 3_000; // let a late write land before checking what happened
export const LISTING_LIMIT = 50; // enforced by the server, which counts every listing on the account

// The server refuses a bumped_at patch within 12 hours of the last bump (since October 2026)
const BUMP_INTERVAL_MS = 12 * 60 * 60_000;
// What the server sets on a listing; a relist sends the rest back as it was
const SERVER_FIELDS = [
  "_id",
  "bumped_at",
  "created_at",
  "updated_at",
  "created_by_id",
  "updated_by_id",
  "user_last_online",
  "user_last_ingame",
  "user",
  "accepted_offer_id",
];

type FailureKind = "notFound" | "bumpLimit" | "rateLimited" | "rejected" | "timeout" | "unknown" | "offline";
type CallResult<T> = { ok: true; value: T } | { ok: false; kind: FailureKind; error: unknown };

// "skip": nothing changed. "stop": nothing changed (or it can't be told), and the batch should stop
export type Outcome = { ok: true; listing?: OwnListing } | { ok: false; severity: "skip" | "stop"; message: string };

// Only the text price is ever set; a listing's HR price is left as it is
export interface PriceText {
  text: string;
}

const classify = (error: unknown): FailureKind => {
  const code = errorCode(error);
  const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
  if (code === 404 || name === "NotFound") return "notFound";
  // Also a 429, but waiting a minute doesn't help
  if (code === 429 && /every 12 hours/i.test(errorMessage(error))) return "bumpLimit";
  if (isRateLimitError(error)) return "rateLimited";
  if (code === 408 || name === "Timeout") return "timeout";
  if (code >= 400 && code < 500) return "rejected"; // the server refused: nothing was applied
  return "unknown"; // 5xx or no code: it may or may not have been applied
};

// Nothing is sent while the socket is down: socket.io would queue it and send it at some later point
const waitForConnection = async (): Promise<boolean> => {
  const socket = getSocket();
  if (!socket || socket.connected !== false) return true;

  await new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timeoutId);
      socket.off("connect", done);
      resolve();
    };
    const timeoutId = setTimeout(done, RECONNECT_WAIT_MS);
    socket.on("connect", done);
  });
  return socket.connected !== false;
};

const callOnce = async <T>(send: () => Promise<T>): Promise<CallResult<T>> => {
  if (!(await waitForConnection())) return { ok: false, kind: "offline", error: new Error("not connected to the site") };

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: CallResult<T>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(result);
    };
    const timeoutId = setTimeout(() => {
      finish({ ok: false, kind: "timeout", error: new Error(`no answer after ${REQUEST_TIMEOUT_MS / 1000}s`) });
    }, REQUEST_TIMEOUT_MS);

    try {
      send().then(
        (value) => finish({ ok: true, value }),
        (error: unknown) => finish({ ok: false, kind: classify(error), error })
      );
    } catch (error) {
      finish({ ok: false, kind: classify(error), error });
    }
  });
};

// Retries only what surely wasn't applied: rate-limit refusals and not being connected
const call = async <T>(send: () => Promise<T>): Promise<CallResult<T>> => {
  for (let attempt = 1; ; attempt++) {
    const result = await callOnce(send);
    if (result.ok || attempt >= MAX_SEND_ATTEMPTS) return result;
    if (result.kind === "rateLimited") {
      console.warn(LOG, `Rate limited by the site; waiting ${RATE_LIMIT_WAIT_MS / 1000}s before trying again.`);
      await sleep(RATE_LIMIT_WAIT_MS);
    } else if (result.kind !== "offline") {
      return result;
    }
  }
};

const serviceOrThrow = (): ListingService => {
  const service = getListingCrud();
  if (!service) throw new Error("the site's market/listing service was not found");
  return service;
};

// --- Descriptions for status lines ---
export const itemName = (item: StashItem | null | undefined) =>
  item?.name?.trim() || item?.base?.name?.trim() || "Unnamed item";

const listingName = (listing: OwnListing) => {
  if (listing.type === "service") return `${listing.service?.type ?? "Unknown"} service`;
  if (listing.type === "exchange") return "Exchange listing";
  return itemName(listing.item);
};

// --- The user's own listings ---
export const isActiveItemListing = (listing: OwnListing) =>
  (listing.type ?? "item") === "item" && !listing.accepted_offer_id;

// Same query as the create page's own list of the user's listings
export const fetchMyListings = async (): Promise<OwnListing[]> => {
  const me = getMyUserId();
  if (!me) throw new Error("not logged in");
  const service = serviceOrThrow();
  const result = await call(() => service.find({ query: { user_id: me, $limit: 100 }, pd2: true }));
  if (!result.ok) throw new Error(`could not read your listings (${errorMessage(result.error)})`);
  return (result.value.data ?? []).filter((row) => typeof row?._id === "string");
};

const rereadMyListings = async (): Promise<OwnListing[] | null> => {
  try {
    return await fetchMyListings();
  } catch (error) {
    console.warn(LOG, "Could not re-read your listings to check what happened.", error);
    return null;
  }
};

const listingsOfItem = async (hash: string): Promise<OwnListing[] | null> =>
  (await rereadMyListings())?.filter((listing) => listing.item?.hash === hash) ?? null;

const isListingLimitError = (error: unknown) => errorCode(error) === 422 && /listing limit/i.test(errorMessage(error));

const bumpedRecently = (listing: OwnListing) =>
  Date.now() - (Date.parse(listing.bumped_at ?? "") || 0) < BUMP_INTERVAL_MS;

// --- Operations ---
// Within 12 hours of the last bump the server refuses another one, so the listing is listed again instead.
// The copy goes up before the old one comes down, so the item never leaves the market; only at the listing
// limit is the old one removed first. The new listing has a new _id: offers and favourites on the old one go.
const relistListing = async (listing: OwnListing, verb: string, changes: Record<string, unknown>): Promise<Outcome> => {
  const name = listingName(listing);
  const service = serviceOrThrow();

  // The server's copy, not the page's: that's exactly what gets listed again
  const current = await call(() => service.get(listing._id));
  if (!current.ok) {
    if (current.kind === "notFound") return { ok: false, severity: "skip", message: `${name}: the listing is gone (sold or removed)` };
    return { ok: false, severity: "stop", message: `${name}: could not read the listing (${errorMessage(current.error)})` };
  }
  if (current.value.accepted_offer_id) return { ok: false, severity: "skip", message: `${name}: has an accepted offer` };

  const bumpedAt = new Date().toJSON();
  const data: Record<string, unknown> = JSON.parse(JSON.stringify(current.value));
  SERVER_FIELDS.forEach((field) => delete data[field]);
  Object.assign(data, changes, { bumped_at: bumpedAt });

  // A create that landed late shows up as a new listing with exactly that bumped_at
  const createOnce = async (): Promise<CallResult<OwnListing>> => {
    const created = await call(() => service.create(data));
    if (created.ok || (created.kind !== "timeout" && created.kind !== "unknown")) return created;
    await sleep(VERIFY_DELAY_MS);
    const row = (await rereadMyListings())?.find(
      (other) => other._id !== listing._id && Date.parse(other.bumped_at ?? "") === Date.parse(bumpedAt)
    );
    return row ? { ok: true, value: row } : created;
  };

  const created = await createOnce();
  if (created.ok) {
    const removed = await deleteListing(listing);
    if (!removed.ok) {
      return { ok: false, severity: "stop", message: `${name}: listed again, but the old listing is still up (${removed.message})` };
    }
    return { ok: true, listing: created.value };
  }
  if (!isListingLimitError(created.error)) {
    return { ok: false, severity: "stop", message: `${name}: the ${verb} did not go through (${errorMessage(created.error)}); the listing is unchanged` };
  }

  // At the listing limit: make room with the old listing first
  const removed = await deleteListing(listing);
  if (!removed.ok) return { ok: false, severity: "stop", message: removed.message };
  const again = await createOnce();
  if (again.ok) return { ok: true, listing: again.value };
  return {
    ok: false,
    severity: "stop",
    message: `${name}: the old listing was removed but listing it again failed (${errorMessage(again.error)}); list it again by hand`,
  };
};

// Bump and re-price are one patch of the listing itself, the same call the site's own Bump and Modify Price
// make, as long as the last bump was 12 hours ago or more; nothing is delisted
const patchListing = async (listing: OwnListing, verb: string, changes: Record<string, unknown>): Promise<Outcome> => {
  const name = listingName(listing);
  if (listing.accepted_offer_id) return { ok: false, severity: "skip", message: `${name}: has an accepted offer` };
  if (bumpedRecently(listing)) return relistListing(listing, verb, changes);

  const service = serviceOrThrow();
  const bumpedAt = new Date().toJSON();
  const patched = await call(() => service.patch(listing._id, { ...changes, bumped_at: bumpedAt }));
  if (patched.ok) return { ok: true, listing: patched.value };
  // The page's copy of the listing was out of date, or the clocks differ
  if (patched.kind === "bumpLimit") return relistListing(listing, verb, changes);
  if (patched.kind === "notFound") {
    return { ok: false, severity: "skip", message: `${name}: the listing is gone (sold or removed)` };
  }
  if (patched.kind === "timeout" || patched.kind === "unknown") {
    // The server keeps the bumped_at it's sent, so a patch that landed late shows up as that exact time
    await sleep(VERIFY_DELAY_MS);
    const row = (await rereadMyListings())?.find((current) => current._id === listing._id);
    if (row && Date.parse(row.bumped_at ?? "") === Date.parse(bumpedAt)) return { ok: true, listing: row };
  }
  return { ok: false, severity: "stop", message: `${name}: the ${verb} did not go through (${errorMessage(patched.error)})` };
};

export const bumpListing = (listing: OwnListing) => patchListing(listing, "bump", {});

// Sets the text price and bumps the listing
export const repriceListing = (listing: OwnListing, price: PriceText) =>
  patchListing(listing, "price change", { price: price.text });

// Whose listing a create makes, frozen when a batch starts: the batch runs for minutes, and switching
// character/account or the Hardcore/Ladder toggles mid-run must not relabel the remaining items
export interface ListingTarget {
  account: string | null | undefined;
  character: string | undefined;
  hardcore: boolean | null | undefined;
  ladder: boolean | null | undefined;
}

// A new listing for an item that isn't listed. Nothing is deleted, so a failure loses nothing.
export const createListing = async (item: StashItem, target: ListingTarget, price: PriceText): Promise<Outcome> => {
  const name = itemName(item);
  const me = getMyUserId();
  if (!item.hash) return { ok: false, severity: "skip", message: `${name}: no item data` };
  if (!me) return { ok: false, severity: "stop", message: "not logged in" };

  const service = serviceOrThrow();
  // Same listing the site's own Submit creates from the stash view
  const payload: Record<string, unknown> = {
    item: { ...JSON.parse(JSON.stringify(item)), character_id: target.character, account_id: target.account },
    user_id: me,
    type: "item",
    is_hardcore: target.hardcore,
    is_ladder: target.ladder,
    price: price.text,
    bumped_at: new Date().toJSON(),
  };

  const created = await call(() => service.create(payload));
  if (created.ok) return { ok: true, listing: created.value };
  if (created.kind === "timeout" || created.kind === "unknown") {
    await sleep(VERIFY_DELAY_MS);
    const current = await listingsOfItem(item.hash);
    if (current && current.length > 0) return { ok: true, listing: current[0] };
    if (current === null) return { ok: false, severity: "stop", message: `${name}: the create timed out and the result could not be checked` };
    return { ok: false, severity: "stop", message: `${name}: no answer from the site (${errorMessage(created.error)}); not listed` };
  }
  // The server holds the listing limit: every item after this one would be refused too
  if (isListingLimitError(created.error)) {
    return { ok: false, severity: "stop", message: `${name}: the ${LISTING_LIMIT}-listing limit is reached; not listed` };
  }
  return { ok: false, severity: "skip", message: `${name}: the site refused the listing (${errorMessage(created.error)})` };
};

export const deleteListing = async (listing: OwnListing): Promise<Outcome> => {
  const name = listingName(listing);
  const service = serviceOrThrow();
  const removed = await call(() => service.remove(listing._id));
  if (removed.ok || (!removed.ok && removed.kind === "notFound")) return { ok: true };
  if (removed.kind === "timeout" || removed.kind === "unknown") {
    await sleep(VERIFY_DELAY_MS);
    const current = listing.item?.hash ? await listingsOfItem(listing.item.hash) : null;
    if (current && !current.some((row) => row._id === listing._id)) return { ok: true };
  }
  return { ok: false, severity: "stop", message: `${name}: the delete did not go through (${errorMessage(removed.error)})` };
};
