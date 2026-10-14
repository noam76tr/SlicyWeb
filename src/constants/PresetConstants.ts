/**
 * SlicyWeb
 * Preset Constants Definition
 *
 * Based on:
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 * - AI_ENGINE_SPEC.md
 */

import type { ClassificationCategory } from "../types/Classification";
import type { PresetCategory } from "../types/PrintPreset";

/**
 * Stored values of the print preset categories
 * (DATA_SCHEMA.md, Print Preset Categories;
 * PRINT_PRESETS_SPEC.md, Preset Categories).
 */
export const PRESET_CATEGORIES = [
  "ultra_quality",
  "high_quality",
  "balanced",
  "draft",
  "fast_prototype",
  "structural",
  "functional",
  "engineering",
  "flexible",
  "miniature",
  "vase",
  "custom"
] as const;

/**
 * Default preset category
 * (PRINT_PRESETS_SPEC.md, Default Preset).
 */
export const DEFAULT_PRESET_CATEGORY: PresetCategory = "balanced";

/**
 * Preset category selected by each classification category
 * (PRINT_PRESETS_SPEC.md, Classification To Preset Mapping).
 */
export const CLASSIFICATION_PRESET_CATEGORIES: Readonly<
  Record<ClassificationCategory, PresetCategory>
> = {
  figurine: "ultra_quality",
  miniature: "miniature",
  mechanical_part: "engineering",
  gear: "engineering",
  bracket: "structural",
  container: "balanced",
  vase: "vase",
  enclosure: "functional",
  tool: "functional",
  articulated_model: "engineering",
  prototype: "fast_prototype",
  structural_part: "structural",
  decorative_object: "high_quality",
  functional_part: "functional",
  unknown: "balanced"
};

export const INFILL_PATTERNS = [
  "gyroid",
  "grid",
  "cubic",
  "honeycomb",
  "lightning",
  "lines",
  "triangles"
] as const;

export const SUPPORT_TYPES = [
  "none",
  "organic",
  "tree",
  "standard"
] as const;

export const ADHESION_TYPES = [
  "none",
  "skirt",
  "brim",
  "raft"
] as const;

export const LAYER_HEIGHTS = [
  0.08,
  0.10,
  0.12,
  0.16,
  0.20,
  0.24,
  0.28
] as const;

export const PRESET_DEFAULTS = {
  layerHeight: 0.20,
  wallCount: 3,
  topLayers: 5,
  bottomLayers: 5,
  infillDensity: 15,
  infillPattern: "gyroid",
  supportType: "organic",
  adhesionType: "brim"
} as const;
