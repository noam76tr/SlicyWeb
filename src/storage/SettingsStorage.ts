/**
 * SlicyWeb
 * Settings Storage
 *
 * Reads and writes the user preferences in settings.json,
 * stored separately from WYPROJ project files
 * (USER_SETTINGS_SPEC.md, Storage Location).
 *
 * File content (DATA_SCHEMA.md, User Preferences Schema):
 *
 *   { "preferences": { "theme": "dark", "language": "en", "units": "metric",
 *     "printer": { "defaultPrinter": null, "autoloadLastPrinter": true,
 *       "autoCheckProfiles": true } } }
 *
 * Rules:
 * - Missing or unreadable file: default preferences.
 * - Invalid or missing field: that field takes its default value, the
 *   valid fields are kept (USER_SETTINGS_SPEC.md, Backward
 *   Compatibility). A settings.json written before 3.5.0 (no printer)
 *   keeps its theme, language and units, with the default printer.
 *   The fields of printer are read one by one, in the same way.
 * - Other top-level entries of the file are kept when writing.
 * - Writing goes through a temporary file, then a rename, so that
 *   an interrupted write never leaves a truncated settings.json.
 *
 * Main process only (Node.js file system).
 *
 * Based on:
 * - USER_SETTINGS_SPEC.md
 * - DATA_SCHEMA.md
 * - DOMAINS_DEPENDENCY_MATRIX.md (Storage Domain)
 */

import fs from "node:fs";
import path from "node:path";

import type { ZodType } from "zod";

import {
  DEFAULT_USER_PREFERENCES,
  PrinterPreferencesSchema,
  UserPreferencesSchema,
} from "../schemas/UserPreferencesSchema";

import type { UserPreferences } from "../types/UserPreferences";

type SettingsFile = Record<string, unknown>;

export class SettingsStorage {
  public constructor(private readonly filePath: string) {}

  public getFilePath(): string {
    return this.filePath;
  }

  /**
   * Returns the stored preferences, completed with default values
   */
  public load(): UserPreferences {
    const stored = this.readFile().preferences;

    if (typeof stored !== "object" || stored === null) {
      return { ...DEFAULT_USER_PREFERENCES, printer: readPrinter(undefined) };
    }

    const entries = stored as Record<string, unknown>;
    const shape = UserPreferencesSchema.shape;

    return {
      theme: readField(shape.theme, entries.theme, DEFAULT_USER_PREFERENCES.theme),
      language: readField(
        shape.language,
        entries.language,
        DEFAULT_USER_PREFERENCES.language,
      ),
      units: readField(shape.units, entries.units, DEFAULT_USER_PREFERENCES.units),
      printer: readPrinter(entries.printer),
    };
  }

  /**
   * Validates and writes the preferences
   */
  public save(preferences: UserPreferences): UserPreferences {
    const valid = UserPreferencesSchema.parse(preferences);

    const content: SettingsFile = {
      ...this.readFile(),
      preferences: valid,
    };

    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    const temporaryPath = `${this.filePath}.tmp`;

    fs.writeFileSync(
      temporaryPath,
      `${JSON.stringify(content, null, 2)}\n`,
      "utf8",
    );
    fs.renameSync(temporaryPath, this.filePath);

    return valid;
  }

  /**
   * Writes the default preferences
   */
  public reset(): UserPreferences {
    return this.save({
      ...DEFAULT_USER_PREFERENCES,
      printer: { ...DEFAULT_USER_PREFERENCES.printer },
    });
  }

  private readFile(): SettingsFile {
    let text: string;

    try {
      text = fs.readFileSync(this.filePath, "utf8");
    } catch {
      // No settings file yet
      return {};
    }

    try {
      const content: unknown = JSON.parse(text);

      if (
        typeof content === "object" &&
        content !== null &&
        !Array.isArray(content)
      ) {
        return content as SettingsFile;
      }
    } catch {
      // Invalid JSON: default preferences
    }

    return {};
  }
}

function readPrinter(value: unknown): UserPreferences["printer"] {
  const fallback = DEFAULT_USER_PREFERENCES.printer;

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...fallback };
  }

  const entries = value as Record<string, unknown>;
  const shape = PrinterPreferencesSchema.shape;

  return {
    defaultPrinter: readField(
      shape.defaultPrinter,
      entries.defaultPrinter,
      fallback.defaultPrinter,
    ),
    autoloadLastPrinter: readField(
      shape.autoloadLastPrinter,
      entries.autoloadLastPrinter,
      fallback.autoloadLastPrinter,
    ),
    autoCheckProfiles: readField(
      shape.autoCheckProfiles,
      entries.autoCheckProfiles,
      fallback.autoCheckProfiles,
    ),
  };
}

function readField<T>(
  schema: ZodType<T>,
  value: unknown,
  fallback: T,
): T {
  const result = schema.safeParse(value);

  return result.success ? result.data : fallback;
}

export default SettingsStorage;
