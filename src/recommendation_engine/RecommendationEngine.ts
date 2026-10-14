/**
 * SlicyWeb
 * Recommendation Engine Definition
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md
 * - DATA_SCHEMA.md
 */

import type { Analysis } from "../types/Analysis";
import type { PrintPreset } from "../types/PrintPreset";
import type { Recommendation } from "../types/Recommendation";

import { DecisionEngine } from "./DecisionEngine";
import { ValidationEngine } from "./ValidationEngine";
import { WarningEngine } from "./WarningEngine";
import {
  RecommendationBuilder,
  type RecommendationSelection
} from "./RecommendationBuilder";

export class RecommendationEngine {
  private readonly decisionEngine =
    new DecisionEngine();

  private readonly validationEngine =
    new ValidationEngine();

  private readonly warningEngine =
    new WarningEngine();

  private readonly recommendationBuilder =
    new RecommendationBuilder();

  /**
   * Generates the recommendation of one object.
   * The print preset is selected among the available presets;
   * no preset is invented when none is available.
   */
  public generateRecommendation(
    analysis: Analysis,
    selection: RecommendationSelection,
    presets: PrintPreset[]
  ): Recommendation {
    const preset =
      this.decisionEngine.selectPreset(
        analysis.classification,
        presets
      );

    if (!preset) {
      throw new Error(
        "No print preset available: a recommendation requires a print preset."
      );
    }

    const profile =
      this.decisionEngine.generate(
        analysis,
        preset
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
      analysis,
      selection,
      validatedProfile,
      warnings
    );
  }
}
