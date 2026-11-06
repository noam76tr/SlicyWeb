/**
 * SlicyWeb
 * Classification Validator
 *
 * Responsible for:
 * - Classification validation
 * - Category validation
 * - Confidence validation
 * - Feature validation (names, order and uniqueness of the geometric
 *   features, OBJECT_CLASSIFICATION_SPEC.md 1.2.0)
 * - Source validation (DATA_SCHEMA.md 3.10.0)
 *
 * Called by ClassificationEngine for every classification (KI-011).
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0: Geometric Features)
 * - DATA_SCHEMA.md (3.10.0: Classification Rules)
 */

import {
  CLASSIFICATION_CATEGORIES,
  CLASSIFICATION_SOURCES,
  GEOMETRIC_FEATURES,
} from "../constants/AnalysisConstants";
import type {
  Classification,
  ClassificationCategory,
  ClassificationSource,
  ConfidenceLevel,
} from "../types/Classification";

export class ClassificationValidator {
  private static readonly VALID_CATEGORIES: readonly ClassificationCategory[] =
    CLASSIFICATION_CATEGORIES;

  private static readonly VALID_CONFIDENCE_LEVELS: readonly ConfidenceLevel[] =
    [
      "unknown",
      "low",
      "medium",
      "high",
      "very_high",
    ];

  /**
   * Validates a classification result.
   */
  public static validate(
    classification:
      | Classification
      | null
      | undefined,
  ): boolean {
    if (!classification) {
      return false;
    }

    return (
      this.validateCategory(
        classification.category,
      ) &&
      this.validateConfidenceScore(
        classification.confidenceScore,
      ) &&
      this.validateDetectedFeatures(
        classification.detectedFeatures,
      ) &&
      this.validateFeatures(
        classification.detectedTags,
      ) &&
      this.validateSource(
        classification.source,
      )
    );
  }

  /**
   * Validates the source of the category.
   */
  public static validateSource(
    source: ClassificationSource,
  ): boolean {
    return CLASSIFICATION_SOURCES.includes(source);
  }

  /**
   * Validates the measured geometric features: known names, each at most
   * once, in the order of OBJECT_CLASSIFICATION_SPEC.md 1.2.0.
   */
  public static validateDetectedFeatures(
    features: string[],
  ): boolean {
    if (!this.validateFeatures(features)) {
      return false;
    }

    const order: readonly string[] = GEOMETRIC_FEATURES;
    let previous = -1;

    for (const feature of features) {
      const position = order.indexOf(feature);

      if (position <= previous) {
        return false;
      }

      previous = position;
    }

    return true;
  }

  /**
   * Validates classification category.
   */
  public static validateCategory(
    category: ClassificationCategory,
  ): boolean {
    return (
      this.VALID_CATEGORIES.includes(
        category,
      )
    );
  }

  /**
   * Validates confidence score.
   */
  public static validateConfidenceScore(
    score: number,
  ): boolean {
    return (
      Number.isFinite(score) &&
      score >= 0 &&
      score <= 100
    );
  }

  /**
   * Validates confidence level.
   */
  public static validateConfidenceLevel(
    level: ConfidenceLevel,
  ): boolean {
    return (
      this.VALID_CONFIDENCE_LEVELS.includes(
        level,
      )
    );
  }

  /**
   * Validates detected features.
   */
  public static validateFeatures(
    features: string[],
  ): boolean {
    return Array.isArray(features);
  }
}
