import { create } from "zustand";

import type { Object3D } from "../types/Object3D";

interface ObjectStore {
  objects: Object3D[];

  selectedObjectId: string | null;

  setObjects: (objects: Object3D[]) => void;

  addObject: (object: Object3D) => void;

  removeObject: (objectId: string) => void;

  selectObject: (objectId: string | null) => void;

  clearObjects: () => void;
}

export const useObjectStore = create<ObjectStore>((set) => ({
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

  removeObject: (objectId) =>
    set((state) => ({
      objects: state.objects.filter(
        (object) => object.objectId !== objectId,
      ),
    })),

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
