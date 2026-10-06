// Our filter model: everything the filter column can express, independent of how the site's form encodes
// it. compile() turns a model into the keys the site's form object carries: the site's own query builder
// copies keys it doesn't know into the query unchanged, so they can be MongoDB paths ("item.socket_count",
// "$or"). parse() reads a form back into a model, so saved filters made by the site's own UI, deep links
// (?quality=Rare) and livesearch restores all show up in our column; whatever it can't place is kept as
// custom JSON, never dropped.
import { stableStringify } from "../utils";
import type { Vocab } from "./site";
import { OWN_MARKER, isOwnMarkerValue, ownMarkerValue } from "./socketed";
import { SUMS_MARKER, SUM_SORT_FIELD, sanitizeSum, sumsFromMarker, sumsMarkerValue } from "./sums";
import type { SumSpec } from "./sums";

export interface Range {
  min?: number;
  max?: number;
}

export type Tri = "any" | "yes" | "no";

// One modifier the item must have: the site's property key ("maxhp", "item_addclassskills{2}",
// "item_skillonhit") plus the value slots the site's own builder knows
export interface ModCondition {
  key: string;
  min?: number;
  max?: number;
  skill?: number; // skill id, for the "chance to cast" properties
  skillLevelMin?: number;
  skillLevelMax?: number;
  aura?: number; // aura id, for item_aura
  corrupted?: boolean; // the mod must be one a corruption or a desecration (the second corruption) added
}

// "At least k of these mods": one $or branch per combination
export interface ModGroup {
  atLeast: number;
  mods: ModCondition[];
}

export interface SortSpec {
  field: string;
  direction: 1 | -1;
}

export interface FilterModel {
  hardcore?: boolean; // undefined: either
  ladder?: boolean;
  names: string[]; // exact item names (one name keeps the site's charm/ring/amulet/jewel regex behaviour)
  nameContains: string; // wins over `names`
  price: string; // the site's price text (a case-insensitive regex)
  priceExclude: string; // price text that rules a listing out, the same kind of regex; no price text passes
  hrPrice: Range;
  types: string[]; // itemTypes codes
  bases: string[]; // base codes
  qualities: string[];
  ethereal: Tri;
  corrupted: Tri;
  desecrated: Tri;
  identified: Tri;
  socketValues: number[]; // any of these socket counts
  socketRange: Range;
  itemLevel: Range;
  defense: Range;
  mods: ModCondition[]; // all of these
  ignoreSocketed: boolean; // mod values count the item's own stats only, not its socketed jewels/runes/gems (socketed.ts)
  excludeMods: string[]; // none of these modifier names
  groups: ModGroup[];
  sums: SumSpec[]; // weighted sums of mod values, each with a minimum (sums.ts)
  corruptionOutcomes: ModCondition[]; // mods a corruption rolled (key = modifier name), with optional value floors
  corruptionAtLeast: number; // how many of those outcomes the item needs; 1 = any of them
  online: Tri; // seller on the site in the last minutes (server-side flag)
  inGame: Tri;
  seller?: { id: string; name?: string }; // one seller's listings
  includeStale: boolean; // also listings not saved in the last 3 days (the page's own hidden window)
  classes: string[];
  level: Range;
  strength: Range;
  dexterity: Range;
  sort: SortSpec;
  custom: string; // JSON object of extra top-level query keys, merged last
}

export const DEFAULT_SORT: SortSpec = { field: "bumped_at", direction: -1 };
const MAX_BRANCHES = 64; // $or branches after multiplying every OR dimension out
const STALE_FLOOR = "2000-01-01T00:00:00.000Z"; // overrides the page's 3-day updated_at window
const RECENT_WINDOW_MS = 3 * 24 * 3600_000; // the page's own window, written explicitly when stale is off

export const emptyModel = (): FilterModel => ({
  names: [],
  nameContains: "",
  price: "",
  priceExclude: "",
  hrPrice: {},
  types: [],
  bases: [],
  qualities: [],
  ethereal: "any",
  corrupted: "any",
  desecrated: "any",
  identified: "any",
  socketValues: [],
  socketRange: {},
  itemLevel: {},
  defense: {},
  mods: [],
  ignoreSocketed: false,
  excludeMods: [],
  groups: [],
  sums: [],
  corruptionOutcomes: [],
  corruptionAtLeast: 1,
  online: "any",
  inGame: "any",
  includeStale: true,
  classes: [],
  level: {},
  strength: {},
  dexterity: {},
  sort: { ...DEFAULT_SORT },
  custom: "",
});

export const cloneModel = (model: FilterModel): FilterModel => JSON.parse(JSON.stringify(model)) as FilterModel;

type Dict = Record<string, unknown>;

const isRecord = (value: unknown): value is Dict => typeof value === "object" && value !== null && !Array.isArray(value);

export const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  return undefined;
};

const toBool = (value: unknown): boolean | undefined =>
  value === true || value === "true" ? true : value === false || value === "false" ? false : undefined;

const triOf = (value: boolean | undefined): Tri => (value === undefined ? "any" : value ? "yes" : "no");

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

// Removes undefined fields, so models and queries stay tidy and comparable
const clean = <T extends object>(object: T): T => {
  const record = object as Dict;
  Object.keys(record).forEach((key) => {
    if (record[key] === undefined) delete record[key];
  });
  return object;
};

const hasRange = (range: Range) => range.min !== undefined || range.max !== undefined;

const rangeQuery = (range: Range): Dict | undefined => {
  const query: Dict = {};
  if (range.min !== undefined) query.$gte = range.min;
  if (range.max !== undefined) query.$lte = range.max;
  return Object.keys(query).length > 0 ? query : undefined;
};

const rangeOf = (query: unknown): Range | undefined => {
  if (!isRecord(query)) return undefined;
  const range = clean({ min: toNumber(query.$gte), max: toNumber(query.$lte) });
  return hasRange(range) ? range : undefined;
};

export const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unescapeRegex = (text: string) => text.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");

// Price text to exclude: the server refuses $not and the site's form turns `price` into one case-insensitive
// $regex, so it becomes a lookahead that pattern starts with. Without text to contain, it goes in an OR with
// "no price text", which the lookahead alone would drop
const excludeLookahead = (exclude: string) => `^(?![\\s\\S]*(?:${exclude}))`;
const priceRegex = (contains: string, exclude: string) =>
  exclude === "" ? contains : `${excludeLookahead(exclude)}[\\s\\S]*(?:${contains})`;
const PRICE_REGEX = /^\^\(\?!\[\\s\\S\]\*\(\?:([\s\S]*?)\)\)(?:\[\\s\\S\]\*\(\?:([\s\S]*)\))?$/;

// A price pattern back to its two parts
const splitPriceRegex = (text: string): { contains: string; exclude: string } => {
  const match = text.match(PRICE_REGEX);
  return match ? { exclude: match[1], contains: match[2] ?? "" } : { contains: text, exclude: "" };
};

const excludeBranches = (exclude: string): Dict[] => [{ price: { $regex: excludeLookahead(exclude), $options: "i" } }, { price: null }];

// The $or excludeBranches writes, back to the excluded text. null: some other shape
const excludeFromBranches = (branches: unknown[]): string | null => {
  if (branches.length !== 2 || !branches.some((branch) => stableStringify(branch) === stableStringify({ price: null }))) return null;
  const other = branches.find((branch) => stableStringify(branch) !== stableStringify({ price: null }));
  if (!isRecord(other) || Object.keys(other).length !== 1 || !isRecord(other.price)) return null;
  const { $regex, $options } = other.price;
  if (typeof $regex !== "string" || $options !== "i" || Object.keys(other.price).length !== 2) return null;
  const split = splitPriceRegex($regex);
  return split.exclude !== "" && split.contains === "" && excludeLookahead(split.exclude) === $regex ? split.exclude : null;
};

// The site encodes multi-code types and bases as '{"$in": ["a", "b"]}' strings
const codesInString = (code: string): string[] | null => {
  if (!code.trim().startsWith("{")) return null;
  try {
    const parsed: unknown = JSON.parse(code);
    return isRecord(parsed) && Array.isArray(parsed.$in) ? strings(parsed.$in) : null;
  } catch {
    return null;
  }
};

export const flattenCodes = (codes: string[]): string[] => {
  const out: string[] = [];
  codes.forEach((code) =>
    (codesInString(code) ?? [code]).forEach((item) => {
      if (!out.includes(item)) out.push(item);
    })
  );
  return out;
};

const combinations = <T>(items: T[], size: number): T[][] => {
  if (size <= 0) return [[]];
  if (size > items.length) return [];
  const out: T[][] = [];
  const walk = (start: number, picked: T[]) => {
    if (picked.length === size) {
      out.push([...picked]);
      return;
    }
    for (let i = start; i <= items.length - (size - picked.length); i++) {
      picked.push(items[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return out;
};

// Where an item records what its corruption and its desecration (the second corruption) rolled: the flag on
// each mod they added, and the list of stats each one touched (the only record of a sockets roll). The site's
// own cards read the same places
const ROLLED_FLAGS = (): Dict[] => [{ corrupted: true }, { desecrated: true }];
const ROLL_LISTS = ["item.corruptions", "item.desecrations"];

const isRolledFlags = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.some((part) => isRecord(part) && Object.keys(part).length === 1 && part.corrupted === true) &&
  value.some((part) => isRecord(part) && Object.keys(part).length === 1 && part.desecrated === true);

// Same output as the site's builder for one entry of the form's `properties`; a mod a roll added also
// carries the flags, and then its "a|b" names go in $in (one $elemMatch has room for one $or)
const modElemMatch = (condition: ModCondition): Dict => {
  const match: Dict = {};
  let name = condition.key;
  let valueIndex = 0;
  const brace = condition.key.match(/^([\w_]+)\{([\d,]+)\}$/);
  if (brace) {
    name = brace[1];
    const fixed = brace[2].split(",");
    valueIndex = fixed.length;
    fixed.forEach((value, index) => {
      match[`values.${index}`] = parseInt(value, 10);
    });
  }
  if (condition.skill !== undefined) {
    valueIndex = 2;
    match["values.1"] = condition.skill;
  }
  const level = rangeQuery({ min: condition.skillLevelMin, max: condition.skillLevelMax });
  if (level) match["values.0"] = level;
  if (condition.aura !== undefined) {
    valueIndex = 1;
    match["values.0"] = condition.aura;
  }
  if (name.includes("item_elemskill_")) valueIndex = 1;
  const value = rangeQuery({ min: condition.min, max: condition.max });
  if (value) match[`values.${valueIndex}`] = value;
  if (!name.includes("|")) match.name = name;
  else if (condition.corrupted) match.name = { $in: name.split("|") };
  else match.$or = name.split("|").map((part) => ({ name: part }));
  if (condition.corrupted) match.$or = ROLLED_FLAGS();
  return { $elemMatch: match };
};

// Inverse of modElemMatch, using the property list to recognise "name{fixed}" keys. null: not a mod match
const conditionFromElemMatch = (value: unknown, vocab: Vocab): ModCondition | null => {
  if (!isRecord(value) || !isRecord(value.$elemMatch)) return null;
  const match = value.$elemMatch;
  const rolled = match.corrupted === true || isRolledFlags(match.$or);
  const orNames =
    Array.isArray(match.$or) && !isRolledFlags(match.$or)
      ? match.$or.map((part: unknown) => (isRecord(part) && typeof part.name === "string" ? part.name : null))
      : null;
  const inList: unknown[] | null = isRecord(match.name) && Array.isArray(match.name.$in) ? match.name.$in : null;
  const name =
    typeof match.name === "string"
      ? match.name
      : inList && inList.length > 0 && inList.every((part) => typeof part === "string")
        ? inList.join("|")
        : orNames && orNames.every((part) => part !== null)
          ? orNames.join("|")
          : null;
  if (!name) return null;

  const literal = (index: number): number | undefined => {
    const slot = match[`values.${index}`];
    return typeof slot === "number" ? slot : undefined;
  };
  const range = (index: number) => rangeOf(match[`values.${index}`]);
  const flagged = (condition: ModCondition): ModCondition => (rolled ? { ...condition, corrupted: true } : condition);
  const withValue = (condition: ModCondition, index: number) => {
    const value = range(index);
    return flagged(clean({ ...condition, min: value?.min, max: value?.max }));
  };

  if (vocab.skillProperties.has(name)) {
    const level = range(0);
    return withValue(clean({ key: name, skill: literal(1), skillLevelMin: level?.min, skillLevelMax: level?.max }), 2);
  }
  if (name === "item_aura") return withValue(clean({ key: name, aura: literal(0) }), 1);
  if (name.includes("item_elemskill_")) return withValue({ key: name }, 1);

  const fixed: number[] = [];
  for (let index = 0; literal(index) !== undefined; index++) fixed.push(literal(index) as number);
  if (fixed.length > 0) {
    const braced = `${name}{${fixed.join(",")}}`;
    if (vocab.propertyByKey.has(braced)) return withValue({ key: braced }, fixed.length);
    return null; // fixed slot values no property explains: the entry stays in custom instead of losing them
  }
  return withValue({ key: name }, 0);
};

const unflag = (condition: ModCondition): ModCondition => {
  const copy = { ...condition };
  delete copy.corrupted;
  return copy;
};

export interface Compiled {
  form: Record<string, unknown>;
  branches: number; // $or branches sent, 0 without an OR
}

export type CompileResult = { ok: true; value: Compiled } | { ok: false; error: string };

// An operator object like {$gte: 3, $in: [...]}: every key is an operator, and Mongo ANDs them on the field
const isOps = (value: unknown): value is Dict => isRecord(value) && Object.keys(value).every((key) => key.startsWith("$"));

// The AND of the same operator appearing on both sides, where one value can say it. null: it can't
// ($all concatenates, floors take the higher one, ceilings the lower, $in intersects)
const mergeOps = (a: Dict, b: Dict): Dict | null => {
  const out = { ...a };
  for (const [op, value] of Object.entries(b)) {
    const previous = out[op];
    if (previous === undefined) {
      out[op] = value; // different operators on one field AND together on their own
      continue;
    }
    if (stableStringify(previous) === stableStringify(value)) continue;
    const comparable =
      (typeof previous === "number" && typeof value === "number") ||
      (typeof previous === "string" && typeof value === "string"); // ISO dates compare as strings
    if ((op === "$gte" || op === "$gt") && comparable) out[op] = previous < value ? value : previous;
    else if ((op === "$lte" || op === "$lt") && comparable) out[op] = previous > value ? value : previous;
    else if (op === "$all" && Array.isArray(previous) && Array.isArray(value)) out[op] = [...previous, ...value];
    else if (op === "$in" && Array.isArray(previous) && Array.isArray(value)) {
      out[op] = previous.filter((item) => value.some((other) => stableStringify(item) === stableStringify(other)));
    } else return null;
  }
  return out;
};

// Two branches (or a branch and the form) ANDed into one object. The server rejects $and, so a key both
// sides constrain must merge into one value; when the sides contradict (two different plain values, an
// empty $in intersection) the result is `impossible`: nothing can match, and OR branches with it are
// dropped. `ok: false`: the two constraints are real but one object can't hold both.
type MergeResult = { ok: true; value: Dict; impossible: boolean } | { ok: false; key: string };

const mergeBranch = (a: Dict, b: Dict): MergeResult => {
  const out = { ...a };
  let impossible = false;
  for (const [key, value] of Object.entries(b)) {
    const previous = out[key];
    if (previous === undefined) {
      out[key] = value;
      continue;
    }
    if (stableStringify(previous) === stableStringify(value)) continue;
    if (isOps(previous) && isOps(value)) {
      const merged = mergeOps(previous, value);
      if (merged === null) return { ok: false, key };
      if (Array.isArray(merged.$in) && merged.$in.length === 0) impossible = true;
      out[key] = merged;
      continue;
    }
    // A plain value against {$in: [...]}: their intersection is the value, or nothing
    const plain = isOps(previous) ? value : previous;
    const ops = isOps(previous) ? previous : value;
    if (!isRecord(plain) && isOps(ops) && Object.keys(ops).length === 1 && Array.isArray(ops.$in)) {
      if (!ops.$in.includes(plain)) impossible = true;
      out[key] = plain;
      continue;
    }
    if (!isRecord(previous) && !isRecord(value)) {
      impossible = true; // two different plain values: no listing has both
      out[key] = value;
      continue;
    }
    return { ok: false, key };
  }
  return { ok: true, value: out, impossible };
};

const conflictError = (key: string): CompileResult => ({
  ok: false,
  error: `Two parts of the search constrain "${key}" in ways one query can't hold (the server rejects $and); change one of them`,
});

const parseCustom = (text: string): { ok: true; value: Dict } | { ok: false; error: string } => {
  if (text.trim() === "") return { ok: true, value: {} };
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) return { ok: false, error: "The custom query must be a JSON object" };
    return { ok: true, value: parsed };
  } catch (error) {
    return { ok: false, error: `The custom query is not valid JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// "At least `need` of these names, each on either roll's stat list". Without $and a name can't be looked up
// on "either list" inside a branch, so each k-subset gets one branch per way of splitting it between the
// two lists; "any of them" needs just one $in per list
const rolledNameBranches = (names: string[], need: number): Dict[] => {
  if (need === 1) return ROLL_LISTS.map((list) => ({ [list]: { $in: names } }));
  return combinations(names, need).flatMap((set) =>
    Array.from({ length: 2 ** set.length }, (_, mask) => {
      const branch: Dict = {};
      ROLL_LISTS.forEach((list, side) => {
        const part = set.filter((_, index) => ((mask >> index) & 1) === side);
        if (part.length > 0) branch[list] = { $all: part };
      });
      return branch;
    })
  );
};

export const compile = (model: FilterModel): CompileResult => {
  const form: Dict = { properties: {} }; // our mods go through item.modifiers; the site expects the key to exist
  const dimensions: Dict[][] = []; // independent OR groups, multiplied into the one $or

  if (model.hardcore !== undefined) form.is_hardcore = model.hardcore;
  if (model.ladder !== undefined) form.is_ladder = model.ladder;

  const contains = model.nameContains.trim();
  if (contains !== "") form["item.name"] = { $regex: escapeRegex(contains), $options: "i" };
  else if (model.names.length === 1) form.name = model.names[0];
  else if (model.names.length > 1) form["item.name"] = { $in: [...model.names] };

  const priceContains = model.price.trim();
  const priceExclude = model.priceExclude.trim();
  if (priceExclude !== "") {
    try {
      new RegExp(priceExclude);
    } catch {
      return { ok: false, error: "The price text to exclude isn't a valid pattern (Item)" };
    }
  }
  if (priceContains !== "") form.price = priceRegex(priceContains, priceExclude);
  else if (priceExclude !== "") dimensions.push(excludeBranches(priceExclude));
  const hrPrice = rangeQuery(model.hrPrice);
  if (hrPrice) form.hr_price = hrPrice;

  if (model.types.length > 0) form["item.base.type_code"] = { $in: flattenCodes(model.types) };
  if (model.bases.length > 0) form["item.base_code"] = { $in: flattenCodes(model.bases) };

  const qualities = [...new Set(model.qualities)];
  const others = qualities.filter((quality) => quality !== "Runeword");
  if (qualities.includes("Runeword") && others.length > 0) {
    dimensions.push([{ "item.quality.name": { $in: others } }, { "item.is_runeword": true }]);
  } else if (qualities.includes("Runeword")) {
    form["item.is_runeword"] = true;
  } else if (others.length > 0) {
    form["item.quality.name"] = { $in: others };
  }

  const tri = (key: string, value: Tri) => {
    if (value !== "any") form[key] = value === "yes";
  };
  tri("item.is_ethereal", model.ethereal);
  tri("item.corrupted", model.corrupted);
  tri("item.desecrated", model.desecrated);
  tri("item.is_identified", model.identified);

  const sockets: Dict = { ...(rangeQuery(model.socketRange) ?? {}) };
  if (model.socketValues.length > 0) sockets.$in = [...new Set(model.socketValues)].sort((a, b) => a - b);
  if (Object.keys(sockets).length > 0) form["item.socket_count"] = sockets;

  const range = (key: string, value: Range) => {
    const query = rangeQuery(value);
    if (query) form[key] = query;
  };
  range("item.item_level", model.itemLevel);
  range("item.defense.total", model.defense);

  const all: Dict[] = model.mods.map(modElemMatch);

  // Corrupted mods, from the corruption or the desecration: by name on the two rolls' stat lists when no
  // value matters, else through the mods flagged as rolled; "k of n" becomes an OR dimension either way
  const outcomes = model.corruptionOutcomes.filter((outcome) => outcome.key !== "");
  if (outcomes.length > 0) {
    const names = [...new Set(outcomes.map((outcome) => outcome.key))];
    const need = Math.min(Math.max(1, Math.floor(model.corruptionAtLeast)), names.length);
    const withValues = outcomes.some((outcome) => hasRange(outcome));
    if (!withValues) dimensions.push(rolledNameBranches(names, need));
    else {
      const flagged = outcomes.map((outcome) => ({ ...outcome, corrupted: true }));
      if (need === flagged.length) all.push(...flagged.map(modElemMatch));
      else dimensions.push(combinations(flagged, need).map((set) => ({ "item.modifiers": { $all: set.map(modElemMatch) } })));
    }
  }

  if (all.length > 0) form["item.modifiers"] = { $all: all };
  if (model.excludeMods.length > 0) form["item.modifiers.name"] = { $nin: [...new Set(model.excludeMods)] };
  // A condition every listing meets: it only tells the page's search and the livesearch to re-check mod values
  if (model.ignoreSocketed) form[OWN_MARKER] = ownMarkerValue();

  model.groups.forEach((group) => {
    if (group.mods.length === 0) return;
    const size = Math.min(Math.max(1, Math.floor(group.atLeast)), group.mods.length);
    dimensions.push(combinations(group.mods, size).map((set) => ({ "item.modifiers": { $all: set.map(modElemMatch) } })));
  });

  // Worked out on the listings before the page shows them (sum-search.ts); a sum without a minimum would have
  // to add up the whole market
  const sums = model.sums.filter((sum) => sum.terms.length > 0);
  if (sums.some((sum) => sum.min === undefined || !(sum.min > 0))) {
    return { ok: false, error: "Each sum needs a Min above 0 (Weighted Sums)" };
  }
  if (sums.some((sum) => sum.max !== undefined && sum.min !== undefined && sum.max < sum.min)) {
    return { ok: false, error: "A sum's Max is below its Min (Weighted Sums)" };
  }
  if (sums.length > 0) form[SUMS_MARKER] = sumsMarkerValue(sums);
  if (model.sort.field === SUM_SORT_FIELD && sums.length === 0) {
    return { ok: false, error: "Sorting by sum needs a sum with mods in it (Weighted Sums)" };
  }

  tri("online", model.online);
  tri("in_game", model.inGame);
  if (model.seller) form.user_id = model.seller.id;
  // Always written: without it the page applies its own 3-day window
  form.updated_at = { $gte: model.includeStale ? STALE_FLOOR : new Date(Date.now() - RECENT_WINDOW_MS).toISOString() };

  if (model.classes.length > 0) form["item.class_specifics"] = { $in: [...model.classes] };
  range("item.requirements.level", model.level);
  range("item.requirements.strength", model.strength);
  range("item.requirements.dexterity", model.dexterity);

  const custom = parseCustom(model.custom);
  if (!custom.ok) return custom;
  for (const [key, value] of Object.entries(custom.value)) {
    if (key === "$or" && Array.isArray(value)) {
      dimensions.push(value.filter(isRecord));
      continue;
    }
    const merged = mergeBranch(form[key] === undefined ? {} : { [key]: form[key] }, { [key]: value });
    if (!merged.ok) return conflictError(merged.key);
    if (merged.impossible) {
      return { ok: false, error: `The custom query and the filters contradict each other on "${key}": nothing can match both` };
    }
    Object.assign(form, merged.value);
  }

  let branches: Dict[] = [];
  if (dimensions.length > 0) {
    branches = [{}];
    for (const dimension of dimensions) {
      if (dimension.length === 0) continue;
      const next: Dict[] = [];
      for (const branch of branches) {
        for (const alternative of dimension) {
          const merged = mergeBranch(branch, alternative);
          if (!merged.ok) return conflictError(merged.key);
          if (!merged.impossible) next.push(merged.value); // a combination nothing can match is left out
        }
      }
      branches = next;
      if (branches.length > MAX_BRANCHES) {
        return { ok: false, error: `The OR groups expand to more than ${MAX_BRANCHES} combinations; use fewer or smaller groups` };
      }
    }
    if (branches.length === 0) return { ok: false, error: "The OR groups contradict each other: no combination can match" };
    if (branches.length === 1) {
      const merged = mergeBranch(form, branches[0]);
      if (!merged.ok) return conflictError(merged.key);
      if (merged.impossible) return { ok: false, error: "The OR groups and the filters contradict each other: nothing can match both" };
      Object.assign(form, merged.value);
    } else {
      form.$or = branches;
    }
  }

  return { ok: true, value: { form, branches: branches.length > 1 ? branches.length : 0 } };
};

// A query with more OR dimensions ANDed in, the way compile() multiplies them into its $or. null: past
// MAX_BRANCHES, a combination one query can't hold, or none that can match
export const withOrDimensions = (query: Dict, dimensions: Dict[][]): Dict | null => {
  let branches: Dict[] = Array.isArray(query.$or) ? query.$or.filter(isRecord) : [{}];
  for (const dimension of dimensions) {
    const next: Dict[] = [];
    for (const branch of branches) {
      for (const alternative of dimension) {
        const merged = mergeBranch(branch, alternative);
        if (!merged.ok) return null;
        if (!merged.impossible) next.push(merged.value);
      }
    }
    branches = next;
    if (branches.length === 0 || branches.length > MAX_BRANCHES) return null;
  }
  return { ...query, $or: branches };
};

// Picks the vocabulary entries (types or bases) that a set of codes covers: groups like Jewelry first,
// then single codes; codes nobody knows stay as they are
const entriesFor = (codes: string[], entries: { key: string; codes: string[] }[]): string[] => {
  const remaining = new Set(codes);
  const picked: string[] = [];
  [...entries]
    .sort((a, b) => b.codes.length - a.codes.length)
    .forEach((entry) => {
      if (entry.codes.length > 0 && !picked.includes(entry.key) && entry.codes.every((code) => remaining.has(code))) {
        picked.push(entry.key);
        entry.codes.forEach((code) => remaining.delete(code));
      }
    });
  remaining.forEach((code) => picked.push(code));
  return picked;
};

const codesOf = (value: unknown): string[] =>
  typeof value === "string" ? (codesInString(value) ?? [value]) : isRecord(value) ? strings(value.$in) : [];

// True when `sets` are exactly all the k-subsets of their union
const isEveryCombination = (sets: string[][]): boolean => {
  if (sets.length === 0) return false;
  const size = sets[0].length;
  if (size === 0 || sets.some((set) => set.length !== size)) return false;
  const union = new Set(sets.flat());
  const signatures = new Set(sets.map((set) => stableStringify([...set].sort())));
  return signatures.size === sets.length && combinations([...union], size).length === sets.length;
};

// Recognises the $or our compiler writes for one "at least k of n" group of mods. null: some other shape
const groupFromBranches = (branches: unknown[], vocab: Vocab): ModGroup | null => {
  const sets: ModCondition[][] = [];
  for (const branch of branches) {
    if (!isRecord(branch) || Object.keys(branch).length !== 1) return null;
    const modifiers = branch["item.modifiers"];
    if (!isRecord(modifiers) || !Array.isArray(modifiers.$all) || modifiers.$all.length === 0) return null;
    const conditions: ModCondition[] = [];
    for (const entry of modifiers.$all) {
      const condition = conditionFromElemMatch(entry, vocab);
      if (!condition) return null;
      conditions.push(condition);
    }
    sets.push(conditions);
  }
  const bySignature = new Map<string, ModCondition>();
  sets.flat().forEach((condition) => bySignature.set(stableStringify(condition), condition));
  if (!isEveryCombination(sets.map((set) => set.map((condition) => stableStringify(condition))))) return null;
  return { atLeast: sets[0].length, mods: [...bySignature.values()] };
};

// A branch's names on one roll list when that list holds exactly {[op]: [names]}; [] when the branch doesn't use it
const rollListNames = (branch: Dict, list: string, op: "$in" | "$all"): string[] | null => {
  const value = branch[list];
  if (value === undefined) return [];
  if (!isRecord(value) || Object.keys(value).length !== 1) return null;
  const raw = value[op];
  if (!Array.isArray(raw)) return null;
  const names = strings(raw);
  return names.length > 0 && names.length === raw.length ? names : null;
};

// The $or rolledNameBranches writes, back to its names and k. null: some other shape
const rolledNamesFromBranches = (branches: unknown[]): { names: string[]; atLeast: number } | null => {
  if (branches.length === 0) return null;
  const usesRollListsOnly = (branch: unknown): branch is Dict =>
    isRecord(branch) && Object.keys(branch).length > 0 && Object.keys(branch).every((key) => ROLL_LISTS.includes(key));
  if (!branches.every(usesRollListsOnly)) return null;
  const records = branches as Dict[];

  // Any of them: the same names in an $in on each list
  if (records.length === 2 && records.every((branch) => Object.keys(branch).length === 1)) {
    const lists = records.map((branch) => Object.keys(branch)[0]);
    const [a, b] = records.map((branch, index) => rollListNames(branch, lists[index], "$in"));
    if (lists[0] !== lists[1] && a && b && a.length === b.length && a.every((name) => b.includes(name))) {
      return { names: a, atLeast: 1 };
    }
  }

  // k of them: every k-subset once per way of splitting it between the two lists
  const splits: string[][][] = [];
  for (const branch of records) {
    const split = ROLL_LISTS.map((list) => rollListNames(branch, list, "$all"));
    if (split.some((names) => names === null)) return null;
    const [first, second] = split as string[][];
    if (first.some((name) => second.includes(name))) return null;
    splits.push([first, second]);
  }
  const size = splits[0][0].length + splits[0][1].length;
  const ways = new Map<string, Set<string>>(); // k-subset -> the splits seen for it
  for (const [first, second] of splits) {
    const set = stableStringify([...first, ...second].sort());
    const seen = ways.get(set) ?? new Set<string>();
    seen.add(stableStringify([[...first].sort(), [...second].sort()]));
    ways.set(set, seen);
  }
  if (splits.length !== ways.size * 2 ** size || [...ways.values()].some((seen) => seen.size !== 2 ** size)) return null;
  if (!isEveryCombination([...ways.keys()].map((set) => JSON.parse(set) as string[]))) return null;
  return { names: [...new Set(splits.flatMap(([first, second]) => [...first, ...second]))], atLeast: size };
};

export const parse = (input: Record<string, unknown>, vocab: Vocab): FilterModel => {
  const model = emptyModel();
  const rest = JSON.parse(JSON.stringify(input)) as Dict;
  const take = (key: string): unknown => {
    const value = rest[key];
    delete rest[key];
    return value;
  };
  const leave = (key: string, value: unknown) => {
    if (value !== undefined) rest[key] = value;
  };
  const addOutcomes = (conditions: ModCondition[], atLeast: number) => {
    conditions.forEach((condition) => {
      if (!model.corruptionOutcomes.some((outcome) => outcome.key === condition.key)) model.corruptionOutcomes.push(condition);
    });
    model.corruptionAtLeast = atLeast;
  };

  const properties = take("properties");
  if (isRecord(properties)) {
    Object.entries(properties).forEach(([key, spec]) => {
      if (!isRecord(spec)) return;
      model.mods.push(
        clean({
          key,
          min: toNumber(spec.min),
          max: toNumber(spec.max),
          skill: toNumber(isRecord(spec.skill) ? spec.skill.value : spec.skill),
          skillLevelMin: toNumber(spec.skillLevelMin),
          skillLevelMax: toNumber(spec.skillLevelMax),
          aura: toNumber(isRecord(spec.aura) ? spec.aura.value : spec.aura),
        })
      );
    });
  }

  model.hardcore = toBool(take("is_hardcore"));
  model.ladder = toBool(take("is_ladder"));
  clean(model);

  const name = take("name");
  if (typeof name === "string" && name.trim() !== "") model.names.push(name);
  const itemName = take("item.name");
  if (typeof itemName === "string") model.names.push(itemName);
  else if (isRecord(itemName)) {
    model.names.push(...strings(itemName.$in));
    if (typeof itemName.$regex === "string") model.nameContains = unescapeRegex(itemName.$regex);
  } else leave("item.name", itemName);

  const price = take("price");
  if (typeof price === "string") {
    const split = splitPriceRegex(price);
    model.price = split.contains;
    model.priceExclude = split.exclude;
  }
  else leave("price", price);

  const takeRange = (key: string): Range => {
    const value = take(key);
    const range = rangeOf(value);
    if (range) return range;
    leave(key, value);
    return {};
  };
  model.hrPrice = takeRange("hr_price");

  const typeCodes = [...codesOf(take("type")), ...codesOf(take("item.base.type_code"))];
  if (typeCodes.length > 0) {
    model.types = entriesFor(
      typeCodes,
      vocab.types.map((type) => ({ key: type.code, codes: flattenCodes([type.code]) }))
    );
  }
  const baseCodes = [...codesOf(take("base")), ...codesOf(take("item.base_code"))];
  if (baseCodes.length > 0) {
    model.bases = entriesFor(
      baseCodes,
      vocab.bases.map((base) => ({ key: base.code, codes: flattenCodes([base.code]) }))
    );
  }

  const quality = take("quality");
  if (typeof quality === "string" && quality !== "") model.qualities.push(quality);
  const qualityName = take("item.quality.name");
  if (typeof qualityName === "string") model.qualities.push(qualityName);
  else if (isRecord(qualityName)) model.qualities.push(...strings(qualityName.$in));
  else leave("item.quality.name", qualityName);
  const runeword = take("item.is_runeword");
  if (runeword === true) model.qualities.push("Runeword");
  else leave("item.is_runeword", runeword);
  model.qualities = [...new Set(model.qualities)];

  const tri = (siteKey: string, path: string): Tri => {
    const siteValue = toBool(take(siteKey));
    const pathValue = toBool(take(path));
    return triOf(pathValue ?? siteValue);
  };
  model.ethereal = tri("ethereal", "item.is_ethereal");
  model.corrupted = tri("corrupted", "item.corrupted");
  model.desecrated = tri("desecrated", "item.desecrated");
  model.identified = tri("is_identified", "item.is_identified");

  model.socketRange = clean({ min: toNumber(take("sockets_min")), max: toNumber(take("sockets_max")) });
  const socketCount = take("item.socket_count");
  if (typeof socketCount === "number") model.socketValues.push(socketCount);
  else if (isRecord(socketCount)) {
    if (Array.isArray(socketCount.$in)) {
      model.socketValues.push(...socketCount.$in.map(toNumber).filter((count): count is number => count !== undefined));
    }
    const socketRange = rangeOf(socketCount);
    if (socketRange) model.socketRange = { ...model.socketRange, ...socketRange };
  } else leave("item.socket_count", socketCount);
  const socketed = take("item.is_socketed");
  if (socketed === false) model.socketValues.push(0);
  else leave("item.is_socketed", socketed);

  model.itemLevel = takeRange("item.item_level");
  model.defense = takeRange("item.defense.total");

  const modifiers = take("item.modifiers");
  if (isRecord(modifiers)) {
    const entries: unknown[] = Array.isArray(modifiers.$all) ? modifiers.$all : [modifiers];
    const unparsed: unknown[] = [];
    const flaggedOutcomes: ModCondition[] = [];
    entries.forEach((entry) => {
      const condition = conditionFromElemMatch(entry, vocab);
      if (!condition) unparsed.push(entry);
      else if (condition.corrupted) flaggedOutcomes.push(unflag(condition));
      else model.mods.push(condition);
    });
    if (flaggedOutcomes.length > 0) addOutcomes(flaggedOutcomes, flaggedOutcomes.length);
    if (unparsed.length > 0) rest["item.modifiers"] = { $all: unparsed };
  } else leave("item.modifiers", modifiers);

  const modifierNames = take("item.modifiers.name");
  if (typeof modifierNames === "string") model.mods.push({ key: modifierNames });
  else if (isRecord(modifierNames)) {
    model.excludeMods.push(...strings(modifierNames.$nin));
    const anyOf = strings(modifierNames.$in);
    if (anyOf.length > 0) model.groups.push({ atLeast: 1, mods: anyOf.map((key) => ({ key })) });
  } else leave("item.modifiers.name", modifierNames);
  const ownStats = take(OWN_MARKER);
  if (isOwnMarkerValue(ownStats)) model.ignoreSocketed = true;
  else leave(OWN_MARKER, ownStats);
  const sumsMarker = take(SUMS_MARKER);
  const sums = sumsFromMarker(sumsMarker);
  if (sums) model.sums = sums;
  else leave(SUMS_MARKER, sumsMarker);
  // A lone item.corruptions / item.desecrations key isn't something the compiler writes (corrupted mods look
  // at both rolls): it stays in custom, searching exactly what it says

  model.online = triOf(toBool(take("online")));
  model.inGame = triOf(toBool(take("in_game")));
  const userId = take("user_id");
  if (typeof userId === "string" && userId !== "") model.seller = { id: userId };
  else leave("user_id", userId);

  // No window written: everything (our default). A floor far in the past: everything. Recent: the 3-day window
  const updatedAt = take("updated_at");
  if (updatedAt !== undefined) {
    const floor = isRecord(updatedAt) && typeof updatedAt.$gte === "string" ? Date.parse(updatedAt.$gte) : NaN;
    if (Number.isFinite(floor)) model.includeStale = floor < Date.now() - 30 * 24 * 3600_000;
    else leave("updated_at", updatedAt);
  }

  const classReq = take("class_req");
  if (typeof classReq === "string" && classReq !== "") model.classes.push(classReq);
  const classes = take("item.class_specifics");
  if (typeof classes === "string") model.classes.push(classes);
  else if (isRecord(classes)) model.classes.push(...strings(classes.$in));
  else leave("item.class_specifics", classes);

  const requirement = (minKey: string, maxKey: string, path: string): Range => {
    const range = clean({ min: toNumber(take(minKey)), max: toNumber(take(maxKey)) });
    return { ...range, ...takeRange(path) };
  };
  model.level = requirement("level_req_min", "level_req_max", "item.requirements.level");
  model.strength = requirement("strength_req_min", "strength_req_max", "item.requirements.strength");
  model.dexterity = requirement("dexterity_req_min", "dexterity_req_max", "item.requirements.dexterity");

  const or = take("$or");
  if (Array.isArray(or)) {
    const group = groupFromBranches(or, vocab);
    const byName = group ? null : rolledNamesFromBranches(or);
    const priceExclude = group || byName ? null : excludeFromBranches(or);
    if (group && group.mods.every((mod) => mod.corrupted)) addOutcomes(group.mods.map(unflag), group.atLeast);
    else if (group) model.groups.push(group);
    else if (byName) addOutcomes(byName.names.map((key) => ({ key })), byName.atLeast);
    else if (priceExclude !== null) model.priceExclude = priceExclude;
    else rest.$or = or;
  } else leave("$or", or);

  if (Object.keys(rest).length > 0) model.custom = JSON.stringify(rest, null, 2);
  return model;
};

// A model from saved metadata: every field checked, unknown ones dropped. null: not a model at all
export const sanitizeModel = (raw: unknown): FilterModel | null => {
  if (!isRecord(raw)) return null;
  const model = emptyModel();
  const tri = (value: unknown): Tri => (value === "yes" || value === "no" ? value : "any");
  const range = (value: unknown): Range => (isRecord(value) ? clean({ min: toNumber(value.min), max: toNumber(value.max) }) : {});
  const numbers = (value: unknown): number[] =>
    Array.isArray(value) ? value.map(toNumber).filter((item): item is number => item !== undefined) : [];
  const condition = (value: unknown): ModCondition | null =>
    isRecord(value) && typeof value.key === "string"
      ? clean({
          key: value.key,
          min: toNumber(value.min),
          max: toNumber(value.max),
          skill: toNumber(value.skill),
          skillLevelMin: toNumber(value.skillLevelMin),
          skillLevelMax: toNumber(value.skillLevelMax),
          aura: toNumber(value.aura),
          corrupted: value.corrupted === true ? true : undefined,
        })
      : null;
  const conditions = (value: unknown): ModCondition[] =>
    Array.isArray(value) ? value.map(condition).filter((item): item is ModCondition => item !== null) : [];

  model.hardcore = toBool(raw.hardcore);
  model.ladder = toBool(raw.ladder);
  clean(model);
  model.names = strings(raw.names);
  model.nameContains = typeof raw.nameContains === "string" ? raw.nameContains : "";
  model.price = typeof raw.price === "string" ? raw.price : "";
  model.priceExclude = typeof raw.priceExclude === "string" ? raw.priceExclude : "";
  model.hrPrice = range(raw.hrPrice);
  model.types = strings(raw.types);
  model.bases = strings(raw.bases);
  model.qualities = strings(raw.qualities);
  model.ethereal = tri(raw.ethereal);
  model.corrupted = tri(raw.corrupted);
  model.desecrated = tri(raw.desecrated);
  model.identified = tri(raw.identified);
  model.socketValues = numbers(raw.socketValues);
  model.socketRange = range(raw.socketRange);
  model.itemLevel = range(raw.itemLevel);
  model.defense = range(raw.defense);
  model.mods = conditions(raw.mods);
  model.ignoreSocketed = raw.ignoreSocketed === true;
  model.excludeMods = strings(raw.excludeMods);
  model.groups = Array.isArray(raw.groups)
    ? raw.groups
        .filter(isRecord)
        .map((group) => ({ atLeast: Math.max(1, Math.floor(toNumber(group.atLeast) ?? 1)), mods: conditions(group.mods) }))
    : [];
  model.sums = Array.isArray(raw.sums) ? raw.sums.map(sanitizeSum).filter((sum): sum is SumSpec => sum !== null) : [];
  model.corruptionOutcomes = conditions(raw.corruptionOutcomes).map(unflag);
  model.corruptionAtLeast = Math.max(1, Math.floor(toNumber(raw.corruptionAtLeast) ?? 1));
  model.online = tri(raw.online);
  model.inGame = tri(raw.inGame);
  if (isRecord(raw.seller) && typeof raw.seller.id === "string") {
    model.seller = clean({ id: raw.seller.id, name: typeof raw.seller.name === "string" ? raw.seller.name : undefined });
  }
  model.includeStale = raw.includeStale !== false;
  model.classes = strings(raw.classes);
  model.level = range(raw.level);
  model.strength = range(raw.strength);
  model.dexterity = range(raw.dexterity);
  model.sort =
    isRecord(raw.sort) && typeof raw.sort.field === "string" && raw.sort.field !== ""
      ? { field: raw.sort.field, direction: raw.sort.direction === 1 ? 1 : -1 }
      : { ...DEFAULT_SORT };
  model.custom = typeof raw.custom === "string" ? raw.custom : "";
  return model;
};
