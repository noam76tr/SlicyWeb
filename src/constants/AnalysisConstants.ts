/**
 * SlicyWeb
 * Analysis Constants Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

export const RISK_SCORE = {
  MIN: 0,
  MAX: 100
} as const;

export const CONFIDENCE_SCORE = {
  MIN: 0,
  MAX: 100
} as const;

export const PRINTABILITY_SCORE = {
  MIN: 0,
  MAX: 100
} as const;

export const RISK_LEVELS = {
  VERY_LOW: {
    min: 0,
    max: 20
  },

  LOW: {
    min: 21,
    max: 40
  },

  MODERATE: {
    min: 41,
    max: 60
  },

  HIGH: {
    min: 61,
    max: 80
  },

  CRITICAL: {
    min: 81,
    max: 100
  }
} as const;

export const CONFIDENCE_LEVELS = {
  UNKNOWN: {
    min: 0,
    max: 39
  },

  LOW: {
    min: 40,
    max: 59
  },

  MEDIUM: {
    min: 60,
    max: 74
  },

  HIGH: {
    min: 75,
    max: 89
  },

  VERY_HIGH: {
    min: 90,
    max: 100
  }
} as const;

/**
 * Display names of the classification categories
 * (OBJECT_CLASSIFICATION_SPEC.md, Supported Categories).
 */
export const OBJECT_CATEGORIES = [
  "Figurine",
  "Miniature",
  "Mechanical Part",
  "Gear",
  "Bracket",
  "Container",
  "Vase",
  "Enclosure",
  "Tool",
  "Articulated Model",
  "Prototype",
  "Structural Part",
  "Decorative Object",
  "Functional Part",
  "Unknown"
] as const;

/**
 * Stored values of the classification categories
 * (DATA_SCHEMA.md, Classification Categories and Category Value Format).
 * Same order as OBJECT_CATEGORIES.
 */
export const CLASSIFICATION_CATEGORIES = [
  "figurine",
  "miniature",
  "mechanical_part",
  "gear",
  "bracket",
  "container",
  "vase",
  "enclosure",
  "tool",
  "articulated_model",
  "prototype",
  "structural_part",
  "decorative_object",
  "functional_part",
  "unknown"
] as const;

/**
 * Version of the classification rules
 * (OBJECT_CLASSIFICATION_SPEC.md version), stored in
 * classification.classificationVersion (DATA_SCHEMA.md).
 */
export const CLASSIFICATION_VERSION = "1.1.0";
