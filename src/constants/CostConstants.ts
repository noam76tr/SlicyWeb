/**
 * SlicyWeb
 * Cost Constants Definition
 *
 * The numbers of the estimation of Phase 12 (ADR-037, answers of Noam to
 * lot 107, Q2, Q3 and Q7, all A, 2026-11-20). Each value comes from the
 * rule of the document named beside it; none is chosen here. The line
 * width and the speed factor are hypotheses, checked against OrcaSlicer
 * at the closure of the phase (Q4).
 *
 * Based on:
 * - DATA_SCHEMA.md 3.15.0 (Cost Estimation Rules, Print Estimation
 *   Rules, User Preferences Schema: cost)
 * - DECISIONS.md (ADR-037)
 */

import type { SupportedLanguage } from "../i18n/LanguageManager";

/**
 * Estimation Rules (DATA_SCHEMA.md 3.15.0, Cost Estimation Rules and
 * Print Estimation Rules)
 */
export const ESTIMATION = {
  /** Width of a line: diameter of the nozzle × 1.1 (0.44 mm for 0.4) */
  LINE_WIDTH_FACTOR: 1.1,

  /**
   * A face turned up or down: less than 45 degrees from the horizontal
   * (its normal at most 45 degrees from the vertical)
   */
  FLAT_FACE_ANGLE_DEG: 45,

  /** Real speed: the time of the lines is multiplied by this factor */
  SPEED_FACTOR: 1.5,
} as const;

/** Currencies of the Cost Section (Q7 A), ISO 4217 codes */
export const CURRENCIES = [
  "EUR",
  "USD",
  "ILS",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "JPY",
] as const;

export type Currency = (typeof CURRENCIES)[number];

/**
 * Currency taken when settings.json has no cost yet (Q7 A): EUR in
 * French, ILS in Hebrew, USD in English; then only the choice of the
 * user counts.
 */
export const DEFAULT_CURRENCY_BY_LANGUAGE: Record<SupportedLanguage, Currency> =
  {
    fr: "EUR",
    he: "ILS",
    en: "USD",
  };

/** Decimals of an amount: 0 for the yen, 2 for the others */
export function currencyDigits(currency: Currency): number {
  return currency === "JPY" ? 0 : 2;
}

/**
 * Limits of the values typed in the Cost Section (USER_SETTINGS_SPEC.md
 * 2.3.0, Cost Settings)
 */
export const COST_LIMITS = {
  /** Price of a kWh or of a kg: 0 to 1 000 000 */
  MAX_PRICE: 1_000_000,

  /** Average power of a printer: above 0, at most 10 000 W */
  MAX_POWER_W: 10_000,
} as const;
