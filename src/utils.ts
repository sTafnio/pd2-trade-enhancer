/**
 * Waits `ms` milliseconds. Resolves early (never rejects) as soon as any of the
 * signals aborts, so callers check `signal.aborted` afterwards. The abort
 * listeners are removed when the timer fires, so long-lived signals don't pile them up.
 */
export const sleep = (ms: number, ...signals: (AbortSignal | undefined)[]): Promise<void> =>
  new Promise<void>((resolve) => {
    const active = signals.filter((signal): signal is AbortSignal => signal !== undefined);
    if (active.some((signal) => signal.aborted)) return resolve();

    const finish = () => {
      clearTimeout(timeoutId);
      active.forEach((signal) => signal.removeEventListener("abort", finish));
      resolve();
    };
    const timeoutId = setTimeout(finish, Math.max(0, ms));
    active.forEach((signal) => signal.addEventListener("abort", finish, { once: true }));
  });

// Pathname only, so /market?filter=<id> still counts as the market page
export const isMarketPath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market";

export const isCreatePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/create";

export const isManagePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/manage";

export const isExchangePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/exchange";

export const isFiltersPath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/filters";

export const clockTime = (ms = Date.now()) => new Date(ms).toLocaleTimeString();

const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value === null || typeof value !== "object" || value instanceof Date) return value;

  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, sortKeys(record[key])])
  );
};

// JSON with sorted keys: the same search gives the same string whatever order its filters were added in
export const stableStringify = (value: unknown): string => JSON.stringify(sortKeys(value)) ?? "";

// One element from the script's own static markup. Page or seller-provided text never goes in here: it
// goes in through textContent
export const html = <T extends HTMLElement = HTMLElement>(markup: string): T => {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstElementChild as T;
};

export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
  return String(error);
};

export const errorCode = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? Number(error.code) : NaN;

export const isRateLimitError = (error: unknown) =>
  errorCode(error) === 429 || /rate.?limit/i.test(errorMessage(error));
