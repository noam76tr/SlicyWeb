import { ProjectState } from "./ProjectManager";

export class ProjectValidator {
  public validate(project: ProjectState): boolean {
    this.validateProject(project);
    this.validateMetadata(project);
    this.validateCollections(project);

    return true;
  }

  private validateProject(project: ProjectState): void {
    if (!project) {
      throw new Error("Project is required.");
    }
  }

  private validateMetadata(project: ProjectState): void {
    const { metadata } = project;

    if (!metadata) {
      throw new Error("Project metadata is missing.");
    }

    if (!metadata.version) {
      throw new Error("Project version is required.");
    }

    if (!metadata.createdAt) {
      throw new Error("Project creation date is required.");
    }

    if (!metadata.updatedAt) {
      throw new Error("Project update date is required.");
    }

    if (!metadata.application) {
      throw new Error("Application name is required.");
    }

    this.validateDate(metadata.createdAt, "createdAt");
    this.validateDate(metadata.updatedAt, "updatedAt");
  }

  private validateCollections(project: ProjectState): void {
    this.validateArray(project.printers, "printers");
    this.validateArray(project.materials, "materials");
    this.validateArray(project.filaments, "filaments");
    this.validateArray(project.presets, "presets");
    this.validateArray(project.analysis, "analysis");
    this.validateArray(project.recommendations, "recommendations");
  }

  private validateArray(
    value: unknown,
    fieldName: string
  ): void {
    if (value === undefined || value === null) {
      return;
    }

    if (!Array.isArray(value)) {
      throw new Error(
        `Project field '${fieldName}' must be an array.`
      );
    }
  }

  private validateDate(
    value: string,
    fieldName: string
  ): void {
    const timestamp = Date.parse(value);

    if (Number.isNaN(timestamp)) {
      throw new Error(
        `Project metadata field '${fieldName}' contains an invalid date.`
      );
    }
  }
}
