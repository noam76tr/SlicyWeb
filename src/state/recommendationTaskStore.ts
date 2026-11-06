/**
 * SlicyWeb
 * Recommendation Task Store Definition
 *
 * State of the generation of the recommendations, for the GUI (Phase 10
 * lot 88; ERROR_CODES_SPEC.md, Recommendation Errors): the error of the
 * last generation of each object, shown in the Recommendation section
 * only, never over the viewport. Never saved.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - ERROR_CODES_SPEC.md (REC_001, REC_002)
 * - GUI_SPEC.md (Recommendation Section)
 */

import { create } from "zustand";

/** Codes of a generation that gave no recommendation */
export type RecommendationErrorCode = "REC_001" | "REC_002";

interface RecommendationTaskState {
  /** Error of the last generation, indexed by objectId */
  errors: Record<string, RecommendationErrorCode>;

  setError: (objectId: string, code: RecommendationErrorCode) => void;

  clearError: (objectId: string) => void;

  clearErrors: () => void;
}

export const useRecommendationTaskStore = create<RecommendationTaskState>(
  (set) => ({
    errors: {},

    setError: (objectId, code) =>
      set((state) =>
        state.errors[objectId] === code
          ? state
          : { errors: { ...state.errors, [objectId]: code } },
      ),

    clearError: (objectId) =>
      set((state) => {
        if (!(objectId in state.errors)) {
          return state;
        }

        const errors = { ...state.errors };

        delete errors[objectId];

        return { errors };
      }),

    clearErrors: () => set({ errors: {} }),
  }),
);
