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
 * A value with its unit (formatQuantity, formatQuantities,
 * formatQuantityRange; lot 89, remark of Noam on lot 88) is shown as in
 * English and French in every language: the number, then the unit
 * ("200 mm/s", "210 °C", "15 %", "8 cm³"). In a right-to-left language
 * (Hebrew), the value is wrapped in a left-to-right isolate (U+2066 …
 * U+2069): without it, the bidirectional algorithm shows "mm/s 200" or
 * "% 15", and a range "230 – 190". The isolate keeps the value in one
 * piece inside a Hebrew sentence. English and French are not changed.
 * Every value with a unit of the interface goes through these functions
 * (GUI_SPEC.md, Localization Support, Number Format).
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

/** Languages written from right to left */
const RIGHT_TO_LEFT: readonly SupportedLanguage[] = ["he"];

/** Left-to-right isolate and pop directional isolate (Unicode) */
const LEFT_TO_RIGHT_ISOLATE = "\u2066";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

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

/**
 * A text made of numbers and units ("0.8 mm, 35 mm/s"), kept left to
 * right in a right-to-left language; unchanged otherwise.
 */
export function isolateValue(
  text: string,
  language: SupportedLanguage,
): string {
  return RIGHT_TO_LEFT.includes(language)
    ? `${LEFT_TO_RIGHT_ISOLATE}${text}${POP_DIRECTIONAL_ISOLATE}`
    : text;
}

/** A value and its unit: "200 mm/s", "210 °C", "15 %"; "45°" for "°" */
export function formatQuantity(
  value: number,
  unit: string,
  language: SupportedLanguage,
): string {
  const separator = unit === "°" ? "" : " ";

  return isolateValue(
    `${formatNumber(value, language)}${separator}${unit}`,
    language,
  );
}

/**
 * Several values with one unit: "256 × 256 × 256 mm" (separator " × "),
 * "0.2 · 0.4 mm" (separator " · ")
 */
export function formatQuantities(
  values: readonly number[],
  separator: string,
  unit: string,
  language: SupportedLanguage,
): string {
  return isolateValue(
    `${values.map((value) => formatNumber(value, language)).join(separator)} ${unit}`,
    language,
  );
}

/** A range and its unit: "190 – 230 °C" */
export function formatQuantityRange(
  min: number,
  max: number,
  unit: string,
  language: SupportedLanguage,
): string {
  return formatQuantities([min, max], " – ", unit, language);
}
