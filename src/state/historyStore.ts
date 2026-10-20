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
 * decision of Noam). The toolbar and the Edit menu read canUndo and
 * canRedo.
 *
 * No business logic.
 *
 * Based on:
 * - UNDO_REDO_SPEC.md (History Architecture, History Entry Schema,
 *   Action Types, Redo Clearing Rule, Maximum History Size)
 */

import { create } from "zustand";

import { MAX_HISTORY_SIZE } from "../constants/HistoryConstants";

import type { Transform } from "../types/Object3D";

/** Action types of Phase 6 (UNDO_REDO_SPEC.md, Action Types) */
export type HistoryActionType = "MOVE" | "ROTATE" | "SCALE";

/**
 * Entry of the history (UNDO_REDO_SPEC.md, History Entry Schema).
 * before and after: transform of each object changed, by objectId.
 */
export interface HistoryEntry {
  actionId: string;

  type: HistoryActionType;

  /** ISO 8601 */
  timestamp: string;

  before: Record<string, Transform>;

  after: Record<string, Transform>;
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
