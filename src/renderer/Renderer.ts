/**
 * Wichy
 * Renderer
 *
 * Responsible for:
 * - WebGL renderer creation
 * - Canvas attachment
 * - Resize handling
 * - Render execution
 *
 * No business logic.
 * No scene management.
 * No AI logic.
 */

import * as THREE from "three";

export class Renderer {
  private readonly renderer: THREE.WebGLRenderer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x1e1e1e);
  }

  /**
   * Attach renderer canvas to a container.
   */
  public attach(container: HTMLElement): void {
    container.appendChild(this.renderer.domElement);

    this.resize(
      container.clientWidth,
      container.clientHeight,
    );
  }

  /**
   * Resize renderer viewport.
   */
  public resize(
    width: number,
    height: number,
  ): void {
    this.renderer.setSize(width, height);
  }

  /**
   * Render a scene.
   */
  public render(
    scene: THREE.Scene,
    camera: THREE.Camera,
  ): void {
    this.renderer.render(scene, camera);
  }

  /**
   * Returns underlying Three.js renderer.
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Cleanup renderer resources.
   */
  public dispose(): void {
    this.renderer.dispose();
  }
}
