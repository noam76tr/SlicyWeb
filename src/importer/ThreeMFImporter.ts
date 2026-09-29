/**
 * Wichy
 * 3MF Importer
 *
 * Responsible for:
 * - 3MF file loading
 * - 3MF file parsing
 * - Geometry extraction
 * - Mesh statistics extraction
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - FILE_STRUCTURE.md
 * - DATA_SCHEMA.md
 */

import * as THREE from "three";

export class ThreeMFImporter {
  /**
   * Imports a 3MF file.
   *
   * Placeholder implementation for Phase 2.
   * Full 3MF parsing will be added later.
   */
  public async import(
    file: File,
  ): Promise<ArrayBuffer> {
    return file.arrayBuffer();
  }

  /**
   * Returns mesh vertex count.
   */
  public getVertexCount(
    geometry: THREE.BufferGeometry,
  ): number {
    const position =
      geometry.getAttribute("position");

    if (!position) {
      return 0;
    }

    return position.count;
  }

  /**
   * Returns mesh triangle count.
   */
  public getTriangleCount(
    geometry: THREE.BufferGeometry,
  ): number {
    const position =
      geometry.getAttribute("position");

    if (!position) {
      return 0;
    }

    return Math.floor(
      position.count / 3,
    );
  }

  /**
   * Computes geometry bounding box.
   */
  public computeBoundingBox(
    geometry: THREE.BufferGeometry,
  ): THREE.Box3 {
    geometry.computeBoundingBox();

    return (
      geometry.boundingBox ??
      new THREE.Box3()
    );
  }
}
