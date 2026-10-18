/**
 * SlicyWeb
 * Transform Service
 *
 * The only way to change the transform of an object (Phase 6): the
 * Transform section of the Properties Panel, the Reset and Center On Bed
 * actions, and later the gizmos all call apply(). Undo and redo
 * (Phase 6) will record the changes in this single place.
 *
 * apply():
 * - refuses values that are not finite and scales of 0.1 % or less;
 * - places the object on the plate (lowest point at Z = 0): the position
 *   Z is never chosen by the user (DATA_SCHEMA.md, Transform Rules;
 *   Noam, Phase 6);
 * - writes the transform in the object store, which marks the analysis
 *   and the recommendation outdated after a change of rotation or scale
 *   (Object Reference Rule 8).
 *
 * Scale is shown in % with a lock that keeps the proportions; the size of
 * the object in millimeters (along its own axes) can also be edited and
 * changes the scale (GUI_SPEC.md, Transform Section).
 *
 * Domain: Service. Depends on the Scene Domain (geometry, meaning of the
 * transform) and on State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (Transform Schema, Transform Rules, Object Reference Rules)
 * - GUI_SPEC.md (Transform Section, Transform Actions)
 * - DECISIONS.md (ADR-031)
 */

import { GeometryRegistry } from "../scene/GeometryRegistry";
import { placeOnPlate, worldBounds } from "../scene/ObjectTransform";
import { useObjectStore } from "../state/objectStore";

import type { Object3D, Transform } from "../types/Object3D";

export type Axis = "x" | "y" | "z";

/** Smallest scale factor accepted (0.1 %) */
export const MIN_SCALE = 0.001;

/** Size of the object along its own axes before scale (Model Geometry) */
function baseSize(object: Object3D, axis: Axis): number {
  const { width, depth, height } = object.geometry;
  return axis === "x" ? width : axis === "y" ? depth : height;
}

function vertexPositions(objectId: string): ArrayLike<number> | null {
  const attribute = GeometryRegistry.get(objectId)?.getAttribute("position");
  return attribute ? attribute.array : null;
}

function findObject(objectId: string): Object3D | undefined {
  return useObjectStore
    .getState()
    .objects.find((object) => object.objectId === objectId);
}

function isValid(transform: Transform): boolean {
  const { position, rotation, scale } = transform;
  const values = [
    position.x,
    position.y,
    position.z,
    rotation.x,
    rotation.y,
    rotation.z,
    scale.x,
    scale.y,
    scale.z,
  ];

  return (
    values.every(Number.isFinite) &&
    scale.x > MIN_SCALE &&
    scale.y > MIN_SCALE &&
    scale.z > MIN_SCALE
  );
}

/**
 * New scale after one axis is set to a factor. With the lock (uniform),
 * the three factors keep their proportions.
 */
export function scaleWithAxis(
  scale: Transform["scale"],
  axis: Axis,
  factor: number,
  uniform: boolean,
): Transform["scale"] {
  if (!uniform) {
    return { ...scale, [axis]: factor };
  }

  const ratio = factor / scale[axis];

  return {
    x: scale.x * ratio,
    y: scale.y * ratio,
    z: scale.z * ratio,
  };
}

export const TransformService = {
  /**
   * Applies a transform to an object, placed on the plate.
   * Returns false when the object does not exist or a value is refused.
   */
  apply(objectId: string, transform: Transform): boolean {
    const object = findObject(objectId);

    if (!object || !isValid(transform)) {
      return false;
    }

    // Z is never chosen: computed so that the object stands on the plate
    const positions = vertexPositions(objectId);
    const flat: Transform = {
      ...transform,
      position: { ...transform.position, z: 0 },
    };
    const placed = positions ? placeOnPlate(flat, positions) : flat;

    useObjectStore.getState().updateObjectTransform(objectId, placed);

    return true;
  },

  /** Position X or Y, in millimeters (Z is always computed) */
  setPosition(objectId: string, axis: "x" | "y", value: number): boolean {
    const object = findObject(objectId);

    return object
      ? this.apply(objectId, {
          ...object.transform,
          position: { ...object.transform.position, [axis]: value },
        })
      : false;
  },

  /** Rotation around one axis of the plate, in degrees */
  setRotation(objectId: string, axis: Axis, degrees: number): boolean {
    const object = findObject(objectId);

    return object
      ? this.apply(objectId, {
          ...object.transform,
          rotation: { ...object.transform.rotation, [axis]: degrees },
        })
      : false;
  },

  /** Scale of one axis (factor, 1 = 100 %) */
  setScale(
    objectId: string,
    axis: Axis,
    factor: number,
    uniform: boolean,
  ): boolean {
    const object = findObject(objectId);

    if (!object || !(factor > MIN_SCALE)) {
      return false;
    }

    return this.apply(objectId, {
      ...object.transform,
      scale: scaleWithAxis(object.transform.scale, axis, factor, uniform),
    });
  },

  /** Size of the object along one of its axes, in millimeters */
  setSize(
    objectId: string,
    axis: Axis,
    millimeters: number,
    uniform: boolean,
  ): boolean {
    const object = findObject(objectId);
    const base = object ? baseSize(object, axis) : 0;

    if (!object || !(base > 0)) {
      return false;
    }

    return this.setScale(objectId, axis, millimeters / base, uniform);
  },

  /** Position X and Y back to the origin (center of the plate) */
  resetPosition(objectId: string): boolean {
    const object = findObject(objectId);

    return object
      ? this.apply(objectId, {
          ...object.transform,
          position: { x: 0, y: 0, z: 0 },
        })
      : false;
  },

  resetRotation(objectId: string): boolean {
    const object = findObject(objectId);

    return object
      ? this.apply(objectId, {
          ...object.transform,
          rotation: { x: 0, y: 0, z: 0 },
        })
      : false;
  },

  resetScale(objectId: string): boolean {
    const object = findObject(objectId);

    return object
      ? this.apply(objectId, {
          ...object.transform,
          scale: { x: 1, y: 1, z: 1 },
        })
      : false;
  },

  /**
   * Center On Bed: the center of the bounding box of the object, on the
   * plate, is moved to the center of the plate (X and Y).
   */
  centerOnBed(objectId: string): boolean {
    const object = findObject(objectId);
    const positions = vertexPositions(objectId);

    if (!object || !positions) {
      return false;
    }

    const { min, max } = worldBounds(object.transform, positions);
    const { position } = object.transform;

    return this.apply(objectId, {
      ...object.transform,
      position: {
        x: position.x - (min.x + max.x) / 2,
        y: position.y - (min.y + max.y) / 2,
        z: position.z,
      },
    });
  },

  /** Size of the object along its own axes, in millimeters */
  size(object: Object3D): Record<Axis, number> {
    return {
      x: baseSize(object, "x") * object.transform.scale.x,
      y: baseSize(object, "y") * object.transform.scale.y,
      z: baseSize(object, "z") * object.transform.scale.z,
    };
  },
};

export default TransformService;
