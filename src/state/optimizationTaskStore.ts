/**
 * SlicyWeb
 * Optimization Task Store Definition
 *
 * State of the orientation search, displayed by the GUI (Phase 11 lot 98;
 * ADR-036 D4, D5). Not project data: nothing here is saved (DATA_SCHEMA.md
 * 3.13.0, Optimization Result Rules: the result lives in memory for the
 * message only).
 * - running: a search is in progress ("Optimizing…" in the status bar;
 *   Tools > Optimize Orientation and the button Optimize disabled);
 * - messages: the message of the result of each search, shown over the
 *   viewport until closed, one line for each object searched.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Tools Menu, Status Bar, Error Handling UI: Optimization
 *   messages)
 * - ERROR_CODES_SPEC.md (OPT_002)
 * - DECISIONS.md (ADR-036 D4, D5)
 */

import { create } from "zustand";

/** Line of an object whose orientation was applied */
export interface OptimizationAppliedLine {
  kind: "applied";

  objectId: string;

  /** File name of the object when the search ended */
  fileName: string;

  /** Orientation Score before and after, out of 100 */
  scoreBefore: number;
  scoreAfter: number;

  /**
   * Change of the area beyond 45 degrees, in % of the area before
   * (supportReduction: above 0 when the area falls); 0 = no change shown
   */
  supportReduction: number;

  /** The recommendation would no longer enable the supports */
  supportsRemoved: boolean;

  /** Tip risk before and after, out of 100 */
  riskBefore: number;
  riskAfter: number;
}

/** Line of an object whose current orientation is already the best */
export interface OptimizationKeptLine {
  kind: "kept";

  objectId: string;

  fileName: string;

  /** Orientation Score of the current orientation, out of 100 */
  score: number;
}

/** Line of an object whose search failed (OPT_002) */
export interface OptimizationFailedLine {
  kind: "failed";

  objectId: string;

  fileName: string;

  code: "OPT_002";
}

export type OptimizationLine =
  OptimizationAppliedLine | OptimizationKeptLine | OptimizationFailedLine;

/** Message of the result of one search */
export interface OptimizationMessage {
  messageId: string;

  /** One line for each object searched, in the order of the scene */
  lines: OptimizationLine[];
}

interface OptimizationTaskState {
  running: boolean;

  messages: OptimizationMessage[];

  setRunning: (running: boolean) => void;

  addMessage: (message: OptimizationMessage) => void;

  removeMessage: (messageId: string) => void;
}

export const useOptimizationTaskStore = create<OptimizationTaskState>(
  (set) => ({
    running: false,

    messages: [],

    setRunning: (running) =>
      set((state) => (state.running === running ? state : { running })),

    addMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),

    removeMessage: (messageId) =>
      set((state) => ({
        messages: state.messages.filter(
          (message) => message.messageId !== messageId,
        ),
      })),
  }),
);
