/**
 * SlicyWeb
 * Transform Gizmo
 *
 * Gizmos of the selected object (GUI_SPEC.md, Object Gizmos), all drawn
 * by SlicyWeb, their handles placed beside the object, so that a drag
 * anywhere on it moves it freely (ObjectInteraction):
 * - Move: the arrows of MoveGizmo (lot 102), along X and Y only (the
 *   object always stands on the plate);
 * - Rotate: the rings of RotateGizmo (lot 103), around the axes of the
 *   plate, around the object; free, by steps of 15 degrees while Shift is
 *   held; the object turns around its center (local origin, ADR-031) and
 *   may go under the plate during the gesture; on release it is placed
 *   back on the plate (only Z changes), as in Bambu Studio and OrcaSlicer;
 * - Scale: the handles of ScaleGizmo (lot 103), one per axis of the
 *   object, to the right, the front and the top of the plate. With the
 *   lock of the scale closed (keepProportions, as in the Transform
 *   section), a handle scales uniformly.
 *
 * Each change is sent to onChange, which applies it through
 * TransformService (the only way to change a transform); the store then
 * updates the meshes and the gizmos (attach).
 *
 * Several objects selected (group, decisions of Noam, Phase 6): the
 * gizmos are at the center of the group (center of its bounding box), in
 * the axes of the plate; the drag of a handle moves, turns (around the
 * center of the group, each object placed back on the plate on release)
 * or scales the group, always uniformly.
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

import {
  rotationEuler,
  type Bounds,
  type Vector3Mm,
} from "../scene/ObjectTransform";

import { MoveGizmo, type ScreenPoint } from "./MoveGizmo";
import { RotateGizmo } from "./RotateGizmo";
import { ScaleGizmo } from "./ScaleGizmo";

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

/**
 * Start and end of a drag of a handle: its changes make one action of
 * the history (undo, redo).
 */
export type GizmoGesture = (
  objectIds: string[],
  phase: "start" | "end",
) => void;

/**
 * Gizmo under the pointer: a tip of the Move arrows ("move-handle"), a
 * ring of Rotate or a handle of Scale ("handle"), or none
 */
export type GizmoHover = "move-handle" | "handle" | null;

/** Object under a ray (pointer), by objectId; null: none */
export type GizmoPick = (raycaster: THREE.Raycaster) => string | null;

export class TransformGizmo {
  /** Arrows of the Move mode */
  private readonly move: MoveGizmo;

  /** Rings of the Rotate mode */
  private readonly rotate: RotateGizmo;

  /** Handles of the Scale mode */
  private readonly scale: ScaleGizmo;

  private camera: THREE.Camera;

  private readonly domElement: HTMLElement;

  private readonly pick: GizmoPick;

  private readonly raycaster = new THREE.Raycaster();

  /** Objects under the gizmo: one object, or a group */
  private objects: Object3D[] = [];

  private mode: TransformMode = "translate";

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onChange: GizmoChange,
    onDragging: (dragging: boolean) => void,
    onGesture: GizmoGesture,
    pick: GizmoPick,
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.pick = pick;

    // Gizmos before the object interaction: they receive the presses on
    // their handles first
    this.move = new MoveGizmo(scene, camera, domElement, {
      onChange: (transforms) => {
        onChange(transforms, false);
      },
      onGesture,
      onDragging,
    });

    this.rotate = new RotateGizmo(scene, camera, domElement, {
      onChange: (transforms, live) => {
        onChange(transforms, live);
      },
      onGesture,
      onDragging,
      isOverObjects: (point) => this.isOverObjects(point),
    });

    this.scale = new ScaleGizmo(scene, camera, domElement, {
      onChange: (transforms) => onChange(transforms, false),
      onGesture,
      onDragging,
    });

    this.setMode("translate");
  }

  /** True while a handle of the gizmo is dragged */
  public isDragging(): boolean {
    return (
      this.move.isDragging() ||
      this.rotate.isDragging() ||
      this.scale.isDragging()
    );
  }

  /** Gizmo under the pointer */
  public getHover(): GizmoHover {
    if (this.mode === "translate") {
      return this.move.isHovered() ? "move-handle" : null;
    }

    const hovered =
      this.mode === "rotate" ? this.rotate.isHovered() : this.scale.isHovered();

    return hovered ? "handle" : null;
  }

  /** Places the handles of the gizmos; called at each frame */
  public update(): void {
    this.move.update();
    this.rotate.update();
    this.scale.update();
  }

  /** Arrows of the Move mode on the screen (end-to-end tests) */
  public describeMoveHandles(): Record<string, ScreenPoint> | null {
    return this.move.describe();
  }

  /** Rings of the Rotate mode on the screen (end-to-end tests) */
  public describeRotateRings(): Record<string, ScreenPoint> | null {
    return this.rotate.describe();
  }

  /** Handles of the Scale mode on the screen (end-to-end tests) */
  public describeScaleHandles(): Record<string, ScreenPoint> | null {
    return this.scale.describe();
  }

  public setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.move.setCamera(camera);
    this.rotate.setCamera(camera);
    this.scale.setCamera(camera);
  }

  /** Lock of the scale: closed, every handle scales uniformly */
  public setUniform(uniform: boolean): void {
    this.scale.setUniform(uniform);
  }

  public setMode(mode: TransformMode): void {
    this.mode = mode;
    this.move.setEnabled(mode === "translate");
    this.rotate.setEnabled(mode === "rotate");
    this.scale.setEnabled(mode === "scale");
  }

  /**
   * Shows the gizmo on the selected objects (none: hidden); groupCenter is
   * the center of the group when several objects are selected; bounds:
   * box of the selected objects on the plate. Called after each change of
   * the object store.
   */
  public attach(
    objects: Object3D[],
    groupCenter: Vector3Mm | null,
    bounds: Bounds | null,
  ): void {
    this.objects = objects;

    const group = objects.length > 1;
    const center = group
      ? groupCenter
      : (objects[0]?.transform.position ?? null);
    // Scale: in the axes of the object, or of the plate for a group
    const quaternion =
      !group && objects[0]
        ? new THREE.Quaternion().setFromEuler(
            rotationEuler(objects[0].transform),
          )
        : new THREE.Quaternion();

    this.move.attach(objects, center, bounds);
    this.rotate.attach(objects, center, bounds);
    this.scale.attach(objects, center, quaternion, bounds);
  }

  public dispose(): void {
    this.move.dispose();
    this.rotate.dispose();
    this.scale.dispose();
  }

  /**
   * True when one of the selected objects is under a point of the screen
   * (Rotate rings: a press there goes to the object, Q3 A)
   */
  private isOverObjects(point: ScreenPoint): boolean {
    const rect = this.domElement.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    this.raycaster.setFromCamera(
      new THREE.Vector2(
        (point[0] / rect.width) * 2 - 1,
        -(point[1] / rect.height) * 2 + 1,
      ),
      this.camera,
    );

    const objectId = this.pick(this.raycaster);

    return (
      objectId !== null &&
      this.objects.some((object) => object.objectId === objectId)
    );
  }
}
