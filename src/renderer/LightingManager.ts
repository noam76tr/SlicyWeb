/**
 * Wichy
 * Lighting Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md
 */

import * as THREE from "three";

export class LightingManager {
  private readonly scene: THREE.Scene;

  private ambientLight: THREE.AmbientLight;

  private directionalLight: THREE.DirectionalLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.0
      );

    this.directionalLight =
      new THREE.DirectionalLight(
        0xffffff,
        2.0
      );

    this.initialize();
  }

  private initialize(): void {
    this.directionalLight.position.set(
      100,
      200,
      100
    );

    this.scene.add(
      this.ambientLight
    );

    this.scene.add(
      this.directionalLight
    );
  }

  public getAmbientLight():
    THREE.AmbientLight {
    return this.ambientLight;
  }

  public getDirectionalLight():
    THREE.DirectionalLight {
    return this.directionalLight;
  }

  public setAmbientIntensity(
    intensity: number
  ): void {
    this.ambientLight.intensity =
      intensity;
  }

  public setDirectionalIntensity(
    intensity: number
  ): void {
    this.directionalLight.intensity =
      intensity;
  }

  public dispose(): void {
    this.scene.remove(
      this.ambientLight
    );

    this.scene.remove(
      this.directionalLight
    );
  }
}
