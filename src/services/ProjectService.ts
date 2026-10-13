/**
 * SlicyWeb
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
 * - IMPORT_EXPORT_SPEC.md
 */

import type { Project } from "../types/Project";
import type { Scene } from "../types/Scene";
import { ProjectManager } from "../project/ProjectManager";
import { ProjectSerializer } from "../project/ProjectSerializer";
import { ProjectDeserializer } from "../project/ProjectDeserializer";
import { ProjectValidator } from "../project/ProjectValidator";

export class ProjectService {
  constructor(
    private readonly serializer: ProjectSerializer = new ProjectSerializer(),
    private readonly deserializer: ProjectDeserializer = new ProjectDeserializer(),
    private readonly validator: ProjectValidator = new ProjectValidator(),
    private readonly projectManager: ProjectManager = new ProjectManager(
      serializer,
      deserializer,
      validator,
    ),
  ) {}

  /**
   * Creates a new project.
   * Delegated to ProjectManager, the only project creator.
   */
  public createProject(
    projectName: string,
    scene: Scene,
  ): Project {
    return this.projectManager.createProject(
      projectName,
      scene,
    );
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
   * Delegated to the Project layer.
   */
  public serialize(
    project: Project,
  ): string {
    return this.serializer.serialize(
      project,
    );
  }

  /**
   * Deserializes and validates a project.
   * Delegated to the Project layer.
   */
  public deserialize(
    json: string,
  ): Project {
    const project =
      this.deserializer.deserialize(json);

    this.validator.validate(project);

    return project;
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
