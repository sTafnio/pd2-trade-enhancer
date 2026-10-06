// Weighted sums of mod values: "+5 to Blade Sentinel" as All Skills + Assassin Skills + Traps + Blade Sentinel
// (class-only and oskill), resistances added up, or life counting 3 per point of vitality. The server can't add
// (it refuses $expr), so sums are worked out here, on the listings that could reach them: sum-search.ts narrows
// those down on the server first, with sumCandidates. A search carries its sums in the form as SUMS_MARKER, a
// condition on a field no listing has: every listing meets it, and saved filters, links and the livesearch all
// carry it along. Values are the listing's own numbers (item_hp_perlevel 0.5 is half a life per level), so a
// weight turns them into whatever the sum counts.
import { PSEUDO, layoutOf, ownModifiers } from "./socketed";
import type { ItemModifier, SocketItem } from "./socketed";

type Dict = Record<string, unknown>;

export interface SumTerm {
  key: string; // a property key: "fireresist", "item_addskill_tab{48}"
  weight: number;
}

export interface SumSpec {
  terms: SumTerm[];
  min?: number; // a sum with terms needs one above 0: compile() refuses it otherwise
  max?: number;
}

export const SUMS_MARKER = "pd2te_sums";
// Sorts by the first sum. The page's search with it is answered here (sum-search.ts), never by the server
export const SUM_SORT_FIELD = "pd2te_sum";

const isRecord = (value: unknown): value is Dict => typeof value === "object" && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

// A term as the mods it reads: their name, the values a "name{fixed}" key pins, the slot with the amount
interface Slot {
  name: string;
  fixed: number[];
  amount: number;
  weight: number;
}

const BRACE = /^(\w+)\{([\d,]+)\}$/;

const slotOf = (key: string, weight: number): Slot | null => {
  if (key.includes("|")) return null; // "max_damage|maxdamage|...": one stat under several names, counted twice
  const brace = key.match(BRACE);
  const name = brace ? brace[1] : key;
  const fixed = brace ? brace[2].split(",").map(Number) : [];
  const layout = layoutOf(name);
  // Mods that differ by skill, class or tab count only pinned to one ("item_singleskill{257}"): left open, a
  // term would add up every one of them on the item. The elemental skill bonuses' first slot is always 0
  if (!name.startsWith("item_elemskill_") && fixed.length < layout.identity.length) return null;
  return { name, fixed, amount: brace ? fixed.length : layout.amount, weight };
};

// Can this property be a term? All resistances and all attributes can't: they count toward each of their four
// stats, so a sum of the four resistances counts all-res four times on its own
export const isSummable = (key: string) => !(key in PSEUDO) && slotOf(key, 1) !== null;

// The terms as slots: all-res / all-attributes become their four stats, a key listed twice adds up
const slotsOf = (spec: SumSpec): Slot[] => {
  const weights = new Map<string, number>();
  spec.terms.forEach(({ key, weight }) => {
    if (!isNumber(weight)) return;
    (PSEUDO[key] ?? [key]).forEach((part) => weights.set(part, (weights.get(part) ?? 0) + weight));
  });
  return [...weights].flatMap(([key, weight]) => {
    const slot = weight === 0 ? null : slotOf(key, weight);
    return slot ? [slot] : [];
  });
};

export interface SumPart {
  name: string;
  label?: string; // the mod as the listing shows it; none on a stat split off all-res by ownModifiers
  amount: number;
  weight: number;
}

export interface SumResult {
  total: number;
  parts: SumPart[];
}

// What a list of mods adds up to. All-res and all-attributes count once for each of their stats in the sum
export const sumOf = (modifiers: ItemModifier[], spec: SumSpec): SumResult => {
  const slots = slotsOf(spec);
  const parts: SumPart[] = [];
  let total = 0;
  modifiers.forEach((modifier) => {
    const { name } = modifier;
    if (typeof name !== "string" || !Array.isArray(modifier.values)) return;
    const values = modifier.values.map((value) => (typeof value === "number" ? value : Number(value)));
    const names = PSEUDO[name] ?? [name];
    let weight = 0;
    let amount = NaN;
    slots.forEach((slot) => {
      if (!names.includes(slot.name) || slot.fixed.some((value, index) => values[index] !== value)) return;
      const value = PSEUDO[name] ? values[0] : values[slot.amount];
      if (!isNumber(value)) return;
      weight += slot.weight;
      amount = value;
    });
    if (weight === 0 || !isNumber(amount)) return;
    total += weight * amount;
    const label = modifier.label && modifier.label !== "undefined" ? modifier.label : undefined;
    parts.push(label ? { name, label, amount, weight } : { name, amount, weight });
  });
  return { total, parts };
};

const EPSILON = 1e-9; // weights like 0.5 add up in floating point

export const reaches = (spec: SumSpec, total: number) =>
  (spec.min === undefined || total >= spec.min - EPSILON) && (spec.max === undefined || total <= spec.max + EPSILON);

// Every sum on an item; with `own`, on its own stats (what socketed jewels, runes and gems add left out)
export const itemSums = (item: SocketItem, sums: SumSpec[], own: boolean): SumResult[] => {
  const modifiers = own ? ownModifiers(item) : (item.modifiers ?? []);
  return sums.map((spec) => sumOf(modifiers, spec));
};

export const reachesAll = (sums: SumSpec[], results: SumResult[]) => results.every((result, index) => reaches(sums[index], result.total));

// Up to two decimals: weights can make any number
export const formatAmount = (value: number) => String(Math.round(value * 100) / 100);

// "+2 to All Skills, +19 to Vitality ×3"; `labelOf` names a part the listing gave no label
export const describeParts = (parts: SumPart[], labelOf: (name: string) => string) =>
  parts
    .map((part) => {
      const label = part.label ?? labelOf(part.name).replace(/\bX\b/, formatAmount(part.amount));
      return `${label}${part.weight === 1 ? "" : ` ×${formatAmount(part.weight)}`}`;
    })
    .join(", ");

// What a listing needs to reach the sum, as $or branches for the server. With k terms, a total of at least
// `min` needs one term worth at least min / k: the largest part is never below the average, whatever the signs.
// All-res and all-attributes stand in for their four stats, never next to them, so they add no term of their
// own. null: no minimum above 0 to narrow by
export const sumCandidates = (spec: SumSpec): Dict[] | null => {
  const slots = slotsOf(spec);
  if (slots.length === 0 || spec.min === undefined || !(spec.min > 0)) return null;
  const share = spec.min / slots.length;
  const bound = (weight: number) => (weight > 0 ? { $gte: share / weight } : { $lte: share / weight });
  // $all, so a branch merges with other conditions on item.modifiers (two $elemMatch on one field can't)
  const branch = (match: Dict) => ({ "item.modifiers": { $all: [{ $elemMatch: match }] } });
  const branches = slots.map((slot) => {
    const match: Dict = { name: slot.name };
    slot.fixed.forEach((value, index) => {
      match[`values.${index}`] = value;
    });
    match[`values.${slot.amount}`] = bound(slot.weight);
    return branch(match);
  });
  Object.entries(PSEUDO).forEach(([pseudo, stats]) => {
    const weight = slots.filter((slot) => stats.includes(slot.name)).reduce((total, slot) => total + slot.weight, 0);
    if (weight !== 0) branches.push(branch({ name: pseudo, "values.0": bound(weight) }));
  });
  return branches;
};

// --- In the form ---

const encode = (spec: SumSpec) =>
  JSON.stringify({ min: spec.min, max: spec.max, terms: spec.terms.map((term) => [term.key, term.weight]) });

const decode = (text: unknown): SumSpec | null => {
  if (typeof text !== "string") return null;
  try {
    const raw: unknown = JSON.parse(text);
    if (!isRecord(raw) || !Array.isArray(raw.terms)) return null;
    const terms: SumTerm[] = [];
    for (const term of raw.terms) {
      if (!Array.isArray(term) || typeof term[0] !== "string" || !isNumber(term[1])) return null;
      terms.push({ key: term[0], weight: term[1] });
    }
    const spec: SumSpec = { terms };
    if (isNumber(raw.min)) spec.min = raw.min;
    if (isNumber(raw.max)) spec.max = raw.max;
    return spec;
  } catch {
    return null;
  }
};

// {$nin: [...]} on a field no listing has: every listing meets it, the server included
export const sumsMarkerValue = (sums: SumSpec[]) => ({ $nin: sums.map(encode) });

// The sums a marker value holds; null: not one we wrote
export const sumsFromMarker = (value: unknown): SumSpec[] | null => {
  if (!isRecord(value) || Object.keys(value).length !== 1 || !Array.isArray(value.$nin) || value.$nin.length === 0) return null;
  const sums = value.$nin.map(decode);
  return sums.every((spec): spec is SumSpec => spec !== null) ? sums : null;
};

// The sums a search asks for
export const sumsOf = (query: Dict): SumSpec[] => sumsFromMarker(query[SUMS_MARKER]) ?? [];

// A sum from saved metadata; null: not a sum
export const sanitizeSum = (raw: unknown): SumSpec | null => {
  if (!isRecord(raw) || !Array.isArray(raw.terms)) return null;
  const spec: SumSpec = {
    terms: raw.terms
      .filter(isRecord)
      .filter((term) => typeof term.key === "string" && isNumber(term.weight))
      .map((term) => ({ key: term.key as string, weight: term.weight as number })),
  };
  if (isNumber(raw.min)) spec.min = raw.min;
  if (isNumber(raw.max)) spec.max = raw.max;
  return spec;
};
