/**
 * Wichy
 * Cost Calculator
 *
 * Responsible for:
 * - Total cost calculation
 * - Cost aggregation
 * - Cost estimation generation
 *
 * No rendering logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - CostEstimation.ts
 */

import type { CostEstimation } from "../types/CostEstimation";

export class CostCalculator {
  /**
   * Calculates total print cost.
   */
  public calculate(
    materialCost: number,
    electricityCost: number,
    filamentLength: number,
    filamentWeight: number,
    printTime: number,
    layerCount: number,
  ): CostEstimation {
    return {
      filamentLength,

      filamentWeight,

      materialCost,

      electricityCost,

      totalCost:
        materialCost +
        electricityCost,

      printTime,

      layerCount,
    };
  }

  /**
   * Calculates total cost only.
   */
  public calculateTotalCost(
    materialCost: number,
    electricityCost: number,
  ): number {
    return (
      materialCost +
      electricityCost
    );
  }

  /**
   * Calculates material percentage.
   */
  public getMaterialCostRatio(
    materialCost: number,
    totalCost: number,
  ): number {
    if (totalCost <= 0) {
      return 0;
    }

    return (
      (materialCost / totalCost) *
      100
    );
  }

  /**
   * Calculates electricity percentage.
   */
  public getElectricityCostRatio(
    electricityCost: number,
    totalCost: number,
  ): number {
    if (totalCost <= 0) {
      return 0;
    }

    return (
      (electricityCost / totalCost) *
      100
    );
  }
}
