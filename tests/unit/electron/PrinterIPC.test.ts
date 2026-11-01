/**
 * SlicyWeb
 * Printer IPC Tests
 *
 * printer:* channels (API_SPEC.md, PrinterIPC Channels): printer:getAll,
 * printer:get and printer:count serve the printers loaded by the main
 * process; an unknown printer returns PRN_001; an invalid payload is
 * refused without throwing; printer:add, printer:update and
 * printer:remove change the printers of the user (Phase 7 lot 61) and
 * never an Official printer (PRN_005); printer:refresh checks the
 * profile repository (Phase 7 lot 62), with the materials and the
 * filaments (Phase 8 lot 72).
 *
 * Based on:
 * - API_SPEC.md (PrinterIPC Channels)
 * - ERROR_CODES_SPEC.md (PRN_001, PRN_005, PRN_006, SYNC_001, SYNC_002)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (
  event: unknown,
  requestId: string,
  payload?: unknown,
) => Promise<unknown>;

const handlers = new Map<string, Handler>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: Handler) =>
      handlers.set(channel, handler),
  },
}));

const { PrinterIPC } = await import("../../../src/electron/ipc/PrinterIPC");
const { PrinterService } = await import("../../../src/services/PrinterService");

const printer = {
  id: "test-printer",
  brand: "Test",
  model: "Model",
  series: "",
  manufacturer: "Test",
  firmware: "",
  releaseDate: "",
  supported: true,
  buildVolume: { x: 200, y: 200, z: 180 },
  defaultNozzle: 0.4,
  supportedNozzles: [0.4],
  motion: {
    maxPrintSpeed: null,
    maxTravelSpeed: null,
    maxAcceleration: null,
    maxJerk: null,
  },
  thermal: { maxNozzleTemp: 300, maxBedTemp: 100, maxChamberTemp: null },
  cooling: { partFan: true, auxFan: false, chamberFan: false },
  extruder: { type: "direct_drive" as const, count: 1 },
  supportedMaterials: [],
  supportedFilaments: [],
};

let service: InstanceType<typeof PrinterService>;
let root: string;

function invoke(channel: string, payload?: unknown): Promise<unknown> {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`No handler for ${channel}`);
  return handler({}, "request-1", payload);
}

beforeEach(() => {
  handlers.clear();
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-printer-ipc-"));
  service = new PrinterService();
  service.loadProfiles([
    { folder: path.join(root, "printers"), source: "Local Custom" },
  ]);
  service.addPrinter(printer);
  new PrinterIPC(service).register();
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("Printer IPC", () => {
  it("returns the loaded printers and their count", async () => {
    expect(await invoke("printer:getAll")).toMatchObject({
      success: true,
      data: {
        printers: [printer],
        userPrinterIds: [],
        profiles: { origin: "application", tag: null, checkedAt: null },
      },
      errors: [],
    });
    expect(await invoke("printer:count")).toMatchObject({
      success: true,
      data: { count: 1 },
    });
  });

  it("returns a printer by id, or PRN_001", async () => {
    expect(
      await invoke("printer:get", { printerId: "test-printer" }),
    ).toMatchObject({
      success: true,
      data: { printer },
    });
    expect(await invoke("printer:get", { printerId: "other" })).toMatchObject({
      success: false,
      errors: ["PRN_001 Printer Not Found"],
    });
  });

  it("refuses an invalid payload without throwing", async () => {
    expect(await invoke("printer:get", { printerId: "" })).toMatchObject({
      success: false,
    });
    expect(await invoke("printer:get", "../settings.json")).toMatchObject({
      success: false,
    });
  });

  it("adds, updates and removes a printer of the user", async () => {
    const added = (await invoke("printer:add", {
      ...printer,
      model: "Mine",
    })) as { success: boolean; data: { printer: { id: string } } };

    expect(added.success).toBe(true);
    const id = added.data.printer.id;
    expect(id).toMatch(/^user_/);
    expect(await invoke("printer:getAll")).toMatchObject({
      data: { userPrinterIds: [id] },
    });
    expect(fs.readdirSync(path.join(root, "printers"))).toEqual([`${id}.json`]);

    expect(
      await invoke("printer:update", { ...printer, id, model: "Mine 2" }),
    ).toMatchObject({
      success: true,
      data: { printer: { id, model: "Mine 2" } },
    });

    expect(await invoke("printer:remove", { printerId: id })).toMatchObject({
      success: true,
      data: { printerId: id },
    });
    expect(service.getPrinters()).toEqual([printer]);
  });

  it("never changes a printer that is not of the user (PRN_005)", async () => {
    expect(
      await invoke("printer:update", { ...printer, model: "Changed" }),
    ).toMatchObject({
      success: false,
      errors: ["PRN_005 Printer Not Editable"],
    });
    expect(
      await invoke("printer:remove", { printerId: "test-printer" }),
    ).toMatchObject({
      success: false,
      errors: ["PRN_005 Printer Not Editable"],
    });
    expect(service.getPrinters()).toEqual([printer]);
  });

  it("refuses an invalid printer or the same brand and model", async () => {
    expect(
      await invoke("printer:add", { ...printer, defaultNozzle: 0.6 }),
    ).toMatchObject({
      success: false,
      errors: [
        "defaultNozzle: The default nozzle is not in the list of nozzles",
      ],
    });
    expect(
      await invoke("printer:add", { ...printer, extra: true }),
    ).toMatchObject({ success: false });
    expect(await invoke("printer:add", { ...printer })).toMatchObject({
      success: false,
      errors: ["PRN_006 Printer Already Exists"],
    });
    expect(service.getPrinters()).toEqual([printer]);
  });

  it("checks the profile repository (printer:refresh)", async () => {
    const profiles = { origin: "repository", tag: "v1.0.0", checkedAt: null };
    const check = vi
      .fn()
      .mockResolvedValueOnce({ status: "updated", profiles })
      .mockResolvedValueOnce({
        status: "failed",
        profiles,
        code: "SYNC_002",
        reason: "main/index.json: HTTP 404",
      });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    handlers.clear();
    new PrinterIPC(service, {
      check,
      status: () => profiles,
    } as never).register();

    expect(await invoke("printer:refresh", { force: true })).toMatchObject({
      success: true,
      data: { status: "updated", profiles },
    });
    expect(check).toHaveBeenLastCalledWith(true);
    expect(await invoke("printer:refresh")).toMatchObject({
      success: false,
      data: { status: "failed", profiles },
      errors: ["SYNC_002 Remote Source Unavailable"],
    });
    expect(check).toHaveBeenLastCalledWith(false);
    expect(await invoke("printer:getAll")).toMatchObject({
      data: { profiles },
    });
    expect(await invoke("printer:refresh", { force: "yes" })).toMatchObject({
      success: false,
    });
    expect(check).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("checks the materials and the filaments with the printers", async () => {
    const profiles = { origin: "application", tag: "v1.0.1", checkedAt: null };
    const listProfiles = {
      origin: "repository",
      tag: "v1.1.1",
      checkedAt: null,
    };
    const printers = vi
      .fn()
      .mockResolvedValue({ status: "upToDate", profiles });
    const materials = vi
      .fn()
      .mockResolvedValue({ status: "updated", profiles: listProfiles });
    const filaments = vi.fn().mockResolvedValue({
      status: "failed",
      profiles: listProfiles,
      code: "SYNC_004",
      reason: "filaments/x.json: SHA-256 differs",
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    handlers.clear();
    new PrinterIPC(
      service,
      { check: printers, status: () => profiles } as never,
      {
        materials: { check: materials } as never,
        filaments: { check: filaments } as never,
      },
    ).register();

    expect(await invoke("printer:refresh", { force: true })).toMatchObject({
      success: false,
      data: {
        status: "upToDate",
        profiles,
        materials: { status: "updated", profiles: listProfiles },
        filaments: { status: "failed", profiles: listProfiles },
      },
      errors: ["SYNC_004 Remote Data Validation Failed"],
    });
    expect(materials).toHaveBeenCalledWith(true);
    expect(filaments).toHaveBeenCalledWith(true);
    expect(warn).toHaveBeenCalledWith(
      "SYNC_004 Remote Data Validation Failed (Filament): filaments/x.json: SHA-256 differs",
    );
    warn.mockRestore();
  });

  it("answers SYNC_001 without a profile synchronization", async () => {
    expect(await invoke("printer:refresh", { force: true })).toMatchObject({
      success: false,
      errors: ["SYNC_001 Repository Synchronization Failed"],
    });
  });
});
