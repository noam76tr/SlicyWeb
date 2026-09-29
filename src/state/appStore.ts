/**
 * Wichy
 * Application Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 */

import { create } from "zustand";

import type { Printer } from "../types/Printer";
import type { Material } from "../types/Material";
import type { Filament } from "../types/Filament";
import type { PrintPreset } from "../types/PrintPreset";

interface AppState {
  selectedPrinter: Printer | null;

  selectedMaterial: Material | null;

  selectedFilament: Filament | null;

  selectedPreset: PrintPreset | null;

  setSelectedPrinter: (
    printer: Printer | null
  ) => void;

  setSelectedMaterial: (
    material: Material | null
  ) => void;

  setSelectedFilament: (
    filament: Filament | null
  ) => void;

  setSelectedPreset: (
    preset: PrintPreset | null
  ) => void;
}

export const useAppStore = create<AppState>(
  (set) => ({
    selectedPrinter: null,

    selectedMaterial: null,

    selectedFilament: null,

    selectedPreset: null,

    setSelectedPrinter: (printer) =>
      set({
        selectedPrinter: printer
      }),

    setSelectedMaterial: (material) =>
      set({
        selectedMaterial: material
      }),

    setSelectedFilament: (filament) =>
      set({
        selectedFilament: filament
      }),

    setSelectedPreset: (preset) =>
      set({
        selectedPreset: preset
      })
  })
);
