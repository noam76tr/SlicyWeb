import { ProjectState } from "./ProjectManager";

export class ProjectSerializer {
  public serialize(project: ProjectState): string {
    const normalizedProject = this.normalize(project);

    return JSON.stringify(normalizedProject, null, 2);
  }

  private normalize(project: ProjectState): ProjectState {
    return {
      metadata: {
        version: project.metadata.version,
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.updatedAt,
        application: project.metadata.application,
      },
      scene: project.scene ?? null,
      printers: project.printers ?? [],
      materials: project.materials ?? [],
      filaments: project.filaments ?? [],
      presets: project.presets ?? [],
      analysis: project.analysis ?? [],
      recommendations: project.recommendations ?? [],
      settings: project.settings ?? {},
    };
  }
}
