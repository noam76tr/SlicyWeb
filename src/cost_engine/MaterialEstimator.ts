/**
 * SlicyWeb
 * Material Estimator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 *
 * pricePerKg of a filament is null when not given (shipped filaments,
 * DATA_SCHEMA.md 3.7.0): the cost is then null, never 0.
 */

import type { Filament } from "../types/Filament";

export interface MaterialEstimationResult {
  filamentLength: number;

  filamentWeight: number;

  materialCost: number | null;
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
  ): number | null {
    if (filament.pricePerKg === null) {
      return null;
    }

    const weightInKg =
      filamentWeight / 1000;

    return (
      weightInKg *
      filament.pricePerKg
    );
  }
}
