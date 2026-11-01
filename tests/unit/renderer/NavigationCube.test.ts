/**
 * SlicyWeb
 * Navigation Cube Tests
 *
 * Layout of the navigation cube (lot 74, decisions of Noam,
 * 2026-11-01): the cube turns with the camera, the Front face is on the
 * side -Y (tab of the build plate), each face is read upright from its
 * view, the axes X, Y, Z start from the front-left-bottom corner.
 *
 * Based on:
 * - GUI_SPEC.md (Navigation Cube, Axis Display, Camera Views)
 * - DECISIONS.md (ADR-027)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { CameraManager } from "../../../src/renderer/CameraManager";
import {
  CUBE_FACES,
  computeCubeLayout,
  type CubeFace,
} from "../../../src/renderer/NavigationCube";

import type { ViewPreset } from "../../../src/state/viewportStore";

const OPTIONS = { edgePx: 54, axisLengthRatio: 1.2, labelOffsetPx: 8 };

const OPPOSITE: Record<CubeFace, CubeFace> = {
  top: "bottom",
  bottom: "top",
  front: "back",
  back: "front",
  left: "right",
  right: "left",
};

/** Orientation of the camera after a view preset (as the View menu) */
function cameraQuaternion(view: ViewPreset): THREE.Quaternion {
  const manager = new CameraManager();
  manager.setView(view, {
    center: new THREE.Vector3(0, 0, 0),
    size: new THREE.Vector3(256, 256, 256),
  });
  return manager.getCamera().quaternion.clone();
}

/** Numbers of a matrix3d() transform */
function matrix(transform: string): number[] {
  const match = /^matrix3d\((.*)\)$/.exec(transform);
  expect(match).not.toBeNull();
  return match![1].split(",").map(Number);
}

describe("NavigationCube", () => {
  it.each(CUBE_FACES)(
    "view %s: the camera looks at that face, shown upright and facing the viewer",
    (face) => {
      const layout = computeCubeLayout(cameraQuaternion(face), OPTIONS);

      expect(layout.cameraFace).toBe(face);
      expect(layout.faces[face].visible).toBe(true);
      expect(layout.faces[OPPOSITE[face]].visible).toBe(false);

      // Right of the face to the right of the screen, down of the face
      // down on the screen, pushed half an edge towards the viewer
      const m = matrix(layout.faces[face].transform);
      expect(m[0]).toBeCloseTo(1, 3);
      expect(m[1]).toBeCloseTo(0, 3);
      expect(m[4]).toBeCloseTo(0, 3);
      expect(m[5]).toBeCloseTo(1, 3);
      expect(m[14]).toBeCloseTo(27, 2);

      // Only the face looked at is shown (the others are seen edge-on)
      for (const other of CUBE_FACES.filter((item) => item !== face)) {
        expect(layout.faces[other].visible).toBe(false);
      }
    },
  );

  it("isometric view: Top, Front and Right are shown, no face looked at", () => {
    const layout = computeCubeLayout(cameraQuaternion("isometric"), OPTIONS);

    expect(layout.cameraFace).toBeNull();
    const shown = CUBE_FACES.filter((face) => layout.faces[face].visible);
    expect(shown.sort()).toEqual(["front", "right", "top"]);
  });

  it("front view: X to the right, Z up, Y away from the viewer", () => {
    const { axes } = computeCubeLayout(cameraQuaternion("front"), OPTIONS);

    // Corner at the bottom left of the Front face
    expect(axes.x.from[0]).toBeCloseTo(-27, 2);
    expect(axes.x.from[1]).toBeCloseTo(27, 2);

    expect(axes.x.to[0]).toBeGreaterThan(axes.x.from[0]);
    expect(axes.x.to[1]).toBeCloseTo(axes.x.from[1], 2);
    expect(axes.z.to[1]).toBeLessThan(axes.z.from[1]);
    expect(axes.z.to[0]).toBeCloseTo(axes.z.from[0], 2);

    // X and Z run along the Front face: drawn over the faces
    expect(axes.x.front).toBe(true);
    expect(axes.z.front).toBe(true);
    expect(axes.y.front).toBe(false);
  });

  it("top view: the axis Z is seen end-on and not drawn", () => {
    const { axes } = computeCubeLayout(cameraQuaternion("top"), OPTIONS);

    expect(axes.z.shown).toBe(false);
    expect(axes.x.shown).toBe(true);
    expect(axes.y.shown).toBe(true);
    // Y (back) up on the screen
    expect(axes.y.to[1]).toBeLessThan(axes.y.from[1]);
  });

  it("isometric view: the axis Y runs along hidden edges, behind the faces", () => {
    const { axes } = computeCubeLayout(cameraQuaternion("isometric"), OPTIONS);

    expect(axes.x.front).toBe(true);
    expect(axes.z.front).toBe(true);
    expect(axes.y.front).toBe(false);
  });

  it("the letter of an axis is beyond its end", () => {
    const { axes } = computeCubeLayout(cameraQuaternion("isometric"), OPTIONS);

    for (const axis of [axes.x, axes.y, axes.z]) {
      const length = Math.hypot(
        axis.to[0] - axis.from[0],
        axis.to[1] - axis.from[1],
      );
      const toLabel = Math.hypot(
        axis.label[0] - axis.from[0],
        axis.label[1] - axis.from[1],
      );
      expect(toLabel).toBeCloseTo(length + 8, 2);
    }
  });

  it("turns with the camera: an orbit of the camera changes the layout", () => {
    const start = cameraQuaternion("isometric");
    const turned = start
      .clone()
      .premultiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          0.5,
        ),
      );

    const a = computeCubeLayout(start, OPTIONS);
    const b = computeCubeLayout(turned, OPTIONS);

    expect(b.faces.top.transform).not.toBe(a.faces.top.transform);
    expect(b.axes.x.to).not.toEqual(a.axes.x.to);
  });
});
