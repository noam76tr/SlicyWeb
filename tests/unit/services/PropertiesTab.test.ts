/**
 * SlicyWeb
 * Properties Tab Tests
 *
 * Open tab of the Properties Panel (lot 93; lot 95, PASSATION.md
 * decision 90, Q3 B): the Printer tab is open at start; a tab chosen by
 * the user is opened; the tab is never saved (no settings:update, no
 * gui in the user settings).
 *
 * The bridge window.slicyWeb is replaced by a fake one: the tests run in
 * Node.js, without Electron.
 *
 * Based on:
 * - DATA_SCHEMA.md (User Preferences Schema 3.12.0)
 * - GUI_SPEC.md (Properties Tabs)
 * - TEST_PLAN.md
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PropertiesTabService } from "../../../src/services/PropertiesTabService";
import { usePropertiesPanelStore } from "../../../src/state/propertiesPanelStore";

let invoke: ReturnType<typeof vi.fn>;

beforeEach(() => {
  invoke = vi.fn(() => Promise.reject(new Error("Unexpected call")));
  vi.stubGlobal("window", { slicyWeb: { invoke } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Properties tab", () => {
  it("opens the Printer tab at start", () => {
    expect(usePropertiesPanelStore.getInitialState().tab).toBe("printer");
  });

  it("opens the tab chosen by the user without saving it", () => {
    PropertiesTabService.choose("settings");
    expect(usePropertiesPanelStore.getState().tab).toBe("settings");

    PropertiesTabService.choose("object");
    expect(usePropertiesPanelStore.getState().tab).toBe("object");

    expect(invoke).not.toHaveBeenCalled();
  });
});
