/**
 * Wichy
 * Analysis Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import { create } from "zustand";

import type { Analysis } from "../types/Analysis";

interface AnalysisState {
  analysis: Analysis | null;

  setAnalysis: (
    analysis: Analysis | null
  ) => void;

  clearAnalysis: () => void;
}

export const useAnalysisStore =
  create<AnalysisState>((set) => ({
    analysis: null,

    setAnalysis: (analysis) =>
      set({
        analysis
      }),

    clearAnalysis: () =>
      set({
        analysis: null
      })
  }));
