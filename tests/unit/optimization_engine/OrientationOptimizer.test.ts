/**
 * SlicyWeb
 * Orientation Optimizer tests (Phase 11, lot 97)
 *
 * Search of the best orientation on models built in the tests (TEST_PLAN.md,
 * Optimization Tests): cube, tower of 20 x 20 x 100 mm (standing, lying,
 * build volume), cone tip down, plate standing, L bracket, T upside down
 * (supports), open vases standing and lying (Noam: an open vase standing
 * stays standing), figurine (Noam: show the result), sphere; candidates
 * (axes and faces of the convex hull), score, Reliability Rules, the
 * 5 points rule, the Optimization Result Schema, the orientation applied
 * then analyzed again, OPT_002 and the Web Worker messages.
 *
 * Based on:
 * - AI_ENGINE_SPEC.md (1.1.0: Rules Of Version 1.1.0)
 * - DATA_SCHEMA.md (3.13.0: Optimization Result Rules)
 * - DECISIONS.md (ADR-036)
 * - TEST_PLAN.md (Optimization Tests)
 */

import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { analyzeModel } from "../../../src/model_analysis/ModelAnalyzer";
import {
  optimizeOrientation,
  runOrientationRequest,
  type OrientationResponse,
} from "../../../src/optimization_engine/OptimizationEngine";
import {
  OptimizationCancelledError,
  OptimizationError,
} from "../../../src/optimization_engine/OptimizationError";
import { runOrientationSearch } from "../../../src/optimization_engine/OptimizationRunner";
import {
  hullFaceDirections,
  isExcluded,
  orientationCandidates,
  orientationScore,
  turnDown,
  type OrientationMeasure,
  type OrientationSearch,
} from "../../../src/optimization_engine/OrientationOptimizer";
import { OptimizationSchema } from "../../../src/schemas/RecommendationSchema";
import { rotateAroundPoint } from "../../../src/scene/ObjectTransform";
import {
  blocks,
  box,
  centered,
  cup,
  extruded,
  polygon,
  sphere,
  type Vec,
} from "../classification_engine/testModels";

const IDENTITY = {
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const turned = (x: number, y: number, z: number) => ({
  rotation: { x, y, z },
  scale: { x: 1, y: 1, z: 1 },
});

const search = (
  triangles: number[],
  transform = IDENTITY,
  buildVolume: { x: number; y: number; z: number } | null = null,
): OrientationSearch =>
  optimizeOrientation(centered(triangles), transform, buildVolume);

/** Cone tip down: apex at Z = 0, base of `sides` corners at Z = height */
function coneTipDown(radius: number, height: number, sides: number): number[] {
  const base = polygon(radius, sides);
  const apex: Vec = [0, 0, 0];
  const top = (i: number): Vec => [
    base[i % sides][0],
    base[i % sides][1],
    height,
  ];
  const triangles: number[] = [];

  for (let i = 0; i < sides; i += 1) {
    // Side, facing outwards and down
    triangles.push(...apex, ...top(i + 1), ...top(i));
  }

  for (let i = 1; i < sides - 1; i += 1) {
    // Base, facing up
    triangles.push(...top(0), ...top(i), ...top(i + 1));
  }

  return triangles;
}

/**
 * Figurine of cubes of 5 mm (front first, top row first): head, arms
 * along the body with the hands forward, legs, base; 40 x 20 x 50 mm.
 */
function figurine(): number[] {
  const e = "........";
  const front = [e, e, e, e, e, "#......#", e, e, e, "########"];
  const body = [
    "..####..",
    "..####..",
    "...##...",
    "########",
    "#.####.#",
    "#.####.#",
    "..####..",
    "..#..#..",
    "..#..#..",
    "########",
  ];
  const back = [e, e, e, e, e, e, e, e, e, "########"];

  return blocks([front, body, body, back], 5);
}

/** The turn of a result as a quaternion of Three.js */
const quaternion = (result: OrientationSearch): THREE.Quaternion => {
  const turn = result.turn ?? { x: 0, y: 0, z: 0, w: 1 };

  return new THREE.Quaternion(turn.x, turn.y, turn.z, turn.w);
};

/** Where a direction of the object goes after the turn of a result */
const moved = (result: OrientationSearch, v: Vec): number[] =>
  new THREE.Vector3(...v)
    .applyQuaternion(quaternion(result))
    .toArray()
    .map((value) => Math.round(value * 1e6) / 1e6 + 0);

describe("Orientation search (ADR-036 D2, D3)", () => {
  it("cube of 20 mm: already the best, nothing turned", () => {
    const result = search(box([0, 0, 0], [20, 20, 20]));

    expect(result.turn).toBeNull();
    expect(result.angle).toBe(0);
    expect(result.before.score).toBe(90);
    expect(result.after).toEqual(result.before);
    expect(result.measured).toBe(6);
    expect(result.optimization).toEqual({
      orientationScore: 90,
      supportReduction: 0,
      timeReduction: 0,
      materialReduction: 0,
    });
  });

  it("tower 20 x 20 x 100 mm standing: lies on its left side (Noam)", () => {
    const result = search(box([0, 0, 0], [20, 20, 100]));

    // Standing: risk 80 (High), score 100 - 0 - 24 - 10 = 66
    expect(result.before).toMatchObject({
      score: 66,
      riskScore: 80,
      supportsNeeded: false,
      height: 100,
    });
    // Lying: risk 0, score 100 - 0 - 0 - 2 = 98; the four sides give 98
    // with a turn of 90 degrees: the first of the order (left, -X) wins
    expect(result.after).toMatchObject({
      score: 98,
      riskScore: 0,
      overhangPercentage: 0,
    });
    expect(result.after.height).toBeCloseTo(20, 9);
    expect(result.after.width).toBeCloseTo(100, 9);
    expect(result.angle).toBeCloseTo(90, 9);
    expect(moved(result, [-1, 0, 0])).toEqual([0, 0, -1]);
    // The top of the tower goes to -X, its length along X
    expect(moved(result, [0, 0, 1])).toEqual([-1, 0, 0]);
    expect(result.optimization.orientationScore).toBe(98);
  });

  it("tower lying: stays lying (standing has a risk above 60)", () => {
    const result = search(box([0, 0, 0], [20, 20, 100]), turned(0, 90, 0));

    expect(result.before.score).toBe(98);
    expect(result.turn).toBeNull();
  });

  it("tower standing in a build volume of 50 x 50 x 200 mm: lying does not fit, stays standing", () => {
    const result = search(box([0, 0, 0], [20, 20, 100]), IDENTITY, {
      x: 50,
      y: 50,
      z: 200,
    });

    expect(result.before.fits).toBe(true);
    expect(result.turn).toBeNull();
    expect(result.after.score).toBe(66);
  });

  it("cone tip down: turned onto its base", () => {
    const result = search(coneTipDown(40, 20, 32));

    // On its tip (sides at 63 degrees from the vertical): a point of
    // contact, risk 100, supports
    expect(result.before.riskScore).toBe(100);
    expect(result.before.supportsNeeded).toBe(true);
    expect(result.after.riskScore).toBeLessThan(100);
    expect(result.after.supportsNeeded).toBe(false);
    expect(result.after.overhangPercentage).toBe(0);
    expect(result.angle).toBeCloseTo(180, 9);
    // The base (top, +Z) brought down by a half turn around X
    expect(moved(result, [0, 0, 1])).toEqual([0, 0, -1]);
    expect(moved(result, [1, 0, 0])).toEqual([1, 0, 0]);
    expect(result.optimization.supportReduction).toBe(100);
  });

  it("plate standing on its edge: laid flat", () => {
    const result = search(box([0, 0, 0], [100, 5, 60]));

    expect(result.before.score).toBe(84);
    expect(result.after.score).toBe(100);
    expect(result.after.height).toBeCloseTo(5, 9);
  });

  it("L bracket: laid on its side (5 points more)", () => {
    const result = search(
      extruded(["#.....", "#.....", "#.....", "######"], 2),
    );

    expect(result.before.score).toBe(92);
    expect(result.after.score).toBe(97);
    expect(result.after.height).toBeCloseTo(20, 9);
  });

  it("less than 5 points more: the current orientation is kept", () => {
    // 20 x 20 x 24 mm: standing 89 (risk 4), lying 92
    const result = search(box([0, 0, 0], [20, 20, 24]));

    expect(result.before.score).toBe(89);
    expect(result.turn).toBeNull();
    expect(result.after.score).toBe(89);
  });

  it("T standing on its foot: turned, supports no longer needed", () => {
    const t = ["#####", "..#..", "..#..", "..#.."];
    const standing = search(extruded(t, 1));

    expect(standing.before.supportsNeeded).toBe(true);
    expect(standing.before.overhangPercentage).toBeGreaterThan(0);
    expect(standing.after.supportsNeeded).toBe(false);
    expect(standing.optimization.supportReduction).toBe(100);
  });

  it("open vases standing stay standing (Noam: vase mode)", () => {
    const narrow = search(cup(polygon(15, 64), polygon(14, 64), 2, 100));
    const wide = search(cup(polygon(40, 64), polygon(38, 64), 2, 120));

    expect(narrow.turn).toBeNull();
    expect(narrow.before).toMatchObject({ score: 74, riskScore: 55 });
    expect(wide.turn).toBeNull();
    expect(wide.before).toMatchObject({ score: 86, riskScore: 14 });
    // Faces of the hull tried too (sides of the vase), none better
    expect(narrow.measured).toBeGreaterThan(6);
  });

  it("open vase lying: stood up again, opening at the top", () => {
    const result = search(
      cup(polygon(40, 64), polygon(38, 64), 2, 120),
      turned(90, 0, 0),
    );

    expect(result.after).toMatchObject({ score: 86, riskScore: 14 });
    expect(result.after.supportsNeeded).toBe(false);
    // The bottom of the vase (-Z of the object, +Y once lying) goes down
    expect(moved(result, [0, 1, 0])).toEqual([0, 0, -1]);
  });

  it("figurine: stays standing, nothing gains 5 points (Noam: show the result)", () => {
    const result = search(figurine());

    // Standing: supports (arms and hands), overhangs 6.8 %, risk 15
    expect(result.before).toMatchObject({
      score: 42,
      supportsNeeded: true,
      riskScore: 15,
    });
    expect(result.before.overhangPercentage).toBeCloseTo(6.82, 2);
    // Lying on a side or on its face: 39 at best; on its back: risk 100
    expect(result.turn).toBeNull();
    expect(result.measured).toBe(14);
  });

  it("sphere: every orientation has a risk of 100, nothing turned", () => {
    const result = search(sphere(20, 32, 16));

    expect(result.before.riskScore).toBe(100);
    expect(result.turn).toBeNull();
  });

  it("same object, same result (deterministic)", () => {
    const tower = box([0, 0, 0], [20, 20, 100]);

    expect(search(tower)).toEqual(search(tower));
  });

  it("the orientation applied gives the same measures in the analysis", () => {
    const positions = centered(coneTipDown(40, 20, 32));
    const result = optimizeOrientation(positions, IDENTITY, null);
    const transform = rotateAroundPoint(
      { position: { x: 0, y: 0, z: 0 }, ...IDENTITY },
      quaternion(result),
      { x: 0, y: 0, z: 0 },
    );
    const analysis = analyzeModel(positions, transform);

    expect(analysis.overhangs.percentage).toBeCloseTo(
      result.after.overhangPercentage,
      6,
    );
    expect(analysis.stability.riskScore).toBe(result.after.riskScore);
    expect(analysis.dimensions.height).toBeCloseTo(result.after.height, 6);
  });
});

describe("Candidates, score and Reliability Rules", () => {
  it("the 6 axes first, the current orientation first of all", () => {
    const positions = centered(box([0, 0, 0], [20, 30, 40]));
    const placed = Float64Array.from(positions);
    const candidates = orientationCandidates(placed, positions.length / 3);

    expect(candidates.map((c) => c.down)).toEqual([
      [0, 0, -1],
      [0, 0, 1],
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
    ]);
    expect(candidates[0]).toMatchObject({ source: "current", angle: 0 });
    // The 6 faces of the hull are the 6 axes: no other candidate
    expect(candidates.every((c) => c.source !== "hull")).toBe(true);
  });

  it("a slanted face of the convex hull is a candidate", () => {
    // Wedge: section (0, 0), (40, 0), (0, 40) in X, Z, 30 mm along Y
    const p = (x: number, y: number, z: number): Vec => [x, y, z];
    const a0 = p(0, 0, 0);
    const b0 = p(40, 0, 0);
    const c0 = p(0, 0, 40);
    const a1 = p(0, 30, 0);
    const b1 = p(40, 30, 0);
    const c1 = p(0, 30, 40);
    const faces3: Vec[][] = [
      [a0, c0, b0], // front (-Y)
      [a1, b1, c1], // back (+Y)
      [a0, b0, b1], // bottom
      [a0, b1, a1],
      [a0, a1, c1], // left (-X)
      [a0, c1, c0],
      [b0, c0, c1], // slanted face
      [b0, c1, b1],
    ];
    const wedge = faces3.flat(2);
    const positions = centered(wedge);
    const faces = hullFaceDirections(
      Float64Array.from(positions),
      positions.length / 3,
    );
    const slanted = faces.find(
      ({ direction }) => direction[0] > 0.7 && direction[2] > 0.7,
    );

    expect(slanted).toBeDefined();
    expect(slanted?.direction[0]).toBeCloseTo(Math.SQRT1_2, 9);

    const candidates = orientationCandidates(
      Float64Array.from(positions),
      positions.length / 3,
    );
    const hull = candidates.filter((c) => c.source === "hull");

    expect(hull).toHaveLength(1);
    expect(hull[0].angle).toBeCloseTo(135, 6);
  });

  it("the top is brought down by a half turn around X", () => {
    expect(turnDown([0, 0, 1])).toEqual({ x: 1, y: 0, z: 0, w: 0 });
    expect(turnDown([0, 0, -1])).toEqual({ x: 0, y: 0, z: 0, w: 1 });
  });

  it("score: 100 - S - T - H, each part limited", () => {
    expect(orientationScore(false, 0, 0, 20, 20)).toBe(90);
    expect(orientationScore(true, 50, 100, 10, 10)).toBe(0);
    // S = 30 + 2 x 10, T = 0.3 x 50, H = 10 x 20 / 40
    expect(orientationScore(true, 10, 50, 20, 40)).toBe(30);
  });

  it("excluded: risk 100, outside the build volume, risk above 60 when the current one is not", () => {
    const measure = (riskScore: number, fits: boolean | null) =>
      ({ riskScore, fits }) as OrientationMeasure;

    expect(isExcluded(measure(100, null), measure(100, null))).toBe(true);
    expect(isExcluded(measure(0, false), measure(0, null))).toBe(true);
    expect(isExcluded(measure(61, null), measure(60, null))).toBe(true);
    expect(isExcluded(measure(61, null), measure(80, null))).toBe(false);
    expect(isExcluded(measure(60, true), measure(0, true))).toBe(false);
  });

  it("OptimizationSchema (strict) accepts the result and refuses another field", () => {
    const result = search(box([0, 0, 0], [20, 20, 100]));

    expect(OptimizationSchema.safeParse(result.optimization).success).toBe(
      true,
    );
    expect(
      OptimizationSchema.safeParse({ ...result.optimization, extra: 1 })
        .success,
    ).toBe(false);
  });
});

describe("OPT_002 and Web Worker", () => {
  it("empty mesh, transform or build volume that cannot be used: OPT_002", () => {
    expect(() =>
      optimizeOrientation(new Float32Array(0), IDENTITY, null),
    ).toThrow(OptimizationError);
    expect(() =>
      optimizeOrientation(
        centered(box([0, 0, 0], [20, 20, 20])),
        { rotation: { x: Number.NaN, y: 0, z: 0 }, scale: IDENTITY.scale },
        null,
      ),
    ).toThrow(expect.objectContaining({ code: "OPT_002" }));
    expect(() =>
      optimizeOrientation(centered(box([0, 0, 0], [20, 20, 20])), IDENTITY, {
        x: 0,
        y: 100,
        z: 100,
      }),
    ).toThrow(expect.objectContaining({ code: "OPT_002" }));
    expect(
      runOrientationRequest(
        null as unknown as Parameters<typeof runOrientationRequest>[0],
      ),
    ).toMatchObject({ type: "error", code: "OPT_002" });
  });

  /** Fake worker answering with runOrientationRequest */
  function fakeWorker(answer = true) {
    const worker = {
      onmessage: null as
        ((event: MessageEvent<OrientationResponse>) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      terminate: vi.fn(),
      postMessage: vi.fn((request, transfer: ArrayBuffer[]) => {
        expect(transfer).toEqual([request.positions.buffer]);

        if (answer) {
          queueMicrotask(() =>
            worker.onmessage?.({
              data: runOrientationRequest(request),
            } as MessageEvent<OrientationResponse>),
          );
        }
      }),
    };

    return worker;
  }

  it("runs in a worker, copies the data and terminates the worker", async () => {
    const worker = fakeWorker();
    const positions = centered(box([0, 0, 0], [20, 20, 100]));
    const result = await runOrientationSearch(
      positions,
      IDENTITY,
      { x: 250, y: 210, z: 220 },
      undefined,
      () => worker as unknown as Worker,
    );

    expect(result.after.score).toBe(98);
    expect(result.after.fits).toBe(true);
    expect(worker.terminate).toHaveBeenCalled();
    expect(worker.postMessage.mock.calls[0][0].positions).not.toBe(positions);
    expect(positions.length).toBe(12 * 9);
  });

  it("OPT_002 from the worker becomes an OptimizationError", async () => {
    const worker = fakeWorker();

    await expect(
      runOrientationSearch(
        new Float32Array(0),
        IDENTITY,
        null,
        undefined,
        () => worker as unknown as Worker,
      ),
    ).rejects.toMatchObject({ name: "OptimizationError", code: "OPT_002" });
  });

  it("a search no longer needed is dropped: worker terminated at once", async () => {
    const worker = fakeWorker(false);
    const controller = new AbortController();
    const promise = runOrientationSearch(
      centered(box([0, 0, 0], [20, 20, 20])),
      IDENTITY,
      null,
      controller.signal,
      () => worker as unknown as Worker,
    );

    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(OptimizationCancelledError);
    expect(worker.terminate).toHaveBeenCalled();
  });
});
