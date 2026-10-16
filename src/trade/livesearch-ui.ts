import { controls, startButton, statusLine, stopButton } from "../ui-elements/livesearch-button";
import { settingsPanel } from "../ui-elements/livesearch-settings-panel";
import { Settings } from "./settings";
import type { BooleanSettingKey, NumberSettingKey } from "./settings";
import { playNewItemSound } from "../notifications/sound";
import { renderTabTitle } from "../notifications/visual";
import { clockTime } from "../utils";
import { isLivesearchRunning, onStartButtonPress, onStopButtonPress } from "./logic";
import { listingPath } from "./hits";
import type { Hit } from "./hits";

export type StatusTone = "info" | "warn" | "error";

const MAX_RECENT_HITS = 50; // same as the feed, so both list the same listings
const DEFAULT_TITLE = "Project Diablo 2";

// The panel and the controls are singletons, moved into #filters on every /market mount and kept
// (detached) while off /market. Their listeners are added once, at the end of this module.
const inPanel = <T extends Element = HTMLElement>(selector: string) => settingsPanel.querySelector<T>(selector)!;

const settingsHeader = inPanel("#lsSettingsHeader");
const searchNameInput = inPanel<HTMLInputElement>("#searchName");
const delayInput = inPanel<HTMLInputElement>("#delayInput");
const volumeInput = inPanel<HTMLInputElement>("#volumeInput");
const pageSizeInput = inPanel<HTMLInputElement>("#pageSizeInput");
const checkboxes: [HTMLInputElement, BooleanSettingKey][] = [
  [inPanel<HTMLInputElement>("#desktopNotificationsInput"), "desktopNotifications"],
  [inPanel<HTMLInputElement>("#enhancedFiltersInput"), "enhancedFilters"],
  [inPanel<HTMLInputElement>("#compactCardsInput"), "compactCards"],
  [inPanel<HTMLInputElement>("#cardTimesInput"), "cardTimes"],
  [inPanel<HTMLInputElement>("#showQueryInput"), "showQuery"],
  [inPanel<HTMLInputElement>("#autoSortFiltersInput"), "autoSortFilters"],
  [inPanel<HTMLInputElement>("#localFiltersInput"), "localFilters"],
];

// Fired on document after this panel saves a setting, so every listener re-reads localStorage instead of
// one module telling the others
export const SETTINGS_CHANGED_EVENT = "pd2te:settings-changed";
export const announceSettingsChanged = () => document.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
const recentHitsSection = inPanel("#lsRecentHits");
const recentHitsList = inPanel("#lsRecentHitsList");
const clearHitsButton = inPanel("#lsClearHits");

let recentHits: (Hit & { time: string })[] = [];

export const mountLivesearchUi = () => {
  const filters = document.getElementById("filters");
  if (!filters) return;

  showStoredSettings();
  // Start/Stop with the status line under it, above the panel; under the filter column's Search/Clear when it has them
  const toolbar = filters.querySelector(":scope > .pd2te-toolbar-host");
  if (toolbar) toolbar.after(controls, settingsPanel);
  else filters.prepend(controls, settingsPanel);
  if (isLivesearchRunning()) showStopButton();
  else showStartButton();
};

export const showStartButton = () => {
  stopButton.remove();
  controls.prepend(startButton);
};

export const showStopButton = () => {
  startButton.remove();
  controls.prepend(stopButton);
};

export const setStatus = (text: string, tone: StatusTone = "info") => {
  statusLine.textContent = text;
  statusLine.dataset.tone = tone;
};

export const setTabName = (name: string) => {
  searchNameInput.value = name;
  updateTabTitle(name);
};

// Clear Filters also clears a custom tab name (without one, the site's title stays as it is)
export const clearTabName = () => {
  if (searchNameInput.value !== "") setTabName("");
};

// On every mount: settings live in localStorage, so another tab may have changed them
const showStoredSettings = () => {
  const settings = Settings.getSettings();
  delayInput.value = String(settings.delay);
  volumeInput.value = String(settings.volume);
  pageSizeInput.value = String(settings.pageSize);
  checkboxes.forEach(([input, key]) => {
    input.checked = settings[key];
  });
};

const toggleSettingsPanel = () => {
  settingsPanel
    .querySelectorAll("#lsSettingsPanel, #openSVG, #closeSVG")
    .forEach((element) => element.classList.toggle("pd2te-hidden"));
  settingsHeader.classList.toggle("opened");
};

const saveNumberInput = (input: HTMLInputElement, key: NumberSettingKey) => {
  const settings = Settings.getSettings(); // fresh read, don't overwrite other keys with a stale copy
  settings[key] = Settings.sanitize(key, input.value, settings[key]); // invalid -> keep previous
  input.value = String(settings[key]); // show the clamped value
  Settings.saveSettings(settings);
  announceSettingsChanged();
};

// Also for switches outside this panel (the Filters page has one for "Sort filters A-Z")
export const saveBooleanSetting = (key: BooleanSettingKey, value: boolean) => {
  const settings = Settings.getSettings(); // fresh read, don't overwrite other keys with a stale copy
  settings[key] = value;
  Settings.saveSettings(settings);
  announceSettingsChanged();
};

const saveCheckbox = (input: HTMLInputElement, key: BooleanSettingKey) => saveBooleanSetting(key, input.checked);

const updateTabTitle = (searchName: string) => {
  document.title = searchName.trim() || DEFAULT_TITLE;
  renderTabTitle(); // keep the "(N) " hit counter
};

// The feed starts empty; Recent Hits starts with it
export const clearRecentHits = () => {
  recentHits = [];
  renderRecentHits();
};

// Newest first; a listing alerted again (after a Stop/Start, a re-bump) moves to the top instead of repeating
export const addRecentHits = (hits: Hit[]) => {
  const time = clockTime();
  const ids = new Set(hits.map((hit) => hit.id));
  const kept = recentHits.filter((hit) => !ids.has(hit.id));
  recentHits = [...hits.map((hit) => ({ ...hit, time })), ...kept].slice(0, MAX_RECENT_HITS);
  renderRecentHits();
};

const renderRecentHits = () => {
  recentHitsList.replaceChildren(
    ...recentHits.map((hit) => {
      const label = `${hit.time} ${hit.name}${hit.price ? ` - ${hit.price}` : ""}`;
      // New tab keeps the market page (and its results) where it is; textContent keeps seller-provided text as text
      const link = Object.assign(document.createElement("a"), {
        href: listingPath(hit.id),
        target: "_blank",
        rel: "noopener",
        title: label,
        textContent: label,
      });
      const item = document.createElement("li");
      item.append(link);
      return item;
    })
  );
  recentHitsSection.classList.toggle("pd2te-hidden", recentHits.length === 0);
};

// --- Once, when the script loads ---
const setLimits = (input: HTMLInputElement, key: NumberSettingKey) => {
  const { min, max } = Settings.LIMITS[key];
  input.min = String(min);
  input.max = String(max);
};
setLimits(delayInput, "delay");
setLimits(volumeInput, "volume");
setLimits(pageSizeInput, "pageSize");

// Wrapped: logic imports this module too, so its exports are only read when a button is clicked
startButton.addEventListener("click", () => onStartButtonPress());
stopButton.addEventListener("click", () => onStopButtonPress());
settingsHeader.addEventListener("click", toggleSettingsPanel);
searchNameInput.addEventListener("input", () => updateTabTitle(searchNameInput.value)); // Tab renaming
// 'change' = on blur/Enter/spinner, so typing isn't rewritten mid-keystroke
delayInput.addEventListener("change", () => saveNumberInput(delayInput, "delay"));
pageSizeInput.addEventListener("change", () => saveNumberInput(pageSizeInput, "pageSize"));
// 'change' = on slider release, so the preview plays once
volumeInput.addEventListener("change", () => {
  saveNumberInput(volumeInput, "volume");
  playNewItemSound();
});
checkboxes.forEach(([input, key]) => input.addEventListener("change", () => saveCheckbox(input, key)));
clearHitsButton.addEventListener("click", () => {
  recentHits = [];
  renderRecentHits();
});
