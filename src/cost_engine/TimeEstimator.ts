/**
 * SlicyWeb
 * Time Estimator
 *
 * Print time of one object, without slicing it (ADR-037, Q3 A;
 * DATA_SCHEMA.md 3.15.0, Print Estimation Rules):
 * - layer count = height ÷ layer height, rounded up;
 * - length of the lines of each part = its volume ÷ (w × layer height);
 * - outer wall at the speed of the outer wall, inner walls at the speed of
 *   the inner wall, top, bottom and infill at the speed of the infill
 *   (speeds of the recommendation, already limited by the printer);
 * - time of the lines × speed factor 1.5 (real speed: accelerations,
 *   turns, travel);
 * - at least the minimum layer time of the recommendation for each layer;
 * - rounded to the second.
 *
 * Pure functions, no state, deterministic. No Electron (KI-024).
 *
 * Domain: Cost Estimation.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Print Estimation Rules)
 * - DECISIONS.md (ADR-037)
 */

import { ESTIMATION } from "../constants/CostConstants";
import type { PrintEstimation } from "../types/CostEstimation";

import type { PlasticVolumes } from "./MaterialEstimator";

/** What the time depends on, besides the volumes of plastic */
export interface TimeInput {
  /** Height of the placed object, mm */
  height: number;

  layerHeight: number;

  /** Speeds of the recommendation, mm/s */
  outerWallSpeed: number;

  innerWallSpeed: number;

  infillSpeed: number;

  /** Minimum layer time of the recommendation, s */
  minimumLayerTime: number;
}

export class TimeEstimator {
  public estimate(volumes: PlasticVolumes, input: TimeInput): PrintEstimation {
    const layerCount = Math.max(
      1,
      Math.ceil(roundUp(input.height / input.layerHeight)),
    );
    const section = volumes.lineWidth * input.layerHeight;
    const length = (volume: number): number =>
      section > 0 ? volume / section : 0;
    const time = (volume: number, speed: number): number =>
      speed > 0 ? length(volume) / speed : 0;

    const lines =
      time(volumes.outerWall, input.outerWallSpeed) +
      time(volumes.innerWall, input.innerWallSpeed) +
      time(volumes.top + volumes.bottom + volumes.infill, input.infillSpeed);

    const printTime = Math.max(
      lines * ESTIMATION.SPEED_FACTOR,
      layerCount * Math.max(0, input.minimumLayerTime),
    );

    return { printTime: Math.round(printTime), layerCount };
  }
}

/**
 * 10 ÷ 0.2 gives 50.000000000000004 in floating point: the count would
 * get one layer too many. The quotient is rounded to 6 decimals first.
 */
function roundUp(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
