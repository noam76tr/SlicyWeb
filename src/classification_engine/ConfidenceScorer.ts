/**
 * SlicyWeb
 * Confidence Scorer
 *
 * Responsible for:
 * - Confidence score calculation
 * - Confidence level evaluation
 * - Classification confidence normalization
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import { CONFIDENCE_LEVELS } from "../constants/AnalysisConstants";
import type {
  ClassificationCategory,
  ConfidenceLevel,
} from "../types/Classification";

export class ConfidenceScorer {
  /**
   * Clamps a score between 0 and 100.
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
   * Calculates a confidence score.
   * An unknown category has no confidence
   * (same rule as src/optimization_engine/ConfidenceScorer.ts).
   */
  public static calculate(
    features: string[],
    category: ClassificationCategory,
  ): number {
    if (features.length === 0) {
      return 0;
    }

    if (category === "unknown") {
      return 0;
    }

    let score = 50;

    score += Math.min(
      features.length * 5,
      50,
    );

    return this.normalize(score);
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
   * Returns whether a score is reliable.
   */
  public static isReliable(
    score: number,
  ): boolean {
    return (
      this.normalize(score) >= 75
    );
  }
}
