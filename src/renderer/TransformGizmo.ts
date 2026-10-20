/**
 * SlicyWeb
 * Transform Gizmo
 *
 * Gizmos of the selected object (GUI_SPEC.md, Object Gizmos), with the
 * TransformControls of Three.js:
 * - Move: along X and Y only (the object always stands on the plate);
 * - Rotate: rings X, Y, Z around the axes of the plate, free, by steps of
 *   15 degrees while Shift is held; the object turns around its center
 *   (local origin, ADR-031) and may go under the plate during the gesture;
 *   on release it is placed back on the plate (only Z changes), as in
 *   Bambu Studio and OrcaSlicer;
 * - Scale: along the axes of the object; one handle per axis (X right,
 *   Y front, Z top) and the center handle (uniform). With the lock of the
 *   scale closed (keepProportions, as in the Transform section), an axis
 *   handle also scales uniformly.
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

/**
 * Applies a transform; returns false when it is refused. live: step of a
 * rotation gesture, not placed on the plate.
 */
export type GizmoChange = (
  objectId: string,
  transform: Transform,
  live: boolean,
) => boolean;

const RAD_TO_DEG = 180 / Math.PI;

type AxisName = "X" | "Y" | "Z";

const AXIS_INDEX: Record<AxisName, 0 | 1 | 2> = { X: 0, Y: 1, Z: 2 };

/**
 * Side kept for each handle of the Scale gizmo (decision of Noam,
 * Phase 6): right (+X), front (-Y), top (+Z).
 */
const SCALE_HANDLE_SIDE: Record<AxisName, 1 | -1> = { X: 1, Y: -1, Z: 1 };

/** Meshes of the Scale gizmo of TransformControls (handles, pickers) */
interface GizmoParts {
  gizmo: Record<string, THREE.Object3D>;
  picker: Record<string, THREE.Object3D>;
}

function isGizmoParts(object: THREE.Object3D): boolean {
  return "gizmo" in object && "picker" in object;
}

/**
 * Keeps one handle per axis of the Scale gizmo, on the side of
 * SCALE_HANDLE_SIDE, and the center handle (uniform); removes the plane
 * handles. The meshes of TransformControls have their placement in their
 * geometry, so the side is read from the geometry.
 */
function keepScaleHandles(group: THREE.Object3D): void {
  for (const child of [...group.children]) {
    const name = child.name;

    if (name === "XY" || name === "YZ" || name === "XZ") {
      group.remove(child);
      continue;
    }

    if (!(name in AXIS_INDEX) || !(child instanceof THREE.Mesh)) {
      continue;
    }

    const geometry = child.geometry as THREE.BufferGeometry;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;

    if (!box) {
      continue;
    }

    const index = AXIS_INDEX[name as AxisName];
    const side = SCALE_HANDLE_SIDE[name as AxisName];
    const center = box.getCenter(new THREE.Vector3()).getComponent(index);

    if (center * side >= 0) {
      continue;
    }

    const size = box.getSize(new THREE.Vector3());
    const thin = [0, 1, 2]
      .filter((i) => i !== index)
      .every((i) => size.getComponent(i) < 0.05);

    if (thin) {
      // Line of the handle (on the axis): half a turn to the side kept
      const turn =
        index === 2
          ? new THREE.Matrix4().makeRotationX(Math.PI)
          : new THREE.Matrix4().makeRotationZ(Math.PI);
      child.geometry = geometry.clone().applyMatrix4(turn);
    } else {
      group.remove(child);
    }
  }
}

/** Rotation stored with 6 decimals (avoids 44.99999999 after a snap) */
function roundDegrees(radians: number): number {
  return Math.round(radians * RAD_TO_DEG * 1e6) / 1e6;
}

/**
 * Start and end of a drag of a handle: its changes make one action of
 * the history (undo, redo).
 */
export type GizmoGesture = (objectId: string, phase: "start" | "end") => void;

export class TransformGizmo {
  private readonly controls: TransformControls;

  private readonly proxy = new THREE.Object3D();

  private readonly scene: THREE.Scene;

  private object: Object3D | null = null;

  private mode: TransformMode = "translate";

  /** Lock of the scale (keepProportions of the viewport store) */
  private uniform = true;

  /** Scale of the object when the drag of a handle started */
  private dragStartScale: THREE.Vector3 | null = null;

  private readonly onChange: GizmoChange;

  private readonly onGesture: GizmoGesture;

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
    onGesture: GizmoGesture,
  ) {
    this.scene = scene;
    this.onChange = onChange;
    this.onGesture = onGesture;
    this.proxy.name = "transform-gizmo-proxy";
    scene.add(this.proxy);

    this.controls = new TransformControls(camera, domElement);
    this.controls.setSpace("world");
    this.controls.setSize(0.8);
    scene.add(this.controls.getHelper());

    const parts = this.controls
      .getHelper()
      .children.find(isGizmoParts) as unknown as GizmoParts | undefined;

    if (parts) {
      keepScaleHandles(parts.gizmo["scale"]);
      keepScaleHandles(parts.picker["scale"]);
    }

    this.controls.addEventListener("dragging-changed", (event) => {
      const dragging = Boolean(event.value);
      const scale = this.object?.transform.scale;
      this.dragStartScale =
        dragging && scale ? new THREE.Vector3(scale.x, scale.y, scale.z) : null;

      if (dragging && this.object) {
        this.onGesture(this.object.objectId, "start");
      }

      if (!dragging && this.object) {
        // End of a rotation: the object is placed back on the plate
        if (this.mode === "rotate") {
          this.onChange(this.object.objectId, this.object.transform, false);
        }

        this.onGesture(this.object.objectId, "end");
      }

      onDragging(dragging);
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

  /** Lock of the scale: closed, every handle scales uniformly */
  public setUniform(uniform: boolean): void {
    this.uniform = uniform;
  }

  public setMode(mode: TransformMode): void {
    this.mode = mode;
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

  /**
   * Scale given by the gizmo. Lock closed: the factor of the axis handle
   * dragged is applied to the three axes, from the scale at the start of
   * the drag (TransformControls changes one axis only).
   */
  private scaleOfProxy(): Transform["scale"] {
    const { x, y, z } = this.proxy.scale;
    const axis = this.controls.axis;
    const start = this.dragStartScale;

    if (
      this.mode !== "scale" ||
      !this.uniform ||
      !start ||
      (axis !== "X" && axis !== "Y" && axis !== "Z")
    ) {
      return { x, y, z };
    }

    const index = AXIS_INDEX[axis];
    const factor =
      this.proxy.scale.getComponent(index) / start.getComponent(index);

    return {
      x: start.x * factor,
      y: start.y * factor,
      z: start.z * factor,
    };
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
        // Kept during a rotation; otherwise computed by TransformService
        // (the object stands on the plate)
        z: object.transform.position.z,
      },
      rotation: {
        x: roundDegrees(euler.x),
        y: roundDegrees(euler.y),
        z: roundDegrees(euler.z),
      },
      scale: this.scaleOfProxy(),
    };

    // Refused (for example a scale of 0): the gizmo goes back to the object
    const live = this.mode === "rotate" && this.controls.dragging;

    if (!this.onChange(object.objectId, transform, live)) {
      this.syncProxy(object.transform);
    }
  }
}
