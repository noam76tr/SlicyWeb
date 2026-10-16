/**
 * SlicyWeb
 * Scene Renderer Definition
 *
 * Render loop of the 3D viewport: at each frame, calls the optional
 * frame callback (camera movement, grid spacing), then draws the scene.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md
 */

import * as THREE from "three";

import { RendererManager } from "./RendererManager";

export class SceneRenderer {
  private readonly rendererManager: RendererManager;

  private animationFrameId: number | null =
    null;

  constructor(
    rendererManager: RendererManager
  ) {
    this.rendererManager =
      rendererManager;
  }

  public start(
    onFrame?: () => void
  ): void {
    if (
      this.animationFrameId !== null
    ) {
      return;
    }

    const renderLoop = (): void => {
      onFrame?.();

      this.rendererManager.render();

      this.animationFrameId =
        requestAnimationFrame(
          renderLoop
        );
    };

    renderLoop();
  }

  public stop(): void {
    if (
      this.animationFrameId === null
    ) {
      return;
    }

    cancelAnimationFrame(
      this.animationFrameId
    );

    this.animationFrameId = null;
  }

  public addObject(
    object: THREE.Object3D
  ): void {
    this.rendererManager
      .getScene()
      .add(object);
  }

  public removeObject(
    object: THREE.Object3D
  ): void {
    this.rendererManager
      .getScene()
      .remove(object);
  }

  public clearScene(): void {
    const scene =
      this.rendererManager.getScene();

    const objectsToRemove = [
      ...scene.children
    ];

    for (const object of objectsToRemove) {
      scene.remove(object);
    }
  }

  public resize(): void {
    this.rendererManager.resize();
  }
}
