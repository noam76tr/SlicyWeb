/**
 * SlicyWeb
 * Filament Importer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - API_SPEC.md
 */

import type { Filament } from "../types/Filament";

import { FilamentValidator } from "./FilamentValidator";

export class FilamentImporter {
  /**
   * Imports a filament profile from data.
   */
  public import(
    data: unknown,
  ): Filament {
    if (
      !FilamentValidator.validate(
        data as Filament,
      )
    ) {
      throw new Error(
        "Invalid filament profile."
      );
    }

    return data as Filament;
  }

  /**
   * Imports multiple filament profiles.
   */
  public importMany(
    data: unknown[],
  ): Filament[] {
    return data.map((item) =>
      this.import(item)
    );
  }
}
