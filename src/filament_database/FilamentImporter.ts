/**
 * Wichy
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
  private readonly validator =
    new FilamentValidator();

  public import(
    data: unknown
  ): Filament {
    if (
      !this.validator.validate(
        data
      )
    ) {
      throw new Error(
        "Invalid filament profile."
      );
    }

    return data as Filament;
  }

  public importMany(
    data: unknown[]
  ): Filament[] {
    return data.map((item) =>
      this.import(item)
    );
  }
}
