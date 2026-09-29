/**
 * Wichy
 * Scene Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Scene } from "../types/Scene";
import type { Object3D } from "../types/Object3D";

interface SceneState {
  scene: Scene | null;

  selectedObject: Object3D | null;

  setScene: (
    scene: Scene | null
  ) => void;

  setSelectedObject: (
    object: Object3D | null
  ) => void;

  clearSelection: () => void;
}

export const useSceneStore =
  create<SceneState>((set) => ({
    scene: null,

    selectedObject: null,

    setScene: (scene) =>
      set({
        scene
      }),

    setSelectedObject: (object) =>
      set({
        selectedObject: object
      }),

    clearSelection: () =>
      set({
        selectedObject: null
      })
  }));
