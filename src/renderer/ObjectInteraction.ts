/**
 * SlicyWeb
 * Object Interaction
 *
 * Left button in the viewport (the camera uses the middle and right
 * buttons, GUI_SPEC.md, Viewport Controls):
 * - click on an object: selects it;
 * - click in the empty space: clears the selection;
 * - press on an object and drag: the object follows the pointer on the
 *   build plate (X, Y), as in Bambu Studio and OrcaSlicer.
 *
 * A press becomes a drag only after DRAG_THRESHOLD_PX pixels: a click
 * that selects never moves the object, and only a real click (no drag) in
 * the empty space clears the selection (decision of Noam, Phase 6).
 * Presses on a handle of the gizmo are left to the gizmo.
 *
 * Moves are sent to onMove, which applies them through TransformService
 * (given by the GUI: the Viewport Domain does not depend on the Service
 * Domain).
 *
 * Domain: Viewport.
 *
 * Based on:
 * - GUI_SPEC.md (Viewport Controls, Selection Visualization, Object Gizmos)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import * as THREE from "three";

import { DRAG_THRESHOLD_PX } from "../constants/ViewportConstants";

import type { Object3D } from "../types/Object3D";

export interface ObjectInteractionOptions {
  domElement: HTMLElement;
  getCamera: () => THREE.Camera;
  /** Object under the ray, or null */
  pick: (raycaster: THREE.Raycaster) => string | null;
  /** True while a handle of the gizmo is pressed or dragged */
  isGizmoActive: () => boolean;
  getObject: (objectId: string) => Object3D | undefined;
  select: (objectId: string | null) => void;
  /** Moves an object to X, Y on the plate */
  onMove: (objectId: string, x: number, y: number) => void;
}

/** Plane of the build plate, Z = 0 */
const PLATE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

export class ObjectInteraction {
  private readonly options: ObjectInteractionOptions;

  private readonly raycaster = new THREE.Raycaster();

  private press: {
    pointerId: number;
    startX: number;
    startY: number;
    objectId: string | null;
    /** The pointer went beyond the threshold: not a click */
    moved: boolean;
    dragging: boolean;
    /** Object position minus the point of the plate under the pointer */
    offset: THREE.Vector2 | null;
  } | null = null;

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.options.isGizmoActive()) {
      return;
    }

    this.press = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      objectId: this.pickAt(event),
      moved: false,
      dragging: false,
      offset: null,
    };
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const press = this.press;

    if (!press || event.pointerId !== press.pointerId) {
      return;
    }

    if (this.options.isGizmoActive()) {
      this.press = null;
      return;
    }

    if (!press.dragging) {
      const distance = Math.hypot(
        event.clientX - press.startX,
        event.clientY - press.startY,
      );

      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }

      press.moved = true;

      // Drag that started in the empty space: nothing to move
      if (!press.objectId) {
        return;
      }

      // Start dragging the object pressed: selected, then moved
      const object = this.options.getObject(press.objectId);
      const start = this.plateAt(press.startX, press.startY);

      if (!object || !start) {
        this.press = null;
        return;
      }

      press.dragging = true;
      press.offset = new THREE.Vector2(
        object.transform.position.x - start.x,
        object.transform.position.y - start.y,
      );
      this.options.select(press.objectId);
      this.options.domElement.setPointerCapture(event.pointerId);
    }

    const point = this.plateAt(event.clientX, event.clientY);

    if (point && press.objectId && press.offset) {
      this.options.onMove(
        press.objectId,
        point.x + press.offset.x,
        point.y + press.offset.y,
      );
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const press = this.press;

    if (!press || event.pointerId !== press.pointerId) {
      return;
    }

    this.press = null;

    if (press.dragging) {
      this.options.domElement.releasePointerCapture(event.pointerId);
      return;
    }

    // A real click (no drag): select the object, or clear the selection
    if (!press.moved) {
      this.options.select(press.objectId);
    }
  };

  constructor(options: ObjectInteractionOptions) {
    this.options = options;

    const element = options.domElement;
    element.addEventListener("pointerdown", this.onPointerDown);
    element.addEventListener("pointermove", this.onPointerMove);
    element.addEventListener("pointerup", this.onPointerUp);
    element.addEventListener("pointercancel", this.onPointerUp);
  }

  public dispose(): void {
    const element = this.options.domElement;
    element.removeEventListener("pointerdown", this.onPointerDown);
    element.removeEventListener("pointermove", this.onPointerMove);
    element.removeEventListener("pointerup", this.onPointerUp);
    element.removeEventListener("pointercancel", this.onPointerUp);
  }

  private setRay(clientX: number, clientY: number): void {
    const rect = this.options.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(pointer, this.options.getCamera());
  }

  private pickAt(event: PointerEvent): string | null {
    this.setRay(event.clientX, event.clientY);
    return this.options.pick(this.raycaster);
  }

  /** Point of the build plate (Z = 0) under the pointer */
  private plateAt(clientX: number, clientY: number): THREE.Vector3 | null {
    this.setRay(clientX, clientY);
    return this.raycaster.ray.intersectPlane(PLATE, new THREE.Vector3());
  }
}
