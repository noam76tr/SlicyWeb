/**
 * SlicyWeb
 * Cost Engine Tests
 *
 * Estimation of Phase 12 (ADR-037; DATA_SCHEMA.md 3.15.0, Cost Estimation
 * Rules and Print Estimation Rules; TEST_PLAN.md, Cost Engine Unit Tests):
 * volumes of plastic of a cube of 20 mm computed by hand, a small object
 * full, length and weight of the filament, time with the speed factor and
 * the minimum layer time, costs rounded to the decimals of the currency,
 * total with a missing cost, sum of several objects, areas of the faces
 * found by the analysis (Q2 A), the same result for the same object.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0)
 * - DECISIONS.md (ADR-037)
 * - TEST_PLAN.md (Cost Engine Unit Tests)
 */

import { describe, expect, it } from "vitest";

import { ESTIMATION } from "../../../src/constants/CostConstants";
import { CostCalculator } from "../../../src/cost_engine/CostCalculator";
import { EnergyEstimator } from "../../../src/cost_engine/EnergyEstimator";
import {
  MaterialEstimator,
  roundAmount,
} from "../../../src/cost_engine/MaterialEstimator";
import { TimeEstimator } from "../../../src/cost_engine/TimeEstimator";
import { analyzeFaceAreas } from "../../../src/model_analysis/GeometryAnalyzer";
import type { RecommendedProfile } from "../../../src/types/Recommendation";

/** Cube of 20 mm: 8000 mm³, 400 mm² up, 400 down, 1600 on the side */
const CUBE = {
  volume: 8000,
  faceAreas: { up: 400, down: 400, side: 1600 },
};

/** Settings of the Balanced preset, nozzle of 0.4 mm */
const BALANCED = {
  nozzle: 0.4,
  layerHeight: 0.2,
  wallCount: 3,
  topLayers: 5,
  bottomLayers: 4,
  infillDensity: 15,
};

const PLA = { diameter: 1.75, density: 1.24 };

function profile(change: Partial<RecommendedProfile> = {}): RecommendedProfile {
  return {
    preset: {
      name: "Balanced",
      category: "balanced",
      description: "",
      settings: {
        layerHeight: 0.2,
        wallCount: 3,
        topLayers: 5,
        bottomLayers: 4,
        infillDensity: 15,
        infillPattern: "gyroid",
        supportEnabled: false,
        supportType: "tree",
        adhesionType: "skirt",
        printSpeed: 150,
      },
      confidenceScore: 100,
    },
    quality: { layerHeight: 0.2, wallCount: 3, topLayers: 5, bottomLayers: 4 },
    speed: {
      print: 150,
      outerWall: 100,
      innerWall: 150,
      infill: 200,
      travel: 150,
    },
    cooling: { fanSpeed: 100, minimumLayerTime: 5 },
    retraction: { distance: 0.8, speed: 35 },
    supports: { enabled: false, type: "tree" },
    adhesion: "skirt",
    temperature: { nozzle: 215, bed: 60 },
    infillDensity: 15,
    infillPattern: "gyroid",
    confidenceScore: 100,
    ...change,
  };
}

function input(
  change: Partial<Parameters<CostCalculator["estimateObject"]>[0]> = {},
) {
  return {
    objectId: "cube",
    recommendationId: "recommendation-cube",
    profile: profile(),
    volume: 8000,
    height: 20,
    faceAreas: CUBE.faceAreas,
    nozzle: 0.4,
    filament: PLA,
    pricePerKg: 25,
    powerW: 100,
    pricePerKwh: 0.25,
    digits: 2,
    ...change,
  };
}

describe("Material estimator", () => {
  const estimator = new MaterialEstimator();

  it("gives the volumes of a cube of 20 mm computed by hand", () => {
    const volumes = estimator.estimateVolumes({ ...CUBE, ...BALANCED });

    // w = 0.4 × 1.1 = 0.44 mm
    expect(volumes.lineWidth).toBeCloseTo(0.44, 10);
    // Walls: 1600 × 3 × 0.44 = 2112, one third for the outer wall
    expect(volumes.outerWall).toBeCloseTo(704, 6);
    expect(volumes.innerWall).toBeCloseTo(1408, 6);
    // Top: 400 × 5 × 0.2 = 400; bottom: 400 × 4 × 0.2 = 320
    expect(volumes.top).toBeCloseTo(400, 6);
    expect(volumes.bottom).toBeCloseTo(320, 6);
    // Infill: (8000 − 2832) × 15 % = 775.2
    expect(volumes.infill).toBeCloseTo(775.2, 6);
    expect(volumes.total).toBeCloseTo(3607.2, 6);
  });

  it("makes a small object full: the shell is at most its volume", () => {
    // Cube of 2 mm: 8 mm³, the shell would be 15.6 mm³
    const volumes = estimator.estimateVolumes({
      volume: 8,
      faceAreas: { up: 4, down: 4, side: 16 },
      ...BALANCED,
    });

    expect(volumes.total).toBeCloseTo(8, 10);
    expect(volumes.infill).toBeCloseTo(0, 10);
    // The parts keep their shares: walls 21.12 of 28.32
    expect(volumes.outerWall + volumes.innerWall).toBeCloseTo(
      (8 * 21.12) / 28.32,
      10,
    );
  });

  it("gives the length and the weight of the filament", () => {
    const amount = estimator.filamentAmount(3607.2, PLA);

    // Section of 1.75 mm: 2.405 mm²
    expect(amount.filamentLength).toBeCloseTo(
      3607.2 / (Math.PI * 0.875 ** 2),
      6,
    );
    expect(amount.filamentLength).toBeCloseTo(1499.7, 1);
    // 3.6072 cm³ × 1.24 g/cm³
    expect(amount.filamentWeight).toBeCloseTo(4.4729, 4);
  });

  it("gives no length and no weight without a filament, no weight without a density", () => {
    expect(estimator.filamentAmount(1000, null)).toEqual({
      filamentLength: null,
      filamentWeight: null,
    });
    expect(
      estimator.filamentAmount(1000, { diameter: 1.75, density: null })
        .filamentWeight,
    ).toBeNull();
  });

  it("gives the cost of the filament rounded to the currency, null without a price", () => {
    // 4.4729 g × 25 / kg = 0.1118
    expect(estimator.materialCost(4.4729, 25, 2)).toBe(0.11);
    expect(estimator.materialCost(447.29, 2500, 0)).toBe(1118);
    expect(estimator.materialCost(4.4729, null, 2)).toBeNull();
    expect(estimator.materialCost(null, 25, 2)).toBeNull();
    expect(roundAmount(-0.001, 2)).toBe(0);
  });
});

describe("Time estimator", () => {
  const volumes = new MaterialEstimator().estimateVolumes({
    ...CUBE,
    ...BALANCED,
  });
  const time = new TimeEstimator();
  const speeds = {
    height: 20,
    layerHeight: 0.2,
    outerWallSpeed: 100,
    innerWallSpeed: 150,
    infillSpeed: 200,
    minimumLayerTime: 0,
  };

  it("counts the layers: 20 mm in layers of 0.2 mm give 100, not 101", () => {
    expect(time.estimate(volumes, speeds).layerCount).toBe(100);
    expect(
      time.estimate(volumes, { ...speeds, height: 20.05 }).layerCount,
    ).toBe(101);
  });

  it("gives the time of the lines at their speeds, times the speed factor", () => {
    // Lines: 8000 mm at 100, 16000 mm at 150, 16990.9 mm at 200
    const lines = 8000 / 100 + 16000 / 150 + 1495.2 / 0.088 / 200;

    expect(time.estimate(volumes, speeds).printTime).toBe(
      Math.round(lines * ESTIMATION.SPEED_FACTOR),
    );
    expect(ESTIMATION.SPEED_FACTOR).toBe(1.5);
  });

  it("gives each layer at least the minimum layer time", () => {
    // 100 layers × 5 s = 500 s, more than the 407 s of the lines
    expect(
      time.estimate(volumes, { ...speeds, minimumLayerTime: 5 }).printTime,
    ).toBe(500);
  });
});

describe("Energy estimator", () => {
  it("gives the cost of the electricity, null without a power or a price", () => {
    const energy = new EnergyEstimator();

    // 120 W during 10 h: 1.2 kWh × 0.25
    expect(energy.energy(120, 36_000)).toBeCloseTo(1.2, 10);
    expect(energy.electricityCost(120, 36_000, 0.25, 2)).toBe(0.3);
    expect(energy.electricityCost(null, 36_000, 0.25, 2)).toBeNull();
    expect(energy.electricityCost(120, 36_000, null, 2)).toBeNull();
  });
});

describe("Cost calculator", () => {
  const calculator = new CostCalculator();

  it("estimates one object: time, filament, costs and total", () => {
    const result = calculator.estimateObject(input());

    expect(result.estimation).toEqual({ printTime: 500, layerCount: 100 });
    expect(result.cost.filamentLength).toBeCloseTo(1499.7, 1);
    expect(result.cost.filamentWeight).toBeCloseTo(4.4729, 4);
    expect(result.cost.materialCost).toBe(0.11);
    // 100 W × 500 s = 0.0139 kWh × 0.25 = 0.003: 0.00
    expect(result.cost.electricityCost).toBe(0);
    expect(result.cost.totalCost).toBe(0.11);
    expect(result.notCounted).toEqual({ supports: false, adhesion: null });
  });

  it("counts the known cost alone in the total, null when both are missing", () => {
    const noPrice = calculator.estimateObject(
      input({ pricePerKg: null, powerW: 1000 }),
    );
    // 1000 W × 500 s = 0.139 kWh × 0.25 = 0.03
    expect(noPrice.cost.materialCost).toBeNull();
    expect(noPrice.cost.electricityCost).toBe(0.03);
    expect(noPrice.cost.totalCost).toBe(0.03);

    const nothing = calculator.estimateObject(
      input({ pricePerKg: null, powerW: null }),
    );
    expect(nothing.cost.totalCost).toBeNull();
  });

  it("gives the time without a filament, and no filament values (Q6 A)", () => {
    const result = calculator.estimateObject(input({ filament: null }));

    expect(result.estimation.printTime).toBe(500);
    expect(result.cost.filamentLength).toBeNull();
    expect(result.cost.filamentWeight).toBeNull();
    expect(result.cost.materialCost).toBeNull();
  });

  it("names the supports and a brim or a raft, never a skirt (Q5 A)", () => {
    expect(
      calculator.estimateObject(
        input({
          profile: profile({
            supports: { enabled: true, type: "tree" },
            adhesion: "brim",
          }),
        }),
      ).notCounted,
    ).toEqual({ supports: true, adhesion: "brim" });
    expect(
      calculator.estimateObject(
        input({ profile: profile({ adhesion: "raft" }) }),
      ).notCounted.adhesion,
    ).toBe("raft");
  });

  it("adds several objects: times and values added, highest layer count", () => {
    const one = calculator.estimateObject(input());
    const two = calculator.estimateObject(
      input({ objectId: "tall", height: 40, volume: 16000 }),
    );
    const total = calculator.sum([one, two], 1, 2);

    expect(total.printTime).toBe(
      one.estimation.printTime + two.estimation.printTime,
    );
    expect(total.layerCount).toBe(200);
    expect(total.cost.filamentWeight).toBeCloseTo(
      (one.cost.filamentWeight ?? 0) + (two.cost.filamentWeight ?? 0),
      10,
    );
    expect(total.cost.totalCost).toBe(
      roundAmount((one.cost.totalCost ?? 0) + (two.cost.totalCost ?? 0), 2),
    );
    expect(total.count).toBe(2);
    expect(total.missing).toBe(1);

    // A value missing for one object is missing for the sum
    const withoutFilament = calculator.estimateObject(
      input({ filament: null }),
    );
    expect(
      calculator.sum([one, withoutFilament], 0, 2).cost.filamentWeight,
    ).toBeNull();

    // Nothing to add
    expect(calculator.sum([], 2, 2).cost.totalCost).toBeNull();
  });

  it("gives the same result for the same object", () => {
    expect(calculator.estimateObject(input())).toEqual(
      calculator.estimateObject(input()),
    );
  });
});

/** Triangles of a box from (0, 0, 0) to (x, y, z), normals outward */
function boxCorners(
  x: number,
  y: number,
  z: number,
): { placed: Float64Array; corners: Uint32Array } {
  const placed = new Float64Array([
    0,
    0,
    0,
    x,
    0,
    0,
    x,
    y,
    0,
    0,
    y,
    0,
    0,
    0,
    z,
    x,
    0,
    z,
    x,
    y,
    z,
    0,
    y,
    z,
  ]);
  const corners = new Uint32Array([
    // Bottom (−Z) and top (+Z)
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
    // Front (−Y), back (+Y), left (−X), right (+X)
    0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5,
  ]);

  return { placed, corners };
}

describe("Areas of the faces (analysis)", () => {
  it("finds the faces turned up, turned down and of the side", () => {
    const { placed, corners } = boxCorners(20, 30, 10);
    const areas = analyzeFaceAreas(placed, corners);

    expect(areas.up).toBeCloseTo(600, 10);
    expect(areas.down).toBeCloseTo(600, 10);
    // 2 × (20 × 10) + 2 × (30 × 10)
    expect(areas.side).toBeCloseTo(1000, 10);
  });

  it("gives the same areas when the corners are in the other order", () => {
    const { placed, corners } = boxCorners(20, 30, 10);
    const reversed = new Uint32Array(corners.length);

    for (let t = 0; t < corners.length; t += 3) {
      reversed[t] = corners[t];
      reversed[t + 1] = corners[t + 2];
      reversed[t + 2] = corners[t + 1];
    }

    expect(analyzeFaceAreas(placed, reversed)).toEqual(
      analyzeFaceAreas(placed, corners),
    );
  });

  it("puts a face at 30 degrees from the horizontal with the top", () => {
    // Ramp: one triangle turned up at 30 degrees
    const rise = Math.tan((30 * Math.PI) / 180) * 10;
    const placed = new Float64Array([0, 0, 0, 10, 0, rise, 0, 10, 0]);
    const areas = analyzeFaceAreas(placed, new Uint32Array([0, 1, 2]));

    expect(areas.up).toBeGreaterThan(0);
    expect(areas.side).toBe(0);
  });
});
