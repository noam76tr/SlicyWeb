/**
 * Wichy
 * Selection Renderer Definition
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - TECH_STACK.md
 */

import * as THREE from "three";

export class SelectionRenderer {
  private readonly scene: THREE.Scene;

  private selectionBox: THREE.BoxHelper | null =
    null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public select(
    object: THREE.Object3D
  ): void {
    this.clearSelection();

    this.selectionBox =
      new THREE.BoxHelper(
        object,
        0x00aaff
      );

    this.scene.add(
      this.selectionBox
    );
  }

  public update(): void {
    if (!this.selectionBox) {
      return;
    }

    this.selectionBox.update();
  }

  public clearSelection(): void {
    if (!this.selectionBox) {
      return;
    }

    this.scene.remove(
      this.selectionBox
    );

    this.selectionBox.dispose();

    this.selectionBox = null;
  }

  public dispose(): void {
    this.clearSelection();
  }
}
