/**
 * SlicyWeb
 * Project Format
 *
 * Texts of the project shown by the GUI (lot 111, decision 119 of Noam):
 * - the name: the name of its file, or "Untitled" before the first save
 *   (Q9 A; never written in a file);
 * - a time ("14:32") and a date with a time ("24/11 14:32"), in the
 *   format of the language of the window.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Project Section, Status Bar, Recovery Dialog)
 */

import type { SupportedLanguage } from "../../i18n/LanguageManager";

const LOCALES: Record<SupportedLanguage, string> = {
  en: "en-GB",
  fr: "fr-FR",
  he: "he-IL",
};

/** Name of the project shown */
export function projectDisplayName(
  projectName: string,
  untitled: string,
): string {
  return projectName || untitled;
}

/** Time of an ISO 8601 date ("14:32") */
export function formatTime(iso: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(LOCALES[language], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Day and month of an ISO 8601 date ("24/11") */
export function formatDay(iso: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}
