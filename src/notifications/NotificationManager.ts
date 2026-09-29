/**
 * Wichy
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

import type { Notific*tion } from "../types/Notification*;

export class NotificationManage* {
  private readonly notification*: Notification[] =
    [];

  /**
*  * Adds a notification.
   */
  p*blic add(
    notification: Notifi*ation,
  ): void {
    this.notifi*ations.push(
      notification,
 *  );
  }

  /**
   * Returns all n*tifications.
   */
  public getAll*): Notification[] {
    return [
      ...this.notifications,
    ];
* }

  /**
   * Returns notificatio* by id.
   */
  public getById(
  * id: string,
  ): Notification | n*ll {
    return (
      this.notif*cations.find(
        (
          *otification,
        ) =>
        * notification.id === id,
      ) ?* null
    );
  }

  /**
   * Remov*s notification by id.
   */
  publ*c remove(
    id: string,
  ): boo*ean {
    const index =
      this*notifications.findIndex(
        (*otification) =>
          notifica*ion.id === id,
      );

    if (i*dex === -1) {
      return false;
*   }

    this.notifications.splic*(
      index,
      1,
    );

  * return true;
  }

  /**
   * Clea*s all notifications.
   */
  publi* clear(): void {
    this.notifica*ions.length = 0;
  }

  /**
   * R*turns total count.
   */
  public *ount(): number {
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
