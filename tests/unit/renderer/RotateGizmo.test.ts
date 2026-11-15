/**
 * SlicyWeb
 * Rotate Gizmo Tests
 *
 * Rings of the Rotate mode (lot 103, decisions of Noam Q1 to Q3 A): one
 * full ring per axis of the plate, around the object (farthest corner of
 * its box plus a gap, at least a minimum radius on the screen); the ring
 * is grabbed on its line, with a margin; the angle follows the pointer in
 * the plane of the ring, by steps of 15 degrees with Shift.
 *
 * Based on:
 * - GUI_SPEC.md (Rotate Gizmo)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  ROTATE_RING_GAP_PX,
  ROTATE_RING_GRAB_MARGIN_PX,
  ROTATE_RING_MIN_RADIUS_PX,
  ROTATE_RING_WIDTH_PX,
} from "../../../src/constants/ViewportConstants";
import {
  hitRotateRing,
  placeRotateRings,
  ringAngle,
  ringPoint,
  ringRadius,
  snapAngle,
} from "../../../src/renderer/RotateGizmo";

import type { Bounds } from "../../../src/scene/ObjectTransform";

const WIDTH = 800;
const HEIGHT = 600;

/** Cube of side mm standing on the plate, centered on the origin */
function cube(side: number): Bounds {
  return {
    min: { x: -side / 2, y: -side / 2, z: 0 },
    max: { x: side / 2, y: side / 2, z: side },
  };
}

/** Camera seen from above: 1 mm = 2 pixels */
function topCamera(): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(
    -WIDTH / 4,
    WIDTH / 4,
    HEIGHT / 4,
    -HEIGHT / 4,
    1,
    1000,
  );
  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

describe("ringRadius", () => {
  it("is the farthest corner of the box plus the gap", () => {
    const side = 100;
    const center = { x: 0, y: 0, z: side / 2 };
    const farthest = Math.sqrt(3) * (side / 2);

    // Top view: 0.5 mm per pixel
    expect(ringRadius(topCamera(), center, cube(side), HEIGHT)).toBeCloseTo(
      farthest + ROTATE_RING_GAP_PX * 0.5,
      5,
    );
  });

  it("is at least the minimum radius on the screen for a small object", () => {
    const center = { x: 0, y: 0, z: 1 };

    expect(ringRadius(topCamera(), center, cube(2), HEIGHT)).toBeCloseTo(
      ROTATE_RING_MIN_RADIUS_PX * 0.5,
      5,
    );
  });
});

describe("placeRotateRings", () => {
  it("places three closed rings around the center, outside the box", () => {
    const side = 40;
    const center = { x: 0, y: 0, z: side / 2 };
    const rings = placeRotateRings(
      topCamera(),
      center,
      cube(side),
      WIDTH,
      HEIGHT,
    );

    expect(rings.map((ring) => ring.axis)).toEqual(["X", "Y", "Z"]);

    for (const ring of rings) {
      expect(ring.points[0]).toEqual(ring.points[ring.points.length - 1]);
      // Every point of the ring is outside the box (in 3D)
      const box = new THREE.Box3(
        new THREE.Vector3(-side / 2, -side / 2, 0),
        new THREE.Vector3(side / 2, side / 2, side),
      );

      for (let i = 0; i < 16; i += 1) {
        const point = ringPoint(
          ring.axis,
          ring.center,
          ring.radius,
          (i / 16) * Math.PI * 2,
        );
        expect(box.containsPoint(point)).toBe(false);
      }
    }
  });
});

describe("hitRotateRing", () => {
  it("grabs the line of a ring with its margin, not the inside", () => {
    const side = 40;
    const rings = placeRotateRings(
      topCamera(),
      { x: 0, y: 0, z: side / 2 },
      cube(side),
      WIDTH,
      HEIGHT,
    );
    const z = rings.find((ring) => ring.axis === "Z");
    expect(z).toBeDefined();

    // Top view: the ring Z is a circle around the center of the screen
    const radiusPx = (z?.radius ?? 0) * 2;
    const limit = ROTATE_RING_WIDTH_PX / 2 + ROTATE_RING_GRAB_MARGIN_PX;

    // At 45 degrees: away from the rings X and Y, seen edge on
    const at = (distance: number): [number, number] => [
      400 + distance * Math.SQRT1_2,
      300 - distance * Math.SQRT1_2,
    ];

    expect(hitRotateRing(rings, at(radiusPx))?.axis).toBe("Z");
    expect(hitRotateRing(rings, at(radiusPx + limit - 1))?.axis).toBe("Z");
    expect(hitRotateRing(rings, at(radiusPx + limit + 2))).toBeNull();
    expect(hitRotateRing(rings, at(radiusPx / 2))).toBeNull();
  });
});

describe("ringAngle and snapAngle", () => {
  it("follows the pointer around the axis of the ring", () => {
    const center = new THREE.Vector3(0, 0, 10);
    const down = new THREE.Vector3(0, 0, -1);
    const ray = (x: number, y: number) =>
      new THREE.Ray(new THREE.Vector3(x, y, 100), down);

    // Ring Z: angle 0 toward +X, 90 degrees toward +Y
    expect(ringAngle(ray(10, 0), center, "Z")).toBeCloseTo(0);
    expect(ringAngle(ray(0, 10), center, "Z")).toBeCloseTo(Math.PI / 2);
    // A ray parallel to the plane of the ring
    expect(
      ringAngle(new THREE.Ray(new THREE.Vector3(5, 0, 100), down), center, "X"),
    ).toBeNull();
  });

  it("turns by steps of 15 degrees with Shift", () => {
    const deg = THREE.MathUtils.degToRad;

    expect(snapAngle(deg(22), true)).toBeCloseTo(deg(15));
    expect(snapAngle(deg(23), true)).toBeCloseTo(deg(30));
    expect(snapAngle(deg(22), false)).toBeCloseTo(deg(22));
  });
});
