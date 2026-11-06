/**
 * SlicyWeb
 * Classification Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md (3.10.0: Object Classification Schema)
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - AI_ENGINE_SPEC.md
 */

import type {
  CLASSIFICATION_CATEGORIES,
  CLASSIFICATION_SOURCES,
  GEOMETRIC_FEATURES,
} from "../constants/AnalysisConstants";

/**
 * Stored value of a classification category
 * (DATA_SCHEMA.md, Classification Categories).
 */
export type ClassificationCategory =
  (typeof CLASSIFICATION_CATEGORIES)[number];

/**
 * Who chose the category (DATA_SCHEMA.md 3.10.0, Classification Rules).
 */
export type ClassificationSource = (typeof CLASSIFICATION_SOURCES)[number];

/**
 * Name of a measured geometric feature
 * (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, Geometric Features).
 */
export type GeometricFeature = (typeof GEOMETRIC_FEATURES)[number];

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

  /**
   * automatic: computed from the geometry; user: chosen by the user
   * (DATA_SCHEMA.md 3.10.0). A classification read without source is
   * automatic (AnalysisSchema).
   */
  source: ClassificationSource;
}
