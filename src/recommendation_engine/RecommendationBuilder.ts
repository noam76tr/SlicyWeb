/**
 * SlicyWeb
 * Recommendation Builder Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 * - DATA_SCHEMA.md
 */

import type { Analysis } from "../types/Analysis";

import type {
  RecommendedProfile,
  Recommendation
} from "../types/Recommendation";

import type { Warning } from "../types/Warning";

export class RecommendationBuilder {
  /**
   * Builds the recommendation of the object analyzed by
   * the given analysis (ADR-026, Object Reference Rules 2 and 5).
   */
  public build(
    analysis: Analysis,
    profile: RecommendedProfile,
    warnings: Warning[]
  ): Recommendation {
    return {
      recommendationId:
        crypto.randomUUID(),

      objectId: analysis.objectId,

      analysisId: analysis.analysisId,

      status: "generated",

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
