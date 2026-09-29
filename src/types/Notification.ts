/**
 * Wichy
 * Notification Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 */

export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success";

export interface Notification {
  id: string;

  timestamp: string;

  type: NotificationType;

  message: string;
}
