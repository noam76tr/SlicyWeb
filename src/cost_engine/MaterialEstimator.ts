/**
 * Wichy
 * Material Estimator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import type { Filament } from "../types/Filament";

export interface MaterialEstimationResult {
  filamentLength: number;

  filamentWeight: number;

  materialCost: number;
}

export class MaterialEstimator {
  public estimate(
    filament: Filament,
    filamentLength: number,
    filamentWeight: number
  ): MaterialEstimationResult {
    const materialCost =
      this.calculateMaterialCost(
        filament,
        filamentWeight
      );

    return {
      filamentLength,

      filamentWeight,

      materialCost
    };
  }

  private calculateMaterialCost(
    filament: Filament,
    filamentWeight: number
  ): number {
    const weightInKg =
      filamentWeight / 1000;

    return (
      weightInKg *
      filament.pricePerKg
    );
  }
}
