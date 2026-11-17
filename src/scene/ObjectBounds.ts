/**
 * SlicyWeb
 * Object Bounds
 *
 * Bounding box of an object on the plate, for the plate check and the
 * arrangement (lot 101), and for the place of the gizmos in the viewport
 * (Viewport.tsx, lot 104: one box per object for both). The box around the position is kept while the
 * geometry, the rotation and the scale of the object do not change: a move
 * (drag on the plate, every frame of the gesture) does not read its
 * vertices again.
 *
 * Domain: Scene. Depends on GeometryRegistry and ObjectTransform.
 *
 * Based on:
 * - DATA_SCHEMA.md (Transform Schema: position = center of the object)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import { GeometryRegistry } from "./GeometryRegistry";
import { worldBounds, type Bounds } from "./ObjectTransform";

import type { Object3D } from "../types/Object3D";

interface RelativeBounds {
  geometry: unknown;
  key: string;
  bounds: Bounds;
}

/** Box of each object around its position, by objectId */
const relativeBounds = new Map<string, RelativeBounds>();

/**
 * Box of the object on the plate; null when it has no geometry or no
 * vertex.
 */
export function objectBounds(object: Object3D): Bounds | null {
  const geometry = GeometryRegistry.get(object.objectId);
  const positions = geometry?.getAttribute("position")?.array;

  if (!geometry || !positions) {
    return null;
  }

  const { rotation, scale, position } = object.transform;
  const key = [
    rotation.x,
    rotation.y,
    rotation.z,
    scale.x,
    scale.y,
    scale.z,
  ].join(" ");
  let cached = relativeBounds.get(object.objectId);

  if (!cached || cached.geometry !== geometry || cached.key !== key) {
    cached = {
      geometry,
      key,
      bounds: worldBounds(
        { ...object.transform, position: { x: 0, y: 0, z: 0 } },
        positions,
      ),
    };
    relativeBounds.set(object.objectId, cached);
  }

  const { min, max } = cached.bounds;

  if (!Number.isFinite(min.x)) {
    return null;
  }

  return {
    min: {
      x: min.x + position.x,
      y: min.y + position.y,
      z: min.z + position.z,
    },
    max: {
      x: max.x + position.x,
      y: max.y + position.y,
      z: max.z + position.z,
    },
  };
}

/** Forgets the boxes of the objects that are not in this list */
export function keepBoundsOf(objects: Object3D[]): void {
  const present = new Set(objects.map((object) => object.objectId));

  for (const objectId of [...relativeBounds.keys()]) {
    if (!present.has(objectId)) {
      relativeBounds.delete(objectId);
    }
  }
}
