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

/**
 * Maximum file name length, in code points, without the extension.
 * 60 code points stay within 255 bytes on every file system,
 * including with 4-byte characters.
 */
const MAX_FILE_NAME_LENGTH = 60;

/**
 * Device names reserved by Windows, with or without an extension.
 */
const WINDOWS_RESERVED_NAMES =
  /^(CON|PRN|AUX|NUL|COM[0-9¹²³]|LPT[0-9¹²³])$/i;

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
   *
   * Keeps letters (with their accents and vowel marks) and digits of
   * every language, "_" and "-". Everything else is removed, including
   * the characters forbidden by Windows, macOS and Linux
   * (/ \ : * ? " < > |), control characters and direction marks.
   */
  public static createFileName(
    project: Project
  ): string {
    const cleanName = project.projectName
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\p{L}\p{M}\p{N}_-]/gu, "");

    const safeName = Array.from(cleanName)
      .slice(0, MAX_FILE_NAME_LENGTH)
      .join("");

    if (!safeName) {
      return "project.wyproj";
    }

    if (WINDOWS_RESERVED_NAMES.test(safeName)) {
      return `_${safeName}.wyproj`;
    }

    return `${safeName}.wyproj`;
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
