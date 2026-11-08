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
export const CLASSIFICATION_VERSION = "1.2.2";

/**
 * Who chose the category of a classification (DATA_SCHEMA.md 3.10.0,
 * Classification Rules): computed from the geometry, or chosen by the user.
 */
export const CLASSIFICATION_SOURCES = ["automatic", "user"] as const;

/**
 * Measured geometric features, in their fixed order
 * (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Geometric Features).
 */
export const GEOMETRIC_FEATURES = [
  "small",
  "large",
  "tall",
  "flat",
  "planar",
  "curved",
  "holes",
  "hollow",
  "open_top",
  "thin_walls"
] as const;

/**
 * Thresholds of the geometric features
 * (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Geometric Features).
 */
export const FEATURE_THRESHOLDS = {
  /** small: largest dimension at most, in mm */
  SMALL_MAX_MM: 40,

  /** large: largest dimension at least, in mm */
  LARGE_MIN_MM: 150,

  /** tall: height / smallest side of the base, at least */
  TALL_MIN_RATIO: 3,

  /** flat: the same ratio, at most */
  FLAT_MAX_RATIO: 0.2,

  /** planar: planar share at least (0 to 1) */
  PLANAR_MIN_SHARE: 0.7,

  /** curved: planar share at most (0 to 1) */
  CURVED_MAX_SHARE: 0.3,

  /** Planar region: normals at most this far from the first, in degrees */
  PLANAR_REGION_MAX_ANGLE_DEG: 1,

  /** Planar region: counted when its area is at least this share */
  PLANAR_REGION_MIN_SHARE: 0.01,

  /** holes: genus at least */
  HOLES_MIN_GENUS: 1,

  /** hollow: volume / volume of the convex hull, at most */
  HOLLOW_MAX_RATIO: 0.35,

  /** open_top: the inner bottom below this share of the height */
  OPEN_TOP_MAX_HEIGHT_SHARE: 0.5
} as const;

/**
 * Category rules of the automatic classification, checked in this order
 * (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Category Rules): the first rule
 * that matches gives the category and its confidence.
 */
export const CATEGORY_RULES = [
  {
    category: "vase",
    all: ["hollow", "open_top", "tall"],
    none: ["holes"],
    confidence: 75
  },
  {
    category: "container",
    all: ["hollow", "open_top"],
    none: [],
    confidence: 70
  },
  {
    category: "miniature",
    all: ["small", "curved"],
    none: [],
    confidence: 70
  },
  {
    category: "figurine",
    all: ["curved"],
    none: ["hollow", "holes"],
    confidence: 65
  },
  {
    category: "mechanical_part",
    all: ["planar", "holes"],
    none: [],
    confidence: 65
  }
] as const;

/**
 * Confidence of a category chosen by the user
 * (DATA_SCHEMA.md 3.10.0, Classification Rules).
 */
export const USER_CLASSIFICATION_CONFIDENCE = 100;
