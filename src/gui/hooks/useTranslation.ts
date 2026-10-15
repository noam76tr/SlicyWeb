/**
 * SlicyWeb
 * useTranslation Hook
 *
 * Gives GUI components access to the current language and to
 * translated texts. The context is provided by I18nProvider.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Localization)
 * - CLAUDE.md (Internationalization Rule)
 * - DOMAINS_DEPENDENCY_MATRIX.md (GUI Domain)
 */

import { createContext, useContext } from "react";

import type { SupportedLanguage } from "../../i18n/LanguageManager";

export type TextDirection = "ltr" | "rtl";

export interface I18nContextValue {
  /** Current language */
  language: SupportedLanguage;

  /** Text direction of the current language */
  direction: TextDirection;

  /** Supported languages, in menu order */
  languages: SupportedLanguage[];

  /**
   * Returns the text of a key in the current language.
   * "{name}" placeholders are replaced by params values.
   * A missing key returns the key itself.
   */
  t: (key: string, params?: Record<string, string | number>) => string;

  /** Loads a language and applies it to the whole interface */
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

/**
 * Dictionary key of the name of each language
 * (Language menu, status bar).
 */
export const LANGUAGE_NAME_KEYS: Record<SupportedLanguage, string> = {
  en: "language.english",
  fr: "language.french",
  he: "language.hebrew",
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used inside I18nProvider.");
  }

  return context;
}

export default useTranslation;
