/**
 * SlicyWeb
 * Energy Estimator
 *
 * Cost of the electricity of one print (ADR-037, Q8 A, Q9 A;
 * DATA_SCHEMA.md 3.15.0, Cost Estimation Rules): average power of the
 * printer (W, given by the user for each printer) ÷ 1000 × print time
 * (h) × price of a kWh, rounded to the decimals of the currency; null
 * when the power or the price is not given.
 *
 * Pure functions, no state. No Electron (KI-024).
 *
 * Domain: Cost Estimation.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules)
 * - DECISIONS.md (ADR-037)
 */

import { roundAmount } from "./MaterialEstimator";

export class EnergyEstimator {
  /** Energy of the print in kWh */
  public energy(powerW: number, printTimeSeconds: number): number {
    return (powerW / 1000) * (printTimeSeconds / 3600);
  }

  /** Cost of the electricity, or null without power or price */
  public electricityCost(
    powerW: number | null,
    printTimeSeconds: number,
    pricePerKwh: number | null,
    digits: number,
  ): number | null {
    if (powerW === null || pricePerKwh === null) {
      return null;
    }

    return roundAmount(
      this.energy(powerW, printTimeSeconds) * pricePerKwh,
      digits,
    );
  }
}
