import { playNewItemSound } from "../notifications/sound";
import { notifyTabOfHits } from "../notifications/visual";
import { showDesktopNotification } from "../notifications/desktop";
import { addRecentHits } from "./livesearch-ui";
import { Settings } from "./settings";

export interface Hit {
  id: string;
  name: string;
  price?: string;
  savedAt?: number; // the listing's updated_at (ms): when it was created, bumped or edited
}

const LOG = "[pd2-trade-enhancer]";

// Result card links: the image link, or the name link in compact mode
export const LISTING_LINK_SELECTOR = 'a[href^="/market/listing/"]';

export const listingPath = (id: string) => `/market/listing/${id}`;

export const listingIdFromHref = (href: string | null) => href?.match(/^\/market\/listing\/([^/?#]+)/)?.[1] ?? null;

const safely = (label: string, fn: () => void) => {
  try {
    fn();
  } catch (error) {
    console.error(LOG, `${label} failed`, error);
  }
};

// Sound first, so a later failure can't swallow it; nothing here may throw into the search loop.
// `recent: false` leaves the market panel's Recent Hits alone (the exchange feed keeps its own history)
export const reportHits = (hits: Hit[], { recent = true } = {}) => {
  if (hits.length === 0) return;

  const time = new Date().toLocaleTimeString();
  hits.forEach((hit) => {
    const saved = hit.savedAt ? `(saved ${new Date(hit.savedAt).toLocaleTimeString()})` : "";
    console.log(`${LOG} ${time} new listing:`, hit.name, hit.price ?? "", `${location.origin}${listingPath(hit.id)}`, saved);
  });

  playNewItemSound();
  if (recent) safely("Recent hits", () => addRecentHits(hits));
  safely("Tab alert", () => notifyTabOfHits(hits.length));
  if (Settings.getSettings().desktopNotifications) showDesktopNotification(hits);
};
