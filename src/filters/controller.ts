// Keeps our model and the site's form object in step. Our controls change the model, which is compiled
// into the form (and searched through the site's own search()); when the site changes the form itself
// (a saved filter loaded from a ?filter= link, Clear Filters, the login-time mode preferences, a livesearch
// restore), the form is parsed back into a model and the column re-renders.
import { isObject, watchState } from "../pd2/vue-bridge";
import type { Unwatch } from "../pd2/vue-bridge";
import { Settings } from "../trade/settings";
import { errorMessage, stableStringify } from "../utils";
import { DEFAULT_SORT, cloneModel, compile, parse, sanitizeModel } from "./model";
import type { CompileResult, FilterModel, SortSpec } from "./model";
import { addLocalFilters, readLocalFilters, removeLocalFilter, storeLocalFilter } from "./local-filters";
import { keyForNew, planSort, sortSavedFilters } from "./saved-order";
import { fetchAllSavedFilters, getFilterService, readVocab, requireFilterService } from "./site";
import type { SavedFilter, SiteFilters, SitePage, Vocab } from "./site";

const LOG = "[pd2-trade-enhancer]";
const METADATA_VERSION = 1;

// Stored next to `filters` in the saved-filter documents (the server keeps extra top-level fields): the model
// as the user built it, so k-of-n groups and the sort (which the site doesn't save) come back exactly
interface Metadata {
  v: number;
  model: FilterModel;
}

const metadataOf = (saved: SavedFilter): FilterModel | null => {
  const meta = saved.pd2te;
  if (!isObject(meta) || meta.v !== METADATA_VERSION) return null;
  return sanitizeModel(meta.model);
};

const isLocal = () => Settings.getSettings().localFilters;

const snapshot = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const sortOf = (sort: { field?: string; direction?: number | string }): SortSpec => ({
  field: typeof sort.field === "string" && sort.field !== "" ? sort.field : "bumped_at",
  direction: Number(sort.direction) === 1 ? 1 : -1,
});

// What a model searches for, as one string: the compiled form, with the "recent only" window (a moving date)
// as the flag it comes from, plus the sort
const comparable = (model: FilterModel): string => {
  const result = compile(model);
  if (!result.ok) return `invalid: ${result.error}`;
  return stableStringify({ form: { ...result.value.form, updated_at: model.includeStale }, sort: model.sort });
};

export type SaveAction =
  | { kind: "invalid"; message: string }
  | { kind: "create"; name: string }
  | { kind: "overwrite"; target: SavedFilter; name: string }; // `name` differs from the target's: a rename

export interface SaveResult {
  saved: SavedFilter;
  note?: string; // saved, but something around it went wrong
}

export class FilterController {
  readonly site: SiteFilters;
  readonly page: SitePage;
  readonly vocab: Vocab;
  onModel: (() => void) | null = null; // the model was replaced from outside: render everything
  onSavedFilters: (() => void) | null = null; // the list or the loaded filter changed
  onSearched: (() => void) | null = null; // the page ran its first search
  private model: FilterModel;
  private applying = false;
  private renderQueued = false;
  private released = false;
  private siteLoaded = false; // see searchIfSiteLoaded
  private knownCount = 0; // filters on the server as of our last full load
  private readonly unwatch: Unwatch[] = [];
  private localLoadedId: string | null = null; // the loaded local filter ("Local filters" setting)

  constructor(site: SiteFilters, page: SitePage) {
    this.site = site;
    this.page = page;
    this.vocab = readVocab(site);
    this.model = this.readModel();
    this.searchIfSiteLoaded();
    // sync: fires during the site's own writes, while ours are flagged by `applying`
    this.unwatch.push(
      watchState(site, "filters", () => this.external(), { deep: true, flush: "sync" }),
      watchState(site, "sort", () => this.external(), { deep: true, flush: "sync" }),
      watchState(page, "savedFilters", () => this.savedFiltersChanged(), { deep: true }),
      watchState(site, "selectedFilterId", () => this.onSavedFilters?.()),
      watchState(page, "noFilters", () => this.onSearched?.())
    );
  }

  get current(): FilterModel {
    return this.model;
  }

  // In the server's order: the site asks for them sorted by their `order` key, and so do we
  savedFilters(): SavedFilter[] {
    return isLocal() ? readLocalFilters() : [...this.page.savedFilters];
  }

  // The saved filters in the user's account, for copying them into local ones
  serverFilters(): SavedFilter[] {
    return [...this.page.savedFilters];
  }

  // The saved filter the column holds: loaded, saved or opened from a ?filter= link last. Clear unsets it
  loadedFilter(): SavedFilter | null {
    if (isLocal()) return (this.localLoadedId && readLocalFilters().find((filter) => filter._id === this.localLoadedId)) || null;
    const id = this.site.selectedFilterId;
    return (id && this.page.savedFilters.find((filter) => filter._id === id)) || null;
  }

  // The column's filters differ from what the loaded saved filter holds. A filter without our metadata was
  // saved by the site, without a sort: it loads with the default one
  isModified(): boolean {
    const saved = this.loadedFilter();
    if (!saved) return false;
    return comparable(this.model) !== comparable(metadataOf(saved) ?? this.siteSavedModel(saved));
  }

  // The page searched at least once (it shows "Search to see results" until then)
  hasSearched(): boolean {
    return !this.page.noFilters;
  }

  findByName(name: string, exceptId?: string): SavedFilter | null {
    const lower = name.trim().toLowerCase();
    return this.savedFilters().find((filter) => filter._id !== exceptId && filter.name.toLowerCase() === lower) ?? null;
  }

  // What Save does with this name: overwrite a filter that already has it, else overwrite (and rename) the
  // loaded one, else create one
  saveAction(rawName: string): SaveAction {
    const name = rawName.trim();
    if (name === "") return { kind: "invalid", message: "Give the filter a name first" };
    const loaded = this.loadedFilter();
    const other = this.findByName(name, loaded?._id);
    if (other) return { kind: "overwrite", target: other, name: other.name };
    if (loaded) return { kind: "overwrite", target: loaded, name };
    return { kind: "create", name };
  }

  // Change the model and write it into the form (no search: that's the Search button)
  update(mutate: (model: FilterModel) => void): CompileResult {
    mutate(this.model);
    return this.apply(false);
  }

  apply(search: boolean): CompileResult {
    const result = compile(this.model);
    if (!result.ok) return result;
    this.write(result.value.form, this.model.sort);
    if (search) this.site.search();
    return result;
  }

  search(): CompileResult {
    return this.apply(true);
  }

  // A whole model from outside (a search link): written to the form, optionally searched
  replaceModel(model: FilterModel, search: boolean): CompileResult {
    this.model = model;
    return this.apply(search);
  }

  // The site's own Clear: keeps is_hardcore/is_ladder, drops the rest and the loaded filter; the watcher re-parses
  async clear() {
    this.localLoadedId = null;
    await this.site.clearFilters();
  }

  // Loads and searches a saved filter, sort included, through our model: the search is what the column shows
  // (a filter the site saved has no `updated_at`, so the site's own Load searches the last 3 days only)
  load(id: string) {
    const saved = this.savedFilters().find((filter) => filter._id === id);
    if (!saved) return;
    if (isLocal()) this.localLoadedId = id;
    else this.site.selectedFilterId = id;
    this.model = metadataOf(saved) ?? this.siteSavedModel(saved);
    this.apply(true);
    this.onModel?.();
  }

  async save(rawName: string): Promise<SaveResult> {
    const action = this.saveAction(rawName);
    if (action.kind === "invalid") throw new Error(action.message);
    return action.kind === "create" ? { saved: await this.create(action.name) } : this.overwrite(action.target, action.name);
  }

  async saveAsNew(rawName: string): Promise<SaveResult> {
    const name = rawName.trim();
    if (name === "") throw new Error("Give the new filter a name first");
    const taken = this.findByName(name);
    if (taken) throw new Error(`"${taken.name}" already exists: give the new filter another name`);
    return { saved: await this.create(name) };
  }

  async remove(id: string) {
    if (isLocal()) {
      removeLocalFilter(id);
      if (this.localLoadedId === id) this.localLoadedId = null;
      this.onSavedFilters?.();
      return;
    }
    await requireFilterService().remove(id);
    const index = this.page.savedFilters.findIndex((filter) => filter._id === id);
    if (index >= 0) {
      this.knownCount = Math.max(0, this.knownCount - 1);
      this.page.savedFilters.splice(index, 1);
    }
    if (this.site.selectedFilterId === id) this.site.selectedFilterId = undefined;
  }

  // The account's saved filters as local ones (the server's stay as they are). Returns how many
  copyServerFilters(): number {
    const filters = this.serverFilters().map((saved) => ({
      name: saved.name,
      filters: snapshot(saved.filters),
      pd2te: { v: METADATA_VERSION, model: metadataOf(saved) ?? this.siteSavedModel(saved) } satisfies Metadata,
    }));
    addLocalFilters(filters);
    this.onSavedFilters?.();
    return filters.length;
  }

  // "Local filters" was switched: the other list shows, nothing loaded from it yet
  storeSwitched() {
    this.localLoadedId = null;
    if (!isLocal()) this.site.selectedFilterId = undefined;
    this.onSavedFilters?.();
  }

  // Every saved filter from the server, in its order (the site asks for its first 100 only)
  async loadAllSavedFilters() {
    const service = getFilterService();
    if (!service) return;
    try {
      await this.refreshSavedFilters();
    } catch (error) {
      console.warn(LOG, "Could not load all saved filters.", error);
    }
  }

  // With "Sort filters A-Z" on: puts the list in name order on the server if anything is out of place.
  // Returns how many filters moved
  async sortIfWanted(): Promise<number> {
    if (!Settings.getSettings().autoSortFilters || isLocal()) return 0;
    const { moved } = await sortSavedFilters();
    if (moved > 0) await this.refreshSavedFilters();
    return moved;
  }

  release() {
    this.released = true; // a queued external() microtask must not touch the dead component
    this.unwatch.forEach((stop) => stop());
    this.unwatch.length = 0;
  }

  private async refreshSavedFilters() {
    const rows = await fetchAllSavedFilters(requireFilterService());
    if (this.page.$.isUnmounted) return;
    this.knownCount = rows.length;
    this.page.savedFilters = rows;
  }

  // The site's own first-100 load can land after ours and cut the list short: load everything again
  private savedFiltersChanged() {
    if (this.page.savedFilters.length < this.knownCount) {
      this.knownCount = 0; // once
      void this.loadAllSavedFilters();
    }
    this.onSavedFilters?.();
  }

  // A filter saved without our metadata (by the site's own panels): its form parsed, with the default sort
  private siteSavedModel(saved: SavedFilter): FilterModel {
    return { ...parse(snapshot(saved.filters), this.vocab), sort: { ...DEFAULT_SORT } };
  }

  // The name, the form as the site keeps it, and our model next to it
  private saveData(name: string) {
    const result = this.apply(false);
    if (!result.ok) throw new Error(result.error);
    const metadata: Metadata = { v: METADATA_VERSION, model: cloneModel(this.model) };
    return { name, filters: snapshot(this.site.filters), pd2te: metadata };
  }

  private async create(name: string): Promise<SavedFilter> {
    const data = this.saveData(name);
    if (isLocal()) return this.afterLocalSave(storeLocalFilter(data));
    const list = this.page.savedFilters;
    const order = keyForNew(list, name, Settings.getSettings().autoSortFilters && planSort(list).length === 0);
    const saved = await requireFilterService().create(order === undefined ? data : { ...data, order });
    return this.afterSave(saved);
  }

  // The server stores a query in `filters` only when a filter is created: MongoDB refuses "$" keys ($gte,
  // $in, ...) in an update, and our form always has some. So new filters replace the saved filter with a new
  // one in the same place (its id, and so its ?filter= link, changes); a rename or a new sort is a patch
  private async overwrite(target: SavedFilter, name: string): Promise<SaveResult> {
    const data = this.saveData(name);
    if (isLocal()) return { saved: this.afterLocalSave(storeLocalFilter(data, target._id)) };
    const service = requireFilterService();
    if (stableStringify(data.filters) === stableStringify(target.filters)) {
      return { saved: await this.afterSave(await service.patch(target._id, { name: data.name, pd2te: data.pd2te })) };
    }
    const kept = { ...(target.order !== undefined ? { order: target.order } : {}), ...(target.notify ? { notify: true } : {}) };
    const replacement = await service.create({ ...data, ...kept });
    let note: string | undefined;
    try {
      await service.remove(target._id);
    } catch (error) {
      console.warn(LOG, `Saved "${name}" as a new filter; the old one could not be deleted.`, error);
      note = `the old "${target.name}" could not be deleted: ${errorMessage(error)}`;
    }
    return { saved: await this.afterSave(replacement), note };
  }

  private afterLocalSave(saved: SavedFilter): SavedFilter {
    this.localLoadedId = saved._id;
    this.onSavedFilters?.();
    return saved;
  }

  // The list from the server, in name order if that's wanted. A failed sort doesn't fail the save
  private async afterSave(saved: SavedFilter): Promise<SavedFilter> {
    this.site.selectedFilterId = saved._id;
    try {
      await this.refreshSavedFilters();
      await this.sortIfWanted();
    } catch (error) {
      console.warn(LOG, "Saved, but the saved filters could not be reloaded or sorted.", error);
    }
    return saved;
  }

  private write(form: Record<string, unknown>, sort: SortSpec) {
    this.applying = true;
    try {
      // After a ?filter= link the form is the saved filter's own object: writing into it would change the
      // saved copy the column compares with and loads again
      if (this.page.savedFilters.some((filter) => filter.filters === this.site.filters)) {
        this.site.filters = snapshot(this.site.filters);
      }
      const target = this.site.filters;
      Object.keys(target).forEach((key) => {
        if (!(key in form)) delete target[key];
      });
      Object.entries(form).forEach(([key, value]) => {
        target[key] = snapshot(value);
      });
      this.site.sort.field = sort.field;
      this.site.sort.direction = sort.direction;
    } finally {
      this.applying = false;
    }
  }

  private external() {
    if (this.applying || this.renderQueued) return;
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      if (this.released) return;
      this.model = this.readModel();
      this.searchIfSiteLoaded();
      this.onModel?.();
    });
  }

  // readModel found a filter the site had just loaded from a ?filter= link without our metadata: the site
  // searched its last 3 days, the column shows (and now searches) the filter as our model reads it
  private searchIfSiteLoaded() {
    if (!this.siteLoaded) return;
    this.siteLoaded = false;
    this.apply(true);
  }

  // The loaded saved filter's own model when the form is exactly what it saved, else the form parsed
  private readModel(): FilterModel {
    const { site } = this;
    const form = snapshot(site.filters);
    const saved = this.loadedFilter();
    if (saved && !metadataOf(saved) && saved.filters === site.filters) {
      // The site's ?filter= load makes the form the saved filter's own object
      this.siteLoaded = true;
      return this.siteSavedModel(saved);
    }
    if (saved) {
      const meta = metadataOf(saved);
      if (meta && stableStringify(saved.filters) === stableStringify(form)) {
        // Re-search when the site's own load didn't run what the filter means: the sort (which the site
        // doesn't save with our metadata's fidelity), or a "recent only" window whose date froze at save time
        const sort = sortOf(site.sort);
        if (sort.field !== meta.sort.field || sort.direction !== meta.sort.direction || !meta.includeStale) {
          this.siteLoaded = true; // searchIfSiteLoaded compiles the model fresh and searches it
        }
        return meta;
      }
    }
    const model = parse(form, this.vocab);
    model.sort = sortOf(site.sort);
    return model;
  }
}
