/**
 * SlicyWeb
 * Scale Gizmo Tests
 *
 * Handles of the Scale mode (lot 103, decisions of Noam Q4 A and Q5 B):
 * one handle per axis of the object, to the right (+X), the front (-Y)
 * and the top (+Z) of the plate, also when the object is turned; the
 * handle beside the object, never on it; only the handle can be grabbed.
 *
 * Based on:
 * - GUI_SPEC.md (Scale Gizmo)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  SCALE_HANDLE_GAP_PX,
  SCALE_HANDLE_GRAB_MARGIN_PX,
  SCALE_HANDLE_SIZE_PX,
  SCALE_MIN_FACTOR,
} from "../../../src/constants/ViewportConstants";
import {
  hitScaleHandle,
  placeScaleHandles,
  scaleFactor,
  scaleHandleSides,
  type ScaleHandle,
} from "../../../src/renderer/ScaleGizmo";

import type { Bounds } from "../../../src/scene/ObjectTransform";

const WIDTH = 800;
const HEIGHT = 600;

/** Cube of 20 mm standing on the plate, its center at Z = 10 */
const CUBE: Bounds = {
  min: { x: -10, y: -10, z: 0 },
  max: { x: 10, y: 10, z: 20 },
};
const CENTER = { x: 0, y: 0, z: 10 };

/** Isometric perspective camera: front right, above */
function isometric(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.5, 50000);
  camera.up.set(0, 0, 1);
  camera.position.set(200, -200, 180);
  camera.lookAt(0, 0, 10);
  camera.updateMatrixWorld();
  return camera;
}

/** Rotation of an object, in degrees (order of the project: ZYX) */
function turned(x: number, y: number, z: number): THREE.Quaternion {
  const rad = THREE.MathUtils.degToRad;
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(rad(x), rad(y), rad(z), "ZYX"),
  );
}

function handle(handles: ScaleHandle[], axis: "X" | "Y" | "Z"): ScaleHandle {
  const found = handles.find((item) => item.axis === axis);
  expect(found).toBeDefined();
  return found as ScaleHandle;
}

/** Middle of the handle in the scene */
function middle(item: ScaleHandle): THREE.Vector3 {
  return item.base.clone().lerp(item.apex, 0.5);
}

describe("scaleHandleSides", () => {
  it("keeps right, front, top on an object not turned", () => {
    expect(scaleHandleSides(new THREE.Quaternion())).toEqual({
      X: 1,
      Y: -1,
      Z: 1,
    });
  });

  it("turns the sides back after half a turn around X or Y", () => {
    expect(scaleHandleSides(turned(180, 0, 0))).toEqual({ X: 1, Y: 1, Z: -1 });
    expect(scaleHandleSides(turned(0, 180, 0))).toEqual({
      X: -1,
      Y: -1,
      Z: -1,
    });
  });
});

describe("placeScaleHandles", () => {
  const cases: [string, THREE.Quaternion][] = [
    ["not turned", new THREE.Quaternion()],
    ["X = 180", turned(180, 0, 0)],
    ["Y = 180", turned(0, 180, 0)],
    ["Z = 90", turned(0, 0, 90)],
    ["Z = 180", turned(0, 0, 180)],
  ];

  for (const [name, quaternion] of cases) {
    it(`puts the handle Z above the center, X on the right, Y in front (${name})`, () => {
      const handles = placeScaleHandles(
        isometric(),
        CENTER,
        quaternion,
        CUBE,
        WIDTH,
        HEIGHT,
      );

      // Above the center of the object, beside its top
      expect(middle(handle(handles, "Z")).z).toBeGreaterThan(CENTER.z + 10);
      // The handles on the plate axes the object axes fall on
      const right = name === "Z = 90" ? "Y" : "X";
      const front = name === "Z = 90" ? "X" : "Y";
      expect(middle(handle(handles, right)).x).toBeGreaterThan(10);
      expect(middle(handle(handles, front)).y).toBeLessThan(-10);
    });
  }

  it("puts the handle Y (green) on top after a rotation X = 90", () => {
    const handles = placeScaleHandles(
      isometric(),
      CENTER,
      turned(90, 0, 0),
      CUBE,
      WIDTH,
      HEIGHT,
    );

    expect(middle(handle(handles, "Y")).z).toBeGreaterThan(CENTER.z + 10);
    expect(middle(handle(handles, "Z")).y).toBeLessThan(-10);
    expect(middle(handle(handles, "X")).x).toBeGreaterThan(10);
  });

  it("places each handle beside the box, never on it, the same size at every zoom", () => {
    for (const distance of [1, 4]) {
      const camera = new THREE.PerspectiveCamera(
        45,
        WIDTH / HEIGHT,
        0.5,
        50000,
      );
      camera.up.set(0, 0, 1);
      camera.position.set(200 * distance, -200 * distance, 180 * distance);
      camera.lookAt(0, 0, 10);
      camera.updateMatrixWorld();

      const handles = placeScaleHandles(
        camera,
        CENTER,
        new THREE.Quaternion(),
        CUBE,
        WIDTH,
        HEIGHT,
      );

      expect(handles).toHaveLength(3);

      for (const item of handles) {
        const length = Math.hypot(
          item.screenApex[0] - item.screenBase[0],
          item.screenApex[1] - item.screenBase[1],
        );
        expect(length).toBeCloseTo(SCALE_HANDLE_SIZE_PX, 0);

        // The base is out of the box: farther from the center than a gap
        const box = new THREE.Box3(
          new THREE.Vector3(-10, -10, 0),
          new THREE.Vector3(10, 10, 20),
        );
        expect(box.containsPoint(item.base)).toBe(false);
        expect(SCALE_HANDLE_GAP_PX).toBeGreaterThan(0);
      }
    }
  });

  it("hides a handle along the direction of the camera (top view: no Z)", () => {
    const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.5, 50000);
    camera.position.set(0, 0, 300);
    camera.lookAt(0, 0, 10);
    camera.updateMatrixWorld();

    const handles = placeScaleHandles(
      camera,
      CENTER,
      new THREE.Quaternion(),
      CUBE,
      WIDTH,
      HEIGHT,
    );

    expect(handles.map((item) => item.axis).sort()).toEqual(["X", "Y"]);
  });
});

describe("hitScaleHandle", () => {
  it("grabs the handle only, not the line nor the center", () => {
    const handles = placeScaleHandles(
      isometric(),
      CENTER,
      new THREE.Quaternion(),
      CUBE,
      WIDTH,
      HEIGHT,
    );
    const z = handle(handles, "Z");
    const onHandle: [number, number] = [
      (z.screenBase[0] + z.screenApex[0]) / 2,
      (z.screenBase[1] + z.screenApex[1]) / 2,
    ];
    const center = new THREE.Vector3(0, 0, 10).project(isometric());
    const onCenter: [number, number] = [
      ((center.x + 1) / 2) * WIDTH,
      ((1 - center.y) / 2) * HEIGHT,
    ];

    expect(hitScaleHandle(handles, onHandle)).toBe("Z");
    expect(
      hitScaleHandle(handles, [
        onHandle[0] +
          SCALE_HANDLE_SIZE_PX / 2 +
          SCALE_HANDLE_GRAB_MARGIN_PX +
          2,
        onHandle[1],
      ]),
    ).toBeNull();
    expect(hitScaleHandle(handles, onCenter)).toBeNull();
  });
});

describe("scaleFactor", () => {
  it("is the ratio of the distances along the handle, never below the minimum", () => {
    expect(scaleFactor(30, 20)).toBeCloseTo(1.5);
    expect(scaleFactor(10, 20)).toBeCloseTo(0.5);
    expect(scaleFactor(-5, 20)).toBe(SCALE_MIN_FACTOR);
    expect(scaleFactor(10, 0)).toBe(1);
  });
});
