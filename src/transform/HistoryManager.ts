/**
 * Wichy
 * History Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - DATA_SCHEMA.md
 */

export interface HistoryEntry<T> {
  timestamp: string;

  action: string;

  data: T;
}

export class HistoryManager<T> {
  private readonly history: HistoryEntry<T>[] =
    [];

  public add(
    action: string,
    data: T
  ): void {
    this.history.push({
      timestamp:
        new Date().toISOString(),

      action,

      data
    });
  }

  public getHistory():
    HistoryEntry<T>[] {
    return [...this.history];
  }

  public getLatest():
    HistoryEntry<T> | undefined {
    return this.history[
      this.history.length - 1
    ];
  }

  public clear(): void {
    this.history.length = 0;
  }

  public count(): number {
    return this.history.length;
  }
}
