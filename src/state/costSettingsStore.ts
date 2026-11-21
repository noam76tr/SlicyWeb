/**
 * SlicyWeb
 * Cost Settings Store Definition
 *
 * Cost settings of the user (DATA_SCHEMA.md 3.15.0, User Preferences
 * Schema: cost; ADR-037, Q7 to Q10 A), read from settings.json by
 * CostSettingsService and shown in the Cost Section. Until they are read
 * (or outside Electron), the defaults of the language of the interface.
 *
 * No business logic.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: User Preferences Schema)
 * - USER_SETTINGS_SPEC.md (2.3.0: Cost Settings)
 */

import { create } from "zustand";

import { defaultCostPreferences } from "../schemas/UserPreferencesSchema";
import type { CostPreferences } from "../types/UserPreferences";

interface CostSettingsState {
  settings: CostPreferences;

  /** The settings were read from settings.json */
  loaded: boolean;

  setSettings: (settings: CostPreferences, loaded?: boolean) => void;
}

export const useCostSettingsStore = create<CostSettingsState>((set) => ({
  settings: defaultCostPreferences("en"),

  loaded: false,

  setSettings: (settings, loaded = true) => set({ settings, loaded }),
}));
