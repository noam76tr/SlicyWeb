/**
 * Wichy
 * STL Importer
 *
 * Responsible for:
 * - STL file loading
 * - STL file parsing
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

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

export class STLImporter {
  private readonly loader: STLLoader;

  constructor() {
    this.loader = new STLLoader();
  }

  /**
   * Loads an STL file from a File object.
   */
  public async import(
    file: File,
  ): Promise<THREE.BufferGeometry> {
    const arrayBuffer =
      await file.arrayBuffer();

    return this.loader.parse(arrayBuffer);
  }

  /**
   * Returns vertex count from geometry.
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
   * Returns triangle count from geometry.
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
