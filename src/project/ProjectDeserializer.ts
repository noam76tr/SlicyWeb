/**
 * SlicyWeb
 * Project Deserializer
 *
 * Responsible for:
 * - Project deserialization
 * - JSON parsing
 *
 * Structure validation is performed by ProjectValidator. Text that is
 * not a JSON object: PROJ_002 (lot 111).
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

import type { Project } from "../types/Project";

import { ProjectError } from "./ProjectError";

export class ProjectDeserializer {
  public deserialize(content: string): Project {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new ProjectError(
        "PROJ_002",
        `Failed to deserialize project: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {},
        { cause: error }
      );
    }

    return this.fromObject(parsed);
  }

  /**
   * The project of a JSON value already parsed (the WYPROJ container,
   * lot 111): PROJ_002 when it is not an object
   */
  public fromObject(parsed: unknown): Project {
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new ProjectError("PROJ_002", "Invalid project structure.");
    }

    return parsed as Project;
  }
}
