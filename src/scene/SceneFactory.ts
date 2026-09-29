/**
 * Wichy
 * Scene Factory
 *
 * Responsible for:
 * - Creating new scenes
 * - Providing default scene configuration
 * - Initializing scene data
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 */

import type { Scene } from "../types/Scene";

export class SceneFactory {
  /**
   * Creates an empty scene.
   */
  public static createEmptyScene(): Scene {
    return {
      objects: [],

      printer: null,

      material: null,

      filament: null,

      preset: null,
    };
  }
}
