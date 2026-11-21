/**
 * SlicyWeb
 * User Preferences Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - USER_SETTINGS_SPEC.md
 */

import type { Currency } from "../constants/CostConstants";

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

/**
 * Material and filament of the user preferences (DATA_SCHEMA.md 3.7.0,
 * ADR-033 D9): ids of the last material (family) and filament selected,
 * or null when none was selected.
 */
export interface MaterialPreferences {
  defaultMaterial: string | null;

  defaultFilament: string | null;

  autoloadLastMaterial: boolean;
}

/**
 * Tab of the Properties Panel (GUI_SPEC.md, Properties Tabs). Not stored
 * in the user preferences since lot 95 (DATA_SCHEMA.md 3.12.0).
 */
/**
 * Cost settings (DATA_SCHEMA.md 3.15.0, User Preferences Schema: cost;
 * ADR-037, Q7 to Q10 A)
 */
export interface CostPreferences {
  /** ISO 4217 code of the list of the Cost Section */
  currency: Currency;

  /** Price of a kWh in the currency, or null (not given) */
  electricityPrice: number | null;

  /** Average power of each printer, W, by printer id */
  printerPower: Record<string, number>;

  /** Price per kg of shipped filaments, by filament id */
  filamentPrices: Record<string, number>;
}

export type PropertiesTab =
  | "printer"
  | "object"
  | "settings";

export interface UserPreferences {
  theme: Theme;

  language: Language;

  units: string;

  printer: PrinterPreferences;

  material: MaterialPreferences;
  cost: CostPreferences;
}
