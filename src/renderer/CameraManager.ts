/**
 * Wichy
 * Camera Manager
 *
 * Responsible for:
 * - Camera creation
 * - Camera configuration
 * - Camera positioning
 * - Camera updates
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 */

import * as THREE from "three";

export class CameraManager {
  private readonly camera: THREE.PerspectiveCamera;

  constructor(
    fov = 60,
    aspect = 1,
    near = 0.1,
    far = 10000,
  ) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      aspect,
      near,
      far,
    );

    this.reset();
  }

  /**
   * Returns active camera.
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Updates camera aspect ratio.
   */
  public updateAspect(
    width: number,
    height: number,
  ): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Sets camera position.
   */
  public setPosition(
    x: number,
    y: number,
    z: number,
  ): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * Makes camera look at target.
   */
  public lookAt(
    x: number,
    y: number,
    z: number,
  ): void {
    this.camera.lookAt(x, y, z);
  }

  /**
   * Resets camera to default position.
   */
  public reset(): void {
    this.camera.position.set(
      250,
      250,
      250,
    );

    this.camera.lookAt(0, 0, 0);
  }
}
