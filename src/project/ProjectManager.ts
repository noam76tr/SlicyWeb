/**
 * SlicyWeb
 * Project Manager
 *
 * Responsible for:
 * - Project lifecycle management
 * - Project creation
 * - Project loading
 * - Project saving
 * - Project state management
 * - Project events emission
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

import { EventEmitter } from "events";
import { WYPROJ_FORMAT_VERSION } from "../constants/ApplicationConstants";
import { ProjectSerializer } from "./ProjectSerializer";
import { ProjectDeserializer } from "./ProjectDeserializer";
import { ProjectValidator } from "./ProjectValidator";
import type { Project } from "../types/Project";
import type { Scene } from "../types/Scene";
import type { Analysis } from "../types/Analysis";
import type { Recommendation } from "../types/Recommendation";

export { WYPROJ_FORMAT_VERSION };

export class ProjectManager extends EventEmitter {
  private currentProject: Project | null = null;

  constructor(
    private readonly serializer: ProjectSerializer,
    private readonly deserializer: ProjectDeserializer,
    private readonly validator: ProjectValidator
  ) {
    super();
  }

  public createProject(projectName: string, scene: Scene): Project {
    const timestamp = new Date().toISOString();

    this.currentProject = {
      projectId: crypto.randomUUID(),
      projectName,
      projectFormat: "WYPROJ",
      createdAt: timestamp,
      updatedAt: timestamp,
      version: WYPROJ_FORMAT_VERSION,
      scene,
      settings: {},
      analysis: {},
      recommendations: {},
      preset: null,
      printer: null,
      material: null,
      filament: null,
    };

    this.emit("project:created", this.currentProject);

    return this.currentProject;
  }

  public loadProject(projectContent: string): Project {
    const project = this.deserializer.deserialize(projectContent);

    this.validator.validate(project);

    this.currentProject = project;

    this.emit("project:loaded", project);

    return project;
  }

  public saveProject(): string {
    this.ensureProjectLoaded();

    this.currentProject!.updatedAt = new Date().toISOString();

    this.validator.validate(this.currentProject!);

    const content = this.serializer.serialize(this.currentProject!);

    this.emit("project:saved", this.currentProject);

    return content;
  }

  public closeProject(): void {
    const project = this.currentProject;

    this.currentProject = null;

    this.emit("project:closed", project);
  }

  public getProject(): Project | null {
    return this.currentProject;
  }

  public updateScene(scene: Scene): void {
    this.ensureProjectLoaded();

    this.currentProject!.scene = scene;

    this.touch();

    this.emit("project:scene-updated", scene);
  }

  public updateAnalysis(analysis: Record<string, Analysis>): void {
    this.ensureProjectLoaded();

    this.currentProject!.analysis = analysis;

    this.touch();

    this.emit("project:analysis-updated", analysis);
  }

  public updateRecommendations(
    recommendations: Record<string, Recommendation>
  ): void {
    this.ensureProjectLoaded();

    this.currentProject!.recommendations = recommendations;

    this.touch();

    this.emit("project:recommendations-updated", recommendations);
  }

  public updateSettings(settings: Record<string, unknown>): void {
    this.ensureProjectLoaded();

    this.currentProject!.settings = {
      ...this.currentProject!.settings,
      ...settings,
    };

    this.touch();

    this.emit("project:settings-updated", settings);
  }

  public validateCurrentProject(): boolean {
    this.ensureProjectLoaded();

    return this.validator.validate(this.currentProject!);
  }

  public hasOpenProject(): boolean {
    return this.currentProject !== null;
  }

  private touch(): void {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.updatedAt = new Date().toISOString();
  }

  private ensureProjectLoaded(): void {
    if (!this.currentProject) {
      throw new Error("No project is currently loaded.");
    }
  }
}
