/**
 * SlicyWeb
 * Object Constants
 *
 * Name of an object given by the user (DATA_SCHEMA.md 3.14.0, Object
 * Schema: name; lot 106, decision 112 of Noam, Q3 A). Shared by the
 * rename (ObjectStateService), the project file (ProjectSchema, lot 111)
 * and the names read in a 3MF file (lot 111, Q21 A: KI-020).
 *
 * Based on:
 * - DATA_SCHEMA.md (Object Schema)
 * - IMPORT_EXPORT_SPEC.md (Object Naming)
 */

/** Longest name given by the user, in characters (Q3 A) */
export const MAX_NAME_LENGTH = 100;

/**
 * Name kept for a text: trimmed, MAX_NAME_LENGTH characters at most;
 * null (name of the file) when empty or equal to the file name
 */
export function normalizeName(text: string, fileName: string): string | null {
  const name = [...text.trim()].slice(0, MAX_NAME_LENGTH).join("").trim();

  return name === "" || name === fileName ? null : name;
}
