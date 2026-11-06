/**
 * SlicyWeb
 * Recommendation Constants Definition
 *
 * The numbers of the recommendation engine of Phase 10 (ADR-035 D5 to
 * D10, decisions of Noam, 2026-11-05 and 2026-11-06). Each value comes
 * from the section of the document named beside it; none is chosen here.
 *
 * Based on:
 * - RECOMMENDATION_RULES.md 1.1.2 (Rules Of Version 1.1.0)
 * - PRINT_PRESETS_SPEC.md 1.3.0 (Recommended Profile Initialization)
 */

import type { WarningSeverity } from "../types/Warning";

/**
 * Engine defaults (PRINT_PRESETS_SPEC.md 1.3.0, Recommended Profile
 * Initialization): wall and infill speeds at most the print speed of the
 * preset, travel 250 mm/s, minimum layer time 5 s.
 */
export const ENGINE_DEFAULTS = {
  OUTER_WALL_SPEED: 40,
  INNER_WALL_SPEED: 80,
  INFILL_SPEED: 120,
  TRAVEL_SPEED: 250,
  MINIMUM_LAYER_TIME: 5
} as const;

/**
 * Limits (RECOMMENDATION_RULES.md, Limits).
 */
export const RECOMMENDATION_LIMITS = {
  /** Print speed when the printer does not publish maxPrintSpeed */
  PRINT_SPEED_UNPUBLISHED: 100,
  /** Travel speed when the printer does not publish maxTravelSpeed */
  TRAVEL_SPEED_UNPUBLISHED: 150,
  /** Print speed of the family TPU */
  TPU_PRINT_SPEED: 30,
  /** Layer height at most this part of the default nozzle */
  LAYER_HEIGHT_NOZZLE_RATIO: 0.75,
  LAYER_HEIGHT_MIN: 0.08,
  LAYER_HEIGHT_MAX: 0.28,
  /** VALUE_LIMITED when a limit lowers a value by at least this part */
  VALUE_LIMITED_RATIO: 0.1
} as const;

/** Temperatures are rounded to this step, in °C (Temperature And Cooling) */
export const TEMPERATURE_STEP = 5;

/**
 * Fan by family when the filament publishes none (Temperature And
 * Cooling). A family without a value here: REC_002.
 */
export const FAMILY_FAN_SPEEDS: Readonly<Record<string, number>> = {
  PLA: 90,
  PETG: 50,
  ABS: 15,
  ASA: 15,
  TPU: 40
};

/** Retraction by extruder type (Retraction) */
export const RETRACTION_BY_EXTRUDER = {
  direct_drive: { distance: 0.8, speed: 35 },
  bowden: { distance: 5, speed: 40 }
} as const;

/** Families with their own rules */
export const FAMILY_TPU = "TPU";
export const WARP_FAMILIES: readonly string[] = ["ABS", "ASA"];

/**
 * Supports And Adhesion: supports above these values; brim from this
 * stability risk (Moderate).
 */
export const SUPPORT_THRESHOLDS = {
  OVERHANG_ANGLE: 60,
  BRIDGE_LENGTH: 50,
  BRIM_RISK_SCORE: 41
} as const;

/** Thresholds of the warnings (Recommendation Warnings) */
export const WARNING_THRESHOLDS = {
  OVERHANG_HIGH_SEVERE: 75,
  LONG_BRIDGE: 25,
  STABILITY_LOW: 41,
  STABILITY_MEDIUM: 61,
  STABILITY_HIGH: 81
} as const;

/**
 * Codes of the recommendation warnings, in the order of the table of
 * Recommendation Warnings (order of display inside a severity).
 */
export const RECOMMENDATION_WARNING_CODES = [
  "CLASSIFICATION_UNCERTAIN",
  "EXPECTED_PRESET_UNAVAILABLE",
  "OVERHANG_HIGH",
  "LONG_BRIDGE",
  "THIN_WALLS",
  "LOW_STABILITY",
  "OBJECT_TOO_LARGE",
  "TEMPERATURE_UNSUPPORTED",
  "MATERIAL_NOT_LISTED",
  "ENCLOSURE_RECOMMENDED",
  "VASE_SUPPORTS_IGNORED",
  "EXTRUDER_UNKNOWN",
  "VALUE_LIMITED"
] as const;

export type RecommendationWarningCode =
  (typeof RECOMMENDATION_WARNING_CODES)[number];

/**
 * English reference text of each code (DATA_SCHEMA.md 3.10.0, Warning
 * Schema): stored, never shown; the interface shows warning.<CODE>.
 */
export const RECOMMENDATION_WARNING_MESSAGES: Readonly<
  Record<RecommendationWarningCode, string>
> = {
  CLASSIFICATION_UNCERTAIN:
    "Object classification uncertain. Balanced preset used.",
  EXPECTED_PRESET_UNAVAILABLE:
    "Expected preset not available. Balanced preset used.",
  OVERHANG_HIGH: "High overhang angle. Supports enabled.",
  LONG_BRIDGE: "Long bridge detected.",
  THIN_WALLS: "Walls thinner than the nozzle.",
  LOW_STABILITY: "Object stability risk.",
  OBJECT_TOO_LARGE: "Object larger than the build volume.",
  TEMPERATURE_UNSUPPORTED:
    "Temperature required by the material above the printer maximum.",
  MATERIAL_NOT_LISTED: "Material not listed by the printer.",
  ENCLOSURE_RECOMMENDED: "Enclosure recommended for this material.",
  VASE_SUPPORTS_IGNORED: "Vase preset: supports not enabled.",
  EXTRUDER_UNKNOWN:
    "Extruder type unknown. Direct drive retraction used.",
  VALUE_LIMITED: "A value was lowered by a limit."
};

/** Severities from the most severe (order of display) */
export const SEVERITY_ORDER: readonly WarningSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info"
];

/** Source of the recommendation warnings (Warning Schema) */
export const RECOMMENDATION_WARNING_SOURCE = "recommendation";

/** Confidence reductions (RECOMMENDATION_RULES.md, Confidence) */
export const CONFIDENCE_REDUCTIONS = {
  NO_FILAMENT: 15,
  INCOMPLETE_ANALYSIS: 20,
  USER_PRINTER: 10,
  USER_FILAMENT: 10,
  CLASSIFICATION_LOW: 10,
  CLASSIFICATION_UNKNOWN: 20
} as const;

/**
 * Levels of the recommendation confidence (RECOMMENDATION_RULES.md 1.1.2,
 * Confidence: 90-100 Excellent, 75-89 High, 60-74 Moderate, 40-59 Low,
 * 0-39 Very Low), from the highest; shown in the Recommendation section
 * (lot 88). Distinct from the levels of the classification.
 */
export const RECOMMENDATION_CONFIDENCE_LEVELS = [
  { level: "excellent", min: 90 },
  { level: "high", min: 75 },
  { level: "moderate", min: 60 },
  { level: "low", min: 40 },
  { level: "veryLow", min: 0 }
] as const;
