/**
 * SlicyWeb
 * Project Error
 *
 * Errors of the project files (ERROR_CODES_SPEC.md 2.7.0, Project Errors;
 * lot 111, decision 119 of Noam, Q16 A):
 * - PROJ_001 Project Not Found: the file does not exist (a recent project
 *   moved or deleted);
 * - PROJ_002 Project Corrupted: unreadable JSON, missing or invalid field,
 *   reference to a missing object, unreadable triangles;
 * - PROJ_003 Project Version Mismatch: format of another version (params:
 *   fileVersion, supportedVersion; newer when the file is newer);
 * - PROJ_004 Project Save Failed: the file could not be written (full
 *   disk, protected folder, file open elsewhere); the existing file is not
 *   changed;
 * - PROJ_005 Project Too Large: the file is larger than 500 MB.
 *
 * The message is for the log; the window shows the translated message of
 * the code, with its params.
 *
 * Based on:
 * - ERROR_CODES_SPEC.md (Project Errors)
 */

export type ProjectErrorCode =
  | "PROJ_001"
  | "PROJ_002"
  | "PROJ_003"
  | "PROJ_004"
  | "PROJ_005";

export const PROJECT_ERROR_CODES: readonly ProjectErrorCode[] = [
  "PROJ_001",
  "PROJ_002",
  "PROJ_003",
  "PROJ_004",
  "PROJ_005",
];

export type ProjectErrorParams = Record<string, string | boolean>;

export class ProjectError extends Error {
  public constructor(
    public readonly code: ProjectErrorCode,
    message: string,
    public readonly params: ProjectErrorParams = {},
    options?: { cause?: unknown },
  ) {
    super(`${code} ${message}`, options);
    this.name = "ProjectError";
  }
}

/** The error as a ProjectError; any other error is PROJ_002 */
export function asProjectError(error: unknown): ProjectError {
  if (error instanceof ProjectError) {
    return error;
  }

  return new ProjectError(
    "PROJ_002",
    error instanceof Error ? error.message : "Unknown error",
    {},
    { cause: error },
  );
}

export default ProjectError;
