/**
 * Wichy
 * Notification Validator
 *
 * Responsible for:
 * - Notification validation
 * - Severity validation
 * - Message validation
 * - Notification integrity checks
 *
 * No business logic.
 * No rendering logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - SYSTEM_RULES.md
 */

import type {
  Notification,
  NotificationType,
} from "../types/Notification";

export class NotificationValidator {
  private static readonly VALID_TYPES:
    readonly NotificationType[] = [
    "info",
    "success",
    "warning",
    "error",
  ];

  /**
   * Validates an entire notification.
   */
  public static validate(
    notification:
      | Notification
      | null
      | undefined,
  ): boolean {
    if (!notification) {
      return false;
    }

    return (
      this.validateId(
        notification.id,
      ) &&
      this.validateTimestamp(
        notification.timestamp,
      ) &&
      this.validateType(
        notification.type,
      ) &&
      this.validateMessage(
        notification.message,
      )
    );
  }

  /**
   * Validates notification id.
   */
  public static validateId(
    id: string,
  ): boolean {
    return (
      typeof id === "string" &&
      id.trim().length > 0
    );
  }

  /**
   * Validates timestamp.
   */
  public static validateTimestamp(
    timestamp: string,
  ): boolean {
    if (
      typeof timestamp !==
      "string"
    ) {
      return false;
    }

    return !Number.isNaN(
      Date.parse(timestamp),
    );
  }

  /**
   * Validates notification type.
   */
  public static validateType(
    type: NotificationType,
  ): boolean {
    return (
      this.VALID_TYPES.includes(
        type,
      )
    );
  }

  /**
   * Validates notification message.
   */
  public static validateMessage(
    message: string,
  ): boolean {
    return (
      typeof message === "string" &&
      message.trim().length > 0
    );
  }

  /**
   * Returns whether the notification
   * contains useful content.
   */
  public static hasContent(
    notification: Notification,
  ): boolean {
    return (
      this.validateMessage(
        notification.message,
      )
    );
  }
}
