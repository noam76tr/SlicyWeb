/**
 * Wichy
 * Project Service
 *
 * Responsible for:
 * - Project creation
 * - Project loading
 * - Project saving
 * - Project validation
 *
 * No AI logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - Project.ts
 */

import type { Project } from "../types/Project";
import type { Scene } from "../types/Scene";

export class ProjectService {
  /**
   * Creates a new project.
   */
  public createProject(
    projectName: string,
    scene: Scene,
  ): Project {
    const timestamp =
      new Date().toISOString();

    return {
      projectId:
        crypto.randomUUID(),

      projectName,

      createdAt: timestamp,

      updatedAt: timestamp,

      version: "1.0.0",

      scene,

      settings: {},

      recommendations: {},

      preset: null,
    };
  }

  /**
   * Updates project timestamp.
   */
  public updateProject(
    project: Project,
  ): Project {
    return {
      ...project,

      updatedAt:
        new Date().toISOString(),
    };
  }

  /**
   * Serializes a project.
   */
  public serialize(
    project: Project,
  ): string {
    return JSON.stringify(
      project,
      null,
      2,
    );
  }

  /**
   * Deserializes a project.
   */
  public deserialize(
    json: string,
  ): Project {
    return JSON.parse(
      json,
    ) as Project;
  }

  /**
   * Validates a project.
   */
  public validate(
    project:
      | Project
      | null
      | undefined,
  ): boolean {
    if (!project) {
      return false;
    }

    if (!project.projectId.trim()) {
      return false;
    }

    if (!project.projectName.trim()) {
      return false;
    }

    return true;
  }
}
