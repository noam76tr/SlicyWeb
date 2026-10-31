/**
 * SlicyWeb
 * Material and Filament IPC Tests
 *
 * material:getAll and filament:getAll (API_SPEC.md, MaterialIPC and
 * FilamentIPC Channels) serve the materials and filaments loaded by the
 * main process; filament:getAll also gives the ids of the filaments of
 * the user. filament:add, filament:update and filament:remove change the
 * filaments of the user (Phase 8 lot 71), never an Official filament
 * (FIL_003); an invalid payload is refused without throwing.
 *
 * The material and filaments of these tests are test data, not real
 * products.
 *
 * Based on:
 * - API_SPEC.md (MaterialIPC Channels, FilamentIPC Channels)
 * - ERROR_CODES_SPEC.md (FIL_001, FIL_003, FIL_004)
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
const { FilamentService } =
  await import("../../../src/services/FilamentService");
const { MaterialService } =
  await import("../../../src/services/MaterialService");

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

function invoke(channel: string, payload?: unknown): Promise<unknown> {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`No handler for ${channel}`);
  return handler({}, "request-1", payload);
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
  write(
    path.join(root, "filaments"),
    "filament",
    "Official",
    filament("official", null),
  );
  write(
    path.join(root, "user"),
    "filament",
    "Local Custom",
    filament("mine", "Red"),
  );
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

it("adds, updates and removes a filament of the user", async () => {
  const added = (await invoke("filament:add", {
    ...filament("new", "Blue"),
    name: "Mine 2",
  })) as { success: boolean; data: { filament: { id: string } } };

  expect(added.success).toBe(true);
  const id = added.data.filament.id;
  expect(id).toMatch(/^user_[0-9a-f]{32}$/);
  expect(await invoke("filament:getAll")).toMatchObject({
    data: { userFilamentIds: ["mine", id] },
  });
  expect(fs.readdirSync(path.join(root, "user")).sort()).toEqual(
    [`${id}.json`, "mine.json"].sort(),
  );

  expect(
    await invoke("filament:update", {
      ...filament(id, "Blue"),
      name: "Mine 2",
      pricePerKg: 22,
    }),
  ).toMatchObject({
    success: true,
    data: { filament: { id, pricePerKg: 22 } },
  });

  expect(await invoke("filament:remove", { filamentId: id })).toMatchObject({
    success: true,
    data: { filamentId: id },
  });
  expect(fs.readdirSync(path.join(root, "user"))).toEqual(["mine.json"]);
});

it("never changes a filament that is not of the user (FIL_003)", async () => {
  expect(
    await invoke("filament:update", { ...filament("official", "Red") }),
  ).toMatchObject({
    success: false,
    errors: ["FIL_003 Filament Not Editable"],
  });
  expect(
    await invoke("filament:remove", { filamentId: "official" }),
  ).toMatchObject({
    success: false,
    errors: ["FIL_003 Filament Not Editable"],
  });
  expect(
    await invoke("filament:remove", { filamentId: "unknown" }),
  ).toMatchObject({
    success: false,
    errors: ["FIL_001 Filament Not Found"],
  });
});

it("refuses an invalid filament or the same brand, name and color", async () => {
  expect(
    await invoke("filament:add", { ...filament("x", "Red"), diameter: 3 }),
  ).toMatchObject({
    success: false,
    errors: [expect.stringMatching(/^diameter: /)],
  });
  expect(
    await invoke("filament:add", { ...filament("x", "Red"), extra: true }),
  ).toMatchObject({ success: false });
  expect(
    await invoke("filament:add", {
      ...filament("x", "Red"),
      temperature: {
        minNozzle: 240,
        maxNozzle: 200,
        minBed: null,
        maxBed: null,
      },
    }),
  ).toMatchObject({ success: false });
  expect(await invoke("filament:remove", "../settings.json")).toMatchObject({
    success: false,
  });
  expect(
    await invoke("filament:add", { ...filament("mine", "red") }),
  ).toMatchObject({
    success: false,
    errors: ["FIL_004 Filament Already Exists"],
  });
  expect(fs.readdirSync(path.join(root, "user"))).toEqual(["mine.json"]);
});
