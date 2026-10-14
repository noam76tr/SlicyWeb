/**
 * SlicyWeb
 * Classification Validator
 *
 * Responsible for:
 * - Classification validation
 * - Category validation
 * - Confidence validation
 * - Feature validation
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import { CLASSIFICATION_CATEGORIES } from "../constants/AnalysisConstants";
import type {
  Classification,
  ClassificationCategory,
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
      this.validateFeatures(
        classification.detectedFeatures,
      ) &&
      this.validateFeatures(
        classification.detectedTags,
      )
    );
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
