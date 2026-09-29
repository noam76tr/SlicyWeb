/**
 * Wichy
 * Printer Cache
 *
 * Responsible for:
 * - Cached printer storage
 * - Cached printer retrieval
 * - Cache management
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - PRINTER_PROFILE_SPEC.md
 */

import type { Printer } from "../types/Printer";

export class PrinterCache {
  private readonly cache =
    new Map<string, Printer>();

  /**
   * Stores a printer in cache.
   */
  public set(
    printer: Printer,
  ): void {
    this.cache.set(
      printer.id,
      printer,
    );
  }

  /**
   * Returns a cached printer.
   */
  public get(
    printerId: string,
  ): Printer | undefined {
    return this.cache.get(
      printerId,
    );
  }

  /**
   * Checks whether a printer is cached.
   */
  public has(
    printerId: string,
  ): boolean {
    return this.cache.has(
      printerId,
    );
  }

  /**
   * Removes a cached printer.
   */
  public remove(
    printerId: string,
  ): boolean {
    return this.cache.delete(
      printerId,
    );
  }

  /**
   * Clears the cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns all cached printers.
   */
  public getAll(): Printer[] {
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
