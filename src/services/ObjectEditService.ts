/**
 * SlicyWeb
 * Object Edit Service
 *
 * Edit > Delete and Edit > Duplicate (lot 100; GUI_SPEC.md, Edit Menu,
 * Keyboard Shortcuts; UNDO_REDO_SPEC.md 2.4.0):
 * - remove(): the objects leave the scene with their analysis and their
 *   recommendation (Object Reference Rule 6); one action DELETE; undo puts
 *   them back as they were (ObjectSnapshots);
 * - duplicate(): one copy of each object (Object Reference Rule 7: new
 *   objectId, no analysis, no recommendation, no category chosen; the
 *   copy is analyzed by itself like an imported object). The objects are
 *   copied as a block (same layout between them), the copies become the
 *   selection (lot 100, Q2); one action DUPLICATE; undo takes the copies
 *   out. Place of the block (lot 101, decision 103 of Noam, Q10 A): a free
 *   place inside the build plate, found as for Arrange (PlateLayout.
 *   findFreePlace): to the right (+X) of the group, DUPLICATE_GAP_MM from
 *   it, same Y, when that place is free; otherwise the free place nearest
 *   to the group. The other objects never move. No free place, or no
 *   printer (no plate): to the right of the group, DUPLICATE_GAP_MM from
 *   it, as in lot 100; the copy then gets the off-plate warning when it
 *   goes out of the plate (PlateCheckService).
 *
 * Nothing is done during a gesture (drag, gizmo). The confirmation asked
 * before deleting several objects is shown by the GUI
 * (DeleteObjectsDialog).
 *
 * Domain: Service. Depends on the Scene Domain (GeometryRegistry,
 * ObjectSnapshots, ObjectBounds, PlateLayout), the Object Management Domain (ObjectDuplicator) and
 * State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Reference Rules 6 and 7)
 * - UNDO_REDO_SPEC.md (2.4.0: Delete Actions, Duplicate Actions)
 * - GUI_SPEC.md (Edit Menu, Keyboard Shortcuts, Delete Confirmation)
 */

import { ObjectDuplicator } from "../object_manager/ObjectDuplicator";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { objectBounds } from "../scene/ObjectBounds";
import type { Bounds } from "../scene/ObjectTransform";
import { snapshotObjects, takeOut } from "../scene/ObjectSnapshots";
import { findFreePlace, OBJECT_GAP_MM, type Shift } from "../scene/PlateLayout";
import { useHistoryStore } from "../state/historyStore";
import { useObjectStore } from "../state/objectStore";
import { usePrinterStore } from "../state/printerStore";
import type { Object3D } from "../types/Object3D";

import { TransformService } from "./TransformService";

/**
 * Space between the group and its copy, in millimeters (lot 100, Q1); the
 * same space as between two objects arranged (lot 101)
 */
export const DUPLICATE_GAP_MM = OBJECT_GAP_MM;

const duplicator = new ObjectDuplicator();

/** These objects of the scene, in the order of the scene */
function inSceneOrder(objectIds: string[]): Object3D[] {
  const wanted = new Set(objectIds);

  return useObjectStore
    .getState()
    .objects.filter((object) => wanted.has(object.objectId));
}

/** Box of several boxes (none: null) */
function unionOf(boxes: Bounds[]): Bounds | null {
  if (boxes.length === 0) {
    return null;
  }

  return boxes.reduce((a, b) => ({
    min: {
      x: Math.min(a.min.x, b.min.x),
      y: Math.min(a.min.y, b.min.y),
      z: Math.min(a.min.z, b.min.z),
    },
    max: {
      x: Math.max(a.max.x, b.max.x),
      y: Math.max(a.max.y, b.max.y),
      z: Math.max(a.max.z, b.max.z),
    },
  }));
}

/**
 * Shift of the block of copies from the originals (lot 101, Q10 A): the
 * free place of the plate to the right of the group, or the nearest one;
 * to the right of the group when no place is free or no printer is
 * selected.
 */
function placeOfCopies(originals: Object3D[], groupWidth: number): Shift {
  const right: Shift = { dx: groupWidth + DUPLICATE_GAP_MM, dy: 0 };
  const volume = usePrinterStore.getState().selectedPrinter?.buildVolume;
  const block = unionOf(
    originals.flatMap((object) => {
      const bounds = objectBounds(object);
      return bounds ? [bounds] : [];
    }),
  );

  if (!volume || !block) {
    return right;
  }

  // Every object of the scene, originals included, stays where it is
  const others = useObjectStore.getState().objects.flatMap((object) => {
    const bounds = objectBounds(object);
    return bounds ? [bounds] : [];
  });

  return (
    findFreePlace(block, others, volume, right, {
      x: (block.min.x + block.max.x) / 2,
      y: (block.min.y + block.max.y) / 2,
    }) ?? right
  );
}

export const ObjectEditService = {
  /**
   * Deletes these objects; one action DELETE. Returns false (nothing
   * deleted) when none exists or a gesture is in progress.
   */
  remove(objectIds: string[]): boolean {
    if (TransformService.isGestureActive()) {
      return false;
    }

    const ids = inSceneOrder(objectIds).map((object) => object.objectId);
    const before = ids.length > 0 ? takeOut(ids) : null;

    if (!before) {
      return false;
    }

    useHistoryStore.getState().record({
      actionId: crypto.randomUUID(),
      type: "DELETE",
      timestamp: new Date().toISOString(),
      before,
      after: {},
    });

    return true;
  },

  /**
   * Copies these objects next to them and selects the copies; one action
   * DUPLICATE. Returns the objectId of the copies (none when no object
   * exists or a gesture is in progress).
   */
  duplicate(objectIds: string[]): string[] {
    if (TransformService.isGestureActive()) {
      return [];
    }

    const originals = inSceneOrder(objectIds).filter((object) =>
      GeometryRegistry.has(object.objectId),
    );
    const group = TransformService.groupInfo(
      originals.map((object) => object.objectId),
    );

    if (originals.length === 0 || !group) {
      return [];
    }

    const shift = placeOfCopies(originals, group.size.x);
    const store = useObjectStore.getState();
    const count = store.objects.length;
    const copies = originals.map((original) => {
      const copy = duplicator.duplicate(original);
      copy.transform.position.x += shift.dx;
      copy.transform.position.y += shift.dy;
      return { original, copy };
    });

    for (const { original, copy } of copies) {
      // Its own geometry: the copy lives on when the original is deleted
      GeometryRegistry.set(
        copy.objectId,
        GeometryRegistry.get(original.objectId)!.clone(),
      );
    }

    store.insertObjects(
      copies.map(({ copy }, index) => ({ object: copy, index: count + index })),
    );

    const copyIds = copies.map(({ copy }) => copy.objectId);
    store.selectObjects(copyIds);

    const after = snapshotObjects(copyIds);

    if (after) {
      useHistoryStore.getState().record({
        actionId: crypto.randomUUID(),
        type: "DUPLICATE",
        timestamp: new Date().toISOString(),
        before: {},
        after,
      });
    }

    return copyIds;
  },

  /** Edit > Duplicate, Ctrl+D: the selected objects */
  duplicateSelection(): string[] {
    return this.duplicate(useObjectStore.getState().selectedObjectIds);
  },
};

export default ObjectEditService;
