/**
 * Wichy
 * Preset Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { PrintPreset } from "../types/PrintPreset";

interface PresetState {
  presets: PrintPreset[];

  selectedPreset: PrintPreset | null;

  setPresets: (
    presets: PrintPreset[]
  ) => void;

  addPreset: (
    preset: PrintPreset
  ) => void;

  setSelectedPreset: (
    preset: PrintPreset | null
  ) => void;

  clearSelectedPreset: () => void;
}

export const usePresetStore =
  create<PresetState>((set) => ({
    presets: [],

    selectedPreset: null,

    setPresets: (presets) =>
      set({
        presets
      }),

    addPreset: (preset) =>
      set((state) => ({
        presets: [
          ...state.presets,
          preset
        ]
      })),

    setSelectedPreset: (preset) =>
      set({
        selectedPreset: preset
      }),

    clearSelectedPreset: () =>
      set({
        selectedPreset: null
      })
  }));
