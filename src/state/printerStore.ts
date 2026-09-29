/**
 * Wichy
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

  selectedPrinter: Printer | null;

  setPrinters: (
    printers: Printer[]
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

    selectedPrinter: null,

    setPrinters: (printers) =>
      set({
        printers
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
