// The create page's actions: Bump (selected item), Bump Tab, Bump All, Delete Tab and Price Tab.
// One at a time, paced, and stoppable between items.
import { getCharacterDetails, getCreatePage, getVisibleStashItems } from "../pd2/create-bridge";
import type { CharacterDetails, OwnListing, StashItem } from "../pd2/create-bridge";
import { errorMessage, isCreatePath, sleep } from "../utils";
import {
  LISTING_LIMIT,
  bumpListing,
  createListing,
  deleteListing,
  fetchMyListings,
  isActiveItemListing,
  itemName,
  repriceListing,
} from "./listing-ops";
import type { ListingTarget, Outcome } from "./listing-ops";
import { setCreateBusy, setCreateStatus } from "./create-ui";

const LOG = "[pd2-trade-enhancer]";
const ITEM_GAP_MS = 1_500; // between items in a batch: bulk actions shouldn't hammer the site

interface Job {
  name: string;
  run: () => Promise<Outcome>;
}

interface Control {
  stopRequested: boolean;
}

let running: { label: string; control: Control } | null = null;

export const isCreateActionRunning = () => running !== null;

export const requestStop = () => {
  if (!running) return;
  running.control.stopRequested = true;
  setCreateStatus(`${running.label}: stopping after the current item...`, "warn");
};

// A batch runs only while /market/create is open: leaving it stops the batch after the current item
export const stopCreateActionOffPage = () => {
  if (running && !running.control.stopRequested && !isCreatePath()) requestStop();
};

const refreshPageListings = () => {
  try {
    getCreatePage()?.fetchListings(); // the page's own refresh: listed markers, item panel
  } catch (error) {
    console.warn(LOG, "Could not refresh the page's listings.", error);
  }
};

const runExclusive = async (label: string, body: (control: Control) => Promise<void>) => {
  if (running) {
    setCreateStatus(`${running.label} is still running`, "warn");
    return;
  }
  const current = { label, control: { stopRequested: false } };
  running = current;
  setCreateBusy(true);
  try {
    await body(current.control);
  } catch (error) {
    console.error(LOG, `${label} stopped after an error:`, error);
    setCreateStatus(`${label} stopped: ${errorMessage(error)}`, "error");
    alert(`pd2-trade-enhancer: ${label} stopped after an error: ${errorMessage(error)}\nPlease check your listings.`);
  } finally {
    running = null;
    setCreateBusy(false);
    refreshPageListings();
  }
};

// Resolves true when every job ran (none failed and Stop wasn't pressed)
const runJobs = async (label: string, jobs: Job[], control: Control): Promise<boolean> => {
  let done = 0;
  const skipped: string[] = [];
  let failure: string | null = null;

  for (let i = 0; i < jobs.length; i++) {
    if (control.stopRequested) {
      skipped.push(`${jobs.length - i} not started (stopped)`);
      break;
    }
    const job = jobs[i];
    setCreateStatus(`${label}: ${i + 1}/${jobs.length} ${job.name}`);

    const outcome = await job.run();
    if (outcome.ok) {
      done++;
    } else if (outcome.severity === "skip") {
      skipped.push(outcome.message);
    } else {
      failure = outcome.message;
      console.error(LOG, `${label}: ${outcome.message}`);
      break; // whatever went wrong could repeat on the next item
    }
    if (i < jobs.length - 1 && !control.stopRequested) await sleep(ITEM_GAP_MS);
  }

  // Skips and failures go to the status line and the console
  const parts = [`${done} done`];
  if (skipped.length > 0) parts.push(`${skipped.length} skipped (see console)`);
  if (failure) parts.push(`stopped: ${failure}`);
  const summary = `${label}: ${parts.join(", ")}`;
  setCreateStatus(summary, failure ? "error" : skipped.length > 0 ? "warn" : "info");
  console.info(LOG, summary);
  skipped.forEach((note) => console.warn(LOG, `${label} skipped: ${note}`));
  return !failure && !control.stopRequested;
};

// --- Helpers ---
const needStashView = (): { details: CharacterDetails; items: StashItem[] } | null => {
  const details = getCharacterDetails();
  const items = details ? getVisibleStashItems(details) : null;
  if (!details || !items) {
    setCreateStatus("Open the Stash view first", "warn");
    return null;
  }
  return { details, items };
};

const hashesOf = (items: StashItem[]) => new Set(items.map((item) => item.hash).filter((hash): hash is string => !!hash));

const listingsOn = (listings: OwnListing[], hashes: Set<string>) =>
  listings.filter((listing) => isActiveItemListing(listing) && !!listing.item?.hash && hashes.has(listing.item.hash));

const bumpJobs = (listings: OwnListing[]): Job[] =>
  listings.map((listing) => ({ name: itemName(listing.item), run: () => bumpListing(listing) }));

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// --- Actions ---
// The item selected in the panel (the ↻ icon)
export const bumpSelected = () => {
  const listing = getCharacterDetails()?.selectedItemListing;
  if (!listing) {
    setCreateStatus("The selected item isn't listed", "warn");
    return;
  }
  void runExclusive("Bump", async (control) => {
    await runJobs("Bump", bumpJobs([listing]), control);
  });
};

export const bumpTab = () => {
  const view = needStashView();
  if (!view) return;
  void runExclusive("Bump Tab", async (control) => {
    setCreateStatus("Bump Tab: reading your listings...");
    const listings = listingsOn(await fetchMyListings(), hashesOf(view.items));
    if (listings.length === 0) {
      setCreateStatus("Bump Tab: nothing listed on this stash tab");
      return;
    }
    await runJobs("Bump Tab", bumpJobs(listings), control);
  });
};

export const bumpAll = () => {
  void runExclusive("Bump All", async (control) => {
    setCreateStatus("Bump All: reading your listings...");
    const listings = (await fetchMyListings()).filter(isActiveItemListing);
    if (listings.length === 0) {
      setCreateStatus("Bump All: you have no active listings");
      return;
    }
    await runJobs("Bump All", bumpJobs(listings), control);
  });
};

export const deleteTab = () => {
  const view = needStashView();
  if (!view) return;
  void runExclusive("Delete Tab", async (control) => {
    setCreateStatus("Delete Tab: reading your listings...");
    const listings = listingsOn(await fetchMyListings(), hashesOf(view.items));
    if (listings.length === 0) {
      setCreateStatus("Delete Tab: nothing listed on this stash tab");
      return;
    }
    const jobs = listings.map((entry) => ({ name: itemName(entry.item), run: () => deleteListing(entry) }));
    await runJobs("Delete Tab", jobs, control);
  });
};

export const priceTab = (priceText: string) => {
  const text = priceText.trim();
  if (!text) {
    setCreateStatus("Price Tab: enter a price first", "warn");
    return;
  }
  const view = needStashView();
  if (!view) return;
  const { details, items } = view;
  // `details` is the live component: freeze what new listings are labeled with at click time, so switching
  // character/account or the Hardcore/Ladder toggles during the paced batch doesn't relabel the rest
  const target: ListingTarget = {
    account: details.account,
    character: details.characterDetails?.name ?? undefined,
    hardcore: details.listingHardcore,
    ladder: details.listingLadder,
  };

  void runExclusive("Price Tab", async (control) => {
    setCreateStatus("Price Tab: reading your listings...");
    const all = await fetchMyListings();
    // Any listing of the item counts as listed (one with an accepted offer is skipped, not listed twice)
    const byHash = new Map<string, OwnListing>();
    all.forEach((listing) => {
      const hash = listing.item?.hash;
      if (hash && (!byHash.has(hash) || isActiveItemListing(listing))) byHash.set(hash, listing);
    });

    const listed = items.map((item) => (item.hash ? byHash.get(item.hash) : undefined)).filter((l): l is OwnListing => !!l);
    const unlisted = items.filter((item) => item.hash && !byHash.has(item.hash));
    const room = Math.max(0, LISTING_LIMIT - all.length); // the server counts every listing, accepted offers too
    const toCreate = unlisted.slice(0, room);
    const overLimit = unlisted.length - toCreate.length;

    if (unlisted.length > 0 && !target.account) {
      setCreateStatus("Price Tab: select your account first (new listings need it)", "warn");
      return;
    }
    if (listed.length + toCreate.length === 0) {
      setCreateStatus(overLimit > 0 ? `Price Tab: the ${LISTING_LIMIT}-listing limit is reached` : "Price Tab: no items on this tab");
      return;
    }

    if (overLimit > 0) {
      console.warn(LOG, `Price Tab: ${overLimit} items won't be listed (${LISTING_LIMIT}-listing limit, you have ${all.length}).`);
    }

    const price = { text };
    const jobs: Job[] = [
      ...listed.map((listing) => ({ name: itemName(listing.item), run: () => repriceListing(listing, price) })),
      ...toCreate.map((item) => ({ name: itemName(item), run: () => createListing(item, target, price) })),
    ];
    const finished = await runJobs("Price Tab", jobs, control);
    if (finished && overLimit > 0) setCreateStatus(`Price Tab done; ${plural(overLimit, "item")} not listed (${LISTING_LIMIT}-listing limit)`, "warn");
  });
};
