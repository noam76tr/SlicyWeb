/**
 * Wichy
 * Filament Cache
 *
 * Responsible for:
 * - Cached filament storage
 * - Cached filament retrieval
 * - Cache management
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - FILAMENT_SETTINGS_SPEC.md
 */

import type { Filament } from "../types/Filament";

export class FilamentCache {
  private readonly cache =
    new Map<string, Filament>();

  /**
   * Stores a filament in cache.
   */
  public set(
    filament: Filament,
  ): void {
    this.cache.set(
      filament.id,
      filament,
    );
  }

  /**
   * Returns a cached filament.
   */
  public get(
    filamentId: string,
  ): Filament | undefined {
    return this.cache.get(
      filamentId,
    );
  }

  /**
   * Checks whether a filament is cached.
   */
  public has(
    filamentId: string,
  ): boolean {
    return this.cache.has(
      filamentId,
    );
  }

  /**
   * Removes a cached filament.
   */
  public remove(
    filamentId: string,
  ): boolean {
    return this.cache.delete(
      filamentId,
    );
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns all cached filaments.
   */
  public getAll(): Filament[] {
    return Array.from(
      this.cache.values(),
    );
  }

  /**
   * Returns cache size.
   */
  public getCount(): number {
    return this.cache.size;
  }
}
