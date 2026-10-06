// The ↻ Bump icon on every card of /market/manage: items, services and exchanges. The site's own Bump there
// is locked for 12 hours after a bump, which only the page enforces; the server takes the same patch any time.
// main.ts calls ensureManageUi on every DOM change, so the component tree is only walked when a card shows up.
import { getListingCards, getManagePage } from "../pd2/manage-bridge";
import type { ListingCard } from "../pd2/manage-bridge";
import { isAlive } from "../pd2/vue-bridge";
import { makeBumpIcon } from "../create/create-ui";
import { bumpListing } from "../create/listing-ops";

const LOG = "[pd2-trade-enhancer]";
const NOTICE_MS = 2_000; // as long as the card's own notices ("Copied", "Submitted")

interface CardEntry {
  card: ListingCard;
  icon: HTMLElement;
}

// By the card's root element: the page keys its cards by listing _id, so one element is one listing's card
const entries = new WeakMap<Element, CardEntry>();
// Elements no card component matched yet: retried on later DOM changes (a card mid-mount matches nothing
// once), given up on after a few misses so a stray .panel.listing doesn't re-walk the tree forever
const MAX_LOOKUP_MISSES = 5;
const lookupMisses = new WeakMap<Element, number>();
const bumping = new Set<string>(); // listing ids
const noticeTimers = new WeakMap<ListingCard, ReturnType<typeof setTimeout>>();

// The card's own notice, the one its Share and Modify Price use
const notify = (card: ListingCard, text: string, type: "success" | "error") => {
  if (!isAlive(card)) return;
  card.actionNotification = text;
  card.actionNotificationType = type;
  card.showActionNotification = true;
  clearTimeout(noticeTimers.get(card));
  noticeTimers.set(
    card,
    setTimeout(() => (card.showActionNotification = false), NOTICE_MS)
  );
};

const bumpCard = async (card: ListingCard, icon: HTMLElement) => {
  const listing = card.listing;
  if (bumping.has(listing._id)) return;
  bumping.add(listing._id);
  icon.classList.add("pd2te-busy");
  try {
    const outcome = await bumpListing(listing);
    if (outcome.ok) {
      // What the site's own Bump does: the card's time and the site's 12-hour lock follow
      if (outcome.listing) {
        listing.updated_at = outcome.listing.updated_at;
        listing.bumped_at = outcome.listing.bumped_at;
      }
      notify(card, "Bumped", "success");
    } else {
      console.warn(LOG, `Bump: ${outcome.message}`);
      notify(card, "Bump failed", "error");
    }
  } catch (error) {
    console.error(LOG, "Bump failed:", error);
    notify(card, "Bump failed", "error");
  } finally {
    bumping.delete(listing._id);
    icon.classList.remove("pd2te-busy");
  }
};

const addEntries = (elements: Element[]) => {
  const page = getManagePage();
  if (!page) return; // not mounted yet: the next DOM change tries again
  const cards = new Map<unknown, ListingCard>(getListingCards(page).map((card) => [card.$el, card]));
  elements.forEach((element) => {
    const card = cards.get(element);
    if (!card) {
      lookupMisses.set(element, (lookupMisses.get(element) ?? 0) + 1);
      return;
    }
    lookupMisses.delete(element);
    const icon = makeBumpIcon();
    icon.addEventListener("click", () => void bumpCard(card, icon));
    entries.set(element, { card, icon });
  });
};

// Wherever the site shows its own Bump (not on removed listings), at the end of the card's icon row.
// Listings with an accepted offer are left alone, as on the create page.
const placeIcon = (element: Element, { card, icon }: CardEntry) => {
  const row = element.querySelector(".user-info")?.lastElementChild;
  const show = isAlive(card) && card.showBump && !card.listing.accepted_offer_id;
  if (show && row && icon.parentElement !== row) row.appendChild(icon);
  else if (!show && icon.isConnected) icon.remove();
};

export const ensureManageUi = () => {
  const elements = Array.from(document.querySelectorAll(".panel.listing"));
  const unseen = elements.filter(
    (element) => !entries.has(element) && (lookupMisses.get(element) ?? 0) < MAX_LOOKUP_MISSES
  );
  if (unseen.length > 0) addEntries(unseen);
  elements.forEach((element) => {
    const entry = entries.get(element);
    if (entry) placeIcon(element, entry);
  });
};
