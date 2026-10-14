/**
 * SlicyWeb
 * Project Deserializer
 *
 * Responsible for:
 * - Project deserialization
 * - JSON parsing
 *
 * Structure validation is performed by ProjectValidator.
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

export class ProjectDeserializer {
  public deserialize(content: string): Project {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to deserialize project: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { cause: error }
      );
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid project structure.");
    }

    return parsed as Project;
  }
}
