/**
 * SlicyWeb
 * Printer Profile Storage
 *
 * Reads the printer profile files of a folder: each *.json file directly
 * in the folder (one printer per file). Other files (README, SOURCES.md),
 * index.json (index of the profile repository, not a printer) and
 * subfolders are ignored. The material and filament profile files are
 * read the same way (Phase 8 lot 68, ADR-033 D6: one material or one
 * filament per file). Writes and deletes the files of the
 * printers of the user (Local Custom, Phase 7 lot 61).
 *
 * Rules:
 * - Missing folder: no file, no error (the user has no printer yet).
 * - Unreadable file, file over MAX_PROFILE_FILE_SIZE or invalid JSON:
 *   the file is refused, the other files are read.
 * - Only the parsed JSON is returned: the content is validated by the
 *   Printer Database (PrinterSchema) before use.
 * - Results name a file by its name only, never by its full path
 *   (DATA_SCHEMA.md, Error Schema: no internal file path).
 * - Writing and deleting take a file name, never a path: only a name of
 *   letters, digits, "_" and "-" ending with .json is accepted, so no
 *   file outside the folder is touched. A file is written to a temporary
 *   file, then renamed: it is never left half written.
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

/** Name of a profile file written by SlicyWeb: no folder, no ".." */
const PROFILE_FILE_NAME = /^[A-Za-z0-9_-]+\.json$/;

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
        (entry) =>
          entry.isFile() &&
          entry.name.toLowerCase().endsWith(".json") &&
          entry.name.toLowerCase() !== "index.json",
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

  /**
   * Writes a profile file in the folder (created when missing).
   * Throws when the name is not a profile file name, when the content is
   * over MAX_PROFILE_FILE_SIZE or when the file cannot be written.
   */
  public writeFile(folder: string, fileName: string, content: unknown): void {
    if (!PROFILE_FILE_NAME.test(fileName)) {
      throw new Error("Invalid profile file name");
    }

    const text = `${JSON.stringify(content, null, 2)}\n`;

    if (Buffer.byteLength(text, "utf8") > MAX_PROFILE_FILE_SIZE) {
      throw new Error("File too large");
    }

    fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, fileName);
    const temporaryPath = `${filePath}.tmp`;

    try {
      fs.writeFileSync(temporaryPath, text, "utf8");
      fs.renameSync(temporaryPath, filePath);
    } catch (error) {
      fs.rmSync(temporaryPath, { force: true });
      throw error;
    }
  }

  /**
   * Deletes a profile file of the folder. A missing file is not an error.
   */
  public deleteFile(folder: string, fileName: string): void {
    if (!PROFILE_FILE_NAME.test(fileName)) {
      throw new Error("Invalid profile file name");
    }

    fs.rmSync(path.join(folder, fileName), { force: true });
  }
}
