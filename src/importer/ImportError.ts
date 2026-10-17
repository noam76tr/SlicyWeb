/**
 * SlicyWeb
 * Import Error
 *
 * Error raised by the import, with its code of ERROR_CODES_SPEC.md:
 * - IMP_001 Unsupported File Format, IMP_002 File Too Large (Import Errors);
 * - STL_001 to STL_003 (STL_004 is reserved, not used);
 * - MF_001 to MF_004 (MF_004: 3MF content over the archive extraction
 *   limits, SECURITY_SPEC.md).
 *
 * The message is technical (logs); the GUI shows a translated text
 * chosen from the code (key import.error.<code>).
 *
 * Based on:
 * - ERROR_CODES_SPEC.md (Import Errors, STL Errors, 3MF Errors)
 * - IMPORT_EXPORT_SPEC.md (Import Errors)
 */

export type ImportErrorCode =
  | "IMP_001"
  | "IMP_002"
  | "STL_001"
  | "STL_002"
  | "STL_003"
  | "STL_004"
  | "MF_001"
  | "MF_002"
  | "MF_003"
  | "MF_004";

export class ImportError extends Error {
  public readonly code: ImportErrorCode;

  constructor(code: ImportErrorCode, message: string) {
    super(message);
    this.name = "ImportError";
    this.code = code;
  }
}

export function isImportErrorCode(value: unknown): value is ImportErrorCode {
  return (
    typeof value === "string" &&
    [
      "IMP_001",
      "IMP_002",
      "STL_001",
      "STL_002",
      "STL_003",
      "STL_004",
      "MF_001",
      "MF_002",
      "MF_003",
      "MF_004",
    ].includes(value)
  );
}
