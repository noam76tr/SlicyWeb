/**
 * Wichy
 * Filament Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import type { Filament } from "../types/Filament";

import { FilamentManager } from "../filament_database/FilamentManager";

export class FilamentService {
  private readonly filamentManager =
    new FilamentManager();

  public addFilament(
    filament: Filament
  ): void {
    this.filamentManager.addFilament(
      filament
    );
  }

  public removeFilament(
    filamentId: string
  ): void {
    this.filamentManager.removeFilament(
      filamentId
    );
  }

  public getFilament(
    filamentId: string
  ): Filament | undefined {
    return this.filamentManager.getFilament(
      filamentId
    );
  }

  public getFilaments(): Filament[] {
    return this.filamentManager.getFilaments();
  }

  public hasFilament(
    filamentId: string
  ): boolean {
    return this.filamentManager.hasFilament(
      filamentId
    );
  }

  public getFilamentCount(): number {
    return this.filamentManager.getFilamentCount();
  }

  public clearFilaments(): void {
    this.filamentManager.clear();
  }
}
