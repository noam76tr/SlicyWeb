import { ProjectState } from "./ProjectManager";

export interface WYPROJFile {
  format: "WYPROJ";
  version: string;
  project: ProjectState;
}

export class WYPROJExporter {
  /**
   * Creates a valid WYPROJ container.
   */
  public static create(
    project: ProjectState
  ): WYPROJFile {
    return {
      format: "WYPROJ",
      version: project.metadata.version,
      project,
    };
  }

  /**
   * Serializes a project into WYPROJ JSON format.
   */
  public static serialize(
    project: ProjectState
  ): string {
    const wyproj = this.create(project);

    return JSON.stringify(wyproj, null, 2);
  }

  /**
   * Creates a downloadable blob.
   */
  public static createBlob(
    project: ProjectState
  ): Blob {
    const content = this.serialize(project);

    return new Blob([content], {
      type: "application/json",
    });
  }

  /**
   * Generates a safe WYPROJ filename.
   */
  public static createFileName(
    project: ProjectState
  ): string {
    const projectName =
      project.metadata.application ?? "project";

    const safeName = projectName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    return `${safeName || "project"}.wyproj`;
  }

  /**
   * Exports file name and content.
   */
  public static export(
    project: ProjectState
  ): {
    fileName: string;
    content: string;
  } {
    return {
      fileName: this.createFileName(project),
      content: this.serialize(project),
    };
  }
}

export default WYPROJExporter;
