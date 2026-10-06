// Access to the site's Vue 3 app and its Feathers client (production build: no __vueParentComponent,
// app._instance is null, so components are found from #app._vnode or the router).
// Needs the script to run in the page world (@inject-into auto/page). In an isolated world the expandos
// read as undefined, probeBridge() reports it and livesearch refuses to start.
// Everything is re-resolved on use: #app is replaced at boot and route components remount.

export type Unwatch = () => void;
export type Query = Record<string, unknown>;

export interface Listing {
  _id: string;
  updated_at?: string | null;
  user_id?: string | null;
  price?: string | null;
  hr_price?: number | null;
  item?: { name?: string | null; base?: { name?: string | null } | null } | null;
}

export interface FindResult<T> {
  total?: number;
  limit?: number;
  skip?: number;
  data?: T[];
}

interface HookContext {
  params?: { query?: Query; pd2?: boolean } | null;
  error?: unknown;
  result?: unknown; // set before the call: the call's answer, and the request never goes out
}

type FindHook = (context: HookContext) => HookContext | Promise<HookContext>;

export interface ListingService {
  find(params: { query: Query; pd2: true }): Promise<FindResult<Listing>>;
  hooks(config: { before: { find: FindHook[] }; error: { find: FindHook[] } }): unknown;
}

export interface SocketLike {
  connected?: boolean;
  on(event: string, listener: () => void): unknown;
  off(event: string, listener: () => void): unknown;
}

interface FeathersClient {
  service(path: string): unknown;
  io?: SocketLike;
  socket?: SocketLike;
}

interface RouteRecordLike {
  name?: string | symbol;
  instances?: Record<string, unknown>;
  components?: Record<string, unknown> | null; // a lazy route holds its loader until first visited
}

interface GlobalProperties {
  $api?: FeathersClient;
  $store?: { state?: { security?: { user?: { _id?: string } | null } } };
  $router?: {
    currentRoute?: { value?: { name?: string | symbol; matched?: RouteRecordLike[] } };
    getRoutes?(): RouteRecordLike[];
  };
}

interface InternalInstance {
  type?: { name?: string; __name?: string };
  proxy?: unknown;
  subTree?: VNodeLike | null;
  isUnmounted?: boolean;
}

interface VNodeLike {
  el?: unknown; // the rendered DOM node
  component?: InternalInstance | null;
  children?: unknown;
  suspense?: { activeBranch?: VNodeLike | null } | null;
}

type AppRoot = HTMLElement & {
  __vue_app__?: { config?: { globalProperties?: GlobalProperties } };
  _vnode?: VNodeLike | null;
};

interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
  flush?: "pre" | "post" | "sync";
}

export interface VueComponent {
  $: InternalInstance;
  $watch(source: string, callback: (value: unknown) => void, options?: WatchOptions): Unwatch;
}

export interface SortState {
  field?: string;
  direction?: number | string;
}

export interface MarketPage extends VueComponent {
  loading: boolean;
  noFilters: boolean;
  page: number;
  total: number;
  listings: unknown[];
  filters: Record<string, unknown>; // what fetch() searches: the form's own object after a search
  sort: SortState;
  fetch(page?: number, limit?: number, skip?: number): void;
}

export interface MarketFilters extends VueComponent {
  filters: Record<string, unknown>;
  sort: SortState;
  search(): void;
}

export interface FormSnapshot {
  filters: Record<string, unknown>;
  sort: SortState;
}

const LOG = "[pd2-trade-enhancer]";
export const MARKET_ROUTE = "market.shop";

export const DEFAULT_RESOLVE = { user: { in_game_account: true } }; // what the page's own search resolves

const getRoot = () => document.getElementById("app") as AppRoot | null;
const getGlobals = () => getRoot()?.__vue_app__?.config?.globalProperties;

export const getApi = (): FeathersClient | null => {
  const api = getGlobals()?.$api;
  return api && typeof api.service === "function" ? api : null;
};

export const getListingService = (): ListingService | null => {
  try {
    const service = getApi()?.service("market/listing") as Partial<ListingService> | undefined;
    return service && typeof service.find === "function" && typeof service.hooks === "function"
      ? (service as ListingService)
      : null;
  } catch {
    return null;
  }
};

export const getSocket = (): SocketLike | null => {
  const api = getApi();
  const socket = api?.io ?? api?.socket;
  return socket && typeof socket.on === "function" && typeof socket.off === "function" ? socket : null;
};

// Only used to skip alerts for the user's own listings; never stored or logged
export const getMyUserId = (): string | null => getGlobals()?.$store?.state?.security?.user?._id ?? null;

export const hasFunctions = (target: unknown, ...names: string[]) =>
  typeof target === "object" &&
  target !== null &&
  names.every((name) => typeof (target as Record<string, unknown>)[name] === "function");

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMarketPage = (proxy: unknown): proxy is MarketPage =>
  isObject(proxy) &&
  Array.isArray(proxy.listings) &&
  typeof proxy.noFilters === "boolean" &&
  hasFunctions(proxy, "fetch", "handleFilterChange", "$watch");

const isMarketFilters = (proxy: unknown): proxy is MarketFilters =>
  isObject(proxy) && isObject(proxy.filters) && isObject(proxy.sort) && hasFunctions(proxy, "search", "$watch");

export const isAlive = (proxy: unknown) => isObject(proxy) && !(proxy as Partial<VueComponent>).$?.isUnmounted;

const nameOf = (instance: InternalInstance) => instance.type?.name ?? instance.type?.__name;

// Iterative DFS over vnode.component -> subTree -> children arrays (about 230 components on /market).
// Stops at the first match unless `all` collects every match.
const walkInstances = (
  root: VNodeLike | null | undefined,
  match: (instance: InternalInstance) => boolean,
  all: InternalInstance[] | null
): InternalInstance | null => {
  const stack: unknown[] = [root];
  const visited = new Set<unknown>();

  while (stack.length > 0) {
    const node = stack.pop();
    if (!isObject(node) || visited.has(node)) continue;
    visited.add(node);

    const vnode = node as VNodeLike;
    const instance = vnode.component;
    if (instance) {
      if (!instance.isUnmounted && match(instance)) {
        if (!all) return instance;
        all.push(instance);
      }
      stack.push(instance.subTree);
      continue;
    }
    if (vnode.suspense) stack.push(vnode.suspense.activeBranch);
    if (Array.isArray(vnode.children)) {
      for (let i = vnode.children.length - 1; i >= 0; i--) stack.push(vnode.children[i]);
    }
  }
  return null;
};

const findInstance = (root: VNodeLike | null | undefined, match: (instance: InternalInstance) => boolean) =>
  walkInstances(root, match, null);

// Every mounted component with this name and shape below `root`
export const findAllComponents = <T>(
  root: VNodeLike | null | undefined,
  name: string,
  hasShape: (proxy: unknown) => proxy is T
): T[] => {
  const all: InternalInstance[] = [];
  walkInstances(root, (candidate) => nameOf(candidate) === name && hasShape(candidate.proxy), all);
  return all.map((instance) => instance.proxy as T);
};

// Component names survive the production build; the shape check alone is the fallback if one is renamed
export const findComponent = <T>(
  root: VNodeLike | null | undefined,
  name: string,
  hasShape: (proxy: unknown) => proxy is T
): T | null => {
  const instance =
    findInstance(root, (candidate) => nameOf(candidate) === name && hasShape(candidate.proxy)) ??
    findInstance(root, (candidate) => hasShape(candidate.proxy));
  return instance ? (instance.proxy as T) : null;
};

// The component a route renders, if that route is the current one: from the router, else by name and shape
export const getRouteComponent = <T>(
  routeName: string,
  componentName: string,
  hasShape: (proxy: unknown) => proxy is T
): T | null => {
  const route = getGlobals()?.$router?.currentRoute?.value;
  const record = route?.matched?.find((match) => match.name === routeName);
  if (route?.matched && !record) return null; // router says we're on another page

  const fromRoute = record?.instances?.default;
  if (isAlive(fromRoute) && hasShape(fromRoute)) return fromRoute;

  return findComponent(getRoot()?._vnode, componentName, hasShape);
};

// A route's component definition (not a mounted instance), loaded first if the route is lazy and not visited yet
export const loadRouteComponent = async (routeName: string): Promise<Record<string, unknown> | null> => {
  const record = getGlobals()?.$router?.getRoutes?.().find((route) => route.name === routeName);
  let component = record?.components?.default;
  if (typeof component === "function") {
    const loaded: unknown = await (component as () => Promise<unknown>)();
    component = isObject(loaded) && "default" in loaded ? loaded.default : loaded;
  }
  return isObject(component) ? component : null;
};

export const getMarketPage = (): MarketPage | null => getRouteComponent(MARKET_ROUTE, "PageGameMarket", isMarketPage);

export const getMarketFilters = (page: MarketPage | null = getMarketPage()): MarketFilters | null =>
  page ? findComponent(page.$.subTree, "GameMarketFilters", isMarketFilters) : null;

// Returns why the API mode can't run, or null when everything it needs is reachable
export const probeBridge = (): string | null => {
  const root = getRoot();
  if (!root) return "#app element not found";
  if (!root.__vue_app__) {
    return (
      "#app.__vue_app__ is not visible. The userscript is probably running in an isolated (content) world, " +
      "which Violentmonkey uses when the script's @inject-into is overridden to content, or with auto when the " +
      "site's CSP blocks page scripts"
    );
  }
  if (!getApi()) return "the site's API client (app.config.globalProperties.$api) was not found";
  if (!getListingService()) return "$api.service('market/listing') has no find()/hooks()";

  const page = getMarketPage();
  if (!page) return "the PageGameMarket component was not found";
  if (!getMarketFilters(page)) return "the GameMarketFilters component was not found";
  return null;
};

export const watchState = (
  component: VueComponent,
  key: string,
  callback: (value: unknown) => void,
  options?: WatchOptions
): Unwatch => {
  try {
    const stop = component.$watch(key, callback, options);
    return () => {
      try {
        stop();
      } catch {
        // component already unmounted: Vue stopped the watcher itself
      }
    };
  } catch (error) {
    console.warn(LOG, `Could not watch "${key}" on the market page.`, error);
    return () => {};
  }
};

// `call` identifies one request: the same params object reaches its before and error hooks
export interface PageFindListener {
  found(query: Query, call: object): void;
  failed(query: Query, call: object, error: unknown): void;
}

// The answer to a page search, given instead of sending it
export interface PageAnswer {
  result: FindResult<unknown>;
}

// Changes a page search in place before it goes out; a promise holds the request until it settles, and one
// that settles with an answer is the search's result: the request never goes out
export type PageQueryRewriter = (query: Query) => Promise<PageAnswer | void> | void;

let pageRewriter: PageQueryRewriter | null = null;

// Feathers v4 hooks are append-only, so one set of hooks per service object (the flag), dispatching
// to whoever is subscribed, then the rewriter. The service lives as long as the page, and so does this script.
const findListeners = new WeakMap<ListingService, Set<PageFindListener>>();

// Calls made with params.pd2 (our own polls) are skipped. Only params.query is read:
// params also carries the auth result.
const dispatch =
  (subscribers: Set<PageFindListener>, stage: "found" | "failed"): FindHook =>
  (context) => {
    const params = context?.params;
    if (!params || params.pd2 || !isObject(params.query)) return context;

    const query = params.query;
    subscribers.forEach((listener) => {
      try {
        if (stage === "found") listener.found(query, params);
        else listener.failed(query, params, context.error);
      } catch (error) {
        console.error(LOG, `find ${stage} listener failed`, error); // never break the page's own search
      }
    });
    return context;
  };

// After the listeners, so they see the search as the page built it. A failing rewriter leaves it that way
const rewrite: FindHook = (context) => {
  const params = context?.params;
  const rewriter = pageRewriter;
  if (!rewriter || !params || params.pd2 || !isObject(params.query)) return context;
  const failed = (error: unknown) => {
    console.error(LOG, "Changing the page's search failed; it goes out as the page built it.", error);
    return context;
  };
  try {
    const pending = rewriter(params.query);
    if (!pending) return context;
    return pending.then((answer) => {
      if (answer) context.result = answer.result;
      return context;
    }, failed);
  } catch (error) {
    return failed(error);
  }
};

const findHooksOf = (service: ListingService): Set<PageFindListener> | null => {
  const installed = findListeners.get(service);
  if (installed) return installed;
  const subscribers = new Set<PageFindListener>();
  try {
    service.hooks({
      before: { find: [dispatch(subscribers, "found"), rewrite] },
      error: { find: [dispatch(subscribers, "failed")] },
    });
  } catch (error) {
    console.warn(LOG, "Could not install the market/listing find hooks.", error);
    return null;
  }
  findListeners.set(service, subscribers);
  return subscribers;
};

export const onPageFind = (listener: PageFindListener): Unwatch | null => {
  const service = getListingService();
  const listeners = service ? findHooksOf(service) : null;
  if (!listeners) return null;
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The one rewriter of the page's searches (null: none). false: the service or its hooks aren't there
export const setPageQueryRewriter = (rewriter: PageQueryRewriter | null): boolean => {
  pageRewriter = rewriter;
  const service = getListingService();
  return service !== null && findHooksOf(service) !== null;
};

// The market page's own search (PageGameMarket.fetch) by shape. DashboardFilters on /dashboard and the
// create page's own-listings query (which adds user_id, like our seller filter does) send the same
// shape, so callers also check that the market page is mounted and loading: only its fetch() is.
export const isMarketSearchQuery = (query: Query) => query.type === "item" && "accepted_offer_id" in query;

// The site's own conversion of the filter form into a market/listing query: PageGameMarket.fetch runs the
// form's filters through it
export type QueryBuilder = (filters: Record<string, unknown>, prefix?: string) => Query;

let queryBuilder: Promise<QueryBuilder | null> | null = null;

// null: not found, and Start runs the page's own search to capture the query instead
export const getQueryBuilder = (): Promise<QueryBuilder | null> => (queryBuilder ??= findQueryBuilder());

// The site's main script exports it under a minified name that changes with every deploy: it's the one
// export that knows the "_shared_stash_page_" location, checked on a sample. import() of the loaded script
// returns the running module, nothing runs twice. Made at runtime because an import() in this bundle would
// make vite-plugin-monkey build the userscript as SystemJS, which loads modules itself.
const findQueryBuilder = async (): Promise<QueryBuilder | null> => {
  if (!getGlobals()) return null; // outside the page world, import() would start a second copy of the site
  try {
    const importModule = new Function("url", "return import(url)") as (url: string) => Promise<Record<string, unknown>>;
    for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')) {
      const found = Object.values(await importModule(script.src)).filter(
        (value): value is QueryBuilder =>
          typeof value === "function" && Function.prototype.toString.call(value).includes("_shared_stash_page_")
      );
      if (found.length === 1 && found[0]({ quality: "Unique" }, "item.")["item.quality.name"] === "Unique") {
        return found[0];
      }
    }
  } catch (error) {
    console.warn(LOG, "Could not load the site's query builder.", error);
  }
  return null;
};

// What PageGameMarket.fetch sends for these form filters, without paging, sorting and $resolve
export const marketSearchQuery = (build: QueryBuilder, filters: Record<string, unknown>): Query => ({
  type: "item",
  accepted_offer_id: null,
  ...build(JSON.parse(JSON.stringify(filters)) as Record<string, unknown>, "item."),
});

export const snapshotForm = (filters: MarketFilters): FormSnapshot | null => {
  try {
    return JSON.parse(JSON.stringify({ filters: filters.filters, sort: filters.sort })) as FormSnapshot;
  } catch {
    return null;
  }
};

// What the site's Search does before its request (GameMarketFilters.search -> PageGameMarket.handleFilterChange),
// so the page's own fetch() searches the form from then on
export const adoptForm = (page: MarketPage, filters: MarketFilters) => {
  page.filters = filters.filters;
  page.sort = filters.sort;
};

// Numbers, like the site's own <select> v-model; the selects follow the state
export const setSort = (filters: MarketFilters, field: string, direction: number) => {
  filters.sort.field = field;
  filters.sort.direction = direction;
};
