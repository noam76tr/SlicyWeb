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

describe("Overhang Display (lot 82)", () => {
  function red(scene: THREE.Scene, objectId: string): THREE.Mesh | undefined {
    return scene.getObjectByName(`overhangs-${objectId}`) as
      THREE.Mesh | undefined;
  }

  it("draws the triangles given in red, on their object, over its faces", () => {
    const scene = new THREE.Scene();
    const objects = new ObjectRenderer(scene);
    objects.sync([cube("a", -50)], ["a"]);

    // Triangles 6 and 7 of the box (BoxGeometry, indexed): its face -Y
    expect(
      objects.syncOverhangs(new Map([["a", new Uint32Array([6, 7])]])),
    ).toBe(2);

    const mesh = red(scene, "a")!;
    expect(mesh.parent?.name).toBe("object-a");
    expect(mesh.geometry.getAttribute("position").count).toBe(6);
    const box = new THREE.Box3().setFromBufferAttribute(
      mesh.geometry.getAttribute("position") as THREE.BufferAttribute,
    );
    expect(box.min.y).toBeCloseTo(-5, 6);
    expect(box.max.y).toBeCloseTo(-5, 6);
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
      0xe5484d,
    );
  });

  it("never answers a click: the object under the pointer stays the object", () => {
    const scene = new THREE.Scene();
    const objects = new ObjectRenderer(scene);
    objects.sync([cube("a", 0)], ["a"]);
    objects.syncOverhangs(new Map([["a", new Uint32Array([6, 7])]]));

    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, -100, 5),
      new THREE.Vector3(0, 1, 0),
    );
    scene.updateMatrixWorld(true);
    expect(objects.pick(raycaster)).toBe("a");
  });

  it("removes the red triangles when they are no longer given, and replaces them when they change", () => {
    const scene = new THREE.Scene();
    const objects = new ObjectRenderer(scene);
    objects.sync([cube("a", 0)], ["a"]);

    objects.syncOverhangs(new Map([["a", new Uint32Array([6, 7])]]));
    const first = red(scene, "a");
    objects.syncOverhangs(new Map([["a", new Uint32Array([0])]]));
    expect(red(scene, "a")).not.toBe(first);
    expect(red(scene, "a")!.geometry.getAttribute("position").count).toBe(3);

    expect(objects.syncOverhangs(new Map())).toBe(0);
    expect(red(scene, "a")).toBeUndefined();

    // No triangle beyond 45 degrees: nothing is drawn
    expect(objects.syncOverhangs(new Map([["a", new Uint32Array(0)]]))).toBe(0);
    expect(red(scene, "a")).toBeUndefined();
  });
});
