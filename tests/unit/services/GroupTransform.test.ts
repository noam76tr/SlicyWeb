/**
 * SlicyWeb
 * Group Transform Tests
 *
 * Several objects selected (Phase 6, decisions of Noam): Ctrl+click and
 * Ctrl+A selection; the group moves, turns and scales (uniformly) around
 * its center, each object placed back on the plate; one action of the
 * history for a change of the group.
 *
 * Based on:
 * - GUI_SPEC.md (Multi Selection, Transform Section)
 * - UNDO_REDO_SPEC.md (Multiple Object Transformations)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { worldBounds } from "../../../src/scene/ObjectTransform";
import { TransformService } from "../../../src/services/TransformService";
import { useHistoryStore } from "../../../src/state/historyStore";
import { useObjectStore } from "../../../src/state/objectStore";

import type { Object3D } from "../../../src/types/Object3D";

/** Cube of 10 mm, local origin at its center */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [-5, 5]) {
      CUBE.push(x, y, z);
    }
  }
}

const A = "a";
const B = "b";
const GROUP = [A, B];

function get(objectId: string): Object3D {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId) as Object3D;
}

function addCube(objectId: string, x: number): void {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(CUBE), 3),
  );
  GeometryRegistry.set(objectId, geometry);

  const object = ObjectFactory.create(objectId, `${objectId}.stl`, "stl");
  object.geometry = {
    width: 10,
    depth: 10,
    height: 10,
    volume: 1000,
    surfaceArea: 600,
  };
  object.transform = {
    ...object.transform,
    position: { x, y: 0, z: 5 },
  };
  useObjectStore.getState().addObject(object);
}

function expectOnPlate(objectId: string): void {
  expect(worldBounds(get(objectId).transform, CUBE).min.z).toBeCloseTo(0, 6);
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();
  TransformService.clearHistory();

  // Two cubes of 10 mm at X = -20 and X = 20: group center (0, 0, 5)
  addCube(A, -20);
  addCube(B, 20);
});

describe("Selection of several objects", () => {
  it("Ctrl+click adds or removes, Ctrl+A selects all, one click selects one", () => {
    const store = useObjectStore.getState();

    store.selectObject(A);
    store.toggleObjectSelection(B);
    expect(useObjectStore.getState().selectedObjectIds).toEqual([A, B]);
    expect(useObjectStore.getState().selectedObjectId).toBe(B);

    store.toggleObjectSelection(A);
    expect(useObjectStore.getState().selectedObjectIds).toEqual([B]);

    store.selectObject(null);
    store.selectAllObjects();
    expect(useObjectStore.getState().selectedObjectIds).toEqual([A, B]);

    store.removeObject(B);
    expect(useObjectStore.getState().selectedObjectIds).toEqual([A]);
    expect(useObjectStore.getState().selectedObjectId).toBe(A);

    store.selectObject(null);
    expect(useObjectStore.getState().selectedObjectIds).toEqual([]);
  });
});

describe("Group transforms", () => {
  it("center and size of the group", () => {
    const info = TransformService.groupInfo(GROUP);
    expect(info?.center).toEqual({ x: 0, y: 0, z: 5 });
    expect(info?.size).toEqual({ x: 50, y: 10, z: 10 });
  });

  it("moves the group: its center to X = 50, one action", () => {
    expect(TransformService.moveGroup(GROUP, "x", 50)).toBe(true);
    expect(get(A).transform.position.x).toBe(30);
    expect(get(B).transform.position.x).toBe(70);
    expect(useHistoryStore.getState().undoStack.length).toBe(1);
  });

  it("turns the group 90° around Z around its center", () => {
    expect(TransformService.rotateGroup(GROUP, "z", 90)).toBe(true);

    // +90° around Z turns X onto Y: A goes to Y = -20, B to Y = 20
    expect(get(A).transform.position.x).toBeCloseTo(0, 6);
    expect(get(A).transform.position.y).toBeCloseTo(-20, 6);
    expect(get(B).transform.position.y).toBeCloseTo(20, 6);
    expect(get(A).transform.rotation.z).toBeCloseTo(90, 6);
    expect(get(B).transform.rotation.z).toBeCloseTo(90, 6);

    const info = TransformService.groupInfo(GROUP);
    expect(info?.center.x).toBeCloseTo(0, 6);
    expect(info?.center.y).toBeCloseTo(0, 6);
  });

  it("turns the group 90° around X: each object placed back on the plate", () => {
    TransformService.rotateGroup(GROUP, "x", 90);
    expect(get(A).transform.rotation.x).toBeCloseTo(90, 6);
    expectOnPlate(A);
    expectOnPlate(B);
    // Around the X axis: positions X and Y kept
    expect(get(A).transform.position.x).toBeCloseTo(-20, 6);
    expect(get(A).transform.position.y).toBeCloseTo(0, 6);
  });

  it("scales the group uniformly around its center", () => {
    expect(TransformService.scaleGroup(GROUP, 2)).toBe(true);
    expect(get(A).transform.scale).toEqual({ x: 2, y: 2, z: 2 });
    expect(get(A).transform.position.x).toBe(-40);
    expect(get(B).transform.position.x).toBe(40);
    expectOnPlate(A);
    expect(get(A).transform.position.z).toBeCloseTo(10, 6);

    // Size of the group along X: 50 -> 25 mm
    expect(TransformService.setGroupSize(GROUP, "x", 50)).toBe(true);
    expect(TransformService.groupInfo(GROUP)?.size.x).toBeCloseTo(50, 6);
    expect(get(A).transform.scale.x).toBeCloseTo(1, 6);
  });

  it("resets the rotation and the scale of each object", () => {
    TransformService.rotateGroup(GROUP, "z", 45);
    TransformService.scaleGroup(GROUP, 1.5);
    TransformService.resetGroupRotation(GROUP);
    TransformService.resetGroupScale(GROUP);
    expect(get(A).transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(get(B).transform.scale).toEqual({ x: 1, y: 1, z: 1 });
    expectOnPlate(B);
  });

  it("one undo for a change of the group, the group selected again", () => {
    TransformService.rotateGroup(GROUP, "z", 90);
    const entry = useHistoryStore.getState().undoStack[0];
    expect(Object.keys(entry.before)).toEqual(GROUP);
    expect(entry.type).toBe("ROTATE");

    useObjectStore.getState().selectObject(null);
    expect(TransformService.undo()).toBe(true);
    expect(get(A).transform.position).toEqual({ x: -20, y: 0, z: 5 });
    expect(get(B).transform.rotation.z).toBe(0);
    expect(useObjectStore.getState().selectedObjectIds).toEqual(GROUP);
  });

  it("a gesture on the group is one action", () => {
    TransformService.beginGesture(GROUP);
    for (const dx of [5, 10, 15]) {
      TransformService.applyMany({
        [A]: {
          ...get(A).transform,
          position: { ...get(A).transform.position, x: -20 + dx },
        },
        [B]: {
          ...get(B).transform,
          position: { ...get(B).transform.position, x: 20 + dx },
        },
      });
    }
    TransformService.endGesture();

    expect(useHistoryStore.getState().undoStack.length).toBe(1);
    TransformService.undo();
    expect(get(A).transform.position.x).toBe(-20);
    expect(get(B).transform.position.x).toBe(20);
  });

  it("refuses the whole change when one object is refused", () => {
    const before = get(A).transform;
    expect(
      TransformService.applyMany({
        [A]: { ...before, position: { ...before.position, x: 0 } },
        [B]: { ...get(B).transform, scale: { x: 0, y: 1, z: 1 } },
      }),
    ).toBe(false);
    expect(get(A).transform).toEqual(before);
    expect(TransformService.scaleGroup(GROUP, 0)).toBe(false);
  });
});
