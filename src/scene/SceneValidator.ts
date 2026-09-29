/**
 * Wichy
 * Scene Validator
 *
 * Responsible for:
 * - Scene validation
 * - Structure validation
 * - Required field validation
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 */

import type { Scene } from "../types/Scene";

export class SceneValidator {
  /**
   * Validates a scene object.
   */
  public static validate(
    scene: Scene | null | undefined,
  ): boolean {
    if (!scene) {
      return false;
    }

    if (!Array.isArray(scene.objects)) {
      return false;
    }

    return true;
  }

  /**
   * Validates whether a scene can be saved.
   */
  public static canSave(
    scene: Scene | null | undefined,
  ): boolean {
    return this.validate(scene);
  }

  /**
   * Validates whether a scene can be loaded.
   */
  public static canLoad(
    scene: Scene | null | undefined,
  ): boolean {
    return this.validate(scene);
  }
}
