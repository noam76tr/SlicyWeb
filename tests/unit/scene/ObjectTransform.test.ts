/**
 * SlicyWeb
 * Object Transform Tests
 *
 * Transform Rules of DATA_SCHEMA.md (ADR-031): degrees, right-hand rule,
 * rotations around the plate axes X then Y then Z, scale along the axes
 * of the object, placement on the plate, 3MF export transform.
 *
 * Based on:
 * - DATA_SCHEMA.md (Transform Schema, Transform Rules)
 * - DECISIONS.md (ADR-031)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  lowestPoint,
  objectMatrix,
  placeOnPlate,
  toThreeMfTransform,
} from "../../../src/scene/ObjectTransform";
import type { Transform } from "../../../src/types/Object3D";

/** Cube of 10 mm with its local origin at its center (DATA_SCHEMA.md 3.4.0) */
const CUBE: number[] = [];
for (const x of [-5, 5]) {
  for (const y of [-5, 5]) {
    for (const z of [-5, 5]) {
      CUBE.push(x, y, z);
    }
  }
}

function transform(
  rotation: Partial<Transform["rotation"]> = {},
  scale: Partial<Transform["scale"]> = {},
  position: Partial<Transform["position"]> = {},
): Transform {
  return {
    position: { x: 0, y: 0, z: 0, ...position },
    rotation: { x: 0, y: 0, z: 0, ...rotation },
    scale: { x: 1, y: 1, z: 1, ...scale },
  };
}

/** Point of the object, on the plate */
function apply(t: Transform, x: number, y: number, z: number): number[] {
  return new THREE.Vector3(x, y, z).applyMatrix4(objectMatrix(t)).toArray();
}

/** Size of the object on the plate along X, Y, Z */
function size(t: Transform, positions: number[]): number[] {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < positions.length; i += 3) {
    const p = apply(t, positions[i], positions[i + 1], positions[i + 2]);

    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], p[axis]);
      max[axis] = Math.max(max[axis], p[axis]);
    }
  }

  return max.map((value, axis) => value - min[axis]);
}

function expectClose(actual: number[], expected: number[]): void {
  expect(actual.length).toBe(expected.length);
  actual.forEach((value, index) => {
    expect(value).toBeCloseTo(expected[index], 6);
  });
}

describe("ObjectTransform (ADR-031)", () => {
  it("cube stretched to 200 % along X, then turned +90° around Z, is long along Y", () => {
    expectClose(size(transform({ z: 90 }, { x: 2 }), CUBE), [10, 20, 10]);
  });

  it("rotation in degrees, right-hand rule: +90° around Z turns X onto Y", () => {
    expectClose(apply(transform({ z: 90 }), 1, 0, 0), [0, 1, 0]);
    expectClose(apply(transform({ z: 180 }), 1, 0, 0), [-1, 0, 0]);
    expectClose(apply(transform({ x: 90 }), 0, 1, 0), [0, 0, 1]);
  });

  it("rotations around the plate axes: first X, then Y, then Z", () => {
    // X first: (1, 0, 0) stays; then Z: (0, 1, 0)
    expectClose(apply(transform({ x: 90, z: 90 }), 1, 0, 0), [0, 1, 0]);
    // X first: (0, 1, 0) goes to (0, 0, 1); then Z leaves it
    expectClose(apply(transform({ x: 90, z: 90 }), 0, 1, 0), [0, 0, 1]);
  });

  it("scale along the axes of the object, then rotation, then position", () => {
    expectClose(
      apply(transform({ z: 90 }, { x: 2 }, { x: 100, y: 50, z: 0 }), 1, 0, 0),
      [100, 52, 0],
    );
  });

  it("places the object back on the plate after a rotation", () => {
    // Turned 90° around its center: lowest point at Z = -5, center placed at Z = 5
    const turned = transform({ x: 90 });
    expect(lowestPoint(turned, CUBE)).toBeCloseTo(-5, 6);

    const placed = placeOnPlate(turned, CUBE);
    expect(placed.position.z).toBeCloseTo(5, 6);
    expect(lowestPoint(placed, CUBE)).toBeCloseTo(0, 6);
    expect(placed.rotation).toEqual(turned.rotation);
  });

  it("places the object back on the plate after a change of scale", () => {
    // Stretched to 200 % along Z: from Z = -10 to 10 around its center
    const placed = placeOnPlate(transform({}, { z: 2 }, { z: 7 }), CUBE);
    expect(placed.position.z).toBeCloseTo(10, 6);
  });

  it("3MF transform: (R · S) transposed, position plus the printer origin offset", () => {
    expectClose(
      toThreeMfTransform(transform({}, {}, { x: 10, y: 20 }), {
        x: 128,
        y: 128,
        z: 0,
      }),
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 138, 148, 0],
    );

    // Row vectors (3MF): the first row is the image of the X axis
    const m = toThreeMfTransform(transform({ z: 90 }, { x: 2 }));
    expectClose(m, [0, 2, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0]);

    // p · M (3MF) equals the point given by objectMatrix
    const t = transform(
      { x: 30, y: -45, z: 60 },
      { x: 1.5, y: 0.5, z: 2 },
      { x: 3, y: -4, z: 5 },
    );
    const r = toThreeMfTransform(t);
    const [x, y, z] = [7, -2, 9];
    expectClose(
      [
        x * r[0] + y * r[3] + z * r[6] + r[9],
        x * r[1] + y * r[4] + z * r[7] + r[10],
        x * r[2] + y * r[5] + z * r[8] + r[11],
      ],
      apply(t, x, y, z),
    );
  });
});
