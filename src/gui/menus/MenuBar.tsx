/**
 * SlicyWeb
 * Menu Bar
 *
 * The nine menus of GUI_SPEC.md (Menu Bar to Help Menu): File, Edit,
 * View, Printer, Material, Filament, Tools, Language, Help.
 *
 * Phase 3 (GUI Foundation):
 * - Language: changes the interface language (saved in the user
 *   settings, I18nProvider);
 * - File > Exit: closes the application window;
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

import { Fragment } from "react";

import type { SupportedLanguage } from "../../i18n/LanguageManager";
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
import {
  LANGUAGE_NAME_KEYS,
  useTranslation,
} from "../hooks/useTranslation";

interface MenuItemDefinition {
  /** Dictionary key of the item label */
  key: string;

  /** Shortcut shown next to the item (GUI_SPEC.md, Keyboard Shortcuts) */
  shortcut?: string;

  /** Action of the item; an item without action is disabled */
  action?: () => void;
}

interface MenuDefinition {
  /** Dictionary key of the menu title */
  key: string;

  /** Groups of items, separated by a line */
  groups: MenuItemDefinition[][];
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
      [{ key: "project.importStl" }, { key: "project.import3mf" }],
      [{ key: "project.close" }],
      [{ key: "app.exit", action: closeApplication }],
    ],
  },
  {
    key: "menu.edit",
    groups: [
      [
        { key: "edit.undo", shortcut: "Ctrl+Z" },
        { key: "edit.redo", shortcut: "Ctrl+Y" },
      ],
      [{ key: "edit.duplicate" }, { key: "edit.delete", shortcut: "Del" }],
      [
        { key: "edit.selectAll", shortcut: "Ctrl+A" },
        { key: "edit.deselectAll", shortcut: "Esc" },
      ],
      [{ key: "edit.preferences" }],
    ],
  },
  {
    key: "menu.view",
    groups: [
      [{ key: "view.perspective" }, { key: "view.orthographic" }],
      [
        { key: "view.top" },
        { key: "view.bottom" },
        { key: "view.front" },
        { key: "view.back" },
        { key: "view.left" },
        { key: "view.right" },
        { key: "view.isometric" },
      ],
      [{ key: "view.resetView", shortcut: "Home" }],
    ],
  },
  {
    key: "menu.printer",
    groups: [
      [{ key: "printer.select" }, { key: "printer.manage" }],
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

const HELP_MENU: MenuDefinition = {
  key: "menu.help",
  groups: [
    [{ key: "help.documentation" }, { key: "help.releaseNotes" }],
    [{ key: "help.about" }],
  ],
};

export default function MenuBar(): JSX.Element {
  const { t, language, languages, setLanguage } = useTranslation();

  const renderMenu = (menu: MenuDefinition): JSX.Element => (
    <MenubarMenu key={menu.key}>
      <MenubarTrigger>{t(menu.key)}</MenubarTrigger>

      <MenubarContent>
        {menu.groups.map((group, index) => (
          <Fragment key={group[0].key}>
            {index > 0 && <MenubarSeparator />}

            {group.map((item) => (
              <MenubarItem
                key={item.key}
                disabled={!item.action}
                onClick={item.action}
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
      {MENUS.map(renderMenu)}

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
