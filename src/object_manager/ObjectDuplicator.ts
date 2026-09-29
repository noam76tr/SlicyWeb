/**
 * Wichy
 * Object Duplicator Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - OBJECT_MANAGEMENT_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

export class ObjectDuplicator {
  public duplicate(
    object: Object3D
  ): Object3D {
    return {
      ...object,

      objectId: crypto.randomUUID(),

      fileName: `${object.fileName}_copy`,

      transform: {
        position: {
          ...object.transform.position
        },

        rotation: {
          ...object.transform.rotation
        },

        scale: {
          ...object.transform.scale
        }
      }
    };
  }
}
