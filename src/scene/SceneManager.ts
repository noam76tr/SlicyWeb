/**
 * Wichy
 * Scene Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 * - GUI_SPEC.md
 */

import * as THREE from "three";

import type { Object3D } from "../types/Object3D";

export class SceneManager {
  private readonly scene: THREE.Scene;

  private readonly objects =
    new Map<string, THREE.Object3D>();

  constructor() {
    this.scene = new THREE.Scene();
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public addObject(
    id: string,
    object: THREE.Object3D
  ): void {
    this.objects.set(id, object);

    this.scene.add(object);
  }

  public removeObject(
    id: string
  ): void {
    const object =
      this.objects.get(id);

    if (!object) {
      return;
    }

    this.scene.remove(object);

    this.objects.delete(id);
  }

  public getObject(
    id: string
  ): THREE.Object3D | undefined {
    return this.objects.get(id);
  }

  public hasObject(
    id: string
  ): boolean {
    return this.objects.has(id);
  }

  public getObjects(): THREE.Object3D[] {
    return Array.from(
      this.objects.values()
    );
  }

  public getObjectCount(): number {
    return this.objects.size;
  }

  public clear(): void {
    for (const object of this.objects.values()) {
      this.scene.remove(object);
    }

    this.objects.clear();
  }
}
