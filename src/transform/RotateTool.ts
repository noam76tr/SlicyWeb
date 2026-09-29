/**
 * Wichy
 * Rotate Tool
 *
 * Responsible for:
 * - Object rotation
 * - Rotation updates
 * - Orientation changes
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import type { Object3D } from "../types/Object3D";

export class RotateTool {
  /**
   * Rotates an object.
   */
  public static apply(
    object: Object3D,
    x: number,
    y: number,
    z: number,
  ): Object3D {
    return {
      ...object,

      transform: {
        ...object.transform,

        rotation: {
          x,
          y,
          z,
        },
      },
    };
  }

  /**
   * Resets object rotation.
   */
  public static reset(
    object: Object3D,
  ): Object3D {
    return this.apply(
      object,
      0,
      0,
      0,
    );
  }
}
