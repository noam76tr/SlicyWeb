/**
 * SlicyWeb
 * Move Gizmo Tests
 *
 * Arrows of the Move mode (lot 102, decisions of Noam Q1 to Q3 A): one
 * arrow toward +X and one toward +Y, from the center of the object; the
 * tip beside the object, never on it, at the same size on the screen at
 * every zoom; only the tip can be grabbed; a drag of the tip follows the
 * axis.
 *
 * Based on:
 * - GUI_SPEC.md (Move Gizmo)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  MOVE_HANDLE_GAP_PX,
  MOVE_HANDLE_GRAB_MARGIN_PX,
  MOVE_HANDLE_TIP_LENGTH_PX,
  MOVE_HANDLE_TIP_RADIUS_PX,
} from "../../../src/constants/ViewportConstants";
import {
  axisParameter,
  hitMoveHandle,
  placeMoveHandles,
  type MoveHandle,
  type ScreenPoint,
} from "../../../src/renderer/MoveGizmo";

import type { Bounds } from "../../../src/scene/ObjectTransform";

const WIDTH = 800;
const HEIGHT = 600;

/** Cube of side mm, standing on the plate at (x, y) */
function cube(side: number, x = 0, y = 0): Bounds {
  return {
    min: { x: x - side / 2, y: y - side / 2, z: 0 },
    max: { x: x + side / 2, y: y + side / 2, z: side },
  };
}

function centerOf(bounds: Bounds) {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}

/** Perspective camera looking at the origin from a direction */
function perspective(
  position: [number, number, number],
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.5, 50000);
  camera.up.set(0, 0, 1);
  camera.position.set(...position);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
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

function toScreen(point: THREE.Vector3, camera: THREE.Camera): ScreenPoint {
  const p = point.clone().project(camera);
  return [((p.x + 1) / 2) * WIDTH, ((1 - p.y) / 2) * HEIGHT];
}

/** Outline of the box on the screen (its 8 corners) */
function screenCorners(bounds: Bounds, camera: THREE.Camera): ScreenPoint[] {
  const corners: ScreenPoint[] = [];
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        corners.push(toScreen(new THREE.Vector3(x, y, z), camera));
      }
    }
  }
  return corners;
}

/** True when a point is inside the convex outline of the points */
function insideOutline(point: ScreenPoint, points: ScreenPoint[]): boolean {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: ScreenPoint, a: ScreenPoint, b: ScreenPoint) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: ScreenPoint[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: ScreenPoint[] = [];
  for (const p of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  return hull.every(
    (a, i) => cross(a, hull[(i + 1) % hull.length], point) >= -1e-6,
  );
}

function distance(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function handle(handles: MoveHandle[], axis: "X" | "Y"): MoveHandle {
  const found = handles.find((item) => item.axis === axis);
  if (!found) {
    throw new Error(`no arrow ${axis}`);
  }
  return found;
}

describe("placeMoveHandles", () => {
  it("places the tips beside the box, seen from above", () => {
    const camera = topCamera();
    const bounds = cube(20);
    const handles = placeMoveHandles(
      camera,
      centerOf(bounds),
      bounds,
      WIDTH,
      HEIGHT,
    );

    expect(handles.map((item) => item.axis)).toEqual(["X", "Y"]);

    // 1 mm = 2 px: the edge at 10 mm, the tip 12 px (6 mm) after it, 18 px
    // (9 mm) long; the line from the center
    const x = handle(handles, "X");
    expect(x.base.x).toBeCloseTo(10 + MOVE_HANDLE_GAP_PX / 2, 3);
    expect(x.apex.x).toBeCloseTo(
      10 + (MOVE_HANDLE_GAP_PX + MOVE_HANDLE_TIP_LENGTH_PX) / 2,
      3,
    );
    expect(x.base.y).toBe(0);
    expect(x.origin.toArray()).toEqual([0, 0, 10]);
    expect(x.radius).toBeCloseTo(MOVE_HANDLE_TIP_RADIUS_PX / 2, 6);

    // +Y toward the top of the screen
    const y = handle(handles, "Y");
    expect(y.base.y).toBeCloseTo(10 + MOVE_HANDLE_GAP_PX / 2, 3);
    expect(y.screenApex[1]).toBeLessThan(y.screenBase[1]);
  });

  it("keeps the tips beside the box from an oblique camera, at every zoom", () => {
    const bounds = cube(30, 20, -10);

    for (const position of [
      [300, -300, 250],
      [-250, -400, 120],
      [600, 200, 900],
      [3000, -3000, 2500],
    ] as [number, number, number][]) {
      const camera = perspective(position);
      const handles = placeMoveHandles(
        camera,
        centerOf(bounds),
        bounds,
        WIDTH,
        HEIGHT,
      );
      const outline = screenCorners(bounds, camera);

      expect(handles).toHaveLength(2);

      for (const item of handles) {
        // The whole tip outside the box seen from the camera
        expect(insideOutline(item.screenBase, outline)).toBe(false);
        expect(insideOutline(item.screenApex, outline)).toBe(false);
        // Its length on the screen, the same at every zoom
        expect(distance(item.screenBase, item.screenApex)).toBeCloseTo(
          MOVE_HANDLE_TIP_LENGTH_PX,
          3,
        );
      }
    }
  });

  it("hides an arrow along the direction of the camera", () => {
    // Front view: the camera looks along +Y
    const camera = perspective([0, -500, 0]);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const bounds = cube(20);
    const handles = placeMoveHandles(
      camera,
      centerOf(bounds),
      bounds,
      WIDTH,
      HEIGHT,
    );

    expect(handles.map((item) => item.axis)).toEqual(["X"]);
  });

  it("starts the arrows at the center of a group, beside its box", () => {
    const camera = topCamera();
    const bounds: Bounds = {
      min: { x: -40, y: -10, z: 0 },
      max: { x: 60, y: 10, z: 20 },
    };
    const handles = placeMoveHandles(
      camera,
      centerOf(bounds),
      bounds,
      WIDTH,
      HEIGHT,
    );

    expect(handle(handles, "X").origin.x).toBe(10);
    expect(handle(handles, "X").base.x).toBeCloseTo(60 + 6, 3);
  });
});

describe("hitMoveHandle", () => {
  const camera = topCamera();
  const bounds = cube(20);
  const handles = placeMoveHandles(
    camera,
    centerOf(bounds),
    bounds,
    WIDTH,
    HEIGHT,
  );
  const x = handle(handles, "X");

  it("grabs the tip, with a margin around it", () => {
    const middle: ScreenPoint = [
      (x.screenBase[0] + x.screenApex[0]) / 2,
      (x.screenBase[1] + x.screenApex[1]) / 2,
    ];
    expect(hitMoveHandle(handles, middle)).toBe("X");
    expect(
      hitMoveHandle(handles, [
        middle[0],
        middle[1] + MOVE_HANDLE_TIP_RADIUS_PX + MOVE_HANDLE_GRAB_MARGIN_PX - 1,
      ]),
    ).toBe("X");
    expect(
      hitMoveHandle(handles, [
        middle[0],
        middle[1] + MOVE_HANDLE_TIP_RADIUS_PX + MOVE_HANDLE_GRAB_MARGIN_PX + 2,
      ]),
    ).toBeNull();
  });

  it("never grabs the line nor the object", () => {
    const center = toScreen(new THREE.Vector3(0, 0, 10), camera);
    // On the line, over the object (5 mm = 10 px from the center)
    expect(hitMoveHandle(handles, [center[0] + 10, center[1]])).toBeNull();
    expect(hitMoveHandle(handles, center)).toBeNull();
    // On the line, just before the tip, outside the margin
    expect(
      hitMoveHandle(handles, [
        x.screenBase[0] -
          MOVE_HANDLE_TIP_RADIUS_PX -
          MOVE_HANDLE_GRAB_MARGIN_PX -
          2,
        x.screenBase[1],
      ]),
    ).toBeNull();
  });
});

describe("axisParameter", () => {
  it("follows the pointer along the axis", () => {
    const camera = perspective([300, -300, 250]);
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3(0, 0, 10);
    const axis = new THREE.Vector3(1, 0, 0);

    for (const target of [-35, 0, 12.5, 80]) {
      const point = origin.clone().addScaledVector(axis, target);
      const ndc = point.clone().project(camera);
      raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
      expect(axisParameter(raycaster.ray, origin, axis)).toBeCloseTo(target, 3);
    }
  });

  it("gives nothing for a ray along the axis", () => {
    const ray = new THREE.Ray(
      new THREE.Vector3(-100, 0, 10),
      new THREE.Vector3(1, 0, 0),
    );
    expect(
      axisParameter(
        ray,
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(1, 0, 0),
      ),
    ).toBeNull();
  });
});
