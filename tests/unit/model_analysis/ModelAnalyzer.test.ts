/**
 * SlicyWeb
 * Model Analyzer tests (Phase 9, lot 77)
 *
 * Base of the analysis on models built in the tests (TEST_PLAN.md,
 * Analysis Engine Unit Tests): dimensions, volume, area, mesh, center of
 * gravity, stability with the contact hull, open edges (ANA_002), empty
 * mesh (ANA_001), Web Worker messages.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Analysis Rules)
 * - DECISIONS.md (ADR-034)
 * - TEST_PLAN.md (Analysis Engine Unit Tests)
 */

import { describe, expect, it, vi } from "vitest";

import {
  AnalysisCancelledError,
  AnalysisError,
} from "../../../src/model_analysis/AnalysisError";
import { runModelAnalysis } from "../../../src/model_analysis/AnalysisRunner";
import { weldVertices } from "../../../src/model_analysis/MeshAnalyzer";
import { countOpenEdges } from "../../../src/model_analysis/MeshValidator";
import {
  analyzeModel,
  runAnalysisRequest,
  type AnalysisResponse,
  type ModelAnalysisResult,
} from "../../../src/model_analysis/ModelAnalyzer";
import {
  convexHull,
  isInsideHull,
  polygonArea,
  riskFromRatio,
} from "../../../src/model_analysis/StabilityAnalyzer";

type Vec = [number, number, number];

const IDENTITY = {
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

/** 12 triangles of a box, facing outwards (counterclockwise from outside) */
function box(min: Vec, max: Vec): number[] {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const quads: Vec[][] = [
    [
      [x0, y0, z0],
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y0, z0],
    ], // bottom (-Z)
    [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ], // top (+Z)
    [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
    ], // front (-Y)
    [
      [x0, y1, z0],
      [x0, y1, z1],
      [x1, y1, z1],
      [x1, y1, z0],
    ], // back (+Y)
    [
      [x0, y0, z0],
      [x0, y0, z1],
      [x0, y1, z1],
      [x0, y1, z0],
    ], // left (-X)
    [
      [x1, y0, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x1, y0, z1],
    ], // right (+X)
  ];
  const triangles: number[] = [];

  for (const [a, b, c, d] of quads) {
    triangles.push(...a, ...b, ...c, ...a, ...c, ...d);
  }

  return triangles;
}

/**
 * Triangle data as stored by the import: coordinates relative to the
 * center of the bounding box of the object.
 */
function centered(triangles: number[]): Float32Array {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < triangles.length; i += 1) {
    min[i % 3] = Math.min(min[i % 3], triangles[i]);
    max[i % 3] = Math.max(max[i % 3], triangles[i]);
  }

  return Float32Array.from(
    triangles,
    (value, i) => value - (min[i % 3] + max[i % 3]) / 2,
  );
}

/** Sphere of radius r, poles on Z (closed, a single vertex at each pole) */
function sphere(r: number, segments: number, rings: number): number[] {
  const point = (ring: number, segment: number): Vec => {
    if (ring === 0) return [0, 0, -r];
    if (ring === rings) return [0, 0, r];

    const theta = (Math.PI * ring) / rings;
    const phi = (2 * Math.PI * (segment % segments)) / segments;

    return [
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      -r * Math.cos(theta),
    ];
  };
  const triangles: number[] = [];

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = point(ring, segment);
      const b = point(ring, segment + 1);
      const c = point(ring + 1, segment + 1);
      const d = point(ring + 1, segment);

      if (ring > 0) triangles.push(...a, ...b, ...d);
      if (ring < rings - 1) triangles.push(...b, ...c, ...d);
    }
  }

  return triangles;
}

const cube20 = (): Float32Array => centered(box([0, 0, 0], [20, 20, 20]));

describe("ModelAnalyzer: cube of 20 mm", () => {
  const result = analyzeModel(cube20(), IDENTITY);

  it("dimensions, geometry and mesh", () => {
    expect(result.dimensions.width).toBeCloseTo(20, 6);
    expect(result.dimensions.depth).toBeCloseTo(20, 6);
    expect(result.dimensions.height).toBeCloseTo(20, 6);
    expect(result.geometry.width).toBe(result.dimensions.width);
    expect(result.geometry.depth).toBe(result.dimensions.depth);
    expect(result.geometry.height).toBe(result.dimensions.height);
    expect(result.geometry.volume).toBeCloseTo(8000, 6);
    expect(result.geometry.surfaceArea).toBeCloseTo(2400, 6);
    expect(result.mesh).toEqual({ vertices: 8, triangles: 12 });
    expect(result.meshClosed).toBe(true);
  });

  it("stability: contact area, center of gravity, ratio 1, risk 0", () => {
    expect(result.stability.contactArea).toBeCloseTo(400, 6);
    expect(result.stability.centerOfGravity.x).toBeCloseTo(0, 6);
    expect(result.stability.centerOfGravity.y).toBeCloseTo(0, 6);
    expect(result.stability.centerOfGravity.z).toBeCloseTo(0, 6);
    expect(result.stability.heightRatio).toBeCloseTo(1, 9);
    expect(result.stability.riskScore).toBe(0);
  });

  it("corners at the same position are one vertex, -0 equal to 0", () => {
    // Each face written with its own copy of its corners; half of the
    // zeros written as -0
    const positions = Float32Array.from(box([-10, -10, 0], [10, 10, 20]));
    let zeros = 0;

    for (let i = 0; i < positions.length; i += 1) {
      if (positions[i] === 0 && zeros++ % 2 === 0) positions[i] = -0;
    }

    expect(zeros).toBeGreaterThan(0);
    expect(analyzeModel(positions, IDENTITY).mesh.vertices).toBe(8);
  });

  it("the same object analyzed twice gives the same result", () => {
    expect(analyzeModel(cube20(), IDENTITY)).toEqual(result);
  });

  it("the triangle data are not changed", () => {
    const positions = cube20();
    const copy = positions.slice();

    analyzeModel(positions, IDENTITY);
    expect(positions).toEqual(copy);
  });
});

describe("ModelAnalyzer: object as placed (scale and rotation)", () => {
  it("cube scaled 200 % in X then turned +90 degrees around Z: 20 x 40 x 20, 16000 mm³", () => {
    const result = analyzeModel(cube20(), {
      rotation: { x: 0, y: 0, z: 90 },
      scale: { x: 2, y: 1, z: 1 },
    });

    expect(result.dimensions.width).toBeCloseTo(20, 6);
    expect(result.dimensions.depth).toBeCloseTo(40, 6);
    expect(result.dimensions.height).toBeCloseTo(20, 6);
    expect(result.geometry.volume).toBeCloseTo(16000, 6);
    expect(result.geometry.surfaceArea).toBeCloseTo(4000, 6);
    expect(result.stability.contactArea).toBeCloseTo(800, 6);
    expect(result.stability.riskScore).toBe(0);
  });

  it("the center of gravity follows the rotation, relative to the center of the object", () => {
    // L: a block 20 x 20 x 20 and a block 20 x 20 x 20 beside it in +X on
    // the floor, plus one on top of the first: center of gravity off center
    const triangles = [
      ...box([0, 0, 0], [20, 20, 20]),
      ...box([20, 0, 0], [40, 20, 20]),
      ...box([0, 0, 20], [20, 20, 40]),
    ];
    const positions = centered(triangles);
    // Bounding box 40 x 20 x 40, center (20, 10, 20); centers of the
    // blocks (10, 10, 10), (30, 10, 10), (10, 10, 30) -> mean (16.67, 10, 16.67)
    const plain = analyzeModel(positions, IDENTITY);

    expect(plain.geometry.volume).toBeCloseTo(24000, 6);
    expect(plain.stability.centerOfGravity.x).toBeCloseTo(50 / 3 - 20, 6);
    expect(plain.stability.centerOfGravity.y).toBeCloseTo(0, 6);
    expect(plain.stability.centerOfGravity.z).toBeCloseTo(50 / 3 - 20, 6);

    // +90 degrees around Z: X of the object goes to Y of the plate
    const turned = analyzeModel(positions, {
      rotation: { x: 0, y: 0, z: 90 },
      scale: { x: 1, y: 1, z: 1 },
    });

    expect(turned.stability.centerOfGravity.x).toBeCloseTo(0, 6);
    expect(turned.stability.centerOfGravity.y).toBeCloseTo(50 / 3 - 20, 6);
    expect(turned.stability.centerOfGravity.z).toBeCloseTo(50 / 3 - 20, 6);
  });

  it("cube turned 45 degrees around X: contact on one edge only, risk 100", () => {
    const result = analyzeModel(cube20(), {
      rotation: { x: 45, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });

    expect(result.dimensions.height).toBeCloseTo(20 * Math.SQRT2, 6);
    expect(result.geometry.volume).toBeCloseTo(8000, 6);
    expect(result.stability.contactArea).toBe(0);
    expect(result.stability.heightRatio).toBe(0);
    expect(result.stability.riskScore).toBe(100);
  });
});

describe("ModelAnalyzer: stability", () => {
  it("tower 20 x 20 x 100 mm: height ratio 5, risk 80 (High)", () => {
    const result = analyzeModel(
      centered(box([0, 0, 0], [20, 20, 100])),
      IDENTITY,
    );

    expect(result.stability.heightRatio).toBeCloseTo(5, 9);
    expect(result.stability.riskScore).toBe(80);
    expect(result.stability.contactArea).toBeCloseTo(400, 6);
  });

  it("sphere: no contact area, risk 100 (Critical)", () => {
    const r = 10;
    const result = analyzeModel(centered(sphere(r, 32, 16)), IDENTITY);

    expect(result.meshClosed).toBe(true);
    expect(result.stability.contactArea).toBe(0);
    expect(result.stability.heightRatio).toBe(0);
    expect(result.stability.riskScore).toBe(100);
    // Polygon close to the sphere: slightly smaller than 4/3 pi r³
    expect(result.geometry.volume).toBeLessThan((4 / 3) * Math.PI * r ** 3);
    expect(result.geometry.volume).toBeGreaterThan(
      0.95 * (4 / 3) * Math.PI * r ** 3,
    );
    expect(result.stability.centerOfGravity.z).toBeCloseTo(0, 6);
  });

  it("stool on four legs: contact area = the legs, ratio 1.125, risk 3", () => {
    // Seat 40 x 40 x 5 mm on four legs of 4 x 4 x 40 mm at its corners
    const triangles = [
      ...box([0, 0, 40], [40, 40, 45]),
      ...box([0, 0, 0], [4, 4, 40]),
      ...box([36, 0, 0], [40, 4, 40]),
      ...box([0, 36, 0], [4, 40, 40]),
      ...box([36, 36, 0], [40, 40, 40]),
    ];
    const result = analyzeModel(centered(triangles), IDENTITY);

    expect(result.dimensions.height).toBeCloseTo(45, 6);
    expect(result.geometry.volume).toBeCloseTo(40 * 40 * 5 + 4 * 4 * 4 * 40, 6);
    expect(result.stability.contactArea).toBeCloseTo(4 * 16, 6);
    expect(result.stability.heightRatio).toBeCloseTo(1.125, 9);
    expect(result.stability.riskScore).toBe(3);

    // Center of gravity above the middle of the seat, relative to the center
    const zFromFloor = (8000 * 42.5 + 2560 * 20) / 10560;

    expect(result.stability.centerOfGravity.x).toBeCloseTo(0, 6);
    expect(result.stability.centerOfGravity.y).toBeCloseTo(0, 6);
    expect(result.stability.centerOfGravity.z).toBeCloseTo(
      zFromFloor - 22.5,
      6,
    );
  });

  it("center of gravity outside the contact hull: risk 100", () => {
    // Foot 10 x 10 x 10 mm under the end of a slab of 100 x 10 x 5 mm
    const triangles = [
      ...box([0, 0, 0], [10, 10, 10]),
      ...box([0, 0, 10], [100, 10, 15]),
    ];
    const result = analyzeModel(centered(triangles), IDENTITY);

    expect(result.stability.contactArea).toBeCloseTo(100, 6);
    expect(result.stability.heightRatio).toBeCloseTo(15 / 10, 9);
    expect(result.stability.riskScore).toBe(100);
  });

  it("risk from the ratio: rounded, limited to 0 and 100", () => {
    expect(riskFromRatio(0.5)).toBe(0);
    expect(Object.is(riskFromRatio(0.99), 0)).toBe(true);
    expect(riskFromRatio(1.125)).toBe(3);
    expect(riskFromRatio(2)).toBe(20);
    expect(riskFromRatio(2.06)).toBe(21);
    expect(riskFromRatio(9)).toBe(100);
  });

  it("contact hull: convex, counterclockwise, points inside and on the border", () => {
    const hull = convexHull([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 0 },
    ]);

    expect(hull).toHaveLength(4);
    expect(polygonArea(hull)).toBeCloseTo(100, 9);
    expect(isInsideHull(hull, { x: 5, y: 5 })).toBe(true);
    expect(isInsideHull(hull, { x: 10, y: 5 })).toBe(true);
    expect(isInsideHull(hull, { x: 10.1, y: 5 })).toBe(false);
    expect(
      polygonArea(
        convexHull([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ]),
      ),
    ).toBe(0);
  });
});

describe("ModelAnalyzer: mesh not closed and empty mesh", () => {
  it("cube without one face: analysis computed, mesh not closed (ANA_002)", () => {
    // The 2 last triangles are the right face (+X)
    const positions = cube20().slice(0, 10 * 9);
    const result = analyzeModel(positions, IDENTITY);

    expect(result.meshClosed).toBe(false);
    expect(result.mesh).toEqual({ vertices: 8, triangles: 10 });
    expect(result.geometry.surfaceArea).toBeCloseTo(2000, 6);
    expect(result.dimensions.width).toBeCloseTo(20, 6);
    expect(Number.isFinite(result.geometry.volume)).toBe(true);
  });

  it("open edges: counted once each, flat triangles ignored", () => {
    const welded = weldVertices(cube20().slice(0, 10 * 9));

    expect(countOpenEdges(welded.corners, welded.vertexCount)).toBe(4);

    const closed = weldVertices(
      Float32Array.from([...cube20(), 0, 0, 0, 0, 0, 0, 1, 1, 1]),
    );

    expect(countOpenEdges(closed.corners, closed.vertexCount)).toBe(0);
  });

  it("flat mesh (volume 0): center of the surface, area weighted", () => {
    // One square 10 x 10, alone: no enclosed volume
    const triangles = [
      0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 0, 0, 10, 10, 0, 0, 10, 0,
    ];
    const result = analyzeModel(centered(triangles), IDENTITY);

    expect(result.geometry.volume).toBe(0);
    expect(result.stability.centerOfGravity.x).toBeCloseTo(0, 6);
    expect(result.stability.centerOfGravity.y).toBeCloseTo(0, 6);
    expect(result.meshClosed).toBe(false);
  });

  it("empty mesh: ANA_001, no analysis", () => {
    expect(() => analyzeModel(new Float32Array(0), IDENTITY)).toThrow(
      AnalysisError,
    );

    try {
      analyzeModel(new Float32Array(0), IDENTITY);
    } catch (error) {
      expect((error as AnalysisError).code).toBe("ANA_001");
    }
  });

  it("unreadable mesh: ANA_001 (not 9 numbers per triangle, NaN, no area, bad scale)", () => {
    expect(() => analyzeModel(new Float32Array(10), IDENTITY)).toThrow(
      AnalysisError,
    );
    expect(() =>
      analyzeModel(Float32Array.from([0, 0, 0, 1, 0, 0, NaN, 1, 0]), IDENTITY),
    ).toThrow(AnalysisError);
    expect(() => analyzeModel(new Float32Array(9), IDENTITY)).toThrow(
      AnalysisError,
    );
    expect(() =>
      analyzeModel(cube20(), {
        rotation: IDENTITY.rotation,
        scale: { x: 0, y: 1, z: 1 },
      }),
    ).toThrow(AnalysisError);
  });
});

describe("Web Worker of the analysis", () => {
  it("request answered with the result, or ANA_001 without throwing", () => {
    const ok = runAnalysisRequest({ positions: cube20(), transform: IDENTITY });

    expect(ok.type).toBe("result");

    const empty = runAnalysisRequest({
      positions: new Float32Array(0),
      transform: IDENTITY,
    });

    expect(empty).toMatchObject({ type: "error", code: "ANA_001" });
    expect(
      runAnalysisRequest(
        null as unknown as Parameters<typeof runAnalysisRequest>[0],
      ),
    ).toMatchObject({ type: "error", code: "ANA_001" });
  });

  /** Fake worker answering with runAnalysisRequest */
  function fakeWorker(answer = true) {
    const worker = {
      onmessage: null as
        ((event: MessageEvent<AnalysisResponse>) => void) | null,
      onerror: null as ((event: ErrorEvent) => void) | null,
      terminate: vi.fn(),
      postMessage: vi.fn((request, transfer: ArrayBuffer[]) => {
        expect(transfer).toEqual([request.positions.buffer]);

        if (answer) {
          queueMicrotask(() =>
            worker.onmessage?.({
              data: runAnalysisRequest(request),
            } as MessageEvent<AnalysisResponse>),
          );
        }
      }),
    };

    return worker;
  }

  it("runs in a worker, copies the data and terminates the worker", async () => {
    const worker = fakeWorker();
    const positions = cube20();
    const result: ModelAnalysisResult = await runModelAnalysis(
      positions,
      IDENTITY,
      undefined,
      () => worker as unknown as Worker,
    );

    expect(result.geometry.volume).toBeCloseTo(8000, 6);
    expect(worker.terminate).toHaveBeenCalled();
    // The geometry of the scene keeps its data (a copy is transferred)
    expect(worker.postMessage.mock.calls[0][0].positions).not.toBe(positions);
    expect(positions.length).toBe(12 * 9);
  });

  it("ANA_001 from the worker becomes an AnalysisError", async () => {
    const worker = fakeWorker();

    await expect(
      runModelAnalysis(
        new Float32Array(0),
        IDENTITY,
        undefined,
        () => worker as unknown as Worker,
      ),
    ).rejects.toMatchObject({ name: "AnalysisError", code: "ANA_001" });
  });

  it("a computation no longer needed is dropped: worker terminated at once", async () => {
    const worker = fakeWorker(false);
    const controller = new AbortController();
    const promise = runModelAnalysis(
      cube20(),
      IDENTITY,
      controller.signal,
      () => worker as unknown as Worker,
    );

    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(AnalysisCancelledError);
    expect(worker.terminate).toHaveBeenCalled();
  });
});
