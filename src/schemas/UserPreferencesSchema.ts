/**
 * SlicyWeb
 * User Preferences Schema
 *
 * Runtime validation schema of the user preferences stored in
 * settings.json (USER_SETTINGS_SPEC.md, Storage Location).
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema, Theme Values, Language Values)
 * - USER_SETTINGS_SPEC.md (General Settings, Printer Settings, Material
 *   Settings, GUI Settings)
 * - DECISIONS.md (ADR-032, D8; ADR-033, D9; ADR-037)
 * - DATA_SCHEMA.md 3.15.0 (User Preferences Schema: cost)
 * - DATA_SCHEMA.md 3.16.0 (User Preferences Schema: project, files;
 *   lot 111, Q17 A and Q18 A)
 * - PASSATION.md (decision 90: tabs of the Properties Panel; lot 95, Q3 B:
 *   the open tab is not stored, gui is no longer part of the preferences)
 */

import { z } from "zod";

import {
  COST_LIMITS,
  CURRENCIES,
  DEFAULT_CURRENCY_BY_LANGUAGE,
} from "../constants/CostConstants";
import {
  AUTOSAVE_INTERVAL_SECONDS,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_UNITS,
  MAX_RECENT_PROJECTS,
} from "../constants/ApplicationConstants";
import { AUTOSAVE_INTERVAL_LIMITS } from "../constants/ProjectConstants";

import type { UserPreferences } from "../types/UserPreferences";

export const ThemeSchema = z.enum(["dark", "light", "system"]);

export const LanguageSchema = z.enum(["en", "fr", "he"]);

export const PrinterPreferencesSchema = z
  .object({
    // Id of the last printer selected, null when none was selected
    defaultPrinter: z.string().trim().min(1).nullable(),
    autoloadLastPrinter: z.boolean(),
    // Check the profile repository at start (DATA_SCHEMA.md 3.6.0)
    autoCheckProfiles: z.boolean(),
  })
  .strict();

export const MaterialPreferencesSchema = z
  .object({
    // Ids of the last material and filament selected, null when none
    // (DATA_SCHEMA.md 3.7.0)
    defaultMaterial: z.string().trim().min(1).nullable(),
    defaultFilament: z.string().trim().min(1).nullable(),
    autoloadLastMaterial: z.boolean(),
  })
  .strict();

/** A price of the Cost Section: 0 to 1 000 000 (USER_SETTINGS_SPEC.md) */
export const CostPriceSchema = z
  .number()
  .finite()
  .min(0)
  .max(COST_LIMITS.MAX_PRICE);

/** Average power of a printer: above 0, at most 10 000 W */
export const PrinterPowerSchema = z
  .number()
  .finite()
  .positive()
  .max(COST_LIMITS.MAX_POWER_W);

/** An id of a printer or a filament, used as a key */
const ProfileIdSchema = z.string().trim().min(1).max(200);

/**
 * Cost settings (DATA_SCHEMA.md 3.15.0, User Preferences Schema: cost;
 * ADR-037, Q7 to Q10 A)
 */
export const CostPreferencesSchema = z
  .object({
    currency: z.enum(CURRENCIES),
    electricityPrice: CostPriceSchema.nullable(),
    printerPower: z.record(ProfileIdSchema, PrinterPowerSchema),
    filamentPrices: z.record(ProfileIdSchema, CostPriceSchema),
  })
  .strict();

/**
 * Automatic save (DATA_SCHEMA.md 3.16.0, User Preferences Schema:
 * project; lot 111, Q18 A)
 */
export const ProjectPreferencesSchema = z
  .object({
    autoSave: z.boolean(),
    autoSaveInterval: z
      .number()
      .int()
      .min(AUTOSAVE_INTERVAL_LIMITS.min)
      .max(AUTOSAVE_INTERVAL_LIMITS.max),
  })
  .strict();

/** A path of a recent project: a text of 1 to 4096 characters */
export const RecentProjectSchema = z.string().min(1).max(4096);

/**
 * Files (DATA_SCHEMA.md 3.16.0, User Preferences Schema: files; Q17 A):
 * the recent projects, 10 at most
 */
export const FilePreferencesSchema = z
  .object({
    recentProjects: z.array(RecentProjectSchema).max(MAX_RECENT_PROJECTS),
  })
  .strict();

/**
 * Tabs of the Properties Panel (GUI_SPEC.md, Properties Tabs). Not stored
 * in settings.json since lot 95 (DATA_SCHEMA.md 3.12.0): the Printer tab
 * is open at every start.
 */
export const PROPERTIES_TABS = ["printer", "object", "settings"] as const;

export const PropertiesTabSchema = z.enum(PROPERTIES_TABS);

export const UserPreferencesSchema = z
  .object({
    theme: ThemeSchema,
    language: LanguageSchema,
    // DATA_SCHEMA.md documents "metric" without a closed list of values
    units: z.string().min(1),
    printer: PrinterPreferencesSchema,
    material: MaterialPreferencesSchema,
    cost: CostPreferencesSchema,
    project: ProjectPreferencesSchema,
    files: FilePreferencesSchema,
  })
  .strict();

/**
 * Partial update of the preferences (settings:update).
 * Unknown fields are refused (gui too, since lot 95). printer, material
 * and cost are replaced as a whole: an update of one of them gives all of
 * its fields.
 */
export const UserPreferencesUpdateSchema = UserPreferencesSchema.omit({
  // The recent projects are written by the main process only (lot 111,
  // Q20 A): the window never gives a path to open
  files: true,
})
  .partial()
  .strict();

/**
 * Default preferences (ApplicationConstants)
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: DEFAULT_THEME,
  language: DEFAULT_LANGUAGE,
  units: DEFAULT_UNITS,
  printer: {
    defaultPrinter: null,
    autoloadLastPrinter: true,
    autoCheckProfiles: true,
  },
  material: {
    defaultMaterial: null,
    defaultFilament: null,
    autoloadLastMaterial: true,
  },
  cost: defaultCostPreferences(DEFAULT_LANGUAGE),
  project: {
    autoSave: true,
    autoSaveInterval: AUTOSAVE_INTERVAL_SECONDS,
  },
  files: {
    recentProjects: [],
  },
};

/**
 * Cost settings when settings.json has none (Q7 A): the currency of the
 * language, nothing else given
 */
export function defaultCostPreferences(
  language: UserPreferences["language"],
): UserPreferences["cost"] {
  return {
    currency: DEFAULT_CURRENCY_BY_LANGUAGE[language],
    electricityPrice: null,
    printerPower: {},
    filamentPrices: {},
  };
}
