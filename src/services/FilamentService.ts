/**
 * SlicyWeb
 * Filament Service Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - DECISIONS.md (ADR-033, D6): the main process loads the profiles
 *   (loadProfiles) and serves them through the filament:getAll IPC
 *   channel.
 */

import type { Filament } from "../types/Filament";

import {
  FilamentManager,
  type FilamentLoadResult,
  type FilamentProfileFolder,
} from "../filament_database/FilamentManager";

export class FilamentService {
  public constructor(
    private readonly filamentManager = new FilamentManager(),
  ) {}

  public loadProfiles(
    folders: FilamentProfileFolder[]
  ): FilamentLoadResult {
    return this.filamentManager.loadProfiles(
      folders
    );
  }

  public getUserFilamentIds(): string[] {
    return this.filamentManager.getUserFilamentIds();
  }

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
