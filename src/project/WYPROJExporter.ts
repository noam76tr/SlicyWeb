/**
 * SlicyWeb
 * WYPROJ Exporter
 *
 * Responsible for:
 * - WYPROJ file creation
 * - Project serialization to WYPROJ format
 * - Blob generation for download
 * - Safe filename generation
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - IMPORT_EXPORT_SPEC.md
 * - DATA_SCHEMA.md
 */

import type { Project } from "../types/Project";

/**
 * WYPROJ file metadata (IMPORT_EXPORT_SPEC.md, Metadata).
 */
export interface WYPROJMetadata {
  application: string;
  author?: string;
}

export interface WYPROJFile {
  format: "WYPROJ";
  version: string;
  project: Project;
  metadata: WYPROJMetadata;
}

export class WYPROJExporter {
  /**
   * Creates a valid WYPROJ container.
   */
  public static create(
    project: Project
  ): WYPROJFile {
    return {
      format: "WYPROJ",
      version: project.version,
      project,
      metadata: {
        application: "SlicyWeb Smart Slicer",
      },
    };
  }

  /**
   * Serializes a project into WYPROJ JSON format.
   */
  public static serialize(
    project: Project
  ): string {
    const wyproj = this.create(project);

    return JSON.stringify(wyproj, null, 2);
  }

  /**
   * Creates a downloadable blob.
   */
  public static createBlob(
    project: Project
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
    project: Project
  ): string {
    const safeName = project.projectName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\p{L}\p{N}_-]/gu, "");

    return `${safeName || "project"}.wyproj`;
  }

  /**
   * Exports file name and content.
   */
  public static export(
    project: Project
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
