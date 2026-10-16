// The listing note: text the user sets once on the create page ("accepting X, not Y") that goes after the
// price of every item listing they create or re-price, ours (Price Tab) and the site's own (Submit, Modify
// Price) alike: a before-hook on the site's market/listing service adds it to the outgoing `price`.
// A listing has no notes field; its price is free text, so the note lives there: "2 Ist | accepting runes".
import { getCreatePage } from "../pd2/create-bridge";
import { getManagePage } from "../pd2/manage-bridge";
import { getApi, isObject } from "../pd2/vue-bridge";

const LOG = "[pd2-trade-enhancer]";
const STORAGE_KEY = "pd2te-listing-note";
const SEPARATOR = " | ";

export const readListingNote = (): string => {
  try {
    return (localStorage.getItem(STORAGE_KEY) ?? "").trim();
  } catch {
    return "";
  }
};

export const saveListingNote = (note: string) => {
  try {
    const text = note.trim();
    if (text) localStorage.setItem(STORAGE_KEY, text);
    else localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(LOG, "Could not save the listing note.", error);
  }
};

// The site's Modify Price starts from the listing's current price, note included: it isn't added twice
export const withListingNote = (price: string, note = readListingNote()): string => {
  const text = price.trim();
  if (!note || text === note || text.endsWith(`${SEPARATOR}${note}`)) return text;
  return text ? `${text}${SEPARATOR}${note}` : note;
};

interface WriteContext {
  id?: unknown;
  data?: unknown;
}

type WriteHook = (context: WriteContext) => WriteContext;

interface HookableService {
  hooks(config: { before: { create: WriteHook[]; patch: WriteHook[] } }): unknown;
}

// A patch only carries its id. The pages that can re-price hold the listing; one they don't hold is ours
// (Price Tab re-prices item listings only)
const isItemListingId = (id: unknown) => {
  const listing = [...(getManagePage()?.listings ?? []), ...(getCreatePage()?.listings ?? [])].find(
    (row) => row._id === id
  );
  return !listing || (listing.type ?? "item") === "item";
};

const addNote =
  (isItem: (context: WriteContext) => boolean): WriteHook =>
  (context) => {
    const data = context?.data;
    try {
      if (isObject(data) && typeof data.price === "string" && readListingNote() && isItem(context)) {
        data.price = withListingNote(data.price);
      }
    } catch (error) {
      console.error(LOG, "Adding the listing note failed; the listing goes out as it was.", error);
    }
    return context;
  };

const hooked = new WeakSet<object>();

// Feathers hooks can't be removed, so each service gets them once; main.ts calls this on every DOM change
export const ensureListingNoteHook = () => {
  let service: unknown;
  try {
    service = getApi()?.service("market/listing");
  } catch {
    return;
  }
  if (!isObject(service) || typeof service.hooks !== "function" || hooked.has(service)) return;
  hooked.add(service);
  try {
    (service as unknown as HookableService).hooks({
      before: {
        create: [addNote((context) => isObject(context.data) && isObject(context.data.item))],
        patch: [addNote((context) => isItemListingId(context.id))],
      },
    });
  } catch (error) {
    console.warn(LOG, "Could not install the listing note hook.", error);
  }
};
