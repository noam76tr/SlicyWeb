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
import type { Classification } from "../types/Classification";

import type {
  RecommendedProfile,
  Recommendation
} from "../types/Recommendation";

import type { Warning } from "../types/Warning";

/**
 * Printer, material and filament the recommendation is generated for
 * (API_SPEC.md, Generate Recommendation input).
 */
export type RecommendationSelection = Pick<
  Recommendation,
  "printerId" | "materialId" | "filamentId"
>;

export class RecommendationBuilder {
  /**
   * Builds the recommendation of the object analyzed by
   * the given analysis (ADR-026, Object Reference Rules 2 and 5),
   * for the selected printer, material and filament
   * (API_SPEC.md, Generate Recommendation input).
   * classification: the classification of the analysis, never null
   * (DATA_SCHEMA.md 3.9.0, Object Classification Schema).
   */
  public build(
    analysis: Analysis,
    classification: Classification,
    selection: RecommendationSelection,
    profile: RecommendedProfile,
    warnings: Warning[]
  ): Recommendation {
    return {
      recommendationId:
        crypto.randomUUID(),

      objectId: analysis.objectId,

      printerId: selection.printerId,

      materialId: selection.materialId,

      filamentId: selection.filamentId,

      analysisId: analysis.analysisId,

      classification,

      recommendedProfile: profile,

      preset: profile.preset,

      warnings,

      confidenceScore:
        profile.confidenceScore,

      createdAt:
        new Date().toISOString(),

      status: "generated"
    };
  }
}
