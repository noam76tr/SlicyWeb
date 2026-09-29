/**
 * Wichy
 * Object Factory
 *
 * Responsible for:
 * - Object creation
 * - Default object initialization
 * - Object data preparation
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import type {
  Object3D,
  Transform,
  Geometry,
  Mesh,
} from "../types/Object3D";

export class ObjectFactory {
  /**
   * Creates a new object.
   */
  public static create(
    objectId: string,
    fileName: string,
    fileType: string,
  ): Object3D {
    const transform: Transform = {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },

      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },

      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
    };

    const geometry: Geometry = {
      width: 0,
      depth: 0,
      height: 0,
      volume: 0,
      surfaceArea: 0,
    };

    const mesh: Mesh = {
      vertices: 0,
      triangles: 0,
    };

    return {
      objectId,

      fileName,

      fileType,

      visible: true,

      locked: false,

      transform,

      geometry,

      mesh,
    };
  }
}
