/**
 * SlicyWeb
 * Cost Estimation Service Tests
 *
 * Phase 12 (ADR-037; answers of Noam to lot 107, Q6, Q10, Q12, Q13 A):
 * the estimation of an object comes by itself with its recommendation
 * (Prusa MK4S, PLA, Prusament PLA, presets of data/presets), and goes
 * away when the recommendation is outdated; a price given for a shipped
 * filament is used; the plate counts the visible objects only; an object
 * without volume has no estimation; the values typed in the Costs section
 * are read as the documentation says.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules, User Preferences
 *   Schema: cost)
 * - USER_SETTINGS_SPEC.md (2.3.0: Cost Settings)
 * - DECISIONS.md (ADR-037)
 */

import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { PresetLoader } from "../../../src/preset_engine/PresetLoader";
import { RecommendationEngine } from "../../../src/recommendation_engine/RecommendationEngine";
import { defaultCostPreferences } from "../../../src/schemas/UserPreferencesSchema";
import { CostEstimationService } from "../../../src/services/CostEstimationService";
import {
  CostSettingsService,
  parseCostField,
} from "../../../src/services/CostSettingsService";
import { useAnalysisStore } from "../../../src/state/analysisStore";
import { useAnalysisTaskStore } from "../../../src/state/analysisTaskStore";
import { useCostSettingsStore } from "../../../src/state/costSettingsStore";
import { useEstimationStore } from "../../../src/state/estimationStore";
import { useFilamentStore } from "../../../src/state/filamentStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePrinterStore } from "../../../src/state/printerStore";
import { useRecommendationStore } from "../../../src/state/recommendationStore";
import type { Analysis } from "../../../src/types/Analysis";
import type { Filament } from "../../../src/types/Filament";
import type { Material } from "../../../src/types/Material";
import type { Printer } from "../../../src/types/Printer";

const DATA = path.resolve(__dirname, "../../../data");

function data<T>(folder: string, id: string): T {
  return (
    JSON.parse(
      fs.readFileSync(path.join(DATA, folder, `${id}.json`), "utf8"),
    ) as { data: T }
  ).data;
}

const PRINTER = data<Printer>("printers", "prusa_mk4s");
const MATERIAL = data<Material>("materials", "pla");
const FILAMENT = data<Filament>("filaments", "prusament_pla");

const loader = new PresetLoader();
loader.loadPresets([
  { folder: path.join(DATA, "presets"), source: "Official" },
]);
const PRESETS = loader.getPresets();
const engine = new RecommendationEngine();

/** Analysis of a cube of 20 mm, up to date */
function analysis(objectId: string, volume = 8000): Analysis {
  return {
    analysisId: `analysis-${objectId}`,
    objectId,
    status: "generated",
    dimensions: { width: 20, depth: 20, height: 20 },
    geometry: { width: 20, depth: 20, height: 20, volume, surfaceArea: 2400 },
    mesh: { vertices: 8, triangles: 12 },
    stability: {
      contactArea: 400,
      heightRatio: 1,
      centerOfGravity: { x: 0, y: 0, z: 0 },
      riskScore: 0,
    },
    overhangs: { detected: false, maxAngle: 0, percentage: 0 },
    bridges: { detected: false, count: 0, longestBridge: 0 },
    thinWalls: { detected: false, minimumThickness: 20 },
    classification: {
      category: "mechanical_part",
      subcategory: "",
      confidenceScore: 65,
      detectedFeatures: ["planar"],
      detectedTags: [],
      classificationVersion: "1.2.2",
      source: "automatic",
    },
  };
}

/** A cube with its analysis, its faces and its recommendation */
function addCube(objectId: string, volume = 8000): void {
  const stored = analysis(objectId, volume);

  useObjectStore
    .getState()
    .addObject(ObjectFactory.create(objectId, `${objectId}.stl`, "stl"));
  useAnalysisStore.getState().setAnalysis(stored);
  useAnalysisTaskStore
    .getState()
    .setFaceAreas(objectId, { up: 400, down: 400, side: 1600 });
  useRecommendationStore.getState().setRecommendation(
    engine.generateRecommendation({
      analysis: stored,
      meshClosed: true,
      printer: PRINTER,
      printerIsUser: false,
      material: MATERIAL,
      filament: useFilamentStore.getState().selectedFilament,
      filamentIsUser: false,
      presets: PRESETS,
    }),
  );
}

const estimationOf = (objectId: string) =>
  useEstimationStore.getState().estimations[objectId];

let stop: (() => void) | null = null;

beforeEach(() => {
  useObjectStore.getState().clearObjects();
  useAnalysisStore.getState().clearAnalysis();
  useRecommendationStore.getState().clearRecommendations();
  useAnalysisTaskStore.setState({ faceAreas: {} });
  usePrinterStore.setState({ selectedPrinter: PRINTER, userPrinterIds: [] });
  useFilamentStore.setState({
    filaments: [FILAMENT],
    selectedFilament: FILAMENT,
    userFilamentIds: [],
  });
  useCostSettingsStore.getState().setSettings(defaultCostPreferences("fr"));
  useEstimationStore.getState().setEstimations({}, []);
  stop = CostEstimationService.start();
});

afterEach(() => {
  stop?.();
});

describe("Cost estimation service", () => {
  it("estimates an object as soon as its recommendation is up to date", () => {
    addCube("cube");
    CostEstimationService.flush();

    const estimation = estimationOf("cube");

    expect(estimation).toBeDefined();
    expect(estimation.estimation.layerCount).toBeGreaterThan(0);
    expect(estimation.estimation.printTime).toBeGreaterThan(0);
    expect(estimation.cost.filamentWeight).toBeGreaterThan(0);
    // A shipped filament has no price, no power given: no cost
    expect(estimation.cost.materialCost).toBeNull();
    expect(estimation.cost.totalCost).toBeNull();
  });

  it("uses the price given for a shipped filament and the power of the printer", async () => {
    addCube("cube");
    await CostSettingsService.setFilamentPrice(FILAMENT, 30);
    await CostSettingsService.setPrinterPower(PRINTER.id, 120);
    await CostSettingsService.setElectricityPrice(0.25);
    CostEstimationService.flush();

    const { cost } = estimationOf("cube");

    expect(CostSettingsService.pricePerKgOf(FILAMENT)).toBe(30);
    expect(cost.materialCost).toBe(
      Math.round(((cost.filamentWeight ?? 0) / 1000) * 30 * 100) / 100,
    );
    expect(cost.electricityCost).not.toBeNull();
    expect(cost.totalCost).toBe(
      Math.round(
        ((cost.materialCost ?? 0) + (cost.electricityCost ?? 0)) * 100,
      ) / 100,
    );

    // Forgotten again: no price
    await CostSettingsService.setFilamentPrice(FILAMENT, null);
    expect(CostSettingsService.pricePerKgOf(FILAMENT)).toBeNull();
  });

  it("takes the price of a filament of the user from the filament itself", () => {
    useFilamentStore.setState({ userFilamentIds: [FILAMENT.id] });
    useCostSettingsStore.getState().setSettings({
      ...defaultCostPreferences("fr"),
      filamentPrices: { [FILAMENT.id]: 99 },
    });

    expect(
      CostSettingsService.pricePerKgOf({ ...FILAMENT, pricePerKg: 22 }),
    ).toBe(22);
  });

  it("gives the time without a filament, and no weight (Q6 A)", () => {
    useFilamentStore.setState({ selectedFilament: null });
    addCube("cube");
    CostEstimationService.flush();

    expect(estimationOf("cube").estimation.printTime).toBeGreaterThan(0);
    expect(estimationOf("cube").cost.filamentWeight).toBeNull();
  });

  it("has no estimation while the recommendation is outdated", () => {
    addCube("cube");
    CostEstimationService.flush();
    expect(estimationOf("cube")).toBeDefined();

    useRecommendationStore.getState().markRecommendationOutdated("cube");
    CostEstimationService.flush();
    expect(estimationOf("cube")).toBeUndefined();
  });

  it("gives no estimation to an object without volume", () => {
    addCube("open", 0);
    CostEstimationService.flush();

    expect(estimationOf("open")).toBeUndefined();
    expect(useEstimationStore.getState().noVolumeObjectIds).toEqual(["open"]);
  });

  it("counts the visible objects of the plate only", () => {
    addCube("a");
    addCube("b");
    useObjectStore
      .getState()
      .addObject(ObjectFactory.create("c", "c.stl", "stl"));
    CostEstimationService.flush();

    const all = CostEstimationService.totalOf(
      CostEstimationService.plateObjectIds(),
    );
    expect(all.count).toBe(2);
    expect(all.missing).toBe(1);
    expect(all.printTime).toBe(
      estimationOf("a").estimation.printTime +
        estimationOf("b").estimation.printTime,
    );

    useObjectStore.getState().updateObjectStates({ b: { visible: false } });
    const visible = CostEstimationService.totalOf(
      CostEstimationService.plateObjectIds(),
    );
    expect(visible.count).toBe(1);
    expect(visible.printTime).toBe(estimationOf("a").estimation.printTime);
  });
});

describe("Values typed in the Costs section", () => {
  it("reads a price, a power, an empty field and a comma", () => {
    expect(parseCostField("0,25", "price")).toEqual({ ok: true, value: 0.25 });
    expect(parseCostField(" 24.99 ", "price")).toEqual({
      ok: true,
      value: 24.99,
    });
    expect(parseCostField("", "price")).toEqual({ ok: true, value: null });
    expect(parseCostField("0", "price")).toEqual({ ok: true, value: 0 });
    expect(parseCostField("120", "power")).toEqual({ ok: true, value: 120 });
  });

  it("refuses a negative price, a power of 0 and words", () => {
    expect(parseCostField("-1", "price").ok).toBe(false);
    expect(parseCostField("2000000", "price").ok).toBe(false);
    expect(parseCostField("abc", "price").ok).toBe(false);
    expect(parseCostField("0", "power")).toEqual({
      ok: false,
      error: "cost.error.power",
    });
    expect(parseCostField("10001", "power").ok).toBe(false);
  });

  it("keeps the currency chosen outside Electron, prices not converted", async () => {
    await CostSettingsService.setElectricityPrice(0.2);
    await CostSettingsService.setCurrency("CHF");

    const { settings } = useCostSettingsStore.getState();
    expect(settings.currency).toBe("CHF");
    expect(settings.electricityPrice).toBe(0.2);
  });
});
