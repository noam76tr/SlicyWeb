/**
 * SlicyWeb
 * Decision Engine
 *
 * Responsible for:
 * - Preset selection (PRINT_PRESETS_SPEC.md, Classification To Preset
 *   Mapping, Default Preset)
 * - Profile initialization from the preset and the engine defaults
 * - Rules of Phase 10 (RECOMMENDATION_RULES.md 1.1.2, Rules Of Version
 *   1.1.0): temperatures and cooling, retraction, supports and adhesion,
 *   confidence. The limits are applied by ValidationEngine, the warnings
 *   are gathered by WarningEngine.
 *
 * Every value is deterministic: the same inputs always give the same
 * profile.
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md 1.3.0
 * - RECOMMENDATION_RULES.md 1.1.2
 * - OBJECT_CLASSIFICATION_SPEC.md
 * - DECISIONS.md (ADR-035 D5 to D10)
 */
import {
  CLASSIFICATION_PRESET_CATEGORIES,
  DEFAULT_PRESET_CATEGORY
} from "../constants/PresetConstants";
import {
  CONFIDENCE_REDUCTIONS,
  ENGINE_DEFAULTS,
  FAMILY_FAN_SPEEDS,
  FAMILY_TPU,
  RETRACTION_BY_EXTRUDER,
  SUPPORT_THRESHOLDS,
  TEMPERATURE_STEP,
  WARP_FAMILIES
} from "../constants/RecommendationConstants";
import type { Analysis } from "../types/Analysis";
import type { Classification } from "../types/Classification";
import type { Filament } from "../types/Filament";
import type { Material, MaterialTemperature } from "../types/Material";
import type { Printer } from "../types/Printer";
import type { PrintPreset } from "../types/PrintPreset";
import type {
  AdhesionType,
  CoolingSettings,
  RecommendedProfile,
  RetractionSettings,
  SupportSettings
} from "../types/Recommendation";

import { ConfidenceScorer } from "../classification_engine/ConfidenceScorer";

import { recommendationWarning, type RecommendationWarning } from "./WarningEngine";

/**
 * Selected preset and the warnings of the selection
 * (PRINT_PRESETS_SPEC.md, Default Preset).
 */
export interface PresetSelection {
  preset: PrintPreset;

  warnings: RecommendationWarning[];
}

/**
 * Preset selection warnings
 * (PRINT_PRESETS_SPEC.md, Preset Selection Warnings).
 */
export const CLASSIFICATION_UNCERTAIN_WARNING: RecommendationWarning =
  recommendationWarning("CLASSIFICATION_UNCERTAIN", "info");

export const EXPECTED_PRESET_UNAVAILABLE_WARNING: RecommendationWarning =
  recommendationWarning("EXPECTED_PRESET_UNAVAILABLE", "info");

/** A temperature chosen for the nozzle or the bed */
export interface TemperatureChoice {
  /** Value before the limit of the printer */
  value: number;

  /** Minimum of the range used, null when no range is complete */
  rangeMin: number | null;
}

/** Retraction values and whether a value of the direct drive was used */
export interface RetractionChoice {
  retraction: RetractionSettings;

  extruderUnknown: boolean;
}

/** Supports and whether the Vase preset ignored them */
export interface SupportChoice {
  supports: SupportSettings;

  vaseSupportsIgnored: boolean;
}

/** What the confidence depends on (RECOMMENDATION_RULES.md, Confidence) */
export interface ConfidenceInput {
  classification: Classification;
  analysis: Analysis;
  meshClosed: boolean;
  filament: Filament | null;
  printerIsUser: boolean;
  filamentIsUser: boolean;
}

/**
 * Rounded to 5 °C: to the nearest multiple of 5, exactly between two
 * multiples the lower one; when the rounded value leaves the range, the
 * nearest bound of the range.
 */
export function middleOfRange(min: number, max: number): number {
  const middle = (min + max) / 2;
  const rounded =
    Math.ceil(middle / TEMPERATURE_STEP - 0.5) * TEMPERATURE_STEP;

  return Math.min(max, Math.max(min, rounded));
}

/** True when the family needs a brim and an enclosure (warp risk) */
export function isWarpFamily(family: string): boolean {
  return WARP_FAMILIES.includes(family);
}

export class DecisionEngine {
  /**
   * Initial profile of an object: preset.settings and the engine
   * defaults (PRINT_PRESETS_SPEC.md, Recommended Profile Initialization).
   * Temperatures, cooling, retraction, supports and adhesion are set by
   * the rules of the recommendation; confidenceScore by confidence().
   */
  public generate(
    preset: PrintPreset,
    values: {
      temperature: RecommendedProfile["temperature"];
      cooling: CoolingSettings;
      retraction: RetractionSettings;
      supports: SupportSettings;
      adhesion: AdhesionType;
      confidenceScore: number;
    },
  ): RecommendedProfile {
    const settings = preset.settings;

    return {
      preset,

      quality: {
        layerHeight: settings.layerHeight,
        wallCount: settings.wallCount,
        topLayers: settings.topLayers,
        bottomLayers: settings.bottomLayers,
      },

      // Wall and infill speeds never exceed the print speed of the
      // preset; the travel is not limited by it.
      speed: {
        print: settings.printSpeed,
        outerWall: Math.min(ENGINE_DEFAULTS.OUTER_WALL_SPEED, settings.printSpeed),
        innerWall: Math.min(ENGINE_DEFAULTS.INNER_WALL_SPEED, settings.printSpeed),
        infill: Math.min(ENGINE_DEFAULTS.INFILL_SPEED, settings.printSpeed),
        travel: ENGINE_DEFAULTS.TRAVEL_SPEED,
      },

      cooling: values.cooling,

      retraction: values.retraction,

      supports: values.supports,

      adhesion: values.adhesion,

      temperature: values.temperature,

      infillDensity: settings.infillDensity,

      infillPattern: settings.infillPattern,

      confidenceScore: values.confidenceScore,
    };
  }

  /**
   * Nozzle or bed temperature before the limit of the printer
   * (RECOMMENDATION_RULES.md, Temperature And Cooling):
   * 1. the value published by the filament;
   * 2. otherwise the middle of the range of the filament, rounded to 5 °C;
   * 3. without a filament, or when a value of its range is null, the
   *    middle of the range of the material.
   * The range used is the one of step 2 or 3 (also with a published
   * value). null when nothing is known (no complete range).
   */
  public temperature(
    part: "nozzle" | "bed",
    material: Material,
    filament: Filament | null,
  ): TemperatureChoice | null {
    const range = (
      temperature: MaterialTemperature,
    ): [number, number] | null => {
      const [min, max] =
        part === "nozzle"
          ? [temperature.minNozzle, temperature.maxNozzle]
          : [temperature.minBed, temperature.maxBed];

      return min !== null && max !== null ? [min, max] : null;
    };

    const used =
      (filament ? range(filament.temperature) : null) ??
      range(material.temperature);

    const published = filament
      ? part === "nozzle"
        ? filament.manufacturerSettings.nozzleTemperature
        : filament.manufacturerSettings.bedTemperature
      : null;

    if (published !== null) {
      return { value: Math.round(published), rangeMin: used ? used[0] : null };
    }

    if (!used) {
      return null;
    }

    return {
      value: Math.round(middleOfRange(used[0], used[1])),
      rangeMin: used[0],
    };
  }

  /**
   * Fan (RECOMMENDATION_RULES.md, Temperature And Cooling): the value
   * published by the filament, otherwise the value of the family; null
   * when the family has no value (REC_002).
   */
  public cooling(
    family: string,
    filament: Filament | null,
  ): CoolingSettings | null {
    const published = filament?.manufacturerSettings.fanSpeed ?? null;
    const fanSpeed = published ?? FAMILY_FAN_SPEEDS[family] ?? null;

    if (fanSpeed === null) {
      return null;
    }

    return {
      fanSpeed,
      minimumLayerTime: ENGINE_DEFAULTS.MINIMUM_LAYER_TIME,
    };
  }

  /**
   * Retraction (RECOMMENDATION_RULES.md, Retraction): each value
   * published by the filament, otherwise by extruder type (unknown: the
   * direct drive values); family TPU: the distance by extruder type
   * divided by two.
   */
  public retraction(
    printer: Printer,
    family: string,
    filament: Filament | null,
  ): RetractionChoice {
    const byType =
      printer.extruder.type === "bowden"
        ? RETRACTION_BY_EXTRUDER.bowden
        : RETRACTION_BY_EXTRUDER.direct_drive;

    const publishedDistance =
      filament?.manufacturerSettings.retractionDistance ?? null;
    const publishedSpeed =
      filament?.manufacturerSettings.retractionSpeed ?? null;

    const typeDistance =
      family === FAMILY_TPU ? byType.distance / 2 : byType.distance;

    return {
      retraction: {
        distance: publishedDistance ?? typeDistance,
        speed: publishedSpeed ?? byType.speed,
      },
      extruderUnknown:
        printer.extruder.type === "unknown" &&
        (publishedDistance === null || publishedSpeed === null),
    };
  }

  /**
   * True when the geometry requires supports: largest overhang above 60
   * degrees, or longest bridge above 50 mm (Supports And Adhesion).
   */
  public requiresSupports(analysis: Analysis): boolean {
    return (
      analysis.overhangs.maxAngle > SUPPORT_THRESHOLDS.OVERHANG_ANGLE ||
      analysis.bridges.longestBridge > SUPPORT_THRESHOLDS.BRIDGE_LENGTH
    );
  }

  /**
   * Supports (Supports And Adhesion): enabled when the geometry requires
   * them, with the support type of the preset; never with the Vase
   * preset.
   */
  public supports(
    analysis: Analysis,
    preset: PrintPreset,
  ): SupportChoice {
    const required = this.requiresSupports(analysis);
    const vase = preset.category === "vase";

    return {
      supports: {
        enabled: required && !vase,
        type: preset.settings.supportType,
      },
      vaseSupportsIgnored: required && vase,
    };
  }

  /**
   * Adhesion (Supports And Adhesion): brim when the stability risk is at
   * least 41, the family is ABS or ASA, or the object is tall; otherwise
   * the adhesion of the preset.
   */
  public adhesion(
    analysis: Analysis,
    classification: Classification,
    family: string,
    preset: PrintPreset,
  ): AdhesionType {
    if (
      analysis.stability.riskScore >= SUPPORT_THRESHOLDS.BRIM_RISK_SCORE ||
      isWarpFamily(family) ||
      classification.detectedFeatures.includes("tall")
    ) {
      return "brim";
    }

    return preset.settings.adhesionType;
  }

  /**
   * Confidence (RECOMMENDATION_RULES.md, Confidence): 100 minus the
   * reductions, limited to 0 and 100, a whole number. A category chosen
   * by the user gives no reduction.
   */
  public confidence(input: ConfidenceInput): number {
    let score = 100;

    if (input.filament === null) {
      score -= CONFIDENCE_REDUCTIONS.NO_FILAMENT;
    }

    if (!input.meshClosed || input.analysis.thinWalls.minimumThickness === 0) {
      score -= CONFIDENCE_REDUCTIONS.INCOMPLETE_ANALYSIS;
    }

    if (input.printerIsUser) {
      score -= CONFIDENCE_REDUCTIONS.USER_PRINTER;
    }

    if (input.filament !== null && input.filamentIsUser) {
      score -= CONFIDENCE_REDUCTIONS.USER_FILAMENT;
    }

    if (input.classification.source === "automatic") {
      const level = ConfidenceScorer.getLevel(
        input.classification.confidenceScore,
      );

      if (input.classification.category === "unknown" || level === "unknown") {
        score -= CONFIDENCE_REDUCTIONS.CLASSIFICATION_UNKNOWN;
      } else if (level === "low") {
        score -= CONFIDENCE_REDUCTIONS.CLASSIFICATION_LOW;
      }
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Selects the preset of a classification
   * (PRINT_PRESETS_SPEC.md, Classification To Preset Mapping, Default Preset).
   * Returns null when no Balanced preset is available.
   * The first preset of the list is never used as a fallback.
   */
  public selectPreset(
    classification: Classification,
    presets: PrintPreset[],
  ): PresetSelection | null {
    const balanced = this.findByCategory(
      presets,
      DEFAULT_PRESET_CATEGORY,
    );

    const uncertain =
      classification.category === "unknown" ||
      ConfidenceScorer.getLevel(
        classification.confidenceScore,
      ) === "unknown";

    if (uncertain) {
      return balanced
        ? {
            preset: balanced,
            warnings: [CLASSIFICATION_UNCERTAIN_WARNING],
          }
        : null;
    }

    const expected = this.findByCategory(
      presets,
      CLASSIFICATION_PRESET_CATEGORIES[classification.category],
    );

    if (expected) {
      return {
        preset: expected,
        warnings: [],
      };
    }

    return balanced
      ? {
          preset: balanced,
          warnings: [EXPECTED_PRESET_UNAVAILABLE_WARNING],
        }
      : null;
  }

  private findByCategory(
    presets: PrintPreset[],
    category: PrintPreset["category"],
  ): PrintPreset | undefined {
    return presets.find(
      (preset) => preset.category === category,
    );
  }
}
