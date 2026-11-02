/**
 * SlicyWeb
 * Analysis Service Tests
 *
 * Start of the analysis from the GUI (Phase 9 lot 80; ADR-034 D6, D7):
 * automatic after the import and after a rotation or a scale, never during
 * a gesture, one object at a time; a computation no longer needed is
 * dropped; the result is validated (Complete Analysis Schema, analysisId
 * kept, classification null); ANA_001 and ANA_002 messages; Tools >
 * Analyze Models and Recompute Analysis.
 *
 * The computation itself is the real one (analyzeModel), called without a
 * worker.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Object Reference Rules)
 * - DECISIONS.md (ADR-034 D6, D7)
 * - GUI_SPEC.md (Tools Menu, Analysis Section)
 * - TEST_PLAN.md
 */

import { beforeEach, describe, expect, it } from "vitest";

import { AnalysisCancelledError } from "../../../src/model_analysis/AnalysisError";
import type { AnalysisTransform } from "../../../src/model_analysis/MeshAnalyzer";
import {
  analyzeModel,
  type ModelAnalysisResult,
} from "../../../src/model_analysis/ModelAnalyzer";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { AnalysisSchema } from "../../../src/schemas/AnalysisSchema";
import {
  createAnalysisService,
  type AnalysisServiceInstance,
} from "../../../src/services/AnalysisService";
import { useAnalysisStore } from "../../../src/state/analysisStore";
import { useAnalysisTaskStore } from "../../../src/state/analysisTaskStore";
import { useObjectStore } from "../../../src/state/objectStore";

import type { Transform } from "../../../src/types/Object3D";

/** Box centered on the origin, 12 triangles (closed) */
function box(width: number, depth: number, height: number): Float32Array {
  const [x, y, z] = [width / 2, depth / 2, height / 2];
  const v = [
    [-x, -y, -z],
    [x, -y, -z],
    [x, y, -z],
    [-x, y, -z],
    [-x, -y, z],
    [x, -y, z],
    [x, y, z],
    [-x, y, z],
  ];
  const faces = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],
    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],
  ];

  return new Float32Array(faces.flat().flatMap((index) => v[index]));
}

/** Same box without its top: the mesh is not closed */
function openBox(): Float32Array {
  const closed = box(10, 10, 10);

  // Triangles 3 and 4 (the top) left out
  return new Float32Array([...closed.slice(0, 18), ...closed.slice(36)]);
}

interface Call {
  objectId: string;
  transform: AnalysisTransform;
  signal: AbortSignal;
  resolve: () => void;
  reject: (error: unknown) => void;
}

interface Harness {
  service: AnalysisServiceInstance;
  calls: Call[];
  /** Answer of each computation as soon as it is asked (default) */
  setAutomatic: (automatic: boolean) => void;
  setGesture: (active: boolean) => void;
  meshes: Map<string, Float32Array>;
  /** Result changed before it is returned (invalid results) */
  setTamper: (tamper: ((result: ModelAnalysisResult) => void) | null) => void;
}

function harness(): Harness {
  const calls: Call[] = [];
  const meshes = new Map<string, Float32Array>();
  const listeners = new Set<() => void>();
  let automatic = true;
  let gesture = false;
  let tamper: ((result: ModelAnalysisResult) => void) | null = null;
  let id = 0;

  const service = createAnalysisService({
    positions: (objectId) => meshes.get(objectId) ?? null,
    run: (positions, transform, signal) => {
      const objectId = [...meshes].find(([, mesh]) => mesh === positions)![0];

      return new Promise<ModelAnalysisResult>((resolve, reject) => {
        const call: Call = {
          objectId,
          transform,
          signal,
          resolve: () => {
            try {
              const result = analyzeModel(positions, transform);
              tamper?.(result);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          reject,
        };

        signal.addEventListener("abort", () =>
          reject(new AnalysisCancelledError()),
        );
        calls.push(call);

        if (automatic) {
          call.resolve();
        }
      });
    },
    isGestureActive: () => gesture,
    onGestureEnd: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    createId: () => `id-${(id += 1)}`,
  });

  return {
    service,
    calls,
    meshes,
    setAutomatic: (value) => {
      automatic = value;
    },
    setGesture: (active) => {
      gesture = active;

      if (!active) {
        for (const listener of listeners) {
          listener();
        }
      }
    },
    setTamper: (value) => {
      tamper = value;
    },
  };
}

function addObject(h: Harness, objectId: string, mesh: Float32Array): void {
  h.meshes.set(objectId, mesh);
  useObjectStore
    .getState()
    .addObject(ObjectFactory.create(objectId, `${objectId}.stl`, "stl"));
}

function transformOf(objectId: string): Transform {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId)!.transform;
}

function setTransform(objectId: string, change: Partial<Transform>): void {
  useObjectStore
    .getState()
    .updateObjectTransform(objectId, { ...transformOf(objectId), ...change });
}

/** Lets the promises of the service run */
async function settle(h: Harness): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await h.service.idle();
    await Promise.resolve();
  }
}

/** Lets the promises run, without waiting for a computation */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const analysisOf = (objectId: string) =>
  useAnalysisStore.getState().analysis[objectId];

let h: Harness;
let stop: () => void;

beforeEach(() => {
  stop?.();
  useObjectStore.getState().clearObjects();
  useAnalysisStore.getState().clearAnalysis();
  useAnalysisTaskStore.setState({
    pendingObjectIds: [],
    openMeshObjectIds: [],
    messages: [],
  });
  h = harness();
  stop = h.service.start();
});

describe("AnalysisService (Phase 9 lot 80, ADR-034 D7)", () => {
  it("analyzes an imported object and stores a valid Complete Analysis Schema", async () => {
    addObject(h, "a", box(20, 10, 30));
    await settle(h);

    const analysis = analysisOf("a");

    expect(AnalysisSchema.safeParse(analysis).success).toBe(true);
    expect(analysis.status).toBe("generated");
    expect(analysis.objectId).toBe("a");
    expect(analysis.classification).toBeNull();
    expect(analysis.dimensions.width).toBeCloseTo(20, 6);
    expect(analysis.geometry.volume).toBeCloseTo(6000, 3);
    expect(useAnalysisTaskStore.getState().pendingObjectIds).toEqual([]);
    expect(useAnalysisTaskStore.getState().messages).toEqual([]);
  });

  it("shows the object as analyzing while it is computed, one object at a time", async () => {
    h.setAutomatic(false);
    addObject(h, "a", box(10, 10, 10));
    addObject(h, "b", box(10, 10, 10));
    await Promise.resolve();

    expect(useAnalysisTaskStore.getState().pendingObjectIds).toEqual([
      "a",
      "b",
    ]);
    expect(h.calls.map((call) => call.objectId)).toEqual(["a"]);

    h.calls[0].resolve();
    await tick();
    expect(h.calls.map((call) => call.objectId)).toEqual(["a", "b"]);

    h.calls[1].resolve();
    await tick();
    expect(analysisOf("a").status).toBe("generated");
    expect(analysisOf("b").status).toBe("generated");
    expect(useAnalysisTaskStore.getState().pendingObjectIds).toEqual([]);
  });

  it("analyzes again after a rotation, keeping the analysisId", async () => {
    addObject(h, "a", box(20, 10, 30));
    await settle(h);
    const { analysisId } = analysisOf("a");

    setTransform("a", { rotation: { x: 90, y: 0, z: 0 } });
    await settle(h);

    const analysis = analysisOf("a");
    expect(analysis.status).toBe("generated");
    expect(analysis.analysisId).toBe(analysisId);
    // Turned 90° around X: the depth becomes the height
    expect(analysis.dimensions.height).toBeCloseTo(10, 4);
    expect(h.calls).toHaveLength(2);
  });

  it("does not analyze again after a move only (Object Reference Rule 8)", async () => {
    addObject(h, "a", box(10, 10, 10));
    await settle(h);

    setTransform("a", { position: { x: 30, y: -12, z: 5 } });
    await settle(h);

    expect(h.calls).toHaveLength(1);
    expect(analysisOf("a").status).toBe("generated");
  });

  it("waits for the end of a gesture (never while dragging)", async () => {
    addObject(h, "a", box(10, 10, 10));
    await settle(h);

    h.setGesture(true);
    setTransform("a", { scale: { x: 2, y: 2, z: 2 } });
    setTransform("a", { scale: { x: 3, y: 3, z: 3 } });
    await settle(h);

    expect(h.calls).toHaveLength(1);
    expect(analysisOf("a").status).toBe("outdated");
    expect(useAnalysisTaskStore.getState().pendingObjectIds).toEqual([]);

    h.setGesture(false);
    await settle(h);

    expect(h.calls).toHaveLength(2);
    expect(h.calls[1].transform.scale).toEqual({ x: 3, y: 3, z: 3 });
    expect(analysisOf("a").status).toBe("generated");
    expect(analysisOf("a").dimensions.width).toBeCloseTo(30, 4);
  });

  it("drops a computation when the object is turned again, then computes the new one", async () => {
    h.setAutomatic(false);
    addObject(h, "a", box(10, 20, 30));
    await Promise.resolve();
    const first = h.calls[0];

    setTransform("a", { rotation: { x: 0, y: 0, z: 90 } });
    await Promise.resolve();

    expect(first.signal.aborted).toBe(true);
    expect(h.calls).toHaveLength(2);
    expect(h.calls[1].transform.rotation).toEqual({ x: 0, y: 0, z: 90 });

    h.calls[1].resolve();
    await settle(h);
    expect(analysisOf("a").dimensions.width).toBeCloseTo(20, 4);
  });

  it("drops the computation of a removed object, nothing is stored", async () => {
    h.setAutomatic(false);
    addObject(h, "a", box(10, 10, 10));
    await Promise.resolve();
    const first = h.calls[0];

    useObjectStore.getState().removeObject("a");
    await settle(h);

    expect(first.signal.aborted).toBe(true);
    expect(analysisOf("a")).toBeUndefined();
    expect(useAnalysisTaskStore.getState().pendingObjectIds).toEqual([]);
    expect(useAnalysisTaskStore.getState().messages).toEqual([]);
  });

  it("reports ANA_001 once, keeps no analysis and retries only on request", async () => {
    addObject(h, "a", new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0]));
    await settle(h);

    expect(analysisOf("a")).toBeUndefined();
    expect(useAnalysisTaskStore.getState().messages).toEqual([
      expect.objectContaining({
        objectId: "a",
        fileName: "a.stl",
        code: "ANA_001",
      }),
    ]);

    // Another change of the scene: not computed again by itself
    addObject(h, "b", box(10, 10, 10));
    await settle(h);
    expect(h.calls.filter((call) => call.objectId === "a")).toHaveLength(1);

    // Tools > Analyze Models: computed again (and fails again)
    h.service.analyzeModels();
    await settle(h);
    expect(h.calls.filter((call) => call.objectId === "a")).toHaveLength(2);
    expect(useAnalysisTaskStore.getState().messages).toHaveLength(2);

    h.service.dismiss(useAnalysisTaskStore.getState().messages[0].messageId);
    expect(useAnalysisTaskStore.getState().messages).toHaveLength(1);
  });

  it("refuses a result that does not follow AnalysisSchema (ANA_001)", async () => {
    h.setTamper((result) => {
      result.stability.riskScore = Number.NaN;
    });
    addObject(h, "a", box(10, 10, 10));
    await settle(h);

    expect(analysisOf("a")).toBeUndefined();
    expect(useAnalysisTaskStore.getState().messages[0].code).toBe("ANA_001");
  });

  it("an object without geometry gives ANA_001", async () => {
    useObjectStore
      .getState()
      .addObject(ObjectFactory.create("ghost", "ghost.stl", "stl"));
    await settle(h);

    expect(analysisOf("ghost")).toBeUndefined();
    expect(useAnalysisTaskStore.getState().messages[0].code).toBe("ANA_001");
  });

  it("a mesh not closed is analyzed with the warning ANA_002, shown once", async () => {
    addObject(h, "a", openBox());
    await settle(h);

    expect(analysisOf("a").status).toBe("generated");
    expect(useAnalysisTaskStore.getState().openMeshObjectIds).toEqual(["a"]);
    expect(useAnalysisTaskStore.getState().messages).toEqual([
      expect.objectContaining({ objectId: "a", code: "ANA_002" }),
    ]);

    h.service.recompute(["a"]);
    await settle(h);

    expect(h.calls).toHaveLength(2);
    expect(useAnalysisTaskStore.getState().messages).toHaveLength(1);
    expect(useAnalysisTaskStore.getState().openMeshObjectIds).toEqual(["a"]);

    useObjectStore.getState().removeObject("a");
    await settle(h);
    expect(useAnalysisTaskStore.getState().openMeshObjectIds).toEqual([]);
  });

  it("Recompute Analysis computes an object up to date again; Analyze Models skips it", async () => {
    addObject(h, "a", box(10, 10, 10));
    await settle(h);

    h.service.analyzeModels();
    await settle(h);
    expect(h.calls).toHaveLength(1);

    h.service.recompute(["a"]);
    await settle(h);
    expect(h.calls).toHaveLength(2);
    expect(analysisOf("a").status).toBe("generated");
  });

  it("stops watching the scene when stopped", async () => {
    stop();
    addObject(h, "a", box(10, 10, 10));
    await settle(h);

    expect(h.calls).toHaveLength(0);
    expect(analysisOf("a")).toBeUndefined();
  });
});
