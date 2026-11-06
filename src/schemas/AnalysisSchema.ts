/**
 * SlicyWeb
 * Analysis Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules;
 *   3.10.0: Object Classification Schema, Classification Rules)
 * - DECISIONS.md (ADR-034)
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 *
 * Every object is strict: a field that is not in DATA_SCHEMA.md is refused.
 */

import { z } from "zod";

import {
  CLASSIFICATION_CATEGORIES,
  CLASSIFICATION_SOURCES
} from "../constants/AnalysisConstants";

/**
 * Status of an analysis or a recommendation (DATA_SCHEMA.md,
 * Analysis Status Values and Recommendation Status Values).
 */
export const ResultStatusSchema = z.enum(["generated", "outdated"]);

/**
 * Object Classification Schema (DATA_SCHEMA.md).
 */
export const AnalysisClassificationSchema = z.object({
  category: z.enum(CLASSIFICATION_CATEGORIES),

  subcategory: z.string(),

  confidenceScore: z.number().min(0).max(100),

  detectedFeatures: z.array(
    z.string()
  ),

  detectedTags: z.array(
    z.string()
  ),

  classificationVersion: z.string().min(1),

  /**
   * DATA_SCHEMA.md 3.10.0: a classification without source (WYPROJ 3.0.0
   * file written before 3.10.0) is read as automatic.
   */
  source: z.enum(CLASSIFICATION_SOURCES).default("automatic")
});

/** Length, area or volume: finite and not negative (mm, mm², mm³). */
const MeasureSchema = z.number().finite().min(0);

/** Count: whole number, not negative. */
const CountSchema = z.number().int().min(0);

/** Percentage: 0 to 100. */
const PercentageSchema = z.number().finite().min(0).max(100);

export const AnalysisSchema = z.object({
  analysisId: z.string().min(1),

  objectId: z.string().min(1),

  status: ResultStatusSchema,

  /** Size of the placed object along X, Y, Z, in mm. */
  dimensions: z.object({
    width: MeasureSchema,

    depth: MeasureSchema,

    height: MeasureSchema
  }).strict(),

  /** Same size as dimensions (Known Duplication), volume, surface area. */
  geometry: z.object({
    width: MeasureSchema,

    depth: MeasureSchema,

    height: MeasureSchema,

    volume: MeasureSchema,

    surfaceArea: MeasureSchema
  }).strict(),

  mesh: z.object({
    vertices: CountSchema,

    triangles: CountSchema
  }).strict(),

  stability: z.object({
    contactArea: MeasureSchema,

    heightRatio: MeasureSchema,

    /** Relative to the center of the object, axes of the plate, in mm. */
    centerOfGravity: z.object({
      x: z.number().finite(),

      y: z.number().finite(),

      z: z.number().finite()
    }).strict(),

    riskScore: z.number().int().min(0).max(100)
  }).strict(),

  overhangs: z.object({
    detected: z.boolean(),

    /** Degrees from the vertical. */
    maxAngle: z.number().finite().min(0).max(90),

    percentage: PercentageSchema
  }).strict(),

  bridges: z.object({
    detected: z.boolean(),

    count: CountSchema,

    longestBridge: MeasureSchema
  }).strict(),

  thinWalls: z.object({
    detected: z.boolean(),

    minimumThickness: MeasureSchema
  }).strict(),

  /**
   * null = not yet classified (Phase 10, ADR-034 D1). Strict here only:
   * RecommendationSchema keeps its own rule for its copy.
   */
  classification: AnalysisClassificationSchema.strict().nullable()
}).strict();

export type AnalysisSchemaType =
  z.infer<typeof AnalysisSchema>;
