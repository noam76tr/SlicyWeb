/**
 * SlicyWeb
 * Confidence Scorer
 *
 * Responsible for:
 * - Confidence score calculation
 * - Confidence normalization
 * - Confidence level evaluation
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - DATA_SCHEMA.md
 */

import { CONFIDENCE_LEVELS } from "../constants/AnalysisConstants";
import type {
  ClassificationCategory,
  ConfidenceLevel,
} from "../types/Classification";

export class ConfidenceScorer {
  /**
   * Calculates confidence score.
   */
  public static calculate(
    features: string[],
    category: ClassificationCategory,
  ): number {
    if (features.length === 0) {
      return 0;
    }

    let score = 50;

    score += Math.min(
      features.length * 5,
      50,
    );

    if (category === "unknown") {
      score = 0;
    }

    return this.normalize(score);
  }

  /**
   * Normalizes confidence score.
   */
  public static normalize(
    score: number,
  ): number {
    return Math.max(
      0,
      Math.min(100, score),
    );
  }

  /**
   * Returns the confidence level
   * (OBJECT_CLASSIFICATION_SPEC.md, Confidence Levels:
   * 0-39 unknown, 40-59 low, 60-74 medium, 75-89 high, 90-100 very high).
   */
  public static getLevel(
    score: number,
  ): ConfidenceLevel {
    const normalizedScore =
      this.normalize(score);

    if (normalizedScore >= CONFIDENCE_LEVELS.VERY_HIGH.min) {
      return "very_high";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.HIGH.min) {
      return "high";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.MEDIUM.min) {
      return "medium";
    }

    if (normalizedScore >= CONFIDENCE_LEVELS.LOW.min) {
      return "low";
    }

    return "unknown";
  }

  /**
   * Returns whether score is considered reliable.
   */
  public static isReliable(
    score: number,
  ): boolean {
    return (
      this.normalize(score) >= 75
    );
  }
}
