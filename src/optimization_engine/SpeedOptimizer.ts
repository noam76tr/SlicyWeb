/**
 * Wichy
 * Speed Optimizer
 *
 * Responsible for:
 * - Print time optimization estimation
 * - Speed optimization scoring
 * - Time reduction evaluation
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 * No material logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */
import type { Analysis } from "../types/Analysis";

export class SpeedOptimizer {
  /**
   * Returns estimated print time reduction (%).
   */
  public optimize(
    analysis: Analysis,
  ): number {
    let reduction = 15;

    reduction -=
      this.getComplexityPenalty(
        analysis,
      );

    reduction -=
      this.getStabilityPenalty(
        analysis,
      );

    return this.normalize(
      reduction,
    );
  }

  /**
   * Penalizes highly detailed models.
   */
  private getComplexityPenalty(
    analysis: Analysis,
  ): number {
    const triangles =
      analysis.mesh.triangles;

    if (triangles > 1_000_000) {
      return 15;
    }

    if (triangles > 500_000) {
      return 10;
    }

    if (triangles > 100_000) {
      return 5;
    }

    return 0;
  }

  /**
   * Penalizes unstable models.
   */
  private getStabilityPenalty(
    analysis: Analysis,
  ): number {
    const riskScore =
      analysis.stability.riskScore;

    if (riskScore > 75) {
      return 10;
    }

    if (riskScore > 50) {
      return 5;
    }

    return 0;
  }

  /**
   * Normalizes result between 0 and 100.
   */
  private normalize(
    value: number,
  ): number {
    return Math.max(
      0,
      Math.min(100, value),
    );
  }

  /**
   * Returns whether optimization gain
   * is considered significant.
   */
  public isSignificant(
    reduction: number,
  ): boolean {
    return reduction >= 10;
  }
}
