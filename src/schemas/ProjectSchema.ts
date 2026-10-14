/**
 * SlicyWeb
 * Project Schema
 *
 * Runtime validation schema.
 *
 * Validates:
 * - The project (Project Schema)
 * - The WYPROJ file container (Project File Schema)
 * - Object Reference Rules 3, 4 and 5 (ADR-026)
 *
 * Analysis and recommendation entries are validated in full
 * with AnalysisSchema and RecommendationSchema (KI-003).
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - API_SPEC.md
 * - DECISIONS.md
 */

import { z } from "zod";

import { AnalysisSchema, ResultStatusSchema } from "./AnalysisSchema";
import { RecommendationSchema } from "./RecommendationSchema";

export { ResultStatusSchema };

const SCHEMA_VALUE = z.record(z.string(), z.unknown());

export const SceneObjectReferenceSchema = z
  .object({
    objectId: z.string().min(1),
  })
  .passthrough();

export const ProjectSceneSchema = z
  .object({
    objects: z.array(SceneObjectReferenceSchema),
  })
  .passthrough();

export const ProjectSchema = z
  .object({
    projectId: z.string().min(1),
    projectName: z.string(),
    projectFormat: z.literal("WYPROJ"),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    version: z.string().min(1),
    scene: ProjectSceneSchema,
    settings: SCHEMA_VALUE,
    analysis: z.record(z.string(), AnalysisSchema),
    recommendations: z.record(
      z.string(),
      RecommendationSchema,
    ),
    preset: SCHEMA_VALUE.nullable(),
    printer: SCHEMA_VALUE.nullable(),
    material: SCHEMA_VALUE.nullable(),
    filament: SCHEMA_VALUE.nullable(),
  })
  .superRefine((project, context) => {
    const sceneObjectIds = new Set(
      project.scene.objects.map((object) => object.objectId),
    );

    for (const [key, entry] of Object.entries(project.analysis)) {
      // Rule 3: the key equals the objectId of the entry.
      if (entry.objectId !== key) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["analysis", key, "objectId"],
          message: "Analysis key must equal its objectId.",
        });
      }

      // Rule 4: the objectId exists in scene.objects.
      if (!sceneObjectIds.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["analysis", key],
          message: "Analysis objectId must exist in scene.objects.",
        });
      }
    }

    for (const [key, entry] of Object.entries(project.recommendations)) {
      // Rule 3: the key equals the objectId of the entry.
      if (entry.objectId !== key) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recommendations", key, "objectId"],
          message: "Recommendation key must equal its objectId.",
        });
      }

      // Rule 4: the objectId exists in scene.objects.
      if (!sceneObjectIds.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recommendations", key],
          message: "Recommendation objectId must exist in scene.objects.",
        });
      }

      // Rule 5: analysisId references the analysis of the same object.
      if (project.analysis[key]?.analysisId !== entry.analysisId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recommendations", key, "analysisId"],
          message:
            "Recommendation analysisId must reference the analysis of the same object.",
        });
      }
    }
  });

export const ProjectFileSchema = z.object({
  format: z.literal("WYPROJ"),
  version: z.string().min(1),
  project: ProjectSchema,
  metadata: SCHEMA_VALUE,
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;

export type ProjectFileSchemaType = z.infer<typeof ProjectFileSchema>;
