/**
 * SlicyWeb
 * Number Formatter Tests
 *
 * Numbers shown in the format of the language (Phase 9 lot 81, remark of
 * Noam on lot 80): comma as decimal separator in French, point in English
 * and Hebrew; digit grouping of the language for a value only read; a
 * value in a field has no grouping and an ASCII minus sign; two decimals
 * at most, rounded as before; -0 is shown as 0. Lot 89 (remark of Noam on
 * lot 88): a value with its unit is shown "200 mm/s" in every language,
 * kept left to right in Hebrew by a left-to-right isolate.
 *
 * Based on:
 * - GUI_SPEC.md (Localization Support)
 * - TEST_PLAN.md
 */

import { describe, expect, it } from "vitest";

import {
  decimalSeparator,
  formatFieldNumber,
  formatNumber,
  formatQuantities,
  formatQuantity,
  formatQuantityRange,
  isolateValue,
} from "../../../src/i18n/NumberFormatter";

/** Left-to-right isolate … pop directional isolate */
const LRI = "\u2066";
const PDI = "\u2069";

describe("Number formatter", () => {
  it("uses the decimal separator of the language", () => {
    expect(decimalSeparator("en")).toBe(".");
    expect(decimalSeparator("fr")).toBe(",");
    expect(decimalSeparator("he")).toBe(".");

    expect(formatNumber(24.99, "en")).toBe("24.99");
    expect(formatNumber(24.99, "fr")).toBe("24,99");
    expect(formatNumber(24.99, "he")).toBe("24.99");
    expect(formatNumber(0.4, "fr")).toBe("0,4");
    expect(formatNumber(256, "fr")).toBe("256");
  });

  it("keeps two decimals at most, rounded as before", () => {
    expect(formatNumber(2.345678, "en")).toBe("2.35");
    expect(formatNumber(2.345678, "fr")).toBe("2,35");
    expect(formatNumber(-0.001, "fr")).toBe("0");
    expect(formatFieldNumber(-0.001, "fr")).toBe("0");
    expect(formatFieldNumber(12.5, "fr")).toBe("12,5");
    expect(formatFieldNumber(12.5, "en")).toBe("12.5");
  });

  it("groups the digits of a value only read, never in a field", () => {
    expect(formatNumber(20000, "en")).toBe("20,000");
    expect(formatNumber(20000, "he")).toBe("20,000");
    // French: narrow no-break space (U+202F) between the groups, so that
    // a number is never cut at the end of a line
    expect(formatNumber(1234.5, "fr")).toBe("1\u202f234,5");
    expect(formatNumber(20000, "fr")).toBe("20\u202f000");
    expect(formatNumber(20000, "fr")).not.toMatch(/[ \u00a0]/);

    expect(formatFieldNumber(20000, "en")).toBe("20000");
    expect(formatFieldNumber(20000, "fr")).toBe("20000");
    expect(formatFieldNumber(1234567.5, "he")).toBe("1234567.5");
    expect(formatFieldNumber(-1234.5, "fr")).toBe("-1234,5");
    expect(formatFieldNumber(-1234.5, "he")).toBe("-1234.5");
  });

  it("a value with its unit: number then unit, isolated in Hebrew only", () => {
    expect(formatQuantity(200, "mm/s", "en")).toBe("200 mm/s");
    expect(formatQuantity(0.2, "mm", "fr")).toBe("0,2 mm");
    expect(formatQuantity(15, "%", "fr")).toBe("15 %");
    expect(formatQuantity(45, "°", "en")).toBe("45°");
    expect(formatQuantity(210, "°C", "he")).toBe(`${LRI}210 °C${PDI}`);
    expect(formatQuantity(8, "cm³", "he")).toBe(`${LRI}8 cm³${PDI}`);
    expect(formatQuantity(1500, "mm/s²", "he")).toBe(`${LRI}1,500 mm/s²${PDI}`);
  });

  it("several values and a range with one unit", () => {
    expect(formatQuantities([256, 256, 256], " × ", "mm", "en")).toBe(
      "256 × 256 × 256 mm",
    );
    expect(formatQuantities([0.2, 0.4], " · ", "mm", "fr")).toBe(
      "0,2 · 0,4 mm",
    );
    expect(formatQuantityRange(190, 230, "°C", "en")).toBe("190 – 230 °C");
    expect(formatQuantityRange(190, 230, "°C", "he")).toBe(
      `${LRI}190 – 230 °C${PDI}`,
    );
  });

  it("isolates a text of values in Hebrew only", () => {
    expect(isolateValue("0.8 mm, 35 mm/s", "en")).toBe("0.8 mm, 35 mm/s");
    expect(isolateValue("0,8 mm, 35 mm/s", "fr")).toBe("0,8 mm, 35 mm/s");
    expect(isolateValue("0.8 mm, 35 mm/s", "he")).toBe(
      `${LRI}0.8 mm, 35 mm/s${PDI}`,
    );
  });
});
