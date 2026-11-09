/**
 * SlicyWeb
 * Properties Panel Store Definition
 *
 * Open tab of the Properties Panel (GUI_SPEC.md, Properties Tabs; lot 93,
 * PASSATION.md decision 90): Printer, Object or Settings. The tab changes
 * only when the user chooses it, never by itself.
 * - tab: open tab, Printer at every start (lot 95, Q3 B: the tab is not
 *   saved in settings.json).
 *
 * No business logic. The tab is chosen through PropertiesTabService.
 *
 * Based on:
 * - GUI_SPEC.md (Properties Tabs)
 * - DATA_SCHEMA.md 3.12.0 (User Preferences Schema)
 */

import { create } from "zustand";

import type { PropertiesTab } from "../types/UserPreferences";

interface PropertiesPanelState {
  tab: PropertiesTab;

  /** Tab chosen by the user */
  chooseTab: (tab: PropertiesTab) => void;
}

export const usePropertiesPanelStore = create<PropertiesPanelState>((set) => ({
  tab: "printer",

  chooseTab: (tab) => set({ tab }),
}));
