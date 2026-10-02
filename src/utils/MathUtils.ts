/**
 * SlicyWeb
 * Math Utilities
 *
 * Responsible for:
 * - Mathematical helper functions
 * - Numeric calculations
 * - Geometric operations
 * - Constraint validation
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - UTILS_SPEC.md
 */

export class MathUtils {
  /**
   * Clamps a number between min and max.
   */
  public static clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Rounds number to specified decimals.
   */
  public static round(
    value: number,
    decimals: number = 0
  ): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Converts degrees to radians.
   */
  public static toRadians(
    degrees: number
  ): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts radians to degrees.
   */
  public static toDegrees(
    radians: number
  ): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculates distance between two points.
   */
  public static distance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Checks if number is in range.
   */
  public static inRange(
    value: number,
    min: number,
    max: number,
    inclusive: boolean = true
  ): boolean {
    if (inclusive) {
      return value >= min && value <= max;
    }
    return value > min && value < max;
  }

  /**
   * Linearly interpolates between two values.
   */
  public static lerp(
    start: number,
    end: number,
    t: number
  ): number {
    return start + (end - start) * t;
  }
}
