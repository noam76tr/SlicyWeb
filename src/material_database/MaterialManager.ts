/**
 * Wichy
 * Material Manager
 *
 * Responsible for:
 * - Material management
 * - Active material access
 * - Repository coordination
 *
 * No business logic.
 * No AI logic.
 * No cache logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 */

import type { Material } from "../types/Material";

import { MaterialRepository } from "./MaterialRepository";

export class MaterialManager {
  private readonly repository =
    new MaterialRepository();

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
