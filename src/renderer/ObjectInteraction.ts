/**
 * SlicyWeb
 * Object Interaction
 *
 * Left button in the viewport (the camera uses the middle and right
 * buttons, GUI_SPEC.md, Viewport Controls):
 * - click on an object: selects it;
 * - click in the empty space: clears the selection;
 * - press on an object and drag: the object follows the pointer on the
 *   build plate (X, Y), as in Bambu Studio and OrcaSlicer; pressing on an
 *   object of a group (several objects selected) moves the whole group;
 * - Ctrl+click (Cmd+click) on an object: adds it to the selection or
 *   removes it (decision of Noam, Phase 6); Ctrl+drag on an object does
 *   nothing;
 * - press in the empty space and drag: a selection rectangle, as in the
 *   Windows File Explorer; on release, the objects touched by the
 *   rectangle are selected (with Ctrl: added to the selection).
 *
 * A press becomes a drag (or a rectangle) only after DRAG_THRESHOLD_PX
 * pixels: a click that selects never moves the object, and a real click
 * (no drag) in the empty space clears the selection (decision of Noam,
 * Phase 6).
 * Presses on a handle of the gizmo are left to the gizmo.
 *
 * Moves are sent to onMove, which applies them through TransformService
 * (given by the GUI: the Viewport Domain does not depend on the Service
 * Domain); onGesture marks the start and the end of a drag, recorded as
 * one action of the history.
 *
 * Domain: Viewport.
 *
 * Based on:
 * - GUI_SPEC.md (Viewport Controls, Selection Visualization, Object Gizmos)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import * as THREE from "three";

import { DRAG_THRESHOLD_PX } from "../constants/ViewportConstants";

import type { ScreenRect } from "./ObjectRenderer";

import type { Object3D, Transform } from "../types/Object3D";

export interface ObjectInteractionOptions {
  domElement: HTMLElement;
  getCamera: () => THREE.Camera;
  /** Object under the ray, or null */
  pick: (raycaster: THREE.Raycaster) => string | null;
  /** True while a handle of the gizmo is pressed or dragged */
  isGizmoActive: () => boolean;
  getObject: (objectId: string) => Object3D | undefined;
  /** Selected objects */
  getSelection: () => string[];
  /** Selects this object only; null clears the selection */
  select: (objectId: string | null) => void;
  /** Ctrl+click: adds the object to the selection, or removes it */
  toggle: (objectId: string) => void;
  /** Moves objects on the plate: their new transforms, by objectId */
  onMove: (transforms: Record<string, Transform>) => void;
  /** Start and end of a drag: one action of the history (undo, redo) */
  onGesture: (objectIds: string[], phase: "start" | "end") => void;
  /**
   * Selection rectangle released (normalized device coordinates): selects
   * the objects it touches, added to the selection when add is true
   */
  selectInRect: (rect: ScreenRect, add: boolean) => void;
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
    /** Ctrl (Cmd) held: the click adds or removes the object */
    toggle: boolean;
    /** The pointer went beyond the threshold: not a click */
    moved: boolean;
    dragging: boolean;
    /** Point of the plate under the pointer at the start of the drag */
    startPoint: THREE.Vector3 | null;
    /** Transforms of the objects dragged at the start of the drag */
    startTransforms: Record<string, Transform>;
    /** Selection rectangle in progress (press in the empty space) */
    selecting: boolean;
  } | null = null;

  /** Selection rectangle shown over the canvas */
  private readonly box: HTMLDivElement;

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.options.isGizmoActive()) {
      return;
    }

    this.press = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      objectId: this.pickAt(event),
      toggle: event.ctrlKey || event.metaKey,
      moved: false,
      dragging: false,
      startPoint: null,
      startTransforms: {},
      selecting: false,
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

    if (press.selecting) {
      this.drawBox(press.startX, press.startY, event.clientX, event.clientY);
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

      // Drag that started in the empty space: selection rectangle
      if (!press.objectId) {
        press.selecting = true;
        this.options.domElement.setPointerCapture(event.pointerId);
        this.drawBox(press.startX, press.startY, event.clientX, event.clientY);
        return;
      }

      // Ctrl+drag on an object: nothing to move
      if (press.toggle) {
        return;
      }

      // The object pressed and, when it is part of a group, the whole
      // group; an object that is not selected becomes the selection
      const selection = this.options.getSelection();
      const objectIds = selection.includes(press.objectId)
        ? selection
        : [press.objectId];
      const start = this.plateAt(press.startX, press.startY);
      const startTransforms: Record<string, Transform> = {};

      for (const objectId of objectIds) {
        const object = this.options.getObject(objectId);

        if (object) {
          startTransforms[objectId] = object.transform;
        }
      }

      if (!start || !startTransforms[press.objectId]) {
        this.press = null;
        return;
      }

      press.dragging = true;
      press.startPoint = start;
      press.startTransforms = startTransforms;

      if (!selection.includes(press.objectId)) {
        this.options.select(press.objectId);
      }

      this.options.onGesture(Object.keys(startTransforms), "start");
      this.options.domElement.setPointerCapture(event.pointerId);
    }

    const point = this.plateAt(event.clientX, event.clientY);

    if (point && press.startPoint) {
      const dx = point.x - press.startPoint.x;
      const dy = point.y - press.startPoint.y;
      const transforms: Record<string, Transform> = {};

      for (const [objectId, transform] of Object.entries(
        press.startTransforms,
      )) {
        transforms[objectId] = {
          ...transform,
          position: {
            ...transform.position,
            x: transform.position.x + dx,
            y: transform.position.y + dy,
          },
        };
      }

      this.options.onMove(transforms);
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const press = this.press;

    if (!press || event.pointerId !== press.pointerId) {
      return;
    }

    this.press = null;

    if (press.selecting) {
      this.box.style.display = "none";
      this.options.domElement.releasePointerCapture(event.pointerId);

      if (event.type !== "pointercancel") {
        this.options.selectInRect(
          this.screenRect(
            press.startX,
            press.startY,
            event.clientX,
            event.clientY,
          ),
          press.toggle,
        );
      }

      return;
    }

    if (press.dragging) {
      this.options.domElement.releasePointerCapture(event.pointerId);

      this.options.onGesture(Object.keys(press.startTransforms), "end");

      return;
    }

    if (press.moved) {
      return;
    }

    // A real click (no drag). Ctrl: add or remove the object (Ctrl+click
    // in the empty space keeps the selection); otherwise select the object
    // only, or clear the selection
    if (press.toggle) {
      if (press.objectId) {
        this.options.toggle(press.objectId);
      }
    } else {
      this.options.select(press.objectId);
    }
  };

  constructor(options: ObjectInteractionOptions) {
    this.options = options;

    const element = options.domElement;

    this.box = element.ownerDocument.createElement("div");
    this.box.className =
      "pointer-events-none absolute rounded-sm border border-primary bg-primary/15";
    this.box.style.display = "none";
    this.box.dataset.role = "selection-rectangle";
    element.parentElement?.appendChild(this.box);

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
    this.box.remove();
  }

  /** Shows the selection rectangle between two pointer positions */
  private drawBox(x1: number, y1: number, x2: number, y2: number): void {
    const parent = this.box.parentElement;

    if (!parent) {
      return;
    }

    const origin = parent.getBoundingClientRect();
    Object.assign(this.box.style, {
      display: "block",
      left: `${Math.min(x1, x2) - origin.left}px`,
      top: `${Math.min(y1, y2) - origin.top}px`,
      width: `${Math.abs(x2 - x1)}px`,
      height: `${Math.abs(y2 - y1)}px`,
    });
  }

  /** Rectangle between two pointer positions, in normalized coordinates */
  private screenRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): ScreenRect {
    const rect = this.options.domElement.getBoundingClientRect();
    const toX = (x: number): number => ((x - rect.left) / rect.width) * 2 - 1;
    const toY = (y: number): number => -((y - rect.top) / rect.height) * 2 + 1;

    return {
      minX: Math.min(toX(x1), toX(x2)),
      maxX: Math.max(toX(x1), toX(x2)),
      minY: Math.min(toY(y1), toY(y2)),
      maxY: Math.max(toY(y1), toY(y2)),
    };
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
