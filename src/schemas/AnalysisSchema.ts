/**
 * SlicyWeb
 * Analysis Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import { z } from "zod";

import { CLASSIFICATION_CATEGORIES } from "../constants/AnalysisConstants";

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

  classificationVersion: z.string().min(1)
});

export const AnalysisSchema = z.object({
  analysisId: z.string().min(1),

  objectId: z.string().min(1),

  status: ResultStatusSchema,

  dimensions: z.record(
    z.string(),
    z.unknown()
  ),

  geometry: z.object({
    width: z.number(),

    depth: z.number(),

    height: z.number(),

    volume: z.number(),

    surfaceArea: z.number()
  }),

  mesh: z.object({
    vertices: z.number(),

    triangles: z.number()
  }),

  stability: z.object({
    contactArea: z.number(),

    heightRatio: z.number(),

    centerOfGravity: z.record(
      z.string(),
      z.unknown()
    ),

    riskScore: z.number()
  }),

  overhangs: z.object({
    detected: z.boolean(),

    maxAngle: z.number(),

    percentage: z.number()
  }),

  bridges: z.object({
    detected: z.boolean(),

    count: z.number(),

    longestBridge: z.number()
  }),

  thinWalls: z.object({
    detected: z.boolean(),

    minimumThickness: z.number()
  }),

  classification: AnalysisClassificationSchema
});

export type AnalysisSchemaType =
  z.infer<typeof AnalysisSchema>;
