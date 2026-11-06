/**
 * SlicyWeb
 * Warning Engine
 *
 * Responsible for:
 * - Warnings of the geometry, the printer and the material
 *   (RECOMMENDATION_RULES.md 1.1.2, Recommendation Warnings)
 * - One warning per code, with the highest severity reached, in the
 *   order of display: critical first, then high, medium, low, info; the
 *   same severity in the order of the table
 *
 * A warning has source "recommendation", recommendedAction "" and an
 * English reference message, never shown (DATA_SCHEMA.md 3.10.0, Warning
 * Schema). A critical warning does not block the recommendation.
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md 1.1.2
 * - DATA_SCHEMA.md (Warning Schema 3.10.0)
 * - DECISIONS.md (ADR-035 D9)
 */

import {
  RECOMMENDATION_WARNING_CODES,
  RECOMMENDATION_WARNING_MESSAGES,
  RECOMMENDATION_WARNING_SOURCE,
  SEVERITY_ORDER,
  SUPPORT_THRESHOLDS,
  WARNING_THRESHOLDS,
  type RecommendationWarningCode
} from "../constants/RecommendationConstants";
import { isFamilyNotListed } from "../material_database/MaterialFamilies";
import type { Analysis } from "../types/Analysis";
import type { Printer } from "../types/Printer";
import type { Warning, WarningSeverity } from "../types/Warning";

/** A warning with a code of Recommendation Warnings */
export interface RecommendationWarning extends Warning {
  code: RecommendationWarningCode;
}

/** The warning of a code, with its reference message */
export function recommendationWarning(
  code: RecommendationWarningCode,
  severity: WarningSeverity,
): RecommendationWarning {
  return {
    code,
    severity,
    message: RECOMMENDATION_WARNING_MESSAGES[code],
    source: RECOMMENDATION_WARNING_SOURCE,
    recommendedAction: "",
  };
}

export class WarningEngine {
  /**
   * Warnings of the geometry of the object and of the printer
   * (OVERHANG_HIGH, LONG_BRIDGE, THIN_WALLS, LOW_STABILITY,
   * OBJECT_TOO_LARGE, MATERIAL_NOT_LISTED, ENCLOSURE_RECOMMENDED).
   */
  public generate(
    analysis: Analysis,
    printer: Printer,
    family: string,
    warpFamily: boolean,
  ): RecommendationWarning[] {
    const warnings: RecommendationWarning[] = [];

    const angle = analysis.overhangs.maxAngle;

    if (angle > SUPPORT_THRESHOLDS.OVERHANG_ANGLE) {
      warnings.push(
        recommendationWarning(
          "OVERHANG_HIGH",
          angle > WARNING_THRESHOLDS.OVERHANG_HIGH_SEVERE ? "high" : "medium",
        ),
      );
    }

    const bridge = analysis.bridges.longestBridge;

    if (bridge > WARNING_THRESHOLDS.LONG_BRIDGE) {
      warnings.push(
        recommendationWarning(
          "LONG_BRIDGE",
          bridge > SUPPORT_THRESHOLDS.BRIDGE_LENGTH ? "high" : "medium",
        ),
      );
    }

    const thickness = analysis.thinWalls.minimumThickness;

    if (thickness > 0 && thickness < printer.defaultNozzle) {
      warnings.push(recommendationWarning("THIN_WALLS", "high"));
    }

    const risk = analysis.stability.riskScore;

    if (risk >= WARNING_THRESHOLDS.STABILITY_LOW) {
      warnings.push(
        recommendationWarning(
          "LOW_STABILITY",
          risk >= WARNING_THRESHOLDS.STABILITY_HIGH
            ? "high"
            : risk >= WARNING_THRESHOLDS.STABILITY_MEDIUM
              ? "medium"
              : "low",
        ),
      );
    }

    const { width, depth, height } = analysis.dimensions;
    const volume = printer.buildVolume;

    if (width > volume.x || depth > volume.y || height > volume.z) {
      warnings.push(recommendationWarning("OBJECT_TOO_LARGE", "critical"));
    }

    if (isFamilyNotListed(printer.supportedMaterials, family)) {
      warnings.push(recommendationWarning("MATERIAL_NOT_LISTED", "low"));
    }

    if (warpFamily) {
      warnings.push(recommendationWarning("ENCLOSURE_RECOMMENDED", "low"));
    }

    return warnings;
  }

  /**
   * One warning per code, with the highest severity reached, sorted
   * for display (most severe first; the same severity in the order of
   * the table of Recommendation Warnings).
   */
  public finalize(
    warnings: RecommendationWarning[],
  ): RecommendationWarning[] {
    const rank = (severity: WarningSeverity): number =>
      SEVERITY_ORDER.indexOf(severity);

    const byCode = new Map<RecommendationWarningCode, RecommendationWarning>();

    for (const warning of warnings) {
      const kept = byCode.get(warning.code);

      if (!kept || rank(warning.severity) < rank(kept.severity)) {
        byCode.set(warning.code, warning);
      }
    }

    return [...byCode.values()].sort(
      (a, b) =>
        rank(a.severity) - rank(b.severity) ||
        RECOMMENDATION_WARNING_CODES.indexOf(a.code) -
          RECOMMENDATION_WARNING_CODES.indexOf(b.code),
    );
  }
}
