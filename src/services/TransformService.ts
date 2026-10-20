/**
 * SlicyWeb
 * Transform Service
 *
 * The only way to change the transform of an object (Phase 6): the
 * Transform section of the Properties Panel, the Reset and Center On Bed
 * actions, the gizmos and the drag on the plate all call apply().
 *
 * Undo and redo (UNDO_REDO_SPEC.md; decisions of Noam, Phase 6): each
 * change applied is recorded in the history (historyStore), one action per
 * change; a gesture (drag on the plate, gizmo), between beginGesture() and
 * endGesture(), is recorded as one action. undo() and redo() restore the
 * transforms of the action and select its object. Selection changes are
 * not recorded.
 *
 * apply():
 * - refuses values that are not finite and scales of 0.1 % or less;
 * - places the object on the plate (lowest point at Z = 0): the position
 *   Z is never chosen by the user (DATA_SCHEMA.md, Transform Rules;
 *   Noam, Phase 6); an object can never be placed under the plate
 *   (sunk objects: KI-021);
 * - during a rotation with the gizmo (live: true), the object turns freely
 *   around its center and may go under the plate for a moment; the gizmo
 *   applies the final transform on release, placed on the plate (as in
 *   Bambu Studio and OrcaSlicer);
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
import {
  useHistoryStore,
  type HistoryActionType,
  type HistoryEntry,
} from "../state/historyStore";
import { useObjectStore } from "../state/objectStore";

import type { Object3D, Transform } from "../types/Object3D";

export type Axis = "x" | "y" | "z";

export interface ApplyOptions {
  /**
   * Step of a gesture of the gizmo: the position Z is kept, the object is
   * not placed on the plate (the end of the gesture is applied without
   * this option).
   */
  live?: boolean;
}

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

function sameVector(
  a: Transform["position"],
  b: Transform["position"],
): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function sameTransform(a: Transform, b: Transform): boolean {
  return (
    sameVector(a.position, b.position) &&
    sameVector(a.rotation, b.rotation) &&
    sameVector(a.scale, b.scale)
  );
}

/** Action type of a change (UNDO_REDO_SPEC.md, Action Types) */
function actionType(before: Transform, after: Transform): HistoryActionType {
  if (!sameVector(before.rotation, after.rotation)) {
    return "ROTATE";
  }

  return sameVector(before.scale, after.scale) ? "MOVE" : "SCALE";
}

/** Records the change of one object, unless nothing changed */
function record(objectId: string, before: Transform, after: Transform): void {
  if (sameTransform(before, after)) {
    return;
  }

  useHistoryStore.getState().record({
    actionId: crypto.randomUUID(),
    type: actionType(before, after),
    timestamp: new Date().toISOString(),
    before: { [objectId]: before },
    after: { [objectId]: after },
  });
}

/** Gesture in progress: one action for all its changes */
let gesture: { objectId: string; before: Transform } | null = null;

/**
 * Writes the transforms of a history entry (before or after). Restoration
 * fails when an object no longer exists: nothing is changed, the error is
 * logged (UNDO_REDO_SPEC.md, Error Handling).
 */
function restore(transforms: Record<string, Transform>): boolean {
  const store = useObjectStore.getState();
  const objectIds = Object.keys(transforms);

  if (
    objectIds.length === 0 ||
    !objectIds.every((id) =>
      store.objects.some((object) => object.objectId === id),
    )
  ) {
    console.error("Undo or redo: object not found, history action skipped.");
    return false;
  }

  for (const objectId of objectIds) {
    store.updateObjectTransform(objectId, transforms[objectId]);
  }

  // The object changed is shown selected (decision of Noam, Phase 6)
  store.selectObject(objectIds[0]);

  return true;
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
   * Applies a transform to an object, placed on the plate (except a live
   * step of a gesture). Returns false when the object does not exist or a
   * value is refused.
   */
  apply(
    objectId: string,
    transform: Transform,
    options: ApplyOptions = {},
  ): boolean {
    const object = findObject(objectId);

    if (!object || !isValid(transform)) {
      return false;
    }

    if (options.live) {
      useObjectStore.getState().updateObjectTransform(objectId, transform);
      return true;
    }

    // Z is never chosen: computed so that the object stands on the plate
    const positions = vertexPositions(objectId);
    const flat: Transform = {
      ...transform,
      position: { ...transform.position, z: 0 },
    };
    const placed = positions ? placeOnPlate(flat, positions) : flat;

    useObjectStore.getState().updateObjectTransform(objectId, placed);

    // Inside a gesture, recorded once at its end
    if (gesture?.objectId !== objectId) {
      record(objectId, object.transform, placed);
    }

    return true;
  },

  /**
   * Start of a gesture on an object (drag on the plate, gizmo): its
   * changes are recorded as one action at endGesture().
   */
  beginGesture(objectId: string): void {
    const object = findObject(objectId);
    gesture = object ? { objectId, before: object.transform } : null;
  },

  /** End of the gesture: one action, unless nothing changed */
  endGesture(): void {
    const current = gesture;
    gesture = null;

    if (!current) {
      return;
    }

    const object = findObject(current.objectId);

    if (object) {
      record(current.objectId, current.before, object.transform);
    }
  },

  /** Undoes the last action; returns false when there is none */
  undo(): boolean {
    const history = useHistoryStore.getState();
    const entry = history.takeUndo();

    if (!entry) {
      return false;
    }

    if (!restore(entry.before)) {
      // Not restored: the action is dropped, the scene is kept
      return false;
    }

    history.pushRedo(entry);
    return true;
  },

  /** Redoes the last action undone; returns false when there is none */
  redo(): boolean {
    const history = useHistoryStore.getState();
    const entry: HistoryEntry | null = history.takeRedo();

    if (!entry) {
      return false;
    }

    if (!restore(entry.after)) {
      return false;
    }

    history.pushUndo(entry);
    return true;
  },

  /** Empties the history (project closed or opened, Phase 13) */
  clearHistory(): void {
    gesture = null;
    useHistoryStore.getState().clear();
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
