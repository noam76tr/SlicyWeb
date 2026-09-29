/**
 * Wichy
 * Validation Engine Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 * - RECOMMENDATION_RULES.md
 */

import type { RecommendedProfile } from "../types/Recommendation";

export class ValidationEngine {
  public validate(
    profile: RecommendedProfile
  ): RecommendedProfile {
    return {
      ...profile,

      quality: {
        ...profile.quality,

        layerHeight:
          this.validateLayerHeight(
            profile.quality.layerHeight
          ),

        wallCount:
          this.validateWallCount(
            profile.quality.wallCount
          )
      },

      infillDensity:
        this.validateInfillDensity(
          profile.infillDensity
        ),

      confidenceScore:
        this.validateScore(
          profile.confidenceScore
        )
    };
  }

  private validateLayerHeight(
    value: number
  ): number {
    return Math.max(
      0.08,
      Math.min(0.28, value)
    );
  }

  private validateWallCount(
    value: number
  ): number {
    return Math.max(
      1,
      Math.min(10, value)
    );
  }

  private validateInfillDensity(
    value: number
  ): number {
    return Math.max(
      0,
      Math.min(100, value)
    );
  }

  private validateScore(
    value: number
  ): number {
    return Math.max(
      0,
      Math.min(100, value)
    );
  }
}
