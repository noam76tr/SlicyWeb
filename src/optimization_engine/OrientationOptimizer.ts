/**
 * Wichy
 * Orientation Optimizer
 *
 * Responsible for:
 * - Orientation evaluation
 * - Stability scoring
 * - Overhang evaluation
 * - Orientation optimization scoring
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */
import type { Analysis } from "../types/Analysis";

export class OrientationOptimizer {
  /**
   * Calculates orientation optimization score.
   */
  public optimize(
    analysis: Analysis,
  ): number {
    let score = 100;

    score -= this.calculateStabilityPenalty(
      analysis,
    );

    score -= this.calculateOverhangPenalty(
      analysis,
    );

    return this.normalize(score);
  }

  /**
   * Evaluates stability impact.
   */
  private calculateStabilityPenalty(
    analysis: Analysis,
  ): number {
    const riskScore =
      analysis.stability.riskScore;

    return Math.min(
      50,
      riskScore * 0.5,
    );
  }

  /**
   * Evaluates overhang impact.
   */
  private calculateOverhangPenalty(
    analysis: Analysis,
  ): number {
    if (
      !analysis.overhangs.detected
    ) {
      return 0;
    }

    return Math.min(
      50,
      analysis.overhangs.percentage,
    );
  }

  /**
   * Normalizes optimization score.
   */
  private normalize(
    score: number,
  ): number {
    return Math.max(
      0,
      Math.min(100, score),
    );
  }

  /**
   * Returns whether orientation
   * is considered optimal.
   */
  public isOptimal(
    score: number,
  ): boolean {
    return score >= 80;
  }
}
