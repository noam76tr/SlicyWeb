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

import { useRecommendationStore } from "./recommendationStore";

interface AnalysisState {
  /**
   * Analyses indexed by objectId
   * (Object Reference Rule 3).
   */
  analysis: Record<string, Analysis>;

  /**
   * Stores the analysis of its object (computed or recomputed).
   * A recomputed analysis keeps the analysisId of the object
   * (Object Reference Rule 5); the recommendation of the same
   * object becomes outdated (Object Reference Rule 9).
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
   * Marks the analysis of an object as outdated, and its
   * recommendation (Object Reference Rules 8 and 9).
   */
  markAnalysisOutdated: (
    objectId: string
  ) => void;

  clearAnalysis: () => void;
}

export const useAnalysisStore =
  create<AnalysisState>((set) => ({
    analysis: {},

    setAnalysis: (analysis) => {
      set((state) => {
        const previous = state.analysis[analysis.objectId];

        return {
          analysis: {
            ...state.analysis,
            [analysis.objectId]: previous
              ? { ...analysis, analysisId: previous.analysisId }
              : analysis
          }
        };
      });

      useRecommendationStore
        .getState()
        .markRecommendationOutdated(analysis.objectId);
    },

    removeAnalysis: (objectId) =>
      set((state) => {
        const analysis = { ...state.analysis };

        delete analysis[objectId];

        return { analysis };
      }),

    markAnalysisOutdated: (objectId) => {
      useRecommendationStore
        .getState()
        .markRecommendationOutdated(objectId);

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
      });
    },

    clearAnalysis: () =>
      set({
        analysis: {}
      })
  }));
