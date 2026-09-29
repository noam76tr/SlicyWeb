/**
 * Wichy
 * Object Validator
 *
 * Responsible for:
 * - Object validation
 * - Required field validation
 * - Object integrity checks
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 */

import type { Object3D } from "../types/Object3D";

export class ObjectValidator {
  /**
   * Validates an object.
   */
  public static validate(
    object: Object3D | null | undefined,
  ): boolean {
    if (!object) {
      return false;
    }

    if (!object.objectId) {
      return false;
    }

    if (!object.fileName) {
      return false;
    }

    if (!object.fileType) {
      return false;
    }

    return true;
  }

  /**
   * Validates whether an object can be added to the scene.
   */
  public static canAdd(
    object: Object3D | null | undefined,
  ): boolean {
    return this.validate(object);
  }

  /**
   * Validates whether an object can be duplicated.
   */
  public static canDuplicate(
    object: Object3D | null | undefined,
  ): boolean {
    return this.validate(object);
  }

  /**
   * Validates whether an object can be deleted.
   */
  public static canDelete(
    object: Object3D | null | undefined,
  ): boolean {
    return this.validate(object);
  }
}
