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
 *       "autoCheckProfiles": true },
 *     "material": { "defaultMaterial": null, "defaultFilament": null,
 *       "autoloadLastMaterial": true },
 *     "cost": { "currency": "EUR", "electricityPrice": null,
 *       "printerPower": {}, "filamentPrices": {} } } }
 *
 * Rules:
 * - Missing or unreadable file: default preferences.
 * - Invalid or missing field: that field takes its default value, the
 *   valid fields are kept (USER_SETTINGS_SPEC.md, Backward
 *   Compatibility). A settings.json written before 3.5.0 (no printer)
 *   keeps its theme, language and units, with the default printer.
 *   The fields of printer are read one by one, in the same way. A
 *   settings.json written before 3.7.0 (no material) takes the default
 *   material settings; the fields of material are read one by one.
 * - cost (3.15.0, ADR-037): a settings.json written before 3.15.0 (no
 *   cost) takes the currency of its language (EUR in French, ILS in
 *   Hebrew, USD in English, Q7 A), no price and no power; the fields of
 *   cost are read one by one, and each entry of printerPower and
 *   filamentPrices on its own (an invalid entry is left out).
 * - project and files (3.16.0, lot 111): a settings.json written before
 *   3.16.0 takes the automatic save every 300 s and no recent project;
 *   each field is read on its own, and each path of recentProjects on its
 *   own (an invalid one, or a repeat, is left out; 10 at most).
 * - gui (written by lot 93, DATA_SCHEMA.md 3.11.0, gui.propertiesTab) is
 *   no longer part of the preferences (3.12.0, lot 95): it is ignored at
 *   reading, the other fields are kept, and it is no longer in the file
 *   after the next write.
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

import { MAX_RECENT_PROJECTS } from "../constants/ApplicationConstants";
import {
  CostPreferencesSchema,
  CostPriceSchema,
  defaultCostPreferences,
  DEFAULT_USER_PREFERENCES,
  MaterialPreferencesSchema,
  PrinterPowerSchema,
  PrinterPreferencesSchema,
  ProjectPreferencesSchema,
  RecentProjectSchema,
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
      return {
        ...DEFAULT_USER_PREFERENCES,
        printer: readPrinter(undefined),
        material: readMaterial(undefined),
        cost: readCost(undefined, DEFAULT_USER_PREFERENCES.language),
        project: readProject(undefined),
        files: readFiles(undefined),
      };
    }

    const entries = stored as Record<string, unknown>;
    const shape = UserPreferencesSchema.shape;
    const language = readField(
      shape.language,
      entries.language,
      DEFAULT_USER_PREFERENCES.language,
    );

    return {
      theme: readField(
        shape.theme,
        entries.theme,
        DEFAULT_USER_PREFERENCES.theme,
      ),
      language,
      units: readField(
        shape.units,
        entries.units,
        DEFAULT_USER_PREFERENCES.units,
      ),
      printer: readPrinter(entries.printer),
      material: readMaterial(entries.material),
      cost: readCost(entries.cost, language),
      project: readProject(entries.project),
      files: readFiles(entries.files),
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
      material: { ...DEFAULT_USER_PREFERENCES.material },
      cost: defaultCostPreferences(DEFAULT_USER_PREFERENCES.language),
      project: { ...DEFAULT_USER_PREFERENCES.project },
      files: { recentProjects: [] },
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

function readMaterial(value: unknown): UserPreferences["material"] {
  const fallback = DEFAULT_USER_PREFERENCES.material;

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...fallback };
  }

  const entries = value as Record<string, unknown>;
  const shape = MaterialPreferencesSchema.shape;

  return {
    defaultMaterial: readField(
      shape.defaultMaterial,
      entries.defaultMaterial,
      fallback.defaultMaterial,
    ),
    defaultFilament: readField(
      shape.defaultFilament,
      entries.defaultFilament,
      fallback.defaultFilament,
    ),
    autoloadLastMaterial: readField(
      shape.autoloadLastMaterial,
      entries.autoloadLastMaterial,
      fallback.autoloadLastMaterial,
    ),
  };
}

function readCost(
  value: unknown,
  language: UserPreferences["language"],
): UserPreferences["cost"] {
  const fallback = defaultCostPreferences(language);

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fallback;
  }

  const entries = value as Record<string, unknown>;
  const shape = CostPreferencesSchema.shape;

  return {
    currency: readField(shape.currency, entries.currency, fallback.currency),
    electricityPrice: readField(
      shape.electricityPrice,
      entries.electricityPrice,
      fallback.electricityPrice,
    ),
    printerPower: readRecord(entries.printerPower, PrinterPowerSchema),
    filamentPrices: readRecord(entries.filamentPrices, CostPriceSchema),
  };
}

function readProject(value: unknown): UserPreferences["project"] {
  const fallback = DEFAULT_USER_PREFERENCES.project;

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...fallback };
  }

  const entries = value as Record<string, unknown>;
  const shape = ProjectPreferencesSchema.shape;

  return {
    autoSave: readField(shape.autoSave, entries.autoSave, fallback.autoSave),
    autoSaveInterval: readField(
      shape.autoSaveInterval,
      entries.autoSaveInterval,
      fallback.autoSaveInterval,
    ),
  };
}

/** The valid paths of the recent projects, without repeats, 10 at most */
function readFiles(value: unknown): UserPreferences["files"] {
  const recentProjects: string[] = [];
  const list =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>).recentProjects
      : undefined;

  if (Array.isArray(list)) {
    for (const entry of list) {
      if (
        RecentProjectSchema.safeParse(entry).success &&
        !recentProjects.includes(entry as string) &&
        recentProjects.length < MAX_RECENT_PROJECTS
      ) {
        recentProjects.push(entry as string);
      }
    }
  }

  return { recentProjects };
}

/** The valid entries of a record of numbers by id; the others left out */
function readRecord(
  value: unknown,
  schema: ZodType<number>,
): Record<string, number> {
  const record: Record<string, number> = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return record;
  }

  for (const [key, entry] of Object.entries(value)) {
    const id = key.trim();
    const result = schema.safeParse(entry);

    // "__proto__" would change the prototype of the record, not add a key
    if (
      id.length > 0 &&
      id.length <= 200 &&
      id !== "__proto__" &&
      result.success
    ) {
      record[id] = result.data;
    }
  }

  return record;
}

function readField<T>(schema: ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value);

  return result.success ? result.data : fallback;
}

export default SettingsStorage;
