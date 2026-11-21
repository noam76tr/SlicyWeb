/**
 * SlicyWeb
 * Estimation Store Definition
 *
 * Estimation of each object (Phase 12, ADR-037), indexed by objectId,
 * computed by CostEstimationService from the analysis and the
 * recommendation of the object. Kept in memory only: never saved in a
 * project (Q14 A; DATA_SCHEMA.md 3.15.0).
 * - estimations: the objects whose recommendation is up to date;
 * - noVolumeObjectIds: objects whose analysis found no enclosed volume
 *   (open or flat mesh): no estimation can be made.
 *
 * No business logic.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules)
 * - DECISIONS.md (ADR-037)
 */

import { create } from "zustand";

import type { ObjectEstimation } from "../types/CostEstimation";

interface EstimationState {
  estimations: Record<string, ObjectEstimation>;

  noVolumeObjectIds: string[];

  setEstimations: (
    estimations: Record<string, ObjectEstimation>,
    noVolumeObjectIds: string[],
  ) => void;
}

export const useEstimationStore = create<EstimationState>((set) => ({
  estimations: {},

  noVolumeObjectIds: [],

  setEstimations: (estimations, noVolumeObjectIds) =>
    set({ estimations, noVolumeObjectIds }),
}));
