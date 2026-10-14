/**
 * SlicyWeb
 * Classification Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - AI_ENGINE_SPEC.md
 */

import type { CLASSIFICATION_CATEGORIES } from "../constants/AnalysisConstants";

/**
 * Stored value of a classification category
 * (DATA_SCHEMA.md, Classification Categories).
 */
export type ClassificationCategory =
  (typeof CLASSIFICATION_CATEGORIES)[number];

/**
 * Confidence level of a classification
 * (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels).
 * Computed from confidenceScore; not stored.
 */
export type ConfidenceLevel =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "very_high";

/**
 * Object Classification Schema (DATA_SCHEMA.md).
 */
export interface Classification {
  category: ClassificationCategory;

  subcategory: string;

  /**
   * Confidence score between 0 and 100.
   */
  confidenceScore: number;

  detectedFeatures: string[];

  detectedTags: string[];

  classificationVersion: string;
}
