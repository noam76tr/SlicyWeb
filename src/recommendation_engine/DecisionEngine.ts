/**
 * SlicyWeb
 * Decision Engine
 *
 * Responsible for:
 * - Recommendation decision making
 * - Preset selection
 * - Recommendation evaluation
 * - Rule application
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */
import {
  CLASSIFICATION_PRESET_CATEGORIES,
  DEFAULT_PRESET_CATEGORY
} from "../constants/PresetConstants";
import type { Analysis } from "../types/Analysis";
import type { RecommendedProfile } from "../types/Recommendation";
import type { Classification } from "../types/Classification";
import type { PrintPreset } from "../types/PrintPreset";
import type { Warning } from "../types/Warning";

import { ConfidenceScorer } from "../classification_engine/ConfidenceScorer";

/**
 * Selected preset and the warnings of the selection
 * (PRINT_PRESETS_SPEC.md, Default Preset).
 */
export interface PresetSelection {
  preset: PrintPreset;

  warnings: Warning[];
}

/**
 * Preset selection warnings
 * (PRINT_PRESETS_SPEC.md, Preset Selection Warnings).
 */
export const CLASSIFICATION_UNCERTAIN_WARNING: Warning = {
  code: "CLASSIFICATION_UNCERTAIN",
  severity: "info",
  message: "Object classification uncertain. Balanced preset used.",
};

export const EXPECTED_PRESET_UNAVAILABLE_WARNING: Warning = {
  code: "EXPECTED_PRESET_UNAVAILABLE",
  severity: "info",
  message: "Expected preset not available. Balanced preset used.",
};

export class DecisionEngine {
  /**
   * Generates the recommended profile of an object.
   * The profile is initialized from preset.settings, then adjusted
   * (PRINT_PRESETS_SPEC.md, Recommended Profile Initialization, Golden Rule).
   * Values not defined by preset.settings keep the engine defaults.
   */
  public generate(
    analysis: Analysis,
    preset: PrintPreset,
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

      speed: {
        print: settings.printSpeed,
        outerWall: 40,
        innerWall: 80,
        infill: 120,
        travel: 250,
      },

      cooling: {
        fanSpeed: settings.fanSpeed,
        minimumLayerTime: 5,
      },

      retraction: {
        distance: 0.8,
        speed: 35,
      },

      supports: this.adjustSupports(
        analysis,
        preset,
      ),

      adhesion: settings.adhesionType,

      infillDensity: settings.infillDensity,

      infillPattern: settings.infillPattern,

      confidenceScore: preset.confidenceScore,
    };
  }

  /**
   * Geometry adjustment: detected overhangs require supports,
   * whatever the preset (PRINT_PRESETS_SPEC.md, Golden Rule).
   */
  private adjustSupports(
    analysis: Analysis,
    preset: PrintPreset,
  ): RecommendedProfile["supports"] {
    const settings = preset.settings;

    if (
      analysis.overhangs.detected &&
      (!settings.supportEnabled ||
        settings.supportType === "none")
    ) {
      return {
        enabled: true,
        type: "organic",
      };
    }

    return {
      enabled: settings.supportEnabled,
      type: settings.supportType,
    };
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

  /**
   * Returns whether a preset
   * should be recommended.
   */
  public shouldRecommend(
    confidenceScore: number,
  ): boolean {
    return confidenceScore >= 50;
  }

  /**
   * Returns a normalized recommendation score.
   */
  public calculateScore(
    confidenceScore: number,
  ): number {
    return Math.max(
      0,
      Math.min(
        100,
        confidenceScore,
      ),
    );
  }

  /**
   * Determines recommendation quality.
   */
  public getRecommendationLevel(
    score: number,
  ): string {
    if (score >= 90) {
      return "excellent";
    }

    if (score >= 75) {
      return "high";
    }

    if (score >= 50) {
      return "medium";
    }

    return "low";
  }
}
