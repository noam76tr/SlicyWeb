/**
 * Wichy
 * Session Restorer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

export class SessionRestorer {
  public restore(
    project: Project | null
  ): Project | null {
    if (!project) {
      return null;
    }

    return project;
  }

  public canRestore(
    project: Project | null
  ): boolean {
    return project !== null;
  }

  public isValidSession(
    project: Project | null
  ): boolean {
    return (
      project !== null &&
      project.projectId.trim().length > 0 &&
      project.projectName.trim().length > 0
    );
  }
}
