/**
 * SlicyWeb
 * Object Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Object3D, Transform } from "../types/Object3D";
import { TransformValidator } from "../transform/TransformValidator";

import { useAnalysisStore } from "./analysisStore";
import { useRecommendationStore } from "./recommendationStore";

interface ObjectStore {
  objects: Object3D[];

  selectedObjectId: string | null;

  setObjects: (objects: Object3D[]) => void;

  addObject: (object: Object3D) => void;

  /**
   * Removes an object, its analysis and its recommendation
   * (Object Reference Rule 6).
   */
  removeObject: (objectId: string) => void;

  /**
   * Updates the transform of an object. A change of rotation or
   * scale makes its analysis and recommendation outdated
   * (Object Reference Rule 8).
   */
  updateObjectTransform: (
    objectId: string,
    transform: Transform,
  ) => void;

  selectObject: (objectId: string | null) => void;

  clearObjects: () => void;
}

export const useObjectStore = create<ObjectStore>((set, get) => ({
  objects: [],

  selectedObjectId: null,

  setObjects: (objects) =>
    set({
      objects,
    }),

  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),

  removeObject: (objectId) => {
    set((state) => ({
      objects: state.objects.filter(
        (object) => object.objectId !== objectId,
      ),
      selectedObjectId:
        state.selectedObjectId === objectId
          ? null
          : state.selectedObjectId,
    }));

    useAnalysisStore.getState().removeAnalysis(objectId);
    useRecommendationStore.getState().removeRecommendation(objectId);
  },

  updateObjectTransform: (objectId, transform) => {
    const current = get().objects.find(
      (object) => object.objectId === objectId,
    );

    if (!current) {
      return;
    }

    set((state) => ({
      objects: state.objects.map((object) =>
        object.objectId === objectId
          ? { ...object, transform }
          : object,
      ),
    }));

    if (
      TransformValidator.changesOrientation(
        current.transform,
        transform,
      )
    ) {
      useAnalysisStore.getState().markAnalysisOutdated(objectId);
    }
  },

  selectObject: (objectId) =>
    set({
      selectedObjectId: objectId,
    }),

  clearObjects: () =>
    set({
      objects: [],
      selectedObjectId: null,
    }),
}));
