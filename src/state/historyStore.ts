/**
 * SlicyWeb
 * History Store Definition
 *
 * Undo and redo stacks (UNDO_REDO_SPEC.md, History Architecture):
 * - record(): a new action goes on the undo stack (at most
 *   MAX_HISTORY_SIZE, the oldest is dropped) and clears the redo stack
 *   (Redo Clearing Rule);
 * - takeUndo() / takeRedo(): remove the last action of a stack; the
 *   caller restores it, then puts it on the other stack (pushRedo /
 *   pushUndo);
 * - clear(): empties both stacks (project closed or opened, Phase 13).
 *
 * Actions are recorded by TransformService (Phase 6: transforms only,
 * decision of Noam; Phase 11 lot 98: the orientations applied by the
 * optimization, one action OPTIMIZATION) and by ObjectEditService (lot 100:
 * Delete and Duplicate, actions DELETE and DUPLICATE). The toolbar and the
 * Edit menu read canUndo and canRedo.
 *
 * No business logic.
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (History Architecture, History Entry Schema,
 *   Action Types, Redo Clearing Rule, Maximum History Size; 2.3.0:
 *   Orientation Optimization; 2.4.0: Delete Actions, Duplicate Actions,
 *   Geometry Storage Rules)
 */

import { create } from "zustand";

import { MAX_HISTORY_SIZE } from "../constants/HistoryConstants";

import type { BufferGeometry } from "three";

import type { Analysis } from "../types/Analysis";
import type { Object3D, Transform } from "../types/Object3D";

/**
 * Action types of a transform (UNDO_REDO_SPEC.md, Action Types; Phase 6;
 * OPTIMIZATION: Orientation Optimization, 2.3.0)
 */
export type TransformActionType = "MOVE" | "ROTATE" | "SCALE" | "OPTIMIZATION";

/**
 * Action types of the objects of the scene (UNDO_REDO_SPEC.md 2.4.0,
 * Delete Actions, Duplicate Actions; lot 100)
 */
export type SceneActionType = "DELETE" | "DUPLICATE";

export type HistoryActionType = TransformActionType | SceneActionType;

/**
 * An object of the scene as it was when it left the scene (deleted, or
 * a copy removed by undo), to put it back as it was (UNDO_REDO_SPEC.md
 * 2.4.0). Kept in memory only, never saved. The geometry is referenced,
 * not copied (Geometry Storage Rules).
 */
export interface ObjectSnapshot {
  object: Object3D;

  /** Place of the object in the list of the scene */
  index: number;

  geometry: BufferGeometry;

  /** Its analysis (with the category chosen by the user), or null */
  analysis: Analysis | null;

  /** Triangles beyond 45 degrees of its analysis, or null */
  overhangTriangles: Uint32Array | null;

  /** Its last analysis found a mesh not closed (ANA_002) */
  openMesh: boolean;

  /** Its last analysis found parts touching along an edge (ANA_005) */
  nonManifold: boolean;
}

/**
 * Entry of the history (UNDO_REDO_SPEC.md, History Entry Schema) for a
 * transform: before and after hold the transform of each object changed,
 * by objectId.
 */
export interface TransformHistoryEntry {
  actionId: string;

  type: TransformActionType;

  /** ISO 8601 */
  timestamp: string;

  before: Record<string, Transform>;

  after: Record<string, Transform>;
}

/**
 * Entry of the history for Delete and Duplicate (lot 100): before holds
 * the objects present before the action and absent after it (DELETE),
 * after the objects absent before and present after it (DUPLICATE), by
 * objectId; the other side is empty.
 */
export interface SceneHistoryEntry {
  actionId: string;

  type: SceneActionType;

  /** ISO 8601 */
  timestamp: string;

  before: Record<string, ObjectSnapshot>;

  after: Record<string, ObjectSnapshot>;
}

export type HistoryEntry = TransformHistoryEntry | SceneHistoryEntry;

/** The entry is a Delete or a Duplicate */
export function isSceneEntry(entry: HistoryEntry): entry is SceneHistoryEntry {
  return entry.type === "DELETE" || entry.type === "DUPLICATE";
}

interface HistoryState {
  undoStack: HistoryEntry[];

  redoStack: HistoryEntry[];

  record: (entry: HistoryEntry) => void;

  takeUndo: () => HistoryEntry | null;

  takeRedo: () => HistoryEntry | null;

  pushUndo: (entry: HistoryEntry) => void;

  pushRedo: (entry: HistoryEntry) => void;

  clear: () => void;
}

/** Keeps the last MAX_HISTORY_SIZE entries */
function limited(stack: HistoryEntry[]): HistoryEntry[] {
  return stack.length > MAX_HISTORY_SIZE
    ? stack.slice(stack.length - MAX_HISTORY_SIZE)
    : stack;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],

  redoStack: [],

  record: (entry) =>
    set((state) => ({
      undoStack: limited([...state.undoStack, entry]),
      redoStack: [],
    })),

  takeUndo: () => {
    const { undoStack } = get();
    const entry = undoStack[undoStack.length - 1] ?? null;

    if (entry) {
      set({ undoStack: undoStack.slice(0, -1) });
    }

    return entry;
  },

  takeRedo: () => {
    const { redoStack } = get();
    const entry = redoStack[redoStack.length - 1] ?? null;

    if (entry) {
      set({ redoStack: redoStack.slice(0, -1) });
    }

    return entry;
  },

  pushUndo: (entry) =>
    set((state) => ({
      undoStack: limited([...state.undoStack, entry]),
    })),

  pushRedo: (entry) =>
    set((state) => ({
      redoStack: limited([...state.redoStack, entry]),
    })),

  clear: () =>
    set({
      undoStack: [],
      redoStack: [],
    }),
}));
