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

/**
 * Support Type values (DATA_SCHEMA.md 3.10.0): tree is the only name of
 * the tree supports (ADR-035 D5).
 */
export type SupportType =
  | "none"
  | "tree"
  | "standard";

export type AdhesionType =
  | "none"
  | "skirt"
  | "brim"
  | "raft";

/**
 * Preset Settings (DATA_SCHEMA.md 3.10.0, ADR-035 D4 and D5): no fan
 * value, the fan comes from the filament or the material.
 */
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
}

export interface PrintPreset {
  name: string;

  category: PresetCategory;

  description: string;

  settings: PresetSettings;

  confidenceScore: number;
}
