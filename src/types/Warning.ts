/**
 * Wichy
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

export interface Warning {
  code: string;

  severity: WarningSeverity;

  message: string;
}
