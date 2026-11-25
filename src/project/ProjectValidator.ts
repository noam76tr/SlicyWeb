/**
 * SlicyWeb
 * Project Validator
 *
 * Responsible for:
 * - WYPROJ format version (WYPROJ Version Rule): only the version of
 *   SlicyWeb (3.0.0) is opened; a newer file is refused with PROJ_003
 *   "made by a newer version of SlicyWeb", an older one with PROJ_003 too
 *   while no conversion exists (lot 111, decision 119 of Noam, Q5 A)
 * - Project structure validation (Project Schema, objects in full,
 *   copies of the profiles; ProjectSchema)
 * - Object Reference Rules 3 to 5 (ADR-026)
 * - Full content of analysis and recommendation entries
 *   (AnalysisSchema, RecommendationSchema)
 * - Date format validation
 * - Triangles of each object (MeshDataCodec), with readMeshes()
 *
 * A refused project throws a ProjectError (PROJ_002, PROJ_003).
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md 3.16.0
 * - SECURITY_SPEC.md (Project Validation, Project Rejection Conditions)
 */

import { WYPROJ_FORMAT_VERSION } from "../constants/ApplicationConstants";
import { ProjectSchema } from "../schemas/ProjectSchema";
import type { Project } from "../types/Project";

import { MeshDataCodec } from "./MeshDataCodec";
import { ProjectError } from "./ProjectError";

/** Numbers of a version "x.y.z"; null when it is not one */
function versionNumbers(version: string): number[] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());

  return match ? match.slice(1).map(Number) : null;
}

/** The version a is newer than b (both "x.y.z") */
function isNewer(a: number[], b: number[]): boolean {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) {
      return a[index] > b[index];
    }
  }

  return false;
}

export class ProjectValidator {
  public validate(project: Project): boolean {
    this.validateProject(project);
    this.validateFormatVersion(project.version);
    this.validateSchema(project);
    this.validateDate(project.createdAt, "createdAt");
    this.validateDate(project.updatedAt, "updatedAt");

    return true;
  }

  /**
   * WYPROJ Version Rule (DATA_SCHEMA.md 3.16.0, Project File Schema):
   * only the current WYPROJ format version is accepted. A newer version
   * says so (params.newer); a version older than 3.0.0 has no conversion.
   */
  public validateFormatVersion(version: unknown): void {
    if (version === WYPROJ_FORMAT_VERSION) {
      return;
    }

    const text =
      typeof version === "string" && version.trim().length > 0
        ? version.trim()
        : null;
    const numbers = text ? versionNumbers(text) : null;
    const supported = versionNumbers(WYPROJ_FORMAT_VERSION) as number[];
    const newer = numbers !== null && isNewer(numbers, supported);

    throw new ProjectError(
      "PROJ_003",
      `Project Version Mismatch: ${
        text
          ? `WYPROJ format version "${text}" is not supported`
          : "The WYPROJ format version is missing"
      }. This version of SlicyWeb opens WYPROJ format version ${WYPROJ_FORMAT_VERSION} only.`,
      {
        fileVersion: text ?? "",
        supportedVersion: WYPROJ_FORMAT_VERSION,
        newer,
      },
    );
  }

  /**
   * Triangles of each object, by objectId (MeshDataCodec); PROJ_002 when
   * one of them cannot be read
   */
  public readMeshes(project: Project): Record<string, Float32Array> {
    const meshes: Record<string, Float32Array> = {};

    for (const object of project.scene.objects) {
      try {
        meshes[object.objectId] = MeshDataCodec.decode(
          object.meshData,
          object.mesh.triangles,
        );
      } catch (error) {
        throw new ProjectError(
          "PROJ_002",
          `Invalid project at 'scene.objects.${object.objectId}.meshData': ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          {},
          { cause: error },
        );
      }
    }

    return meshes;
  }

  private validateProject(project: Project): void {
    if (!project || typeof project !== "object") {
      throw new ProjectError("PROJ_002", "Project is required.");
    }
  }

  private validateSchema(project: Project): void {
    const result = ProjectSchema.safeParse(project);

    if (!result.success) {
      const issue = result.error.issues[0];

      throw new ProjectError(
        "PROJ_002",
        `Invalid project at '${issue.path.join(".")}': ${issue.message}`,
      );
    }
  }

  private validateDate(
    value: string,
    fieldName: string
  ): void {
    const timestamp = Date.parse(value);

    if (Number.isNaN(timestamp)) {
      throw new ProjectError(
        "PROJ_002",
        `Project field '${fieldName}' contains an invalid date.`,
      );
    }
  }
}
