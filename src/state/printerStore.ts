/**
 * SlicyWeb
 * Printer Store Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import { create } from "zustand";

import type { Printer } from "../types/Printer";
import type { ProfilesStatus } from "../types/ProfileSync";

/** Message of the last check of the profiles (translation key) */
export interface ProfilesMessage {
  key: string;
  tag: string | null;
}

interface PrinterState {
  printers: Printer[];

  /** Ids of the printers entered by the user (Local Custom) */
  userPrinterIds: string[];

  /** Origin, tag and last check of the Official profiles */
  profiles: ProfilesStatus | null;

  profilesMessage: ProfilesMessage | null;

  /** Setting printer.autoCheckProfiles, as saved */
  autoCheckProfiles: boolean;

  selectedPrinter: Printer | null;

  /**
   * Printer of the project opened that is not in the list (its copy in
   * the project; lot 111, decision 119 of Noam, Q3 A): offered in the
   * group "This project" of the selector, for this project only; null
   * otherwise.
   */
  projectPrinter: Printer | null;

  setProjectPrinter: (
    printer: Printer | null
  ) => void;

  setPrinters: (
    printers: Printer[]
  ) => void;

  setUserPrinterIds: (
    userPrinterIds: string[]
  ) => void;

  setProfiles: (
    profiles: ProfilesStatus | null
  ) => void;

  setProfilesMessage: (
    profilesMessage: ProfilesMessage | null
  ) => void;

  setAutoCheckProfiles: (
    autoCheckProfiles: boolean
  ) => void;

  addPrinter: (
    printer: Printer
  ) => void;

  setSelectedPrinter: (
    printer: Printer | null
  ) => void;

  clearSelectedPrinter: () => void;
}

export const usePrinterStore =
  create<PrinterState>((set) => ({
    printers: [],

    userPrinterIds: [],

    profiles: null,

    profilesMessage: null,

    autoCheckProfiles: true,

    selectedPrinter: null,

    projectPrinter: null,

    setProjectPrinter: (printer) =>
      set({
        projectPrinter: printer
      }),

    setPrinters: (printers) =>
      set({
        printers
      }),

    setUserPrinterIds: (userPrinterIds) =>
      set({
        userPrinterIds
      }),

    setProfiles: (profiles) =>
      set({
        profiles
      }),

    setProfilesMessage: (profilesMessage) =>
      set({
        profilesMessage
      }),

    setAutoCheckProfiles: (autoCheckProfiles) =>
      set({
        autoCheckProfiles
      }),

    addPrinter: (printer) =>
      set((state) => ({
        printers: [
          ...state.printers,
          printer
        ]
      })),

    setSelectedPrinter: (printer) =>
      set({
        selectedPrinter: printer
      }),

    clearSelectedPrinter: () =>
      set({
        selectedPrinter: null
      })
  }));
