/**
 * SlicyWeb
 * Printer Selection Tests
 *
 * Printers of the window (Phase 7): the printers served by printer:getAll
 * are validated and sorted by brand, then by model; the last printer is
 * selected again when autoloadLastPrinter is true and it is still loaded;
 * a choice is saved as defaultPrinter (settings:update); an invalid
 * response is refused; outside Electron nothing happens. Printers of
 * the user (Phase 7 lot 61): add, update and remove read the printers
 * again; the selected printer follows its update, and is cleared (with
 * the saved choice) when it is removed; a refused change returns its
 * errors. Profiles (Phase 7 lot 62): load() checks the profile
 * repository in the background, silently; Refresh Profiles shows the
 * result; updated profiles are read again, and a printer no longer
 * listed is no longer selected; with the setting autoCheckProfiles off,
 * load() does not check, and the setting is saved with the other
 * printer settings.
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
let userPrinterIds: string[];
let preferences: PrinterPreferences;
let invoke: ReturnType<typeof vi.fn>;
let refreshResponse: unknown;

const fromRepository = {
  origin: "repository",
  tag: "v1.0.1",
  checkedAt: "2026-10-27T08:00:00.000Z",
};

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
  userPrinterIds = [];
  refreshResponse = {
    success: true,
    data: {
      status: "skipped",
      profiles: { origin: "application", tag: "v1.0.0", checkedAt: null },
    },
    errors: [],
  };
  preferences = {
    defaultPrinter: null,
    autoloadLastPrinter: true,
    autoCheckProfiles: true,
  };
  invoke = vi.fn((channel: string, payload?: unknown) => {
    switch (channel) {
      case "printer:getAll":
        return Promise.resolve({
          success: true,
          data: { printers, userPrinterIds },
          errors: [],
        });
      case "printer:add":
      case "printer:update": {
        const printer = { ...(payload as Printer) };
        if (channel === "printer:add") printer.id = "user_1";
        printers = [
          ...printers.filter((item) => (item as Printer).id !== printer.id),
          printer,
        ];
        userPrinterIds = [...new Set([...userPrinterIds, printer.id])];
        return Promise.resolve({
          success: true,
          data: { printer },
          errors: [],
        });
      }
      case "printer:remove": {
        const { printerId } = payload as { printerId: string };
        if (!userPrinterIds.includes(printerId)) {
          return Promise.resolve({
            success: false,
            data: {},
            errors: ["PRN_005 Printer Not Editable"],
          });
        }
        printers = printers.filter(
          (item) => (item as Printer).id !== printerId,
        );
        userPrinterIds = userPrinterIds.filter((id) => id !== printerId);
        return Promise.resolve({
          success: true,
          data: { printerId },
          errors: [],
        });
      }
      case "printer:refresh":
        return Promise.resolve(refreshResponse);
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
  usePrinterStore.setState({
    printers: [],
    userPrinterIds: [],
    selectedPrinter: null,
    profiles: null,
    profilesMessage: null,
    autoCheckProfiles: true,
  });
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
    preferences = {
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: true,
      autoCheckProfiles: true,
    };

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().selectedPrinter).toEqual(zeta);
  });

  it("does not select the last printer when autoload is off", async () => {
    preferences = {
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: false,
      autoCheckProfiles: true,
    };

    await PrinterSelectionService.load();

    expect(usePrinterStore.getState().selectedPrinter).toBeNull();
  });

  it("ignores a last printer that is no longer loaded", async () => {
    preferences = {
      defaultPrinter: "removed",
      autoloadLastPrinter: true,
      autoCheckProfiles: true,
    };

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
      printer: {
        defaultPrinter: "alpha_y",
        autoloadLastPrinter: true,
        autoCheckProfiles: true,
      },
    });
    expect(preferences.defaultPrinter).toBe("alpha_y");
  });

  it("keeps autoloadLastPrinter and autoCheckProfiles as saved", async () => {
    preferences = {
      defaultPrinter: null,
      autoloadLastPrinter: false,
      autoCheckProfiles: false,
    };

    await PrinterSelectionService.select("zeta_b");

    expect(preferences).toEqual({
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: false,
      autoCheckProfiles: false,
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

describe("Printers of the user", () => {
  beforeEach(async () => {
    await PrinterSelectionService.load();
  });

  it("adds a printer and reads the printers again", async () => {
    const result = await PrinterSelectionService.add(
      makePrinter("user_new", "Home", "Box"),
    );

    expect(result).toMatchObject({ ok: true, printer: { id: "user_1" } });
    expect(usePrinterStore.getState().userPrinterIds).toEqual(["user_1"]);
    expect(usePrinterStore.getState().printers.map(({ id }) => id)).toEqual([
      "alpha_x",
      "alpha_y",
      "user_1",
      "zeta_b",
    ]);
  });

  it("updates the selected printer in the store", async () => {
    await PrinterSelectionService.add(makePrinter("user_new", "Home", "Box"));
    await PrinterSelectionService.select("user_1");

    const changed = {
      ...makePrinter("user_1", "Home", "Box"),
      buildVolume: { x: 300, y: 300, z: 300 },
    };
    await PrinterSelectionService.update(changed);

    expect(usePrinterStore.getState().selectedPrinter).toEqual(changed);
  });

  it("clears the selected printer and the saved choice when it is removed", async () => {
    await PrinterSelectionService.add(makePrinter("user_new", "Home", "Box"));
    await PrinterSelectionService.select("user_1");

    expect(await PrinterSelectionService.remove("user_1")).toMatchObject({
      ok: true,
    });

    expect(usePrinterStore.getState().selectedPrinter).toBeNull();
    expect(usePrinterStore.getState().userPrinterIds).toEqual([]);
    expect(preferences.defaultPrinter).toBeNull();
  });

  it("returns the errors of a refused change, without changing the store", async () => {
    await PrinterSelectionService.select("zeta_b");

    expect(await PrinterSelectionService.remove("zeta_b")).toEqual({
      ok: false,
      errors: ["PRN_005 Printer Not Editable"],
    });
    expect(usePrinterStore.getState().selectedPrinter).toEqual(zeta);
    expect(usePrinterStore.getState().printers).toHaveLength(3);
  });
});

describe("PrinterSelectionService.refresh", () => {
  it("checks in the background at start, without a message", async () => {
    await PrinterSelectionService.load();
    await vi.waitFor(() =>
      expect(invoke).toHaveBeenCalledWith("printer:refresh", { force: false }),
    );

    expect(usePrinterStore.getState().profiles).toEqual({
      origin: "application",
      tag: "v1.0.0",
      checkedAt: null,
    });
    expect(usePrinterStore.getState().profilesMessage).toBeNull();
  });

  it("reads the updated profiles and drops a printer no longer listed", async () => {
    preferences = {
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: true,
      autoCheckProfiles: true,
    };
    await PrinterSelectionService.load();
    printers = [alphaX];
    refreshResponse = {
      success: true,
      data: { status: "updated", profiles: fromRepository },
      errors: [],
    };

    await PrinterSelectionService.refresh(false);

    const state = usePrinterStore.getState();
    expect(state.printers).toEqual([alphaX]);
    expect(state.selectedPrinter).toBeNull();
    expect(preferences.defaultPrinter).toBeNull();
    expect(state.profiles).toEqual(fromRepository);
    expect(state.profilesMessage).toEqual({
      key: "printer.profiles.updated",
      tag: "v1.0.1",
    });
  });

  it("shows the result of a forced check", async () => {
    refreshResponse = {
      success: true,
      data: { status: "upToDate", profiles: fromRepository },
      errors: [],
    };
    await PrinterSelectionService.refresh(true);
    expect(usePrinterStore.getState().profilesMessage).toEqual({
      key: "printer.profiles.upToDate",
      tag: "v1.0.1",
    });

    refreshResponse = {
      success: false,
      data: { status: "failed", profiles: fromRepository },
      errors: ["SYNC_004 Remote Data Validation Failed"],
    };
    await PrinterSelectionService.refresh(true);
    expect(usePrinterStore.getState().profilesMessage).toEqual({
      key: "printer.profiles.refused",
      tag: "v1.0.1",
    });

    refreshResponse = {
      success: false,
      data: { status: "failed", profiles: fromRepository },
      errors: ["SYNC_002 Remote Source Unavailable"],
    };
    await PrinterSelectionService.refresh(true);
    expect(usePrinterStore.getState().profilesMessage?.key).toBe(
      "printer.profiles.unreachable",
    );

    refreshResponse = {
      success: true,
      data: { status: "notPublished", profiles: fromRepository },
      errors: [],
    };
    await PrinterSelectionService.refresh(true);
    expect(usePrinterStore.getState().profilesMessage?.key).toBe(
      "printer.profiles.notPublished",
    );
  });

  it("does not check at start when the setting is off", async () => {
    preferences = {
      defaultPrinter: null,
      autoloadLastPrinter: true,
      autoCheckProfiles: false,
    };

    await PrinterSelectionService.load();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(invoke).not.toHaveBeenCalledWith("printer:refresh", {
      force: false,
    });
    expect(usePrinterStore.getState().autoCheckProfiles).toBe(false);

    // Refresh Profiles still checks
    await PrinterSelectionService.refresh(true);
    expect(invoke).toHaveBeenCalledWith("printer:refresh", { force: true });
  });

  it("saves the setting and keeps the other printer settings", async () => {
    preferences = {
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: false,
      autoCheckProfiles: true,
    };

    await PrinterSelectionService.setAutoCheckProfiles(false);

    expect(preferences).toEqual({
      defaultPrinter: "zeta_b",
      autoloadLastPrinter: false,
      autoCheckProfiles: false,
    });
    expect(usePrinterStore.getState().autoCheckProfiles).toBe(false);
  });

  it("shows nothing when a check in the background fails", async () => {
    refreshResponse = {
      success: false,
      data: { status: "failed", profiles: fromRepository },
      errors: ["SYNC_002 Remote Source Unavailable"],
    };

    await PrinterSelectionService.refresh(false);

    expect(usePrinterStore.getState().profilesMessage).toBeNull();
  });
});
