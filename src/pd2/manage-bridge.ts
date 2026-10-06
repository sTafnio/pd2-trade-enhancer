// The /market/manage page's Vue state: every listing of the user (items, services and exchanges) and its
// listing cards.
import { findAllComponents, getRouteComponent, hasFunctions, isObject } from "./vue-bridge";
import type { VueComponent } from "./vue-bridge";
import type { OwnListing } from "./create-bridge";

const MANAGE_ROUTE = "market.manage";

export interface ManagePage extends VueComponent {
  listings: OwnListing[];
}

// GameMarketListing: one listing's card (also on /market and in the create page's item panel)
export interface ListingCard extends VueComponent {
  $el: unknown;
  listing: OwnListing;
  showBump: boolean; // the site shows its own Bump icon: false once the listing is removed
  actionNotification: string;
  actionNotificationType: string;
  showActionNotification: boolean;
}

const isManagePage = (proxy: unknown): proxy is ManagePage =>
  isObject(proxy) && Array.isArray(proxy.listings) && hasFunctions(proxy, "fetch", "bumpAll", "updateListing", "$watch");

const isListingCard = (proxy: unknown): proxy is ListingCard =>
  isObject(proxy) &&
  isObject(proxy.listing) &&
  typeof proxy.listing._id === "string" &&
  "showBump" in proxy &&
  "showActionNotification" in proxy;

export const getManagePage = (): ManagePage | null =>
  getRouteComponent(MANAGE_ROUTE, "PageGameMarketManage", isManagePage);

export const getListingCards = (page: ManagePage): ListingCard[] =>
  findAllComponents(page.$.subTree, "GameMarketListing", isListingCard);
