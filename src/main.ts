import "./style.css";
import { tradeOnLoad } from "./trade/misc";
import { ensureCreateUi } from "./create/create-ui";
import { ensureManageUi } from "./manage/manage-ui";
import { ensureExchangeUi } from "./exchange/exchange-ui";
import { ensureFiltersPageUi } from "./filters/filters-page";
import { stopFilterSortOffPage } from "./filters/saved-order";
import { stopLivesearchOffPage } from "./trade/logic";
import { stopExchangeLivesearchOffPage } from "./exchange/exchange-livesearch";
import { stopCreateActionOffPage } from "./create/create-actions";
import { isCreatePath, isExchangePath, isFiltersPath, isManagePath, isMarketPath } from "./utils";

// Main MutationObserver
const mainObserverLogic = () => {
  // Nothing runs unseen: whatever was started on a page stops when the user leaves that page (a route change
  // re-renders the page, so this runs right away)
  stopLivesearchOffPage();
  stopExchangeLivesearchOffPage();
  stopCreateActionOffPage();
  stopFilterSortOffPage();

  if (isMarketPath()) {
    if (document.getElementById("lsSettingsHeader")) return; // already set up

    tradeOnLoad();
  } else if (isCreatePath()) {
    ensureCreateUi();
  } else if (isManagePath()) {
    ensureManageUi();
  } else if (isExchangePath()) {
    ensureExchangeUi();
  } else if (isFiltersPath()) {
    ensureFiltersPageUi();
  }
};

const observer = new MutationObserver(mainObserverLogic);

observer.observe(document.body, { childList: true, subtree: true });
// The SPA may already be rendered and quiet when the script is injected (document-idle): run once now
mainObserverLogic();
