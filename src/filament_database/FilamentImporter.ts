/**
 * SlicyWeb
 * Filament Importer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - API_SPEC.md
 *
 * Validation uses FilamentSchema (Zod): FilamentValidator was replaced by
 * the schema (Phase 8 lot 68, ADR-033 D11). Import Filament: Phase 15.
 */

import { FilamentSchema } from "../schemas/FilamentSchema";
import type { Filament } from "../types/Filament";

export class FilamentImporter {
  /**
   * Imports a filament profile from data.
   */
  public import(
    data: unknown,
  ): Filament {
    const result =
      FilamentSchema.safeParse(data);

    if (!result.success) {
      throw new Error(
        "Invalid filament profile."
      );
    }

    return result.data;
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
