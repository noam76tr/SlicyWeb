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
   * The print preset is selected among the available presets
   * (PRINT_PRESETS_SPEC.md, Classification To Preset Mapping, Default Preset);
   * no preset is invented when none is available.
   */
  public generateRecommendation(
    analysis: Analysis,
    selection: RecommendationSelection,
    presets: PrintPreset[]
  ): Recommendation {
    // DATA_SCHEMA.md 3.9.0: no recommendation while the object is
    // not classified (classification null, ADR-034 D1).
    const classification = analysis.classification;

    if (classification === null) {
      throw new Error(
        "REC_002 Insufficient Data: the object is not classified yet."
      );
    }

    const presetSelection =
      this.decisionEngine.selectPreset(
        classification,
        presets
      );

    if (!presetSelection) {
      throw new Error(
        "REC_002 Insufficient Data: no Balanced print preset available."
      );
    }

    const profile =
      this.decisionEngine.generate(
        analysis,
        presetSelection.preset
      );

    const validatedProfile =
      this.validationEngine.validate(
        profile
      );

    const warnings = [
      ...presetSelection.warnings,
      ...this.warningEngine.generate(
        analysis
      )
    ];

    return this.recommendationBuilder.build(
      analysis,
      classification,
      selection,
      validatedProfile,
      warnings
    );
  }
}
