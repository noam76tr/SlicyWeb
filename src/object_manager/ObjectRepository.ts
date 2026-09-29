/**
 * Wichy
 * Object Repository
 *
 * Responsible for:
 * - Object storage
 * - Object retrieval
 * - Object lookup
 *
 * No business logic.
 * No rendering logic.
 * No AI logic.
 */

import type { Object3D } from "../types/Object3D";

export class ObjectRepository {
  private readonly objects = new Map<
    string,
    Object3D
  >();

  /**
   * Adds an object to the repository.
   */
  public add(object: Object3D): void {
    this.objects.set(
      object.objectId,
      object,
    );
  }

  /**
   * Returns an object by id.
   */
  public get(
    objectId: string,
  ): Object3D | undefined {
    return this.objects.get(objectId);
  }

  /**
   * Returns all objects.
   */
  public getAll(): Object3D[] {
    return Array.from(
      this.objects.values(),
    );
  }

  /**
   * Checks whether an object exists.
   */
  public exists(
    objectId: string,
  ): boolean {
    return this.objects.has(objectId);
  }

  /**
   * Removes an object.
   */
  public remove(
    objectId: string,
  ): boolean {
    return this.objects.delete(objectId);
  }

  /**
   * Clears repository.
   */
  public clear(): void {
    this.objects.clear();
  }

  /**
   * Returns object count.
   */
  public getCount(): number {
    return this.objects.size;
  }
}
