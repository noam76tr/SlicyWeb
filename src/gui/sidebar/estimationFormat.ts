/**
 * SlicyWeb
 * Estimation Format
 *
 * Text of the values of an estimation (Phase 12; GUI_SPEC.md, Estimation
 * Section, Status Bar; answers of Noam to lot 107, Q12 A), shared by the
 * Estimation Section and the status bar:
 * - "≈" before each estimated value;
 * - print time in hours and minutes ("≈ 2 h 35 min", "≈ < 1 min");
 * - filament length in meters, 2 decimals ("≈ 12.40 m");
 * - weight in whole grams, one decimal under 10 g ("≈ 37 g", "≈ 4.2 g");
 * - amounts with the decimals of the currency and its symbol, in the
 *   format of the language ("≈ 1,01 €", "≈ €1.01");
 * - Hebrew: kept left to right, as every value with a unit (lot 89).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Estimation Section, Localization Support)
 */

import { currencyDigits, type Currency } from "../../constants/CostConstants";
import type { SupportedLanguage } from "../../i18n/LanguageManager";
import {
  formatDuration,
  formatMoney,
  formatNumber,
  isolateValue,
} from "../../i18n/NumberFormatter";

/** Sign of an estimated value */
const ABOUT = "≈";

/** A text without its isolate marks, to be isolated once as a whole */
function strip(text: string): string {
  return text.replace(/[\u2066\u2069]/g, "");
}

export function aboutDuration(
  seconds: number,
  language: SupportedLanguage,
): string {
  return isolateValue(
    `${ABOUT} ${strip(formatDuration(seconds, language))}`,
    language,
  );
}

/** Length of filament in mm, shown in meters */
export function aboutLength(
  millimeters: number,
  language: SupportedLanguage,
): string {
  const meters = Math.round(millimeters / 10) / 100;

  return isolateValue(
    `${ABOUT} ${new Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(meters)} m`,
    language,
  );
}

export function aboutWeight(
  grams: number,
  language: SupportedLanguage,
): string {
  const value = grams < 10 ? Math.round(grams * 10) / 10 : Math.round(grams);

  return isolateValue(`${ABOUT} ${formatNumber(value, language)} g`, language);
}

export function aboutMoney(
  value: number,
  currency: Currency,
  language: SupportedLanguage,
): string {
  return isolateValue(
    `${ABOUT} ${strip(formatMoney(value, currency, currencyDigits(currency), language))}`,
    language,
  );
}

/** Several values of the status bar in one piece: "a · b · c" */
export function joinValues(
  values: string[],
  language: SupportedLanguage,
): string {
  return isolateValue(values.map(strip).join(" · "), language);
}
