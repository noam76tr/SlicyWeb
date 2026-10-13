/**
 * SlicyWeb
 * Analysis Store Definition
 *
 * One analysis per object, indexed by objectId (ADR-026).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import { create } from "zustand";

import type { Analysis } from "../types/Analysis";

interface AnalysisState {
  /**
   * Analyses indexed by objectId
   * (Object Reference Rule 3).
   */
  analysis: Record<string, Analysis>;

  /**
   * Stores the analysis of its object.
   * Replaces the previous analysis of the same object.
   */
  setAnalysis: (
    analysis: Analysis
  ) => void;

  /**
   * Removes the analysis of an object
   * (Object Reference Rule 6).
   */
  removeAnalysis: (
    objectId: string
  ) => void;

  /**
   * Marks the analysis of an object as outdated
   * (Object Reference Rule 8).
   */
  markAnalysisOutdated: (
    objectId: string
  ) => void;

  clearAnalysis: () => void;
}

export const useAnalysisStore =
  create<AnalysisState>((set) => ({
    analysis: {},

    setAnalysis: (analysis) =>
      set((state) => ({
        analysis: {
          ...state.analysis,
          [analysis.objectId]: analysis
        }
      })),

    removeAnalysis: (objectId) =>
      set((state) => {
        const analysis = { ...state.analysis };

        delete analysis[objectId];

        return { analysis };
      }),

    markAnalysisOutdated: (objectId) =>
      set((state) => {
        const current = state.analysis[objectId];

        if (!current) {
          return state;
        }

        return {
          analysis: {
            ...state.analysis,
            [objectId]: {
              ...current,
              status: "outdated"
            }
          }
        };
      }),

    clearAnalysis: () =>
      set({
        analysis: {}
      })
  }));
