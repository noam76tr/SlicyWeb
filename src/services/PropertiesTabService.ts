/**
 * SlicyWeb
 * Properties Tab Service
 *
 * Last tab of the Properties Panel (renderer, lot 93; PASSATION.md
 * decision 90, Q3 A; GUI_SPEC.md, Properties Tabs):
 * - load(): reads gui.propertiesTab from the user settings (settings:get)
 *   and opens this tab; a settings.json without gui opens the Printer
 *   tab (DATA_SCHEMA.md 3.11.0, User Preferences Schema).
 * - choose(): opens the tab chosen by the user and saves it
 *   (settings:update, gui).
 *
 * A tab is never opened by the application on its own: only load() at
 * start and choose() by the user change it.
 * Outside Electron (no window.slicyWeb), nothing is read or saved.
 *
 * Domain: Service. Depends on State Management and on the IPC bridge
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - API_SPEC.md (SettingsIPC Channels)
 * - DATA_SCHEMA.md 3.11.0 (User Preferences Schema)
 * - USER_SETTINGS_SPEC.md (GUI Settings)
 */

import { z } from "zod";

import { GuiPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { usePropertiesPanelStore } from "../state/propertiesPanelStore";
import type { PropertiesTab } from "../types/UserPreferences";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const SettingsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settings: z.object({ gui: GuiPreferencesSchema }),
  }),
});

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

export const PropertiesTabService = {
  async load(): Promise<void> {
    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const result = SettingsResponseSchema.safeParse(
        await bridge.invoke("settings:get"),
      );

      if (result.success) {
        usePropertiesPanelStore
          .getState()
          .restoreTab(result.data.data.settings.gui.propertiesTab);
      }
    } catch (error) {
      console.error("The last tab could not be read.", error);
    }
  },

  async choose(tab: PropertiesTab): Promise<void> {
    usePropertiesPanelStore.getState().chooseTab(tab);

    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const response = (await bridge.invoke("settings:update", {
        gui: { propertiesTab: tab },
      })) as { success?: boolean; errors?: unknown };

      if (response.success !== true) {
        console.error("The tab could not be saved.", response.errors);
      }
    } catch (error) {
      console.error("The tab could not be saved.", error);
    }
  },
};

export default PropertiesTabService;
