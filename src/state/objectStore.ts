/**
 * SlicyWeb
 * Object Store Definition
 *
 * Selection (Phase 6, decisions of Noam): selectedObjectIds holds the
 * selected objects (one or several: Ctrl+click, Ctrl+A); selectedObjectId
 * is the last object added to the selection (null when nothing is
 * selected). Object selection is not project data (not in DATA_SCHEMA.md).
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

  /** Last object added to the selection; null when nothing is selected */
  selectedObjectId: string | null;

  /** Selected objects (one or several), in the order of selection */
  selectedObjectIds: string[];

  setObjects: (objects: Object3D[]) => void;

  addObject: (object: Object3D) => void;

  /**
   * Removes an object, its analysis and its recommendation
   * (Object Reference Rule 6).
   */
  removeObject: (objectId: string) => void;

  /**
   * Removes several objects at once (Delete, lot 100), their analysis and
   * their recommendation (Object Reference Rule 6); they leave the
   * selection.
   */
  removeObjects: (objectIds: string[]) => void;

  /**
   * Puts objects at these places in the list (undo of Delete, redo of
   * Duplicate; lot 100), in the order of the places.
   */
  insertObjects: (entries: { object: Object3D; index: number }[]) => void;

  /**
   * Updates the transform of an object. A change of rotation or
   * scale makes its analysis and recommendation outdated
   * (Object Reference Rule 8).
   */
  updateObjectTransform: (objectId: string, transform: Transform) => void;

  /** Selects this object only; null clears the selection */
  selectObject: (objectId: string | null) => void;

  /** Selects these objects (undo and redo of a group) */
  selectObjects: (objectIds: string[]) => void;

  /** Ctrl+click: adds the object to the selection, or removes it */
  toggleObjectSelection: (objectId: string) => void;

  /** Ctrl+A: selects all the objects */
  selectAllObjects: () => void;

  clearObjects: () => void;
}

export const useObjectStore = create<ObjectStore>((set, get) => ({
  objects: [],

  selectedObjectId: null,

  selectedObjectIds: [],

  setObjects: (objects) =>
    set({
      objects,
    }),

  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),

  removeObject: (objectId) => {
    set((state) => {
      const selectedObjectIds = state.selectedObjectIds.filter(
        (id) => id !== objectId,
      );

      return {
        objects: state.objects.filter((object) => object.objectId !== objectId),
        selectedObjectIds,
        selectedObjectId:
          selectedObjectIds[selectedObjectIds.length - 1] ?? null,
      };
    });

    useAnalysisStore.getState().removeAnalysis(objectId);
    useRecommendationStore.getState().removeRecommendation(objectId);
  },

  removeObjects: (objectIds) => {
    const removed = new Set(objectIds);

    set((state) => {
      const selectedObjectIds = state.selectedObjectIds.filter(
        (id) => !removed.has(id),
      );

      return {
        objects: state.objects.filter(
          (object) => !removed.has(object.objectId),
        ),
        selectedObjectIds,
        selectedObjectId:
          selectedObjectIds[selectedObjectIds.length - 1] ?? null,
      };
    });

    for (const objectId of removed) {
      useAnalysisStore.getState().removeAnalysis(objectId);
      useRecommendationStore.getState().removeRecommendation(objectId);
    }
  },

  insertObjects: (entries) =>
    set((state) => {
      const objects = [...state.objects];

      for (const entry of [...entries].sort((a, b) => a.index - b.index)) {
        objects.splice(
          Math.min(Math.max(entry.index, 0), objects.length),
          0,
          entry.object,
        );
      }

      return { objects };
    }),

  updateObjectTransform: (objectId, transform) => {
    const current = get().objects.find(
      (object) => object.objectId === objectId,
    );

    if (!current) {
      return;
    }

    set((state) => ({
      objects: state.objects.map((object) =>
        object.objectId === objectId ? { ...object, transform } : object,
      ),
    }));

    if (TransformValidator.changesOrientation(current.transform, transform)) {
      useAnalysisStore.getState().markAnalysisOutdated(objectId);
    }
  },

  selectObject: (objectId) =>
    set({
      selectedObjectId: objectId,
      selectedObjectIds: objectId ? [objectId] : [],
    }),

  selectObjects: (objectIds) =>
    set({
      selectedObjectIds: [...objectIds],
      selectedObjectId: objectIds[objectIds.length - 1] ?? null,
    }),

  toggleObjectSelection: (objectId) =>
    set((state) => {
      const selectedObjectIds = state.selectedObjectIds.includes(objectId)
        ? state.selectedObjectIds.filter((id) => id !== objectId)
        : [...state.selectedObjectIds, objectId];

      return {
        selectedObjectIds,
        selectedObjectId:
          selectedObjectIds[selectedObjectIds.length - 1] ?? null,
      };
    }),

  selectAllObjects: () =>
    set((state) => {
      const selectedObjectIds = state.objects.map((object) => object.objectId);

      return {
        selectedObjectIds,
        selectedObjectId:
          selectedObjectIds[selectedObjectIds.length - 1] ?? null,
      };
    }),

  clearObjects: () =>
    set({
      objects: [],
      selectedObjectId: null,
      selectedObjectIds: [],
    }),
}));
