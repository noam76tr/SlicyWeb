/**
 * Wichy
 * Renderer Manager Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md
 */

import * as THREE from "three";

export class RendererManager {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.initializeRenderer();
  }

  private initializeRenderer(): void {
    this.renderer.setPixelRatio(
      window.devicePixelRatio
    );

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.container.appendChild(
      this.renderer.domElement
    );
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public render(): void {
    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  public resize(): void {
    const width =
      this.container.clientWidth;

    const height =
      this.container.clientHeight;

    this.camera.aspect =
      width / height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height
    );
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}
