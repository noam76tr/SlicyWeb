/**
 * SlicyWeb
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

  /** Ids of the filaments entered by the user (Local Custom) */
  userFilamentIds: string[];

  selectedFilament: Filament | null;

  /**
   * Filament of the project opened that is not in the list (lot 111,
   * decision 119 of Noam, Q3 A): group "This project" of the selector,
   * for this project only; null otherwise.
   */
  projectFilament: Filament | null;

  setProjectFilament: (
    filament: Filament | null
  ) => void;

  setFilaments: (
    filaments: Filament[]
  ) => void;

  setUserFilamentIds: (
    userFilamentIds: string[]
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

    userFilamentIds: [],

    selectedFilament: null,

    projectFilament: null,

    setProjectFilament: (filament) =>
      set({
        projectFilament: filament
      }),

    setFilaments: (filaments) =>
      set({
        filaments
      }),

    setUserFilamentIds: (userFilamentIds) =>
      set({
        userFilamentIds
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
