/**
 * SlicyWeb
 * Transform Validator
 *
 * Responsible for:
 * - Transform validation
 * - Position validation
 * - Rotation validation
 * - Scale validation
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
} from "../types/Object3D";

export class TransformValidator {
  /**
   * Returns whether a transform change modifies the rotation
   * or the scale of an object (DATA_SCHEMA.md, Object Reference
   * Rule 8). A change of position alone returns false.
   */
  public static changesOrientation(
    before: Transform,
    after: Transform,
  ): boolean {
    return (
      before.rotation.x !== after.rotation.x ||
      before.rotation.y !== after.rotation.y ||
      before.rotation.z !== after.rotation.z ||
      before.scale.x !== after.scale.x ||
      before.scale.y !== after.scale.y ||
      before.scale.z !== after.scale.z
    );
  }

  /**
   * Validates object transform.
   */
  public static validate(
    object: Object3D | null | undefined,
  ): boolean {
    if (!object) {
      return false;
    }

    const { position, rotation, scale } =
      object.transform;

    if (
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z)
    ) {
      return false;
    }

    if (
      !Number.isFinite(rotation.x) ||
      !Number.isFinite(rotation.y) ||
      !Number.isFinite(rotation.z)
    ) {
      return false;
    }

    if (
      !Number.isFinite(scale.x) ||
      !Number.isFinite(scale.y) ||
      !Number.isFinite(scale.z)
    ) {
      return false;
    }

    if (
      scale.x <= 0 ||
      scale.y <= 0 ||
      scale.z <= 0
    ) {
      return false;
    }

    return true;
  }

  /**
   * Validates position values.
   */
  public static validatePosition(
    object: Object3D,
  ): boolean {
    const { position } = object.transform;

    return (
      Number.isFinite(position.x) &&
      Number.isFinite(position.y) &&
      Number.isFinite(position.z)
    );
  }

  /**
   * Validates rotation values.
   */
  public static validateRotation(
    object: Object3D,
  ): boolean {
    const { rotation } = object.transform;

    return (
      Number.isFinite(rotation.x) &&
      Number.isFinite(rotation.y) &&
      Number.isFinite(rotation.z)
    );
  }

  /**
   * Validates scale values.
   */
  public static validateScale(
    object: Object3D,
  ): boolean {
    const { scale } = object.transform;

    return (
      Number.isFinite(scale.x) &&
      Number.isFinite(scale.y) &&
      Number.isFinite(scale.z) &&
      scale.x > 0 &&
      scale.y > 0 &&
      scale.z > 0
    );
  }
}
