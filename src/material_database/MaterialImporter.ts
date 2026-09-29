/**
 * Wichy
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
 */

import type { Material } from "../types/Material";

import { MaterialValidator } from "./MaterialValidator";

export class MaterialImporter {
  /**
   * Imports a material profile from JSON text.
   */
  public importFromJson(
    json: string,
  ): Material | null {
    try {
      const material = JSON.parse(
        json,
      ) as Material;

      if (
        !MaterialValidator.validate(
          material,
        )
      ) {
        return null;
      }

      return material;
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
      ) as Material[];

      return materials.filter(
        (material) =>
          MaterialValidator.validate(
            material,
          ),
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
