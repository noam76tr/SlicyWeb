/**
 * SlicyWeb
 * Object Renderer
 *
 * Displays the objects of the scene in the viewport: one mesh per
 * object, built from its geometry (GeometryRegistry), placed with its
 * transform (scale, rotation in degrees around the plate axes X, Y, Z,
 * position; ObjectTransform.ts, ADR-031), hidden when the object is not
 * visible, and drawn in the accent color when it is selected.
 * pick() returns the object under the pointer (selection, Phase 6);
 * objectsInRect() returns the objects touched by a selection rectangle:
 * an object is touched when the outline of its box (bounding box of its
 * geometry, turned and scaled with it), seen from the camera, overlaps
 * the rectangle.
 *
 * Domain: Viewport. Depends on the Scene Domain (geometry, transform).
 *
 * Based on:
 * - GUI_SPEC.md (3D Viewport, Selection Visualization, Color Philosophy)
 * - DECISIONS.md (ADR-028, ADR-029, ADR-031)
 */

import * as THREE from "three";

import {
  OBJECT_COLOR,
  SELECTED_OBJECT_COLOR,
} from "../constants/ViewportConstants";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { objectMatrix } from "../scene/ObjectTransform";

import type { Object3D } from "../types/Object3D";

/** Rectangle of the screen in normalized device coordinates (-1 to 1) */
export interface ScreenRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

type Point2 = [number, number];

/** Convex hull of 2D points (monotone chain), counterclockwise */
function convexHull(points: Point2[]): Point2[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  if (sorted.length < 3) {
    return sorted;
  }

  const cross = (o: Point2, a: Point2, b: Point2): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Point2[] = [];
  const upper: Point2[] = [];

  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  for (const point of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** True when a convex polygon and a rectangle overlap (separating axes) */
function overlaps(hull: Point2[], rect: ScreenRect): boolean {
  const corners: Point2[] = [
    [rect.minX, rect.minY],
    [rect.maxX, rect.minY],
    [rect.maxX, rect.maxY],
    [rect.minX, rect.maxY],
  ];
  const axes: Point2[] = [
    [1, 0],
    [0, 1],
  ];

  for (let i = 0; i < hull.length; i += 1) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    axes.push([a[1] - b[1], b[0] - a[0]]);
  }

  return axes.every(([ax, ay]) => {
    const project = (points: Point2[]): [number, number] => {
      const values = points.map(([x, y]) => x * ax + y * ay);
      return [Math.min(...values), Math.max(...values)];
    };
    const [hullMin, hullMax] = project(hull);
    const [rectMin, rectMax] = project(corners);

    return hullMax >= rectMin && rectMax >= hullMin;
  });
}

export class ObjectRenderer {
  private readonly scene: THREE.Scene;

  private readonly meshes = new Map<string, THREE.Mesh>();

  private readonly material = new THREE.MeshStandardMaterial({
    color: OBJECT_COLOR,
    roughness: 0.6,
    metalness: 0.05,
  });

  private readonly selectedMaterial = new THREE.MeshStandardMaterial({
    color: SELECTED_OBJECT_COLOR,
    roughness: 0.6,
    metalness: 0.05,
  });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Brings the meshes in line with the objects of the scene; the selected
   * objects (one or several) are shown in the accent color.
   */
  public sync(objects: Object3D[], selectedObjectIds: string[]): void {
    const present = new Set<string>();
    const selected = new Set(selectedObjectIds);

    for (const object of objects) {
      const geometry = GeometryRegistry.get(object.objectId);

      if (!geometry) {
        continue;
      }

      present.add(object.objectId);

      let mesh = this.meshes.get(object.objectId);

      if (!mesh || mesh.geometry !== geometry) {
        if (mesh) {
          this.scene.remove(mesh);
        }

        mesh = new THREE.Mesh(geometry, this.material);
        mesh.name = `object-${object.objectId}`;
        mesh.userData.objectId = object.objectId;
        this.meshes.set(object.objectId, mesh);
        this.scene.add(mesh);
      }

      objectMatrix(object.transform).decompose(
        mesh.position,
        mesh.quaternion,
        mesh.scale,
      );
      mesh.visible = object.visible;
      mesh.material = selected.has(object.objectId)
        ? this.selectedMaterial
        : this.material;
    }

    for (const [objectId, mesh] of this.meshes) {
      if (!present.has(objectId)) {
        this.scene.remove(mesh);
        this.meshes.delete(objectId);
      }
    }
  }

  /**
   * Visible object under the ray (nearest), or null.
   */
  public pick(raycaster: THREE.Raycaster): string | null {
    const visible = [...this.meshes.values()].filter((mesh) => mesh.visible);
    const hit = raycaster.intersectObjects(visible, false)[0];

    return hit ? (hit.object.userData.objectId as string) : null;
  }

  /**
   * Objects touched by a rectangle of the screen (selection rectangle);
   * hidden objects and objects behind the camera are left out.
   */
  public objectsInRect(camera: THREE.Camera, rect: ScreenRect): string[] {
    const touched: string[] = [];

    camera.updateMatrixWorld();

    for (const [objectId, mesh] of this.meshes) {
      const box = mesh.geometry.boundingBox;

      if (!mesh.visible || !box) {
        continue;
      }

      mesh.updateMatrixWorld();

      const points: Point2[] = [];

      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            const point = new THREE.Vector3(x, y, z)
              .applyMatrix4(mesh.matrixWorld)
              .project(camera);

            // In front of the camera only
            if (point.z >= -1 && point.z <= 1) {
              points.push([point.x, point.y]);
            }
          }
        }
      }

      if (points.length > 0 && overlaps(convexHull(points), rect)) {
        touched.push(objectId);
      }
    }

    return touched;
  }

  public dispose(): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
    }

    this.meshes.clear();
    this.material.dispose();
    this.selectedMaterial.dispose();
  }
}
