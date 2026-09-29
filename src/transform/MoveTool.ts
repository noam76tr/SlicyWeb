/**
 * Wichy
 * Move Tool
 *
 * Responsible for:
 * - Object movement
 * - Position updates
 * - Translation operations
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

export class MoveTool {
  /**
   * Moves an object to a new position.
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

        position: {
          x,
          y,
          z,
        },
      },
    };
  }

  /**
   * Resets object position.
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
