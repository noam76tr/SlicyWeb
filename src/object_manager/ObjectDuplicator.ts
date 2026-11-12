/**
 * SlicyWeb
 * Object Duplicator Definition
 *
 * Copy of an object (Object Reference Rule 7): a new objectId, the same
 * description and transform; no analysis and no recommendation (they are
 * kept outside the object). The copy keeps the file name of the original
 * (lot 100, Q3): the Object Panel shows "cube (1)", "cube (2)"
 * (IMPORT_EXPORT_SPEC.md, Duplicate Names); no text of a language is
 * written in the project.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PROJECT_SPEC.md
 */

import type { Object3D } from "../types/Object3D";

export class ObjectDuplicator {
  public duplicate(
    object: Object3D
  ): Object3D {
    return {
      ...object,

      objectId: crypto.randomUUID(),

      fileName: object.fileName,

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
      },

      geometry: {
        ...object.geometry
      },

      mesh: {
        ...object.mesh
      }
    };
  }
}
