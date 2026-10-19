/**
 * SlicyWeb
 * Transform Gizmo
 *
 * Gizmos of the selected object (GUI_SPEC.md, Object Gizmos), with the
 * TransformControls of Three.js:
 * - Move: along X and Y only (the object always stands on the plate);
 * - Rotate: rings X, Y, Z around the axes of the plate, free, by steps of
 *   15 degrees while Shift is held;
 * - Scale: along the axes of the object, one axis or uniform (center).
 *
 * The gizmo moves a proxy placed at the local origin of the object (center
 * of the base, ADR-031), never the mesh: each change is sent to onChange,
 * which applies it through TransformService (the only way to change a
 * transform); the store then updates the mesh and the proxy.
 *
 * Domain: Viewport. The change callback is given by the GUI (the Viewport
 * Domain does not depend on the Service Domain).
 *
 * Based on:
 * - GUI_SPEC.md (Object Gizmos, Move Gizmo, Rotate Gizmo, Scale Gizmo)
 * - DATA_SCHEMA.md (Transform Rules)
 * - DECISIONS.md (ADR-031)
 */

import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";

import { ROTATION_SNAP_DEGREES } from "../constants/ViewportConstants";
import { ROTATION_ORDER, rotationEuler } from "../scene/ObjectTransform";

import type { TransformMode } from "../state/viewportStore";
import type { Object3D, Transform } from "../types/Object3D";

/** Applies a transform; returns false when it is refused */
export type GizmoChange = (objectId: string, transform: Transform) => boolean;

const RAD_TO_DEG = 180 / Math.PI;

/** Rotation stored with 6 decimals (avoids 44.99999999 after a snap) */
function roundDegrees(radians: number): number {
  return Math.round(radians * RAD_TO_DEG * 1e6) / 1e6;
}

export class TransformGizmo {
  private readonly controls: TransformControls;

  private readonly proxy = new THREE.Object3D();

  private readonly scene: THREE.Scene;

  private object: Object3D | null = null;

  private readonly onChange: GizmoChange;

  private readonly onKey = (event: KeyboardEvent): void => {
    this.controls.setRotationSnap(
      event.shiftKey ? THREE.MathUtils.degToRad(ROTATION_SNAP_DEGREES) : null,
    );
  };

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onChange: GizmoChange,
    onDragging: (dragging: boolean) => void,
  ) {
    this.scene = scene;
    this.onChange = onChange;
    this.proxy.name = "transform-gizmo-proxy";
    scene.add(this.proxy);

    this.controls = new TransformControls(camera, domElement);
    this.controls.setSpace("world");
    this.controls.setSize(0.8);
    scene.add(this.controls.getHelper());

    this.controls.addEventListener("dragging-changed", (event) => {
      onDragging(Boolean(event.value));
    });

    this.controls.addEventListener("objectChange", () => {
      this.applyProxy();
    });

    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onKey);

    this.setMode("translate");
  }

  /** True while a handle of the gizmo is dragged */
  public isDragging(): boolean {
    return this.controls.dragging;
  }

  public setCamera(camera: THREE.Camera): void {
    this.controls.camera = camera;
  }

  public setMode(mode: TransformMode): void {
    this.controls.setMode(mode);

    // Move: X, Y and the XY plane only (Z is computed)
    this.controls.showZ = mode !== "translate";

    // Rotate: the rings X, Y, Z only (no screen ring, no free trackball)
    this.controls.showE = false;
    this.controls.showXYZE = mode !== "rotate";
  }

  /**
   * Shows the gizmo on an object (null: hidden). Called after each change
   * of the object store.
   */
  public attach(object: Object3D | null): void {
    this.object = object;

    if (!object) {
      this.controls.detach();
      return;
    }

    this.syncProxy(object.transform);

    if (this.controls.object !== this.proxy) {
      this.controls.attach(this.proxy);
    }
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onKey);
    this.controls.detach();
    this.scene.remove(this.controls.getHelper());
    this.scene.remove(this.proxy);
    this.controls.dispose();
  }

  private syncProxy(transform: Transform): void {
    const { position, scale } = transform;

    this.proxy.position.set(position.x, position.y, position.z);
    this.proxy.quaternion.setFromEuler(rotationEuler(transform));
    this.proxy.scale.set(scale.x, scale.y, scale.z);
    this.proxy.updateMatrixWorld();
  }

  /** Sends the transform of the proxy to onChange */
  private applyProxy(): void {
    const object = this.object;

    if (!object) {
      return;
    }

    const euler = new THREE.Euler().setFromQuaternion(
      this.proxy.quaternion,
      ROTATION_ORDER,
    );

    const transform: Transform = {
      position: {
        x: this.proxy.position.x,
        y: this.proxy.position.y,
        // Computed by TransformService: the object stands on the plate
        z: object.transform.position.z,
      },
      rotation: {
        x: roundDegrees(euler.x),
        y: roundDegrees(euler.y),
        z: roundDegrees(euler.z),
      },
      scale: {
        x: this.proxy.scale.x,
        y: this.proxy.scale.y,
        z: this.proxy.scale.z,
      },
    };

    // Refused (for example a scale of 0): the gizmo goes back to the object
    if (!this.onChange(object.objectId, transform)) {
      this.syncProxy(object.transform);
    }
  }
}
