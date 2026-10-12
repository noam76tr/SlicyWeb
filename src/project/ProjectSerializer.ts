/**
 * SlicyWeb
 * Project Serializer
 *
 * Responsible for:
 * - Project serialization
 * - Project normalization
 * - JSON conversion
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - PROJECT_SPEC.md
 * - IMPORT_EXPORT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

export class ProjectSerializer {
  public serialize(project: Project): string {
    const normalizedProject = this.normalize(project);

    return JSON.stringify(normalizedProject, null, 2);
  }

  /**
   * Field order of the Project Schema (DATA_SCHEMA.md).
   */
  private normalize(project: Project): Project {
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      projectFormat: project.projectFormat,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      version: project.version,
      scene: project.scene,
      settings: project.settings,
      analysis: project.analysis,
      recommendations: project.recommendations,
      preset: project.preset,
      printer: project.printer,
      material: project.material,
      filament: project.filament,
    };
  }
}
