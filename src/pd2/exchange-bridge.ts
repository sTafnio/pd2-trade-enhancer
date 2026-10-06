// The /market/exchange page's Vue state: the "Items I want/have" pickers, the Hardcore/Ladder/Online/In Game
// toggles and the results the page's own search shows.
import { findAllComponents, getRouteComponent, hasFunctions, isObject } from "./vue-bridge";
import type { Listing, Query, VueComponent } from "./vue-bridge";

const EXCHANGE_ROUTE = "market.exchange";

export interface ExchangeEntry {
  base_code?: string | null;
  quantity?: number | string | null;
}

export interface ExchangeListing extends Listing {
  exchange?: { have?: ExchangeEntry[] | null; want?: ExchangeEntry[] | null } | null;
}

// base_code -> amount; gold, hrs and pgems hold a typed-in amount
export type CurrencyPicks = Record<string, number | string>;

export interface ExchangePage extends VueComponent {
  currencyIWant: CurrencyPicks;
  currencyIHave: CurrencyPicks;
  hardcore: boolean;
  ladder: boolean;
  online: boolean;
  inGame: boolean;
  exchanges: ExchangeListing[];
  total: number;
  page: number;
  loading: boolean;
  showResults: boolean;
  searchExchanges(page?: number): void;
}

// ExchangeSection: one picker. The page copies its itemList into currencyIWant/currencyIHave
interface ExchangePicker extends VueComponent {
  header: string;
  itemList: CurrencyPicks;
  allItems: Record<string, { name?: string | null } | undefined>;
}

const isExchangePage = (proxy: unknown): proxy is ExchangePage =>
  isObject(proxy) &&
  Array.isArray(proxy.exchanges) &&
  isObject(proxy.currencyIWant) &&
  isObject(proxy.currencyIHave) &&
  hasFunctions(proxy, "searchExchanges", "$watch");

const isExchangePicker = (proxy: unknown): proxy is ExchangePicker =>
  isObject(proxy) && typeof proxy.header === "string" && isObject(proxy.itemList) && isObject(proxy.allItems);

export const getExchangePage = (): ExchangePage | null =>
  getRouteComponent(EXCHANGE_ROUTE, "PageGameMarketExchange", isExchangePage);

// The pickers by their headings, "Items I want..." and "Items I have..."
export const getPickers = (page: ExchangePage) => {
  const pickers = findAllComponents(page.$.subTree, "ExchangeSection", isExchangePicker);
  return {
    want: pickers.find((picker) => /\bwant\b/i.test(picker.header)) ?? null,
    have: pickers.find((picker) => /\bhave\b/i.test(picker.header)) ?? null,
  };
};

// base_code -> the name the site shows, from the pickers' own item table
export const getCurrencyNames = (page: ExchangePage): Record<string, string> => {
  const { want, have } = getPickers(page);
  const names: Record<string, string> = {};
  Object.entries((want ?? have)?.allItems ?? {}).forEach(([code, item]) => {
    if (item?.name) names[code] = item.name;
  });
  return names;
};

// PageGameMarketExchange.searchExchanges: one $or branch per wanted x offered currency
export const isExchangeSearchQuery = (query: Query) => query.type === "exchange" && Array.isArray(query.$or);

// What the page's search searches: the picks and the toggles
export interface ExchangeForm {
  want: CurrencyPicks;
  have: CurrencyPicks;
  hardcore: boolean;
  ladder: boolean;
  online: boolean;
  inGame: boolean;
}

const copyPicks = (picks: CurrencyPicks | null | undefined) => JSON.parse(JSON.stringify(picks ?? {})) as CurrencyPicks;

export const readForm = (page: ExchangePage): ExchangeForm => ({
  want: copyPicks(page.currencyIWant),
  have: copyPicks(page.currencyIHave),
  hardcore: page.hardcore,
  ladder: page.ladder,
  online: page.online,
  inGame: page.inGame,
});

export const hasPicks = (page: ExchangePage) =>
  Object.keys(page.currencyIWant ?? {}).length > 0 || Object.keys(page.currencyIHave ?? {}).length > 0;
