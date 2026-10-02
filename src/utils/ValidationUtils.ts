/**
 * SlicyWeb
 * Validation Utilities
 *
 * Responsible for:
 * - Validation helper functions
 * - Type checking utilities
 * - Data validation
 * - Format validation
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - UTILS_SPEC.md
 */

export class ValidationUtils {
  /**
   * Checks if value is empty.
   */
  public static isEmpty(
    value: unknown
  ): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === "string") {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === "object") {
      return Object.keys(value).length === 0;
    }
    return false;
  }

  /**
   * Checks if value is a valid number.
   */
  public static isValidNumber(
    value: unknown
  ): value is number {
    return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
  }

  /**
   * Checks if value is a valid string.
   */
  public static isValidString(
    value: unknown,
    minLength: number = 0,
    maxLength?: number
  ): value is string {
    if (typeof value !== "string") {
      return false;
    }
    if (value.length < minLength) {
      return false;
    }
    if (maxLength !== undefined && value.length > maxLength) {
      return false;
    }
    return true;
  }

  /**
   * Checks if email is valid.
   */
  public static isValidEmail(
    email: string
  ): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Checks if URL is valid.
   */
  public static isValidUrl(
    url: string
  ): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates array contains only specified values.
   */
  public static isValidEnum<T>(
    value: unknown,
    enumValues: T[]
  ): value is T {
    return enumValues.includes(value as T);
  }

  /**
   * Checks if object has required keys.
   */
  public static hasRequiredKeys<T extends Record<string, unknown>>(
    obj: unknown,
    requiredKeys: (keyof T)[]
  ): obj is T {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    return requiredKeys.every((key) => key in obj);
  }
}
