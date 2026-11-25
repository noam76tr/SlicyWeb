/**
 * SlicyWeb
 * WYPROJ Importer
 *
 * Responsible for:
 * - WYPROJ file validation (extension, existence, size)
 * - WYPROJ file parsing
 * - Project data extraction, with the triangles of each object
 * - Project format verification
 *
 * Errors (ERROR_CODES_SPEC.md 2.7.0; lot 111, decision 119 of Noam, Q16 A):
 * PROJ_001 file not found, PROJ_002 file not readable or not valid,
 * PROJ_003 other format version, PROJ_005 file larger than 500 MB (checked
 * before reading: a JavaScript string cannot hold much more).
 * The whole file is validated before anything is returned (SECURITY_
 * SPEC.md, Project Validation).
 *
 * Main process only (Node.js file system).
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - IMPORT_EXPORT_SPEC.md
 * - DATA_SCHEMA.md 3.16.0
 * - SECURITY_SPEC.md
 */

import { promises as fs } from "fs";
import path from "path";

import { MAX_PROJECT_FILE_BYTES } from "../constants/ProjectConstants";
import type { Project } from "../types/Project";

import { ProjectDeserializer } from "./ProjectDeserializer";
import { ProjectError } from "./ProjectError";
import { ProjectValidator } from "./ProjectValidator";

/** A project read: the project and the triangles of each object */
export interface ImportedProject {
  project: Project;
  meshes: Record<string, Float32Array>;
}

export class WYPROJImporter {
  constructor(
    private readonly deserializer: ProjectDeserializer,
    private readonly validator: ProjectValidator,
    private readonly maxBytes: number = MAX_PROJECT_FILE_BYTES,
  ) {}

  public async importFromFile(
    filePath: string
  ): Promise<ImportedProject> {
    const extension = path.extname(filePath).toLowerCase();

    if (extension !== ".wyproj") {
      throw new ProjectError(
        "PROJ_002",
        `Invalid project file format: '${extension}'. Expected '.wyproj'.`,
      );
    }

    let size: number;

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        throw new Error("Not a file");
      }

      size = stats.size;
    } catch (error) {
      throw new ProjectError(
        "PROJ_001",
        `Project file does not exist: ${filePath}`,
        {},
        { cause: error },
      );
    }

    if (size > this.maxBytes) {
      throw new ProjectError(
        "PROJ_005",
        `Project file larger than ${this.maxBytes} bytes: ${size}.`,
      );
    }

    let rawContent: string;

    try {
      rawContent = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new ProjectError(
        "PROJ_001",
        `Project file could not be read: ${filePath}`,
        {},
        { cause: error },
      );
    }

    return this.importFromString(rawContent);
  }

  public importFromString(
    content: string
  ): ImportedProject {
    let container: unknown;

    try {
      container = JSON.parse(content);
    } catch (error) {
      throw new ProjectError(
        "PROJ_002",
        "The file is not valid JSON.",
        {},
        { cause: error },
      );
    }

    if (
      typeof container !== "object" ||
      container === null ||
      Array.isArray(container) ||
      (container as { format?: unknown }).format !== "WYPROJ"
    ) {
      throw new ProjectError(
        "PROJ_002",
        "Invalid WYPROJ format."
      );
    }

    const file = container as Record<string, unknown>;

    this.validator.validateFormatVersion(file.version);

    if (!file.project) {
      throw new ProjectError(
        "PROJ_002",
        "Project data is missing."
      );
    }

    const metadata = file.metadata as Record<string, unknown> | undefined;
    const extraKeys = Object.keys(file).filter(
      (key) => !["format", "version", "project", "metadata"].includes(key),
    );

    if (
      extraKeys.length > 0 ||
      typeof metadata !== "object" ||
      metadata === null ||
      typeof metadata.application !== "string" ||
      ("author" in metadata && typeof metadata.author !== "string") ||
      Object.keys(metadata).some(
        (key) => key !== "application" && key !== "author",
      )
    ) {
      throw new ProjectError(
        "PROJ_002",
        "Invalid WYPROJ container (format, version, project, metadata).",
      );
    }

    const project = this.deserializer.fromObject(file.project);

    this.validator.validate(project);

    // The version of the project is the one of the file
    if (project.version !== file.version) {
      throw new ProjectError(
        "PROJ_002",
        "The version of the project is not the version of the file.",
      );
    }

    return { project, meshes: this.validator.readMeshes(project) };
  }
}
