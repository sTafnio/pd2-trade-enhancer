// The exchange page's livesearch controls: a Livesearch/Stop button with the watched search and a status
// line, in a row under the page's own controls (Post, Search, Modify Search and the toggles).
// main.ts calls ensureExchangeUi on every DOM change, so everything here is cheap and idempotent.
import { clockTime, html } from "../utils";
import {
  isExchangeLivesearchRunning,
  onExchangePageMounted,
  startExchangeLivesearch,
  stopExchangeLivesearch,
} from "./exchange-livesearch";

export type ExchangeStatusTone = "info" | "warn" | "error";

const START_TITLE =
  "Alert when a new exchange listing matches this search (matched like Search). Runs while this page is open, also in a background browser tab.";
const STOP_TITLE = "Stop livesearch. Leaving this page stops it too.";

// Both lines keep their space while empty, so starting a livesearch doesn't shift the page below
const controls = html(/*html*/ `
<div id="pd2teExchangeLive" class="pd2te-exchange-live pd2te-own">
    <button type="button" class="ls-btn start-btn pd2te-exchange-btn">Livesearch</button>
    <div class="pd2te-exchange-info">
        <div class="pd2te-exchange-watched pd2te-holds-line"></div>
        <div class="ls-status pd2te-exchange-status pd2te-holds-line"></div>
    </div>
</div>
`);

const button = controls.querySelector<HTMLButtonElement>("button")!;
const watched = controls.querySelector<HTMLElement>(".pd2te-exchange-watched")!;
const status = controls.querySelector<HTMLElement>(".pd2te-exchange-status")!;
button.title = START_TITLE;

// Wrapped: exchange-livesearch imports this module too, so its exports are only read on a click
button.addEventListener("click", () => {
  if (isExchangeLivesearchRunning()) stopExchangeLivesearch(`Stopped at ${clockTime()}`);
  else startExchangeLivesearch();
});

export const setExchangeRunning = (running: boolean) => {
  button.textContent = running ? "Stop" : "Livesearch";
  button.title = running ? STOP_TITLE : START_TITLE;
  button.classList.toggle("start-btn", !running);
  button.classList.toggle("stop-btn", running);
};

export const setExchangeStatus = (text: string, tone: ExchangeStatusTone = "info") => {
  status.textContent = text;
  status.dataset.tone = tone;
};

export const setWatchedLabel = (label: string) => {
  watched.textContent = label ? `Watching: ${label}` : "";
};

// Under the page's controls row; Vue re-renders drop it, the next DOM change puts it back.
// True when it was just put there: the page (re)mounted
const ensureControls = () => {
  const row = document.querySelector(".exchange-controls");
  if (!row || (controls.isConnected && controls.previousElementSibling === row)) return false;
  row.insertAdjacentElement("afterend", controls);
  return true;
};

export const ensureExchangeUi = () => {
  if (ensureControls()) onExchangePageMounted();
};
