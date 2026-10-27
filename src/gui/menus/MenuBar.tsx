/**
 * SlicyWeb
 * Menu Bar
 *
 * The nine menus of GUI_SPEC.md (Menu Bar to Help Menu): File, Edit,
 * View, Printer, Material, Filament, Tools, Language, Help.
 *
 * Active items:
 * - Language: changes the interface language (saved in the user
 *   settings, I18nProvider);
 * - File > Exit: closes the application window;
 * - View (Phase 4): perspective or orthographic projection, the seven
 *   view presets and Reset View (viewport store);
 * - File > Import STL and File > Import 3MF (Phase 5): system file
 *   dialog, import (openImportDialog, ImportService);
 * - Edit > Select All, Edit > Deselect All (Phase 6): selects all the
 *   objects, clears the object selection;
 * - Edit > Undo, Edit > Redo (Phase 6): last change of transform
 *   (TransformService), disabled while their history is empty;
 * - Printer > Select Printer (Phase 7): moves the focus to the printer
 *   selector of the Properties Panel (PrinterSection), when the menu
 *   closes (otherwise the menu gives the focus back to its title);
 * - Printer > Manage Printers (Phase 7 lot 61): opens the Printer
 *   Manager (PrinterManagerDialog);
 * - the other items are visible and disabled until the phase that
 *   provides their action.
 *
 * Shortcuts are those of GUI_SPEC.md (Keyboard Shortcuts); they are
 * displayed only, and become active with their action.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Menu Bar, Keyboard Shortcuts)
 * - CLAUDE.md (Internationalization Rule)
 */

import { Fragment, useRef } from "react";

import type { SupportedLanguage } from "../../i18n/LanguageManager";
import { TransformService } from "../../services/TransformService";
import { useHistoryStore } from "../../state/historyStore";
import { useObjectStore } from "../../state/objectStore";
import {
  useViewportStore,
  type ViewPreset,
  type ViewportProjection,
} from "../../state/viewportStore";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "../components/ui/menubar";
import { LANGUAGE_NAME_KEYS, useTranslation } from "../hooks/useTranslation";
import { IMPORT_ACCEPT, openImportDialog } from "../import/openImportDialog";
import { openPrinterManager } from "../dialogs/PrinterManagerDialog";
import { PRINTER_SELECTOR_ID } from "../sidebar/PrinterSection";

interface MenuItemDefinition {
  /** Dictionary key of the item label */
  key: string;

  /** Shortcut shown next to the item (GUI_SPEC.md, Keyboard Shortcuts) */
  shortcut?: string;

  /** Action of the item; an item without action is disabled */
  action?: () => void;

  /** Id of the element that gets the focus when the menu closes */
  focusId?: string;

  /** History read to enable the item (Undo, Redo) */
  history?: "undo" | "redo";
}

interface MenuDefinition {
  /** Dictionary key of the menu title */
  key: string;

  /** Groups of items, separated by a line */
  groups: MenuItemDefinition[][];
}

function requestView(view: ViewPreset): () => void {
  return () => {
    useViewportStore.getState().requestView(view);
  };
}

function closeApplication(): void {
  // Closing the only window quits the application
  // (src/electron/main.ts, window-all-closed).
  window.close();
}

const MENUS: MenuDefinition[] = [
  {
    key: "menu.file",
    groups: [
      [
        { key: "project.new", shortcut: "Ctrl+N" },
        { key: "project.open", shortcut: "Ctrl+O" },
        { key: "project.openWyproj" },
      ],
      [
        { key: "project.save", shortcut: "Ctrl+S" },
        { key: "project.saveAs" },
        { key: "project.exportWyproj" },
      ],
      [
        {
          key: "project.importStl",
          action: () => openImportDialog(IMPORT_ACCEPT.stl),
        },
        {
          key: "project.import3mf",
          action: () => openImportDialog(IMPORT_ACCEPT.threeMf),
        },
      ],
      [{ key: "project.close" }],
      [{ key: "app.exit", action: closeApplication }],
    ],
  },
  {
    key: "menu.edit",
    groups: [
      [
        {
          key: "edit.undo",
          shortcut: "Ctrl+Z",
          history: "undo",
          action: () => {
            TransformService.undo();
          },
        },
        {
          key: "edit.redo",
          shortcut: "Ctrl+Y",
          history: "redo",
          action: () => {
            TransformService.redo();
          },
        },
      ],
      [{ key: "edit.duplicate" }, { key: "edit.delete", shortcut: "Del" }],
      [
        {
          key: "edit.selectAll",
          shortcut: "Ctrl+A",
          action: () => useObjectStore.getState().selectAllObjects(),
        },
        {
          key: "edit.deselectAll",
          shortcut: "Esc",
          action: () => useObjectStore.getState().selectObject(null),
        },
      ],
      [{ key: "edit.preferences" }],
    ],
  },
  {
    key: "menu.printer",
    groups: [
      [
        {
          key: "printer.select",
          focusId: PRINTER_SELECTOR_ID,
        },
        { key: "printer.manage", action: openPrinterManager },
      ],
      [
        { key: "printer.refreshProfiles" },
        { key: "printer.importProfile" },
        { key: "printer.exportProfile" },
      ],
    ],
  },
  {
    key: "menu.material",
    groups: [
      [{ key: "material.select" }, { key: "material.manage" }],
      [{ key: "material.import" }, { key: "material.export" }],
    ],
  },
  {
    key: "menu.filament",
    groups: [
      [{ key: "filament.select" }, { key: "filament.manage" }],
      [{ key: "filament.import" }, { key: "filament.export" }],
    ],
  },
  {
    key: "menu.tools",
    groups: [
      [{ key: "tools.analyzeModels" }, { key: "tools.recomputeAnalysis" }],
      [
        { key: "tools.generateRecommendations" },
        { key: "tools.optimizeOrientation" },
      ],
    ],
  },
];

/**
 * View menu (GUI_SPEC.md, View Menu). The projection is a choice
 * between two items, shown as a radio group before these groups.
 */
const VIEW_MENU: MenuDefinition = {
  key: "menu.view",
  groups: [
    [
      { key: "view.top", action: requestView("top") },
      { key: "view.bottom", action: requestView("bottom") },
      { key: "view.front", action: requestView("front") },
      { key: "view.back", action: requestView("back") },
      { key: "view.left", action: requestView("left") },
      { key: "view.right", action: requestView("right") },
      { key: "view.isometric", action: requestView("isometric") },
    ],
    [{ key: "view.resetView", shortcut: "Home", action: requestView("reset") }],
  ],
};

const PROJECTIONS: { value: ViewportProjection; key: string }[] = [
  { value: "perspective", key: "view.perspective" },
  { value: "orthographic", key: "view.orthographic" },
];

const HELP_MENU: MenuDefinition = {
  key: "menu.help",
  groups: [
    [{ key: "help.documentation" }, { key: "help.releaseNotes" }],
    [{ key: "help.about" }],
  ],
};

export default function MenuBar(): JSX.Element {
  const { t, language, languages, setLanguage } = useTranslation();
  const projection = useViewportStore((state) => state.projection);
  const setProjection = useViewportStore((state) => state.setProjection);
  const canUndo = useHistoryStore((state) => state.undoStack.length > 0);
  const canRedo = useHistoryStore((state) => state.redoStack.length > 0);
  const focusTarget = useRef<string | null>(null);

  /** Element of focusId of the item chosen, otherwise the menu title */
  const finalFocus = (): HTMLElement | boolean => {
    const id = focusTarget.current;
    focusTarget.current = null;
    return (id && document.getElementById(id)) || true;
  };

  const isDisabled = (item: MenuItemDefinition): boolean =>
    (!item.action && !item.focusId) ||
    (item.history === "undo" && !canUndo) ||
    (item.history === "redo" && !canRedo);

  const renderMenu = (
    menu: MenuDefinition,
    header?: JSX.Element,
  ): JSX.Element => (
    <MenubarMenu key={menu.key}>
      <MenubarTrigger>{t(menu.key)}</MenubarTrigger>

      <MenubarContent finalFocus={finalFocus}>
        {header}

        {menu.groups.map((group, index) => (
          <Fragment key={group[0].key}>
            {(index > 0 || header) && <MenubarSeparator />}

            {group.map((item) => (
              <MenubarItem
                key={item.key}
                disabled={isDisabled(item)}
                onClick={() => {
                  focusTarget.current = item.focusId ?? null;
                  item.action?.();
                }}
              >
                {t(item.key)}
                {item.shortcut && (
                  <MenubarShortcut dir="ltr">{item.shortcut}</MenubarShortcut>
                )}
              </MenubarItem>
            ))}
          </Fragment>
        ))}
      </MenubarContent>
    </MenubarMenu>
  );

  return (
    <Menubar
      aria-label={t("menu.title")}
      className="h-8 border-0 bg-transparent p-0"
    >
      {/* File, Edit */}
      {MENUS.slice(0, 2).map((menu) => renderMenu(menu))}

      {renderMenu(
        VIEW_MENU,
        <MenubarRadioGroup
          value={projection}
          onValueChange={(value: ViewportProjection) => {
            setProjection(value);
          }}
        >
          {PROJECTIONS.map((item) => (
            <MenubarRadioItem key={item.value} value={item.value} closeOnClick>
              {t(item.key)}
            </MenubarRadioItem>
          ))}
        </MenubarRadioGroup>,
      )}

      {/* Printer, Material, Filament, Tools */}
      {MENUS.slice(2).map((menu) => renderMenu(menu))}

      <MenubarMenu>
        <MenubarTrigger>{t("menu.language")}</MenubarTrigger>

        <MenubarContent>
          <MenubarRadioGroup
            value={language}
            onValueChange={(value: SupportedLanguage) => {
              void setLanguage(value);
            }}
          >
            {languages.map((code) => (
              <MenubarRadioItem key={code} value={code} closeOnClick>
                {t(LANGUAGE_NAME_KEYS[code])}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>

      {renderMenu(HELP_MENU)}
    </Menubar>
  );
}
