/**
 * Wichy
 * Stability Analyzer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

export interface StabilityAnalysisResult {
  baseArea: number;

  heightRatio: number;

  stabilityScore: number;

  riskScore: number;
}

export class StabilityAnalyzer {
  public analyze(
    object: Object3D
  ): StabilityAnalysisResult {
    const baseArea =
      object.geometry.width *
      object.geometry.depth;

    const heightRatio =
      baseArea > 0
        ? object.geometry.height /
          Math.sqrt(baseArea)
        : 0;

    const stabilityScore =
      this.calculateStabilityScore(
        baseArea,
        heightRatio
      );

    return {
      baseArea,

      heightRatio,

      stabilityScore,

      riskScore:
        100 - stabilityScore
    };
  }

  private calculateStabilityScore(
    baseArea: number,
    heightRatio: number
  ): number {
    let score = 100;

    if (baseArea <= 0) {
      return 0;
    }

    if (heightRatio > 10) {
      score -= 60;
    } else if (heightRatio > 5) {
      score -= 40;
    } else if (heightRatio > 3) {
      score -= 20;
    }

    return Math.max(
      0,
      Math.min(100, score)
    );
  }
}
