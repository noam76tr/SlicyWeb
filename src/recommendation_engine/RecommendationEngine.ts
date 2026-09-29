/**
 * Wichy
 * Recommendation Engine Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 * - DATA_SCHEMA.md
 */

import type { Analysis } from "../types/Analysis";
import type { Recommendation } from "../types/Recommendation";

import { DecisionEngine } from "./DecisionEngine";
import { ValidationEngine } from "./ValidationEngine";
import { WarningEngine } from "./WarningEngine";
import { RecommendationBuilder } from "./RecommendationBuilder";

export class RecommendationEngine {
  private readonly decisionEngine =
    new DecisionEngine();

  private readonly validationEngine =
    new ValidationEngine();

  private readonly warningEngine =
    new WarningEngine();

  private readonly recommendationBuilder =
    new RecommendationBuilder();

  public generateRecommendation(
    analysis: Analysis
  ): Recommendation {
    const profile =
      this.decisionEngine.generate(
        analysis
      );

    const validatedProfile =
      this.validationEngine.validate(
        profile
      );

    const warnings =
      this.warningEngine.generate(
        analysis
      );

    return this.recommendationBuilder.build(
      validatedProfile,
      warnings
    );
  }
}
