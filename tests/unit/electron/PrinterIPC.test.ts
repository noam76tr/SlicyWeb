/**
 * SlicyWeb
 * Printer IPC Tests
 *
 * printer:* channels (API_SPEC.md, PrinterIPC Channels): printer:getAll,
 * printer:get and printer:count serve the printers loaded by the main
 * process; an unknown printer returns PRN_001; an invalid payload is
 * refused without throwing; printer:add, printer:update and
 * printer:remove change nothing yet.
 *
 * Based on:
 * - API_SPEC.md (PrinterIPC Channels)
 * - ERROR_CODES_SPEC.md (PRN_001)
 * - TEST_PLAN.md
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

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

function invoke(channel: string, payload?: unknown): Promise<unknown> {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`No handler for ${channel}`);
  return handler({}, "request-1", payload);
}

beforeEach(() => {
  handlers.clear();
  service = new PrinterService();
  service.addPrinter(printer);
  new PrinterIPC(service).register();
});

describe("Printer IPC", () => {
  it("returns the loaded printers and their count", async () => {
    expect(await invoke("printer:getAll")).toMatchObject({
      success: true,
      data: { printers: [printer] },
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

  it("changes nothing with printer:add, printer:update and printer:remove", async () => {
    const other = { ...printer, id: "other" };

    expect(await invoke("printer:add", other)).toMatchObject({
      success: false,
    });
    expect(await invoke("printer:update", printer)).toMatchObject({
      success: false,
    });
    expect(
      await invoke("printer:remove", { printerId: "test-printer" }),
    ).toMatchObject({
      success: false,
    });
    expect(service.getPrinters()).toEqual([printer]);
  });
});
