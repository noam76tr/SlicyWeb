/**
 * SlicyWeb
 * Optimization Service Tests
 *
 * Orientation optimization from the GUI (Phase 11 lot 98; ADR-036 D4,
 * D5): the selected objects (all when none is selected), one at a time;
 * the orientations found applied together as one history action
 * OPTIMIZATION (Ctrl+Z gives back the orientations), position X and Y
 * unchanged, the object on the plate; one message, one line per object in
 * the order of the scene (applied, kept, OPT_002); a search dropped when
 * its object is removed or turned meanwhile; never applied during a
 * gesture; one search at a time.
 *
 * The search itself is the real one (optimizeOrientation of the Web
 * Worker), called without a worker.
 *
 * Based on:
 * - DECISIONS.md (ADR-036 D4, D5)
 * - GUI_SPEC.md (Tools Menu, Error Handling UI: Optimization messages)
 * - UNDO_REDO_SPEC.md (2.3.0: Orientation Optimization)
 * - TEST_PLAN.md (Optimization Tests)
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import type { AnalysisTransform } from "../../../src/model_analysis/MeshAnalyzer";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { optimizeOrientation } from "../../../src/optimization_engine/OptimizationEngine";
import {
  OptimizationCancelledError,
  OptimizationError,
} from "../../../src/optimization_engine/OptimizationError";
import type { OrientationSearch } from "../../../src/optimization_engine/OrientationOptimizer";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { lowestPoint } from "../../../src/scene/ObjectTransform";
import {
  createOptimizationService,
  type OptimizationServiceInstance,
} from "../../../src/services/OptimizationService";
import { TransformService } from "../../../src/services/TransformService";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { useOptimizationTaskStore } from "../../../src/state/optimizationTaskStore";
import type { Object3D, Transform } from "../../../src/types/Object3D";
import type { BuildVolume } from "../../../src/types/Printer";

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

const tower = (): Float32Array => box(20, 20, 100);
const cube = (): Float32Array => box(20, 20, 20);

interface Call {
  objectId: string;
  buildVolume: BuildVolume | null;
  signal: AbortSignal;
  resolve: () => void;
  reject: (error: unknown) => void;
}

interface Harness {
  service: OptimizationServiceInstance;
  calls: Call[];
  meshes: Map<string, Float32Array>;
  /** Answer of each search as soon as it is asked (default) */
  setAutomatic: (automatic: boolean) => void;
  setGesture: (active: boolean) => void;
  setBuildVolume: (volume: BuildVolume | null) => void;
  /** Objects whose search fails (OPT_002) */
  failing: Set<string>;
}

function harness(): Harness {
  const calls: Call[] = [];
  const meshes = new Map<string, Float32Array>();
  const listeners = new Set<() => void>();
  const failing = new Set<string>();
  let automatic = true;
  let gesture = false;
  let buildVolume: BuildVolume | null = null;
  let id = 0;

  const service = createOptimizationService({
    positions: (objectId) => meshes.get(objectId) ?? null,
    run: (positions, transform: AnalysisTransform, volume, signal) => {
      const objectId = [...meshes].find(([, mesh]) => mesh === positions)![0];

      return new Promise<OrientationSearch>((resolve, reject) => {
        const call: Call = {
          objectId,
          buildVolume: volume,
          signal,
          resolve: () => {
            try {
              if (failing.has(objectId)) {
                throw new OptimizationError("OPT_002", "failed");
              }

              resolve(optimizeOrientation(positions, transform, volume));
            } catch (error) {
              reject(error);
            }
          },
          reject,
        };

        signal.addEventListener("abort", () =>
          reject(new OptimizationCancelledError()),
        );
        calls.push(call);

        if (automatic) {
          call.resolve();
        }
      });
    },
    buildVolume: () => buildVolume,
    isGestureActive: () => gesture,
    onGestureEnd: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    apply: (transforms) =>
      TransformService.applyMany(transforms, { actionType: "OPTIMIZATION" }),
    createId: () => `id-${(id += 1)}`,
  });

  return {
    service,
    calls,
    meshes,
    failing,
    setAutomatic: (value) => {
      automatic = value;
    },
    setGesture: (active) => {
      gesture = active;

      if (!active) {
        for (const listener of [...listeners]) {
          listener();
        }
      }
    },
    setBuildVolume: (volume) => {
      buildVolume = volume;
    },
  };
}

/** Object standing on the plate at (x, y), as after an import */
function addObject(
  h: Harness,
  objectId: string,
  mesh: Float32Array,
  x = 0,
  y = 0,
): void {
  h.meshes.set(objectId, mesh);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(mesh, 3));
  GeometryRegistry.set(objectId, geometry);

  const object = ObjectFactory.create(objectId, `${objectId}.stl`, "stl");
  useObjectStore.getState().addObject(object);
  TransformService.apply(objectId, {
    ...object.transform,
    position: { x, y, z: 0 },
  });
  TransformService.clearHistory();
}

function objectOf(objectId: string): Object3D {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId)!;
}

function transformOf(objectId: string): Transform {
  return objectOf(objectId).transform;
}

/** Where a direction of the object points on the plate */
function direction(objectId: string, v: [number, number, number]): number[] {
  const { rotation } = transformOf(objectId);
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z),
    "ZYX",
  );

  return new THREE.Vector3(...v)
    .applyEuler(euler)
    .toArray()
    .map((value) => Math.round(value * 1e6) / 1e6 + 0);
}

const history = () => useHistoryStore.getState();
const messages = () => useOptimizationTaskStore.getState().messages;

/** Lets the promises of the service run */
async function settle(h: Harness): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await h.service.idle();
    await Promise.resolve();
  }
}

let h: Harness;

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  TransformService.clearHistory();
  useOptimizationTaskStore.setState({ running: false, messages: [] });
  h = harness();
});

describe("OptimizationService (Phase 11 lot 98, ADR-036 D4)", () => {
  it("tower standing: laid on its left side, one action OPTIMIZATION, X and Y kept", async () => {
    addObject(h, "tower", tower(), 30, -40);

    h.service.optimize(["tower"]);
    await settle(h);

    // The top of the tower goes to -X (lot 97), its length along X
    expect(direction("tower", [0, 0, 1])).toEqual([-1, 0, 0]);

    const transform = transformOf("tower");
    expect(transform.position.x).toBeCloseTo(30, 9);
    expect(transform.position.y).toBeCloseTo(-40, 9);
    // On the plate: lowest point at Z = 0, center 10 mm high
    expect(transform.position.z).toBeCloseTo(10, 5);
    expect(lowestPoint(transform, tower())).toBeCloseTo(0, 6);

    expect(history().undoStack).toHaveLength(1);
    expect(history().undoStack[0]).toMatchObject({ type: "OPTIMIZATION" });
    expect(Object.keys(history().undoStack[0].after)).toEqual(["tower"]);

    expect(messages()).toEqual([
      {
        messageId: "id-1",
        lines: [
          {
            kind: "applied",
            objectId: "tower",
            fileName: "tower.stl",
            scoreBefore: 66,
            scoreAfter: 98,
            supportReduction: 0,
            supportsRemoved: false,
            riskBefore: 80,
            riskAfter: 0,
          },
        ],
      },
    ]);
    expect(useOptimizationTaskStore.getState().running).toBe(false);
  });

  it("Ctrl+Z gives back the orientation, Ctrl+Y applies it again", async () => {
    addObject(h, "tower", tower());
    const before = transformOf("tower");

    h.service.optimize(["tower"]);
    await settle(h);
    const after = transformOf("tower");

    expect(TransformService.undo()).toBe(true);
    expect(transformOf("tower")).toEqual(before);
    expect(useObjectStore.getState().selectedObjectIds).toEqual(["tower"]);

    expect(TransformService.redo()).toBe(true);
    expect(transformOf("tower")).toEqual(after);
  });

  it("cube: already the best, nothing turned, no history action", async () => {
    addObject(h, "cube", cube());
    const before = transformOf("cube");

    h.service.optimize(["cube"]);
    await settle(h);

    expect(transformOf("cube")).toEqual(before);
    expect(history().undoStack).toHaveLength(0);
    expect(messages()[0].lines).toEqual([
      { kind: "kept", objectId: "cube", fileName: "cube.stl", score: 90 },
    ]);
  });

  it("several objects: one action for all those turned, lines in the order of the scene", async () => {
    addObject(h, "a", tower(), -50);
    addObject(h, "b", cube());
    addObject(h, "c", tower(), 50);

    // Asked in another order: searched and shown in the order of the scene
    h.service.optimize(["c", "b", "a"]);
    await settle(h);

    expect(h.calls.map((call) => call.objectId)).toEqual(["a", "b", "c"]);
    expect(history().undoStack).toHaveLength(1);
    expect(Object.keys(history().undoStack[0].after).sort()).toEqual([
      "a",
      "c",
    ]);
    expect(messages()).toHaveLength(1);
    expect(
      messages()[0].lines.map((line) => [line.objectId, line.kind]),
    ).toEqual([
      ["a", "applied"],
      ["b", "kept"],
      ["c", "applied"],
    ]);

    // One undo gives back both towers
    TransformService.undo();
    expect(direction("a", [0, 0, 1])).toEqual([0, 0, 1]);
    expect(direction("c", [0, 0, 1])).toEqual([0, 0, 1]);
  });

  it("only the objects asked are searched", async () => {
    addObject(h, "a", tower(), -50);
    addObject(h, "b", tower(), 50);

    h.service.optimize(["b"]);
    await settle(h);

    expect(direction("a", [0, 0, 1])).toEqual([0, 0, 1]);
    expect(direction("b", [0, 0, 1])).toEqual([-1, 0, 0]);
    expect(messages()[0].lines.map((line) => line.objectId)).toEqual(["b"]);
  });

  it("the build volume of the selected printer is used", async () => {
    addObject(h, "tower", tower());
    h.setBuildVolume({ x: 50, y: 50, z: 200 });

    h.service.optimize(["tower"]);
    await settle(h);

    // Lying does not fit: stays standing (lot 97)
    expect(h.calls[0].buildVolume).toEqual({ x: 50, y: 50, z: 200 });
    expect(direction("tower", [0, 0, 1])).toEqual([0, 0, 1]);
    expect(messages()[0].lines[0]).toMatchObject({ kind: "kept", score: 66 });
  });

  it("OPT_002: the orientation of this object does not change, the others are applied", async () => {
    addObject(h, "a", tower(), -50);
    addObject(h, "b", tower(), 50);
    h.failing.add("a");
    const before = transformOf("a");

    h.service.optimize(["a", "b"]);
    await settle(h);

    expect(transformOf("a")).toEqual(before);
    expect(direction("b", [0, 0, 1])).toEqual([-1, 0, 0]);
    expect(messages()[0].lines).toEqual([
      { kind: "failed", objectId: "a", fileName: "a.stl", code: "OPT_002" },
      expect.objectContaining({ kind: "applied", objectId: "b" }),
    ]);
  });

  it("an object without geometry fails with OPT_002", async () => {
    addObject(h, "a", tower());
    h.meshes.delete("a");

    h.service.optimize(["a"]);
    await settle(h);

    expect(h.calls).toHaveLength(0);
    expect(messages()[0].lines[0]).toMatchObject({
      kind: "failed",
      code: "OPT_002",
    });
  });

  it("an object turned during its search: search dropped, no line", async () => {
    h.setAutomatic(false);
    addObject(h, "a", tower(), -50);
    addObject(h, "b", tower(), 50);

    h.service.optimize(["a", "b"]);
    await Promise.resolve();
    await Promise.resolve();
    expect(h.calls).toHaveLength(1);

    TransformService.setRotation("a", "z", 30);
    expect(h.calls[0].signal.aborted).toBe(true);

    // b is searched next
    await vitestTick();
    expect(h.calls).toHaveLength(2);
    h.calls[1].resolve();
    await settle(h);

    expect(transformOf("a").rotation).toEqual({ x: 0, y: 0, z: 30 });
    expect(messages()[0].lines.map((line) => line.objectId)).toEqual(["b"]);
  });

  it("an object removed during its search: search dropped, no message", async () => {
    h.setAutomatic(false);
    addObject(h, "a", tower());

    h.service.optimize(["a"]);
    await vitestTick();
    useObjectStore.getState().removeObject("a");
    await settle(h);

    expect(h.calls[0].signal.aborted).toBe(true);
    expect(messages()).toEqual([]);
    expect(history().undoStack).toHaveLength(0);
  });

  it("an object turned after its search, before the end: not applied", async () => {
    h.setAutomatic(false);
    addObject(h, "a", tower(), -50);
    addObject(h, "b", tower(), 50);

    h.service.optimize(["a", "b"]);
    await vitestTick();
    h.calls[0].resolve();
    await vitestTick();
    expect(h.calls).toHaveLength(2);

    TransformService.setRotation("a", "z", 30);
    h.calls[1].resolve();
    await settle(h);

    expect(transformOf("a").rotation).toEqual({ x: 0, y: 0, z: 30 });
    expect(direction("b", [0, 0, 1])).toEqual([-1, 0, 0]);
    expect(messages()[0].lines.map((line) => line.objectId)).toEqual(["b"]);
  });

  it("never applied during a gesture: applied at its end", async () => {
    addObject(h, "tower", tower());
    h.setGesture(true);

    h.service.optimize(["tower"]);
    await vitestTick();
    await vitestTick();

    expect(direction("tower", [0, 0, 1])).toEqual([0, 0, 1]);
    expect(useOptimizationTaskStore.getState().running).toBe(true);

    h.setGesture(false);
    await settle(h);

    expect(direction("tower", [0, 0, 1])).toEqual([-1, 0, 0]);
    expect(useOptimizationTaskStore.getState().running).toBe(false);
  });

  it("one search at a time: running while it searches, a second request ignored", async () => {
    h.setAutomatic(false);
    addObject(h, "tower", tower());

    h.service.optimize(["tower"]);
    expect(useOptimizationTaskStore.getState().running).toBe(true);
    await vitestTick();

    h.service.optimize(["tower"]);
    await vitestTick();
    expect(h.calls).toHaveLength(1);

    h.calls[0].resolve();
    await settle(h);

    expect(useOptimizationTaskStore.getState().running).toBe(false);
    expect(history().undoStack).toHaveLength(1);
  });

  it("closing the message removes it", async () => {
    addObject(h, "cube", cube());

    h.service.optimize(["cube"]);
    await settle(h);
    h.service.dismiss(messages()[0].messageId);

    expect(messages()).toEqual([]);
  });
});

/** Lets the promises and timers run, without waiting for a search */
function vitestTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
