/**
 * Wichy
 * Mesh Validator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - AI_ENGINE_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

export class MeshValidator {
  public validate(
    object: Object3D
  ): boolean {
    return (
      this.validateVertices(object) &&
      this.validateTriangles(object) &&
      this.validateGeometry(object)
    );
  }

  private validateVertices(
    object: Object3D
  ): boolean {
    return (
      Number.isInteger(
        object.mesh.vertices
      ) &&
      object.mesh.vertices > 0
    );
  }

  private validateTriangles(
    object: Object3D
  ): boolean {
    return (
      Number.isInteger(
        object.mesh.triangles
      ) &&
      object.mesh.triangles > 0
    );
  }

  private validateGeometry(
    object: Object3D
  ): boolean {
    return (
      object.geometry.width >= 0 &&
      object.geometry.depth >= 0 &&
      object.geometry.height >= 0 &&
      object.geometry.volume >= 0 &&
      object.geometry.surfaceArea >= 0
    );
  }
}
