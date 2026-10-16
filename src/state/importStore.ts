/**
 * SlicyWeb
 * Import Store Definition
 *
 * Imports in progress and their result, displayed by the GUI
 * (progress, success, errors; IMPORT_EXPORT_SPEC.md, Performance
 * Requirements: Provide Progress Updates).
 *
 * No business logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - IMPORT_EXPORT_SPEC.md (Import Errors, Performance Requirements)
 * - DECISIONS.md (ADR-029)
 */

import { create } from "zustand";

export type ImportTaskStatus =
  | "waiting"
  | "reading"
  | "analyzing"
  | "done"
  | "error";

export interface ImportTask {
  taskId: string;

  fileName: string;

  status: ImportTaskStatus;

  /** Fraction from 0 to 1 */
  progress: number;

  /** Error code (ImportError) when status is "error" */
  errorCode: string | null;
}

interface ImportState {
  tasks: ImportTask[];

  addTask: (
    task: ImportTask
  ) => void;

  updateTask: (
    taskId: string,
    update: Partial<Omit<ImportTask, "taskId">>
  ) => void;

  removeTask: (
    taskId: string
  ) => void;
}

export const useImportStore =
  create<ImportState>((set) => ({
    tasks: [],

    addTask: (task) =>
      set((state) => ({
        tasks: [...state.tasks, task]
      })),

    updateTask: (taskId, update) =>
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.taskId === taskId ? { ...task, ...update } : task
        )
      })),

    removeTask: (taskId) =>
      set((state) => ({
        tasks: state.tasks.filter((task) => task.taskId !== taskId)
      }))
  }));
