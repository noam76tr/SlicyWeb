/**
 * SlicyWeb
 * App
 *
 * Main application component.
 *
 * Texts come from the translation dictionaries (useTranslation).
 * The language buttons of the footer are temporary: they will be
 * replaced by the Language menu (GUI_SPEC.md, Menu Bar).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";
import { Upload } from "lucide-react";

import type { SupportedLanguage } from "../i18n/LanguageManager";
import { useTranslation } from "./hooks/useTranslation";

const LANGUAGE_NAME_KEYS: Record<SupportedLanguage, string> = {
  en: "language.english",
  fr: "language.french",
  he: "language.hebrew",
};

export default function App(): JSX.Element {
  const { t, language, languages, setLanguage } = useTranslation();

  useEffect(() => {
    document.title = "SlicyWeb";
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-900 text-white">
      <header className="h-14 flex items-center px-4 border-b border-neutral-800">
        <h1 className="text-lg font-semibold">
          SlicyWeb
        </h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-neutral-800 p-4">
          <h2 className="text-sm font-semibold mb-4">
            {t("project.title")}
          </h2>

          <div className="space-y-2">
            <button
              className="
                w-full
                rounded
                bg-blue-600
                px-3
                py-2
                text-left
                hover:bg-blue-500
                flex
                items-center
                gap-2
              "
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("project.importStl")}
            </button>

            <button
              className="
                w-full
                rounded
                bg-blue-600
                px-3
                py-2
                text-left
                hover:bg-blue-500
                flex
                items-center
                gap-2
              "
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("project.import3mf")}
            </button>
          </div>
        </aside>

        <section className="flex-1 relative">
          <div
            id="renderer-container"
            className="absolute inset-0"
          />
        </section>

        <aside className="w-80 border-l border-neutral-800 p-4">
          <h2 className="text-sm font-semibold mb-4">
            {t("analysis.title")}
          </h2>

          <div className="text-sm text-neutral-400">
            {t("analysis.none")}
          </div>
        </aside>
      </main>

      <footer className="h-8 flex items-center gap-4 px-4 border-t border-neutral-800 text-xs text-neutral-500">
        <span>SlicyWeb v1.0.0</span>

        <span className="ms-auto">{t("statusBar.language")}:</span>

        {languages.map((code) => (
          <button
            key={code}
            type="button"
            className={code === language ? "text-white" : "hover:text-white"}
            aria-pressed={code === language}
            onClick={() => {
              void setLanguage(code);
            }}
          >
            {t(LANGUAGE_NAME_KEYS[code])}
          </button>
        ))}
      </footer>
    </div>
  );
}
