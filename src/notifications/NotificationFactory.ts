/**
 * Wichy
 * Notification Factory
 *
 * Responsible for:
 * - Notification creation
 * - Notification initialization
 * - Notification default values
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

export class NotificationFactory {
  /**
   * Creates a notification.
   */
  public create(
    type: string,
    message: string,
  ): Notification {
    return {
      id: this.generateId(),

      timestamp:
        new Date().toISOString(),

      type,

      message,
    };
  }

  /**
   * Creates an information notification.
   */
  public createInfo(
    message: string,
  ): Notification {
    return this.create(
      "info",
      message,
    );
  }

  /**
   * Creates a warning notification.
   */
  public createWarning(
    message: string,
  ): Notification {
    return this.create(
      "warning",
      message,
    );
  }

  /**
   * Creates an error notification.
   */
  public createError(
    message: string,
  ): Notification {
    return this.create(
      "error",
      message,
    );
  }

  /**
   * Generates a unique notification id.
   */
  private generateId(): string {
    return (
      "notification_" +
      Date.now().toString() +
      "_" +
      Math.floor(
        Math.random() * 100000,
      ).toString()
    );
  }
}
