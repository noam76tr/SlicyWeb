/**
 * SlicyWeb
 * Undo Redo Tests
 *
 * History of the transform changes (UNDO_REDO_SPEC.md; decisions of Noam,
 * Phase 6): one action per change, one action per gesture, redo cleared
 * by a new action, 50 actions at most, the object changed is selected,
 * a failed restoration keeps the scene; Ctrl+Z in a field with nothing
 * pending, then leaving the field, adds no action.
 *
 * Based on:
 * - UNDO_REDO_SPEC.md
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { MAX_HISTORY_SIZE } from "../../../src/constants/HistoryConstants";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { TransformService } from "../../../src/services/TransformService";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";

import type { Object3D } from "../../../src/types/Object3D";

const ID = "cube";

/** Cube of 10 mm, local origin at its center */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [-5, 5]) {
      CUBE.push(x, y, z);
    }
  }
}

function cube(): Object3D {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === ID) as Object3D;
}

function undoCount(): number {
  return useHistoryStore.getState().undoStack.length;
}

function redoCount(): number {
  return useHistoryStore.getState().redoStack.length;
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  TransformService.clearHistory();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(CUBE), 3),
  );
  GeometryRegistry.set(ID, geometry);

  const object = ObjectFactory.create(ID, "cube.stl", "stl");
  object.geometry = {
    width: 10,
    depth: 10,
    height: 10,
    volume: 1000,
    surfaceArea: 600,
  };
  useObjectStore.getState().addObject(object);
  // Standing on the plate, as after an import
  TransformService.apply(ID, object.transform);
  TransformService.clearHistory();
});

describe("Undo and redo", () => {
  it("undoes and redoes a change, and selects the object changed", () => {
    TransformService.setPosition(ID, "x", 30);
    expect(undoCount()).toBe(1);
    expect(useHistoryStore.getState().undoStack[0].type).toBe("MOVE");

    useObjectStore.getState().selectObject(null);
    expect(TransformService.undo()).toBe(true);
    expect(cube().transform.position.x).toBe(0);
    expect(useObjectStore.getState().selectedObjectId).toBe(ID);
    expect(redoCount()).toBe(1);

    expect(TransformService.redo()).toBe(true);
    expect(cube().transform.position.x).toBe(30);
    expect(undoCount()).toBe(1);
    expect(redoCount()).toBe(0);
  });

  it("records the type of the action and restores Z with the rotation", () => {
    TransformService.setRotation(ID, "x", 45);
    TransformService.setScale(ID, "x", 2, false);
    const types = useHistoryStore.getState().undoStack.map((e) => e.type);
    expect(types).toEqual(["ROTATE", "SCALE"]);

    TransformService.undo();
    TransformService.undo();
    expect(cube().transform.rotation.x).toBe(0);
    expect(cube().transform.scale.x).toBe(1);
    expect(cube().transform.position.z).toBeCloseTo(5, 6);
  });

  it("records a gesture (drag, gizmo) as one action", () => {
    TransformService.beginGesture([ID]);
    for (const x of [5, 10, 15, 20]) {
      TransformService.apply(ID, {
        ...cube().transform,
        position: { ...cube().transform.position, x },
      });
    }
    // Rotation with the gizmo: live steps, then the end placed on the plate
    TransformService.apply(
      ID,
      { ...cube().transform, rotation: { x: 30, y: 0, z: 0 } },
      { live: true },
    );
    TransformService.apply(ID, cube().transform);
    TransformService.endGesture();

    expect(undoCount()).toBe(1);
    TransformService.undo();
    expect(cube().transform.position.x).toBe(0);
    expect(cube().transform.rotation.x).toBe(0);
    expect(cube().transform.position.z).toBeCloseTo(5, 6);
  });

  it("records nothing when nothing changes", () => {
    TransformService.beginGesture([ID]);
    TransformService.endGesture();
    TransformService.setPosition(ID, "x", 0);
    expect(undoCount()).toBe(0);
    expect(TransformService.undo()).toBe(false);
    expect(TransformService.redo()).toBe(false);
  });

  it("clears the redo history when a new action is done", () => {
    TransformService.setPosition(ID, "x", 10);
    TransformService.setPosition(ID, "x", 20);
    TransformService.undo();
    expect(redoCount()).toBe(1);

    TransformService.setPosition(ID, "y", 5);
    expect(redoCount()).toBe(0);
    expect(undoCount()).toBe(2);
  });

  it("keeps the last 50 actions", () => {
    expect(MAX_HISTORY_SIZE).toBe(50);

    for (let step = 1; step <= 55; step += 1) {
      TransformService.setPosition(ID, "x", step);
    }
    expect(undoCount()).toBe(50);

    while (TransformService.undo()) {
      // undo all
    }
    // The 5 oldest actions are dropped: back to X = 5, not 0
    expect(cube().transform.position.x).toBe(5);
  });

  it("adds no action when a field is left after an undo", () => {
    // Scale X typed 50 % and applied, then Ctrl+Z in the field (nothing
    // pending): undo of the application; the field shows 100 again
    TransformService.setScale(ID, "x", 0.5, true);
    expect(TransformService.undo()).toBe(true);
    expect(cube().transform.scale.x).toBe(1);

    // Leaving the field applies the value shown: same value, no action
    TransformService.setScale(ID, "x", 1, true);
    expect(undoCount()).toBe(0);
    expect(redoCount()).toBe(1);
  });

  it("keeps the scene when the object no longer exists", () => {
    TransformService.setPosition(ID, "x", 10);
    useObjectStore.getState().removeObject(ID);

    expect(TransformService.undo()).toBe(false);
    expect(undoCount()).toBe(0);
    expect(redoCount()).toBe(0);
    expect(useObjectStore.getState().objects).toEqual([]);
  });
});
