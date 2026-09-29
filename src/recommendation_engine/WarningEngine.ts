/**
 * Wichy
 * Warning Engine
 *
 * Responsible for:
 * - Warning generation
 * - Risk detection
 * - Print issue reporting
 * - Severity evaluation
 *
 * No rendering logic.
 * No repository logic.
 * No UI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 * - Recommendation.ts
 */

import type { Analysis } from "../types/Analysis";
import type { Warning } from "../types/Warning";

export class WarningEngine {
  /**
   * Generates warnings from analysis data.
   */
  public generate(
    analysis: Analysis,
  ): Warning[] {
    const warnings: Warning[] = [];

    if (
      analysis.overhangs.detected &&
      analysis.overhangs.maxAngle > 60
    ) {
      warnings.push({
        code: "OVERHANG_HIGH",

        severity: "high",

        message:
          "High overhang angle detected. Supports may be required.",
      });
    }

    if (
      analysis.stability.riskScore >
      75
    ) {
      warnings.push({
        code: "LOW_STABILITY",

        severity: "high",

        message:
          "Object stability risk is high.",
      });
    }

    if (
      analysis.thinWalls.detected
    ) {
      warnings.push({
        code: "THIN_WALLS",

        severity: "medium",

        message:
          "Thin walls detected. Print quality may be affected.",
      });
    }

    if (
      analysis.bridges.detected &&
      analysis.bridges.longestBridge >
      20
    ) {
      warnings.push({
        code: "LONG_BRIDGE",

        severity: "medium",

        message:
          "Long bridge detected. Additional support may be required.",
      });
    }

    return warnings;
  }

  /**
   * Returns whether warnings exist.
   */
  public hasWarnings(
    warnings: Warning[],
  ): boolean {
    return warnings.length > 0;
  }

  /**
   * Returns warning count.
   */
  public getWarningCount(
    warnings: Warning[],
  ): number {
    return warnings.length;
  }
}
