/**
 * Wichy
 * Recommendation Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 */

import type { Analysis } from "../types/Analysis";
import type { Recommendation } from "../types/Recommendation";

import { RecommendationEngine } from "../recommendation_engine/RecommendationEngine";

export class RecommendationService {
  private readonly recommendationEngine =
    new RecommendationEngine();

  public generateRecommendation(
    analysis: Analysis
  ): Recommendation {
    return this.recommendationEngine.generateRecommendation(
      analysis
    );
  }
}
