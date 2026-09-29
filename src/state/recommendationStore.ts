import { create } from "zustand";

import type { Recommendation } from "../types/Recommendation";

interface RecommendationStore {
  recommendation: Recommendation | null;

  setRecommendation: (
    recommendation: Recommendation,
  ) => void;

  clearRecommendation: () => void;
}

export const useRecommendationStore =
  create<RecommendationStore>((set) => ({
    recommendation: null,

    setRecommendation: (recommendation) =>
      set({
        recommendation,
      }),

    clearRecommendation: () =>
      set({
        recommendation: null,
      }),
  }));
