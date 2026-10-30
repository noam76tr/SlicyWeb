/**
 * SlicyWeb
 * Material Manager
 *
 * Responsible for:
 * - Material management
 * - Active material access
 * - Repository coordination
 * - Loading of the material profile files (main process, Phase 8 lot
 *   68): the folders are read in order, each file is validated
 *   (MaterialProfileFileSchema, source of its folder), and a refused file
 *   is reported with MAT_002 without stopping the others. A material
 *   whose id is already loaded is refused.
 *
 * No business logic.
 * No AI logic.
 * No cache logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md (Complete Material Schema 3.7.0, Repository Data
 *   Schema)
 * - MATERIAL_PROFILE_SPEC.md
 * - DECISIONS.md (ADR-033, D3, D6)
 * - ERROR_CODES_SPEC.md (MAT_002 Invalid Material Profile)
 */

import {
  MaterialProfileFileSchema,
  type ProfileSource,
} from "../schemas/MaterialSchema";
import { PrinterProfileStorage } from "../storage/PrinterProfileStorage";
import type { Material } from "../types/Material";

import { MaterialRepository } from "./MaterialRepository";

/** A folder of material profile files and the source of its profiles */
export interface MaterialProfileFolder {
  folder: string;
  source: ProfileSource;
}

/** A refused profile file, named by its file name only */
export interface RejectedMaterialProfile {
  fileName: string;
  source: ProfileSource;
  code: "MAT_002";
  reason: string;
}

export interface MaterialLoadResult {
  loaded: number;
  rejected: RejectedMaterialProfile[];
}

/**
 * The material of a profile file of the expected source, or the reason
 * of the refusal ("path: message").
 */
function readProfile(
  content: unknown,
  expectedSource: ProfileSource,
): { material: Material } | { reason: string } {
  const result = MaterialProfileFileSchema.safeParse(content);

  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.join(".") || "profile";

    return { reason: `${where}: ${issue?.message ?? "invalid"}` };
  }

  if (result.data.source !== expectedSource) {
    return { reason: `source: ${result.data.source} is not ${expectedSource}` };
  }

  return { material: result.data.data };
}

export class MaterialManager {
  private readonly repository =
    new MaterialRepository();

  public constructor(
    private readonly storage = new PrinterProfileStorage(),
  ) {}

  /**
   * Replaces the materials with the valid profiles of the folders.
   */
  public loadProfiles(
    folders: MaterialProfileFolder[],
  ): MaterialLoadResult {
    this.repository.clear();

    const rejected: RejectedMaterialProfile[] = [];

    for (const { folder, source } of folders) {
      const content = this.storage.readFolder(folder);

      for (const { fileName, reason } of content.errors) {
        rejected.push({ fileName, source, code: "MAT_002", reason });
      }

      for (const file of content.files) {
        const result = readProfile(file.content, source);

        if ("reason" in result) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "MAT_002",
            reason: result.reason,
          });
          continue;
        }

        if (this.repository.exists(result.material.id)) {
          rejected.push({
            fileName: file.fileName,
            source,
            code: "MAT_002",
            reason: `id: ${result.material.id} is already loaded`,
          });
          continue;
        }

        this.repository.add(result.material);
      }
    }

    return { loaded: this.repository.getCount(), rejected };
  }

  /**
   * Adds a material profile.
   */
  public addMaterial(
    material: Material,
  ): void {
    this.repository.add(
      material,
    );
  }

  /**
   * Removes a material profile.
   */
  public removeMaterial(
    materialId: string,
  ): boolean {
    return this.repository.remove(
      materialId,
    );
  }

  /**
   * Returns a material by id.
   */
  public getMaterial(
    materialId: string,
  ): Material | undefined {
    return this.repository.get(
      materialId,
    );
  }

  /**
   * Returns all materials.
   */
  public getMaterials(): Material[] {
    return this.repository.getAll();
  }

  /**
   * Checks whether a material exists.
   */
  public hasMaterial(
    materialId: string,
  ): boolean {
    return this.repository.exists(
      materialId,
    );
  }

  /**
   * Returns material count.
   */
  public getMaterialCount(): number {
    return this.repository.getCount();
  }

  /**
   * Clears all materials.
   */
  public clear(): void {
    this.repository.clear();
  }
}
