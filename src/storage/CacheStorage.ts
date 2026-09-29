/**
 * Wichy
 * Cache Storage Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - API_SPEC.md
 */

export class CacheStorage {
  private readonly cache =
    new Map<string, unknown>();

  public save(
    key: string,
    value: unknown
  ): void {
    this.cache.set(
      key,
      value
    );
  }

  public load(
    key: string
  ): unknown {
    return this.cache.get(
      key
    );
  }

  public exists(
    key: string
  ): boolean {
    return this.cache.has(
      key
    );
  }

  public remove(
    key: string
  ): void {
    this.cache.delete(
      key
    );
  }

  public clear(): void {
    this.cache.clear();
  }

  public count(): number {
    return this.cache.size;
  }
}
