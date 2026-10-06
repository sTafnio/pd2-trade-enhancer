// Red badge with a white "!", drawn with shapes so it looks the same on every OS
const ITEM_FOUND_FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<circle cx="16" cy="16" r="16" fill="#e0201b"/>' +
      '<rect x="13.5" y="5" width="5" height="14" rx="2.5" fill="#fff"/>' +
      '<circle cx="16" cy="24.5" r="3" fill="#fff"/>' +
      "</svg>"
  );
const TITLE_COUNT = /^\(\d+\) /;

let unseenHits = 0;
let savedFavicon: { link: HTMLLinkElement; href: string | null } | null = null;

export const isUserWatchingTab = () => !document.hidden && document.hasFocus();

// Puts "(N) " in front of whatever title is set (site default or renamed tab)
export const renderTabTitle = () => {
  const baseTitle = document.title.replace(TITLE_COUNT, "");
  const title = unseenHits > 0 ? `(${unseenHits}) ${baseTitle}` : baseTitle;
  if (document.title !== title) document.title = title;
};

const showAlertFavicon = () => {
  if (savedFavicon) return;
  const link = document.querySelector<HTMLLinkElement>('link#favicon, link[rel~="icon"]');
  if (!link) return;

  savedFavicon = { link, href: link.getAttribute("href") }; // the site uses a relative /favicon.ico
  link.setAttribute("href", ITEM_FOUND_FAVICON);
};

const restoreFavicon = () => {
  if (!savedFavicon) return;
  const { link, href } = savedFavicon;
  savedFavicon = null;
  if (href === null) link.removeAttribute("href");
  else link.setAttribute("href", href);
};

// Counter and favicon only change while the user isn't looking (tab hidden or window unfocused)
export const notifyTabOfHits = (count: number) => {
  if (isUserWatchingTab()) return;

  unseenHits += count;
  renderTabTitle();
  showAlertFavicon();
};

const clearUnseenHits = () => {
  if (document.hidden || (unseenHits === 0 && !savedFavicon)) return;

  unseenHits = 0;
  renderTabTitle();
  restoreFavicon();
};

document.addEventListener("visibilitychange", clearUnseenHits);
window.addEventListener("focus", clearUnseenHits);
