/**
 * Wichy
 * Material Optimizer
 *
 * Responsible for:
 * - Material usage optimization
 * - Material savings estimation
 * - Recommended infill adjustment
 * - Print efficiency evaluation
 *
 * No rendering logic.
 * No repository logic.
 * No GUI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Material } from "../types/Material";
import type { RecommendedProfile } from "../types/Recommendation";

export class MaterialOptimizer {
  /**
   * Optimizes a profile for reduced
   * material consumption.
   */
  public optimize(
    profile: RecommendedProfile,
    material: Material,
  ): RecommendedProfile {
    const optimizedInfill =
      this.optimizeInfillDensity(
        profile.infillDensity,
      );

    return {
      ...profile,

      infillDensity:
        optimizedInfill,

      confidenceScore:
        this.normalizeScore(
          profile.confidenceScore,
        ),
    };
  }

  /**
   * Estimates material reduction percentage.
   */
  public estimateMaterialReduction(
    currentDensity: number,
    optimizedDensity: number,
  ): number {
    if (currentDensity <= 0) {
      return 0;
    }

    const reduction =
      (
        (currentDensity -
          optimizedDensity) /
        currentDensity
      ) * 100;

    return Math.max(
      0,
      Math.round(reduction),
    );
  }

  /**
   * Optimizes infill density while
   * preserving basic print strength.
   */
  public optimizeInfillDensity(
    density: number,
  ): number {
    if (density <= 10) {
      return density;
    }

    return Math.max(
      10,
      density - 5,
    );
  }

  /**
   * Evaluates material efficiency.
   */
  public calculateEfficiencyScore(
    density: number,
  ): number {
    const score =
      100 - density;

    return this.normalizeScore(
      score,
    );
  }

  /**
   * Verifies that material settings
   * remain within material limits.
   */
  public validateMaterialSettings(
    material: Material,
    nozzleTemperature: number,
  ): boolean {
    return (
      nozzleTemperature >=
        material.temperature.minNozzle &&
      nozzleTemperature <=
        material.temperature.maxNozzle
    );
  }

  /**
   * Normalizes a score between 0 and 100.
   */
  private normalizeScore(
    score: number,
  ): number {
    return Math.max(
      0,
      Math.min(100, score),
    );
  }
}
