/**
 * SlicyWeb
 * Recommendation Engine Definition
 *
 * Generates the recommendation of one object, in the order of
 * RECOMMENDATION_RULES.md 1.1.2 (Inputs And Order):
 * 1. preset from the classification (Default Preset);
 * 2. profile initialized from the preset and the engine defaults;
 * 3. limits; 4. temperature and cooling; 5. retraction;
 * 6. supports and adhesion; 7. warnings; 8. confidence.
 *
 * Rules only, computed at once (no Web Worker, ADR-035 D11). The
 * result is checked with RecommendationSchema.
 *
 * Errors (ERROR_CODES_SPEC.md, Recommendation Errors), thrown as an
 * Error whose message starts with the code:
 * - REC_002 Insufficient Data: no printer or no material, no analysis or
 *   classification null, no Balanced preset, no fan value for the family,
 *   no temperature range known;
 * - REC_001 Recommendation Failed: recommendation refused by
 *   RecommendationSchema.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md 1.1.2
 * - PRINT_PRESETS_SPEC.md 1.3.0
 * - DATA_SCHEMA.md (Recommendation Schema 3.10.0)
 * - DECISIONS.md (ADR-035 D5 to D11)
 */

import { RecommendationSchema } from "../schemas/RecommendationSchema";
import type { Analysis } from "../types/Analysis";
import type { Filament } from "../types/Filament";
import type { Material } from "../types/Material";
import type { PrintPreset } from "../types/PrintPreset";
import type { Printer } from "../types/Printer";
import type { Recommendation } from "../types/Recommendation";

import { DecisionEngine, isWarpFamily } from "./DecisionEngine";
import { ValidationEngine } from "./ValidationEngine";
import {
  WarningEngine,
  recommendationWarning,
  type RecommendationWarning
} from "./WarningEngine";
import { RecommendationBuilder } from "./RecommendationBuilder";

/**
 * Inputs of a recommendation (RECOMMENDATION_RULES.md, Inputs And
 * Order).
 */
export interface RecommendationInput {
  /** The analysis of the object, up to date */
  analysis: Analysis | null;

  /** false when the mesh is not closed (ANA_002): incomplete analysis */
  meshClosed: boolean;

  /** Selected printer (required) */
  printer: Printer | null;

  /** true for a printer of the user (Local Custom) */
  printerIsUser: boolean;

  /** Selected material (required) */
  material: Material | null;

  /** Selected filament, null when none is selected */
  filament: Filament | null;

  /** true for a filament of the user (Local Custom) */
  filamentIsUser: boolean;

  /** Loaded presets (preset:getAll) */
  presets: PrintPreset[];
}

function insufficientData(reason: string): Error {
  return new Error(`REC_002 Insufficient Data: ${reason}`);
}

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
   * No preset is invented when none is available.
   */
  public generateRecommendation(
    input: RecommendationInput
  ): Recommendation {
    const { analysis, printer, material, filament } = input;

    if (printer === null || material === null) {
      throw insufficientData("select a printer and a material.");
    }

    if (analysis === null || analysis.classification === null) {
      throw insufficientData("the object is not analyzed or classified yet.");
    }

    const classification = analysis.classification;
    const family = material.category;
    const warpFamily = isWarpFamily(family);

    // 1. Preset
    const presetSelection =
      this.decisionEngine.selectPreset(
        classification,
        input.presets
      );

    if (!presetSelection) {
      throw insufficientData("no Balanced print preset available.");
    }

    const preset = presetSelection.preset;

    // 4. Temperature and cooling (computed before the limits of 3)
    const nozzle = this.decisionEngine.temperature("nozzle", material, filament);
    const bed = this.decisionEngine.temperature("bed", material, filament);

    if (nozzle === null || bed === null) {
      throw insufficientData("no temperature range is known.");
    }

    const cooling = this.decisionEngine.cooling(family, filament);

    if (cooling === null) {
      throw insufficientData(`no fan value for the family ${family}.`);
    }

    // 5. Retraction
    const retraction = this.decisionEngine.retraction(printer, family, filament);

    // 6. Supports and adhesion
    const supports = this.decisionEngine.supports(analysis, preset);

    // 8. Confidence
    const confidenceScore = this.decisionEngine.confidence({
      classification,
      analysis,
      meshClosed: input.meshClosed,
      filament,
      printerIsUser: input.printerIsUser,
      filamentIsUser: input.filamentIsUser,
    });

    // 2. Profile from the preset, then 3. limits
    const profile = this.validationEngine.validate(
      this.decisionEngine.generate(preset, {
        temperature: { nozzle: nozzle.value, bed: bed.value },
        cooling,
        retraction: retraction.retraction,
        supports: supports.supports,
        adhesion: this.decisionEngine.adhesion(
          analysis,
          classification,
          family,
          preset
        ),
        confidenceScore,
      })
    );

    const limits = this.validationEngine.applyLimits(
      profile,
      printer,
      family,
      { nozzle, bed }
    );

    // 7. Warnings
    const warnings: RecommendationWarning[] = [
      ...presetSelection.warnings,
      ...this.warningEngine.generate(analysis, printer, family, warpFamily),
      ...limits.warnings,
    ];

    if (supports.vaseSupportsIgnored) {
      warnings.push(recommendationWarning("VASE_SUPPORTS_IGNORED", "medium"));
    }

    if (retraction.extruderUnknown) {
      warnings.push(recommendationWarning("EXTRUDER_UNKNOWN", "info"));
    }

    const recommendation = this.recommendationBuilder.build(
      analysis,
      classification,
      {
        printerId: printer.id,
        materialId: material.id,
        filamentId: filament?.id ?? null,
      },
      limits.profile,
      this.warningEngine.finalize(warnings)
    );

    const checked = RecommendationSchema.safeParse(recommendation);

    if (!checked.success) {
      const issue = checked.error.issues[0];

      throw new Error(
        `REC_001 Recommendation Failed: ${issue?.path.join(".") || "recommendation"}: ${issue?.message ?? "invalid"}`
      );
    }

    return recommendation;
  }
}
