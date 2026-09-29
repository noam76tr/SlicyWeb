/**
 * Wichy
 * Optimization Engine
 *
 * Responsible for:
 * - Optimization orchestration
 * - Orientation optimization
 * - Material optimization
 * - Speed optimization
 * - Support optimization
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
import type {
  OptimizationResult,
} from "../types/Recommendation";

import { OrientationOptimizer } from "./OrientationOptimizer";
import { MaterialOptimizer } from "./MaterialOptimizer";
import { SpeedOptimizer } from "./SpeedOptimizer";
import { SupportOptimizer } from "./SupportOptimizer";

export class OptimizationEngine {
  private readonly orientationOptimizer =
    new OrientationOptimizer();

  private readonly materialOptimizer =
    new MaterialOptimizer();

  private readonly speedOptimizer =
    new SpeedOptimizer();

  private readonly supportOptimizer =
    new SupportOptimizer();

  /**
   * Generates optimization result.
   */
  public optimize(
    analysis: Analysis,
  ): OptimizationResult {
    const orientationScore =
      this.orientationOptimizer.optimize(
        analysis,
      );

    const materialReduction =
      this.materialOptimizer.optimize(
        analysis,
      );

    const timeReduction =
      this.speedOptimizer.optimize(
        analysis,
      );

    const supportReduction =
      this.supportOptimizer.optimize(
        analysis,
      );

    return {
      orientationScore,

      supportReduction,

      timeReduction,

      materialReduction,
    };
  }
}
