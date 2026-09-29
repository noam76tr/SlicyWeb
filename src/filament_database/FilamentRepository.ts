/**
 * Wichy
 * Filament Repository Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import type { Filament } from "../types/Filament";

export class FilamentRepository {
  private readonly filaments =
    new Map<string, Filament>();

  public save(
    filament: Filament
  ): void {
    this.filaments.set(
      filament.id,
      filament
    );
  }

  public get(
    filamentId: string
  ): Filament | undefined {
    return this.filaments.get(
      filamentId
    );
  }

  public getAll(): Filament[] {
    return Array.from(
      this.filaments.values()
    );
  }

  public exists(
    filamentId: string
  ): boolean {
    return this.filaments.has(
      filamentId
    );
  }

  public remove(
    filamentId: string
  ): void {
    this.filaments.delete(
      filamentId
    );
  }

  public clear(): void {
    this.filaments.clear();
  }

  public count(): number {
    return this.filaments.size;
  }
}
