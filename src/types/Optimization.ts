/**
 * Wichy
 * Optimization Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - ARCHITECTURE.md
 */

export interface Optimization {
  orientationScore: number;

  supportReduction: number;

  timeReduction: number;

  materialReduction: number;
}
