/**
 * Wichy
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

import type {
  Classification,
  ClassificationCategory,
  ConfidenceLevel,
} from "../types/Classification";

export class ClassificationValidator {
  private static readonly VALID_CATEGORIES: readonly ClassificationCategory[] =
    [
      "miniature",
      "figurine",
      "decorative_object",
      "vase",
      "container",
      "prototype",
      "tool",
      "gear",
      "bracket",
      "mechanical_part",
      "enclosure",
      "structural_component",
      "articulated_model",
      "unknown",
    ];

  private static readonly VALID_CONFIDENCE_LEVELS: readonly ConfidenceLevel[] =
    [
      "low",
      "medium",
      "high",
      "unknown",
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
      this.validateConfidenceLevel(
        classification.confidenceLevel,
      ) &&
      this.validateFeatures(
        classification.detectedFeatures,
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

  /**
   * Validates validation state.
   */
  public static validateState(
    validated: boolean,
  ): boolean {
    return typeof validated === "boolean";
  }
}
