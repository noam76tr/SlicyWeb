/**
 * Wichy
 * Filament Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

export interface Filament {
  id: string;

  brand: string;

  name: string;

  material: string;

  color: string;

  diameter: number;

  density: number;

  recommendedProfile: Record<string, unknown>;

  manufacturerSettings: Record<string, unknown>;

  pricePerKg: number;
}
