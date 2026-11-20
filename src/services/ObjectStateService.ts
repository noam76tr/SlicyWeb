/**
 * SlicyWeb
 * Object State Service
 *
 * Rename, Hide and Show, Lock and Unlock (lot 106, decision 112 of Noam,
 * Q1 to Q18 A; GUI_SPEC.md, Object Panel, Object Context Menu, Keyboard
 * Shortcuts; DATA_SCHEMA.md 3.14.0, Object Schema):
 * - rename(): the name given by the user (Object Schema: name); spaces at
 *   the start and the end taken off, MAX_NAME_LENGTH characters at most;
 *   an empty name, or the file name itself, gives back the name of the
 *   file (name null) (Q3 A); a name already used is accepted (Q3 A), the
 *   Object Panel numbers it (Q4 A); one object at a time (Q6 A);
 * - setVisible(), toggleSelectionVisibility(), showAll(): a hidden object
 *   is set aside (Q7 A) and stays selected, so that H shows it again
 *   (decision 114 of Noam, Q27 A, replaces Q10 A);
 * - setLocked(), toggleSelectionLock(): a locked object keeps its
 *   position, rotation and scale (Q12 A; TransformService refuses them).
 *
 * The line of the menu (and the key H) acts on the selection: Hide when
 * at least one object selected is shown, otherwise Show; Lock when at
 * least one is not locked, otherwise Unlock (Q18 A). The eye and the
 * padlock of a row act on that row only (Q9 A, Q16 A).
 *
 * Each change is one action of the history (Q17 A; UNDO_REDO_SPEC.md
 * 2.6.0): RENAME, VISIBILITY or LOCK, with the field before and after,
 * by objectId; nothing is recorded when nothing changes. Nothing is done
 * during a gesture (drag, gizmo).
 *
 * Domain: Service. Depends on State Management (objectStore,
 * historyStore) and on TransformService (gesture state)
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Schema: name, visible, locked)
 * - UNDO_REDO_SPEC.md (2.6.0: Rename, Hide And Show, Lock And Unlock)
 * - GUI_SPEC.md (Object Panel, Object Context Menu, Keyboard Shortcuts)
 */

import {
  useHistoryStore,
  type ObjectState,
  type ObjectStateActionType,
} from "../state/historyStore";
import { useObjectStore } from "../state/objectStore";
import type { Object3D } from "../types/Object3D";

import { TransformService } from "./TransformService";

/** Longest name given by the user, in characters (Q3 A) */
export const MAX_NAME_LENGTH = 100;

/**
 * Name kept for a text typed: trimmed, MAX_NAME_LENGTH characters at
 * most; null (name of the file) when empty or equal to the file name
 */
export function normalizeName(text: string, fileName: string): string | null {
  const name = [...text.trim()].slice(0, MAX_NAME_LENGTH).join("").trim();

  return name === "" || name === fileName ? null : name;
}

function objectsOf(objectIds: string[]): Object3D[] {
  const wanted = new Set(objectIds);

  return useObjectStore
    .getState()
    .objects.filter((object) => wanted.has(object.objectId));
}

function selectedObjects(): Object3D[] {
  return objectsOf(useObjectStore.getState().selectedObjectIds);
}

/**
 * Writes the new fields and records one action; returns false when
 * nothing changes or a gesture is in progress
 */
function change(
  type: ObjectStateActionType,
  objects: Object3D[],
  field: "name" | "visible" | "locked",
  value: string | null | boolean,
): boolean {
  if (TransformService.isGestureActive()) {
    return false;
  }

  const changed = objects.filter((object) => object[field] !== value);

  if (changed.length === 0) {
    return false;
  }

  const before: Record<string, ObjectState> = {};
  const after: Record<string, ObjectState> = {};

  for (const object of changed) {
    before[object.objectId] = { [field]: object[field] };
    after[object.objectId] = { [field]: value };
  }

  useObjectStore.getState().updateObjectStates(after);
  useHistoryStore.getState().record({
    actionId: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    before,
    after,
  });

  return true;
}

export const ObjectStateService = {
  /** Gives this name to the object (empty: the name of the file again) */
  rename(objectId: string, text: string): boolean {
    const [object] = objectsOf([objectId]);

    return object
      ? change("RENAME", [object], "name", normalizeName(text, object.fileName))
      : false;
  },

  /** Rename is possible: exactly one object is selected (Q6 A) */
  canRenameSelection(): boolean {
    return useObjectStore.getState().selectedObjectIds.length === 1;
  },

  /** Hides or shows these objects (eye of a row: one object) */
  setVisible(objectIds: string[], visible: boolean): boolean {
    return change("VISIBILITY", objectsOf(objectIds), "visible", visible);
  },

  /** Locks or unlocks these objects (padlock of a row: one object) */
  setLocked(objectIds: string[], locked: boolean): boolean {
    return change("LOCK", objectsOf(objectIds), "locked", locked);
  },

  /**
   * Line of the menu for the selection (Q18 A): "hide" when at least one
   * object selected is shown, otherwise "show"
   */
  selectionVisibilityAction(): "hide" | "show" {
    return selectedObjects().some((object) => object.visible)
      ? "hide"
      : "show";
  },

  /**
   * Line of the menu for the selection (Q18 A): "lock" when at least one
   * object selected is not locked, otherwise "unlock"
   */
  selectionLockAction(): "lock" | "unlock" {
    return selectedObjects().some((object) => !object.locked)
      ? "lock"
      : "unlock";
  },

  /** Hide or Show of the menu, and the key H: the selected objects */
  toggleSelectionVisibility(): boolean {
    const objects = selectedObjects();

    return change(
      "VISIBILITY",
      objects,
      "visible",
      this.selectionVisibilityAction() === "show",
    );
  },

  /** Lock or Unlock of the menu: the selected objects */
  toggleSelectionLock(): boolean {
    return change(
      "LOCK",
      selectedObjects(),
      "locked",
      this.selectionLockAction() === "lock",
    );
  },

  /** View > Show All, Alt+H: every hidden object shown, one action */
  showAll(): boolean {
    return change(
      "VISIBILITY",
      useObjectStore.getState().objects,
      "visible",
      true,
    );
  },

  /** At least one object is hidden (Show All enabled) */
  hasHiddenObjects(): boolean {
    return useObjectStore.getState().objects.some((object) => !object.visible);
  },
};

export default ObjectStateService;
