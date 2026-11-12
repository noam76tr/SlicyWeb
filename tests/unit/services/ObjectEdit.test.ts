/**
 * SlicyWeb
 * Object Edit Tests
 *
 * Edit > Delete and Edit > Duplicate (lot 100): the objects deleted leave
 * the scene with their analysis, their recommendation and their geometry
 * (Object Reference Rule 6), one action DELETE, undo puts them back as
 * they were (place in the list, analysis, triangles beyond 45 degrees),
 * redo deletes them again; a copy has a new objectId, the same file name,
 * no analysis (rule 7), its own geometry, is placed right of the group
 * (DUPLICATE_GAP_MM) and selected, one action DUPLICATE; undo takes the
 * copies out, redo puts them back with what they got since.
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (2.4.0)
 * - DATA_SCHEMA.md (Object Reference Rules 6 and 7)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { ObjectDuplicator } from "../../../src/object_manager/ObjectDuplicator";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import {
  DUPLICATE_GAP_MM,
  ObjectEditService,
} from "../../../src/services/ObjectEditService";
import { TransformService } from "../../../src/services/TransformService";
import { useAnalysisStore } from "../../../src/state/analysisStore";
import { useAnalysisTaskStore } from "../../../src/state/analysisTaskStore";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { useRecommendationStore } from "../../../src/state/recommendationStore";

import type { Analysis } from "../../../src/types/Analysis";
import type { Recommendation } from "../../../src/types/Recommendation";

/** Cube of 10 mm, local origin at its center (8 corners) */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [-5, 5]) {
      CUBE.push(x, y, z);
    }
  }
}

function addCube(id: string, x: number): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(CUBE), 3),
  );
  GeometryRegistry.set(id, geometry);

  const object = ObjectFactory.create(id, `${id}.stl`, "stl");
  object.geometry = {
    width: 10,
    depth: 10,
    height: 10,
    volume: 1000,
    surfaceArea: 600,
  };
  object.transform.position = { x, y: 3, z: 5 };
  useObjectStore.getState().addObject(object);
}

/** Analysis of an object (only the fields read here) */
function analysisOf(objectId: string): Analysis {
  return {
    analysisId: `analysis-${objectId}`,
    objectId,
    status: "generated",
    classification: { category: "figurine", source: "user" },
  } as unknown as Analysis;
}

function ids(): string[] {
  return useObjectStore.getState().objects.map((object) => object.objectId);
}

function find(objectId: string) {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId)!;
}

function history() {
  return useHistoryStore.getState();
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  useAnalysisStore.getState().clearAnalysis();
  useRecommendationStore.getState().clearRecommendations();
  for (const objectId of Object.keys(
    useAnalysisTaskStore.getState().overhangTriangles,
  )) {
    useAnalysisTaskStore.getState().forgetObject(objectId);
  }
  GeometryRegistry.clear();
  TransformService.clearHistory();

  addCube("a", -20);
  addCube("b", 0);
  addCube("c", 20);
});

describe("Delete", () => {
  it("removes the objects, their analysis, recommendation and geometry", () => {
    useAnalysisStore.getState().setAnalysis(analysisOf("b"));
    useRecommendationStore.getState().setRecommendation({
      objectId: "b",
    } as unknown as Recommendation);
    useObjectStore.getState().selectObjects(["b", "c"]);

    expect(ObjectEditService.remove(["b"])).toBe(true);

    expect(ids()).toEqual(["a", "c"]);
    expect(useAnalysisStore.getState().analysis.b).toBeUndefined();
    expect(useRecommendationStore.getState().recommendations.b).toBeUndefined();
    expect(GeometryRegistry.has("b")).toBe(false);
    expect(useObjectStore.getState().selectedObjectIds).toEqual(["c"]);
    expect(history().undoStack.map((entry) => entry.type)).toEqual(["DELETE"]);
  });

  it("puts the objects back as they were with undo, deletes again with redo", () => {
    const geometry = GeometryRegistry.get("b");
    const triangles = new Uint32Array([1, 2]);
    useAnalysisStore.getState().setAnalysis(analysisOf("b"));
    useAnalysisTaskStore.getState().setOverhangTriangles("b", triangles);
    useAnalysisTaskStore.getState().setOpenMesh("b", true);

    ObjectEditService.remove(["a", "b"]);
    expect(ids()).toEqual(["c"]);
    expect(useAnalysisTaskStore.getState().overhangTriangles.b).toBeUndefined();

    expect(TransformService.undo()).toBe(true);
    expect(ids()).toEqual(["a", "b", "c"]);
    expect(GeometryRegistry.get("b")).toBe(geometry);
    expect(useAnalysisStore.getState().analysis.b).toMatchObject({
      analysisId: "analysis-b",
      status: "generated",
      classification: { category: "figurine", source: "user" },
    });
    expect(useAnalysisStore.getState().analysis.a).toBeUndefined();
    expect(useAnalysisTaskStore.getState().overhangTriangles.b).toBe(triangles);
    expect(useAnalysisTaskStore.getState().openMeshObjectIds).toContain("b");
    expect(useObjectStore.getState().selectedObjectIds.sort()).toEqual([
      "a",
      "b",
    ]);

    expect(TransformService.redo()).toBe(true);
    expect(ids()).toEqual(["c"]);
    expect(TransformService.undo()).toBe(true);
    expect(ids()).toEqual(["a", "b", "c"]);
  });

  it("undoes a move made before the deletion, after the undo of the deletion", () => {
    TransformService.setPosition("b", "x", 50);
    ObjectEditService.remove(["b"]);

    TransformService.undo();
    expect(find("b").transform.position.x).toBe(50);
    TransformService.undo();
    expect(find("b").transform.position.x).toBe(0);
  });

  it("does nothing during a gesture or for an unknown object", () => {
    TransformService.beginGesture(["b"]);
    expect(ObjectEditService.remove(["b"])).toBe(false);
    TransformService.endGesture();

    expect(ObjectEditService.remove(["unknown"])).toBe(false);
    expect(ObjectEditService.remove([])).toBe(false);
    expect(ids()).toEqual(["a", "b", "c"]);
    expect(history().undoStack).toHaveLength(0);
  });
});

describe("Duplicate", () => {
  it("copies one object to its right, without analysis, and selects it", () => {
    useAnalysisStore.getState().setAnalysis(analysisOf("b"));

    const [copyId] = ObjectEditService.duplicate(["b"]);
    const copy = find(copyId);

    expect(copyId).not.toBe("b");
    expect(ids()).toEqual(["a", "b", "c", copyId]);
    expect(copy.fileName).toBe("b.stl");
    expect(copy.transform.position).toEqual({
      x: 10 + DUPLICATE_GAP_MM,
      y: 3,
      z: 5,
    });
    expect(useAnalysisStore.getState().analysis[copyId]).toBeUndefined();
    expect(useObjectStore.getState().selectedObjectIds).toEqual([copyId]);
    expect(history().undoStack.map((entry) => entry.type)).toEqual([
      "DUPLICATE",
    ]);

    // Its own geometry, with the same triangles
    const geometry = GeometryRegistry.get(copyId)!;
    expect(geometry).not.toBe(GeometryRegistry.get("b"));
    expect(Array.from(geometry.getAttribute("position").array)).toEqual(CUBE);
  });

  it("copies a group as a block right of the group", () => {
    const copies = ObjectEditService.duplicate(["c", "a"]);
    const shift = 50 + DUPLICATE_GAP_MM;

    expect(copies.map((id) => find(id).fileName)).toEqual(["a.stl", "c.stl"]);
    expect(find(copies[0]).transform.position.x).toBe(-20 + shift);
    expect(find(copies[1]).transform.position.x).toBe(20 + shift);
    expect(useObjectStore.getState().selectedObjectIds).toEqual(copies);
    expect(history().undoStack).toHaveLength(1);
  });

  it("takes the copies out with undo, puts them back with redo", () => {
    const [copyId] = ObjectEditService.duplicate(["b"]);
    // Analyzed after the copy
    useAnalysisStore.getState().setAnalysis(analysisOf(copyId));

    expect(TransformService.undo()).toBe(true);
    expect(ids()).toEqual(["a", "b", "c"]);
    expect(GeometryRegistry.has(copyId)).toBe(false);
    expect(useAnalysisStore.getState().analysis[copyId]).toBeUndefined();

    expect(TransformService.redo()).toBe(true);
    expect(ids()).toEqual(["a", "b", "c", copyId]);
    expect(useAnalysisStore.getState().analysis[copyId]?.analysisId).toBe(
      `analysis-${copyId}`,
    );
    expect(useObjectStore.getState().selectedObjectIds).toEqual([copyId]);
  });

  it("keeps the copy when the original is deleted", () => {
    const [copyId] = ObjectEditService.duplicate(["b"]);
    ObjectEditService.remove(["b"]);

    expect(ids()).toEqual(["a", "c", copyId]);
    expect(GeometryRegistry.get(copyId)?.getAttribute("position").count).toBe(
      8,
    );
  });

  it("clears the redo stack with a new action", () => {
    ObjectEditService.duplicate(["a"]);
    TransformService.undo();
    expect(history().redoStack).toHaveLength(1);

    ObjectEditService.remove(["c"]);
    expect(history().redoStack).toHaveLength(0);
  });

  it("does nothing during a gesture or without an object", () => {
    TransformService.beginGesture(["b"]);
    expect(ObjectEditService.duplicate(["b"])).toEqual([]);
    TransformService.endGesture();

    expect(ObjectEditService.duplicate([])).toEqual([]);
    expect(ids()).toEqual(["a", "b", "c"]);
  });
});

describe("ObjectDuplicator", () => {
  it("keeps the file name and gives a new objectId (rule 7)", () => {
    const original = ObjectFactory.create("x", "cube.stl", "stl");
    const copy = new ObjectDuplicator().duplicate(original);

    expect(copy.objectId).not.toBe("x");
    expect(copy.fileName).toBe("cube.stl");
    expect(copy.transform).toEqual(original.transform);
    expect(copy.transform).not.toBe(original.transform);
  });
});
