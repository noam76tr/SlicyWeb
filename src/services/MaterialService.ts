/**
 * Wichy
 * Material Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - MATERIAL_PROFILE_SPEC.md
 */

import type { Material } from "../types/Material";

import { MaterialManager } from "../material_database/MaterialManager";

export class MaterialService {
  private readonly materialManager =
    new MaterialManager();

  public addMaterial(
    material: Material
  ): void {
    this.materialManager.addMaterial(
      material
    );
  }

  public removeMaterial(
    materialId: string
  ): void {
    this.materialManager.removeMaterial(
      materialId
    );
  }

  public getMaterial(
    materialId: string
  ): Material | undefined {
    return this.materialManager.getMaterial(
      materialId
    );
  }

  public getMaterials(): Material[] {
    return this.materialManager.getMaterials();
  }

  public hasMaterial(
    materialId: string
  ): boolean {
    return this.materialManager.hasMaterial(
      materialId
    );
  }

  public getMaterialCount(): number {
    return this.materialManager.getMaterialCount();
  }

  public clearMaterials(): void {
    this.materialManager.clear();
  }
}
