// An item's own stats, apart from the jewels, runes and gems socketed into it, and a re-check of a search
// against them. The market stores one merged list, item.modifiers (the item's own mods plus every socketed
// item's), next to each socketed item's own list (item.socketed[].modifiers). The site's merge adds up only a
// mod's amount: slot 0 of a plain stat or a damage range (three "Adds 17-45 Fire" jewels show as "Adds 51-45"),
// the chance of a skill trigger. The other slots keep the first contribution, the item's own when it has one.
// All resistances and all attributes are one mod only while their four stats are equal, so a jewel's all-res
// is spread over the four when the item's end up unequal. Runewords keep their runes: they're the recipe.
//
// Searching: the server matches the merged values. A search that ignores socketed items carries OWN_MARKER
// (the column's checkbox writes it into the form), and the listings a socketed item adds to are re-checked
// here: socketed-search.ts leaves the page's failures out, the livesearch drops them from its hits.
import { stableStringify } from "../utils";

type Doc = Record<string, unknown>;

export interface ItemModifier {
  name?: string;
  values?: unknown[];
  label?: string;
  corrupted?: boolean; // added by the item's corruption
  desecrated?: boolean; // added by its desecration (the second corruption)
  min?: number; // the roll's range, when the mod has one
  max?: number;
}

export interface SocketItem {
  is_runeword?: boolean;
  modifiers?: ItemModifier[];
  socketed?: { modifiers?: ItemModifier[] | null }[] | null;
}

// A condition no listing fails ({$exists: false} on a field none has), so the server and the site's own
// Auto Notify ignore it, while it rides along everywhere the form goes: saved filters, links, the livesearch
export const OWN_MARKER = "pd2te_ignore_socketed";
export const ownMarkerValue = () => ({ $exists: false });
export const isOwnMarkerValue = (value: unknown) => stableStringify(value) === stableStringify(ownMarkerValue());
export const isOwnSearch = (query: Doc) => isOwnMarkerValue(query[OWN_MARKER]);

const isRecord = (value: unknown): value is Doc => typeof value === "object" && value !== null && !Array.isArray(value);

// Which slots say what a mod is (its level and skill, tab, class or aura) and which one holds the amount
export interface Layout {
  identity: number[];
  amount: number;
}

const ONE_PARAMETER = new Set([
  "item_addclassskills",
  "item_addskill_tab",
  "item_singleskill",
  "item_nonclassskill",
  "item_aura",
  "item_skillonequip",
  "item_reanimate",
]);

export const layoutOf = (name: string): Layout => {
  // [level, skill, chance], [level, skill, charges, max charges]
  if ((name.startsWith("item_skillon") && name !== "item_skillonequip") || name === "item_charged_skill") {
    return { identity: [0, 1], amount: 2 };
  }
  if (ONE_PARAMETER.has(name) || name.startsWith("item_elemskill_")) return { identity: [0], amount: 1 };
  return { identity: [], amount: 0 };
};

// [min, max, ...]: the merge adds up the min only; notes show both ends
const DAMAGE_RANGES = new Set(["firedam", "lightdam", "lightmindam", "colddam", "magicmindam"]);
// [per frame x256, same, frames]: shown as the total over its duration
const POISON = "poisonmindam";

// The four stats all-resistances and all-attributes stand for
export const PSEUDO: Record<string, string[]> = {
  all_resist: ["fireresist", "lightresist", "coldresist", "poisonresist"],
  all_attributes: ["strength", "dexterity", "vitality", "energy"],
};

const numbers = (modifier: ItemModifier): number[] =>
  Array.isArray(modifier.values) ? modifier.values.map((value) => (typeof value === "number" ? value : Number(value))) : [];

const identityKey = (name: string, values: number[]) =>
  `${name}|${layoutOf(name)
    .identity.map((index) => values[index])
    .join(",")}`;

interface Added {
  amount: number;
  max: number; // damage ranges: what the socketed items add to the max
}

// What the socketed items add, by mod identity; all-res and all-attributes as their four stats
const socketedAdds = (item: SocketItem): Map<string, Added> => {
  const adds = new Map<string, Added>();
  const add = (key: string, amount: number, max: number) => {
    const entry = adds.get(key) ?? { amount: 0, max: 0 };
    entry.amount += amount;
    entry.max += max;
    adds.set(key, entry);
  };
  (item.socketed ?? []).forEach((socketed) =>
    (socketed?.modifiers ?? []).forEach((modifier) => {
      const name = modifier.name;
      if (typeof name !== "string") return;
      const values = numbers(modifier);
      const amount = values[layoutOf(name).amount];
      if (!Number.isFinite(amount)) return;
      const parts = PSEUDO[name];
      if (parts) parts.forEach((part) => add(identityKey(part, []), amount, 0));
      else add(identityKey(name, values), amount, DAMAGE_RANGES.has(name) && Number.isFinite(values[1]) ? values[1] : 0);
    })
  );
  return adds;
};

export interface SocketShare {
  modifier: ItemModifier; // the mod as the listing shows it: own + socketed
  own: number; // the item's own amount; 0: all of it comes from socketed items
  added: number; // what the socketed items add
  ownMax?: number; // damage ranges: the other end of each part
  addedMax?: number;
  // All-res / all-attributes whose four stats differ without the socketed items: each stat's split
  parts?: { name: string; own: number; added: number }[];
}

// The mods socketed items add to, with the split. Mods they don't touch aren't listed
export const socketShares = (item: SocketItem): SocketShare[] => {
  if (!item.socketed?.length) return [];
  const adds = socketedAdds(item);
  if (adds.size === 0) return [];
  const shares: SocketShare[] = [];
  (item.modifiers ?? []).forEach((modifier) => {
    const name = modifier.name;
    if (typeof name !== "string") return;
    const values = numbers(modifier);
    const parts = PSEUDO[name];
    if (parts) {
      const amount = values[0];
      if (!Number.isFinite(amount)) return;
      const split = parts.map((part) => {
        const added = adds.get(identityKey(part, []))?.amount ?? 0;
        return { name: part, own: amount - added, added };
      });
      if (split.every((part) => part.added === 0)) return;
      const even = split.every((part) => part.added === split[0].added);
      shares.push({ modifier, own: split[0].own, added: split[0].added, parts: even ? undefined : split });
      return;
    }
    const added = adds.get(identityKey(name, values));
    const amount = values[layoutOf(name).amount];
    if (!added || added.amount === 0 || !Number.isFinite(amount)) return;
    const share: SocketShare = { modifier, own: amount - added.amount, added: added.amount };
    if (DAMAGE_RANGES.has(name)) {
      share.addedMax = added.max;
      share.ownMax = share.own !== 0 && Number.isFinite(values[1]) ? values[1] : 0; // the item's own roll came first
    }
    shares.push(share);
  });
  return shares;
};

// The item's own mods: the merged list minus what socketed items add. Mods only they give are left out; an
// all-res/all-attributes mod whose four stats differ without them becomes those stats. Unchanged mods are the
// same objects, and a runeword or an item nothing socketed adds to returns its own list
export const ownModifiers = (item: SocketItem): ItemModifier[] => {
  const merged = item.modifiers ?? [];
  if (item.is_runeword) return merged;
  const shares = new Map(socketShares(item).map((share) => [share.modifier, share]));
  if (shares.size === 0) return merged;
  const own: ItemModifier[] = [];
  merged.forEach((modifier) => {
    const share = shares.get(modifier);
    if (!share) {
      own.push(modifier);
      return;
    }
    if (share.parts) {
      share.parts.forEach((part) => {
        if (part.own === 0) return;
        const flags: ItemModifier = {};
        if (modifier.corrupted) flags.corrupted = true;
        if (modifier.desecrated) flags.desecrated = true;
        own.push({ ...flags, name: part.name, values: [part.own] });
      });
      return;
    }
    if (share.own === 0) return;
    const values = [...(modifier.values ?? [])];
    values[layoutOf(modifier.name ?? "").amount] = share.own;
    own.push({ ...modifier, values });
  });
  return own;
};

// An amount as the site's label shows it (poison: its total over the duration)
export const shownAmount = (modifier: ItemModifier, amount: number): number => {
  if (modifier.name !== POISON) return amount;
  const frames = numbers(modifier)[2];
  return Number.isFinite(frames) ? Math.round((amount * frames) / 256) : amount;
};

// --- Re-checking a search ---

// A query part this reader doesn't know: the listing then counts as a match, never dropped on a guess
class Unsupported extends Error {}

const isOperators = (value: unknown): value is Doc =>
  isRecord(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => key.startsWith("$"));

// Every value a dotted path reaches, as MongoDB walks it: arrays on the way are walked into, a number indexes
const reach = (value: unknown, path: string[]): unknown[] => {
  if (path.length === 0) return value === undefined ? [] : [value];
  const [head, ...rest] = path;
  if (Array.isArray(value)) {
    if (/^\d+$/.test(head)) return Number(head) < value.length ? reach(value[Number(head)], rest) : [];
    return value.flatMap((element) => (isRecord(element) ? reach(element, path) : []));
  }
  return isRecord(value) && head in value ? reach(value[head], rest) : [];
};

// A reached array stands for itself and for each of its elements
const candidates = (values: unknown[]) => values.flatMap((value) => (Array.isArray(value) ? [value, ...value] : [value]));

const same = (a: unknown, b: unknown) => (typeof a === "object" || typeof b === "object" ? stableStringify(a) === stableStringify(b) : a === b);

const equals = (values: unknown[], expected: unknown) =>
  expected === null
    ? values.length === 0 || candidates(values).some((value) => value === null)
    : candidates(values).some((value) => same(value, expected));

const compare = (values: unknown[], bound: unknown, test: (order: number) => boolean) =>
  candidates(values).some(
    (value) =>
      ((typeof value === "number" && typeof bound === "number") || (typeof value === "string" && typeof bound === "string")) &&
      test(value < bound ? -1 : value > bound ? 1 : 0)
  );

const regexMatch = (values: unknown[], pattern: unknown, options: unknown) => {
  const flags = typeof options === "string" ? options : "";
  if (typeof pattern !== "string" || !/^[imsu]*$/.test(flags)) throw new Unsupported("$regex");
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch {
    throw new Unsupported("$regex");
  }
  return candidates(values).some((value) => typeof value === "string" && regex.test(value));
};

const elemMatch = (values: unknown[], condition: Doc) =>
  values.some(
    (value) =>
      Array.isArray(value) &&
      value.some((element) => (isOperators(condition) ? matchOperators([element], condition) : isRecord(element) && matchDocument(element, condition)))
  );

const matchOperators = (values: unknown[], operators: Doc): boolean =>
  Object.entries(operators).every(([operator, argument]) => {
    switch (operator) {
      case "$in":
        if (!Array.isArray(argument)) throw new Unsupported(operator);
        return argument.some((item) => equals(values, item));
      case "$nin":
        if (!Array.isArray(argument)) throw new Unsupported(operator);
        return !argument.some((item) => equals(values, item));
      case "$ne":
        return !equals(values, argument);
      case "$gt":
        return compare(values, argument, (order) => order > 0);
      case "$gte":
        return compare(values, argument, (order) => order >= 0);
      case "$lt":
        return compare(values, argument, (order) => order < 0);
      case "$lte":
        return compare(values, argument, (order) => order <= 0);
      case "$exists":
        return (values.length > 0) === Boolean(argument);
      case "$regex":
        return regexMatch(values, argument, operators.$options);
      case "$options":
        return true; // read with $regex
      case "$all":
        if (!Array.isArray(argument)) throw new Unsupported(operator);
        return (
          argument.length > 0 &&
          argument.every((item) =>
            isRecord(item) && Object.keys(item).length === 1 && isRecord(item.$elemMatch) ? elemMatch(values, item.$elemMatch) : equals(values, item)
          )
        );
      case "$elemMatch":
        if (!isRecord(argument)) throw new Unsupported(operator);
        return elemMatch(values, argument);
      default:
        throw new Unsupported(operator);
    }
  });

const matchField = (doc: Doc, path: string, condition: unknown) => {
  const values = reach(doc, path.split("."));
  return isOperators(condition) ? matchOperators(values, condition) : equals(values, condition);
};

const matchDocument = (doc: Doc, query: Doc): boolean =>
  Object.entries(query).every(([key, condition]) => {
    if (key === "$or") return Array.isArray(condition) && condition.some((branch) => isRecord(branch) && matchDocument(doc, branch));
    if (key.startsWith("$")) throw new Unsupported(key);
    return matchField(doc, key, condition);
  });

const readsMods = (key: string) => key === "item.modifiers" || key.startsWith("item.modifiers.");

// Would the search still match this listing if its mods were only its own? Only the parts of the query that
// read item.modifiers can change, and $or branches, which may hold them; the server checked the rest. The
// listing needs the fields ownCheckFields names
export const ownStillMatches = (listing: Doc, query: Doc): boolean => {
  const item = listing.item;
  if (!isRecord(item) || !Array.isArray(item.modifiers)) return true;
  const own = ownModifiers(item as SocketItem);
  if (own === item.modifiers) return true;
  const ownListing = { ...listing, item: { ...item, modifiers: own } };
  try {
    return Object.entries(query).every(([key, condition]) => {
      if (key === "$or") {
        return Array.isArray(condition) && condition.some((branch) => isRecord(branch) && matchDocument(ownListing, branch));
      }
      return readsMods(key) ? matchField(ownListing, key, condition) : true;
    });
  } catch (error) {
    if (error instanceof Unsupported) return true;
    throw error;
  }
};

// Mod names one $elemMatch on item.modifiers asks for; null: none it can tell
const namesInElemMatch = (match: unknown): string[] | null => {
  if (!isRecord(match)) return null;
  const { name } = match;
  if (typeof name === "string") return [name];
  if (isRecord(name) && Array.isArray(name.$in)) return name.$in.filter((item): item is string => typeof item === "string");
  if (Array.isArray(match.$or)) {
    const names = match.$or.map((part) => (isRecord(part) && typeof part.name === "string" ? part.name : null));
    if (names.every((part): part is string => part !== null)) return names;
  }
  return null;
};

const RELATED = Object.entries(PSEUDO).map(([name, parts]) => [name, ...parts]);

// The mod names a query's conditions read, with all-res/all-attributes and their four stats together (a jewel
// with any of them can change the others). [] when no condition reads mods; null when one does but names none
export const modNamesIn = (query: Doc): string[] | null => {
  const names = new Set<string>();
  let unknown = false;
  const collect = (list: string[] | null) => {
    if (list) list.forEach((name) => names.add(name));
    else unknown = true;
  };
  const visit = (part: Doc) =>
    Object.entries(part).forEach(([key, value]) => {
      if (key === "$or") {
        if (Array.isArray(value)) value.filter(isRecord).forEach(visit);
      } else if (key === "item.modifiers") {
        if (isRecord(value) && Array.isArray(value.$all)) {
          value.$all.forEach((entry) => collect(isRecord(entry) ? namesInElemMatch(entry.$elemMatch) : null));
        } else collect(isRecord(value) ? namesInElemMatch(value.$elemMatch) : null);
      } else if (key === "item.modifiers.name") {
        if (typeof value === "string") collect([value]);
        else if (isRecord(value)) {
          const lists = [value.$in, value.$nin, value.$all].filter(Array.isArray);
          collect(lists.length > 0 ? lists.flat().filter((item): item is string => typeof item === "string") : null);
        } else collect(null);
      } else if (readsMods(key)) collect(null);
    });
  visit(query);
  if (unknown) return null;
  RELATED.forEach((group) => {
    if (group.some((name) => names.has(name))) group.forEach((name) => names.add(name));
  });
  return [...names];
};

// The fields an $or reads, for a $select: a path stops before its first array index
const pathsIn = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(pathsIn);
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, inner]) => {
    if (key === "$or") return pathsIn(inner);
    if (key.startsWith("$")) return [];
    const segments = key.split(".");
    const index = segments.findIndex((segment) => /^\d+$/.test(segment));
    return [index < 0 ? key : segments.slice(0, index).join(".")].filter((path) => path !== "");
  });
};

// What a listing needs for ownStillMatches(listing, query)
export const ownCheckFields = (query: Doc): string[] => [
  "item.is_runeword",
  "item.modifiers",
  "item.socketed.modifiers",
  ...pathsIn(query.$or),
];

// A $select without path collisions: the server refuses "item" next to "item.name"
export const selectPaths = (paths: string[]): string[] => {
  const unique = [...new Set(paths)].sort();
  return unique.filter((path) => !unique.some((other) => other !== path && path.startsWith(`${other}.`)));
};
