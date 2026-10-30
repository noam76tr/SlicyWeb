/**
 * SlicyWeb
 * Settings Storage Tests
 *
 * settings.json (USER_SETTINGS_SPEC.md, Storage Location, Backward
 * Compatibility): a file written before DATA_SCHEMA.md 3.5.0, without
 * printer, loads without error and keeps the language, theme and units
 * of the user, with the default printer; an invalid field of printer
 * takes its default value only. A file written before 3.7.0, without
 * material, takes the default material settings; an invalid field of
 * material takes its default value only (Phase 8 lot 70).
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema 3.5.0, 3.7.0)
 * - USER_SETTINGS_SPEC.md (Printer Settings, Material Settings)
 * - TEST_PLAN.md
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SettingsStorage } from "../../../src/storage/SettingsStorage";

let folder: string;
let filePath: string;

beforeEach(() => {
  folder = fs.mkdtempSync(path.join(os.tmpdir(), "slicyweb-settings-"));
  filePath = path.join(folder, "settings.json");
});

afterEach(() => {
  fs.rmSync(folder, { recursive: true, force: true });
});

function writeSettings(content: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(content));
}

describe("Settings storage", () => {
  it("loads a settings.json without printer and keeps the language", () => {
    writeSettings({
      preferences: { theme: "light", language: "he", units: "metric" },
    });

    expect(new SettingsStorage(filePath).load()).toEqual({
      theme: "light",
      language: "he",
      units: "metric",
      printer: {
        defaultPrinter: null,
        autoloadLastPrinter: true,
        autoCheckProfiles: true,
      },
      material: {
        defaultMaterial: null,
        defaultFilament: null,
        autoloadLastMaterial: true,
      },
    });
  });

  it("keeps the language when the file is saved again with a printer", () => {
    writeSettings({
      preferences: { theme: "dark", language: "fr", units: "metric" },
    });
    const storage = new SettingsStorage(filePath);

    storage.save({
      ...storage.load(),
      printer: {
        defaultPrinter: "test-printer",
        autoloadLastPrinter: true,
        autoCheckProfiles: true,
      },
    });

    expect(new SettingsStorage(filePath).load()).toMatchObject({
      language: "fr",
      printer: {
        defaultPrinter: "test-printer",
        autoloadLastPrinter: true,
        autoCheckProfiles: true,
      },
    });
  });

  it("gives its default value to an invalid field of printer only", () => {
    writeSettings({
      preferences: {
        theme: "dark",
        language: "fr",
        units: "metric",
        printer: {
          defaultPrinter: 12,
          autoloadLastPrinter: false,
          autoCheckProfiles: true,
        },
      },
    });

    expect(new SettingsStorage(filePath).load()).toMatchObject({
      language: "fr",
      printer: {
        defaultPrinter: null,
        autoloadLastPrinter: false,
        autoCheckProfiles: true,
      },
    });
  });

  it("gives the default preferences when settings.json is missing or damaged", () => {
    const defaults = {
      theme: "dark",
      language: "en",
      units: "metric",
      printer: {
        defaultPrinter: null,
        autoloadLastPrinter: true,
        autoCheckProfiles: true,
      },
      material: {
        defaultMaterial: null,
        defaultFilament: null,
        autoloadLastMaterial: true,
      },
    };

    expect(new SettingsStorage(filePath).load()).toEqual(defaults);

    fs.writeFileSync(filePath, "{ broken");
    expect(new SettingsStorage(filePath).load()).toEqual(defaults);
  });

  it("gives its default value to an invalid field of material only", () => {
    writeSettings({
      preferences: {
        theme: "dark",
        language: "fr",
        units: "metric",
        material: {
          defaultMaterial: "pla",
          defaultFilament: 7,
          autoloadLastMaterial: false,
        },
      },
    });

    expect(new SettingsStorage(filePath).load()).toMatchObject({
      language: "fr",
      material: {
        defaultMaterial: "pla",
        defaultFilament: null,
        autoloadLastMaterial: false,
      },
    });
  });
});
