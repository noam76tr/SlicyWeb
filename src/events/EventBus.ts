/**
 * Wichy
 * Event Bus Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - API_SPEC.md
 */

import type { EventType } from "./EventTypes";

export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
  private readonly listeners = new Map<
    EventType,
    Set<EventHandler>
  >();

  public subscribe<T = unknown>(
    event: EventType,
    handler: EventHandler<T>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners
      .get(event)
      ?.add(handler as EventHandler);
  }

  public unsubscribe<T = unknown>(
    event: EventType,
    handler: EventHandler<T>
  ): void {
    this.listeners
      .get(event)
      ?.delete(handler as EventHandler);
  }

  public emit<T = unknown>(
    event: EventType,
    payload?: T
  ): void {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
