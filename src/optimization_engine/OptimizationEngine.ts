/**
 * SlicyWeb
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
  RecommendedProfile,
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
   * Generates optimization result
   * for an object and its recommended profile.
   */
  public optimize(
    analysis: Analysis,
    profile: RecommendedProfile,
  ): OptimizationResult {
    const orientationScore =
      this.orientationOptimizer.optimize(
        analysis,
      );

    const optimizedInfillDensity =
      this.materialOptimizer.optimizeInfillDensity(
        profile.infillDensity,
      );

    const materialReduction =
      this.materialOptimizer.estimateMaterialReduction(
        profile.infillDensity,
        optimizedInfillDensity,
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
