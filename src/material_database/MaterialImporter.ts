/**
 * SlicyWeb
 * Material Importer
 *
 * Responsible for:
 * - Material profile import
 * - JSON profile loading
 * - External profile parsing
 * - Profile validation before import
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 *
 * Validation uses MaterialSchema (Zod): MaterialValidator was replaced by
 * the schema (Phase 8 lot 68, ADR-033 D11). Import Material: Phase 15.
 */

import { MaterialSchema } from "../schemas/MaterialSchema";
import type { Material } from "../types/Material";

/** The material, or null when it fails MaterialSchema */
function validMaterial(content: unknown): Material | null {
  const result = MaterialSchema.safeParse(content);

  return result.success ? result.data : null;
}

export class MaterialImporter {
  /**
   * Imports a material profile from JSON text.
   */
  public importFromJson(
    json: string,
  ): Material | null {
    try {
      return validMaterial(
        JSON.parse(json) as unknown,
      );
    } catch {
      return null;
    }
  }

  /**
   * Imports multiple material profiles.
   */
  public importMany(
    json: string,
  ): Material[] {
    try {
      const materials = JSON.parse(
        json,
      ) as unknown;

      if (!Array.isArray(materials)) {
        return [];
      }

      return materials
        .map(validMaterial)
        .filter(
          (material): material is Material =>
            material !== null,
        );
    } catch {
      return [];
    }
  }

  /**
   * Imports a material profile from a file.
   */
  public async importFile(
    file: File,
  ): Promise<Material | null> {
    try {
      const content =
        await file.text();

      return this.importFromJson(
        content,
      );
    } catch {
      return null;
    }
  }

  /**
   * Returns whether a file can be imported.
   */
  public isSupportedFile(
    fileName: string,
  ): boolean {
    return fileName
      .toLowerCase()
      .endsWith(".json");
  }
}
