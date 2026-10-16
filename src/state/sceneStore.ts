/**
 * SlicyWeb
 * Scene Store Definition
 *
 * Holds the scene of the project.
 *
 * The selected object is not stored here: objectStore.selectedObjectId
 * is the reference (DIRECTORY_PURPOSES.md, src/state/, Selection
 * Reference; KI-014 resolved).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Scene } from "../types/Scene";

interface SceneState {
  scene: Scene | null;

  setScene: (
    scene: Scene | null
  ) => void;
}

export const useSceneStore =
  create<SceneState>((set) => ({
    scene: null,

    setScene: (scene) =>
      set({
        scene
      })
  }));
