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
 * material takes its default value only (Phase 8 lot 70). A file written
 * by lot 93 (3.11.0), with gui.propertiesTab, loads without error and
 * keeps every setting; gui is ignored and no longer written (3.12.0,
 * lot 95, Q3 B). A file written before 3.15.0, without cost, takes the
 * currency of its language and no price; the fields of cost are read one
 * by one, each entry of printerPower and filamentPrices on its own
 * (Phase 12, lot 108, ADR-037, Q7 A).
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema 3.5.0, 3.7.0, 3.12.0, 3.15.0)
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
      // No cost before 3.15.0: the currency of the language (Q7 A)
      cost: {
        currency: "ILS",
        electricityPrice: null,
        printerPower: {},
        filamentPrices: {},
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
      cost: {
        currency: "USD",
        electricityPrice: null,
        printerPower: {},
        filamentPrices: {},
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

  it("reads a settings.json of lot 93 with gui without losing any setting", () => {
    // Written by lot 93 (DATA_SCHEMA.md 3.11.0): gui.propertiesTab is no
    // longer stored since lot 95 (3.12.0, Q3 B)
    writeSettings({
      preferences: {
        theme: "dark",
        language: "he",
        units: "metric",
        printer: {
          defaultPrinter: "bambu_x1c",
          autoloadLastPrinter: false,
          autoCheckProfiles: false,
        },
        material: {
          defaultMaterial: "petg",
          defaultFilament: "bambu_petg_hf",
          autoloadLastMaterial: false,
        },
        gui: { propertiesTab: "object" },
      },
      other: { kept: true },
    });
    const expected = {
      theme: "dark",
      language: "he",
      units: "metric",
      printer: {
        defaultPrinter: "bambu_x1c",
        autoloadLastPrinter: false,
        autoCheckProfiles: false,
      },
      material: {
        defaultMaterial: "petg",
        defaultFilament: "bambu_petg_hf",
        autoloadLastMaterial: false,
      },
      cost: {
        currency: "ILS",
        electricityPrice: null,
        printerPower: {},
        filamentPrices: {},
      },
    };
    const storage = new SettingsStorage(filePath);

    expect(storage.load()).toEqual(expected);

    // The next write keeps every setting and no longer writes gui
    storage.save(storage.load());

    const content = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      preferences: Record<string, unknown>;
      other: unknown;
    };
    expect(content.preferences).toEqual(expected);
    expect(content.preferences).not.toHaveProperty("gui");
    expect(content.other).toEqual({ kept: true });
    expect(new SettingsStorage(filePath).load()).toEqual(expected);
  });

  it("ignores a damaged gui entry", () => {
    writeSettings({
      preferences: {
        theme: "dark",
        language: "fr",
        units: "metric",
        gui: "settings",
      },
    });

    const loaded = new SettingsStorage(filePath).load();
    expect(loaded).not.toHaveProperty("gui");
    expect(loaded.language).toBe("fr");
  });

  it("gives the currency of the language to a settings.json without cost", () => {
    for (const [language, currency] of [
      ["fr", "EUR"],
      ["he", "ILS"],
      ["en", "USD"],
    ]) {
      writeSettings({
        preferences: { theme: "dark", language, units: "metric" },
      });

      expect(new SettingsStorage(filePath).load().cost.currency).toBe(currency);
    }
  });

  it("keeps the cost settings and leaves out each invalid value alone", () => {
    writeSettings({
      preferences: {
        theme: "dark",
        language: "fr",
        units: "metric",
        cost: {
          currency: "CHF",
          electricityPrice: 0.27,
          printerPower: {
            prusa_mk4s: 120,
            broken: -5,
            tooHigh: 20000,
            text: "100",
          },
          filamentPrices: { prusament_pla: 24.99, free: 0, wrong: -1 },
        },
      },
    });
    const storage = new SettingsStorage(filePath);
    const loaded = storage.load();

    expect(loaded.cost).toEqual({
      currency: "CHF",
      electricityPrice: 0.27,
      printerPower: { prusa_mk4s: 120 },
      filamentPrices: { prusament_pla: 24.99, free: 0 },
    });

    // Saved again as read
    storage.save(loaded);
    expect(new SettingsStorage(filePath).load().cost).toEqual(loaded.cost);

    // An unknown currency or a negative price: the default of that field
    writeSettings({
      preferences: {
        theme: "dark",
        language: "fr",
        units: "metric",
        cost: { currency: "BTC", electricityPrice: -1 },
      },
    });
    expect(new SettingsStorage(filePath).load().cost).toEqual({
      currency: "EUR",
      electricityPrice: null,
      printerPower: {},
      filamentPrices: {},
    });
  });
});
