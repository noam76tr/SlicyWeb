import { EventEmitter } from "events";
import { ProjectSerializer } from "./ProjectSerializer";
import { ProjectDeserializer } from "./ProjectDeserializer";
import { ProjectValidator } from "./ProjectValidator";

export interface ProjectMetadata {
  version: string;
  createdAt: string;
  updatedAt: string;
  application: string;
}

export interface ProjectState {
  metadata: ProjectMetadata;
  scene?: unknown;
  printers?: unknown[];
  materials?: unknown[];
  filaments?: unknown[];
  presets?: unknown[];
  analysis?: unknown[];
  recommendations?: unknown[];
  settings?: Record<string, unknown>;
}

export class ProjectManager extends EventEmitter {
  private currentProject: ProjectState | null = null;

  constructor(
    private readonly serializer: ProjectSerializer,
    private readonly deserializer: ProjectDeserializer,
    private readonly validator: ProjectValidator
  ) {
    super();
  }

  public createProject(): ProjectState {
    const timestamp = new Date().toISOString();

    this.currentProject = {
      metadata: {
        version: "2.0.0",
        createdAt: timestamp,
        updatedAt: timestamp,
        application: "SlicyWeb Smart Slicer",
      },
      scene: null,
      printers: [],
      materials: [],
      filaments: [],
      presets: [],
      analysis: [],
      recommendations: [],
      settings: {},
    };

    this.emit("project:created", this.currentProject);

    return this.currentProject;
  }

  public loadProject(projectContent: string): ProjectState {
    const project = this.deserializer.deserialize(projectContent);

    this.validator.validate(project);

    this.currentProject = project;

    this.emit("project:loaded", project);

    return project;
  }

  public saveProject(): string {
    this.ensureProjectLoaded();

    this.currentProject!.metadata.updatedAt = new Date().toISOString();

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

  public getProject(): ProjectState | null {
    return this.currentProject;
  }

  public updateScene(scene: unknown): void {
    this.ensureProjectLoaded();

    this.currentProject!.scene = scene;

    this.touch();

    this.emit("project:scene-updated", scene);
  }

  public updateAnalysis(analysis: unknown[]): void {
    this.ensureProjectLoaded();

    this.currentProject!.analysis = analysis;

    this.touch();

    this.emit("project:analysis-updated", analysis);
  }

  public updateRecommendations(recommendations: unknown[]): void {
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

    this.currentProject.metadata.updatedAt = new Date().toISOString();
  }

  private ensureProjectLoaded(): void {
    if (!this.currentProject) {
      throw new Error("No project is currently loaded.");
    }
  }
}
