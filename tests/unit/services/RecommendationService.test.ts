/**
 * SlicyWeb
 * Recommendation Service Tests
 *
 * Generation of the recommendations from the GUI (Phase 10 lot 88;
 * ADR-035 D3, D11): automatic once the analysis is up to date and a
 * printer and a material are selected (filament optional); rule 11 (a
 * change of the selection or of the object type makes the recommendations
 * outdated, then they are generated again; without a printer or a
 * material they stay outdated); object type chosen by the user and
 * "Automatic"; REC_001 and REC_002 kept for the Recommendation section;
 * Generate Recommendations; presets read through preset:getAll.
 *
 * The engine is the real one, with the printers, materials, filaments and
 * presets shipped in data/. The analyses are built in the tests.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.10.0: Object Reference Rules, rule 11;
 *   Classification Rules)
 * - DECISIONS.md (ADR-035 D3, D11)
 * - ERROR_CODES_SPEC.md (REC_001, REC_002)
 * - GUI_SPEC.md (Tools Menu, Recommendation Section)
 * - TEST_PLAN.md (Classification and Recommendation Engine Unit Tests,
 *   lot 88)
 */

import fs from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { PresetLoader } from "../../../src/preset_engine/PresetLoader";
import {
  RecommendationEngine,
  type RecommendationInput,
} from "../../../src/recommendation_engine/RecommendationEngine";
import {
  automaticClassificationOf,
  classificationConfidenceLevel,
  createRecommendationService,
  type RecommendationServiceInstance,
} from "../../../src/services/RecommendationService";
import { useAnalysisStore } from "../../../src/state/analysisStore";
import { useAnalysisTaskStore } from "../../../src/state/analysisTaskStore";
import { useFilamentStore } from "../../../src/state/filamentStore";
import { useMaterialStore } from "../../../src/state/materialStore";
import { useObjectStore } from "../../../src/state/objectStore";
import { usePresetStore } from "../../../src/state/presetStore";
import { usePrinterStore } from "../../../src/state/printerStore";
import { useRecommendationStore } from "../../../src/state/recommendationStore";
import { useRecommendationTaskStore } from "../../../src/state/recommendationTaskStore";
import type { Analysis } from "../../../src/types/Analysis";
import type { Classification } from "../../../src/types/Classification";
import type { Filament } from "../../../src/types/Filament";
import type { Material } from "../../../src/types/Material";
import type { Printer } from "../../../src/types/Printer";
import type { Recommendation } from "../../../src/types/Recommendation";

const DATA = path.resolve(__dirname, "../../../data");

function data<T>(folder: string, id: string): T {
  const file = JSON.parse(
    fs.readFileSync(path.join(DATA, folder, `${id}.json`), "utf8"),
  ) as { data: T };

  return file.data;
}

const printer = (id: string) => data<Printer>("printers", id);
const material = (id: string) => data<Material>("materials", id);
const filament = (id: string) => data<Filament>("filaments", id);

const loader = new PresetLoader();
loader.loadPresets([
  { folder: path.join(DATA, "presets"), source: "Official" },
]);
const PRESETS = loader.getPresets();

/** Automatic classification mechanical_part (65): Engineering preset */
const MECHANICAL: Classification = {
  category: "mechanical_part",
  subcategory: "",
  confidenceScore: 65,
  detectedFeatures: ["planar", "holes"],
  detectedTags: [],
  classificationVersion: "1.2.1",
  source: "automatic",
};

/** Analysis of a cube of 20 mm, up to date */
function analysis(objectId: string, change: Partial<Analysis> = {}): Analysis {
  return {
    analysisId: `analysis-${objectId}`,
    objectId,
    status: "generated",
    dimensions: { width: 20, depth: 20, height: 20 },
    geometry: {
      width: 20,
      depth: 20,
      height: 20,
      volume: 8000,
      surfaceArea: 2400,
    },
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
    classification: MECHANICAL,
    ...change,
  };
}

function addObject(
  objectId: string,
  stored: Analysis | null = analysis(objectId),
): void {
  useObjectStore
    .getState()
    .addObject(ObjectFactory.create(objectId, `${objectId}.stl`, "stl"));

  if (stored) {
    useAnalysisStore.getState().setAnalysis(stored);
  }
}

function selectPrinterAndMaterial(): void {
  usePrinterStore.getState().setSelectedPrinter(printer("prusa_mk4s"));
  useMaterialStore.getState().setSelectedMaterial(material("pla"));
}

const recommendationOf = (objectId: string): Recommendation | undefined =>
  useRecommendationStore.getState().recommendations[objectId];

const errorOf = (objectId: string) =>
  useRecommendationTaskStore.getState().errors[objectId];

const engine = new RecommendationEngine();

let calls: RecommendationInput[];
let fail: Error | null;
let readPresets: () => Promise<unknown>;
let service: RecommendationServiceInstance;
let stop: () => void;

beforeEach(() => {
  stop?.();
  useObjectStore.getState().clearObjects();
  useAnalysisStore.getState().clearAnalysis();
  useRecommendationStore.getState().clearRecommendations();
  useRecommendationTaskStore.getState().clearErrors();
  useAnalysisTaskStore.setState({ openMeshObjectIds: [] });
  usePrinterStore.setState({ selectedPrinter: null, userPrinterIds: [] });
  useMaterialStore.setState({ selectedMaterial: null });
  useFilamentStore.setState({ selectedFilament: null, userFilamentIds: [] });
  usePresetStore.setState({ presets: PRESETS });

  calls = [];
  fail = null;
  readPresets = () => Promise.resolve(null);
  service = createRecommendationService({
    generate: (input) => {
      calls.push(input);

      if (fail) {
        throw fail;
      }

      return engine.generateRecommendation(input);
    },
    readPresets: () => readPresets(),
  });
  stop = service.start();
});

describe("Automatic generation (ADR-035 D11)", () => {
  it("waits for a printer and a material, then generates by itself; the filament is optional", () => {
    addObject("a");
    service.flush();
    expect(recommendationOf("a")).toBeUndefined();

    usePrinterStore.getState().setSelectedPrinter(printer("prusa_mk4s"));
    service.flush();
    expect(recommendationOf("a")).toBeUndefined();

    useMaterialStore.getState().setSelectedMaterial(material("pla"));
    service.flush();

    const recommendation = recommendationOf("a")!;
    expect(recommendation.status).toBe("generated");
    expect(recommendation.objectId).toBe("a");
    expect(recommendation.analysisId).toBe("analysis-a");
    expect(recommendation.printerId).toBe("prusa_mk4s");
    expect(recommendation.materialId).toBe("pla");
    expect(recommendation.filamentId).toBeNull();
    expect(recommendation.preset.category).toBe("engineering");
    // No filament: -15 (RECOMMENDATION_RULES.md, Confidence)
    expect(recommendation.confidenceScore).toBe(85);
  });

  it("starts after the change is over (microtask), with the indicator of a mesh not closed", async () => {
    selectPrinterAndMaterial();
    addObject("a");
    // Set by the analysis service right after the analysis
    useAnalysisTaskStore.setState({ openMeshObjectIds: ["a"] });
    expect(recommendationOf("a")).toBeUndefined();

    await Promise.resolve();

    expect(calls).toHaveLength(1);
    expect(calls[0].meshClosed).toBe(false);
    // No filament -15, incomplete analysis -20
    expect(recommendationOf("a")!.confidenceScore).toBe(65);
  });

  it("generates only the objects whose analysis is up to date and classified", () => {
    selectPrinterAndMaterial();
    addObject("a");
    addObject("b", analysis("b", { status: "outdated" }));
    addObject("c", analysis("c", { classification: null }));
    addObject("d", null);
    service.flush();

    expect(recommendationOf("a")?.status).toBe("generated");
    expect(recommendationOf("b")).toBeUndefined();
    expect(recommendationOf("c")).toBeUndefined();
    expect(recommendationOf("d")).toBeUndefined();
  });

  it("generates again after a new analysis (rule 9), not while the analysis is outdated", () => {
    selectPrinterAndMaterial();
    addObject("a");
    service.flush();
    const first = recommendationOf("a")!;

    useAnalysisStore.getState().markAnalysisOutdated("a");
    service.flush();
    expect(recommendationOf("a")!.status).toBe("outdated");
    expect(calls).toHaveLength(1);

    useAnalysisStore
      .getState()
      .setAnalysis(
        analysis("a", { dimensions: { width: 10, depth: 10, height: 10 } }),
      );
    service.flush();

    expect(recommendationOf("a")!.status).toBe("generated");
    expect(recommendationOf("a")!.recommendationId).not.toBe(
      first.recommendationId,
    );
    expect(calls).toHaveLength(2);
  });

  it("does not generate again a recommendation up to date", () => {
    selectPrinterAndMaterial();
    addObject("a");
    service.flush();
    addObject("b");
    service.flush();

    expect(calls.map((input) => input.analysis?.objectId)).toEqual(["a", "b"]);
  });

  it("counts the printers and filaments of the user (Local Custom)", () => {
    selectPrinterAndMaterial();
    usePrinterStore.getState().setUserPrinterIds(["prusa_mk4s"]);
    useFilamentStore.getState().setSelectedFilament(filament("prusament_pla"));
    useFilamentStore.getState().setUserFilamentIds(["prusament_pla"]);
    addObject("a");
    service.flush();

    expect(calls.at(-1)).toMatchObject({
      printerIsUser: true,
      filamentIsUser: true,
    });
    // -10 and -10
    expect(recommendationOf("a")!.confidenceScore).toBe(80);
  });
});

describe("Rule 11: change of the selection", () => {
  it("a change of the filament makes the recommendations outdated, then generates them again", () => {
    selectPrinterAndMaterial();
    addObject("a");
    addObject("b");
    service.flush();
    const first = recommendationOf("a")!;

    useFilamentStore.getState().setSelectedFilament(filament("prusament_pla"));
    service.flush();

    expect(recommendationOf("a")!.status).toBe("generated");
    expect(recommendationOf("a")!.filamentId).toBe("prusament_pla");
    expect(recommendationOf("a")!.recommendationId).not.toBe(
      first.recommendationId,
    );
    expect(recommendationOf("b")!.filamentId).toBe("prusament_pla");
  });

  it("without a printer or a material, the recommendations stay outdated", () => {
    selectPrinterAndMaterial();
    addObject("a");
    service.flush();

    useMaterialStore.getState().setSelectedMaterial(null);
    service.flush();
    expect(recommendationOf("a")!.status).toBe("outdated");

    usePrinterStore.getState().setSelectedPrinter(null);
    useMaterialStore.getState().setSelectedMaterial(material("petg"));
    service.flush();
    expect(recommendationOf("a")!.status).toBe("outdated");
    expect(calls).toHaveLength(1);

    usePrinterStore.getState().setSelectedPrinter(printer("bambu_x1c"));
    service.flush();
    expect(recommendationOf("a")!.status).toBe("generated");
    expect(recommendationOf("a")!.printerId).toBe("bambu_x1c");
    expect(recommendationOf("a")!.materialId).toBe("petg");
  });
});

describe("Object type chosen by the user (ADR-035 D3)", () => {
  it("a category chosen gives a confidence of 100 and a new recommendation; Automatic gives back the automatic classification", () => {
    selectPrinterAndMaterial();
    addObject("a");
    service.flush();
    expect(recommendationOf("a")!.preset.category).toBe("engineering");

    service.chooseObjectType("a", "prototype");
    const chosen = useAnalysisStore.getState().analysis.a.classification!;
    expect(chosen).toMatchObject({
      category: "prototype",
      confidenceScore: 100,
      source: "user",
      detectedFeatures: ["planar", "holes"],
    });
    // The analysis keeps its id and its status (rule 11: analyses do not change)
    expect(useAnalysisStore.getState().analysis.a.analysisId).toBe(
      "analysis-a",
    );
    expect(useAnalysisStore.getState().analysis.a.status).toBe("generated");
    expect(recommendationOf("a")!.status).toBe("outdated");

    service.flush();
    expect(recommendationOf("a")!.status).toBe("generated");
    expect(recommendationOf("a")!.preset.category).toBe("fast_prototype");
    expect(recommendationOf("a")!.classification.source).toBe("user");

    service.chooseObjectType("a", null);
    service.flush();
    expect(useAnalysisStore.getState().analysis.a.classification).toMatchObject(
      {
        category: "mechanical_part",
        confidenceScore: 65,
        source: "automatic",
      },
    );
    expect(recommendationOf("a")!.preset.category).toBe("engineering");
  });

  it("can be chosen without a printer or a material; the same choice changes nothing", () => {
    addObject("a");
    service.chooseObjectType("a", "vase");
    expect(
      useAnalysisStore.getState().analysis.a.classification?.category,
    ).toBe("vase");

    const before = useAnalysisStore.getState().analysis;
    service.chooseObjectType("a", "vase");
    service.chooseObjectType("b", "vase");
    expect(useAnalysisStore.getState().analysis).toBe(before);
    expect(recommendationOf("a")).toBeUndefined();

    selectPrinterAndMaterial();
    service.flush();
    expect(recommendationOf("a")!.preset.category).toBe("vase");
  });

  it("automaticClassificationOf and the confidence level", () => {
    const user: Classification = {
      ...MECHANICAL,
      category: "gear",
      confidenceScore: 100,
      source: "user",
    };

    expect(automaticClassificationOf(MECHANICAL)).toBe(MECHANICAL);
    expect(automaticClassificationOf(user)).toMatchObject({
      category: "mechanical_part",
      confidenceScore: 65,
      source: "automatic",
    });
    expect(classificationConfidenceLevel(65)).toBe("medium");
    expect(classificationConfidenceLevel(0)).toBe("unknown");
    expect(classificationConfidenceLevel(100)).toBe("very_high");
  });
});

describe("Errors (ERROR_CODES_SPEC.md, REC_001 and REC_002)", () => {
  it("REC_002: no recommendation, not tried again until the data change or Generate", () => {
    selectPrinterAndMaterial();
    // A family without a fan value (RECOMMENDATION_RULES.md, Temperature And Cooling)
    useMaterialStore
      .getState()
      .setSelectedMaterial({ ...material("pla"), id: "pc", category: "PC" });
    addObject("a");
    service.flush();

    expect(recommendationOf("a")).toBeUndefined();
    expect(errorOf("a")).toBe("REC_002");

    addObject("b", null);
    service.flush();
    expect(calls).toHaveLength(1);

    service.generate(["a"]);
    expect(calls).toHaveLength(2);
    expect(errorOf("a")).toBe("REC_002");

    useMaterialStore.getState().setSelectedMaterial(material("pla"));
    service.flush();
    expect(errorOf("a")).toBeUndefined();
    expect(recommendationOf("a")!.status).toBe("generated");
  });

  it("REC_001: unexpected failure; an outdated recommendation stays outdated", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    selectPrinterAndMaterial();
    addObject("a");
    service.flush();

    fail = new Error("boom");
    useAnalysisStore.getState().setAnalysis(analysis("a"));
    service.flush();

    expect(errorOf("a")).toBe("REC_001");
    expect(recommendationOf("a")!.status).toBe("outdated");
    expect(error).toHaveBeenCalled();

    fail = null;
    service.generate(["a"]);
    expect(errorOf("a")).toBeUndefined();
    expect(recommendationOf("a")!.status).toBe("generated");
    error.mockRestore();
  });

  it("the error of a removed object is forgotten", () => {
    selectPrinterAndMaterial();
    fail = new Error("REC_002 Insufficient Data: test");
    addObject("a");
    service.flush();
    expect(errorOf("a")).toBe("REC_002");

    useObjectStore.getState().removeObject("a");
    service.flush();
    expect(errorOf("a")).toBeUndefined();
  });
});

describe("Generate Recommendations", () => {
  it("generates again the given objects, even up to date", () => {
    selectPrinterAndMaterial();
    addObject("a");
    addObject("b");
    service.flush();
    const a = recommendationOf("a")!.recommendationId;
    const b = recommendationOf("b")!.recommendationId;

    service.generate(["a"]);

    expect(recommendationOf("a")!.recommendationId).not.toBe(a);
    expect(recommendationOf("b")!.recommendationId).toBe(b);
  });

  it("does nothing without a printer or a material", () => {
    addObject("a");
    service.generate(["a"]);

    expect(calls).toHaveLength(0);
    expect(recommendationOf("a")).toBeUndefined();
  });
});

describe("Presets (preset:getAll, ADR-035 D4)", () => {
  it("reads the presets of the main process into the store", async () => {
    usePresetStore.setState({ presets: [] });
    readPresets = () =>
      Promise.resolve({ success: true, data: { presets: PRESETS } });

    await service.loadPresets();

    expect(
      usePresetStore.getState().presets.map((preset) => preset.category),
    ).toEqual(PRESETS.map((preset) => preset.category));
  });

  it("keeps the store when the response is refused, or outside Electron", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    usePresetStore.setState({ presets: [] });

    readPresets = () =>
      Promise.resolve({ success: true, data: { presets: [{ name: "x" }] } });
    await service.loadPresets();
    expect(usePresetStore.getState().presets).toEqual([]);
    expect(error).toHaveBeenCalled();

    readPresets = () => Promise.resolve(null);
    await service.loadPresets();
    expect(usePresetStore.getState().presets).toEqual([]);
    error.mockRestore();
  });
});
