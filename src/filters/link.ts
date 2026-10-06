// A search as a link: the model, base64url-encoded in the URL hash of /market. The hash never reaches the
// site's router (which only watches the query string) or the server; our column reads it once when it
// mounts, searches, and removes it from the URL. Only the fields that differ from an empty search are
// written, which keeps links short.
import { stableStringify } from "../utils";
import { cloneModel, emptyModel, sanitizeModel } from "./model";
import type { FilterModel } from "./model";

const HASH_KEY = "pd2te";

export interface LinkedSearch {
  model: FilterModel;
  viewerMode: boolean; // the link left Hardcore/Ladder out: search in the viewer's own mode
}

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text: string): string | null => {
  try {
    const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
  } catch {
    return null;
  }
};

// `withMode` false: a link to share, without Hardcore and Ladder, so whoever opens it searches their own mode.
// With it, the mode is always written; null stands for "either"
export const searchLink = (model: FilterModel, withMode = true) => {
  const defaults = emptyModel() as unknown as Record<string, unknown>;
  const fields: Record<string, unknown> = {};
  Object.entries(cloneModel(model)).forEach(([key, value]) => {
    if (key !== "hardcore" && key !== "ladder" && stableStringify(value) !== stableStringify(defaults[key])) fields[key] = value;
  });
  if (withMode) {
    fields.hardcore = model.hardcore ?? null;
    fields.ladder = model.ladder ?? null;
  }
  return `${location.origin}/market#${HASH_KEY}=${toBase64Url(JSON.stringify(fields))}`;
};

// The search carried in the current URL's hash: none, a search, or a #pd2te= hash that doesn't decode
// (cut short when copied, usually). The hash is removed from the URL once read
export const takeLinkedSearch = (): LinkedSearch | "invalid" | null => {
  const match = location.hash.match(new RegExp(`^#${HASH_KEY}=([A-Za-z0-9_-]+)$`));
  if (!match) return null;
  history.replaceState(history.state, "", location.pathname + location.search);
  const json = fromBase64Url(match[1]);
  if (json === null) return "invalid";
  try {
    const raw: unknown = JSON.parse(json);
    const model = sanitizeModel(raw);
    if (!model) return "invalid";
    const viewerMode = typeof raw === "object" && raw !== null && !("hardcore" in raw) && !("ladder" in raw);
    return { model, viewerMode };
  } catch {
    return "invalid";
  }
};
