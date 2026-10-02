/**
 * SlicyWeb
 * JSON Utilities
 *
 * Responsible for:
 * - JSON helper functions
 * - JSON parsing and serialization
 * - JSON validation
 * - JSON transformation
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - UTILS_SPEC.md
 */

export class JsonUtils {
  /**
   * Safely parses JSON string.
   */
  public static parse<T = unknown>(
    jsonString: string,
    fallback?: T
  ): T | undefined {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Safely stringifies JSON object.
   */
  public static stringify<T = unknown>(
    data: T,
    pretty: boolean = false
  ): string {
    try {
      return JSON.stringify(
        data,
        null,
        pretty ? 2 : undefined
      );
    } catch {
      return "{}";
    }
  }

  /**
   * Checks if string is valid JSON.
   */
  public static isValid(
    jsonString: string
  ): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deep clones object using JSON.
   */
  public static deepClone<T = unknown>(
    data: T
  ): T {
    try {
      return JSON.parse(
        JSON.stringify(data)
      ) as T;
    } catch {
      return data;
    }
  }

  /**
   * Merges two JSON objects.
   */
  public static merge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>
  ): T {
    return {
      ...target,
      ...source,
    };
  }
}
