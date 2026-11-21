/**
 * SlicyWeb
 * Cost Calculator
 *
 * Estimation of one object and sum of several objects (Phase 12, ADR-037;
 * DATA_SCHEMA.md 3.15.0, Cost Estimation Rules and Print Estimation
 * Rules):
 * - volumes of plastic and filament (MaterialEstimator), print time
 *   (TimeEstimator), electricity (EnergyEstimator);
 * - totalCost = cost of the filament + cost of the electricity; when one
 *   of them is missing, the other alone (the interface says which one is
 *   not counted); null when both are missing (Q10 A);
 * - supports and a brim or raft of the recommendation are named, not
 *   counted (Q5 A).
 * Sum: print times added, highest layer count, each value added; a value
 * missing for one object is missing for the sum (null).
 *
 * Pure functions, no state, deterministic. No Electron (KI-024).
 *
 * Domain: Cost Estimation. Reads the results of the Analysis and the
 * Recommendation (DOMAINS_DEPENDENCY_MATRIX.md, Cost Estimation Domain).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Schema, Print Estimation
 *   Schema and their rules)
 * - DECISIONS.md (ADR-037)
 */

import type {
  CostEstimation,
  EstimationTotal,
  FaceAreas,
  NotCounted,
  ObjectEstimation,
} from "../types/CostEstimation";
import type { RecommendedProfile } from "../types/Recommendation";

import { EnergyEstimator } from "./EnergyEstimator";
import { MaterialEstimator, roundAmount } from "./MaterialEstimator";
import { TimeEstimator } from "./TimeEstimator";

/** Everything the estimation of one object needs */
export interface ObjectEstimationInput {
  objectId: string;

  recommendationId: string;

  profile: RecommendedProfile;

  /** Volume (mm³) and height (mm) of the placed object (analysis) */
  volume: number;

  height: number;

  faceAreas: FaceAreas;

  /** Diameter of the nozzle of the printer, mm */
  nozzle: number;

  /** Filament of the recommendation, or null (Q6 A) */
  filament: { diameter: number; density: number | null } | null;

  /** Price per kg of that filament (Q10 A), or null */
  pricePerKg: number | null;

  /** Average power of the printer, W (Q9 A), or null */
  powerW: number | null;

  /** Price of a kWh (Q8 A), or null */
  pricePerKwh: number | null;

  /** Decimals of the currency */
  digits: number;
}

export class CostCalculator {
  public constructor(
    private readonly material = new MaterialEstimator(),
    private readonly time = new TimeEstimator(),
    private readonly energy = new EnergyEstimator(),
  ) {}

  /** Estimation of one object */
  public estimateObject(input: ObjectEstimationInput): ObjectEstimation {
    const { profile } = input;
    const volumes = this.material.estimateVolumes({
      volume: input.volume,
      faceAreas: input.faceAreas,
      nozzle: input.nozzle,
      layerHeight: profile.quality.layerHeight,
      wallCount: profile.quality.wallCount,
      topLayers: profile.quality.topLayers,
      bottomLayers: profile.quality.bottomLayers,
      infillDensity: profile.infillDensity,
    });

    const estimation = this.time.estimate(volumes, {
      height: input.height,
      layerHeight: profile.quality.layerHeight,
      outerWallSpeed: profile.speed.outerWall,
      innerWallSpeed: profile.speed.innerWall,
      infillSpeed: profile.speed.infill,
      minimumLayerTime: profile.cooling.minimumLayerTime,
    });

    const filament = this.material.filamentAmount(
      volumes.total,
      input.filament,
    );
    const materialCost = this.material.materialCost(
      filament.filamentWeight,
      input.pricePerKg,
      input.digits,
    );
    const electricityCost = this.energy.electricityCost(
      input.powerW,
      estimation.printTime,
      input.pricePerKwh,
      input.digits,
    );

    return {
      objectId: input.objectId,
      recommendationId: input.recommendationId,
      estimation,
      cost: {
        ...filament,
        materialCost,
        electricityCost,
        totalCost: total(materialCost, electricityCost, input.digits),
      },
      notCounted: {
        supports: profile.supports.enabled,
        adhesion:
          profile.adhesion === "brim" || profile.adhesion === "raft"
            ? profile.adhesion
            : null,
      },
    };
  }

  /**
   * Sum of several estimations; missing: objects asked for without an
   * estimation.
   */
  public sum(
    estimations: ObjectEstimation[],
    missing: number,
    digits: number,
  ): EstimationTotal {
    const add = (
      pick: (cost: CostEstimation) => number | null,
      round: boolean,
    ): number | null => {
      let value = 0;

      for (const item of estimations) {
        const part = pick(item.cost);

        if (part === null) {
          return null;
        }

        value += part;
      }

      return estimations.length === 0
        ? null
        : round
          ? roundAmount(value, digits)
          : value;
    };

    const materialCost = add((cost) => cost.materialCost, true);
    const electricityCost = add((cost) => cost.electricityCost, true);
    const notCounted: NotCounted = {
      supports: estimations.some((item) => item.notCounted.supports),
      adhesion: estimations.some((item) => item.notCounted.adhesion === "raft")
        ? "raft"
        : estimations.some((item) => item.notCounted.adhesion === "brim")
          ? "brim"
          : null,
    };

    return {
      printTime: estimations.reduce(
        (sum, item) => sum + item.estimation.printTime,
        0,
      ),
      layerCount: estimations.reduce(
        (highest, item) => Math.max(highest, item.estimation.layerCount),
        0,
      ),
      cost: {
        filamentLength: add((cost) => cost.filamentLength, false),
        filamentWeight: add((cost) => cost.filamentWeight, false),
        materialCost,
        electricityCost,
        totalCost: total(materialCost, electricityCost, digits),
      },
      count: estimations.length,
      missing,
      notCounted,
    };
  }
}

/** Total cost (Q10 A): the known costs; null when both are missing */
function total(
  materialCost: number | null,
  electricityCost: number | null,
  digits: number,
): number | null {
  if (materialCost === null && electricityCost === null) {
    return null;
  }

  return roundAmount((materialCost ?? 0) + (electricityCost ?? 0), digits);
}
