/**
 * SlicyWeb
 * Filament Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import type { Filament } from "../types/Filament";

import { FilamentRepository } from "./FilamentRepository";

export class FilamentManager {
  private readonly repository =
    new FilamentRepository();

 public removeFilament(
   filamentId: string
 ): boolean {
   return this.repository.remove(
     filamentId
   );
}

  public getFilament(
    filamentId: string
  ): Filament | undefined {
    return this.repository.get(
      filamentId
    );
  }

  public getFilaments(): Filament[] {
    return this.repository.getAll();
  }

  public hasFilament(
    filamentId: string
  ): boolean {
    return this.repository.exists(
      filamentId
    );
  }

  public getFilamentCount(): number {
    return this.repository.count();
  }

  public clear(): void {
    this.repository.clear();
  }
}
