export interface SettingsInterface {
  delay: number;
  volume: number;
  pageSize: number; // results per page on /market while our filter column is active
  desktopNotifications: boolean;
  enhancedFilters: boolean; // our filter column instead of the site's panels; off is the fallback if it breaks
  cardTimes: boolean; // Listed/Edited stamps on result cards when they differ from the bump time
  compactCards: boolean; // the site's compact card layout
  showQuery: boolean; // the compiled query under the Search button
  autoSortFilters: boolean; // keep the saved filters in name order on the server
}

export type NumberSettingKey = "delay" | "volume" | "pageSize";
export type BooleanSettingKey =
  | "desktopNotifications"
  | "enhancedFilters"
  | "cardTimes"
  | "compactCards"
  | "showQuery"
  | "autoSortFilters";

const STORAGE_KEY = "pd2-trade-enhancer-settings";

export class Settings {
  static readonly DEFAULT_SETTINGS: SettingsInterface = {
    delay: 25,
    volume: 10,
    pageSize: 10,
    desktopNotifications: false,
    enhancedFilters: true,
    cardTimes: true,
    compactCards: false,
    showQuery: false,
    autoSortFilters: false,
  };

  // delay in seconds, volume in percent
  static readonly LIMITS: Record<NumberSettingKey, { min: number; max: number }> = {
    delay: { min: 5, max: 300 },
    volume: { min: 0, max: 100 },
    pageSize: { min: 10, max: 100 },
  };

  // Clamps to LIMITS; anything that isn't a number (or numeric string) becomes `fallback`
  static sanitize(key: NumberSettingKey, value: unknown, fallback = Settings.DEFAULT_SETTINGS[key]): number {
    const number =
      typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
    if (!Number.isFinite(number)) return fallback;

    const { min, max } = Settings.LIMITS[key];
    return Math.min(max, Math.max(min, number));
  }

  private static sanitizeAll(raw: Partial<Record<keyof SettingsInterface, unknown>> | null): SettingsInterface {
    const flag = (key: BooleanSettingKey) => {
      const value = raw?.[key];
      return typeof value === "boolean" ? value : Settings.DEFAULT_SETTINGS[key];
    };

    return {
      delay: Settings.sanitize("delay", raw?.delay),
      volume: Settings.sanitize("volume", raw?.volume),
      pageSize: Settings.sanitize("pageSize", raw?.pageSize),
      desktopNotifications: flag("desktopNotifications"),
      enhancedFilters: flag("enhancedFilters"),
      cardTimes: flag("cardTimes"),
      compactCards: flag("compactCards"),
      showQuery: flag("showQuery"),
      autoSortFilters: flag("autoSortFilters"),
    };
  }

  static getSettings(): SettingsInterface {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = storedSettings ? JSON.parse(storedSettings) : null;
      return Settings.sanitizeAll(typeof parsed === "object" ? (parsed as Record<string, unknown> | null) : null);
    } catch (error) {
      console.error("Error getting settings from localStorage:", error);
      return { ...Settings.DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings: SettingsInterface): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Settings.sanitizeAll(settings)));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }
}
