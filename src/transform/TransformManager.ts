/**
 * Wichy
 * Transform Manager
 *
 * Responsible for:
 * - Move operations
 * - Rotate operations
 * - Scale operations
 * - Transform coordination
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

import { MoveTool } from "./MoveTool";
import { RotateTool } from "./RotateTool";
import { ScaleTool } from "./ScaleTool";

export class TransformManager {
  /**
   * Moves an object.
   */
  public static move(
    object: Object3D,
    x: number,
    y: number,
    z: number,
  ): Object3D {
    return MoveTool.apply(
      object,
      x,
      y,
      z,
    );
  }

  /**
   * Rotates an object.
   */
  public static rotate(
    object: Object3D,
    x: number,
    y: number,
    z: number,
  ): Object3D {
    return RotateTool.apply(
      object,
      x,
      y,
      z,
    );
  }

  /**
   * Scales an object.
   */
  public static scale(
    object: Object3D,
    x: number,
    y: number,
    z: number,
  ): Object3D {
    return ScaleTool.apply(
      object,
      x,
      y,
      z,
    );
  }

  /**
   * Applies uniform scaling.
   */
  public static uniformScale(
    object: Object3D,
    scale: number,
  ): Object3D {
    return ScaleTool.applyUniform(
      object,
      scale,
    );
  }

  /**
   * Resets object position.
   */
  public static resetPosition(
    object: Object3D,
  ): Object3D {
    return MoveTool.reset(object);
  }

  /**
   * Resets object rotation.
   */
  public static resetRotation(
    object: Object3D,
  ): Object3D {
    return RotateTool.reset(object);
  }

  /**
   * Resets object scale.
   */
  public static resetScale(
    object: Object3D,
  ): Object3D {
    return ScaleTool.reset(object);
  }
}
