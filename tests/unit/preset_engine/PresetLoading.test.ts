/**
 * SlicyWeb
 * Preset Loading Tests
 *
 * The 11 presets shipped in data/presets/ (PRINT_PRESETS_SPEC.md 1.3.0,
 * Shipped Presets and Preset Values) are valid (PresetSchema, strict)
 * and have the values of Preset Values; a field fanSpeed or a support
 * type organic is refused; a refused file does not stop the other
 * presets; preset:getAll returns the 11 presets (API_SPEC.md, PresetIPC
 * Channels).
 *
 * Based on:
 * - DATA_SCHEMA.md (Print Preset Schema, Preset Settings, Repository Data
 *   Schema 3.10.0)
 * - PRINT_PRESETS_SPEC.md 1.3.0
 * - TEST_PLAN.md (Classification and Recommendation Engine Unit Tests,
 *   lot 86)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (event: unknown, requestId: string) => Promise<unknown>;

const handlers = new Map<string, Handler>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: Handler) =>
      handlers.set(channel, handler),
  },
}));

const { PresetIPC } = await import("../../../src/electron/ipc/PresetIPC");
const { PresetLoader } = await import("../../../src/preset_engine/PresetLoader");
const { PresetProfileFileSchema, PresetSchema } =
  await import("../../../src/schemas/PrintPresetSchema");

const SHIPPED = path.resolve(__dirname, "../../../data/presets");

/** Preset Values of PRINT_PRESETS_SPEC.md 1.3.0 */
const PRESET_VALUES: [string, string, number, number, number, number, number, string, string, number][] = [
  ["ultra_quality", "Ultra Quality", 0.08, 3, 10, 8, 10, "gyroid", "tree", 60],
  ["high_quality", "High Quality", 0.12, 3, 7, 6, 15, "gyroid", "tree", 100],
  ["balanced", "Balanced", 0.2, 3, 5, 4, 15, "gyroid", "tree", 150],
  ["draft", "Draft", 0.28, 2, 4, 3, 5, "lightning", "standard", 200],
  ["fast_prototype", "Fast Prototype", 0.28, 2, 4, 3, 10, "lightning", "standard", 250],
  ["functional", "Functional", 0.2, 4, 6, 5, 25, "gyroid", "standard", 120],
  ["structural", "Structural", 0.2, 5, 7, 6, 50, "cubic", "standard", 80],
  ["engineering", "Engineering", 0.16, 4, 7, 6, 35, "cubic", "standard", 80],
  ["flexible", "Flexible", 0.2, 3, 5, 4, 15, "gyroid", "standard", 30],
  ["miniature", "Miniature", 0.08, 3, 10, 8, 15, "gyroid", "tree", 40],
  ["vase", "Vase", 0.2, 1, 0, 4, 0, "gyroid", "none", 80],
];

function shippedFile(name: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(SHIPPED, `${name}.json`), "utf8"),
  ) as Record<string, unknown>;
}

function loadShipped() {
  const loader = new PresetLoader();
  const result = loader.loadPresets([{ folder: SHIPPED, source: "Official" }]);

  return { loader, result };
}

describe("Shipped presets (PRINT_PRESETS_SPEC.md 1.3.0)", () => {
  it("loads the 11 presets without refusal", () => {
    const { loader, result } = loadShipped();

    expect(result.rejected).toEqual([]);
    expect(result.loaded).toBe(11);
    expect(loader.getPresets().map((preset) => preset.category).sort()).toEqual(
      PRESET_VALUES.map(([category]) => category).sort(),
    );
  });

  it.each(PRESET_VALUES)(
    "%s has the values of Preset Values",
    (category, name, layerHeight, wallCount, topLayers, bottomLayers, infillDensity, infillPattern, supportType, printSpeed) => {
      const file = PresetProfileFileSchema.parse(shippedFile(category));

      expect(file).toMatchObject({
        id: category,
        type: "preset",
        source: "Official",
        validated: false,
      });
      expect(file.data).toMatchObject({ name, category, confidenceScore: 100 });
      expect(file.data.settings).toEqual({
        layerHeight,
        wallCount,
        topLayers,
        bottomLayers,
        infillDensity,
        infillPattern,
        supportEnabled: false,
        supportType,
        adhesionType: "skirt",
        printSpeed,
      });
    },
  );
});

describe("PresetSchema (DATA_SCHEMA.md 3.10.0, strict)", () => {
  const balanced = () =>
    (shippedFile("balanced").data as { settings: Record<string, unknown> });

  it("refuses a field fanSpeed", () => {
    const preset = balanced();
    preset.settings.fanSpeed = 100;

    expect(PresetSchema.safeParse(preset).success).toBe(false);
  });

  it("refuses the support type organic", () => {
    const preset = balanced();
    preset.settings.supportType = "organic";

    expect(PresetSchema.safeParse(preset).success).toBe(false);
  });

  it("refuses a field outside the schema and a wall count that is not whole", () => {
    expect(PresetSchema.safeParse({ ...balanced(), extra: 1 }).success).toBe(false);

    const preset = balanced();
    preset.settings.wallCount = 2.5;
    expect(PresetSchema.safeParse(preset).success).toBe(false);
  });
});

describe("PresetLoader", () => {
  let folder: string;

  beforeEach(() => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-presets-"));
  });

  afterEach(() => {
    fs.rmSync(folder, { recursive: true, force: true });
  });

  function write(name: string, content: unknown): void {
    fs.writeFileSync(
      path.join(folder, name),
      typeof content === "string" ? content : JSON.stringify(content),
    );
  }

  it("refuses a file without stopping the other presets (SCH_001)", () => {
    write("balanced.json", shippedFile("balanced"));
    write("broken.json", "{ not json");

    const draft = shippedFile("draft");
    (draft.data as { settings: Record<string, unknown> }).settings.fanSpeed = 100;
    write("draft.json", draft);

    const loader = new PresetLoader();
    const result = loader.loadPresets([{ folder, source: "Official" }]);

    expect(result.loaded).toBe(1);
    expect(loader.getPresets()[0]?.category).toBe("balanced");
    expect(result.rejected.map(({ fileName, code }) => [fileName, code])).toEqual([
      ["broken.json", "SCH_001"],
      ["draft.json", "SCH_001"],
    ]);
  });

  it("refuses a preset of another source and an id already loaded", () => {
    write("a.json", shippedFile("balanced"));
    write("b.json", shippedFile("balanced"));
    write("c.json", { ...shippedFile("draft"), source: "Community" });

    const result = new PresetLoader().loadPresets([
      { folder, source: "Official" },
    ]);

    expect(result.loaded).toBe(1);
    expect(result.rejected.map(({ fileName, reason }) => [fileName, reason])).toEqual([
      ["b.json", "id: balanced is already loaded"],
      ["c.json", "source: Community is not Official"],
    ]);
  });
});

describe("preset:getAll (API_SPEC.md, PresetIPC Channels)", () => {
  it("returns the 11 presets", async () => {
    const { loader } = loadShipped();
    new PresetIPC(loader).register();

    const response = (await handlers.get("preset:getAll")?.(null, "r1")) as {
      success: boolean;
      data: { presets: unknown[] };
    };

    expect(response.success).toBe(true);
    expect(response.data.presets).toHaveLength(11);
    expect(response.data.presets).toEqual(loader.getPresets());
  });
});
