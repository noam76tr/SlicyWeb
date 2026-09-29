/**
 * Wichy
 * Preset Constants Definition
 *
 * Based on:
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 * - AI_ENGINE_SPEC.md
 */

export const PRESET_CATEGORIES = [
  "draft",
  "fast",
  "balanced",
  "quality",
  "ultra_quality",
  "mechanical",
  "prototype",
  "miniature",
  "support_free",
  "low_cost"
] as const;

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
