import { ProjectState } from "./ProjectManager";

export class ProjectDeserializer {
  public deserialize(content: string): ProjectState {
    try {
      const parsed = JSON.parse(content);

      return this.normalize(parsed);
    } catch (error) {
      throw new Error(
        `Failed to deserialize project: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

   private normalize(data: unknown): ProjectState {
     if (typeof data !== "object" || data === null) {
       throw new Error("Invalid project structure.");
    }

   const project = data as Partial<ProjectState>;
   return {
      metadata: {
        version: project.metadata?.version ?? "1.0.0",
        createdAt:
          project.metadata?.createdAt ?? new Date().toISOString(),
        updatedAt:
          project.metadata?.updatedAt ?? new Date().toISOString(),
        application:
          project.metadata?.application ??
          "SlicyWeb Smart Slicer",
      },
      scene: project.scene ?? null,
      printers: Array.isArray(project.printers)
        ? project.printers
        : [],
      materials: Array.isArray(project.materials)
        ? project.materials
        : [],
      filaments: Array.isArray(project.filaments)
        ? project.filaments
        : [],
      presets: Array.isArray(project.presets)
        ? project.presets
        : [],
      analysis: Array.isArray(project.analysis)
        ? project.analysis
        : [],
      recommendations: Array.isArray(project.recommendations)
        ? project.recommendations
        : [],
      settings:
        typeof project.settings === "object" &&
        project.settings !== null
          ? project.settings
          : {},
    };
  }
}
