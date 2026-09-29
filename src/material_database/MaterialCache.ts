/**
 * Wichy
 * Material Cache
 *
 * Responsible for:
 * - Cached material storage
 * - Cached material retrieval
 * - Cache management
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

export class MaterialCache {
  private readonly cache =
    new Map<string, Material>();

  /**
   * Stores a material in cache.
   */
  public set(
    material: Material,
  ): void {
    this.cache.set(
      material.id,
      material,
    );
  }

  /**
   * Returns a cached material.
   */
  public get(
    materialId: string,
  ): Material | undefined {
    return this.cache.get(
      materialId,
    );
  }

  /**
   * Checks whether a material is cached.
   */
  public has(
    materialId: string,
  ): boolean {
    return this.cache.has(
      materialId,
    );
  }

  /**
   * Removes a cached material.
   */
  public remove(
    materialId: string,
  ): boolean {
    return this.cache.delete(
      materialId,
    );
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns all cached materials.
   */
  public getAll(): Material[] {
    return Array.from(
      this.cache.values(),
    );
  }

  /**
   * Returns cache size.
   */
  public getCount(): number {
    return this.cache.size;
  }
}
