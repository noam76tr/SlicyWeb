/**
 * Wichy
 * Notification Service
 *
 * Responsible for:
 * - Notification creation
 * - Notification registration
 * - Notification access
 * - Notification management
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

import { NotificationManager } from "./NotificationManager";
import { NotificationFactory } from "./NotificationFactory";

export class NotificationService {
  private readonly manager =
    new NotificationManager();

  private readonly factory =
    new NotificationFactory();

  /**
   * Creates and stores an info notification.
   */
  public info(
    message: string,
  ): Notification {
    const notification =
      this.factory.createInfo(
        message,
      );

    this.manager.add(
      notification,
    );

    return notification;
  }

  /**
   * Creates and stores a warning notification.
   */
  public warning(
    message: string,
  ): Notification {
    const notification =
      this.factory.createWarning(
        message,
      );

    this.manager.add(
      notification,
    );

    return notification;
  }

  /**
   * Creates and stores an error notification.
   */
  public error(
    message: string,
  ): Notification {
    const notification =
      this.factory.createError(
        message,
      );

    this.manager.add(
      notification,
    );

    return notification;
  }

  /**
   * Stores an existing notification.
   */
  public add(
    notification: Notification,
  ): void {
    this.manager.add(
      notification,
    );
  }

  /**
   * Returns all notifications.
   */
  public getAll(): Notification[] {
    return this.manager.getAll();
  }

  /**
   * Returns a notification by id.
   */
  public getById(
    id: string,
  ): Notification | null {
    return this.manager.getById(
      id,
    );
  }

  /**
   * Removes a notification.
   */
  public remove(
    id: string,
  ): boolean {
    return this.manager.remove(
      id,
    );
  }

  /**
   * Clears all notifications.
   */
  public clear(): void {
    this.manager.clear();
  }

  /**
   * Returns notification count.
   */
  public count(): number {
    return this.manager.count();
  }

  /**
   * Returns whether notifications exist.
   */
  public hasNotifications(): boolean {
    return this.manager.hasNotifications();
  }

  /**
   * Returns notifications by type.
   */
  public getByType(
    type: string,
  ): Notification[] {
    return this.manager.getByType(
      type,
    );
  }
}
