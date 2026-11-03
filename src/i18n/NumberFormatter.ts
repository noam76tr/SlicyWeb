/**
 * SlicyWeb
 * Number Formatter
 *
 * Numbers shown in the interface follow the format of the language
 * (GUI_SPEC.md, Localization Support; Phase 9 lot 81): decimal separator
 * (comma in French, point in English and Hebrew) and, for a value that is
 * only read, the digit grouping of the language ("1 234,5" in French).
 * Two decimals at most, rounded as before (Math.round); -0 is shown as 0.
 *
 * A value in a field that the user can type in (formatFieldNumber) has no
 * digit grouping and an ASCII minus sign, so that it can be read again by
 * the field (a comma is accepted as decimal separator).
 *
 * Stored values (projects, settings, profiles) never use this format:
 * they stay JSON numbers (language-neutral, CLAUDE.md).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Localization Support, Analysis Section)
 * - CLAUDE.md (Internationalization Rule)
 */

import type { SupportedLanguage } from "./LanguageManager";

const formatters = new Map<SupportedLanguage, Intl.NumberFormat>();

/** Rounded to 2 decimals at most; -0 becomes 0 */
function round(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

function formatter(language: SupportedLanguage): Intl.NumberFormat {
  let format = formatters.get(language);

  if (!format) {
    format = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
    formatters.set(language, format);
  }

  return format;
}

/** Decimal separator of the language ("," in French, "." otherwise) */
export function decimalSeparator(language: SupportedLanguage): string {
  return (
    formatter(language)
      .formatToParts(1.5)
      .find((part) => part.type === "decimal")?.value ?? "."
  );
}

/** A value shown (read only): format of the language, 2 decimals at most */
export function formatNumber(
  value: number,
  language: SupportedLanguage,
): string {
  return formatter(language).format(round(value));
}

/**
 * A value shown in a field: decimal separator of the language, no digit
 * grouping, 2 decimals at most
 */
export function formatFieldNumber(
  value: number,
  language: SupportedLanguage,
): string {
  return String(round(value)).replace(".", decimalSeparator(language));
}
