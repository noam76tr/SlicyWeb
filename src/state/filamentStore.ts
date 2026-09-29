/**
 * Wichy
 * Filament Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Filament } from "../types/Filament";

interface FilamentState {
  filaments: Filament[];

  selectedFilament: Filament | null;

  setFilaments: (
    filaments: Filament[]
  ) => void;

  addFilament: (
    filament: Filament
  ) => void;

  setSelectedFilament: (
    filament: Filament | null
  ) => void;

  clearSelectedFilament: () => void;
}

export const useFilamentStore =
  create<FilamentState>((set) => ({
    filaments: [],

    selectedFilament: null,

    setFilaments: (filaments) =>
      set({
        filaments
      }),

    addFilament: (filament) =>
      set((state) => ({
        filaments: [
          ...state.filaments,
          filament
        ]
      })),

    setSelectedFilament: (filament) =>
      set({
        selectedFilament: filament
      }),

    clearSelectedFilament: () =>
      set({
        selectedFilament: null
      })
  }));
