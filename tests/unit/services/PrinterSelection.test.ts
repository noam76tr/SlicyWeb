/**
 * SlicyWeb
 * Printer Selection Tests
 *
 * Printers of the window (Phase 7): the printers served by printer:getAll
 * are validated and sorted by brand, then by model; the last printer is
 * selected again when autoloadLastPrinter is true and it is still loaded;
 * a choice is saved as defaultPrinter (settings:update); an invalid
 * response is refused; outside Electron nothing happens.
 *
 * The bridge window.slicyWeb is replaced by a fake one: the tests run in
 * Node.js, without Electron.
 *
 * Based on:
 * - DATA_SCHEMA.md (Printer Schema, User Preferences Schema)
 * - API_SPEC.md (PrinterIPC Channels, SettingsIPC Channels)
 * - TEST_PLAN.md
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrinterSelectionService } from "../../../src/services/PrinterSelectionService";
import { usePrinterStore } from "../../../src/state/printerStore";

import type { Printer } from "../../../src/types/Printer";
import type { PrinterPreferences } from "../../../src/types/UserPreferences";

/** Test data, not real printers */
function makePrinter(id: string, brand: string, model: string): Printer {
  return {
    id,
    brand,
    model,
    series: "",
    manufacturer: brand,
    firmware: "",
    releaseDate: "",
    supported: true,
    buildVolume: { x: 200, y: 180, z: 150 },
    defaultNozzle: 0.4,
    supportedNozzles: [0.4],
    motion: {
      maxPrintSpeed: null,
      maxTravelSpeed: null,
      maxAcceleration: null,
      maxJerk: null,
    },
    thermal: { maxNozzleTemp: 280, maxBedTemp: 100, maxChamberTemp: null },
    cooling: { partFan: true, auxFan: false, chamberFan: false },
    extruder: { type: "unknown", count: 1 },
    supportedMaterials: [],
    supportedFilaments: [],
  };
}

const zeta = makePrinter("zeta_b", "Zeta", "B");
const alphaY = makePrinter("alpha_y", "Alpha", "Y");
const alphaX = makePrinter("alpha_x", "Alpha", "X");

let printers: unknown[];
let preferences: PrinterPreferences;
let invoke: ReturnType<typeof vi.fn>;

function settingsResponse(): unknown {
  return {
    success: true,
    data: {
      settings: {
        theme: "dark",
        language: "en",
        units: "metric",
        printer: preferences,
      },
    },
    errors: [],
  };
}

beforeEach(() => {
  printers = [zeta, alphaY, alphaX];
  preferences = { defaultPrinter: null, autoloadLastPrinter: true };
  invoke = vi.fn((channel: string, payload?: unknown) => {
    switch (channel) {
      case "printer:getAll":
        return Promise.resolve({
          success: true,
          data: { printers },
          errors: [],
        });
      case "settings:get":
        return Promise.resolve(settingsResponse());
      case "settings:update":
        preferences = (payload as { printer: PrinterPreferences }).printer;
        return Promise.resolve(settingsResponse());
      default:
        return Promise.reject(new Error(`Unexpected channel ${channel}`));
    }
  });
  vi.stubGlobal("window", { slicyWeb: { invoke } });
  usePrinterStore.setState({ printers: [], selectedPrinter: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PrinterSelectionService.load", () => {
  it("puts the printers in the store, sorted by brand then model", async () => {
    await PrinterSelectionService.load();

    const { printers: loaded, selectedPrinter } = usePrinterStore.getState();
    expect(loaded.map(({ id }) => id)).toEqual([
      "alpha_x",
      "alpha_y",
      "zeta_b",
    ]);
    expect(selectedPrinter).toBeNull();
  });

  it("selects the last printer again", async () => {
    preferences = { defaultPrinter: "zeta_b", autoloadLastPrinter: true };

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().selectedPrinter).toEqual(zeta);
  });

  it("does not select the last printer when autoload is off", async () => {
    preferences = { defaultPrinter: "zeta_b", autoloadLastPrinter: false };

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().selectedPrinter).toBeNull();
  });

  it("ignores a last printer that is no longer loaded", async () => {
    preferences = { defaultPrinter: "removed", autoloadLastPrinter: true };

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().printers).toHaveLength(3);
    expect(usePrinterStore.getState().selectedPrinter).toBeNull();
  });

  it("refuses an invalid response, without changing the store", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    printers = [{ ...zeta, buildVolume: { x: -1, y: 180, z: 150 } }];

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().printers).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("does nothing outside Electron", async () => {
    vi.stubGlobal("window", undefined);

    await PrinterSelectionService.load();

    expect(invoke).not.toHaveBeenCalled();
    expect(usePrinterStore.getState().printers).toEqual([]);
  });
});

describe("PrinterSelectionService.select", () => {
  beforeEach(async () => {
    await PrinterSelectionService.load();
    invoke.mockClear();
  });

  it("selects a printer and saves it as the last printer", async () => {
    await PrinterSelectionService.select("alpha_y");

    expect(usePrinterStore.getState().selectedPrinter).toEqual(alphaY);
    expect(invoke).toHaveBeenCalledWith("settings:update", {
      printer: { defaultPrinter: "alpha_y", autoloadLastPrinter: true },
    });
    expect(preferences.defaultPrinter).toBe("alpha_y");
  });

  it("keeps autoloadLastPrinter as saved", async () => {
    preferences = { defaultPrinter: null, autoloadLastPrinter: false };

    await PrinterSelectionService.select("zeta_b");

    expect(preferences).toEqual({
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: false,
    });
  });

  it("clears the printer with null", async () => {
    await PrinterSelectionService.select("zeta_b");
    await PrinterSelectionService.select(null);

    expect(usePrinterStore.getState().selectedPrinter).toBeNull();
    expect(preferences.defaultPrinter).toBeNull();
  });

  it("ignores an unknown printer", async () => {
    await PrinterSelectionService.select("zeta_b");
    await PrinterSelectionService.select("unknown");

    expect(usePrinterStore.getState().selectedPrinter).toEqual(zeta);
    expect(invoke).not.toHaveBeenCalledWith(
      "settings:update",
      expect.objectContaining({
        printer: expect.objectContaining({ defaultPrinter: "unknown" }),
      }),
    );
  });
});
