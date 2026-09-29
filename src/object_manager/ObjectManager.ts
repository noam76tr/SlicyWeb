/**
 * Wichy
 * Object Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import type { Object3D } from "../types/Object3D";

export class ObjectManager {
  private readonly objects =
    new Map<string, Object3D>();

  public addObject(
    object: Object3D
  ): void {
    this.objects.set(
      object.objectId,
      object
    );
  }

  public removeObject(
    objectId: string
  ): void {
    this.objects.delete(
      objectId
    );
  }

  public getObject(
    objectId: string
  ): Object3D | undefined {
    return this.objects.get(
      objectId
    );
  }

  public getObjects(): Object3D[] {
    return Array.from(
      this.objects.values()
    );
  }

  public hasObject(
    objectId: string
  ): boolean {
    return this.objects.has(
      objectId
    );
  }

  public getObjectCount(): number {
    return this.objects.size;
  }

  public clear(): void {
    this.objects.clear();
  }
}
