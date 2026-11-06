/**
 * SlicyWeb
 * Recommendation Service Definition
 *
 * Relays the generation of the recommendation of one object to the
 * recommendation engine (Phase 10 lot 87). The automatic start and the
 * store come with the interface (lot 88, ADR-035 D11).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 */

import type { Recommendation } from "../types/Recommendation";

import {
  RecommendationEngine,
  type RecommendationInput
} from "../recommendation_engine/RecommendationEngine";

export class RecommendationService {
  private readonly recommendationEngine =
    new RecommendationEngine();

  public generateRecommendation(
    input: RecommendationInput
  ): Recommendation {
    return this.recommendationEngine.generateRecommendation(
      input
    );
  }
}
