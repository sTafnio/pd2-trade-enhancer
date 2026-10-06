// The create page's controls: a panel under the stash search (Bump Tab, Bump All, Delete Tab, Price Tab,
// Stop and a status line), the ↻ Bump icon in the selected item's panel, shown only for listed items, and
// its Filter button (item-filter.ts).
// main.ts calls ensureCreateUi on every DOM change, so everything here is cheap and idempotent.
import { getCharacterDetails } from "../pd2/create-bridge";
import type { CharacterDetails } from "../pd2/create-bridge";
import { isAlive } from "../pd2/vue-bridge";
import { html } from "../utils";
import { bumpAll, bumpSelected, bumpTab, deleteTab, isCreateActionRunning, priceTab, requestStop } from "./create-actions";
import { ensureItemFilter } from "./item-filter";

export type CreateStatusTone = "info" | "warn" | "error";

const panel = html(/*html*/ `
<div id="pd2teCreatePanel" class="pd2te-create-panel">
    <div class="pd2te-create-row">
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="bumpTab"
            title="Bump the listed items on this stash tab">Bump Tab</button>
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="bumpAll"
            title="Bump all your listings">Bump All</button>
        <button type="button" class="ls-btn stop-btn pd2te-create-btn" data-action="deleteTab"
            title="Remove the listings of the items on this stash tab">Delete Tab</button>
    </div>
    <div class="pd2te-create-row">
        <input type="text" class="name-input pd2te-price-input" placeholder="Price for Price Tab" autocomplete="off">
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="priceTab"
            title="List every item on this stash tab at this price (listed items get the new price and a bump)">Price Tab</button>
    </div>
    <div class="pd2te-create-row">
        <div class="ls-status pd2te-create-status"></div>
        <button type="button" class="ls-btn stop-btn pd2te-create-btn pd2te-hidden" data-action="stop"
            title="Stop after the current item">Stop</button>
    </div>
</div>
`);

// The ↻ icon; the Manage page puts one on each card
export const makeBumpIcon = () =>
  html(/*html*/ `
<div class="bump-button-container" title="Bump this listing">
    <svg class="bump-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
        </path>
    </svg>
</div>
`);

const bumpIcon = makeBumpIcon();
bumpIcon.id = "bumpContainer";

const status = panel.querySelector<HTMLElement>(".pd2te-create-status")!;
const priceInput = panel.querySelector<HTMLInputElement>(".pd2te-price-input")!;
const actionButtons = Array.from(panel.querySelectorAll<HTMLButtonElement>("button[data-action]")).filter(
  (button) => button.dataset.action !== "stop"
);
const stopButton = panel.querySelector<HTMLButtonElement>('button[data-action="stop"]')!;

// Wrapped: create-actions imports this module too, so its exports are only read when a button is clicked
const actions: Record<string, () => void> = {
  bumpTab: () => bumpTab(),
  bumpAll: () => bumpAll(),
  deleteTab: () => deleteTab(),
  priceTab: () => priceTab(priceInput.value),
  stop: () => requestStop(),
};

panel.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button[data-action]");
  if (button && !button.disabled) actions[button.dataset.action ?? ""]?.();
});
priceInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") priceTab(priceInput.value);
});
bumpIcon.addEventListener("click", () => {
  if (!isCreateActionRunning()) bumpSelected();
});

export const setCreateStatus = (text: string, tone: CreateStatusTone = "info") => {
  status.textContent = text;
  status.dataset.tone = tone;
};

export const setCreateBusy = (busy: boolean) => {
  actionButtons.forEach((button) => (button.disabled = busy));
  priceInput.disabled = busy;
  stopButton.classList.toggle("pd2te-hidden", !busy);
  bumpIcon.classList.toggle("pd2te-busy", busy);
};

// Below the stash search row; Vue re-renders drop it, the next DOM change puts it back
const ensurePanel = () => {
  const search = document.querySelector("input[placeholder='Search for stash item...']");
  const row = search?.closest(".flex.flex-row.mb-4");
  if (!row || (panel.isConnected && panel.previousElementSibling === row)) return;
  row.insertAdjacentElement("afterend", panel);
};

let details: CharacterDetails | null = null;

// Only looked up while an item panel is open, and kept until that component unmounts
const currentDetails = () => {
  if (!details || !isAlive(details)) details = getCharacterDetails();
  return details;
};

const ensureItemPanelControls = () => {
  const holder = document.querySelector("div.user-info")?.lastElementChild;
  if (!holder) return; // no item panel: the icon and the Filter button left with it
  const current = currentDetails();
  ensureItemFilter(current);
  const listed = (current?.selectedItemListing ?? null) !== null;
  if (listed && bumpIcon.parentElement !== holder) holder.appendChild(bumpIcon);
  else if (!listed && bumpIcon.isConnected) bumpIcon.remove();
};

export const ensureCreateUi = () => {
  ensurePanel();
  ensureItemPanelControls();
};
