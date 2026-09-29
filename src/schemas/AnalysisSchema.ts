/**
 * Wichy
 * Analysis Schema Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 * - OBJECT_CLASSIFICATION_SPEC.md
 */

import { z } from "zod";

export const AnalysisSchema = z.object({
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

  classification: z.object({
    category: z.string(),

    confidenceScore: z.number(),

    detectedFeatures: z.array(
      z.string()
    )
  })
});

export type AnalysisSchemaType =
  z.infer<typeof AnalysisSchema>;
