// Results per page on /market. The site's pager always asks its page for 10 rows; while our column is
// mounted the page's fetch() is wrapped to ask for the configured size instead, and `total` is scaled so
// the pager, which divides by 10, shows the right number of pages. The site shows no total count anywhere,
// only page numbers, so the scaled value is never visible.
import { watchState } from "../pd2/vue-bridge";
import type { Unwatch } from "../pd2/vue-bridge";
import { SETTINGS_CHANGED_EVENT } from "../trade/livesearch-ui";
import { Settings } from "../trade/settings";
import type { SitePage } from "./site";

const PAGER_LIMIT = 10; // ContentPagination's fixed `limit`

interface Installed {
  page: SitePage;
  original: SitePage["fetch"];
  unwatch: Unwatch;
}

let installed: Installed | null = null;
let adjusting = false;
let lastSize = 0;

const pageSize = () => Settings.getSettings().pageSize;

// The total the pager needs to show ceil(real / size) pages
const pagerTotal = (real: number, size: number) => Math.ceil(real / size) * PAGER_LIMIT;

export const installPaging = (page: SitePage) => {
  uninstallPaging();
  const original = page.fetch;
  lastSize = pageSize();
  page.fetch = (pageNumber = 1) => {
    const size = pageSize();
    return original.call(page, pageNumber, size, (pageNumber - 1) * size);
  };
  const unwatch = watchState(
    page,
    "total",
    (value) => {
      if (adjusting || typeof value !== "number") return;
      const size = pageSize();
      if (size === PAGER_LIMIT) return;
      const adjusted = pagerTotal(value, size);
      if (adjusted === value) return;
      adjusting = true;
      try {
        page.total = adjusted;
      } finally {
        adjusting = false;
      }
    },
    { flush: "sync" }
  );
  installed = { page, original, unwatch };
};

export const uninstallPaging = () => {
  if (!installed) return;
  const { page, original, unwatch } = installed;
  unwatch();
  if (!page.$.isUnmounted) page.fetch = original;
  installed = null;
};

// A new page size: reload the first page with it
document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
  const size = pageSize();
  if (size === lastSize) return;
  lastSize = size;
  const page = installed?.page;
  if (page && !page.$.isUnmounted && !page.noFilters && !page.loading) page.fetch();
});
