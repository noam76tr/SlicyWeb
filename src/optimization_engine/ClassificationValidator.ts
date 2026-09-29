/**
 * Wichy
 * Classification Validator
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - SYSTEM_RULES.md
 */

import type {
  Classification,
  ClassificationCategory,
  ConfidenceLevel
} from "../types/Classification";

export class ClassificationValidator {
  private readonly validCategories:
    Set<ClassificationCategory> =
      new Set([
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
        "unknown"
      ]);

  private readonly validConfidenceLevels:
    Set<ConfidenceLevel> =
      new Set([
        "low",
        "medium",
        "high",
        "unknown"
      ]);

  /**
   * Validates an entire classification object.
   */
  public validate(
    classification: Classification
  ): boolean {
    return (
      this.validateCategory(
        classification.category
      ) &&
      this.validateConfidenceScore(
        classification.confidenceScore
      ) &&
      this.validateConfidenceLevel(
        classification.confidenceLevel
      ) &&
      this.validateDetectedFeatures(
        classification.detectedFeatures
      )
    );
  }

  /**
   * Validates category value.
   */
  public validateCategory(
    category: string
  ): boolean {
    return this.validCategories.has(
      category as ClassificationCategory
    );
  }

  /**
   * Validates confidence score.
   */
  public validateConfidenceScore(
    score: number
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
  public validateConfidenceLevel(
    level: string
  ): boolean {
    return this.validConfidenceLevels.has(
      level as ConfidenceLevel
    );
  }

  /**
   * Validates detected features list.
   */
  public validateDetectedFeatures(
    features: string[]
  ): boolean {
    if (!Array.isArray(features)) {
      return false;
    }

    return features.every(
      (feature) =>
        typeof feature === "string" &&
        feature.trim().length > 0
    );
  }

  /**
   * Validates consistency between
   * confidence score and confidence level.
   */
  public validateConsistency(
    classification: Classification
  ): boolean {
    const expectedLevel =
      this.calculateConfidenceLevel(
        classification.confidenceScore
      );

    return (
      classification.confidenceLevel ===
      expectedLevel
    );
  }

  /**
   * Converts score into confidence level.
   */
  public calculateConfidenceLevel(
    score: number
  ): ConfidenceLevel {
    if (score >= 80) {
      return "high";
    }

    if (score >= 50) {
      return "medium";
    }

    if (score > 0) {
      return "low";
    }

    return "unknown";
  }

  /**
   * Validates classification and
   * consistency rules together.
   */
  public validateComplete(
    classification: Classification
  ): boolean {
    return (
      this.validate(classification) &&
      this.validateConsistency(
        classification
      )
    );
  }
}
