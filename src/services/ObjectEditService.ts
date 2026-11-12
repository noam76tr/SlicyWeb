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
 *   copied as a block, placed to the right (+X) of the group, DUPLICATE_GAP_MM
 *   from it, same Y (lot 100, Q1); the copies become the selection (Q2);
 *   one action DUPLICATE; undo takes the copies out.
 *
 * Nothing is done during a gesture (drag, gizmo). The confirmation asked
 * before deleting several objects is shown by the GUI
 * (DeleteObjectsDialog).
 *
 * Domain: Service. Depends on the Scene Domain (GeometryRegistry,
 * ObjectSnapshots), the Object Management Domain (ObjectDuplicator) and
 * State Management (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Reference Rules 6 and 7)
 * - UNDO_REDO_SPEC.md (2.4.0: Delete Actions, Duplicate Actions)
 * - GUI_SPEC.md (Edit Menu, Keyboard Shortcuts, Delete Confirmation)
 */

import { ObjectDuplicator } from "../object_manager/ObjectDuplicator";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { snapshotObjects, takeOut } from "../scene/ObjectSnapshots";
import { useHistoryStore } from "../state/historyStore";
import { useObjectStore } from "../state/objectStore";
import type { Object3D } from "../types/Object3D";

import { TransformService } from "./TransformService";

/** Space between the group and its copy, in millimeters (lot 100, Q1) */
export const DUPLICATE_GAP_MM = 5;

const duplicator = new ObjectDuplicator();

/** These objects of the scene, in the order of the scene */
function inSceneOrder(objectIds: string[]): Object3D[] {
  const wanted = new Set(objectIds);

  return useObjectStore
    .getState()
    .objects.filter((object) => wanted.has(object.objectId));
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

    // The block of copies: right of the group, DUPLICATE_GAP_MM from it
    const shift = group.size.x + DUPLICATE_GAP_MM;
    const store = useObjectStore.getState();
    const count = store.objects.length;
    const copies = originals.map((original) => {
      const copy = duplicator.duplicate(original);
      copy.transform.position.x += shift;
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
