/**
 * SlicyWeb
 * Object Renderer
 *
 * Displays the objects of the scene in the viewport: one mesh per
 * object, built from its geometry (GeometryRegistry), placed with its
 * transform (scale, rotation in degrees around the plate axes X, Y, Z,
 * position; ObjectTransform.ts, ADR-031), hidden when the object is not
 * visible, and drawn in the accent color when it is selected.
 *
 * Domain: Viewport. Depends on the Scene Domain (geometry, transform).
 *
 * Based on:
 * - GUI_SPEC.md (3D Viewport, Selection Visualization, Color Philosophy)
 * - DECISIONS.md (ADR-028, ADR-029, ADR-031)
 */

import * as THREE from "three";

import {
  OBJECT_COLOR,
  SELECTED_OBJECT_COLOR,
} from "../constants/ViewportConstants";
import { GeometryRegistry } from "../scene/GeometryRegistry";
import { objectMatrix } from "../scene/ObjectTransform";

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

      objectMatrix(object.transform).decompose(
        mesh.position,
        mesh.quaternion,
        mesh.scale,
      );
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
