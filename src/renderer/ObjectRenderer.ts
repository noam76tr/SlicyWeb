/**
 * SlicyWeb
 * Object Renderer
 *
 * Displays the objects of the scene in the viewport: one mesh per
 * object, built from its geometry (GeometryRegistry), placed with its
 * transform position and scale, hidden when the object is not visible,
 * and drawn in the accent color when it is selected.
 *
 * Rotation is not applied yet: its unit and order are not defined
 * (KI-017); imported objects have a rotation of 0.
 *
 * Domain: Viewport. Depends on the Scene Domain (geometry).
 *
 * Based on:
 * - GUI_SPEC.md (3D Viewport, Selection Visualization, Color Philosophy)
 * - DECISIONS.md (ADR-028, ADR-029)
 */

import * as THREE from "three";

import {
  OBJECT_COLOR,
  SELECTED_OBJECT_COLOR,
} from "../constants/ViewportConstants";
import { GeometryRegistry } from "../scene/GeometryRegistry";

import type { Object3D } from "../types/Object3D";

export class ObjectRenderer {
  private readonly scene: THREE.Scene;

  private readonly meshes = new Map<string, THREE.Mesh>();

  private readonly material = new THREE.MeshStandardMaterial({
    color: OBJECT_COLOR,
    roughness: 0.6,
    metalness: 0.05,
  });

  private readonly selectedMaterial = new THREE.MeshStandardMaterial({
    color: SELECTED_OBJECT_COLOR,
    roughness: 0.6,
    metalness: 0.05,
  });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Brings the meshes in line with the objects of the scene.
   */
  public sync(objects: Object3D[], selectedObjectId: string | null): void {
    const present = new Set<string>();

    for (const object of objects) {
      const geometry = GeometryRegistry.get(object.objectId);

      if (!geometry) {
        continue;
      }

      present.add(object.objectId);

      let mesh = this.meshes.get(object.objectId);

      if (!mesh || mesh.geometry !== geometry) {
        if (mesh) {
          this.scene.remove(mesh);
        }

        mesh = new THREE.Mesh(geometry, this.material);
        mesh.name = `object-${object.objectId}`;
        this.meshes.set(object.objectId, mesh);
        this.scene.add(mesh);
      }

      const { position, scale } = object.transform;
      mesh.position.set(position.x, position.y, position.z);
      mesh.scale.set(scale.x, scale.y, scale.z);
      mesh.visible = object.visible;
      mesh.material =
        object.objectId === selectedObjectId
          ? this.selectedMaterial
          : this.material;
    }

    for (const [objectId, mesh] of this.meshes) {
      if (!present.has(objectId)) {
        this.scene.remove(mesh);
        this.meshes.delete(objectId);
      }
    }
  }

  public dispose(): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
    }

    this.meshes.clear();
    this.material.dispose();
    this.selectedMaterial.dispose();
  }
}
