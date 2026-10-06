// A bar on the site's /market/filters page, where the saved filters are listed, dragged into order and
// deleted: "Sort A-Z" once, and the "Sort filters A-Z" setting. While that setting is on the drag handles are
// hidden (a dragged filter would go back to its place in name order) and the list is sorted when the page
// opens. main.ts calls ensureFiltersPageUi on every DOM change while this page is open.
import { getRouteComponent, hasFunctions, isAlive, isObject } from "../pd2/vue-bridge";
import type { VueComponent } from "../pd2/vue-bridge";
import { SETTINGS_CHANGED_EVENT, saveBooleanSetting } from "../trade/livesearch-ui";
import { Settings } from "../trade/settings";
import { errorMessage } from "../utils";
import { button, checkbox, h } from "./controls";
import { sortSavedFilters } from "./saved-order";

const FILTERS_ROUTE = "market.filters";
const PAGE_SIZE = 100; // the page's own

interface FiltersPage extends VueComponent {
  filters: unknown[];
  page: number;
  fetch(page?: number, limit?: number, skip?: number): Promise<void>;
}

const isFiltersPage = (proxy: unknown): proxy is FiltersPage =>
  isObject(proxy) &&
  Array.isArray(proxy.filters) &&
  typeof proxy.page === "number" &&
  hasFunctions(proxy, "fetch", "updateFilterOrder", "$watch");

const getFiltersPage = () => getRouteComponent(FILTERS_ROUTE, "PageGameMarketFilters", isFiltersPage);

type Tone = "info" | "warn" | "error";

let bar: HTMLElement | null = null;
let statusLine: HTMLElement | null = null;
let sortButton: HTMLButtonElement | null = null;
let autoSortBox: HTMLInputElement | null = null;
let checkedPage: FiltersPage | null = null; // the page the automatic sort already ran for

const setStatus = (text: string, tone: Tone = "info") => {
  if (!statusLine) return;
  statusLine.textContent = text;
  statusLine.dataset.tone = tone;
};

// The list, header and pagers sit in one column; the bar goes on top of it
const hostOf = (page: FiltersPage): Element | null => {
  const root = page.$.subTree?.el;
  return root instanceof Element ? root.querySelector("div.flex-grow.mr-8") : null;
};

const showAutoSort = () => {
  const on = Settings.getSettings().autoSortFilters;
  if (autoSortBox) autoSortBox.checked = on;
  bar?.parentElement?.classList.toggle("pd2te-autosort", on);
};

const runSort = async (page: FiltersPage, manual: boolean) => {
  if (sortButton) sortButton.disabled = true;
  setStatus(manual ? "Sorting..." : "Checking the order...");
  try {
    const { moved, total } = await sortSavedFilters((done, count) => setStatus(`Sorting: ${done} of ${count} moved`));
    if (moved > 0 && isAlive(page)) await page.fetch(page.page, PAGE_SIZE, (page.page - 1) * PAGE_SIZE);
    if (moved > 0) setStatus(`Sorted A-Z: ${moved} of ${total} filters moved`);
    else setStatus(manual ? `Already sorted A-Z (${total} filters)` : "");
  } catch (error) {
    setStatus(`Sorting failed: ${errorMessage(error)}`, "error");
  } finally {
    if (sortButton) sortButton.disabled = false;
  }
};

const buildBar = (page: FiltersPage): HTMLElement => {
  sortButton = button("Sort A-Z", () => {
    if (Settings.getSettings().autoSortFilters || confirm("Put all your saved filters in name order? Their order is saved on the server, so it replaces the one you dragged.")) {
      void runSort(page, true);
    }
  });
  sortButton.title = "Puts every saved filter in name order, once. Dragging still works afterwards";
  const autoSort = checkbox(
    "Keep sorted A-Z",
    Settings.getSettings().autoSortFilters,
    (on) => saveBooleanSetting("autoSortFilters", on),
    "The \"Sort filters A-Z\" setting: new and renamed filters go straight to their place, others are put back when this page or the Trade page opens. Dragging is off while it's on"
  );
  autoSortBox = autoSort.querySelector("input");
  statusLine = h("span", { class: "ls-status" });
  return h("div", { class: "pd2te-filters-bar pd2te-own" }, sortButton, autoSort, statusLine);
};

export const ensureFiltersPageUi = () => {
  const page = getFiltersPage();
  if (!page) return; // not mounted yet: the next DOM change tries again
  const host = hostOf(page);
  if (!host) return;
  if (!bar || bar.parentElement !== host) {
    bar = buildBar(page);
    host.prepend(bar);
    showAutoSort();
  }
  if (checkedPage !== page) {
    checkedPage = page;
    if (Settings.getSettings().autoSortFilters) void runSort(page, false);
  }
};

// The setting flipped with the switch on this page
document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
  const wasOn = bar?.parentElement?.classList.contains("pd2te-autosort") ?? false;
  showAutoSort();
  const page = getFiltersPage();
  if (!wasOn && Settings.getSettings().autoSortFilters && page && bar?.isConnected) void runSort(page, false);
});
