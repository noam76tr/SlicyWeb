/**
 * SlicyWeb
 * Project Validator
 *
 * Responsible for:
 * - WYPROJ format version (WYPROJ Version Rule)
 * - Project structure validation (Project Schema)
 * - Object Reference Rules 3 to 5 (ADR-026)
 * - Full content of analysis and recommendation entries
 *   (AnalysisSchema, RecommendationSchema)
 * - Date format validation
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md
 */

import { WYPROJ_FORMAT_VERSION } from "../constants/ApplicationConstants";
import { ProjectSchema } from "../schemas/ProjectSchema";
import type { Project } from "../types/Project";

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
   * WYPROJ Version Rule (DATA_SCHEMA.md, Project File Schema):
   * only the current WYPROJ format version is accepted.
   */
  public validateFormatVersion(version: unknown): void {
    if (version === WYPROJ_FORMAT_VERSION) {
      return;
    }

    const found =
      typeof version === "string" && version.trim().length > 0
        ? `WYPROJ format version "${version}" is not supported`
        : "The WYPROJ format version is missing";

    throw new Error(
      `PROJ_003 Project Version Mismatch: ${found}. ` +
        `This version of SlicyWeb opens WYPROJ format version ${WYPROJ_FORMAT_VERSION} only.`
    );
  }

  private validateProject(project: Project): void {
    if (!project) {
      throw new Error("Project is required.");
    }
  }

  private validateSchema(project: Project): void {
    const result = ProjectSchema.safeParse(project);

    if (!result.success) {
      const issue = result.error.issues[0];

      throw new Error(
        `Invalid project at '${issue.path.join(".")}': ${issue.message}`
      );
    }
  }

  private validateDate(
    value: string,
    fieldName: string
  ): void {
    const timestamp = Date.parse(value);

    if (Number.isNaN(timestamp)) {
      throw new Error(
        `Project field '${fieldName}' contains an invalid date.`
      );
    }
  }
}
