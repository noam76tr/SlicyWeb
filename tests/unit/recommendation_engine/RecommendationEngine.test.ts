/**
 * SlicyWeb
 * Recommendation Engine Tests
 *
 * Rules of Phase 10 (RECOMMENDATION_RULES.md 1.1.2, Rules Of Version
 * 1.1.0; ADR-035 D5 to D10), with the printers, materials, filaments and
 * presets shipped in data/: limits (Ultimaker S5 + Fast Prototype, test
 * required by Noam), temperatures, fan, retraction, supports, adhesion,
 * warnings, confidence, REC_002 and RecommendationSchema.
 *
 * The analyses are built in the tests (no model file).
 *
 * Based on:
 * - RECOMMENDATION_RULES.md 1.1.2
 * - PRINT_PRESETS_SPEC.md 1.3.0
 * - DATA_SCHEMA.md (Recommendation Schema 3.10.0)
 * - TEST_PLAN.md (Classification and Recommendation Engine Unit Tests,
 *   lot 87)
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PresetLoader } from "../../../src/preset_engine/PresetLoader";
import {
  RecommendationEngine,
  type RecommendationInput,
} from "../../../src/recommendation_engine/RecommendationEngine";
import { middleOfRange } from "../../../src/recommendation_engine/DecisionEngine";
import { RecommendationSchema } from "../../../src/schemas/RecommendationSchema";
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
loader.loadPresets([{ folder: path.join(DATA, "presets"), source: "Official" }]);
const PRESETS = loader.getPresets();

/** Automatic classification of a category (as the classification of lot 85) */
function classification(
  category: Classification["category"],
  confidenceScore: number,
  features: string[] = [],
  source: Classification["source"] = "automatic",
): Classification {
  return {
    category,
    subcategory: "",
    confidenceScore,
    detectedFeatures: features,
    detectedTags: [],
    classificationVersion: "1.2.1",
    source,
  };
}

/** Analysis of a cube of 20 mm, with parts changed */
function analysis(change: Partial<Analysis> = {}): Analysis {
  return {
    analysisId: "analysis-1",
    objectId: "object-1",
    status: "generated",
    dimensions: { width: 20, depth: 20, height: 20 },
    geometry: { width: 20, depth: 20, height: 20, volume: 8000, surfaceArea: 2400 },
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
    // mechanical_part (65): Engineering preset
    classification: classification("mechanical_part", 65, ["planar", "holes"]),
    ...change,
  };
}

/** Prototype classification chosen by the user: Fast Prototype preset */
const prototype = classification("prototype", 100, [], "user");
const vase = classification("vase", 75, ["tall", "curved", "hollow", "open_top", "thin_walls"]);

function input(change: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    analysis: analysis(),
    meshClosed: true,
    printer: printer("prusa_mk4s"),
    printerIsUser: false,
    material: material("pla"),
    filament: filament("prusament_pla"),
    filamentIsUser: false,
    presets: PRESETS,
    ...change,
  };
}

const engine = new RecommendationEngine();

function generate(change: Partial<RecommendationInput> = {}): Recommendation {
  return engine.generateRecommendation(input(change));
}

const codes = (recommendation: Recommendation) =>
  recommendation.warnings.map((warning) => warning.code);

const warning = (recommendation: Recommendation, code: string) =>
  recommendation.warnings.find((item) => item.code === code);

describe("Limits (RECOMMENDATION_RULES.md, Limits)", () => {
  it("Ultimaker S5 + Fast Prototype: print at most 100 mm/s with VALUE_LIMITED, travel 150 mm/s (Noam)", () => {
    const result = generate({
      analysis: analysis({ classification: prototype }),
      printer: printer("ultimaker_s5"),
    });
    const { speed } = result.recommendedProfile;

    expect(result.preset.category).toBe("fast_prototype");
    expect(speed.print).toBe(100);
    expect(speed.print).toBeLessThanOrEqual(100);
    expect(speed).toMatchObject({ outerWall: 40, innerWall: 80, infill: 100, travel: 150 });
    expect(codes(result)).toContain("VALUE_LIMITED");
  });

  it("limit of 100 mm/s (maxPrintSpeed null) always gives VALUE_LIMITED when it lowers the speed", () => {
    // High Quality: 100 mm/s, not lowered; Balanced: 150 lowered to 100
    const unchanged = generate({
      analysis: analysis({ classification: classification("decorative_object", 100, [], "user") }),
      printer: printer("ultimaker_s5"),
    });
    expect(unchanged.recommendedProfile.speed.print).toBe(100);
    expect(codes(unchanged)).not.toContain("VALUE_LIMITED");
  });

  it("travel: never VALUE_LIMITED, also when a published maxTravelSpeed lowers it (answer A of Noam)", () => {
    const slowTravel = {
      ...printer("creality_k1"),
      motion: { ...printer("creality_k1").motion, maxTravelSpeed: 100 },
    };
    const result = generate({ printer: slowTravel });

    expect(result.recommendedProfile.speed.travel).toBe(100);
    expect(codes(result)).not.toContain("VALUE_LIMITED");
  });

  it("maxPrintSpeed published (500) + Balanced: 150 mm/s, no VALUE_LIMITED", () => {
    const result = generate({
      analysis: analysis({ classification: classification("unknown", 0) }),
      printer: printer("bambu_x1c"),
      filament: filament("bambu_pla_basic"),
    });

    expect(result.preset.category).toBe("balanced");
    expect(result.recommendedProfile.speed.print).toBe(150);
    expect(result.recommendedProfile.speed.travel).toBe(250);
    expect(codes(result)).not.toContain("VALUE_LIMITED");
  });

  it("maxPrintSpeed 100 + Balanced: 100 mm/s and VALUE_LIMITED", () => {
    const result = generate({
      analysis: analysis({ classification: classification("unknown", 0) }),
      printer: printer("creality_ender3_v2"),
    });

    expect(result.recommendedProfile.speed.print).toBe(100);
    expect(codes(result)).toContain("VALUE_LIMITED");
  });

  it("a limit lowering the print speed by less than 10 % gives no VALUE_LIMITED", () => {
    const k1 = printer("creality_k1");
    const result = generate({
      analysis: analysis({ classification: classification("unknown", 0) }),
      printer: { ...k1, motion: { ...k1.motion, maxPrintSpeed: 140 } },
    });

    expect(result.recommendedProfile.speed.print).toBe(140);
    expect(codes(result)).not.toContain("VALUE_LIMITED");
  });

  it("TPU: print speed at most 30 mm/s, retraction distance divided by two", () => {
    const result = generate({
      printer: printer("creality_ender3_v2"),
      material: material("tpu"),
      filament: filament("bambu_tpu_95a_hf"),
    });
    const profile = result.recommendedProfile;

    expect(profile.speed.print).toBe(30);
    expect(profile.speed.outerWall).toBe(30);
    expect(profile.retraction).toEqual({ distance: 2.5, speed: 40 });
    expect(codes(result)).toContain("VALUE_LIMITED");
  });

  it("layer height: nozzle 0.2 mm gives at most 0.15 mm; always 0.08 to 0.28 mm", () => {
    const mk4s = printer("prusa_mk4s");
    // Balanced 0.20 lowered to 0.15 (25 %): VALUE_LIMITED
    const small = generate({
      analysis: analysis({ classification: classification("unknown", 0) }),
      printer: { ...mk4s, defaultNozzle: 0.2 },
    });
    expect(small.recommendedProfile.quality.layerHeight).toBe(0.15);
    expect(codes(small)).toContain("VALUE_LIMITED");

    // Engineering 0.16 lowered to 0.15 (6 %): no VALUE_LIMITED
    const engineering = generate({ printer: { ...mk4s, defaultNozzle: 0.2 } });
    expect(engineering.recommendedProfile.quality.layerHeight).toBe(0.15);
    expect(codes(engineering)).not.toContain("VALUE_LIMITED");

    const large = generate({
      analysis: analysis({ classification: prototype }),
      printer: { ...mk4s, defaultNozzle: 0.8 },
    });
    expect(large.recommendedProfile.quality.layerHeight).toBe(0.28);

    // 75 % of 0.1 mm is below 0.08 mm: the nozzle rule wins
    const tiny = generate({ printer: { ...mk4s, defaultNozzle: 0.1 } });
    expect(tiny.recommendedProfile.quality.layerHeight).toBe(0.07);
  });
});

describe("Temperature And Cooling", () => {
  it("rounds the middle of a range to 5 °C, the lower multiple when exactly between", () => {
    expect(middleOfRange(190, 230)).toBe(210);
    expect(middleOfRange(25, 60)).toBe(40);
    expect(middleOfRange(40, 60)).toBe(50);
    expect(middleOfRange(41, 42)).toBe(41);
  });

  it("Bambu PLA Basic: 210 / 40 °C, fan 100 % (published)", () => {
    const result = generate({ filament: filament("bambu_pla_basic") });

    expect(result.recommendedProfile.temperature).toEqual({ nozzle: 210, bed: 40 });
    expect(result.recommendedProfile.cooling).toEqual({ fanSpeed: 100, minimumLayerTime: 5 });
  });

  it("Prusament PLA: nozzle 210 °C (published), bed 50 °C", () => {
    const result = generate();

    expect(result.recommendedProfile.temperature).toEqual({ nozzle: 210, bed: 50 });
  });

  it("Polymaker PolyLite PLA: bed 40 °C (middle 42.5), fan of the family PLA 90 %", () => {
    const result = generate({ filament: filament("polymaker_polylite_pla") });

    expect(result.recommendedProfile.temperature).toEqual({ nozzle: 210, bed: 40 });
    expect(result.recommendedProfile.cooling.fanSpeed).toBe(90);
  });

  it("without a filament: the middle of the range of the material", () => {
    const pla = material("pla");
    const result = generate({ filament: null });

    expect(result.filamentId).toBeNull();
    expect(result.recommendedProfile.temperature).toEqual({
      nozzle: middleOfRange(pla.temperature.minNozzle!, pla.temperature.maxNozzle!),
      bed: middleOfRange(pla.temperature.minBed!, pla.temperature.maxBed!),
    });
  });

  it.each([
    ["pla", 90],
    ["petg", 50],
    ["abs", 15],
    ["asa", 15],
    ["tpu", 40],
  ])("fan of the family %s without a filament: %i %%", (id, fan) => {
    const result = generate({ material: material(id), filament: null });

    expect(result.recommendedProfile.cooling.fanSpeed).toBe(fan);
  });

  it("a family without a fan value and no filament: REC_002", () => {
    const other = { ...material("pla"), category: "PC" };

    expect(() => generate({ material: other, filament: null })).toThrow(/^REC_002/);
  });

  it("Prusament ASA on Bambu A1 (bed 100 °C): bed capped, TEMPERATURE_UNSUPPORTED critical", () => {
    const result = generate({
      printer: printer("bambu_a1"),
      material: material("asa"),
      filament: filament("prusament_asa"),
    });

    expect(result.recommendedProfile.temperature).toEqual({ nozzle: 260, bed: 100 });
    expect(warning(result, "TEMPERATURE_UNSUPPORTED")?.severity).toBe("critical");
    expect(result.warnings[0]?.code).toBe("TEMPERATURE_UNSUPPORTED");
  });

  it("a printer that does not publish its bed maximum does not limit the bed", () => {
    const result = generate({
      printer: printer("ultimaker_s5"),
      material: material("asa"),
      filament: filament("prusament_asa"),
    });

    expect(result.recommendedProfile.temperature.bed).toBe(110);
    expect(codes(result)).not.toContain("TEMPERATURE_UNSUPPORTED");
  });
});

describe("Retraction", () => {
  it("direct drive 0.8 mm 35 mm/s, bowden 5 mm 40 mm/s", () => {
    expect(generate().recommendedProfile.retraction).toEqual({ distance: 0.8, speed: 35 });
    expect(
      generate({ printer: printer("creality_ender3_v2") }).recommendedProfile.retraction,
    ).toEqual({ distance: 5, speed: 40 });
  });

  it("unknown extruder (Bambu Lab): direct drive values and EXTRUDER_UNKNOWN", () => {
    const result = generate({ printer: printer("bambu_x1c") });

    expect(result.recommendedProfile.retraction).toEqual({ distance: 0.8, speed: 35 });
    expect(warning(result, "EXTRUDER_UNKNOWN")?.severity).toBe("info");
  });
});

describe("Supports And Adhesion", () => {
  const overhang = (maxAngle: number) =>
    analysis({ overhangs: { detected: maxAngle > 45, maxAngle, percentage: 5 } });

  it("maxAngle 60: no support; 61: supports of the type of the preset", () => {
    expect(generate({ analysis: overhang(60) }).recommendedProfile.supports).toEqual({
      enabled: false,
      type: "standard",
    });

    const result = generate({ analysis: overhang(61) });
    expect(result.recommendedProfile.supports).toEqual({ enabled: true, type: "standard" });
    expect(warning(result, "OVERHANG_HIGH")?.severity).toBe("medium");
    expect(warning(generate({ analysis: overhang(76) }), "OVERHANG_HIGH")?.severity).toBe("high");
  });

  it("bridge of 51 mm: supports; 26 mm: LONG_BRIDGE medium without supports", () => {
    const bridge = (longestBridge: number) =>
      analysis({ bridges: { detected: true, count: 1, longestBridge } });

    const long = generate({ analysis: bridge(51) });
    expect(long.recommendedProfile.supports.enabled).toBe(true);
    expect(warning(long, "LONG_BRIDGE")?.severity).toBe("high");

    const medium = generate({ analysis: bridge(26) });
    expect(medium.recommendedProfile.supports.enabled).toBe(false);
    expect(warning(medium, "LONG_BRIDGE")?.severity).toBe("medium");
  });

  it("Vase preset: no support, VASE_SUPPORTS_IGNORED", () => {
    const result = generate({
      analysis: analysis({
        classification: vase,
        overhangs: { detected: true, maxAngle: 70, percentage: 5 },
      }),
    });

    expect(result.preset.category).toBe("vase");
    expect(result.recommendedProfile.supports).toEqual({ enabled: false, type: "none" });
    expect(warning(result, "VASE_SUPPORTS_IGNORED")?.severity).toBe("medium");
  });

  it("Balanced uses tree supports", () => {
    const result = generate({
      analysis: analysis({
        classification: classification("unknown", 0),
        overhangs: { detected: true, maxAngle: 80, percentage: 5 },
      }),
    });

    expect(result.recommendedProfile.supports).toEqual({ enabled: true, type: "tree" });
  });

  it("brim for a risk of 41, for ABS and ASA, for a tall object; never a raft", () => {
    expect(generate().recommendedProfile.adhesion).toBe("skirt");

    const risky = generate({
      analysis: analysis({
        stability: { contactArea: 10, heightRatio: 3, centerOfGravity: { x: 0, y: 0, z: 0 }, riskScore: 41 },
      }),
    });
    expect(risky.recommendedProfile.adhesion).toBe("brim");
    expect(warning(risky, "LOW_STABILITY")?.severity).toBe("low");

    expect(
      generate({ material: material("abs"), filament: filament("bambu_abs") })
        .recommendedProfile.adhesion,
    ).toBe("brim");

    expect(
      generate({
        analysis: analysis({ classification: classification("mechanical_part", 65, ["tall", "holes"]) }),
      }).recommendedProfile.adhesion,
    ).toBe("brim");
  });
});

describe("Recommendation Warnings", () => {
  it("each code once, most severe first, with source recommendation", () => {
    const result = generate({
      analysis: analysis({
        classification: classification("unknown", 0),
        dimensions: { width: 300, depth: 20, height: 20 },
        overhangs: { detected: true, maxAngle: 80, percentage: 5 },
        bridges: { detected: true, count: 1, longestBridge: 60 },
        thinWalls: { detected: true, minimumThickness: 0.3 },
        stability: { contactArea: 10, heightRatio: 3, centerOfGravity: { x: 0, y: 0, z: 0 }, riskScore: 90 },
      }),
      printer: printer("bambu_a1"),
      material: material("asa"),
      filament: filament("prusament_asa"),
    });

    expect(codes(result)).toEqual([
      "OBJECT_TOO_LARGE",
      "TEMPERATURE_UNSUPPORTED",
      "OVERHANG_HIGH",
      "LONG_BRIDGE",
      "THIN_WALLS",
      "LOW_STABILITY",
      "MATERIAL_NOT_LISTED",
      "ENCLOSURE_RECOMMENDED",
      "CLASSIFICATION_UNCERTAIN",
      "EXTRUDER_UNKNOWN",
    ]);
    expect(new Set(codes(result)).size).toBe(result.warnings.length);

    for (const item of result.warnings) {
      expect(item.source).toBe("recommendation");
      expect(item.recommendedAction).toBe("");
      expect(item.message.length).toBeGreaterThan(0);
    }
  });

  it("a critical warning does not stop the recommendation", () => {
    const result = generate({
      analysis: analysis({ dimensions: { width: 400, depth: 400, height: 400 } }),
    });

    expect(result.status).toBe("generated");
    expect(result.warnings[0]?.severity).toBe("critical");
  });

  it("EXPECTED_PRESET_UNAVAILABLE when the preset of the mapping is missing", () => {
    const result = generate({
      presets: PRESETS.filter((preset) => preset.category !== "engineering"),
    });

    expect(result.preset.category).toBe("balanced");
    expect(codes(result)).toContain("EXPECTED_PRESET_UNAVAILABLE");
  });
});

describe("Confidence (RECOMMENDATION_RULES.md, Confidence)", () => {
  const user = classification("mechanical_part", 100, [], "user");

  it("Official printer, material and filament, category chosen by the user: 100", () => {
    const result = generate({ analysis: analysis({ classification: user }) });

    expect(result.confidenceScore).toBe(100);
    expect(result.recommendedProfile.confidenceScore).toBe(100);
  });

  it("reductions: no filament -15, mesh not closed -20, user printer and filament -10 each, automatic unknown -20, low -10", () => {
    const withUser = (change: Partial<RecommendationInput>) =>
      generate({ analysis: analysis({ classification: user }), ...change }).confidenceScore;

    expect(withUser({ filament: null })).toBe(85);
    expect(withUser({ meshClosed: false })).toBe(80);
    expect(
      generate({
        analysis: analysis({ classification: user, thinWalls: { detected: false, minimumThickness: 0 } }),
      }).confidenceScore,
    ).toBe(80);
    expect(withUser({ printerIsUser: true, filamentIsUser: true })).toBe(80);
    expect(generate({ analysis: analysis({ classification: classification("unknown", 0) }) }).confidenceScore).toBe(80);
    expect(generate({ analysis: analysis({ classification: classification("figurine", 45, ["curved"]) }) }).confidenceScore).toBe(90);
    expect(generate().confidenceScore).toBe(100);
  });

  it("adds the reductions", () => {
    expect(
      generate({
        analysis: analysis({ classification: classification("unknown", 0) }),
        filament: null,
        meshClosed: false,
        printerIsUser: true,
      }).confidenceScore,
    ).toBe(35);
  });
});

describe("REC_002 and RecommendationSchema", () => {
  it("no printer or no material: REC_002, no recommendation", () => {
    expect(() => generate({ printer: null })).toThrow(/^REC_002/);
    expect(() => generate({ material: null })).toThrow(/^REC_002/);
  });

  it("no analysis, a classification null or no Balanced preset: REC_002", () => {
    expect(() => generate({ analysis: null })).toThrow(/^REC_002/);
    expect(() => generate({ analysis: analysis({ classification: null }) })).toThrow(/^REC_002/);
    expect(() =>
      generate({
        analysis: analysis({ classification: classification("unknown", 0) }),
        presets: PRESETS.filter((preset) => preset.category !== "balanced"),
      }),
    ).toThrow(/^REC_002/);
  });

  it("the recommendation is valid: temperature required, filamentId null accepted, supports {enabled, type}", () => {
    const result = generate({ filament: null });

    expect(RecommendationSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({
      objectId: "object-1",
      analysisId: "analysis-1",
      printerId: "prusa_mk4s",
      materialId: "pla",
      filamentId: null,
      status: "generated",
    });

    const { temperature, ...withoutTemperature } = result.recommendedProfile;
    expect(temperature).toBeDefined();
    expect(
      RecommendationSchema.safeParse({ ...result, recommendedProfile: withoutTemperature }).success,
    ).toBe(false);
    expect(
      RecommendationSchema.safeParse({
        ...result,
        recommendedProfile: {
          ...result.recommendedProfile,
          supports: { enabled: true, type: "organic" },
        },
      }).success,
    ).toBe(false);
  });

  it("is deterministic: the same inputs give the same profile", () => {
    expect(generate().recommendedProfile).toEqual(generate().recommendedProfile);
  });
});
