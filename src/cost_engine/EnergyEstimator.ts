/**
 * Wichy
 * Energy Estimator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

export interface EnergyEstimationResult {
  powerConsumption: number;

  printTimeHours: number;

  energyConsumption: number;

  electricityCost: number;
}

export class EnergyEstimator {
  public estimate(
    powerConsumption: number,
    printTimeHours: number,
    pricePerKwh: number
  ): EnergyEstimationResult {
    const energyConsumption =
      this.calculateEnergyConsumption(
        powerConsumption,
        printTimeHours
      );

    const electricityCost =
      this.calculateElectricityCost(
        energyConsumption,
        pricePerKwh
      );

    return {
      powerConsumption,

      printTimeHours,

      energyConsumption,

      electricityCost
    };
  }

  private calculateEnergyConsumption(
    powerConsumption: number,
    printTimeHours: number
  ): number {
    return (
      (powerConsumption / 1000) *
      printTimeHours
    );
  }

  private calculateElectricityCost(
    energyConsumption: number,
    pricePerKwh: number
  ): number {
    return (
      energyConsumption *
      pricePerKwh
    );
  }
}
