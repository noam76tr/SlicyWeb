/**
 * Wichy
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

export type Language =
  | "en"
  | "fr"
  | "he"
  | "es"
  | "de"
  | "it";

export interface UserPreferences {
  theme: Theme;

  language: Language;

  units: string;
}
