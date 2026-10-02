/**
 * SlicyWeb
 * Notification Manager
 *
 * Responsible for:
 * - Notification registration
 * - Notification storage
 * - Notification retrieval
 * - Notification lifecycle management
 *
 * No rendering logic.
 * No repository logic.
 * No AI logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - SYSTEM_RULES.md
 */

import type { Notification } from "../types/Notification";

export class NotificationManager {
  private readonly notifications: Notification[] =
    [];

  /**
   * Adds a notification.
   */
  public add(
    notification: Notification,
  ): void {
    this.notifications.push(
      notification,
    );
  }

  /**
   * Returns all notifications.
   */
  public getAll(): Notification[] {
    return [
      ...this.notifications,
    ];
  }

  /**
   * Returns notification by id.
   */
  public getById(
    id: string,
  ): Notification | null {
    return (
      this.notifications.find(
        (notification) =>
          notification.id === id,
      ) ?? null
    );
  }

  /**
   * Removes notification by id.
   */
  public remove(
    id: string,
  ): boolean {
    const index =
      this.notifications.findIndex(
        (notification) =>
          notification.id === id,
      );

    if (index === -1) {
      return false;
    }

    this.notifications.splice(
      index,
      1,
    );

    return true;
  }

  /**
   * Clears all notifications.
   */
  public clear(): void {
    this.notifications.length = 0;
  }

  /**
   * Returns total count.
   */
  public count(): number {
    return this.notifications.length;
  }

  /**
   * Returns whether notifications exist.
   */
  public hasNotifications(): boolean {
    return (
      this.notifications.length > 0
    );
  }

  /**
   * Returns notifications by type.
   */
  public getByType(
    type: string,
  ): Notification[] {
    return this.notifications.filter(
      (notification) =>
        notification.type === type,
    );
  }
}
