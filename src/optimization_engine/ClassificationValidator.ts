/**
 * SlicyWeb
 * Classification Validator
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - SYSTEM_RULES.md
 */

import { CLASSIFICATION_CATEGORIES } from "../constants/AnalysisConstants";
import type {
  Classification,
  ClassificationCategory,
  ConfidenceLevel
} from "../types/Classification";

import { ConfidenceScorer } from "./ConfidenceScorer";

export class ClassificationValidator {
  private readonly validCategories:
    Set<ClassificationCategory> =
      new Set(CLASSIFICATION_CATEGORIES);

  private readonly validConfidenceLevels:
    Set<ConfidenceLevel> =
      new Set<ConfidenceLevel>([
        "unknown",
        "low",
        "medium",
        "high",
        "very_high"
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
      this.validateDetectedFeatures(
        classification.detectedFeatures
      ) &&
      Array.isArray(
        classification.detectedTags
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
   * Converts score into confidence level
   * (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels).
   */
  public calculateConfidenceLevel(
    score: number
  ): ConfidenceLevel {
    return ConfidenceScorer.getLevel(
      score
    );
  }
}
