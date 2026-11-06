/**
 * SlicyWeb
 * Warning Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

export type WarningSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

/**
 * Warning Schema (DATA_SCHEMA.md 3.10.0). A recommendation warning
 * (ADR-035 D9): code of RECOMMENDATION_RULES.md 1.1.0 (Recommendation
 * Warnings); message an English reference text, never shown (the
 * interface shows the translation of the code); source "recommendation";
 * recommendedAction "".
 */
export interface Warning {
  code: string;

  severity: WarningSeverity;

  message: string;

  source: string;

  recommendedAction: string;
}
