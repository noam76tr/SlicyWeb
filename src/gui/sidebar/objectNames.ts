/**
 * SlicyWeb
 * Object Names
 *
 * Display name of each object (IMPORT_EXPORT_SPEC.md, Object Naming,
 * Duplicate Names): the name given by the user (lot 106, Q1 A), otherwise
 * the source file name; when several objects have the same name, they are
 * shown as "cube (1)", "cube (2)"... in their order in the scene, also
 * for names given by the user ("Support (1)", "Support (2)"; lot 106,
 * Q4 A). The extension is taken off a file name only.
 *
 * The numbers are computed for display only: the project keeps the file
 * name and the name given of each object (DATA_SCHEMA.md, Object Schema:
 * fileName, name).
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
  const label = (object: Object3D): string => object.name ?? object.fileName;
  const counts = new Map<string, number>();

  for (const object of objects) {
    counts.set(label(object), (counts.get(label(object)) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  const names = new Map<string, string>();

  for (const object of objects) {
    const text = label(object);

    if ((counts.get(text) ?? 0) > 1) {
      const index = (seen.get(text) ?? 0) + 1;
      seen.set(text, index);
      names.set(
        object.objectId,
        `${object.name ?? baseName(object.fileName)} (${index})`,
      );
    } else {
      names.set(object.objectId, text);
    }
  }

  return names;
}
