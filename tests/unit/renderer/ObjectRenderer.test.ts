/**
 * SlicyWeb
 * Object Renderer Tests
 *
 * Selection rectangle (Phase 6, decision of Noam): the objects touched by
 * the rectangle are selected, as in the Windows File Explorer.
 *
 * Based on:
 * - GUI_SPEC.md (Multi Selection)
 * - TEST_PLAN.md
 */

import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { ObjectRenderer } from "../../../src/renderer/ObjectRenderer";
import { GeometryRegistry } from "../../../src/scene/GeometryRegistry";

import type { Object3D } from "../../../src/types/Object3D";

/** Cube of 10 mm, local origin at its center */
function cubeGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  geometry.computeBoundingBox();
  return geometry;
}

function cube(objectId: string, x: number, rotationZ = 0): Object3D {
  GeometryRegistry.set(objectId, cubeGeometry());
  const object = ObjectFactory.create(objectId, `${objectId}.stl`, "stl");
  object.transform = {
    position: { x, y: 0, z: 5 },
    rotation: { x: 0, y: 0, z: rotationZ },
    scale: { x: 1, y: 1, z: 1 },
  };
  return object;
}

/**
 * Camera seen from above: the screen shows X from -100 to 100 mm and
 * Y from -100 to 100 mm; normalized coordinates = millimeters / 100.
 */
function topCamera(): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

/** Rectangle in millimeters of the plate, seen from above */
function rect(minX: number, maxX: number, minY: number, maxY: number) {
  return {
    minX: minX / 100,
    maxX: maxX / 100,
    minY: minY / 100,
    maxY: maxY / 100,
  };
}

let renderer: ObjectRenderer;

beforeEach(() => {
  GeometryRegistry.clear();
  renderer = new ObjectRenderer(new THREE.Scene());
  // Cubes at X = -50, 0 and 50; the last one turned 45° around Z
  renderer.sync([cube("a", -50), cube("b", 0), cube("c", 50, 45)], []);
});

describe("Selection rectangle", () => {
  it("selects the objects touched, not only those fully inside", () => {
    // From X = -60 to X = 2: all of A, the left edge of B (X = -5 to 5)
    expect(renderer.objectsInRect(topCamera(), rect(-60, 2, -20, 20))).toEqual([
      "a",
      "b",
    ]);
  });

  it("an empty area selects nothing", () => {
    expect(renderer.objectsInRect(topCamera(), rect(-30, -20, 30, 60))).toEqual(
      [],
    );
  });

  it("follows the outline of a turned object", () => {
    // C turned 45°: its corner reaches X = 50 + 7.07; a rectangle just
    // beside the corner of its box does not touch it
    expect(renderer.objectsInRect(topCamera(), rect(55, 60, 5, 8))).toEqual([]);
    expect(renderer.objectsInRect(topCamera(), rect(56, 60, -1, 1))).toEqual([
      "c",
    ]);
  });

  it("leaves out hidden objects", () => {
    const hidden = cube("a", -50);
    hidden.visible = false;
    renderer.sync([hidden, cube("b", 0)], []);
    expect(
      renderer.objectsInRect(topCamera(), rect(-100, 100, -100, 100)),
    ).toEqual(["b"]);
  });
});
