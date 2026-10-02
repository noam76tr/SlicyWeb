/**
 * SlicyWeb
 * Scene Serializer Definition
 *
 * Responsible for:
 * - Scene serialization to JSON
 * - Scene deserialization from JSON
 * - Data transformation
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 * - ARCHITECTURE.md
 */

import type { Scene } from "../types/Scene";

export class SceneSerializer {
  public static serialize(
    scene: Scene
  ): string {
    return JSON.stringify(
      scene,
      null,
      2
    );
  }

  public static deserialize(
    data: string
  ): Scene {
    return JSON.parse(data) as Scene;
  }
}
