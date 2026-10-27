/**
 * SlicyWeb
 * User Preferences Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - USER_SETTINGS_SPEC.md
 */

export type Theme =
  | "dark"
  | "light"
  | "system";

/**
 * Supported languages (DATA_SCHEMA.md, Language Values).
 * es, de and it are Future Extensions in DATA_SCHEMA.md:
 * they are not accepted yet.
 */
export type Language =
  | "en"
  | "fr"
  | "he";

/**
 * Printer of the user preferences (DATA_SCHEMA.md 3.5.0, ADR-032):
 * id of the last printer selected, or null when none was selected.
 */
export interface PrinterPreferences {
  defaultPrinter: string | null;

  autoloadLastPrinter: boolean;

  /**
   * Check the SlicyWeb profile repository at start, at most once a day
   * (DATA_SCHEMA.md 3.6.0, ADR-032 D5); Refresh Profiles works anyway.
   */
  autoCheckProfiles: boolean;
}

export interface UserPreferences {
  theme: Theme;

  language: Language;

  units: string;

  printer: PrinterPreferences;
}
