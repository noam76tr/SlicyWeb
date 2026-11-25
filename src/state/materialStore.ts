/**
 * SlicyWeb
 * Material Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Material } from "../types/Material";

interface MaterialState {
  materials: Material[];

  selectedMaterial: Material | null;

  /**
   * Material of the project opened that is not in the list (lot 111,
   * decision 119 of Noam, Q3 A): group "This project" of the selector,
   * for this project only; null otherwise.
   */
  projectMaterial: Material | null;

  setProjectMaterial: (
    material: Material | null
  ) => void;

  setMaterials: (
    materials: Material[]
  ) => void;

  addMaterial: (
    material: Material
  ) => void;

  setSelectedMaterial: (
    material: Material | null
  ) => void;

  clearSelectedMaterial: () => void;
}

export const useMaterialStore =
  create<MaterialState>((set) => ({
    materials: [],

    selectedMaterial: null,

    projectMaterial: null,

    setProjectMaterial: (material) =>
      set({
        projectMaterial: material
      }),

    setMaterials: (materials) =>
      set({
        materials
      }),

    addMaterial: (material) =>
      set((state) => ({
        materials: [
          ...state.materials,
          material
        ]
      })),

    setSelectedMaterial: (material) =>
      set({
        selectedMaterial: material
      }),

    clearSelectedMaterial: () =>
      set({
        selectedMaterial: null
      })
  }));
