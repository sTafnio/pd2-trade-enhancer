// Plain-DOM building blocks for the filter column. Text from the site or the user only ever goes in
// through textContent/value, never innerHTML.
import { toNumber } from "./model";
import type { Range, Tri } from "./model";

type Child = Node | string | null | undefined | false;

export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | undefined> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === false) return;
    if (key === "class") node.className = String(value);
    else if (key === "text") node.textContent = String(value);
    else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, String(value));
  });
  children.forEach((child) => {
    if (child !== null && child !== undefined && child !== false) node.append(child);
  });
  return node;
};

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const field = (label: string, ...controls: Child[]) =>
  h("div", { class: "pd2te-field" }, h("div", { class: "pd2te-label", text: label }), ...controls);

export const row = (...children: Child[]) => h("div", { class: "pd2te-row" }, ...children);

export const button = (label: string, onClick: () => void, className = "") => {
  const node = h("button", { type: "button", class: `pd2te-btn ${className}`.trim(), text: label });
  node.addEventListener("click", onClick);
  return node;
};

export const numberInput = (
  value: number | undefined,
  placeholder: string,
  onChange: (value: number | undefined) => void
) => {
  const input = h("input", { class: "pd2te-input pd2te-number", type: "number", placeholder, autocomplete: "off" });
  if (value !== undefined) input.value = String(value);
  input.addEventListener("change", () => onChange(toNumber(input.value)));
  return input;
};

export const textInput = (value: string, placeholder: string, onChange: (value: string) => void, maxLength?: number) => {
  const input = h("input", { class: "pd2te-input", type: "text", placeholder, autocomplete: "off", maxlength: maxLength });
  input.value = value;
  input.addEventListener("change", () => onChange(input.value));
  return input;
};

export const selectInput = <T extends string>(options: Option<T>[], value: T, onChange: (value: T) => void) => {
  const select = h("select", { class: "pd2te-input" });
  options.forEach((option) => {
    const node = h("option", { value: option.value, text: option.label });
    if (option.value === value) node.selected = true;
    select.append(node);
  });
  select.addEventListener("change", () => onChange(select.value as T));
  return select;
};

export const triSelect = (value: Tri, labels: [string, string, string], onChange: (value: Tri) => void) =>
  selectInput<Tri>(
    [
      { value: "any", label: labels[0] },
      { value: "yes", label: labels[1] },
      { value: "no", label: labels[2] },
    ],
    value,
    onChange
  );

export const rangeInputs = (range: Range, onChange: (range: Range) => void, labels: [string, string] = ["Min", "Max"]) => {
  const current: Range = { ...range };
  const emit = () => {
    const next: Range = {};
    if (current.min !== undefined) next.min = current.min;
    if (current.max !== undefined) next.max = current.max;
    onChange(next);
  };
  return row(
    numberInput(range.min, labels[0], (min) => {
      current.min = min;
      emit();
    }),
    numberInput(range.max, labels[1], (max) => {
      current.max = max;
      emit();
    })
  );
};

export const checkbox = (label: string, checked: boolean, onChange: (checked: boolean) => void, title?: string) => {
  const input = h("input", { type: "checkbox", class: "pd2te-checkbox" });
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  return h("label", { class: "pd2te-check", title }, input, h("span", { text: label }));
};

const chips = (items: Option[], onRemove: (value: string) => void) =>
  h(
    "div",
    { class: "pd2te-chips" },
    ...items.map((item) => {
      const remove = h("button", { type: "button", class: "pd2te-chip-remove", title: "Remove", text: "×" });
      remove.addEventListener("click", () => onRemove(item.value));
      return h("span", { class: "pd2te-chip", title: item.label }, h("span", { class: "pd2te-chip-text", text: item.label }), remove);
    })
  );

// Labels must be unique to map a typed label back to its value; duplicates get their value appended
const uniqueLabels = (options: Option[]): Map<string, string> => {
  const counts = new Map<string, number>();
  options.forEach((option) => counts.set(option.label, (counts.get(option.label) ?? 0) + 1));
  const byLabel = new Map<string, string>();
  options.forEach((option) => {
    const label = (counts.get(option.label) ?? 0) > 1 ? `${option.label} [${option.value}]` : option.label;
    if (!byLabel.has(label)) byLabel.set(label, option.value);
  });
  return byLabel;
};

// Type-ahead over a long list: the whole list drops down on focus, narrows as you type, and Enter or a click
// picks. A label or a raw value (a modifier key) typed exactly counts too. With `current` it holds one choice:
// the input shows that option's label, focusing it shows the whole list with the choice marked, and leaving
// without picking puts the label back
const MAX_DROPDOWN_ROWS = 80;

interface TypeaheadProps {
  options: Option[];
  placeholder: string;
  onPick: (value: string) => void;
  current?: string;
}

const typeahead = ({ options, placeholder, onPick, current }: TypeaheadProps) => {
  const single = current !== undefined;
  const entries = [...uniqueLabels(options).entries()].map(([label, value]) => ({
    label,
    value,
    lower: label.toLowerCase(),
    lowerValue: value.toLowerCase(),
  }));
  type Entry = (typeof entries)[number];
  let chosen = entries.find((entry) => single && entry.value === current) ?? null;
  const input = h("input", {
    class: "pd2te-input pd2te-picker-input",
    type: "text",
    placeholder,
    autocomplete: "off",
    role: "combobox",
    "aria-expanded": "false",
  });
  input.value = chosen?.label ?? "";
  const list = h("div", { class: "pd2te-dropdown pd2te-hidden", role: "listbox" });
  let shown: Entry[] = [];
  let active = -1;
  let navigated = false; // arrow keys moved the highlight: Enter picks it even with nothing typed

  const matching = (): Entry[] => {
    const text = input.value.trim().toLowerCase();
    if (text === "") return entries;
    const starts: Entry[] = [];
    const contains: Entry[] = [];
    entries.forEach((entry) => {
      if (entry.lower.startsWith(text)) starts.push(entry);
      else if (entry.lower.includes(text) || entry.lowerValue === text) contains.push(entry);
    });
    return [...starts, ...contains];
  };
  const close = () => {
    list.classList.add("pd2te-hidden");
    input.setAttribute("aria-expanded", "false");
    active = -1;
    navigated = false;
  };
  // One choice: back to showing the chosen label
  const restore = () => {
    input.value = chosen?.label ?? "";
    input.placeholder = placeholder;
    input.classList.remove("pd2te-invalid");
  };
  const choose = (entry: Entry) => {
    if (single) chosen = entry;
    input.value = single ? entry.label : "";
    input.classList.remove("pd2te-invalid");
    close();
    if (single) input.blur();
    onPick(entry.value);
  };
  const highlight = () => {
    [...list.children].forEach((row, index) => row.classList.toggle("active", index === active));
    if (active >= 0) list.children[active]?.scrollIntoView({ block: "nearest" });
  };
  const open = () => {
    const matches = matching();
    shown = single ? matches : matches.slice(0, MAX_DROPDOWN_ROWS);
    const typed = input.value.trim() !== "";
    active = typed && shown.length > 0 ? 0 : chosen ? shown.indexOf(chosen) : -1;
    list.replaceChildren(
      ...shown.map((entry) => {
        const row = h("div", {
          class: entry === chosen ? "pd2te-dropdown-row pd2te-current" : "pd2te-dropdown-row",
          role: "option",
          text: entry.label,
          title: single ? entry.label : entry.value,
        });
        row.addEventListener("mousedown", (event) => {
          event.preventDefault(); // keeps the input focused, so blur doesn't close the list first
          choose(entry);
        });
        return row;
      }),
      matches.length > shown.length ? h("div", { class: "pd2te-dropdown-note", text: `${matches.length - shown.length} more, keep typing` }) : "",
      matches.length === 0 ? h("div", { class: "pd2te-dropdown-note", text: "No matches" }) : ""
    );
    highlight();
    list.classList.remove("pd2te-hidden");
    input.setAttribute("aria-expanded", "true");
  };
  const add = () => {
    const text = input.value.trim();
    if (active >= 0 && shown[active] && (text !== "" || navigated)) {
      choose(shown[active]);
      return;
    }
    if (text === "") {
      close();
      return;
    }
    const lower = text.toLowerCase();
    const entry = entries.find((item) => item.lower === lower) ?? entries.find((item) => item.lowerValue === lower);
    if (!entry) {
      input.classList.add("pd2te-invalid");
      return;
    }
    choose(entry);
  };
  input.addEventListener("focus", () => {
    if (single) {
      // Typing starts a fresh search; the choice stays readable as the placeholder
      input.placeholder = chosen?.label ?? placeholder;
      input.value = "";
    }
    open();
  });
  input.addEventListener("input", () => {
    input.classList.remove("pd2te-invalid");
    navigated = false;
    open();
  });
  input.addEventListener("blur", () => {
    close();
    if (single) restore();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (list.classList.contains("pd2te-hidden")) open();
      if (shown.length === 0) return;
      active = event.key === "ArrowDown" ? (active + 1) % shown.length : (active - 1 + shown.length) % shown.length;
      navigated = true;
      highlight();
    } else if (event.key === "Enter") {
      event.preventDefault();
      add();
    } else if (event.key === "Escape") {
      close();
      if (single) input.blur();
    }
  });
  return { input, list };
};

// Adds values from a long list: Enter or a click on a row
export const picker = (options: Option[], placeholder: string, onPick: (value: string) => void) => {
  const { input, list } = typeahead({ options, placeholder, onPick });
  return h("div", { class: "pd2te-picker" }, input, list);
};

// One value from a long list, shown by its label; picking calls onPick (also for the current value)
export const combo = (options: Option[], current: string, placeholder: string, onPick: (value: string) => void) => {
  const { input, list } = typeahead({ options, placeholder, onPick, current });
  return h("div", { class: "pd2te-picker" }, input, list);
};

interface MultiPickerProps {
  options: Option[];
  selected: string[];
  placeholder: string;
  onChange: (selected: string[]) => void;
  inline?: boolean; // checkboxes instead of type-ahead (short lists)
  columns?: number;
}

// Several values of one field: checkboxes for short lists, chips plus a type-ahead for long ones.
// Values the list doesn't know (from a saved filter) still show as chips, by their raw value
export const multiPicker = ({ options, selected, placeholder, onChange, inline, columns }: MultiPickerProps) => {
  // The live selection. The checkboxes stay on screen across changes, so every click must build on the
  // clicks before it, not on the list this control was drawn with
  const current = [...selected];
  const toggle = (value: string, on: boolean) => {
    const index = current.indexOf(value);
    if (on === index >= 0) return;
    if (on) current.push(value);
    else current.splice(index, 1);
    onChange([...current]);
  };
  if (inline ?? options.length <= 12) {
    const grid = h(
      "div",
      { class: "pd2te-check-grid" },
      ...options.map((option) =>
        checkbox(option.label, current.includes(option.value), (checked) => toggle(option.value, checked))
      )
    );
    if (columns) grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    return grid;
  }
  const labelOf = (value: string) => options.find((option) => option.value === value)?.label ?? value;
  return h(
    "div",
    { class: "pd2te-multi" },
    chips(
      current.map((value) => ({ value, label: labelOf(value) })),
      (value) => toggle(value, false)
    ),
    picker(options, placeholder, (value) => toggle(value, true))
  );
};

const PANEL_STATE_KEY = "pd2te-filter-panels";

const readPanelState = (): Record<string, boolean> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PANEL_STATE_KEY) ?? "{}");
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

const savePanelState = (id: string, open: boolean) => {
  try {
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ ...readPanelState(), [id]: open }));
  } catch {
    // storage blocked: the panel just opens again next time
  }
};

// A collapsible panel in the site's style; open/closed is remembered per panel
export const panel = (id: string, title: string, body: HTMLElement, defaultOpen: boolean, extra?: Node) => {
  let open = readPanelState()[id] ?? defaultOpen;
  const toggle = h("span", { class: "pd2te-panel-toggle", text: open ? "−" : "+" });
  const header = h(
    "div",
    { class: `pd2te-panel-header${open ? " open" : ""}` },
    h("h2", { class: "pd2te-panel-title", text: title }),
    extra,
    toggle
  );
  body.classList.add("pd2te-panel-body");
  body.classList.toggle("pd2te-hidden", !open);
  header.addEventListener("click", (event) => {
    if (extra && extra.contains(event.target as Node)) return; // controls in the header don't toggle it
    open = !open;
    body.classList.toggle("pd2te-hidden", !open);
    header.classList.toggle("open", open);
    toggle.textContent = open ? "−" : "+";
    savePanelState(id, open);
  });
  return h("div", { class: "pd2te-panel" }, header, body);
};

export interface Section {
  readonly el: HTMLElement;
  refresh(): void;
}

// A piece of the column that can rebuild itself after a structural change (a chip or a row added). A section
// the column has since replaced stays as it is: a late callback (after a save) mustn't rebuild it
export const makeSection = (build: (refresh: () => void) => HTMLElement): Section => {
  let el: HTMLElement;
  const refresh = () => {
    if (!el.isConnected) return;
    const next = build(refresh);
    el.replaceWith(next);
    el = next;
  };
  el = build(refresh);
  return {
    get el() {
      return el;
    },
    refresh,
  };
};
