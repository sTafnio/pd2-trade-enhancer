// The /market/create page's Vue state (the user's listings, the selected item, the visible stash grid) and
// the site's market/listing service for creating, patching and removing listings.
import {
  findAllComponents,
  findComponent,
  getApi,
  getMyUserId,
  getRouteComponent,
  hasFunctions,
  isObject,
} from "./vue-bridge";
import type { FindResult, Query, VueComponent } from "./vue-bridge";

const CREATE_ROUTE = "market.create";

export interface StashItem {
  hash?: string;
  name?: string;
  base?: { name?: string | null } | null;
  [key: string]: unknown;
}

export interface OwnListing {
  _id: string;
  item?: StashItem | null;
  user_id?: string | null;
  type?: string | null;
  is_hardcore?: boolean | null;
  is_ladder?: boolean | null;
  price?: string | null;
  hr_price?: number | string | null;
  quantity?: number | string | null;
  accepted_offer_id?: string | null;
  bumped_at?: string | null;
  updated_at?: string | null;
  service?: { type?: string | null } | null; // type "service"
  exchange?: unknown; // type "exchange"
}

export interface CreatePage extends VueComponent {
  listings: OwnListing[];
  fetchListings(): unknown;
}

// ComponentGameArmoryCharacterDetails: the character/stash view with the selected item's panel
export interface CharacterDetails extends VueComponent {
  display: string;
  selectedItem: StashItem | null;
  account?: string | null;
  characterDetails?: { name?: string | null } | null;
  listingHardcore?: boolean | null;
  listingLadder?: boolean | null;
  selectedItemListing?: OwnListing | null;
}

interface ItemGrid extends VueComponent {
  items: StashItem[];
  $el?: unknown;
}

export interface ListingService {
  find(params: { query: Query; pd2: true }): Promise<FindResult<OwnListing>>;
  create(data: Record<string, unknown>): Promise<OwnListing>;
  patch(id: string, data: Record<string, unknown>): Promise<OwnListing>;
  remove(id: string): Promise<OwnListing>;
}

const isCreatePage = (proxy: unknown): proxy is CreatePage =>
  isObject(proxy) && Array.isArray(proxy.listings) && hasFunctions(proxy, "fetchListings", "$watch");

const isCharacterDetails = (proxy: unknown): proxy is CharacterDetails =>
  isObject(proxy) && "selectedItem" in proxy && hasFunctions(proxy, "selectItem", "deselectItem", "$watch");

// Clickable grids only: the stash grid; hover-only grids elsewhere don't take clicks
const isItemGrid = (proxy: unknown): proxy is ItemGrid =>
  isObject(proxy) && Array.isArray(proxy.items) && typeof proxy.onItemClick === "function";

export const getCreatePage = (): CreatePage | null =>
  getRouteComponent(CREATE_ROUTE, "PageGameMarketCreate", isCreatePage);

export const getCharacterDetails = (page: CreatePage | null = getCreatePage()): CharacterDetails | null =>
  page ? findComponent(page.$.subTree, "ComponentGameArmoryCharacterDetails", isCharacterDetails) : null;

// Items drawn on the visible stash tab (the grid's own `items`), or null outside the Stash view
export const getVisibleStashItems = (details: CharacterDetails): StashItem[] | null => {
  if (details.display !== "stash") return null;
  return findAllComponents(details.$.subTree, "ContentItemGrid", isItemGrid)
    .filter((grid) => grid.$el instanceof HTMLElement && grid.$el.isConnected && grid.$el.offsetParent !== null)
    .flatMap((grid) => grid.items);
};

export const getListingCrud = (): ListingService | null => {
  try {
    const service = getApi()?.service("market/listing");
    return hasFunctions(service, "find", "create", "patch", "remove") ? (service as ListingService) : null;
  } catch {
    return null;
  }
};

export { getMyUserId };
