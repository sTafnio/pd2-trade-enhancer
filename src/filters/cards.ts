// "Filter" on every result card: turns the listing's item into filters. A small panel opens inside the
// card (item-panel.ts) with the item's mods, name, type, base, rarity, sockets and corruption outcome as
// checkboxes, plus "Only this seller". Mod lines socketed items add to get the split between the
// item's own amount and theirs, and with sums in the column a line under the mods says what they add up to.
// Cards are Vue-rendered and replaced on every search, so a MutationObserver on the market page re-adds the
// button and the notes wherever they're missing.
import { getMarketPage, isObject } from "../pd2/vue-bridge";
import { LISTING_LINK_SELECTOR, listingIdFromHref } from "../trade/hits";
import { SETTINGS_CHANGED_EVENT } from "../trade/livesearch-ui";
import { Settings } from "../trade/settings";
import { DEFAULT_SORT, emptyModel } from "./model";
import type { FilterModel } from "./model";
import { propertyLabel } from "./site";
import type { Vocab } from "./site";
import { shownAmount, socketShares } from "./socketed";
import type { SocketShare } from "./socketed";
import { buildItemPanel } from "./item-panel";
import type { PanelItem } from "./item-panel";
import { SUM_SORT_FIELD, describeParts, formatAmount, itemSums } from "./sums";
import type { SumSpec } from "./sums";
import { button, h } from "./controls";

interface CardListing {
  _id: string;
  user_id?: string | null;
  created_at?: string | null;
  bumped_at?: string | null;
  updated_at?: string | null;
  item?: PanelItem | null;
  user?: { username?: string | null } | null;
}

export interface CardHooks {
  vocab: Vocab;
  // Change the model in this tab (no search); the column re-renders
  apply(mutate: (model: FilterModel) => void): void;
  // Open a new tab searching a copy of the model with the change applied
  openSearch(mutate: (model: FilterModel) => void): void;
  // The column's search ignores socketed items: the panel offers the item's own mod values
  ownStats(): boolean;
  // The column's sums with mods in them: each card says what they add up to
  sums(): SumSpec[];
}

let hooks: CardHooks | null = null;
let observer: MutationObserver | null = null;
let frame = 0;

export const mountCardControls = (cardHooks: CardHooks) => {
  unmountCardControls();
  hooks = cardHooks;
  const pageRoot = getMarketPage()?.$.subTree?.el;
  if (pageRoot instanceof Element) {
    observer = new MutationObserver(schedule);
    observer.observe(pageRoot, { childList: true, subtree: true });
  }
  decorate();
};

export const unmountCardControls = () => {
  observer?.disconnect();
  observer = null;
  hooks = null;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  document
    .querySelectorAll(".pd2te-card-btn, .pd2te-item-filter, .pd2te-card-times, .pd2te-socket-note, .pd2te-sum-line")
    .forEach((element) => element.remove());
};

const schedule = () => {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    decorate();
  });
};

const decorate = () => {
  if (!hooks) return;
  const withTimes = Settings.getSettings().cardTimes;
  document.querySelectorAll<HTMLElement>(".listing").forEach((card) => {
    if (card.closest(".settings-panel")) return;
    const id = listingIdFromHref(card.querySelector<HTMLAnchorElement>(LISTING_LINK_SELECTOR)?.getAttribute("href") ?? null);
    if (!id) return;
    if (!card.querySelector(".pd2te-card-btn")) {
      const filterButton = button("Filter", () => togglePanel(card, id), "pd2te-btn-small pd2te-card-btn");
      filterButton.title = "Use this item's mods, base and rarity as filters";
      const offer = card.querySelector(".meta .flex > button.button");
      if (offer) offer.before(filterButton);
      else (card.querySelector(".meta") ?? card).append(filterButton);
    }
    if (withTimes && !card.querySelector(".pd2te-card-times")) decorateTimes(card, id);
    decorateSockets(card, id);
    decorateSums(card, id);
  });
};

// The column's sums changed: the cards' sum lines follow
export const refreshCards = () => {
  if (hooks) decorate();
};

// What the column's sums add up to on this card's item, under its mods. A line that no longer fits (the sums
// changed, or Vue reused the card for another listing) is replaced
const decorateSums = (card: HTMLElement, id: string) => {
  const sums = hooks?.sums() ?? [];
  const item = sums.length > 0 ? findListing(id)?.item : null;
  const own = hooks?.ownStats() ?? false;
  const vocab = hooks?.vocab;
  const lines = item && vocab
    ? itemSums(item, sums, own).map((result, index) => {
        const name = sums.length > 1 ? `Sum ${index + 1}` : "Sum";
        const parts = describeParts(result.parts, (key) => propertyLabel(vocab, key));
        return `${name}: ${formatAmount(result.total)}${parts ? ` = ${parts}` : ""}`;
      })
    : [];
  const text = lines.join(" | ");
  const current = card.querySelector<HTMLElement>(".pd2te-sum-line");
  if ((current?.dataset.text ?? "") === text) return;
  current?.remove();
  const mods = card.querySelector(".details > .properties");
  if (text === "" || !mods) return;
  const line = h("div", {
    class: "pd2te-sum-line pd2te-own",
    title: own ? "The filter column's sums, on the item's own stats (socketed jewels/runes left out)" : "The filter column's sums on this item",
  });
  lines.forEach((part) => line.append(h("div", { text: part })));
  line.dataset.text = text;
  mods.after(line);
};

// The card's mod lines, in the site's order (each socketed item's own lines and the requirements are elsewhere)
const MOD_LINES = ".properties:not(.socketed) > div > p.property";

// A mod line's label: the text before its range
const lineLabel = (line: Element) => line.firstElementChild?.firstChild?.textContent?.trim() ?? "";

const SHORT_NAMES: Record<string, string> = {
  fireresist: "Fire",
  lightresist: "Light",
  coldresist: "Cold",
  poisonresist: "Poison",
  strength: "Str",
  dexterity: "Dex",
  vitality: "Vit",
  energy: "Energy",
};

// The note after a mod line. Runewords only get the split: their runes are part of the recipe
const shareText = (share: SocketShare, runeword: boolean): string => {
  const { modifier } = share;
  if (share.parts) {
    const own = share.parts.map((part) => `${SHORT_NAMES[part.name] ?? part.name} ${part.own}`).join(", ");
    return runeword ? "" : `(own: ${own})`;
  }
  if (share.own === 0) return runeword ? "" : "(socketed)";
  const own = shownAmount(modifier, share.own);
  const added = shownAmount(modifier, share.added);
  const [ownPart, addedPart] =
    share.addedMax === undefined ? [`${own}`, `${added}`] : [`${own}-${share.ownMax}`, `${added}-${share.addedMax}`];
  return runeword ? `(${ownPart} + ${addedPart} from runes)` : `(${ownPart} own + ${addedPart} socketed)`;
};

// Mod lines socketed items add to get the split after the site's text, which shows the sum (and can pass the
// roll's range); a line only they give is dimmed. A note that no longer fits its line (Vue reuses the line
// elements) is replaced
const decorateSockets = (card: HTMLElement, id: string) => {
  const item = findListing(id)?.item;
  const shares = item?.socketed?.length ? socketShares(item) : [];
  if (shares.length === 0 && !card.querySelector(".pd2te-socket-note")) return;
  const runeword = Boolean(item?.is_runeword);
  const byLabel = new Map<string, SocketShare[]>();
  shares.forEach((share) => {
    const label = share.modifier.label?.trim();
    if (label) byLabel.set(label, [...(byLabel.get(label) ?? []), share]);
  });
  card.querySelectorAll<HTMLElement>(MOD_LINES).forEach((line) => {
    const share = byLabel.get(lineLabel(line))?.shift();
    const text = share ? shareText(share, runeword) : "";
    const note = line.querySelector<HTMLElement>(":scope > .pd2te-socket-note");
    if ((note?.dataset.text ?? "") === text) return;
    note?.remove();
    if (!share || text === "") return;
    const only = share.own === 0 && !share.parts && !runeword;
    const added = h("span", {
      class: `pd2te-socket-note pd2te-own${only ? " pd2te-socket-only" : ""}`,
      text,
      title: runeword
        ? "The runeword's own roll, and what its runes add"
        : only
          ? "Only the socketed jewels, runes or gems give this; the item itself doesn't have it"
          : "What the item has itself, and what its socketed jewels, runes and gems add",
    });
    added.dataset.text = text;
    line.append(added);
  });
};

const MINUTE_MS = 60_000;

const relativeTime = (ms: number) => {
  const age = Date.now() - ms;
  if (age < MINUTE_MS) return "just now";
  if (age < 3600_000) return `${Math.round(age / MINUTE_MS)} min ago`;
  if (age < 86400_000) return `${Math.round(age / 3600_000)} h ago`;
  if (age < 7 * 86400_000) return `${Math.round(age / 86400_000)} d ago`;
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

// The site's own line is the bump time. Add when it was listed and last edited, when those differ
const decorateTimes = (card: HTMLElement, id: string) => {
  const listing = findListing(id);
  const slot = card.querySelector(".meta .time .flex-grow") ?? card.querySelector(".meta .time");
  if (!listing || !slot) return;
  const created = Date.parse(listing.created_at ?? "");
  const bumped = Date.parse(listing.bumped_at ?? "") || Date.parse(listing.updated_at ?? "");
  const updated = Date.parse(listing.updated_at ?? "");
  const differs = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) > MINUTE_MS;
  const stamps: [string, number][] = [];
  if (differs(created, bumped)) stamps.push(["Listed", created]);
  if (differs(updated, bumped) && differs(updated, created)) stamps.push(["Edited", updated]);
  if (stamps.length === 0) return;
  slot.append(
    h(
      "span",
      { class: "pd2te-card-times pd2te-own" },
      ...stamps.map(([label, ms]) =>
        h("span", { class: "pd2te-card-time", title: `${label} ${new Date(ms).toLocaleString()}`, text: `${label} ${relativeTime(ms)}` })
      )
    )
  );
};

// Timestamps switched on or off in Settings
document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
  document.querySelectorAll(".pd2te-card-times").forEach((element) => element.remove());
  if (hooks) decorate();
});

const findListing = (id: string): CardListing | null => {
  const listing = getMarketPage()?.listings.find((row) => isObject(row) && row._id === id);
  return isObject(listing) && isObject(listing.item) ? (listing as unknown as CardListing) : null;
};

const togglePanel = (card: HTMLElement, id: string) => {
  const open = card.querySelector(".pd2te-item-filter");
  document.querySelectorAll(".pd2te-item-filter").forEach((element) => element.remove()); // one at a time
  if (open || !hooks) return;
  const listing = findListing(id);
  if (!listing?.item) return;
  card.append(cardPanel(listing, listing.item, hooks));
};

// Search and "Only this seller" open new tabs with a fresh search; "Add to filters" changes this tab's column
const cardPanel = (listing: CardListing, item: PanelItem, cardHooks: CardHooks): HTMLElement => {
  const sellerId = typeof listing.user_id === "string" ? listing.user_id : null;
  const name = typeof listing.user?.username === "string" ? listing.user.username : undefined;
  return buildItemPanel(item, {
    vocab: cardHooks.vocab,
    ownStats: cardHooks.ownStats(),
    actions: [
      {
        label: "Search",
        title: "Open a new tab that searches for the ticked ones",
        run: (apply) =>
          cardHooks.openSearch((model) => {
            resetSearch(model);
            apply(model);
          }),
      },
      {
        label: "Add to filters",
        title: "Add the ticked ones to the current filters (no search)",
        run: (apply) => cardHooks.apply(apply),
      },
      ...(sellerId
        ? [
            {
              label: "Only this seller",
              title: "Open a new tab with every listing of this seller",
              run: () =>
                cardHooks.openSearch((model) => {
                  resetSearch(model);
                  model.seller = name ? { id: sellerId, name } : { id: sellerId };
                }),
            },
          ]
        : []),
    ],
  });
};

// A fresh search that keeps only the mode, the sort and whether socketed items count
const resetSearch = (model: FilterModel) => {
  const { hardcore, ladder, sort, ignoreSocketed } = model;
  const fresh = emptyModel();
  fresh.sort = sort.field === SUM_SORT_FIELD ? { ...DEFAULT_SORT } : sort; // the sums don't come along
  fresh.ignoreSocketed = ignoreSocketed;
  if (hardcore !== undefined) fresh.hardcore = hardcore;
  if (ladder !== undefined) fresh.ladder = ladder;
  Object.keys(model).forEach((key) => delete (model as unknown as Record<string, unknown>)[key]);
  Object.assign(model, fresh);
};
