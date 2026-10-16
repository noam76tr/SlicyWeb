/**
 * SlicyWeb
 * Renderer Manager Definition
 *
 * Owns the Three.js renderer and scene of the 3D viewport, and draws
 * the scene with the active camera of the CameraManager.
 *
 * The canvas size follows the size of its container: resize() is
 * called by the viewport component when the container changes size
 * (window resized, side panel resized or collapsed).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md (3D Viewport, Color Philosophy)
 */

import * as THREE from "three";

import { VIEWPORT_BACKGROUND_COLOR } from "../constants/ViewportConstants";

import type { CameraManager } from "./CameraManager";

export class RendererManager {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private cameraManager: CameraManager;

  private container: HTMLElement;

  constructor(
    container: HTMLElement,
    cameraManager: CameraManager
  ) {
    this.container = container;

    this.cameraManager = cameraManager;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.initializeRenderer();
  }

  private initializeRenderer(): void {
    this.renderer.setPixelRatio(
      window.devicePixelRatio
    );

    this.renderer.setClearColor(
      VIEWPORT_BACKGROUND_COLOR
    );

    // Positioned over its container, so that the canvas never
    // prevents the container from shrinking
    const style = this.renderer.domElement.style;
    style.display = "block";
    style.position = "absolute";
    style.inset = "0";

    this.container.appendChild(
      this.renderer.domElement
    );

    this.resize();
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.cameraManager.getCamera();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public getHeight(): number {
    return this.container.clientHeight;
  }

  public render(): void {
    this.renderer.render(
      this.scene,
      this.cameraManager.getCamera()
    );
  }

  public resize(): void {
    const width =
      this.container.clientWidth;

    const height =
      this.container.clientHeight;

    if (width === 0 || height === 0) {
      return;
    }

    this.cameraManager.updateAspect(
      width,
      height
    );

    this.renderer.setSize(
      width,
      height
    );
  }

  public dispose(): void {
    this.renderer.dispose();

    this.renderer.domElement.remove();
  }
}
