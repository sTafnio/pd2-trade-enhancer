// Our filter column on /market. It replaces the site's panels with controls that can say everything the
// server accepts: several values per field, OR groups ("at least k of these mods"), exclusions, corruption
// outcomes, ranges on any number, any sort field, and a raw query for the rest. Everything is written into
// the site's own form object, so the site's Search, pagination, saved filters, ?filter= links and the
// livesearch all see the same query.
import { getMarketPage } from "../pd2/vue-bridge";
import { LIVESEARCH_CHANGED_EVENT, getWatchedFilters } from "../trade/api-livesearch";
import { SETTINGS_CHANGED_EVENT, clearTabName, setTabName } from "../trade/livesearch-ui";
import { isLivesearchRunning, stopLivesearch } from "../trade/logic";
import { Settings } from "../trade/settings";
import { clockTime, errorMessage, html, isMarketPath, stableStringify } from "../utils";
import { mountCardControls, refreshCards, unmountCardControls } from "./cards";
import { FilterController } from "./controller";
import type { SaveAction, SaveResult } from "./controller";
import { searchLink, takeLinkedSearch } from "./link";
import { cloneModel, compile } from "./model";
import { installPaging, uninstallPaging } from "./paging";
import type { FilterModel, ModCondition, ModGroup, Tri } from "./model";
import { CLASSES, QUALITIES, SORT_FIELDS, displayLabel, findUserByName, getSiteFilters, isSitePage, propertyLabel } from "./site";
import type { SavedFilter, Vocab } from "./site";
import { SOCKETED_CHECK_EVENT } from "./socketed-search";
import type { SocketedCheck } from "./socketed-search";
import { SUMS_CHECK_EVENT } from "./sum-search";
import type { SumsCheck } from "./sum-search";
import { SUM_SORT_FIELD, isSummable } from "./sums";
import type { SumSpec, SumTerm } from "./sums";
import {
  button,
  checkbox,
  combo,
  field,
  h,
  makeSection,
  multiPicker,
  numberInput,
  panel,
  picker,
  rangeInputs,
  row,
  selectInput,
  textInput,
  triSelect,
} from "./controls";
import type { Option, Section } from "./controls";

const LOG = "[pd2-trade-enhancer]";
const SOCKET_COUNTS = ["0", "1", "2", "3", "4", "5", "6"];

type Tone = "info" | "warn" | "error";

interface Ui {
  ctrl: FilterController;
  vocab: Vocab;
  propertyOptions: Option[]; // every property, by readable label
  modifierNames: Option[]; // properties that are plain modifier names (no "{fixed}" or "a|b" keys)
  // Change the model and write it into the form; `refresh` rebuilds the section afterwards
  change(mutate: (model: FilterModel) => void, refresh?: () => void): void;
  status(text: string, tone?: Tone): void;
}

let controller: FilterController | null = null;
let root: HTMLElement | null = null;
let toolbarRoot: HTMLElement | null = null; // Search/Clear on top of the column, above the livesearch controls
let statusLine: HTMLElement | null = null;
let liveNote: HTMLElement | null = null;
let socketNote: HTMLElement | null = null; // what the last search that ignores socketed items left out
let sumNote: HTMLElement | null = null; // how many listings the last search with sums found
let preview: HTMLElement | null = null;
let savedMarker: HTMLElement | null = null; // "unsaved changes" in the My Filters header

type OptionalModKey = Exclude<keyof ModCondition, "key" | "corrupted">;

const setOptional = (mod: ModCondition, key: OptionalModKey, value: number | undefined) => {
  if (value === undefined) delete mod[key];
  else mod[key] = value;
};

const triOfBool = (value: boolean | undefined): Tri => (value === undefined ? "any" : value ? "yes" : "no");

// Kept across re-renders: loading a filter re-renders the column right after saying so
let lastStatus: { text: string; tone: Tone } = { text: "", tone: "info" };

const setStatus = (text: string, tone: Tone = "info") => {
  lastStatus = { text, tone };
  if (!statusLine) return;
  statusLine.textContent = text;
  statusLine.dataset.tone = tone;
};
const boolOfTri = (value: Tri): boolean | undefined => (value === "any" ? undefined : value === "yes");

const updateSavedMarker = (ctrl: FilterController) => {
  savedMarker?.classList.toggle("pd2te-invisible", !ctrl.isModified());
};

export type MountOutcome = "mounted" | "disabled" | "failed";

// Mounted once per GameMarketFilters instance; tradeOnLoad calls this on every /market mount. The site's
// panels are only hidden once ours are fully built, so a failure leaves the site usable
export const mountFilterColumn = (): MountOutcome => {
  if (!Settings.getSettings().enhancedFilters) return "disabled";
  const column = document.getElementById("filters");
  const page = getMarketPage();
  const site = getSiteFilters(page);
  if (!column || !page || !site || !isSitePage(page)) return "failed";
  if (controller && controller.site === site && root?.isConnected) return "mounted";

  unmountFilterColumn();
  try {
    const ctrl = new FilterController(site, page);
    controller = ctrl;
    root = h("div", { class: "pd2te-filters pd2te-own" });
    toolbarRoot = h("div", { class: "pd2te-filters pd2te-own pd2te-toolbar-host" });
    ctrl.onModel = () => renderAll(ctrl); // later re-renders fall back on their own
    renderSections(ctrl); // the first build throws into the catch below
    column.prepend(toolbarRoot);
    column.append(root);
    column.classList.add("pd2te-replaced"); // hides the site's own panels around ours
    mountCardControls({
      vocab: ctrl.vocab,
      apply: (mutate) => {
        const result = ctrl.update(mutate);
        renderAll(ctrl);
        setStatus(result.ok ? "Added to the filters; press Search to run them" : result.error, result.ok ? "info" : "error");
      },
      openSearch: (mutate) => {
        const model = cloneModel(ctrl.current);
        mutate(model);
        window.open(searchLink(model), "_blank", "noopener");
      },
      ownStats: () => ctrl.current.ignoreSocketed,
      sums: () => activeSums(ctrl.current.sums),
    });
    installPaging(page);
    applyDisplaySettings(ctrl);
    void ctrl.loadAllSavedFilters().then(() => sortSavedIfWanted(ctrl));
    applyLinkedSearch(ctrl); // a card's new tab, or a link someone shared
    console.info(`${LOG} Filter column mounted: ${ctrl.vocab.properties.length} properties, ${ctrl.vocab.types.length} item types.`);
    return "mounted";
  } catch (error) {
    console.error(
      `${LOG} The filter column failed to build; the site's own panels stay. Turn "Enhanced filters" off in Settings to stop trying.`,
      error
    );
    unmountFilterColumn();
    return "failed";
  }
};

// Back to the site's panels. The form keeps what was searched last; the site's Clear Filters resets it
const unmountFilterColumn = () => {
  unmountCardControls();
  uninstallPaging();
  controller?.release();
  controller = null;
  root?.remove();
  root = null;
  toolbarRoot?.remove();
  toolbarRoot = null;
  statusLine = null;
  liveNote = null;
  socketNote = null;
  sumNote = null;
  preview = null;
  savedMarker = null;
  lastStatus = { text: "", tone: "info" };
  document.getElementById("filters")?.classList.remove("pd2te-replaced");
};

// A #pd2te= search in the URL hash: read at mount (a card's new tab, a shared link opened fresh) and on
// hashchange (a link clicked while /market is already open)
const applyLinkedSearch = (ctrl: FilterController) => {
  const linked = takeLinkedSearch();
  if (linked === null) return;
  if (linked === "invalid") {
    console.warn(`${LOG} The #pd2te= link in the URL couldn't be read; it was probably cut short when copied.`);
    setStatus("The shared search link couldn't be read (cut short when copied?)", "error");
    return;
  }
  stopLivesearchFor("a linked search was opened");
  const { model } = linked;
  // A shared link leaves the mode to whoever opens it: the one the site set up for this user
  if (linked.viewerMode && ctrl.current.hardcore !== undefined) model.hardcore = ctrl.current.hardcore;
  if (linked.viewerMode && ctrl.current.ladder !== undefined) model.ladder = ctrl.current.ladder;
  const result = ctrl.replaceModel(model, true);
  renderAll(ctrl);
  setStatus(result.ok ? `Searching the linked filters (${clockTime()})` : result.error, result.ok ? "info" : "error");
};

window.addEventListener("hashchange", () => {
  if (controller && root?.isConnected) applyLinkedSearch(controller);
});

// Keys the livesearch strips before comparing searches, so they never count as a difference
const VOLATILE_FORM_KEYS = ["updated_at"];

const comparableForm = (filters: Record<string, unknown>) => {
  const copy: Record<string, unknown> = JSON.parse(JSON.stringify(filters));
  VOLATILE_FORM_KEYS.forEach((key) => delete copy[key]);
  return stableStringify(copy);
};

// Shown while a livesearch runs on other filters than the column holds (edits without a Search)
const updateLiveNote = (ctrl: FilterController) => {
  if (!liveNote) return;
  const watched = getWatchedFilters();
  const differs = isLivesearchRunning() && watched !== null && comparableForm(watched) !== comparableForm(ctrl.site.filters);
  liveNote.classList.toggle("pd2te-hidden", !differs);
};

document.addEventListener(LIVESEARCH_CHANGED_EVENT, () => {
  if (controller) updateLiveNote(controller);
});

let lastSocketCheck: SocketedCheck | null = null;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// After a search that ignores socketed items: how many listings with something socketed it left out
const updateSocketNote = (ctrl: FilterController) => {
  if (!socketNote) return;
  const check = lastSocketCheck;
  const shown =
    ctrl.current.ignoreSocketed &&
    activeSums(ctrl.current.sums).length === 0 && // the sums' check covers it then
    check !== null &&
    (check.error !== undefined || check.checked > 0);
  socketNote.classList.toggle("pd2te-hidden", !shown);
  if (!shown) return;
  socketNote.dataset.tone = check.error === undefined ? "info" : "warn";
  socketNote.textContent =
    check.error !== undefined
      ? `Couldn't re-check the socketed listings (${check.error}): these results may include some that pass only with their jewels/runes`
      : check.excluded > 0
        ? `Left out ${check.excluded} of ${plural(check.checked, "socketed listing")}: they pass only with their jewels/runes`
        : `All ${plural(check.checked, "socketed listing")} pass on their own stats`;
};

document.addEventListener(SOCKETED_CHECK_EVENT, (event) => {
  lastSocketCheck = (event as CustomEvent<SocketedCheck>).detail;
  if (controller) updateSocketNote(controller);
});

// Sums with mods in them: the ones the search carries
const activeSums = (sums: SumSpec[]) => sums.filter((sum) => sum.terms.length > 0);

let lastSumsCheck: SumsCheck | null = null;

// After a search with sums: how many listings could reach them, and how many do
const updateSumNote = (ctrl: FilterController) => {
  if (!sumNote) return;
  const check = lastSumsCheck;
  const shown = activeSums(ctrl.current.sums).length > 0 && check !== null;
  sumNote.classList.toggle("pd2te-hidden", !shown);
  if (!shown) return;
  sumNote.dataset.tone = check.error === undefined ? "info" : "warn";
  sumNote.textContent =
    check.error !== undefined
      ? `Couldn't add up the sums, so nothing is shown: ${check.error}`
      : `${plural(check.matched, "listing")} of ${check.candidates} that could reach the sums do`;
};

document.addEventListener(SUMS_CHECK_EVENT, (event) => {
  lastSumsCheck = (event as CustomEvent<SumsCheck>).detail;
  if (controller) updateSumNote(controller);
});

// A Search, Clear or Load while the livesearch runs stops it: it never switches on its own
const stopLivesearchFor = (what: string) => {
  if (isLivesearchRunning()) stopLivesearch(`Stopped at ${clockTime()}: ${what}. Press Start to livesearch the current filters`);
};

// Compact cards and the query preview follow the Settings panel
const applyDisplaySettings = (ctrl: FilterController) => {
  const settings = Settings.getSettings();
  if (ctrl.site.compactMode !== settings.compactCards) ctrl.site.compactMode = settings.compactCards;
  updatePreview(ctrl);
};

// "Sort filters A-Z": filters added or dragged elsewhere go back in name order when the column opens
const sortSavedIfWanted = async (ctrl: FilterController) => {
  try {
    const moved = await ctrl.sortIfWanted();
    if (moved > 0 && controller === ctrl) setStatus(`Put ${moved} saved ${moved === 1 ? "filter" : "filters"} in name order`);
  } catch (error) {
    if (controller === ctrl) setStatus(`Sorting the saved filters failed: ${errorMessage(error)}`, "error");
  }
};

let autoSortWas = Settings.getSettings().autoSortFilters;

// A setting was flipped in the Settings panel: apply it without a reload
const applyFilterColumnSetting = () => {
  const settings = Settings.getSettings();
  if (!settings.enhancedFilters) unmountFilterColumn();
  else if (isMarketPath()) mountFilterColumn();
  if (controller) applyDisplaySettings(controller);
  const sortTurnedOn = settings.autoSortFilters && !autoSortWas;
  autoSortWas = settings.autoSortFilters;
  if (sortTurnedOn && controller && isMarketPath()) void sortSavedIfWanted(controller);
};

document.addEventListener(SETTINGS_CHANGED_EVENT, applyFilterColumnSetting);

const renderAll = (ctrl: FilterController) => {
  if (!root) return;
  try {
    renderSections(ctrl);
  } catch (error) {
    // A render that throws would leave the site's panels hidden behind a broken column
    console.error(`${LOG} The filter column failed to render; showing the site's own panels.`, error);
    unmountFilterColumn();
  }
};

const renderSections = (ctrl: FilterController) => {
  if (!root || !toolbarRoot) return;
  const { vocab } = ctrl;
  const propertyOptions = vocab.properties.map((option) => ({ value: option.key, label: displayLabel(option.label) }));
  const ui: Ui = {
    ctrl,
    vocab,
    propertyOptions,
    modifierNames: propertyOptions.filter((option) => !option.value.includes("{") && !option.value.includes("|")),
    change: (mutate, refresh) => {
      const result = ctrl.update(mutate);
      if (!result.ok) ui.status(result.error, "error");
      else if (statusLine?.dataset.tone === "error") ui.status("");
      updatePreview(ctrl);
      updateLiveNote(ctrl);
      updateSocketNote(ctrl);
      updateSumNote(ctrl);
      updateSavedMarker(ctrl);
      refreshCards();
      refresh?.();
    },
    status: setStatus,
  };

  const saved = savedFiltersSection(ui);
  ctrl.onSavedFilters = () => saved.refresh();
  toolbarRoot.replaceChildren(toolbarSection(ui).el);
  root.replaceChildren(
    saved.el,
    itemSection(ui).el,
    modsSection(ui).el,
    groupsSection(ui).el,
    sumsSection(ui).el,
    corruptionSection(ui).el,
    requirementsSection(ui).el,
    sellerSection(ui).el,
    sortSection(ui).el,
    advancedSection(ui).el,
    modeSection(ui).el
  );
  updatePreview(ctrl);
  updateLiveNote(ctrl);
};

// The query our model compiles to, as the site's form will carry it (the page adds type, paging and $resolve)
const updatePreview = (ctrl: FilterController) => {
  if (!preview) return;
  const show = Settings.getSettings().showQuery;
  preview.classList.toggle("pd2te-hidden", !show);
  if (!show) return;
  const result = compile(ctrl.current);
  if (!result.ok) {
    preview.textContent = result.error;
    return;
  }
  const query: Record<string, unknown> = { ...result.value.form };
  delete query.properties;
  const { sort } = ctrl.current;
  const branches = result.value.branches > 0 ? `\n// ${result.value.branches} OR branches` : "";
  preview.textContent = JSON.stringify({ ...query, $sort: { [sort.field]: sort.direction } }, null, 1) + branches;
};

// Heroicons' "link", like the site's own icons
const LINK_ICON = /*html*/ `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`;

// The column's search as a link to share. Anyone with the script who opens it gets this search, in their own mode
const copySearchLink = async (ui: Ui) => {
  const url = searchLink(ui.ctrl.current, false);
  try {
    await navigator.clipboard.writeText(url);
    ui.status("Link copied. It opens in the viewer's own Hardcore/Ladder mode");
  } catch {
    window.prompt("Copy this link:", url); // the clipboard is blocked: copy it from here
  }
};

const toolbarSection = (ui: Ui): Section =>
  makeSection(() => {
    const search = h("button", { type: "button", class: "ls-btn pd2te-gold-btn", text: "Search" });
    search.addEventListener("click", () => {
      stopLivesearchFor("you searched other filters");
      const result = ui.ctrl.search();
      if (!result.ok) {
        ui.status(result.error, "error");
        return;
      }
      const branches = result.value.branches > 0 ? `, ${result.value.branches} OR branches` : "";
      ui.status(`Searched at ${clockTime()}${branches}`);
    });
    const clear = h("button", { type: "button", class: "ls-btn stop-btn", text: "Clear" });
    clear.addEventListener("click", () => {
      stopLivesearchFor("the filters were cleared");
      ui.ctrl.clear().then(
        () => {
          clearTabName();
          ui.status("Filters cleared");
        },
        (error: unknown) => ui.status(`Clear failed: ${errorMessage(error)}`, "error")
      );
    });
    const share = h("button", {
      type: "button",
      class: "ls-btn pd2te-link-btn",
      title: "Copy a link to this search",
      "aria-label": "Copy a link to this search",
    });
    share.append(html(LINK_ICON));
    share.addEventListener("click", () => void copySearchLink(ui));

    statusLine = h("div", { class: "ls-status pd2te-holds-line" }); // empty: keeps its line, nothing jumps
    setStatus(lastStatus.text, lastStatus.tone);
    liveNote = h("div", {
      class: "ls-status pd2te-live-note pd2te-hidden",
      text: "Livesearch is watching your last search, not these edits. Search stops it; then press Start again.",
    });
    liveNote.dataset.tone = "warn";
    socketNote = h("div", { class: "ls-status pd2te-hidden" });
    updateSocketNote(ui.ctrl);
    sumNote = h("div", { class: "ls-status pd2te-hidden" });
    updateSumNote(ui.ctrl);
    preview = h("pre", { class: "pd2te-preview pd2te-hidden" });
    return h("div", { class: "pd2te-toolbar" }, row(search, clear, share), statusLine, socketNote, sumNote, liveNote, preview);
  });

// What Save does with the typed name, in words
const describeSave = (action: SaveAction, loaded: SavedFilter | null, searched: boolean): string => {
  if (action.kind === "invalid") return loaded || !searched ? "" : "Type a name";
  if (action.kind === "create") return `Save creates "${action.name}"`;
  if (action.target._id !== loaded?._id) return `Save overwrites the other filter "${action.target.name}"`;
  if (action.name !== action.target.name) return `Save overwrites "${action.target.name}" and renames it "${action.name}"`;
  return `Save overwrites "${action.name}"`;
};

// Find and load a saved filter by typing; save over the loaded one (renaming it on the way) or as a new one
const savedFiltersSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const { ctrl } = ui;
    const list = ctrl.savedFilters();
    const loaded = ctrl.loadedFilter();

    const chooser = combo(
      list.map((filter) => ({ value: filter._id, label: filter.name })),
      loaded?._id ?? "",
      list.length > 0 ? `Load filter (${list.length})` : "No saved filters yet",
      (id) => {
        const saved = list.find((filter) => filter._id === id);
        if (!saved) return;
        stopLivesearchFor("a saved filter was loaded");
        ctrl.load(saved._id);
        setTabName(saved.name);
        ui.status(`Loaded "${saved.name}"`);
      }
    );
    chooser.title = "Type to find a saved filter; Enter or a click loads and searches it";

    const remove = button(
      "Delete",
      () => {
        const target = ctrl.loadedFilter();
        if (!target || !confirm(`Delete the saved filter "${target.name}"?`)) return;
        ctrl.remove(target._id).then(
          () => {
            ui.status(`Deleted "${target.name}"`);
            refresh();
          },
          (error: unknown) => ui.status(`Delete failed: ${errorMessage(error)}`, "error")
        );
      },
      "pd2te-btn-danger"
    );
    remove.disabled = !loaded;
    remove.title = loaded ? `Delete "${loaded.name}"` : "Load a saved filter to delete it";

    const nameInput = textInput(loaded?.name ?? "", "Name", () => {}, 30);
    const hint = h("div", { class: "pd2te-hint pd2te-holds-line" }); // empty: keeps its line, nothing jumps
    const describe = () => {
      hint.textContent = describeSave(ctrl.saveAction(nameInput.value), ctrl.loadedFilter(), ctrl.hasSearched());
    };
    nameInput.addEventListener("input", describe);
    ctrl.onSearched = describe;

    let busy = false;
    const run = (task: () => Promise<SaveResult>) => {
      if (busy) return;
      busy = true;
      save.disabled = true;
      saveNew.disabled = true;
      task().then(
        ({ saved, note }) => {
          setTabName(saved.name);
          ui.status(`Saved "${saved.name}" at ${clockTime()}${note ? `, but ${note}` : ""}`, note ? "warn" : "info");
          refresh();
        },
        (error: unknown) => {
          busy = false;
          save.disabled = false;
          saveNew.disabled = false;
          ui.status(`Save failed: ${errorMessage(error)}`, "error");
        }
      );
    };
    const save = button("Save", () => {
      const action = ctrl.saveAction(nameInput.value);
      if (action.kind === "invalid") {
        ui.status(action.message, "warn");
        return;
      }
      const other = action.kind === "overwrite" && action.target._id !== ctrl.loadedFilter()?._id;
      if (other && !confirm(`Overwrite the saved filter "${action.target.name}" with these filters?`)) return;
      run(() => ctrl.save(nameInput.value));
    });
    save.title = "Overwrites the loaded filter (renamed, if you changed the name), or creates one when none is loaded";
    const saveNew = button("Save as new", () => {
      const name = nameInput.value.trim();
      const taken = name === "" ? null : ctrl.findByName(name);
      if (name === "" || taken) {
        ui.status(taken ? `"${taken.name}" already exists: give the new filter another name` : "Give the new filter a name first", "warn");
        return;
      }
      run(() => ctrl.saveAsNew(name));
    });
    saveNew.title = "Saves these filters as a new saved filter under this name";
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") save.click();
    });
    describe();

    savedMarker = h("span", {
      class: "pd2te-unsaved pd2te-invisible",
      text: "unsaved changes",
      title: "The filters differ from the loaded saved filter",
    });
    updateSavedMarker(ctrl);
    const body = h("div", {}, row(chooser, remove), row(nameInput, save, saveNew), hint);
    return panel("saved", "My Filters", body, true, savedMarker);
  });

const modeSection = (ui: Ui): Section =>
  makeSection(() => {
    const model = ui.ctrl.current;
    const body = h(
      "div",
      { class: "pd2te-grid2" },
      field(
        "Mode",
        triSelect(triOfBool(model.hardcore), ["Any", "Hardcore", "Softcore"], (value) =>
          ui.change((m) => {
            m.hardcore = boolOfTri(value);
          })
        )
      ),
      field(
        "Ladder",
        triSelect(triOfBool(model.ladder), ["Any", "Ladder", "Non-ladder"], (value) =>
          ui.change((m) => {
            m.ladder = boolOfTri(value);
          })
        )
      ),
      button("Save as default", () => {
        void ui.ctrl.site.updatePreferences().then(
          () => ui.status("Mode saved as your default"),
          (error: unknown) => ui.status(`Could not save the default: ${errorMessage(error)}`, "error")
        );
      })
    );
    return panel("mode", "Mode", body, false);
  });

const itemSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const { vocab } = ui;
    const typeOptions = vocab.types.map((type) => ({ value: type.code, label: type.display }));
    const bases = model.types.length > 0 ? vocab.bases.filter((base) => model.types.includes(base.typeCode)) : vocab.bases;
    const baseOptions = bases.map((base) => ({ value: base.code, label: base.display }));

    const body = h(
      "div",
      {},
      field(
        "Name",
        multiPicker({
          options: vocab.names.map((name) => ({ value: name, label: name })),
          selected: model.names,
          placeholder: "Exact name",
          onChange: (names) =>
            ui.change((m) => {
              m.names = names;
            }, refresh),
        }),
        textInput(model.nameContains, "Contains", (value) =>
          ui.change((m) => {
            m.nameContains = value;
          })
        )
      ),
      field(
        "Price text",
        h(
          "div",
          { class: "pd2te-grid2" },
          textInput(model.price, "Include", (value) =>
            ui.change((m) => {
              m.price = value;
            })
          ),
          textInput(model.priceExclude, "Exclude", (value) =>
            ui.change((m) => {
              m.priceExclude = value;
            })
          )
        )
      ),
      field(
        "Price (HR)",
        rangeInputs(model.hrPrice, (range) =>
          ui.change((m) => {
            m.hrPrice = range;
          })
        )
      ),
      field(
        "Type",
        multiPicker({
          options: typeOptions,
          selected: model.types,
          placeholder: "Add a type",
          onChange: (types) =>
            ui.change((m) => {
              m.types = types;
            }, refresh),
        })
      ),
      field(
        "Base",
        multiPicker({
          options: baseOptions,
          selected: model.bases,
          placeholder: model.types.length > 0 ? "Add a base of those types" : "Add a base",
          onChange: (selected) =>
            ui.change((m) => {
              m.bases = selected;
            }, refresh),
        })
      ),
      field(
        "Rarity",
        multiPicker({
          options: QUALITIES.map((quality) => ({ value: quality, label: quality })),
          selected: model.qualities,
          placeholder: "",
          inline: true,
          onChange: (qualities) =>
            ui.change((m) => {
              m.qualities = qualities;
            }),
        })
      ),
      h(
        "div",
        { class: "pd2te-grid2" },
        field(
          "Ethereal",
          triSelect(model.ethereal, ["Any", "Yes", "No"], (value) =>
            ui.change((m) => {
              m.ethereal = value;
            })
          )
        ),
        field(
          "Corrupted",
          triSelect(model.corrupted, ["Any", "Yes", "No"], (value) =>
            ui.change((m) => {
              m.corrupted = value;
            })
          )
        ),
        field(
          "Desecrated",
          triSelect(model.desecrated, ["Any", "Yes", "No"], (value) =>
            ui.change((m) => {
              m.desecrated = value;
            })
          )
        ),
        field(
          "Identified",
          triSelect(model.identified, ["Any", "Yes", "No"], (value) =>
            ui.change((m) => {
              m.identified = value;
            })
          )
        )
      ),
      field(
        "Sockets (any of)",
        multiPicker({
          options: SOCKET_COUNTS.map((count) => ({ value: count, label: count })),
          selected: model.socketValues.map(String),
          placeholder: "",
          inline: true,
          columns: 7,
          onChange: (counts) =>
            ui.change((m) => {
              m.socketValues = counts.map(Number);
            }),
        }),
        rangeInputs(model.socketRange, (range) =>
          ui.change((m) => {
            m.socketRange = range;
          })
        )
      ),
      h(
        "div",
        { class: "pd2te-grid2" },
        field(
          "Item level",
          rangeInputs(model.itemLevel, (range) =>
            ui.change((m) => {
              m.itemLevel = range;
            })
          )
        ),
        field(
          "Defense",
          rangeInputs(model.defense, (range) =>
            ui.change((m) => {
              m.defense = range;
            })
          )
        )
      )
    );
    return panel("item", "Item", body, true);
  });

// One mod with its value inputs; skill procs get a skill picker and level range, item_aura an aura picker
const modRow = (ui: Ui, mod: ModCondition, onRemove: () => void) => {
  const { vocab } = ui;
  const parts: HTMLElement[] = [
    h(
      "div",
      { class: "pd2te-mod-head" },
      h("span", { class: "pd2te-mod-name", text: propertyLabel(vocab, mod.key), title: mod.key }),
      button("×", onRemove, "pd2te-btn-small pd2te-btn-danger")
    ),
  ];
  let valueLabels: [string, string] = ["Min", "Max"];
  if (vocab.skillProperties.has(mod.key)) {
    parts.push(
      selectInput(
        [{ value: "", label: "Any skill" }, ...vocab.skills.map((skill) => ({ value: String(skill.value), label: skill.label }))],
        mod.skill === undefined ? "" : String(mod.skill),
        (value) => ui.change(() => setOptional(mod, "skill", value === "" ? undefined : Number(value)))
      ),
      rangeInputs(
        { min: mod.skillLevelMin, max: mod.skillLevelMax },
        (range) =>
          ui.change(() => {
            setOptional(mod, "skillLevelMin", range.min);
            setOptional(mod, "skillLevelMax", range.max);
          }),
        ["Level min", "Level max"]
      )
    );
    valueLabels = ["Chance min", "Chance max"];
  }
  if (mod.key === "item_aura") {
    parts.push(
      selectInput(
        [{ value: "", label: "Any aura" }, ...vocab.auras.map((aura) => ({ value: String(aura.value), label: aura.label }))],
        mod.aura === undefined ? "" : String(mod.aura),
        (value) => ui.change(() => setOptional(mod, "aura", value === "" ? undefined : Number(value)))
      )
    );
    valueLabels = ["Level min", "Level max"];
  }
  parts.push(
    rangeInputs(
      { min: mod.min, max: mod.max },
      (range) =>
        ui.change(() => {
          setOptional(mod, "min", range.min);
          setOptional(mod, "max", range.max);
        }),
      valueLabels
    )
  );
  return h("div", { class: "pd2te-mod" }, ...parts);
};

const modsSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const body = h(
      "div",
      {},
      checkbox(
        "Ignore socketed jewels/runes",
        model.ignoreSocketed,
        (checked) =>
          ui.change((m) => {
            m.ignoreSocketed = checked;
          }),
        "Mod values count the item's own stats only: 350% ED plus two 40% ED jewels no longer passes 400% ED. " +
          "For Mods, Mod groups and corrupted mods; a minimum is exact, a maximum still counts what's socketed. " +
          "Runewords keep their runes. The livesearch checks it too"
      ),
      field(
        "Must have",
        picker(ui.propertyOptions, "Add a mod", (key) =>
          ui.change((m) => {
            m.mods.push({ key });
          }, refresh)
        ),
        ...model.mods.map((mod, index) =>
          modRow(ui, mod, () =>
            ui.change((m) => {
              m.mods.splice(index, 1);
            }, refresh)
          )
        )
      ),
      field(
        "Must not have",
        multiPicker({
          options: ui.modifierNames,
          selected: model.excludeMods,
          placeholder: "Add a mod to exclude",
          onChange: (excluded) =>
            ui.change((m) => {
              m.excludeMods = excluded;
            }, refresh),
        })
      )
    );
    return panel("mods", "Mods", body, true);
  });

const groupBox = (ui: Ui, group: ModGroup, index: number, refresh: () => void) => {
  const count = group.mods.length;
  const atLeastOptions = Array.from({ length: Math.max(1, count) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const head = h(
    "div",
    { class: "pd2te-group-head" },
    h("span", { text: "At least" }),
    selectInput(atLeastOptions, String(Math.min(Math.max(1, group.atLeast), Math.max(1, count))), (value) =>
      ui.change(() => {
        group.atLeast = Number(value);
      })
    ),
    h("span", { text: count === 1 ? "of this mod" : `of these ${count} mods` }),
    h("span", { class: "pd2te-spacer" }),
    button(
      "Remove group",
      () =>
        ui.change((m) => {
          m.groups.splice(index, 1);
        }, refresh),
      "pd2te-btn-small pd2te-btn-danger"
    )
  );
  return h(
    "div",
    { class: "pd2te-group" },
    head,
    picker(ui.propertyOptions, "Add a mod to this group", (key) =>
      ui.change(() => {
        group.mods.push({ key });
      }, refresh)
    ),
    ...group.mods.map((mod, modIndex) =>
      modRow(ui, mod, () =>
        ui.change(() => {
          group.mods.splice(modIndex, 1);
        }, refresh)
      )
    )
  );
};

const groupsSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const body = h(
      "div",
      {},
      ...model.groups.map((group, index) => groupBox(ui, group, index, refresh)),
      button("Add group", () =>
        ui.change((m) => {
          m.groups.push({ atLeast: 1, mods: [] });
        }, refresh)
      )
    );
    return panel("groups", "Mod groups (OR)", body, true);
  });

// One mod of a sum, with its weight
const sumTermRow = (ui: Ui, term: SumTerm, onRemove: () => void) => {
  const weight = numberInput(term.weight, "Weight", (value) => {
    if (value === undefined) {
      weight.value = String(term.weight); // a term always has a weight
      return;
    }
    ui.change(() => {
      term.weight = value;
    });
  });
  weight.step = "any";
  weight.classList.add("pd2te-sum-weight");
  weight.title = "Each point of this mod counts this much (3, 0.5, -1...)";
  return h(
    "div",
    { class: "pd2te-sum-term" },
    h("span", { class: "pd2te-mod-name", text: propertyLabel(ui.vocab, term.key), title: term.key }),
    h("span", { class: "pd2te-sum-times", text: "×" }),
    weight,
    button("×", onRemove, "pd2te-btn-small pd2te-btn-danger")
  );
};

// `terms`: the properties a sum can count
const sumBox = (ui: Ui, sum: SumSpec, index: number, refresh: () => void, terms: Option[]) => {
  const total = rangeInputs(
    { min: sum.min, max: sum.max },
    (range) =>
      ui.change(() => {
        if (range.min === undefined) delete sum.min;
        else sum.min = range.min;
        if (range.max === undefined) delete sum.max;
        else sum.max = range.max;
      }),
    ["Min", "Max"]
  );
  total.classList.add("pd2te-sum-total");
  const head = h(
    "div",
    { class: "pd2te-group-head" },
    h("span", { text: "Total" }),
    total,
    button(
      "Remove sum",
      () =>
        ui.change((m) => {
          m.sums.splice(index, 1);
        }, refresh),
      "pd2te-btn-small pd2te-btn-danger"
    )
  );
  return h(
    "div",
    { class: "pd2te-group" },
    head,
    picker(terms, "Add mod", (key) =>
      ui.change(() => {
        if (!sum.terms.some((term) => term.key === key)) sum.terms.push({ key, weight: 1 });
      }, refresh)
    ),
    ...sum.terms.map((term, termIndex) =>
      sumTermRow(ui, term, () =>
        ui.change(() => {
          sum.terms.splice(termIndex, 1);
        }, refresh)
      )
    )
  );
};

const sumsSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const terms = ui.propertyOptions.filter((option) => isSummable(option.value));
    const body = h(
      "div",
      {},
      ...model.sums.map((sum, index) => sumBox(ui, sum, index, refresh, terms)),
      button("Add sum", () =>
        ui.change((m) => {
          m.sums.push({ terms: [] });
        }, refresh)
      )
    );
    return panel("sums", "Weighted Sums", body, true);
  });

const corruptionSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const outcomes = model.corruptionOutcomes;
    // Always in the layout (invisible until a second corrupted mod makes it mean something), so nothing jumps.
    // An item has one corruption, which can roll several mods: 2 of 3 picks a specific multi-mod outcome
    const need = h(
      "div",
      { class: `pd2te-group-head${outcomes.length > 1 ? "" : " pd2te-invisible"}` },
      h("span", { text: "At least" }),
      selectInput(
        Array.from({ length: Math.max(1, outcomes.length) }, (_, index) => ({ value: String(index + 1), label: String(index + 1) })),
        String(Math.min(Math.max(1, model.corruptionAtLeast), Math.max(1, outcomes.length))),
        (value) =>
          ui.change((m) => {
            m.corruptionAtLeast = Number(value);
          })
      ),
      h("span", { text: `of these ${outcomes.length} mods` })
    );
    need.title = "Counted over what the corruption and the desecration (the second corruption) rolled";
    const add = picker(ui.modifierNames, "Add a corrupted mod", (key) =>
      ui.change((m) => {
        if (!m.corruptionOutcomes.some((outcome) => outcome.key === key)) m.corruptionOutcomes.push({ key });
      }, refresh)
    );
    add.title = "A mod the item's corruption or its desecration (the second corruption) rolled";
    const body = h(
      "div",
      {},
      add,
      ...outcomes.map((outcome, index) =>
        modRow(ui, outcome, () =>
          ui.change((m) => {
            m.corruptionOutcomes.splice(index, 1);
          }, refresh)
        )
      ),
      need
    );
    return panel("corruption", "Corruption", body, false);
  });

const sellerSection = (ui: Ui): Section =>
  makeSection((refresh) => {
    const model = ui.ctrl.current;
    const nameInput = textInput("", "Site username or game account", () => {}, 40);
    const setSeller = () => {
      const name = nameInput.value.trim();
      if (name === "") return;
      ui.status(`Looking up ${name}...`);
      findUserByName(name).then(
        (user) => {
          if (!user) {
            ui.status(`No site user or game account named ${name}`, "warn");
            return;
          }
          ui.change((m) => {
            m.seller = user.username ? { id: user._id, name: user.username } : { id: user._id };
          }, refresh);
          ui.status(`Seller set to ${user.username ?? user._id}; press Search`);
        },
        (error: unknown) => ui.status(`Lookup failed: ${errorMessage(error)}`, "error")
      );
    };
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") setSeller();
    });
    const seller = model.seller
      ? row(
          h("span", { class: "pd2te-mod-name", text: `Seller: ${model.seller.name ?? model.seller.id}`, title: model.seller.id }),
          button(
            "×",
            () =>
              ui.change((m) => {
                delete m.seller;
              }, refresh),
            "pd2te-btn-small pd2te-btn-danger"
          )
        )
      : row(nameInput, button("Set", setSeller));
    const body = h(
      "div",
      {},
      field("Seller", seller),
      h(
        "div",
        { class: "pd2te-grid2" },
        field(
          "Seller on the site",
          triSelect(model.online, ["Any", "Online", "Offline"], (value) =>
            ui.change((m) => {
              m.online = value;
            })
          )
        ),
        field(
          "Seller in game",
          triSelect(model.inGame, ["Any", "In game", "Not in game"], (value) =>
            ui.change((m) => {
              m.inGame = value;
            })
          )
        )
      ),
      checkbox(
        "Include listings older than 3 days",
        model.includeStale,
        (checked) =>
          ui.change((m) => {
            m.includeStale = checked;
          }),
        "Off: only listings created, bumped or edited in the last 3 days, which is all the site itself ever shows"
      )
    );
    return panel("seller", "Seller & listing", body, false);
  });

const requirementsSection = (ui: Ui): Section =>
  makeSection(() => {
    const model = ui.ctrl.current;
    const body = h(
      "div",
      {},
      field(
        "Class",
        multiPicker({
          options: CLASSES,
          selected: model.classes,
          placeholder: "",
          inline: true,
          onChange: (classes) =>
            ui.change((m) => {
              m.classes = classes;
            }),
        })
      ),
      field(
        "Level",
        rangeInputs(model.level, (range) =>
          ui.change((m) => {
            m.level = range;
          })
        )
      ),
      h(
        "div",
        { class: "pd2te-grid2" },
        field(
          "Strength",
          rangeInputs(model.strength, (range) =>
            ui.change((m) => {
              m.strength = range;
            })
          )
        ),
        field(
          "Dexterity",
          rangeInputs(model.dexterity, (range) =>
            ui.change((m) => {
              m.dexterity = range;
            })
          )
        )
      )
    );
    return panel("requirements", "Requirements", body, false);
  });

const sortSection = (ui: Ui): Section =>
  makeSection(() => {
    const model = ui.ctrl.current;
    const fields = [...SORT_FIELDS, { value: SUM_SORT_FIELD, label: "Sum (the first one, see Weighted Sums)" }];
    const options = fields.some((option) => option.value === model.sort.field)
      ? fields
      : [...fields, { value: model.sort.field, label: model.sort.field }]; // a field set by a loaded filter
    const body = h(
      "div",
      { class: "pd2te-grid2" },
      field(
        "Sort by",
        selectInput(options, model.sort.field, (value) =>
          ui.change((m) => {
            m.sort.field = value;
          })
        )
      ),
      field(
        "Order",
        selectInput(
          [
            { value: "-1", label: "Descending" },
            { value: "1", label: "Ascending" },
          ],
          String(model.sort.direction),
          (value) =>
            ui.change((m) => {
              m.sort.direction = value === "1" ? 1 : -1;
            })
        )
      )
    );
    return panel("sort", "Sort", body, false);
  });

const advancedSection = (ui: Ui): Section =>
  makeSection(() => {
    const model = ui.ctrl.current;
    const textarea = h("textarea", { class: "pd2te-input", placeholder: '{ "item.durability.current": { "$gte": 10 } }', spellcheck: "false" });
    textarea.value = model.custom;
    textarea.addEventListener("change", () =>
      ui.change((m) => {
        m.custom = textarea.value;
      })
    );
    const body = h(
      "div",
      {},
      h("div", {
        class: "pd2te-hint",
        text: "A JSON object of query keys merged into the search. A $or here becomes another OR group. Anything a loaded filter has that the panels can't show ends up here.",
      }),
      textarea
    );
    return panel("advanced", "Custom query", body, model.custom.trim() !== "");
  });
