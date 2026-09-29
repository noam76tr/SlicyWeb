/**
 * Wichy
 * Time Estimator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

export interface TimeEstimationResult {
  printTimeHours: number;

  printTimeMinutes: number;

  layerCount: number;
}

export class TimeEstimator {
  public estimate(
    printTimeHours: number,
    layerCount: number
  ): TimeEstimationResult {
    return {
      printTimeHours,

      printTimeMinutes:
        this.convertHoursToMinutes(
          printTimeHours
        ),

      layerCount
    };
  }

  private convertHoursToMinutes(
    hours: number
  ): number {
    return hours * 60;
  }
}
