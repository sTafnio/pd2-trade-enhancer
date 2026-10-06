// "Filter from this item": a small panel with an item's name, type, base, rarity, sockets and corruption
// outcome as checkboxes, and its mods with the value prefilled as the minimum. The market's result cards
// (cards.ts) and the create page's selected item (create/item-filter.ts) open it; each says what its
// buttons do with the ticked ones.
import { flattenCodes, toNumber } from "./model";
import type { FilterModel, ModCondition } from "./model";
import { SOCKETS_ROLL, propertyLabel } from "./site";
import type { Vocab } from "./site";
import { ownModifiers } from "./socketed";
import type { ItemModifier } from "./socketed";
import { button, checkbox, h, numberInput } from "./controls";

export interface PanelItem {
  name?: string;
  base?: { name?: string; type_code?: string } | null;
  base_code?: string;
  quality?: { name?: string } | null;
  is_runeword?: boolean;
  is_ethereal?: boolean;
  corrupted?: boolean;
  socket_count?: number;
  modifiers?: ItemModifier[];
  socketed?: { modifiers?: ItemModifier[] | null }[] | null; // jewels, runes, gems; item.modifiers includes theirs
  corruptions?: string[]; // stats the corruption touched, helper names ("dmg%") included
  desecrations?: string[]; // the same for the desecration
}

// Adds the ticked ones to a model
export type ApplyPicked = (model: FilterModel) => void;

export interface PanelAction {
  label: string;
  title: string;
  run(apply: ApplyPicked): void; // the panel closes after it
}

export interface ItemPanelOptions {
  vocab: Vocab;
  ownStats: boolean; // the search ignores socketed items: offer the item's own mod values
  actions: PanelAction[];
}

// Pseudo-mods the site's cards hide too, or that our tri-states cover ("desecrator" is the desecration's "Corrupt" line)
const SKIPPED_MODIFIERS = new Set(["corrupted", "desecrated", "desecrator", "item_shiny_appearance", "item_splashonhit"]);

// The type entry and base entry the item belongs to, as the filter form names them
const typeCodeFor = (item: PanelItem, vocab: Vocab) => {
  const code = item.base?.type_code;
  return code ? vocab.types.find((type) => flattenCodes([type.code]).includes(code)) : undefined;
};

const baseCodeFor = (item: PanelItem, vocab: Vocab) => {
  const code = item.base_code;
  return code ? vocab.bases.find((base) => flattenCodes([base.code]).includes(code)) : undefined;
};

interface ModChoice {
  condition: ModCondition; // without the value; `value` is the slot the minimum goes into
  value?: number;
  label: string;
}

// An item's modifier as the filter that would find it again: same slot layout as the site's builder
const modChoice = (modifier: ItemModifier, vocab: Vocab): ModChoice | null => {
  const name = modifier.name;
  if (!name || SKIPPED_MODIFIERS.has(name)) return null;
  const label = modifier.label && modifier.label !== "undefined" ? modifier.label : propertyLabel(vocab, name);
  const values = Array.isArray(modifier.values) ? modifier.values.map(toNumber) : [];
  const at = (index: number) => values[index];

  if (vocab.skillProperties.has(name)) {
    const condition: ModCondition = { key: name };
    if (at(1) !== undefined) condition.skill = at(1);
    if (at(0) !== undefined) condition.skillLevelMin = at(0);
    return { condition, value: at(2), label };
  }
  if (name === "item_aura") {
    const condition: ModCondition = { key: name };
    if (at(0) !== undefined) condition.aura = at(0);
    return { condition, value: at(1), label };
  }
  if (name.includes("item_elemskill_")) return { condition: { key: name }, value: at(1), label };
  if (at(0) !== undefined && vocab.propertyByKey.has(`${name}{${at(0)}}`)) {
    return { condition: { key: `${name}{${at(0)}}` }, value: at(1), label };
  }
  return { condition: { key: name }, value: at(0), label };
};

interface Choice {
  checked: boolean;
  apply: (model: FilterModel) => void;
}

export const buildItemPanel = (item: PanelItem, { vocab, ownStats, actions }: ItemPanelOptions): HTMLElement => {
  const choices: Choice[] = [];
  const rows: HTMLElement[] = [];

  const option = (label: string, checked: boolean, apply: (model: FilterModel) => void) => {
    const choice: Choice = { checked, apply };
    choices.push(choice);
    rows.push(
      h(
        "div",
        { class: "pd2te-item-row" },
        checkbox(label, checked, (value) => {
          choice.checked = value;
        })
      )
    );
  };

  // A unique's or set item's own name; other items carry their base's name, which Base covers
  const name = item.name;
  if (name && name !== item.base?.name && vocab.names.includes(name)) {
    option(`Name: ${name}`, true, (model) => addUnique(model.names, name));
  }
  const type = typeCodeFor(item, vocab);
  if (type) option(`Type: ${type.display}`, true, (model) => addUnique(model.types, type.code));
  const base = baseCodeFor(item, vocab);
  if (base) option(`Base: ${base.display}`, false, (model) => addUnique(model.bases, base.code));
  const quality = item.is_runeword ? "Runeword" : item.quality?.name;
  if (quality) option(`Rarity: ${quality}`, true, (model) => addUnique(model.qualities, quality));
  if (typeof item.is_ethereal === "boolean") {
    option(item.is_ethereal ? "Ethereal" : "Not ethereal", false, (model) => {
      model.ethereal = item.is_ethereal ? "yes" : "no";
    });
  }
  if (typeof item.corrupted === "boolean") {
    option(item.corrupted ? "Corrupted" : "Not corrupted", false, (model) => {
      model.corrupted = item.corrupted ? "yes" : "no";
    });
  }
  if (typeof item.socket_count === "number") {
    const sockets = item.socket_count;
    option(`Sockets: ${sockets}`, false, (model) => addUnique(model.socketValues, sockets));
  }
  // What the corruption and the desecration rolled: the mods flagged as theirs (the stat lists also carry
  // helper names like "dmg%"), plus a sockets roll, which changes no mod and shows only in those lists
  const rolledLists = [...(item.corruptions ?? []), ...(item.desecrations ?? [])];
  const rolled = [
    ...new Set([
      ...(item.modifiers ?? []).filter((modifier) => modifier.corrupted || modifier.desecrated).map((modifier) => modifier.name),
      ...(rolledLists.includes(SOCKETS_ROLL) ? [SOCKETS_ROLL] : []),
    ]),
  ].filter((name): name is string => typeof name === "string" && name !== "");
  if (rolled.length > 0) {
    option(`Corruption rolled: ${rolled.map((name) => propertyLabel(vocab, name)).join(", ")}`, false, (model) => {
      // Replaces any corrupted-mod filter: "k of the old ones" mixed with "all of these" means neither
      model.corruptionOutcomes = rolled.map((name) => ({ key: name }));
      model.corruptionAtLeast = rolled.length; // this exact set
    });
  }

  // With "Ignore socketed jewels/runes" on, the item's own mods: what socketed items add doesn't count
  const merged = item.modifiers ?? [];
  const modRows: HTMLElement[] = [];
  (ownStats ? ownModifiers(item) : merged).forEach((modifier) => {
    const choice = modChoice(modifier, vocab);
    if (!choice) return;
    if (!merged.includes(modifier) && choice.value !== undefined) choice.label += ` · own ${choice.value}`;
    let minimum = choice.value;
    const entry: Choice = {
      checked: false,
      apply: (model) => {
        const condition: ModCondition = { ...choice.condition };
        if (minimum !== undefined) condition.min = minimum;
        const existing = model.mods.find((mod) => mod.key === condition.key);
        if (existing) Object.assign(existing, condition);
        else model.mods.push(condition);
      },
    };
    choices.push(entry);
    const tick = checkbox(choice.label, false, (value) => {
      entry.checked = value;
    });
    const min = numberInput(minimum, "Min", (value) => {
      minimum = value;
      entry.checked = true;
      (tick.querySelector("input") as HTMLInputElement).checked = true;
    });
    min.title = "Minimum for this mod; empty: just needs the mod";
    modRows.push(h("div", { class: "pd2te-item-row" }, tick, min));
  });

  const panel = h("div", { class: "pd2te-item-filter pd2te-own" });
  const close = () => panel.remove();
  const applyPicked: ApplyPicked = (model) =>
    choices.filter((choice) => choice.checked).forEach((choice) => choice.apply(model));
  const buttons = actions.map((action) => {
    const node = button(action.label, () => {
      action.run(applyPicked);
      close();
    });
    node.title = action.title;
    return node;
  });

  panel.append(
    h(
      "div",
      { class: "pd2te-item-filter-head" },
      h("span", { class: "pd2te-item-filter-title", text: "Filter from this item" }),
      button("×", close, "pd2te-btn-small pd2te-btn-danger")
    ),
    h("div", { class: "pd2te-item-section" }, ...rows),
    modRows.length > 0
      ? h(
          "div",
          { class: "pd2te-item-section" },
          h("div", {
            class: "pd2te-hint",
            text: ownStats
              ? "Mods, without what socketed items add: tick the ones the item must have; the number is the minimum"
              : "Mods: tick the ones the item must have; the number is the minimum",
          }),
          ...modRows
        )
      : h("div", { class: "pd2te-hint", text: "No mods on this item" }),
    h("div", { class: "pd2te-row pd2te-item-actions" }, ...buttons)
  );
  return panel;
};

export const addUnique = <T>(list: T[], value: T) => {
  if (!list.includes(value)) list.push(value);
};
