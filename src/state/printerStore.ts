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

interface PrinterState {
  printers: Printer[];

  /** Ids of the printers entered by the user (Local Custom) */
  userPrinterIds: string[];

  selectedPrinter: Printer | null;

  setPrinters: (
    printers: Printer[]
  ) => void;

  setUserPrinterIds: (
    userPrinterIds: string[]
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

    selectedPrinter: null,

    setPrinters: (printers) =>
      set({
        printers
      }),

    setUserPrinterIds: (userPrinterIds) =>
      set({
        userPrinterIds
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
