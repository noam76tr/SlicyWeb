/**
 * Wichy
 * Material Repository
 *
 * Responsible for:
 * - Material storage
 * - Material retrieval
 * - Material lookup
 * - Repository management
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

export class MaterialRepository {
  private readonly materials =
    new Map<string, Material>();

  /**
   * Adds a material profile.
   */
  public add(
    material: Material,
  ): void {
    this.materials.set(
      material.id,
      material,
    );
  }

  /**
   * Returns a material by id.
   */
  public get(
    materialId: string,
  ): Material | undefined {
    return this.materials.get(
      materialId,
    );
  }

  /**
   * Returns all materials.
   */
  public getAll(): Material[] {
    return Array.from(
      this.materials.values(),
    );
  }

  /**
   * Returns materials by category.
   */
  public getByCategory(
    category: string,
  ): Material[] {
    return this.getAll().filter(
      (material) =>
        material.category.toLowerCase() ===
        category.toLowerCase(),
    );
  }

  /**
   * Checks whether a material exists.
   */
  public exists(
    materialId: string,
  ): boolean {
    return this.materials.has(
      materialId,
    );
  }

  /**
   * Removes a material profile.
   */
  public remove(
    materialId: string,
  ): boolean {
    return this.materials.delete(
      materialId,
    );
  }

  /**
   * Clears repository.
   */
  public clear(): void {
    this.materials.clear();
  }

  /**
   * Returns repository size.
   */
  public getCount(): number {
    return this.materials.size;
  }
}
