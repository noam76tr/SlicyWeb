/**
 * SlicyWeb
 * Import Error
 *
 * Error raised by the import, with its code of ERROR_CODES_SPEC.md
 * (STL_001 to STL_004, MF_001 to MF_003), or one of these reasons,
 * which have no code in ERROR_CODES_SPEC.md (KI-018):
 * - UNSUPPORTED_FORMAT: neither STL nor 3MF (IMPORT_EXPORT_SPEC.md,
 *   Import Errors: Unsupported Format);
 * - FILE_TOO_LARGE: larger than the size limit of FileValidator;
 * - MF_NOT_AVAILABLE: 3MF import not available yet (until the 3MF
 *   step of Phase 5).
 *
 * The message is technical (logs); the GUI shows a translated text
 * chosen from the code (key import.error.<code>).
 *
 * Based on:
 * - ERROR_CODES_SPEC.md (STL Errors, 3MF Errors)
 * - IMPORT_EXPORT_SPEC.md (Import Errors)
 */

export type ImportErrorCode =
  | "STL_001"
  | "STL_002"
  | "STL_003"
  | "STL_004"
  | "MF_001"
  | "MF_002"
  | "MF_003"
  | "UNSUPPORTED_FORMAT"
  | "FILE_TOO_LARGE"
  | "MF_NOT_AVAILABLE";

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
      "STL_001",
      "STL_002",
      "STL_003",
      "STL_004",
      "MF_001",
      "MF_002",
      "MF_003",
      "UNSUPPORTED_FORMAT",
      "FILE_TOO_LARGE",
      "MF_NOT_AVAILABLE",
    ].includes(value)
  );
}
