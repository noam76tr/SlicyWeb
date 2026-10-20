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
 * The gizmo moves a proxy placed at the local origin of the object (its
 * center, ADR-031), never the mesh: each change is sent to onChange,
 * which applies it through TransformService (the only way to change a
 * transform); the store then updates the mesh and the proxy.
 *
 * Several objects selected (group, decisions of Noam, Phase 6): the proxy
 * is placed at the center of the group (center of its bounding box), in
 * the axes of the plate; the drag of a handle moves, turns (around the
 * center of the group, free during the gesture, each object placed back
 * on the plate on release) or scales the group, always uniformly.
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
import {
  ROTATION_ORDER,
  rotateAroundPoint,
  rotationEuler,
  roundDegrees,
  scaleAroundPoint,
  type Vector3Mm,
} from "../scene/ObjectTransform";

import type { TransformMode } from "../state/viewportStore";
import type { Object3D, Transform } from "../types/Object3D";

/**
 * Applies transforms (one object or a group), by objectId; returns false
 * when they are refused. live: step of a rotation gesture, not placed on
 * the plate.
 */
export type GizmoChange = (
  transforms: Record<string, Transform>,
  live: boolean,
) => boolean;

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

/**
 * Start and end of a drag of a handle: its changes make one action of
 * the history (undo, redo).
 */
export type GizmoGesture = (
  objectIds: string[],
  phase: "start" | "end",
) => void;

/** State saved when the drag of a handle starts */
interface DragStart {
  transforms: Record<string, Transform>;
  /** Proxy position (center of the object or of the group) */
  pivot: THREE.Vector3;
}

export class TransformGizmo {
  private readonly controls: TransformControls;

  private readonly proxy = new THREE.Object3D();

  private readonly scene: THREE.Scene;

  /** Objects under the gizmo: one object, or a group */
  private objects: Object3D[] = [];

  /** Center of the group (several objects) */
  private groupCenter: Vector3Mm | null = null;

  private mode: TransformMode = "translate";

  /** Lock of the scale (keepProportions of the viewport store) */
  private uniform = true;

  private dragStart: DragStart | null = null;

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
      const objectIds = this.objects.map((object) => object.objectId);

      if (dragging && objectIds.length > 0) {
        this.dragStart = {
          transforms: Object.fromEntries(
            this.objects.map((object) => [object.objectId, object.transform]),
          ),
          pivot: this.proxy.position.clone(),
        };
        this.onGesture(objectIds, "start");
      }

      if (!dragging && objectIds.length > 0) {
        // End of a rotation: the objects are placed back on the plate
        if (this.mode === "rotate") {
          this.onChange(
            Object.fromEntries(
              this.objects.map((object) => [object.objectId, object.transform]),
            ),
            false,
          );
        }

        this.onGesture(objectIds, "end");
      }

      if (!dragging) {
        this.dragStart = null;
        this.syncProxy();
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
   * Shows the gizmo on the selected objects (none: hidden); groupCenter is
   * the center of the group when several objects are selected. Called
   * after each change of the object store.
   */
  public attach(objects: Object3D[], groupCenter: Vector3Mm | null): void {
    this.objects = objects;
    this.groupCenter = groupCenter;

    if (objects.length === 0) {
      this.controls.detach();
      return;
    }

    // During a drag the proxy follows the pointer, not the store
    if (!this.controls.dragging) {
      this.syncProxy();
    }

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

  private isGroup(): boolean {
    return this.objects.length > 1;
  }

  /**
   * Proxy on the object (its transform), or at the center of the group in
   * the axes of the plate (rotation 0, scale 1)
   */
  private syncProxy(): void {
    if (this.isGroup()) {
      const center = this.groupCenter ?? { x: 0, y: 0, z: 0 };
      this.proxy.position.set(center.x, center.y, center.z);
      this.proxy.quaternion.identity();
      this.proxy.scale.set(1, 1, 1);
    } else if (this.objects.length === 1) {
      const transform = this.objects[0].transform;
      const { position, scale } = transform;
      this.proxy.position.set(position.x, position.y, position.z);
      this.proxy.quaternion.setFromEuler(rotationEuler(transform));
      this.proxy.scale.set(scale.x, scale.y, scale.z);
    }

    this.proxy.updateMatrixWorld();
  }

  /**
   * Factor of the axis handle dragged (the center handle changes the three
   * axes by the same factor); from the scale at the start of the drag.
   */
  private scaleFactor(startScale: THREE.Vector3): number {
    const axis = this.controls.axis;
    const index = axis === "Y" ? 1 : axis === "Z" ? 2 : 0;

    return (
      this.proxy.scale.getComponent(index) / startScale.getComponent(index)
    );
  }

  /**
   * Scale of one object given by the gizmo. Lock closed: the factor of the
   * axis handle dragged is applied to the three axes (TransformControls
   * changes one axis only).
   */
  private scaleOfProxy(start: Transform): Transform["scale"] {
    const { x, y, z } = this.proxy.scale;
    const axis = this.controls.axis;

    if (
      this.mode !== "scale" ||
      !this.uniform ||
      (axis !== "X" && axis !== "Y" && axis !== "Z")
    ) {
      return { x, y, z };
    }

    const factor = this.scaleFactor(
      new THREE.Vector3(start.scale.x, start.scale.y, start.scale.z),
    );

    return {
      x: start.scale.x * factor,
      y: start.scale.y * factor,
      z: start.scale.z * factor,
    };
  }

  /** Transforms of the group, from the move of the proxy since the start */
  private groupTransforms(start: DragStart): Record<string, Transform> {
    const pivot: Vector3Mm = {
      x: start.pivot.x,
      y: start.pivot.y,
      z: start.pivot.z,
    };
    const result: Record<string, Transform> = {};

    for (const [objectId, transform] of Object.entries(start.transforms)) {
      if (this.mode === "translate") {
        result[objectId] = {
          ...transform,
          position: {
            x: transform.position.x + this.proxy.position.x - pivot.x,
            y: transform.position.y + this.proxy.position.y - pivot.y,
            z: transform.position.z,
          },
        };
      } else if (this.mode === "rotate") {
        result[objectId] = rotateAroundPoint(
          transform,
          this.proxy.quaternion,
          pivot,
        );
      } else {
        // A group is always scaled uniformly (decision of Noam)
        result[objectId] = scaleAroundPoint(
          transform,
          this.scaleFactor(new THREE.Vector3(1, 1, 1)),
          pivot,
        );
      }
    }

    return result;
  }

  /** Sends the transforms given by the proxy to onChange */
  private applyProxy(): void {
    const start = this.dragStart;

    if (this.objects.length === 0 || !start) {
      return;
    }

    const live = this.mode === "rotate" && this.controls.dragging;

    if (this.isGroup()) {
      this.onChange(this.groupTransforms(start), live);
      return;
    }

    const object = this.objects[0];
    const startTransform =
      start.transforms[object.objectId] ?? object.transform;
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
      scale: this.scaleOfProxy(startTransform),
    };

    // Refused (for example a scale of 0): the gizmo goes back to the object
    if (!this.onChange({ [object.objectId]: transform }, live)) {
      this.syncProxy();
    }
  }
}
