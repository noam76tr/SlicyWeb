/**
 * Wichy
 * Cost Estimation Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PRINT_SETTINGS_SPEC.md
 */

export interface CostEstimation {
  filamentLength: number;

  filamentWeight: number;

  materialCost: number;

  electricityCost: number;

  totalCost: number;
}

export interface PrintEstimation {
  printTime: number;

  layerCount: number;
}
