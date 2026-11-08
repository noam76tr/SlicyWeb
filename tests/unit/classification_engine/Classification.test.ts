/**
 * SlicyWeb
 * Classification tests (Phase 10 lot 85)
 *
 * Automatic classification computed with the analysis, on models built in
 * the tests (TEST_PLAN.md, Classification lot 85): geometric features,
 * category rules and their order, confidence, open_top with the walls
 * around the bottom (equerre en L : ni container ni vase, Noam
 * 2026-11-05), mesh not closed, repeatability, ClassificationValidator,
 * category chosen by the user kept, classification without source.
 *
 * Based on:
 * - OBJECT_CLASSIFICATION_SPEC.md (1.2.0: Automatic Classification)
 * - DATA_SCHEMA.md (3.10.0: Object Classification Schema, Classification
 *   Rules)
 * - DECISIONS.md (ADR-035 D2, D3)
 * - TEST_PLAN.md (Classification lot 85)
 */

import { describe, expect, it } from "vitest";

import { CategoryDetector } from "../../../src/classification_engine/CategoryDetector";
import { ClassificationEngine } from "../../../src/classification_engine/ClassificationEngine";
import { ClassificationValidator } from "../../../src/classification_engine/ClassificationValidator";
import { ConfidenceScorer } from "../../../src/classification_engine/ConfidenceScorer";
import {
  convexHullVolume,
  genus,
  hullVolumeBounds,
  isHollow,
} from "../../../src/classification_engine/FeatureDetector";
import { FEATURE_THRESHOLDS } from "../../../src/constants/AnalysisConstants";
import { weldVertices } from "../../../src/model_analysis/MeshAnalyzer";
import {
  analyzeModel,
  runAnalysisRequest,
  type PlacedMesh,
} from "../../../src/model_analysis/ModelAnalyzer";
import { AnalysisClassificationSchema } from "../../../src/schemas/AnalysisSchema";
import type {
  Classification,
  GeometricFeature,
} from "../../../src/types/Classification";

import {
  blocks,
  box,
  centered,
  cup,
  extruded,
  inverted,
  polygon,
  sphere,
  square,
} from "./testModels";

const IDENTITY = {
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

type Rotation = { x: number; y: number; z: number };

/** Classification of a model, computed as in the Web Worker */
function classify(
  triangles: number[],
  rotation: Rotation = IDENTITY.rotation,
): Classification {
  const result = analyzeModel(
    centered(triangles),
    { rotation, scale: IDENTITY.scale },
    ClassificationEngine.classifyModel,
  );

  return result.classification!;
}

/** Thin L bracket: base and upright of one cell, `cells` cells long */
function lBracket(cells: number, depth: number, size: number): number[] {
  const rows = [
    ...Array.from({ length: cells - 1 }, () => "#" + ".".repeat(cells - 1)),
    "#".repeat(cells),
  ];

  return extruded(rows, depth, size);
}

const openVase = (): number[] => cup(polygon(15, 64), polygon(14, 64), 2, 100);
const openBox = (): number[] => cup(square(60), square(56), 2, 20);
/** Plate 50 x 50 x 10 mm with two through holes of 10 x 10 mm */
const plateWithHoles = (): number[] =>
  blocks([["#####"], ["#.###"], ["#####"], ["###.#"], ["#####"]]);
/** Box of 40 mm, walls of 2 mm, closed by its lid */
const closedBox = (): number[] => [
  ...box([0, 0, 0], [40, 40, 40]),
  ...inverted(box([2, 2, 2], [38, 38, 38])),
];

describe("Classification: models of TEST_PLAN.md (lot 85)", () => {
  it("cube 20 mm: small and planar, no hole; unknown (confidence 0)", () => {
    expect(classify(box([0, 0, 0], [20, 20, 20]))).toEqual({
      category: "unknown",
      subcategory: "",
      confidenceScore: 0,
      detectedFeatures: ["small", "planar"],
      detectedTags: [],
      classificationVersion: "1.2.2",
      source: "automatic",
    });
  });

  it("tower 20 x 20 x 100 mm: tall", () => {
    const tower = classify(box([0, 0, 0], [20, 20, 100]));

    expect(tower.detectedFeatures).toEqual(["tall", "planar"]);
    expect(tower.category).toBe("unknown");
  });

  it("sphere: curved, not hollow; figurine (65)", () => {
    const result = classify(sphere(30, 32, 16));

    expect(result.detectedFeatures).toEqual(["curved"]);
    expect(result.category).toBe("figurine");
    expect(result.confidenceScore).toBe(65);
  });

  it("small sphere (diameter 20 mm): small and curved; miniature (70)", () => {
    const result = classify(sphere(10, 32, 16));

    expect(result.detectedFeatures).toEqual(["small", "curved"]);
    expect(result.category).toBe("miniature");
    expect(result.confidenceScore).toBe(70);
  });

  it("open vase (tall cylinder, open top, thin wall, with a bottom): vase (75)", () => {
    const result = classify(openVase());

    expect(result.detectedFeatures).toEqual([
      "tall",
      "curved",
      "hollow",
      "open_top",
    ]);
    expect(result.category).toBe("vase");
    expect(result.confidenceScore).toBe(75);
  });

  it("open box (low, open top): container (70)", () => {
    const result = classify(openBox());

    expect(result.detectedFeatures).toEqual(["planar", "hollow", "open_top"]);
    expect(result.category).toBe("container");
    expect(result.confidenceScore).toBe(70);
  });

  it("plate with holes: planar and holes; mechanical_part (65)", () => {
    const result = classify(plateWithHoles());

    expect(result.detectedFeatures).toEqual(["flat", "planar", "holes"]);
    expect(result.category).toBe("mechanical_part");
    expect(result.confidenceScore).toBe(65);
  });

  it("closed box (hollow, with a lid): not open_top; not container", () => {
    const result = classify(closedBox());

    expect(result.detectedFeatures).toContain("hollow");
    expect(result.detectedFeatures).not.toContain("open_top");
    expect(result.category).toBe("unknown");
  });
});

describe("Classification: open_top needs walls around the bottom (Noam, 2026-11-05)", () => {
  it("L bracket 100 mm: hollow, bottom low and turned up, but open on three sides: neither container nor vase", () => {
    const result = classify(lBracket(10, 10, 10));

    expect(result.detectedFeatures).toEqual(["planar", "hollow"]);
    expect(result.category).not.toBe("container");
    expect(result.category).not.toBe("vase");
    expect(result.category).toBe("unknown");
  });

  it("thin L bracket (plates of 2 mm, 40 x 20 x 40 mm), mirrored, turned on the plate: never open_top", () => {
    const thin = lBracket(20, 10, 2);
    const mirrored = thin.map((value, i) => (i % 3 === 0 ? -value : value));

    for (const [triangles, rotation] of [
      [thin, IDENTITY.rotation],
      [thin, { x: 0, y: 0, z: 90 }],
      [thin, { x: 0, y: 0, z: 45 }],
      [inverted(mirrored), IDENTITY.rotation],
    ] as [number[], Rotation][]) {
      const result = classify(triangles, rotation);

      expect(result.detectedFeatures).toContain("hollow");
      expect(result.detectedFeatures).not.toContain("open_top");
      expect(["container", "vase"]).not.toContain(result.category);
    }
  });

  it("open box with one side wall left out (three walls): not open_top", () => {
    // 6 x 6 cells of 10 mm, bottom of one cell, walls of 4 cells on 3 sides
    const wall = "#.....";
    const side = ["######", "######", "######", "######", "######"];
    const middle = [wall, wall, wall, wall, "######"];
    const result = classify(
      blocks([side, middle, middle, middle, middle, middle]),
    );

    expect(result.detectedFeatures).not.toContain("open_top");
    expect(result.category).not.toBe("container");
  });

  it("the same open box with its four walls: open_top", () => {
    const wall = "#....#";
    const side = ["######", "######", "######", "######", "######"];
    const middle = [wall, wall, wall, wall, "######"];
    const result = classify(
      blocks([side, middle, middle, middle, middle, side]),
    );

    expect(result.detectedFeatures).toContain("open_top");
  });

  it("open vase upside down: the ray meets the outer bottom at the top, not a vase", () => {
    const result = classify(openVase(), { x: 180, y: 0, z: 0 });

    expect(result.detectedFeatures).not.toContain("open_top");
    expect(result.category).not.toBe("vase");
  });
});

describe("Classification: features, rules and confidence", () => {
  it("large and flat: plate 160 x 160 x 10 mm", () => {
    const result = classify(box([0, 0, 0], [160, 160, 10]));

    expect(result.detectedFeatures).toEqual(["large", "flat", "planar"]);
  });

  it("thin walls of the analysis: plate 0.5 mm", () => {
    const result = classify(box([0, 0, 0], [30, 30, 0.5]));

    expect(result.detectedFeatures).toContain("thin_walls");
  });

  it("mesh not closed: holes not computed", () => {
    const plate = plateWithHoles();
    // The two triangles of the first face left out: an open mesh
    const open = plate.slice(18);
    const welded = weldVertices(centered(plate));

    expect(
      genus({ ...welded, placed: new Float64Array(welded.vertices) }),
    ).toBe(2);
    expect(classify(plate).detectedFeatures).toContain("holes");
    expect(classify(open).detectedFeatures).not.toContain("holes");
  });

  it("genus: 0 for a cube and a closed box (two shells), 1 for a ring", () => {
    const of = (triangles: number[]): number => {
      const welded = weldVertices(centered(triangles));

      return genus({ ...welded, placed: new Float64Array(welded.vertices) });
    };

    expect(of(box([0, 0, 0], [20, 20, 20]))).toBe(0);
    expect(of(closedBox())).toBe(0);
    expect(of(blocks([["###"], ["#.#"], ["###"]]))).toBe(1);
  });

  it("parts touching along an edge (not manifold): holes not computed (lot 91)", () => {
    // Four cubes around an empty center, each touching the next along a
    // vertical edge only
    const ring = [
      ...box([10, 0, 0], [20, 10, 10]),
      ...box([20, 10, 0], [30, 20, 10]),
      ...box([10, 20, 0], [20, 30, 10]),
      ...box([0, 10, 0], [10, 20, 10]),
    ];
    const result = analyzeModel(
      centered(ring),
      IDENTITY,
      ClassificationEngine.classifyModel,
    );

    expect(result.meshClosed).toBe(true);
    expect(result.meshManifold).toBe(false);
    expect(result.classification!.detectedFeatures).not.toContain("holes");
    expect(result.classification!.classificationVersion).toBe("1.2.2");
  });

  it("repeatable: the same mesh gives the same classification twice", () => {
    for (const model of [
      openVase(),
      lBracket(10, 10, 10),
      sphere(30, 32, 16),
    ]) {
      expect(classify(model)).toEqual(classify(model));
    }
  });

  it("rules in their order: the first that matches wins", () => {
    const detector = new CategoryDetector();
    const detect = (features: GeometricFeature[]) => detector.detect(features);

    expect(detect(["tall", "hollow", "open_top"])).toBe("vase");
    // holes exclude the vase, the container stays
    expect(detect(["tall", "holes", "hollow", "open_top"])).toBe("container");
    expect(detect(["small", "curved", "hollow"])).toBe("miniature");
    // hollow excludes the figurine
    expect(detect(["curved", "hollow"])).toBe("unknown");
    expect(detect(["curved", "holes"])).toBe("unknown");
    expect(detect(["planar", "holes"])).toBe("mechanical_part");
    expect(detect([])).toBe("unknown");
  });

  it("confidence: the rule (never above 75), 0 for unknown, 100 for the user", () => {
    expect(ConfidenceScorer.calculate("vase", "automatic")).toBe(75);
    expect(ConfidenceScorer.calculate("container", "automatic")).toBe(70);
    expect(ConfidenceScorer.calculate("unknown", "automatic")).toBe(0);
    expect(ConfidenceScorer.calculate("gear", "automatic")).toBe(0);
    expect(ConfidenceScorer.calculate("gear", "user")).toBe(100);
    expect(ConfidenceScorer.getLevel(75)).toBe("high");
    expect(ConfidenceScorer.getLevel(65)).toBe("medium");
    expect(ConfidenceScorer.getLevel(0)).toBe("unknown");
  });

  it("the Web Worker answers with the classification of the object", () => {
    const answer = runAnalysisRequest(
      { positions: centered(openVase()), transform: IDENTITY },
      ClassificationEngine.classifyModel,
    );

    expect(answer.type).toBe("result");
    expect(
      answer.type === "result" && answer.result.classification?.category,
    ).toBe("vase");
    // Without a classifier: the analysis alone
    const alone = runAnalysisRequest({
      positions: centered(openVase()),
      transform: IDENTITY,
    });

    expect(alone.type === "result" && alone.result.classification).toBeNull();
  });
});

describe("ClassificationValidator (KI-011) and the stored form", () => {
  const valid: Classification = {
    category: "vase",
    subcategory: "",
    confidenceScore: 75,
    detectedFeatures: ["tall", "curved", "hollow", "open_top"],
    detectedTags: [],
    classificationVersion: "1.2.2",
    source: "automatic",
  };

  it("called by the classification: a valid result passes", () => {
    expect(ClassificationValidator.validate(valid)).toBe(true);
  });

  it("refuses an unknown feature, a feature twice, features out of order, a bad source", () => {
    const refused = [
      { ...valid, detectedFeatures: ["organic"] },
      { ...valid, detectedFeatures: ["tall", "tall"] },
      { ...valid, detectedFeatures: ["hollow", "tall"] },
      { ...valid, source: "guess" as Classification["source"] },
      { ...valid, confidenceScore: 101 },
    ];

    for (const classification of refused) {
      expect(ClassificationValidator.validate(classification)).toBe(false);
    }
  });

  it("AnalysisSchema accepts a classification without source (read as automatic)", () => {
    const withoutSource: Partial<Classification> = { ...valid };

    delete withoutSource.source;
    const parsed =
      AnalysisClassificationSchema.strict().safeParse(withoutSource);

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.source).toBe("automatic");
    expect(
      AnalysisClassificationSchema.strict().safeParse({
        ...valid,
        source: "guess",
      }).success,
    ).toBe(false);
  });

  it("category chosen by the user: kept with confidence 100, features computed again", () => {
    const chosen: Classification = {
      ...valid,
      category: "gear",
      confidenceScore: 100,
      source: "user",
    };
    const computed = new ClassificationEngine().classify(["small", "planar"]);

    expect(ClassificationEngine.keepUserChoice(chosen, computed)).toEqual({
      ...chosen,
      detectedFeatures: ["small", "planar"],
    });
    // An automatic classification is replaced by the new one
    expect(ClassificationEngine.keepUserChoice(valid, computed)).toBe(computed);
    expect(ClassificationEngine.keepUserChoice(null, computed)).toBe(computed);
  });
});

describe("Classification: hollow without the slow exact hull (lot 90)", () => {
  /** Placed mesh and volume of a model, as given to the classifier */
  function placedOf(
    triangles: number[],
    rotation: Rotation = IDENTITY.rotation,
  ): { mesh: PlacedMesh; volume: number } {
    let captured: { mesh: PlacedMesh; volume: number } | null = null;

    analyzeModel(
      centered(triangles),
      { rotation, scale: IDENTITY.scale },
      (mesh, result) => {
        captured = { mesh, volume: result.geometry.volume };

        return ClassificationEngine.classifyModel(mesh, result);
      },
    );

    return captured!;
  }

  const models: [string, () => number[], Rotation?][] = [
    ["sphere", () => sphere(30, 96, 48)],
    ["sphere turned", () => sphere(30, 96, 48), { x: 30, y: 20, z: 10 }],
    ["open vase", openVase],
    ["open box", openBox],
    ["closed box", closedBox],
    ["plate with holes", plateWithHoles],
    ["L bracket", () => lBracket(10, 100, 10)],
    [
      "cube turned 45 degrees",
      () => box([0, 0, 0], [20, 20, 20]),
      { x: 45, y: 0, z: 0 },
    ],
  ];

  it.each(models)(
    "%s: the bounds frame the exact hull volume",
    (_, build, rotation) => {
      const { mesh } = placedOf(build(), rotation);
      const exact = convexHullVolume(mesh);
      const bounds = hullVolumeBounds(mesh);

      expect(exact).toBeGreaterThan(0);
      expect(bounds).not.toBeNull();
      expect(bounds!.lower).toBeLessThanOrEqual(exact);
      expect(bounds!.upper).toBeGreaterThanOrEqual(exact);
    },
  );

  it.each(models)(
    "%s: the same answer as the exact ratio",
    (_, build, rotation) => {
      const { mesh, volume } = placedOf(build(), rotation);
      const exact = convexHullVolume(mesh);

      expect(isHollow(mesh, volume)).toBe(
        exact > 0 &&
          volume / exact <= FEATURE_THRESHOLDS.HOLLOW_MAX_RATIO + 1e-9,
      );
    },
  );

  it("ratio close to the limit (between the bounds): the exact hull decides", () => {
    const { mesh } = placedOf(sphere(30, 96, 48));
    const exact = convexHullVolume(mesh);
    const bounds = hullVolumeBounds(mesh)!;
    const limit = FEATURE_THRESHOLDS.HOLLOW_MAX_RATIO;

    // Both volumes lie between the two bounds: undecided by them
    expect(limit * exact * 0.999).toBeGreaterThan(limit * bounds.lower);
    expect(limit * exact * 1.001).toBeLessThan(limit * bounds.upper);
    expect(isHollow(mesh, limit * exact * 0.999)).toBe(true);
    expect(isHollow(mesh, limit * exact * 1.001)).toBe(false);
  });

  it("flat mesh or too few points: no bounds, never hollow", () => {
    const flat = placedOf([
      0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0, 0, 10, 0, 10, 0, 0,
    ]);

    expect(hullVolumeBounds(flat.mesh)).toBeNull();
    expect(isHollow(flat.mesh, 0)).toBe(false);
  });
});
