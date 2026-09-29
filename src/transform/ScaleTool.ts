/**
 * Wichy
 * Scale Tool
 *
 * Responsible for:
 * - Object scaling
 * - Uniform scaling
 * - Non-uniform scaling
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

export class ScaleTool {
  /**
   * Applies non-uniform scaling.
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

        scale: {
          x,
          y,
          z,
        },
      },
    };
  }

  /**
   * Applies uniform scaling.
   */
  public static applyUniform(
    object: Object3D,
    scale: number,
  ): Object3D {
    return this.apply(
      object,
      scale,
      scale,
      scale,
    );
  }

  /**
   * Resets object scale.
   */
  public static reset(
    object: Object3D,
  ): Object3D {
    return this.apply(
      object,
      1,
      1,
      1,
    );
  }
}
