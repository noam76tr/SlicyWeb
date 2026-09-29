/**
 * Wichy
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
