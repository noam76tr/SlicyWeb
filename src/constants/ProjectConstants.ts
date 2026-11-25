/**
 * SlicyWeb
 * Project Constants
 *
 * Phase 13, Project Persistence (lot 111, ADR-038; decision 119 of Noam,
 * Q1 to Q22 A).
 *
 * Based on:
 * - DATA_SCHEMA.md 3.16.0 (Project File Schema, User Preferences Schema)
 * - USER_SETTINGS_SPEC.md 2.4.0 (Project Settings, File Settings)
 * - ERROR_CODES_SPEC.md 2.7.0 (PROJ_005)
 */

/** Extension of a project file */
export const PROJECT_EXTENSION = ".wyproj";

/** Largest project file opened: 500 MB (Q16 A, PROJ_005) */
export const MAX_PROJECT_FILE_BYTES = 500 * 1024 * 1024;

// Projects of File > Recent Projects (Q17 A): MAX_RECENT_PROJECTS (10)
// and interval of the automatic save (Q18 A): AUTOSAVE_INTERVAL_SECONDS
// (300), in ApplicationConstants.ts

/** Interval of the automatic save that settings.json may give, seconds */
export const AUTOSAVE_INTERVAL_LIMITS = { min: 5, max: 3600 } as const;

/** Folder of the copy of the automatic save, in the user data folder */
export const RECOVERY_FOLDER = "recovery";

/** Folder of the copies set aside (corrupted), in RECOVERY_FOLDER */
export const QUARANTINE_FOLDER = "quarantine";

/** Copy of the project written by the automatic save */
export const RECOVERY_PROJECT_FILE = "autosave.wyproj";

/** Description of the copy: name, file of the project, time */
export const RECOVERY_INFO_FILE = "autosave.json";

/** Format of the description of the copy (versioned, SECURITY_SPEC.md) */
export const RECOVERY_INFO_FORMAT = "SlicyWeb Recovery";
export const RECOVERY_INFO_VERSION = 1;
