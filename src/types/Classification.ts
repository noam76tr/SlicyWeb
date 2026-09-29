/**
 * Wichy
 * Classification Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - AI_ENGINE_SPEC.md
 */

export type ClassificationCategory =
  | "miniature"
  | "figurine"
  | "decorative_object"
  | "vase"
  | "container"
  | "prototype"
  | "tool"
  | "gear"
  | "bracket"
  | "mechanical_part"
  | "enclosure"
  | "structural_component"
  | "articulated_model"
  | "unknown";

export type ConfidenceLevel =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export interface Classification {
  /**
   * Detected object category.
   */
  category: ClassificationCategory;

  /**
   * Confidence score between 0 and 100.
   */
  confidenceScore: number;

  /**
   * Human-readable confidence level.
   */
  confidenceLevel: ConfidenceLevel;

  /**
   * Features detected during analysis.
   */
  detectedFeatures: string[];

  /**
   * Whether classification passed validation.
   */
  validated: boolean;
}
