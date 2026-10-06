import { GM_notification } from "$";
import { isUserWatchingTab } from "./visual";

export interface NotificationHit {
  name: string;
  price?: string;
}

export const showDesktopNotification = (hits: NotificationHit[]) => {
  if (hits.length === 0 || isUserWatchingTab()) return;

  // Optional extra: a manager without GM_notification must not stop livesearch
  try {
    const lines = hits.slice(0, 3).map((hit) => (hit.price ? `${hit.name} - ${hit.price}` : hit.name));
    GM_notification({
      title: hits.length === 1 ? "New listing" : `${hits.length} new listings`,
      text: lines.join("\n") + (hits.length > 3 ? "\n..." : ""),
      silent: true, // playNewItemSound already plays. Chromium only: Firefox leaves the chime to the OS
      timeout: 15000, // Tampermonkey only
      onclick: () => window.focus(), // the granted window.focus: Firefox ignores the page's own
    });
  } catch (error) {
    console.error("Error showing desktop notification:", error);
  }
};
