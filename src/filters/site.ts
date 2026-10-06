// The site's GameMarketFilters component on /market: the form object every search is built from, the
// vocabularies it holds (properties, skills, auras, item types, bases, item names) and the saved-filter
// methods the page hands it. Our filter column renders from this component and writes into it; the site's
// own column is hidden but stays mounted, so deep links (?filter=, ?quality=...) and the login-time mode
// preferences keep working.
import { MARKET_ROUTE, getApi, getMarketFilters, hasFunctions, isObject, loadRouteComponent } from "../pd2/vue-bridge";
import type { FindResult, MarketFilters, MarketPage } from "../pd2/vue-bridge";
import { escapeRegex } from "./model";

export interface LabeledOption<T = string> {
  key: T;
  label: string;
  value: T;
}

export interface ItemTypeEntry {
  code: string; // what the form's `type` takes: a type code, or a '{"$in": [...]}' string for a group
  display: string;
  bases: { code: string; display: string }[];
}

export interface SavedFilter {
  _id: string;
  name: string;
  filters: Record<string, unknown>;
  order?: string; // the list is sorted by it, see saved-order.ts
  notify?: boolean; // the site's Auto Notify (Discord messages)
  updated_at?: string;
  pd2te?: unknown; // our metadata, see controller.ts
}

// The vocabularies, as the filter component's data holds them
export interface VocabSource {
  propertyOptions: LabeledOption[];
  skillOptions: LabeledOption<number>[];
  auraOptions: LabeledOption<number>[];
  skillProperties: string[];
  itemTypes: Record<string, ItemTypeEntry>;
  allItemNames: string[];
}

export interface SiteFilters extends MarketFilters, VocabSource {
  savedFilters: SavedFilter[];
  selectedFilterId?: string; // the saved filter loaded last; the site's Clear Filters unsets it
  compactMode: boolean;
  loadFilter(): void;
  clearFilters(): Promise<void>;
  updatePreferences(): Promise<void>;
}

export interface SitePage extends MarketPage {
  savedFilters: SavedFilter[];
}

const isVocabSource = (value: unknown): value is VocabSource =>
  isObject(value) &&
  Array.isArray(value.propertyOptions) &&
  Array.isArray(value.skillOptions) &&
  Array.isArray(value.auraOptions) &&
  Array.isArray(value.skillProperties) &&
  Array.isArray(value.allItemNames) &&
  isObject(value.itemTypes);

const isSiteFilters = (proxy: unknown): proxy is SiteFilters =>
  isVocabSource(proxy) && hasFunctions(proxy, "clearFilters", "loadFilter");

export const isSitePage = (page: MarketPage): page is SitePage => Array.isArray((page as Partial<SitePage>).savedFilters);

export const getSiteFilters = (page: MarketPage | null): SiteFilters | null => {
  const filters = getMarketFilters(page);
  return filters && isSiteFilters(filters) ? filters : null;
};

// market/filter. The server refuses update() from the browser (405); patch() merges the fields it's given,
// which is what the site's own "update" wrapper sends too
export interface FilterService {
  find(params: { query: Record<string, unknown> }): Promise<FindResult<SavedFilter>>;
  create(data: Record<string, unknown>): Promise<SavedFilter>;
  patch(id: string, data: Record<string, unknown>): Promise<SavedFilter>;
  remove(id: string): Promise<SavedFilter>;
}

export const getFilterService = (): FilterService | null => {
  try {
    const service = getApi()?.service("market/filter");
    return hasFunctions(service, "find", "create", "patch", "remove") ? (service as FilterService) : null;
  } catch {
    return null;
  }
};

export const requireFilterService = (): FilterService => {
  const service = getFilterService();
  if (!service) throw new Error("the site's saved-filter service was not found");
  return service;
};

// Every saved filter in the server's order. The site itself only ever asks for the first 100
export const fetchAllSavedFilters = async (service: FilterService): Promise<SavedFilter[]> => {
  const rows: SavedFilter[] = [];
  for (;;) {
    const result = await service.find({ query: { $limit: 250, $skip: rows.length, $sort: { order: 1, _id: 1 } } });
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length === 0 || rows.length >= (result.total ?? rows.length)) return rows;
  }
};

export interface BaseEntry {
  code: string; // a base code, or a '{"$in": [...]}' string
  display: string;
  typeCode: string;
}

export interface Vocab {
  properties: LabeledOption[];
  propertyByKey: Map<string, LabeledOption>;
  skills: LabeledOption<number>[];
  auras: LabeledOption<number>[];
  skillProperties: Set<string>;
  types: ItemTypeEntry[];
  bases: BaseEntry[];
  names: string[];
}

// Plain copies of the component's lists (Vue proxies otherwise)
export const readVocab = (site: VocabSource): Vocab => {
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  const properties = clone(site.propertyOptions).filter((option) => typeof option.key === "string");
  const types = Object.values(clone(site.itemTypes))
    .filter((type) => type.display)
    .sort((a, b) => a.display.localeCompare(b.display));
  const bases: BaseEntry[] = [];
  types.forEach((type) =>
    type.bases.forEach((base) => {
      if (base.display) bases.push({ code: base.code, display: base.display, typeCode: type.code });
    })
  );
  return {
    properties,
    propertyByKey: new Map(properties.map((option) => [option.key, option])),
    skills: clone(site.skillOptions),
    auras: clone(site.auraOptions),
    skillProperties: new Set(site.skillProperties),
    types,
    bases,
    names: clone(site.allItemNames).filter((name) => typeof name === "string"),
  };
};

// The vocabularies away from /market (no filter component mounted): the lists are static, so the filter
// component's own data() gives them, taken from the market page's component definition
let vocabLoad: Promise<Vocab> | null = null;

export const loadVocab = (): Promise<Vocab> => {
  vocabLoad ??= (async () => {
    const page = await loadRouteComponent(MARKET_ROUTE);
    const components = isObject(page?.components) ? Object.values(page.components) : [];
    const filters = components.find((component) => isObject(component) && component.name === "GameMarketFilters");
    const data: unknown = isObject(filters) && typeof filters.data === "function" ? filters.data() : null;
    if (!isVocabSource(data)) throw new Error("the site's market filter lists were not found");
    return readVocab(data);
  })().catch((error: unknown) => {
    vocabLoad = null; // try again next time
    throw error;
  });
  return vocabLoad;
};

// "+{X} to Strength ", "%d%% Chance to cast level %d %s on striking " -> readable
export const displayLabel = (label: string) =>
  label
    .replace(/\{X\}/g, "X")
    .replace(/%d%%/g, "X%")
    .replace(/%d/g, "X")
    .replace(/%s/g, "skill")
    .replace(/\s+/g, " ")
    .trim();

// A corruption's or desecration's sockets roll: named in their rolled-stats lists, no property of its own
export const SOCKETS_ROLL = "item_numsockets";

// The site's own lookup: exact key, else the option whose key is one of the "a|b" parts
export const propertyLabel = (vocab: Vocab, key: string): string => {
  if (key === SOCKETS_ROLL) return "Sockets";
  const exact = vocab.propertyByKey.get(key);
  if (exact) return displayLabel(exact.label);
  const parts = key.split("|");
  const match = vocab.properties.find((option) => parts.includes(option.key));
  return match ? displayLabel(match.label) : key;
};

export const QUALITIES = ["Normal", "Superior", "Magic", "Rare", "Crafted", "Set", "Unique", "Runeword"];

export const CLASSES: { value: string; label: string }[] = [
  { value: "amazon", label: "Amazon" },
  { value: "assassin", label: "Assassin" },
  { value: "barbarian", label: "Barbarian" },
  { value: "druid", label: "Druid" },
  { value: "necromancer", label: "Necromancer" },
  { value: "paladin", label: "Paladin" },
  { value: "sorceress", label: "Sorceress" },
];
// Sort fields offered in the column (the server sorts on any listing field; the site's own menu has two)
export const SORT_FIELDS: { value: string; label: string }[] = [
  { value: "bumped_at", label: "Last bumped" },
  { value: "updated_at", label: "Last saved (bump, price or any edit)" },
  { value: "created_at", label: "Listed" },
  { value: "user_last_online", label: "Seller last online (site)" },
  { value: "user_last_ingame", label: "Seller last in game" },
];

export interface SiteUser {
  _id: string;
  username?: string;
}

interface UserService {
  find(params: { query: Record<string, unknown> }): Promise<FindResult<SiteUser>>;
}

// A seller by site username or in-game account name, case-insensitive and exact. null: nobody by that name
export const findUserByName = async (name: string): Promise<SiteUser | null> => {
  const service = getApi()?.service("security/user") as Partial<UserService> | undefined;
  if (!service || typeof service.find !== "function") throw new Error("the site's user service was not found");
  const exact = { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" };
  for (const query of [{ username: exact }, { "game.accounts": exact }]) {
    const result = await service.find({ query: { ...query, $limit: 1 } });
    const user = (result.data ?? []).find((row) => typeof row._id === "string");
    if (user) return user;
  }
  return null;
};
