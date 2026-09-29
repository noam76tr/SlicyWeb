/**
 * Wichy
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

import type {
  ClassificationCategory,
} from "../types/Classification";

export type ConfidenceLevel =
  | "low"
  | "medium"
  | "high"
  | "unknown";

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
   * Returns confidence level.
   */
  public static getLevel(
    score: number,
  ): ConfidenceLevel {
    const normalizedScore =
      this.normalize(score);

    if (normalizedScore === 0) {
      return "unknown";
    }

    if (normalizedScore < 60) {
      return "low";
    }

    if (normalizedScore < 85) {
      return "medium";
    }

    return "high";
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
