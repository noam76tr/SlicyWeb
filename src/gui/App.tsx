/**
 * SlicyWeb
 * App
 *
 * Main application component: assembles the main window
 * (GUI_SPEC.md, Main Window) in MainLayout.
 *
 * Texts come from the translation dictionaries (useTranslation).
 * The header holds the application name and temporary language
 * buttons: Menu Bar and Toolbar come in the next step of Phase 3,
 * and the buttons will be replaced by the Language menu.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";

import MainLayout from "./MainLayout";
import { LANGUAGE_NAME_KEYS, useTranslation } from "./hooks/useTranslation";
import LeftSidebar from "./sidebar/LeftSidebar";
import RightSidebar from "./sidebar/RightSidebar";
import StatusBar from "./statusbar/StatusBar";

export default function App(): JSX.Element {
  const { t, language, languages, setLanguage } = useTranslation();

  useEffect(() => {
    document.title = "SlicyWeb";
  }, []);

  const header = (
    <header className="flex h-10 shrink-0 items-center gap-4 border-b border-border bg-card px-3">
      <h1 className="text-base font-semibold">SlicyWeb</h1>

      <div className="ms-auto flex items-center gap-3 text-xs text-muted-foreground">
        <span>{t("menu.language")}:</span>

        {languages.map((code) => (
          <button
            key={code}
            type="button"
            className={
              code === language ? "text-foreground" : "hover:text-foreground"
            }
            aria-pressed={code === language}
            onClick={() => {
              void setLanguage(code);
            }}
          >
            {t(LANGUAGE_NAME_KEYS[code])}
          </button>
        ))}
      </div>
    </header>
  );

  const viewport = (
    <div
      id="renderer-container"
      className="flex h-full w-full items-center justify-center bg-viewport text-sm text-muted-foreground"
    >
      {t("viewport.placeholder")}
    </div>
  );

  return (
    <MainLayout
      header={header}
      leftTitle={t("objects.title")}
      leftPanel={<LeftSidebar />}
      centerPanel={viewport}
      rightTitle={t("properties.title")}
      rightPanel={<RightSidebar />}
      statusBar={<StatusBar />}
    />
  );
}
