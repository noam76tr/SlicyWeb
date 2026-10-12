/**
 * SlicyWeb
 * Project Validator
 *
 * Responsible for:
 * - Project structure validation (Project Schema)
 * - Object Reference Rules 3 to 5 (ADR-026)
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

import { ProjectSchema } from "../schemas/ProjectSchema";
import type { Project } from "../types/Project";

export class ProjectValidator {
  public validate(project: Project): boolean {
    this.validateProject(project);
    this.validateSchema(project);
    this.validateDate(project.createdAt, "createdAt");
    this.validateDate(project.updatedAt, "updatedAt");

    return true;
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
