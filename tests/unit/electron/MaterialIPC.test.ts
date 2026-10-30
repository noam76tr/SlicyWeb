/**
 * SlicyWeb
 * Material and Filament IPC Tests
 *
 * material:getAll and filament:getAll (API_SPEC.md, MaterialIPC and
 * FilamentIPC Channels) serve the materials and filaments loaded by the
 * main process; filament:getAll also gives the ids of the filaments of
 * the user.
 *
 * The material and filaments of these tests are test data, not real
 * products.
 *
 * Based on:
 * - API_SPEC.md (MaterialIPC Channels, FilamentIPC Channels)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, expect, it, vi } from "vitest";

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

const { FilamentIPC } = await import("../../../src/electron/ipc/FilamentIPC");
const { MaterialIPC } = await import("../../../src/electron/ipc/MaterialIPC");
const { FilamentService } = await import("../../../src/services/FilamentService");
const { MaterialService } = await import("../../../src/services/MaterialService");

const temperature = { minNozzle: 190, maxNozzle: 230, minBed: 35, maxBed: 65 };

const material = {
  id: "test_pla",
  name: "PLA",
  category: "PLA",
  temperature,
  cooling: { fanMin: null, fanMax: null },
  physical: { density: null, shrinkage: null, warpingRisk: null },
  recommended: {
    printSpeed: null,
    travelSpeed: null,
    retractionDistance: null,
    retractionSpeed: null,
  },
};

function filament(id: string, color: string | null): Record<string, unknown> {
  return {
    id,
    brand: "Test",
    name: id,
    material: "PLA",
    color,
    diameter: 1.75,
    density: null,
    pricePerKg: null,
    temperature,
    manufacturerSettings: {
      retractionDistance: null,
      retractionSpeed: null,
      fanSpeed: null,
      nozzleTemperature: null,
      bedTemperature: null,
    },
    recommendedProfile: {},
  };
}

function write(
  folder: string,
  type: string,
  source: string,
  data: Record<string, unknown>,
): void {
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, `${String(data.id)}.json`),
    JSON.stringify({
      id: data.id,
      type,
      version: "1.0.0",
      source,
      data,
      validated: false,
    }),
  );
}

let root: string;

function invoke(channel: string): Promise<unknown> {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`No handler for ${channel}`);
  return handler({}, "request-1");
}

beforeEach(() => {
  handlers.clear();
  root = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-material-ipc-"));

  const materials = new MaterialService();
  write(path.join(root, "materials"), "material", "Official", material);
  materials.loadProfiles([
    { folder: path.join(root, "materials"), source: "Official" },
  ]);

  const filaments = new FilamentService();
  write(path.join(root, "filaments"), "filament", "Official", filament("official", null));
  write(path.join(root, "user"), "filament", "Local Custom", filament("mine", "Red"));
  filaments.loadProfiles([
    { folder: path.join(root, "filaments"), source: "Official" },
    { folder: path.join(root, "user"), source: "Local Custom" },
  ]);

  new MaterialIPC(materials).register();
  new FilamentIPC(filaments).register();
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

it("material:getAll serves the loaded materials", async () => {
  await expect(invoke("material:getAll")).resolves.toEqual({
    channel: "material:getAll",
    requestId: "request-1",
    success: true,
    data: { materials: [material] },
    errors: [],
  });
});

it("filament:getAll serves the loaded filaments and the ids of the user", async () => {
  await expect(invoke("filament:getAll")).resolves.toEqual({
    channel: "filament:getAll",
    requestId: "request-1",
    success: true,
    data: {
      filaments: [filament("official", null), filament("mine", "Red")],
      userFilamentIds: ["mine"],
    },
    errors: [],
  });
});
