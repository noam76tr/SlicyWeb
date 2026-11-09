/**
 * SlicyWeb
 * Properties Tab Service
 *
 * Open tab of the Properties Panel (renderer; lot 93, PASSATION.md
 * decision 90; lot 95, Q3 B; GUI_SPEC.md, Properties Tabs):
 * - choose(): opens the tab chosen by the user.
 *
 * The Printer tab is open at every start (the scene is empty, Object and
 * Settings have nothing to show). The tab is not saved in settings.json
 * since lot 95 (DATA_SCHEMA.md 3.12.0, User Preferences Schema).
 * A tab is never opened by the application on its own: only choose() by
 * the user changes it.
 *
 * Domain: Service. Depends on State Management
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - GUI_SPEC.md (Properties Tabs)
 * - DATA_SCHEMA.md 3.12.0 (User Preferences Schema)
 */

import { usePropertiesPanelStore } from "../state/propertiesPanelStore";
import type { PropertiesTab } from "../types/UserPreferences";

export const PropertiesTabService = {
  choose(tab: PropertiesTab): void {
    usePropertiesPanelStore.getState().chooseTab(tab);
  },
};

export default PropertiesTabService;
