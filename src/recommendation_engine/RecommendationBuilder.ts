/**
 * Wichy
 * Recommendation Builder Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 * - DATA_SCHEMA.md
 */

import type {
  RecommendedProfile,
  Recommendation
} from "../types/Recommendation";

import type { Warning } from "../types/Warning";

export class RecommendationBuilder {
  public build(
    profile: RecommendedProfile,
    warnings: Warning[]
  ): Recommendation {
    return {
      recommendedProfile: profile,

      printPreset:
        profile.printPreset,

      optimization: {
        orientationScore: 0,

        supportReduction: 0,

        timeReduction: 0,

        materialReduction: 0
      },

      warnings,

      confidenceScore:
        profile.confidenceScore
    };
  }
}
