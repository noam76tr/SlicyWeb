/**
 * SlicyWeb
 * Validation Engine Definition
 *
 * validate(): bounds of the values of the profile (layer height 0.08 to
 * 0.28 mm, 1 to 10 walls, infill 0 to 100 %, score 0 to 100).
 *
 * applyLimits(): applies the limits of the printer and the material to the profile
 * (RECOMMENDATION_RULES.md 1.1.2, Limits; KI-008):
 * - print speed at most maxPrintSpeed, or 100 mm/s when it is null;
 *   family TPU at most 30 mm/s; outer wall, inner wall and infill at most
 *   the print speed after these limits;
 * - travel speed at most maxTravelSpeed, or 150 mm/s when it is null;
 * - layer height at most 75 % of the default nozzle (rounded down to
 *   0.01 mm), between 0.08 and 0.28 mm (the nozzle rule wins);
 * - temperatures at most the maximum temperatures of the printer.
 *
 * VALUE_LIMITED: when a limit lowers the print speed, the layer height
 * or a temperature by at least 10 %; the limit of 100 mm/s
 * (maxPrintSpeed null) always gives it when it lowers the print speed.
 * The travel speed never gives it (answers C and A of Noam, 2026-11-05
 * and 2026-11-06). TEMPERATURE_UNSUPPORTED: the minimum of the range
 * used is above the maximum of the printer.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 * - RECOMMENDATION_RULES.md 1.1.2
 * - DECISIONS.md (ADR-035 D6, D7)
 */

import {
  FAMILY_TPU,
  RECOMMENDATION_LIMITS
} from "../constants/RecommendationConstants";
import type { Printer } from "../types/Printer";
import type { RecommendedProfile } from "../types/Recommendation";

import type { TemperatureChoice } from "./DecisionEngine";
import {
  recommendationWarning,
  type RecommendationWarning
} from "./WarningEngine";

export interface LimitResult {
  profile: RecommendedProfile;

  warnings: RecommendationWarning[];
}

/** Temperatures chosen before the limits of the printer */
export interface TemperatureChoices {
  nozzle: TemperatureChoice;
  bed: TemperatureChoice;
}

/** True when a limit lowered the value by at least 10 % */
function loweredEnough(before: number, after: number): boolean {
  return (
    after < before &&
    before - after >= RECOMMENDATION_LIMITS.VALUE_LIMITED_RATIO * before - 1e-9
  );
}

/** Layer height rounded to 0.01 mm (no floating point noise) */
function hundredths(value: number): number {
  return Math.round(value * 100) / 100;
}

export class ValidationEngine {
  public validate(
    profile: RecommendedProfile
  ): RecommendedProfile {
    return {
      ...profile,

      quality: {
        ...profile.quality,

        layerHeight:
          this.validateLayerHeight(
            profile.quality.layerHeight
          ),

        wallCount:
          this.validateWallCount(
            profile.quality.wallCount
          )
      },

      infillDensity:
        this.validateInfillDensity(
          profile.infillDensity
        ),

      confidenceScore:
        this.validateScore(
          profile.confidenceScore
        )
    };
  }

  private validateLayerHeight(
    value: number
  ): number {
    return Math.max(
      0.08,
      Math.min(0.28, value)
    );
  }

  private validateWallCount(
    value: number
  ): number {
    return Math.max(
      1,
      Math.min(10, value)
    );
  }

  private validateInfillDensity(
    value: number
  ): number {
    return Math.max(
      0,
      Math.min(100, value)
    );
  }

  private validateScore(
    value: number
  ): number {
    return Math.max(
      0,
      Math.min(100, value)
    );
  }

  /**
   * Limits of the printer and the material (Limits), after validate().
   */
  public applyLimits(
    profile: RecommendedProfile,
    printer: Printer,
    family: string,
    temperatures: TemperatureChoices,
  ): LimitResult {
    let limited = false;
    let unsupported = false;

    // Print speed
    let print = profile.speed.print;
    const maxPrint = printer.motion.maxPrintSpeed;

    if (maxPrint === null) {
      const after = Math.min(print, RECOMMENDATION_LIMITS.PRINT_SPEED_UNPUBLISHED);
      limited ||= after < print;
      print = after;
    } else {
      const after = Math.min(print, maxPrint);
      limited ||= loweredEnough(print, after);
      print = after;
    }

    if (family === FAMILY_TPU) {
      const after = Math.min(print, RECOMMENDATION_LIMITS.TPU_PRINT_SPEED);
      limited ||= loweredEnough(print, after);
      print = after;
    }

    // Travel speed: never VALUE_LIMITED
    const travel = Math.min(
      profile.speed.travel,
      printer.motion.maxTravelSpeed ??
        RECOMMENDATION_LIMITS.TRAVEL_SPEED_UNPUBLISHED,
    );

    // Layer height
    const nozzleLimit =
      Math.floor(
        printer.defaultNozzle *
          RECOMMENDATION_LIMITS.LAYER_HEIGHT_NOZZLE_RATIO *
          100 +
          1e-9,
      ) / 100;
    const before = profile.quality.layerHeight;
    const inRange = Math.min(
      RECOMMENDATION_LIMITS.LAYER_HEIGHT_MAX,
      Math.max(RECOMMENDATION_LIMITS.LAYER_HEIGHT_MIN, before),
    );
    const layerHeight = hundredths(Math.min(inRange, nozzleLimit));
    limited ||= loweredEnough(before, layerHeight);

    // Temperatures
    const temperature = (
      choice: TemperatureChoice,
      max: number | null,
    ): number => {
      if (max === null) {
        return choice.value;
      }

      if (choice.rangeMin !== null && choice.rangeMin > max) {
        unsupported = true;
      }

      const after = Math.min(choice.value, max);
      limited ||= loweredEnough(choice.value, after);
      return after;
    };

    const nozzle = temperature(temperatures.nozzle, printer.thermal.maxNozzleTemp);
    const bed = temperature(temperatures.bed, printer.thermal.maxBedTemp);

    const warnings: RecommendationWarning[] = [];

    if (unsupported) {
      warnings.push(recommendationWarning("TEMPERATURE_UNSUPPORTED", "critical"));
    }

    if (limited) {
      warnings.push(recommendationWarning("VALUE_LIMITED", "info"));
    }

    return {
      profile: {
        ...profile,

        quality: {
          ...profile.quality,
          layerHeight,
        },

        speed: {
          print,
          outerWall: Math.min(profile.speed.outerWall, print),
          innerWall: Math.min(profile.speed.innerWall, print),
          infill: Math.min(profile.speed.infill, print),
          travel,
        },

        temperature: { nozzle, bed },
      },
      warnings,
    };
  }
}
