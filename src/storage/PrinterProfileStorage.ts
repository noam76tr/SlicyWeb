/**
 * SlicyWeb
 * Printer Profile Storage
 *
 * Reads the printer profile files of a folder: each *.json file directly
 * in the folder (one printer per file). Other files (README, SOURCES.md)
 * and subfolders are ignored.
 *
 * Rules:
 * - Missing folder: no file, no error (the user has no printer yet).
 * - Unreadable file, file over MAX_PROFILE_FILE_SIZE or invalid JSON:
 *   the file is refused, the other files are read.
 * - Only the parsed JSON is returned: the content is validated by the
 *   Printer Database (PrinterSchema) before use.
 * - Results name a file by its name only, never by its full path
 *   (DATA_SCHEMA.md, Error Schema: no internal file path).
 *
 * Main process only (Node.js file system).
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D4)
 * - DOMAINS_DEPENDENCY_MATRIX.md (Storage Domain)
 * - SECURITY_SPEC.md (Zero Trust Rule)
 */

import fs from "node:fs";
import path from "node:path";

/** A printer profile is a few kilobytes; larger files are refused */
export const MAX_PROFILE_FILE_SIZE = 1024 * 1024;

export interface ProfileFileContent {
  fileName: string;
  content: unknown;
}

export interface ProfileFileError {
  fileName: string;
  reason: string;
}

export interface ProfileFolderContent {
  files: ProfileFileContent[];
  errors: ProfileFileError[];
}

export class PrinterProfileStorage {
  /**
   * Reads the *.json files of a folder, sorted by name
   */
  public readFolder(folder: string): ProfileFolderContent {
    const result: ProfileFolderContent = { files: [], errors: [] };

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(folder, { withFileTypes: true });
    } catch {
      return result;
    }

    const names = entries
      .filter(
        (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"),
      )
      .map((entry) => entry.name)
      .sort();

    for (const fileName of names) {
      const filePath = path.join(folder, fileName);

      try {
        if (fs.statSync(filePath).size > MAX_PROFILE_FILE_SIZE) {
          result.errors.push({ fileName, reason: "File too large" });
          continue;
        }

        const text = fs.readFileSync(filePath, "utf8");
        result.files.push({ fileName, content: JSON.parse(text) as unknown });
      } catch (error) {
        result.errors.push({
          fileName,
          reason:
            error instanceof SyntaxError ? "Invalid JSON" : "File not readable",
        });
      }
    }

    return result;
  }
}
