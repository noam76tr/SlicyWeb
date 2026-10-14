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
import type { Object3D, Transform } from "../types/Object3D";
import { ObjectDuplicator } from "../object_manager/ObjectDuplicator";
import { TransformValidator } from "../transform/TransformValidator";

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

  /**
   * Object Reference Rule 6: removing an object removes
   * its analysis and its recommendation.
   */
  public removeObject(objectId: string): void {
    this.ensureProjectLoaded();

    const project = this.currentProject!;

    project.scene = {
      ...project.scene,
      objects: project.scene.objects.filter(
        (object) => object.objectId !== objectId
      ),
    };

    const analysis = { ...project.analysis };
    delete analysis[objectId];
    project.analysis = analysis;

    const recommendations = { ...project.recommendations };
    delete recommendations[objectId];
    project.recommendations = recommendations;

    this.touch();

    this.emit("project:object-removed", objectId);
  }

  /**
   * Object Reference Rule 7: the copy receives a new objectId
   * and inherits no analysis and no recommendation.
   */
  public duplicateObject(objectId: string): Object3D {
    this.ensureProjectLoaded();

    const project = this.currentProject!;

    const original = project.scene.objects.find(
      (object) => object.objectId === objectId
    );

    if (!original) {
      throw new Error(`Object not found in the scene: ${objectId}`);
    }

    const copy = new ObjectDuplicator().duplicate(original);

    project.scene = {
      ...project.scene,
      objects: [...project.scene.objects, copy],
    };

    this.touch();

    this.emit("project:object-duplicated", copy);

    return copy;
  }

  /**
   * Object Reference Rule 8: a change of rotation or scale makes the
   * analysis and the recommendation of the object outdated.
   * A change of position alone does not change their status.
   */
  public updateObjectTransform(
    objectId: string,
    transform: Transform
  ): void {
    this.ensureProjectLoaded();

    const project = this.currentProject!;

    const object = project.scene.objects.find(
      (candidate) => candidate.objectId === objectId
    );

    if (!object) {
      throw new Error(`Object not found in the scene: ${objectId}`);
    }

    const orientationChanged = TransformValidator.changesOrientation(
      object.transform,
      transform
    );

    project.scene = {
      ...project.scene,
      objects: project.scene.objects.map((candidate) =>
        candidate.objectId === objectId
          ? { ...candidate, transform }
          : candidate
      ),
    };

    if (orientationChanged) {
      this.markResultsOutdated(objectId);
    }

    this.touch();

    this.emit("project:object-transformed", objectId);
  }

  /**
   * Stores the analysis of one object (computed or recomputed).
   * A recomputed analysis keeps the analysisId of the object
   * (Object Reference Rule 5). Object Reference Rule 9: the
   * recommendation of the same object becomes outdated.
   */
  public setObjectAnalysis(analysis: Analysis): Analysis {
    this.ensureProjectLoaded();

    const project = this.currentProject!;

    const previous = project.analysis[analysis.objectId];

    const stored: Analysis = previous
      ? { ...analysis, analysisId: previous.analysisId }
      : analysis;

    project.analysis = {
      ...project.analysis,
      [analysis.objectId]: stored,
    };

    this.markRecommendationOutdated(analysis.objectId);

    this.touch();

    this.emit("project:analysis-updated", project.analysis);

    return stored;
  }

  /**
   * Object Reference Rules 8 and 9: the analysis of the object
   * becomes outdated, and so does its recommendation.
   */
  public markAnalysisOutdated(objectId: string): void {
    this.ensureProjectLoaded();

    this.markResultsOutdated(objectId);

    this.touch();

    this.emit("project:analysis-updated", this.currentProject!.analysis);
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

  private markResultsOutdated(objectId: string): void {
    const project = this.currentProject!;

    const analysis = project.analysis[objectId];

    if (analysis) {
      project.analysis = {
        ...project.analysis,
        [objectId]: { ...analysis, status: "outdated" },
      };
    }

    this.markRecommendationOutdated(objectId);
  }

  private markRecommendationOutdated(objectId: string): void {
    const project = this.currentProject!;

    const recommendation = project.recommendations[objectId];

    if (recommendation) {
      project.recommendations = {
        ...project.recommendations,
        [objectId]: { ...recommendation, status: "outdated" },
      };
    }
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
