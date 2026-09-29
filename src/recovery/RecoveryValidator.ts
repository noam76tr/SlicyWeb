/**
 * Wichy
 * Recovery Validator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

export class RecoveryValidator {
  public validate(
    project: Project | null
  ): boolean {
    if (!project) {
      return false;
    }

    return (
      this.validateIdentity(project) &&
      this.validateDates(project) &&
      this.validateVersion(project)
    );
  }

  private validateIdentity(
    project: Project
  ): boolean {
    return (
      project.projectId.trim()
        .length > 0 &&
      project.projectName.trim()
        .length > 0
    );
  }

  private validateDates(
    project: Project
  ): boolean {
    return (
      project.createdAt.trim()
        .length > 0 &&
      project.updatedAt.trim()
        .length > 0
    );
  }

  private validateVersion(
    project: Project
  ): boolean {
    return (
      project.version.trim()
        .length > 0
    );
  }
}
