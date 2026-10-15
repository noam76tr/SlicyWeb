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

export interface UserPreferences {
  theme: Theme;

  language: Language;

  units: string;
}
