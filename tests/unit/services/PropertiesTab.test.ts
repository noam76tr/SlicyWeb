/**
 * SlicyWeb
 * Properties Tab Tests
 *
 * Last tab of the Properties Panel (lot 93; PASSATION.md decision 90,
 * Q3 A): the saved tab (gui.propertiesTab) is opened at start; a
 * settings.json without gui keeps the Printer tab; a tab chosen by the
 * user is saved (settings:update, gui) and is never replaced by the
 * saved tab read later; outside Electron the tab changes without being
 * saved.
 *
 * The bridge window.slicyWeb is replaced by a fake one: the tests run in
 * Node.js, without Electron.
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema 3.11.0)
 * - API_SPEC.md (SettingsIPC Channels)
 * - GUI_SPEC.md (Properties Tabs)
 * - TEST_PLAN.md
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PropertiesTabService } from "../../../src/services/PropertiesTabService";
import { usePropertiesPanelStore } from "../../../src/state/propertiesPanelStore";

let settings: Record<string, unknown>;
let invoke: ReturnType<typeof vi.fn>;

beforeEach(() => {
  settings = { language: "fr" };
  invoke = vi.fn((channel: string, payload?: unknown) => {
    switch (channel) {
      case "settings:get":
        return Promise.resolve({
          success: true,
          data: { settings },
          errors: [],
        });
      case "settings:update":
        settings = { ...settings, ...(payload as object) };
        return Promise.resolve({
          success: true,
          data: { settings },
          errors: [],
        });
      default:
        return Promise.reject(new Error(`Unexpected channel ${channel}`));
    }
  });
  vi.stubGlobal("window", { slicyWeb: { invoke } });
  usePropertiesPanelStore.setState({ tab: "printer", chosen: false });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Properties tab", () => {
  it("opens the saved tab at start", async () => {
    settings = { gui: { propertiesTab: "object" } };

    await PropertiesTabService.load();

    expect(usePropertiesPanelStore.getState().tab).toBe("object");
  });

  it("keeps the Printer tab for a settings.json without gui", async () => {
    await PropertiesTabService.load();

    expect(usePropertiesPanelStore.getState().tab).toBe("printer");
  });

  it("saves the tab chosen by the user", async () => {
    await PropertiesTabService.choose("settings");

    expect(usePropertiesPanelStore.getState().tab).toBe("settings");
    expect(invoke).toHaveBeenCalledWith("settings:update", {
      gui: { propertiesTab: "settings" },
    });
    expect(settings.gui).toEqual({ propertiesTab: "settings" });
  });

  it("never replaces a tab chosen before the saved tab is read", async () => {
    settings = { gui: { propertiesTab: "object" } };
    usePropertiesPanelStore.getState().chooseTab("settings");

    await PropertiesTabService.load();

    expect(usePropertiesPanelStore.getState().tab).toBe("settings");
  });

  it("changes the tab without saving it outside Electron", async () => {
    vi.stubGlobal("window", {});

    await PropertiesTabService.choose("object");

    expect(usePropertiesPanelStore.getState().tab).toBe("object");
    expect(invoke).not.toHaveBeenCalled();
  });
});
