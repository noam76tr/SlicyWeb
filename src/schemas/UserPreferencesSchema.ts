/**
 * SlicyWeb
 * User Preferences Schema
 *
 * Runtime validation schema of the user preferences stored in
 * settings.json (USER_SETTINGS_SPEC.md, Storage Location).
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema, Theme Values, Language Values)
 * - USER_SETTINGS_SPEC.md (General Settings)
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

export const UserPreferencesSchema = z
  .object({
    theme: ThemeSchema,
    language: LanguageSchema,
    // DATA_SCHEMA.md documents "metric" without a closed list of values
    units: z.string().min(1),
  })
  .strict();

/**
 * Partial update of the preferences (settings:update).
 * Unknown fields are refused.
 */
export const UserPreferencesUpdateSchema = UserPreferencesSchema.partial();

/**
 * Default preferences (ApplicationConstants)
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: DEFAULT_THEME,
  language: DEFAULT_LANGUAGE,
  units: DEFAULT_UNITS,
};
