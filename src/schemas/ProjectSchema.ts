/**
 * SlicyWeb
 * Project Schema
 *
 * Runtime validation schema.
 *
 * Validates:
 * - The project (Project Schema)
 * - The WYPROJ file container (Project File Schema)
 * - The objects of the scene in full (Object Schema, Transform Schema,
 *   Model Geometry Schema, Mesh Statistics Schema, meshData; lot 111)
 * - Object Reference Rules 3, 4 and 5 (ADR-026)
 * - The copies of the printer, the material and the filament
 *   (PrinterSchema, MaterialSchema, FilamentSchema; lot 111, Q3 A)
 *
 * Analysis and recommendation entries are validated in full
 * with AnalysisSchema and RecommendationSchema (KI-003).
 *
 * The triangles of meshData are decoded and checked by MeshDataCodec
 * (ProjectValidator): here, only the text (base64) and its length.
 *
 * Phase 13 (lot 111, decision 119 of Noam, Q1 to Q22 A): the scene holds
 * its objects only, the selections are those of the project (Q4 A), preset
 * is null and settings is {} (Q4 A); unknown fields are refused (SECURITY_
 * SPEC.md, Project Rejection Conditions).
 *
 * Based on:
 * - DATA_SCHEMA.md 3.16.0
 * - API_SPEC.md
 * - DECISIONS.md (ADR-026, ADR-038)
 */

import { z } from "zod";

import { MAX_NAME_LENGTH } from "../constants/ObjectConstants";
import { AnalysisSchema, ResultStatusSchema } from "./AnalysisSchema";
import { FilamentSchema } from "./FilamentSchema";
import { MaterialSchema } from "./MaterialSchema";
import { PrinterSchema } from "./PrinterSchema";
import { RecommendationSchema } from "./RecommendationSchema";

export { ResultStatusSchema };

/** Bytes of one triangle in meshData: 9 numbers of 4 bytes */
export const MESH_BYTES_PER_TRIANGLE = 36;

/** Largest number of triangles of one object (as the 3MF import) */
export const MAX_PROJECT_TRIANGLES = 20_000_000;

const finite = z.number().finite();

const VectorSchema = z
  .object({ x: finite, y: finite, z: finite })
  .strict();

const ScaleSchema = z
  .object({
    x: finite.positive(),
    y: finite.positive(),
    z: finite.positive(),
  })
  .strict();

export const TransformSchema = z
  .object({
    position: VectorSchema,
    rotation: VectorSchema,
    scale: ScaleSchema,
  })
  .strict();

const GeometrySchema = z
  .object({
    width: finite.min(0),
    depth: finite.min(0),
    height: finite.min(0),
    volume: finite,
    surfaceArea: finite.min(0),
  })
  .strict();

const MeshStatisticsSchema = z
  .object({
    vertices: z.number().int().min(0),
    triangles: z.number().int().min(1).max(MAX_PROJECT_TRIANGLES),
  })
  .strict();

/**
 * Text of base64 (RFC 4648), padded: read character by character (a
 * regular expression overflows the stack on a text of millions of
 * characters, as the triangles of a large object)
 */
export function isBase64(text: string): boolean {
  const length = text.length;

  if (length % 4 !== 0) {
    return false;
  }

  for (let index = 0; index < length; index += 1) {
    const code = text.charCodeAt(index);

    if (
      (code >= 65 && code <= 90) || // A-Z
      (code >= 97 && code <= 122) || // a-z
      (code >= 48 && code <= 57) || // 0-9
      code === 43 || // +
      code === 47 // /
    ) {
      continue;
    }

    // "=" only as the padding: the last character, or the last two
    if (
      code === 61 &&
      (index === length - 1 ||
        (index === length - 2 && text.charCodeAt(length - 1) === 61))
    ) {
      continue;
    }

    return false;
  }

  return true;
}

/** Length of the base64 text of n bytes */
export function base64Length(bytes: number): number {
  return Math.ceil(bytes / 3) * 4;
}

/**
 * Object of the scene (DATA_SCHEMA.md 3.16.0, Object Schema): its
 * fields, its transform, its geometry and its mesh statistics (the object
 * of the window, Object3D).
 */
export const ProjectObjectFieldsSchema = z
  .object({
    objectId: z.string().min(1).max(200),
    fileName: z.string().min(1).max(1000),
    name: z
      .string()
      .min(1)
      .refine(
        (name) =>
          name === name.trim() && [...name].length <= MAX_NAME_LENGTH,
        "Invalid name",
      )
      .nullable(),
    fileType: z.enum(["stl", "3mf"]),
    visible: z.boolean(),
    locked: z.boolean(),
    transform: TransformSchema,
    geometry: GeometrySchema,
    mesh: MeshStatisticsSchema,
  })
  .strict();

/** Object of a project file: its fields and its triangles (meshData) */
export const ProjectObjectSchema = ProjectObjectFieldsSchema.extend({
  meshData: z.string(),
})
  .strict()
  .superRefine((object, context) => {
    if (
      object.meshData.length !==
        base64Length(object.mesh.triangles * MESH_BYTES_PER_TRIANGLE) ||
      !isBase64(object.meshData)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meshData"],
        message: "meshData does not hold the triangles of the object.",
      });
    }
  });

export const ProjectSceneSchema = z
  .object({
    objects: z.array(ProjectObjectSchema),
  })
  .strict();

export const ProjectSchema = z
  .object({
    projectId: z.string().min(1),
    projectName: z.string(),
    projectFormat: z.literal("WYPROJ"),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    version: z.string().min(1),
    scene: ProjectSceneSchema,
    settings: z.object({}).strict(),
    analysis: z.record(z.string(), AnalysisSchema),
    recommendations: z.record(
      z.string(),
      RecommendationSchema,
    ),
    preset: z.null(),
    printer: PrinterSchema.nullable(),
    material: MaterialSchema.nullable(),
    filament: FilamentSchema.nullable(),
  })
  .strict()
  .superRefine((project, context) => {
    const sceneObjectIds = new Set<string>();

    project.scene.objects.forEach((object, index) => {
      // Each objectId is unique in the scene (Object Reference Rule 1)
      if (sceneObjectIds.has(object.objectId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scene", "objects", index, "objectId"],
          message: "objectId must be unique in the scene.",
        });
      }

      sceneObjectIds.add(object.objectId);
    });

    // A filament belongs to the family of the material (ADR-033, D9)
    if (
      project.filament &&
      project.material &&
      project.filament.material !== project.material.category
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["filament", "material"],
        message: "The filament must belong to the family of the material.",
      });
    }

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

/**
 * metadata of the file (IMPORT_EXPORT_SPEC.md 3.2.0): application;
 * author is never written (Q21 A) but accepted when a file has it.
 */
export const ProjectMetadataSchema = z
  .object({
    application: z.string(),
    author: z.string().optional(),
  })
  .strict();

export const ProjectFileSchema = z
  .object({
    format: z.literal("WYPROJ"),
    version: z.string().min(1),
    project: ProjectSchema,
    metadata: ProjectMetadataSchema,
  })
  .strict();

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type ProjectFileSchemaType = z.infer<typeof ProjectFileSchema>;
