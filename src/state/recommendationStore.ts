/**
 * SlicyWeb
 * Recommendation Store Definition
 *
 * One recommendation per object, indexed by objectId (ADR-026).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Recommendation } from "../types/Recommendation";

interface RecommendationStore {
  /**
   * Recommendations indexed by objectId
   * (Object Reference Rule 3).
   */
  recommendations: Record<string, Recommendation>;

  /**
   * Stores the recommendation of its object.
   * Replaces the previous recommendation of the same object.
   */
  setRecommendation: (
    recommendation: Recommendation,
  ) => void;

  /**
   * Removes the recommendation of an object
   * (Object Reference Rule 6).
   */
  removeRecommendation: (
    objectId: string,
  ) => void;

  /**
   * Marks the recommendation of an object as outdated
   * (Object Reference Rules 8 and 9).
   */
  markRecommendationOutdated: (
    objectId: string,
  ) => void;

  clearRecommendations: () => void;
}

export const useRecommendationStore =
  create<RecommendationStore>((set) => ({
    recommendations: {},

    setRecommendation: (recommendation) =>
      set((state) => ({
        recommendations: {
          ...state.recommendations,
          [recommendation.objectId]: recommendation,
        },
      })),

    removeRecommendation: (objectId) =>
      set((state) => {
        const recommendations = { ...state.recommendations };

        delete recommendations[objectId];

        return { recommendations };
      }),

    markRecommendationOutdated: (objectId) =>
      set((state) => {
        const current = state.recommendations[objectId];

        if (!current) {
          return state;
        }

        return {
          recommendations: {
            ...state.recommendations,
            [objectId]: {
              ...current,
              status: "outdated",
            },
          },
        };
      }),

    clearRecommendations: () =>
      set({
        recommendations: {},
      }),
  }));
