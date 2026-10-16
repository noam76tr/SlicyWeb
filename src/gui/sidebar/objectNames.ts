/**
 * SlicyWeb
 * Object Names
 *
 * Display name of each object (IMPORT_EXPORT_SPEC.md, Object Naming,
 * Duplicate Names): the source file name; when several objects come
 * from files with the same name, they are shown as "cube (1)",
 * "cube (2)"... in their order in the scene.
 *
 * The names are computed for display only: the project keeps the file
 * name of each object (DATA_SCHEMA.md, Object Schema: fileName).
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md (Object Naming, Duplicate Names)
 * - DATA_SCHEMA.md (Object Schema)
 */

import type { Object3D } from "../../types/Object3D";

function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/**
 * Returns the display name of each object, indexed by objectId.
 */
export function getDisplayNames(objects: Object3D[]): Map<string, string> {
  const counts = new Map<string, number>();

  for (const object of objects) {
    counts.set(object.fileName, (counts.get(object.fileName) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  const names = new Map<string, string>();

  for (const object of objects) {
    if ((counts.get(object.fileName) ?? 0) > 1) {
      const index = (seen.get(object.fileName) ?? 0) + 1;
      seen.set(object.fileName, index);
      names.set(object.objectId, `${baseName(object.fileName)} (${index})`);
    } else {
      names.set(object.objectId, object.fileName);
    }
  }

  return names;
}
