// "Filter" on the create page's selected item: the market cards' panel (filters/item-panel.ts) for an item
// you're about to list, so a price check is a few ticks away. Search opens /market in a new tab with the
// ticked ones, in the Hardcore/Ladder mode the item would be listed in. The vocabularies come from the
// market page's filter component, loaded on the first click.
import type { CharacterDetails } from "../pd2/create-bridge";
import { button } from "../filters/controls";
import { buildItemPanel } from "../filters/item-panel";
import type { PanelItem } from "../filters/item-panel";
import { searchLink } from "../filters/link";
import { emptyModel } from "../filters/model";
import { loadVocab } from "../filters/site";
import { Settings } from "../trade/settings";
import { errorMessage } from "../utils";
import { setCreateStatus } from "./create-ui";

const filterButton = button("Filter", () => void togglePanel(), "pd2te-btn-small pd2te-card-btn pd2te-own");
filterButton.title = "Search the market for items like this one: pick its mods, base and rarity";

let details: CharacterDetails | null = null;
let panelItem: unknown = null; // the item the open panel was built for

// The item panel's card: the site renders the selected item as a market listing card
const selectedCard = () => document.querySelector("div.user-info")?.closest<HTMLElement>(".listing") ?? null;

const openPanel = () => document.querySelector<HTMLElement>(".pd2te-item-filter");

const togglePanel = async () => {
  const open = openPanel();
  if (open) {
    open.remove();
    return;
  }
  const card = selectedCard();
  const target = details;
  const item = target?.selectedItem;
  if (!card || !item || !target) return;
  let vocab;
  try {
    vocab = await loadVocab();
  } catch (error) {
    setCreateStatus(`Filter: couldn't read the market's filter lists (${errorMessage(error)})`, "error");
    return;
  }
  if (target.selectedItem !== item || !card.isConnected || openPanel()) return; // changed while loading
  const panel = buildItemPanel(item as PanelItem, {
    vocab,
    ownStats: false,
    actions: [
      {
        label: "Search",
        title: "Open the market in a new tab, searching for the ticked ones in this listing mode",
        run: (apply) => {
          const model = emptyModel();
          if (typeof target.listingHardcore === "boolean") model.hardcore = target.listingHardcore;
          if (typeof target.listingLadder === "boolean") model.ladder = target.listingLadder;
          apply(model);
          window.open(searchLink(model), "_blank", "noopener");
        },
      },
    ],
  });
  panelItem = item;
  card.append(panel);
};

// Called on every DOM change while an item panel is open. Vue reuses the card for the next selected item:
// a panel for another item goes. The button needs "Enhanced filters", which reads the link it opens
export const ensureItemFilter = (current: CharacterDetails | null) => {
  details = current;
  const card = selectedCard();
  const item = current?.selectedItem;
  const panel = openPanel();
  if (panel && (!card || !item || panelItem !== item || !card.contains(panel))) panel.remove();
  if (!card || !item || !Settings.getSettings().enhancedFilters) {
    filterButton.remove();
    return;
  }
  const slot = card.querySelector(".meta > .flex") ?? card.querySelector(".meta");
  if (slot && filterButton.parentElement !== slot) slot.append(filterButton);
};
