/**
 * SlicyWeb
 * Material Estimator
 *
 * Volume of plastic of one object, without slicing it (ADR-037, Q2 A;
 * DATA_SCHEMA.md 3.15.0, Cost Estimation Rules):
 * - width of a line w = diameter of the nozzle × 1.1;
 * - walls = area of the side faces × wall count × w;
 * - top and bottom = area of the faces turned up × top layers × layer
 *   height; the same turned down with the bottom layers;
 * - shell = walls + top + bottom, at most the volume of the object (a
 *   small object is full): the three parts are then reduced together;
 * - infill = (volume − shell) × infill density;
 * - length = volume of plastic ÷ section of the filament; weight = volume
 *   of plastic (cm³) × density (g/cm³);
 * - cost of the filament = weight (kg) × price per kg, rounded to the
 *   decimals of the currency.
 * Supports, brim, skirt and raft are not counted (Q5 A).
 *
 * Pure functions, no state, deterministic. No Electron (KI-024).
 *
 * Domain: Cost Estimation.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules)
 * - DECISIONS.md (ADR-037)
 */

import { ESTIMATION } from "../constants/CostConstants";
import type { FaceAreas } from "../types/CostEstimation";

/** What the volume of plastic depends on */
export interface MaterialInput {
  /** Volume enclosed by the mesh (analysis), mm³ */
  volume: number;

  faceAreas: FaceAreas;

  /** Diameter of the nozzle of the printer, mm */
  nozzle: number;

  layerHeight: number;

  wallCount: number;

  topLayers: number;

  bottomLayers: number;

  /** Percent, 0 to 100 */
  infillDensity: number;
}

/** Volumes of plastic of each part, mm³ */
export interface PlasticVolumes {
  /** Width of a line, mm */
  lineWidth: number;

  outerWall: number;

  innerWall: number;

  top: number;

  bottom: number;

  infill: number;

  /** Sum of the parts */
  total: number;
}

/** Filament of the estimation: length (mm) and weight (g), or null */
export interface FilamentAmount {
  filamentLength: number | null;

  filamentWeight: number | null;
}

export class MaterialEstimator {
  /** Volumes of plastic of one object (Q2 A) */
  public estimateVolumes(input: MaterialInput): PlasticVolumes {
    const lineWidth = input.nozzle * ESTIMATION.LINE_WIDTH_FACTOR;
    const volume = Math.max(0, input.volume);
    const wallCount = Math.max(0, input.wallCount);

    let walls = input.faceAreas.side * wallCount * lineWidth;
    let top = input.faceAreas.up * input.topLayers * input.layerHeight;
    let bottom = input.faceAreas.down * input.bottomLayers * input.layerHeight;

    const shell = walls + top + bottom;

    // A small object is full: the shell is at most its volume
    if (shell > volume) {
      const share = shell > 0 ? volume / shell : 0;

      walls *= share;
      top *= share;
      bottom *= share;
    }

    const solid = walls + top + bottom;
    const infill =
      Math.max(0, volume - solid) *
      (Math.min(100, Math.max(0, input.infillDensity)) / 100);
    const outerWall = wallCount > 0 ? walls / wallCount : 0;

    return {
      lineWidth,
      outerWall,
      innerWall: walls - outerWall,
      top,
      bottom,
      infill,
      total: solid + infill,
    };
  }

  /**
   * Length and weight of the filament for a volume of plastic (mm³).
   * Without a filament: both null (Q6 A); without a density: the weight
   * is null.
   */
  public filamentAmount(
    plasticVolume: number,
    filament: { diameter: number; density: number | null } | null,
  ): FilamentAmount {
    if (filament === null || !(filament.diameter > 0)) {
      return { filamentLength: null, filamentWeight: null };
    }

    const radius = filament.diameter / 2;

    return {
      filamentLength: plasticVolume / (Math.PI * radius * radius),
      filamentWeight:
        filament.density === null
          ? null
          : (plasticVolume / 1000) * filament.density,
    };
  }

  /**
   * Cost of the filament: weight (g) ÷ 1000 × price per kg, rounded to
   * the decimals of the currency; null without weight or price.
   */
  public materialCost(
    filamentWeight: number | null,
    pricePerKg: number | null,
    digits: number,
  ): number | null {
    if (filamentWeight === null || pricePerKg === null) {
      return null;
    }

    return roundAmount((filamentWeight / 1000) * pricePerKg, digits);
  }
}

/** An amount rounded to the decimals of its currency */
export function roundAmount(value: number, digits: number): number {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;

  return rounded === 0 ? 0 : rounded;
}
