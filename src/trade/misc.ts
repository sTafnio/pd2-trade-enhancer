import { IMPORTANT_ELEMENTS } from "./important-elements";
import { mountLivesearchUi } from "./livesearch-ui";
import { onMarketPageMounted } from "./logic";
import { getMarketFilters, getQueryBuilder, probeBridge, setSort } from "../pd2/vue-bridge";
import { mountFilterColumn } from "../filters/ui";
import { installSearchChecks } from "../filters/search-checks";

const LOG = "[pd2-trade-enhancer]";

let bridgeChecked = false;
const warnedIds = new Set<string>();

export const tradeOnLoad = () => {
  if (!document.querySelector("div.filters > div")) return; // column not rendered yet; main.ts calls again on the next mutation

  addIdToImportantTradeElements();
  if (!document.getElementById("filters")) return; // layout changed (warned above)

  mountLivesearchUi();
  forceNewestFirstSort();
  if (mountFilterColumn() === "failed") {
    console.warn(`${LOG} The enhanced filter column could not be mounted (see above): keeping the site's own filter column.`);
  }
  installSearchChecks(); // also for a saved filter with them that the site's own panels load
  checkBridgeOnce();
  onMarketPageMounted();
};

// A count mismatch means the site changed: warn once and leave it untagged rather than tag the wrong element
const addIdToImportantTradeElements = () => {
  IMPORTANT_ELEMENTS.forEach(({ id, find, expected = 1 }) => {
    const matches = find();
    if (matches.length === expected) {
      matches[0].id = id;
      return;
    }
    if (warnedIds.has(id)) return;
    warnedIds.add(id);
    console.warn(`${LOG} #${id}: expected ${expected} match(es), found ${matches.length}. Site layout changed? Not tagged.`);
  });
};

// Says before Start whether livesearch can poll the site's API; once per page load (Start checks again)
const checkBridgeOnce = () => {
  if (bridgeChecked) return;
  bridgeChecked = true;

  const problem = probeBridge();
  if (problem !== null) {
    console.warn(`${LOG} Livesearch won't be able to start: ${problem}.`);
    return;
  }
  console.info(`${LOG} Site app and API client reachable: livesearch will poll the API.`);
  void getQueryBuilder().then((build) =>
    console.info(
      build
        ? `${LOG} Found the site's query builder: Start builds the query from the filter panel.`
        : `${LOG} The site's query builder wasn't found: Start runs the page's search to capture the query.`
    )
  );
};

// Newest first, through the form's own state (our Sort panel shows it)
const forceNewestFirstSort = () => {
  const filters = getMarketFilters();
  if (filters) setSort(filters, "bumped_at", -1);
};
