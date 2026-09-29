/**
 * Wichy
 * Support Optimizer
 *
 * Responsible for:
 * - Support reduction estimation
 * - Overhang evaluation
 * - Bridge evaluation
 * - Support optimization scoring
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

export class SupportOptimizer {
  /**
   * Returns estimated support reduction (%).
   */
  public optimize(
    analysis: Analysis,
  ): number {
    let reduction = 100;

    reduction -=
      this.getOverhangPenalty(
        analysis,
      );

    reduction -=
      this.getBridgePenalty(
        analysis,
      );

    return this.normalize(
      reduction,
    );
  }

  /**
   * Evaluates overhang impact.
   */
  private getOverhangPenalty(
    analysis: Analysis,
  ): number {
    if (
      !analysis.overhangs.detected
    ) {
      return 0;
    }

    return Math.min(
      60,
      analysis.overhangs.percentage,
    );
  }

  /**
   * Evaluates bridge impact.
   */
  private getBridgePenalty(
    analysis: Analysis,
  ): number {
    if (
      !analysis.bridges.detected
    ) {
      return 0;
    }

    return Math.min(
      40,
      analysis.bridges.count * 2,
    );
  }

  /**
   * Normalizes score between 0 and 100.
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
   * Returns whether support usage
   * is already considered optimal.
   */
  public isOptimal(
    reduction: number,
  ): boolean {
    return reduction >= 80;
  }
}
