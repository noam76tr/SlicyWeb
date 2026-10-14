/**
 * SlicyWeb
 * Print Preset Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import type { PRESET_CATEGORIES } from "../constants/PresetConstants";

/**
 * Stored value of a print preset category
 * (DATA_SCHEMA.md, Print Preset Categories).
 */
export type PresetCategory =
  (typeof PRESET_CATEGORIES)[number];

export type SupportType =
  | "none"
  | "organic"
  | "tree"
  | "standard";

export type AdhesionType =
  | "none"
  | "skirt"
  | "brim"
  | "raft";

export interface PresetSettings {
  layerHeight: number;

  wallCount: number;

  topLayers: number;

  bottomLayers: number;

  infillDensity: number;

  infillPattern: string;

  supportEnabled: boolean;

  supportType: SupportType;

  adhesionType: AdhesionType;

  printSpeed: number;

  fanSpeed: number;
}

export interface PrintPreset {
  name: string;

  category: PresetCategory;

  description: string;

  settings: PresetSettings;

  confidenceScore: number;
}
