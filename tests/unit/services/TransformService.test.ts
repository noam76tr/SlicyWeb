/**
 * SlicyWeb
 * Transform Service Tests
 *
 * Single entry point of the transform changes (Phase 6): the object always
 * stands on the plate, scale with and without the lock, size in mm,
 * Center On Bed, Reset actions, refused values.
 *
 * Based on:
 * - DATA_SCHEMA.md (Transform Rules)
 * - GUI_SPEC.md (Transform Section, Transform Actions)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";
import { worldBounds } from "../../../src/scene/ObjectTransform";
import {
  scaleWithAxis,
  TransformService,
} from "../../../src/services/TransformService";
import { useObjectStore } from "../../../src/state/objectStore";

import type { Object3D } from "../../../src/types/Object3D";

const ID = "cube";

/** Cube of 10 mm, local origin at the center of its base (as imported) */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [0, 10]) {
      CUBE.push(x, y, z);
    }
  }
}

function cube(): Object3D {
  const store = useObjectStore.getState();
  return store.objects.find((object) => object.objectId === ID) as Object3D;
}

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  GeometryRegistry.clear();

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
});

describe("TransformService", () => {
  it("keeps the object on the plate: Z is always computed", () => {
    expect(
      TransformService.apply(ID, {
        ...cube().transform,
        position: { x: 0, y: 0, z: 50 },
      }),
    ).toBe(true);
    expect(cube().transform.position.z).toBeCloseTo(0, 6);

    // Turned 90° around X, the cube would go down to Z = -5
    TransformService.setRotation(ID, "x", 90);
    expect(cube().transform.rotation.x).toBe(90);
    expect(cube().transform.position.z).toBeCloseTo(5, 6);
  });

  it("moves along X and Y", () => {
    TransformService.setPosition(ID, "x", 30);
    TransformService.setPosition(ID, "y", -12.5);
    expect(cube().transform.position).toEqual({ x: 30, y: -12.5, z: 0 });
  });

  it("scales with the lock (proportions kept) and without it", () => {
    TransformService.setScale(ID, "x", 2, true);
    expect(cube().transform.scale).toEqual({ x: 2, y: 2, z: 2 });

    TransformService.setScale(ID, "z", 0.5, false);
    expect(cube().transform.scale).toEqual({ x: 2, y: 2, z: 0.5 });

    // Lock on a non-uniform scale: the ratio is applied to the three axes
    expect(scaleWithAxis({ x: 2, y: 2, z: 0.5 }, "x", 4, true)).toEqual({
      x: 4,
      y: 4,
      z: 1,
    });
  });

  it("changes the scale from a size in mm", () => {
    TransformService.setSize(ID, "x", 30, true);
    expect(cube().transform.scale.x).toBeCloseTo(3, 6);
    expect(cube().transform.scale.z).toBeCloseTo(3, 6);
    expect(TransformService.size(cube()).y).toBeCloseTo(30, 6);

    TransformService.setSize(ID, "z", 15, false);
    expect(TransformService.size(cube())).toEqual({ x: 30, y: 30, z: 15 });
  });

  it("centers the bounding box on the bed", () => {
    // Stretched along X, turned 45°, moved away
    TransformService.setScale(ID, "x", 3, false);
    TransformService.setRotation(ID, "z", 45);
    TransformService.setPosition(ID, "x", 80);
    TransformService.setPosition(ID, "y", 40);
    expect(TransformService.centerOnBed(ID)).toBe(true);

    const { min, max } = worldBounds(cube().transform, CUBE);
    expect((min.x + max.x) / 2).toBeCloseTo(0, 6);
    expect((min.y + max.y) / 2).toBeCloseTo(0, 6);
    expect(min.z).toBeCloseTo(0, 6);
  });

  it("resets position, rotation and scale", () => {
    TransformService.setPosition(ID, "x", 20);
    TransformService.setRotation(ID, "y", 30);
    TransformService.setScale(ID, "x", 2, true);

    TransformService.resetPosition(ID);
    expect(cube().transform.position.x).toBe(0);

    TransformService.resetRotation(ID);
    expect(cube().transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
    expect(cube().transform.position.z).toBeCloseTo(0, 6);

    TransformService.resetScale(ID);
    expect(cube().transform.scale).toEqual({ x: 1, y: 1, z: 1 });
  });

  it("refuses values that are not finite and scales of 0.1 % or less", () => {
    const before = cube().transform;

    expect(TransformService.setScale(ID, "x", 0, true)).toBe(false);
    expect(TransformService.setScale(ID, "x", 0.0005, false)).toBe(false);
    expect(TransformService.setRotation(ID, "z", Number.NaN)).toBe(false);
    expect(TransformService.setPosition(ID, "x", Infinity)).toBe(false);
    expect(TransformService.setRotation("missing", "z", 10)).toBe(false);
    expect(cube().transform).toEqual(before);
  });
});
