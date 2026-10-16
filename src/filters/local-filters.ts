// Saved filters kept in this browser (the "Local filters" setting) instead of the user's PD2 account: with it on,
// nothing is saved on the server. Same shape as the server's documents, our model as the metadata, so the column
// treats both alike. Stored in the site's localStorage next to the settings: they survive reinstalling the
// script, not clearing the site's data. Kept in name order; ids start with "local-"
import type { SavedFilter } from "./site";

const STORAGE_KEY = "pd2te-local-filters";

const byName = (a: SavedFilter, b: SavedFilter) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const isSaved = (value: unknown): value is SavedFilter =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as SavedFilter)._id === "string" &&
  typeof (value as SavedFilter).name === "string" &&
  typeof (value as SavedFilter).filters === "object" &&
  (value as SavedFilter).filters !== null;

export const readLocalFilters = (): SavedFilter[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isSaved).sort(byName) : [];
  } catch {
    return [];
  }
};

const write = (list: SavedFilter[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list].sort(byName)));
  } catch (error) {
    throw new Error(`this browser refused to store it (${error instanceof Error ? error.message : String(error)})`);
  }
};

const newId = () => `local-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export type LocalFilterData = Pick<SavedFilter, "name" | "filters" | "pd2te">;

// A new filter, or `id`'s replaced (it keeps its id)
export const storeLocalFilter = (data: LocalFilterData, id?: string): SavedFilter => {
  const saved: SavedFilter = { ...data, _id: id ?? newId(), updated_at: new Date().toISOString() };
  write([...readLocalFilters().filter((filter) => filter._id !== saved._id), saved]);
  return saved;
};

export const removeLocalFilter = (id: string) => write(readLocalFilters().filter((filter) => filter._id !== id));

// Several at once, each with a new id
export const addLocalFilters = (filters: LocalFilterData[]) => {
  const now = new Date().toISOString();
  write([...readLocalFilters(), ...filters.map((data) => ({ ...data, _id: newId(), updated_at: now }))]);
};
