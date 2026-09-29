/**
 * Wichy
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

export type ConfidenceLevel =
  | "low"
  | "medium"
  | "high"
  | "unknown";

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
   */
  
  public static calculate(
    features: string[],
    category: string,
  ): number {
    if (features.length === 0) {
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
