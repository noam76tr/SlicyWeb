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
 *   Settings)
 * - DECISIONS.md (ADR-032, D8; ADR-033, D9)
 */

import { z } from "zod";

import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_UNITS,
} from "../constants/ApplicationConstants";

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

export const UserPreferencesSchema = z
  .object({
    theme: ThemeSchema,
    language: LanguageSchema,
    // DATA_SCHEMA.md documents "metric" without a closed list of values
    units: z.string().min(1),
    printer: PrinterPreferencesSchema,
    material: MaterialPreferencesSchema,
  })
  .strict();

/**
 * Partial update of the preferences (settings:update).
 * Unknown fields are refused. printer and material are replaced as a
 * whole: an update of one of them gives all of its fields.
 */
export const UserPreferencesUpdateSchema = UserPreferencesSchema.partial();

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
};
