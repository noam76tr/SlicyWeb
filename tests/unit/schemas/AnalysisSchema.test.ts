/**
 * SlicyWeb
 * Analysis Schema Tests
 *
 * Complete Analysis Schema (DATA_SCHEMA.md 3.9.0, ADR-034): classification
 * is null until the object is classified (Phase 10); a classification
 * object stays valid (WYPROJ 3.0.0); every part is strict and its values
 * are checked against the Analysis Rules (units, ranges, whole numbers).
 *
 * Based on:
 * - DATA_SCHEMA.md (Complete Analysis Schema, Analysis Rules)
 * - DECISIONS.md (ADR-034)
 * - TEST_PLAN.md (Analysis Engine Unit Tests)
 */

import { describe, expect, it } from "vitest";

import { AnalysisSchema } from "../../../src/schemas/AnalysisSchema";

/** Analysis of a cube of 20 mm (TEST_PLAN.md, Phase 9 models). */
function cubeAnalysis(): Record<string, unknown> {
  return {
    analysisId: "analysis-1",
    objectId: "object-1",
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
    classification: null,
  };
}

/** Copy of the cube analysis with one part changed. */
function withPart(
  part: string,
  value: unknown,
): Record<string, unknown> {
  return { ...cubeAnalysis(), [part]: value };
}

describe("AnalysisSchema (DATA_SCHEMA.md 3.9.0)", () => {
  it("accepts an analysis whose classification is null (not yet classified)", () => {
    expect(AnalysisSchema.safeParse(cubeAnalysis()).success).toBe(true);
  });

  it("accepts an analysis with a classification object (WYPROJ 3.0.0)", () => {
    const analysis = withPart("classification", {
      category: "mechanical_part",
      subcategory: "",
      confidenceScore: 80,
      detectedFeatures: [],
      detectedTags: [],
      classificationVersion: "1.0.0",
    });

    expect(AnalysisSchema.safeParse(analysis).success).toBe(true);
  });

  it("refuses an analysis without classification", () => {
    const analysis = cubeAnalysis();
    delete analysis.classification;

    expect(AnalysisSchema.safeParse(analysis).success).toBe(false);
  });

  it("refuses a field that is not in DATA_SCHEMA.md, at any level", () => {
    expect(
      AnalysisSchema.safeParse({ ...cubeAnalysis(), printabilityScore: 100 })
        .success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("mesh", { vertices: 8, triangles: 12, openEdges: 0 }),
      ).success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("stability", {
          contactArea: 400,
          heightRatio: 1,
          centerOfGravity: { x: 0, y: 0, z: 0, w: 0 },
          riskScore: 0,
        }),
      ).success,
    ).toBe(false);
  });

  it("refuses dimensions and centerOfGravity without their three values", () => {
    expect(AnalysisSchema.safeParse(withPart("dimensions", {})).success).toBe(
      false,
    );

    expect(
      AnalysisSchema.safeParse(
        withPart("stability", {
          contactArea: 400,
          heightRatio: 1,
          centerOfGravity: {},
          riskScore: 0,
        }),
      ).success,
    ).toBe(false);
  });

  it("accepts a negative center of gravity, refuses a negative volume", () => {
    expect(
      AnalysisSchema.safeParse(
        withPart("stability", {
          contactArea: 400,
          heightRatio: 1,
          centerOfGravity: { x: -1.5, y: 2, z: -3 },
          riskScore: 0,
        }),
      ).success,
    ).toBe(true);

    expect(
      AnalysisSchema.safeParse(
        withPart("geometry", {
          width: 20,
          depth: 20,
          height: 20,
          volume: -8000,
          surfaceArea: 2400,
        }),
      ).success,
    ).toBe(false);
  });

  it("refuses values out of their range", () => {
    expect(
      AnalysisSchema.safeParse(
        withPart("overhangs", { detected: true, maxAngle: 91, percentage: 10 }),
      ).success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("overhangs", { detected: true, maxAngle: 60, percentage: 101 }),
      ).success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("stability", {
          contactArea: 400,
          heightRatio: 1,
          centerOfGravity: { x: 0, y: 0, z: 0 },
          riskScore: 120,
        }),
      ).success,
    ).toBe(false);
  });

  it("refuses counts that are not whole numbers and a risk that is not rounded", () => {
    expect(
      AnalysisSchema.safeParse(withPart("mesh", { vertices: 8.5, triangles: 12 }))
        .success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("bridges", { detected: true, count: 1.5, longestBridge: 20 }),
      ).success,
    ).toBe(false);

    expect(
      AnalysisSchema.safeParse(
        withPart("stability", {
          contactArea: 400,
          heightRatio: 1.125,
          centerOfGravity: { x: 0, y: 0, z: 0 },
          riskScore: 2.5,
        }),
      ).success,
    ).toBe(false);
  });

  it("refuses a value that is not finite", () => {
    expect(
      AnalysisSchema.safeParse(
        withPart("thinWalls", {
          detected: false,
          minimumThickness: Number.POSITIVE_INFINITY,
        }),
      ).success,
    ).toBe(false);
  });
});
