/**
 * SlicyWeb
 * Properties Panel Store Definition
 *
 * Open tab of the Properties Panel (GUI_SPEC.md, Properties Tabs; lot 93,
 * PASSATION.md decision 90): Printer, Object or Settings. The tab changes
 * only when the user chooses it, never by itself.
 * - tab: open tab, Printer until the saved tab is read;
 * - chosen: true once the user has chosen a tab, so that the saved tab
 *   read at start never replaces the tab chosen in the meantime.
 *
 * No business logic. The tab is saved and read by PropertiesTabService.
 *
 * Based on:
 * - GUI_SPEC.md (Properties Tabs)
 * - DATA_SCHEMA.md 3.11.0 (User Preferences Schema, gui)
 */

import { create } from "zustand";

import type { PropertiesTab } from "../types/UserPreferences";

interface PropertiesPanelState {
  tab: PropertiesTab;

  chosen: boolean;

  /** Tab read from the user settings at start */
  restoreTab: (tab: PropertiesTab) => void;

  /** Tab chosen by the user */
  chooseTab: (tab: PropertiesTab) => void;
}

export const usePropertiesPanelStore = create<PropertiesPanelState>((set) => ({
  tab: "printer",
  chosen: false,

  restoreTab: (tab) => set((state) => (state.chosen ? {} : { tab })),

  chooseTab: (tab) => set({ tab, chosen: true }),
}));
