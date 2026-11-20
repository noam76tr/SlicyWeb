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
 * Right button (lot 105, decisions of Noam Q1 A, Q5 A): the camera turns
 * the view while it is dragged, as before; released after a travel of
 * less than CONTEXT_MENU_THRESHOLD_PX pixels, it opens the context menu
 * (onContextMenu) of the object under the pointer, or of the scene in the
 * empty space. An object that is not selected becomes the only selected
 * object first; an object already selected keeps the whole selection; the
 * empty space keeps the selection (Q6 A). A drag of the right button that
 * starts on an object turns the view and opens no menu.
 *
 * Cursor (lot 102, decision of Noam Q5 A): over an object, the move
 * cursor, in every mode (a drag on an object always moves it); over a tip
 * of the Move arrows, a ring of Rotate or a handle of Scale (lot 103), a
 * hand; elsewhere, the normal cursor. The object under the pointer is looked for at
 * most once per frame, only after a rest of the pointer when one search
 * is slow (HOVER_PICK_SLOW_MS).
 *
 * Locked objects (lot 106, decision 112 of Noam, Q12 A, Q15 A): a drag on
 * an object locked, or on a group with an object locked, moves nothing,
 * and the cursor over a locked object stays the normal one. Hidden objects
 * are never under the pointer (ObjectRenderer); a group with a hidden
 * object selected moves nothing either (decision 114, Q28 A).
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

import {
  CONTEXT_MENU_THRESHOLD_PX,
  DRAG_THRESHOLD_PX,
  HOVER_PICK_REST_MS,
  HOVER_PICK_SLOW_MS,
} from "../constants/ViewportConstants";

import type { ScreenRect } from "./ObjectRenderer";
import type { GizmoHover } from "./TransformGizmo";

import type { Object3D, Transform } from "../types/Object3D";

export interface ObjectInteractionOptions {
  domElement: HTMLElement;
  getCamera: () => THREE.Camera;
  /** Object under the ray, or null */
  pick: (raycaster: THREE.Raycaster) => string | null;
  /** True while a handle of the gizmo is pressed or dragged */
  isGizmoActive: () => boolean;
  /** Gizmo under the pointer (cursor) */
  getGizmoHover: () => GizmoHover;
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
  /**
   * Right click without drag (lot 105): context menu of this object
   * (already selected), or of the scene (null), at this pointer position
   */
  onContextMenu: (
    objectId: string | null,
    clientX: number,
    clientY: number,
  ) => void;
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

  /**
   * Press of the right button (lot 105): a context menu on release, unless
   * the pointer went beyond CONTEXT_MENU_THRESHOLD_PX (rotation of the view)
   */
  private rightPress: {
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null = null;

  /** Selection rectangle shown over the canvas */
  private readonly box: HTMLDivElement;

  /** Last pointer position without a button pressed (cursor) */
  private hoverPoint: { clientX: number; clientY: number } | null = null;

  /** Cursor update waiting for the next frame or for a rest */
  private hoverFrame: number | null = null;

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  /** The last search of the object under the pointer was slow */
  private slowPick = false;

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.cancelHover();

    if (event.button === 2 && !this.press && !this.options.isGizmoActive()) {
      this.rightPress = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      return;
    }

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
    const right = this.rightPress;

    if (
      right &&
      event.pointerId === right.pointerId &&
      Math.hypot(event.clientX - right.startX, event.clientY - right.startY) >=
        CONTEXT_MENU_THRESHOLD_PX
    ) {
      right.moved = true;
    }

    const press = this.press;

    if (!press && event.buttons === 0 && !this.options.isGizmoActive()) {
      this.scheduleHover(event);
    }

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

      // An object locked (lot 106, Q12 A, Q15 A) or hidden (decision 114,
      // Q28 A) in the group: nothing moves
      if (
        objectIds.some((id) => {
          const object = this.options.getObject(id);
          return object?.locked || object?.visible === false;
        })
      ) {
        return;
      }
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
      this.setCursor("move");

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
    if (event.type === "pointercancel") {
      this.rightPress = null;
    }

    if (event.button === 2) {
      this.releaseRight(event);
      return;
    }

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
    element.addEventListener("pointerleave", this.onPointerLeave);
  }

  public dispose(): void {
    const element = this.options.domElement;
    element.removeEventListener("pointerdown", this.onPointerDown);
    element.removeEventListener("pointermove", this.onPointerMove);
    element.removeEventListener("pointerup", this.onPointerUp);
    element.removeEventListener("pointercancel", this.onPointerUp);
    element.removeEventListener("pointerleave", this.onPointerLeave);
    this.cancelHover();
    this.setCursor("");
    this.box.remove();
  }

  /**
   * Release of the right button: the context menu, when the pointer stayed
   * within CONTEXT_MENU_THRESHOLD_PX of the press (not a rotation)
   */
  private releaseRight(event: PointerEvent): void {
    const right = this.rightPress;
    this.rightPress = null;

    if (
      !right ||
      event.pointerId !== right.pointerId ||
      right.moved ||
      Math.hypot(event.clientX - right.startX, event.clientY - right.startY) >=
        CONTEXT_MENU_THRESHOLD_PX ||
      this.options.isGizmoActive()
    ) {
      return;
    }

    const objectId = this.pickAt(event);

    if (objectId && !this.options.getSelection().includes(objectId)) {
      this.options.select(objectId);
    }

    this.options.onContextMenu(objectId, event.clientX, event.clientY);
  }

  private readonly onPointerLeave = (): void => {
    this.cancelHover();

    if (!this.press && !this.options.isGizmoActive()) {
      this.setCursor("");
    }
  };

  private setCursor(cursor: string): void {
    if (this.options.domElement.style.cursor !== cursor) {
      this.options.domElement.style.cursor = cursor;
    }
  }

  private cancelHover(): void {
    this.hoverPoint = null;

    if (this.hoverFrame !== null) {
      cancelAnimationFrame(this.hoverFrame);
      this.hoverFrame = null;
    }

    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  /**
   * Cursor for the pointer position: at the next frame, or after a rest
   * of the pointer when the last search of the object was slow
   */
  private scheduleHover(event: PointerEvent): void {
    this.hoverPoint = { clientX: event.clientX, clientY: event.clientY };

    if (this.slowPick) {
      if (this.hoverTimer !== null) {
        clearTimeout(this.hoverTimer);
      }

      this.hoverTimer = setTimeout(() => {
        this.hoverTimer = null;
        this.updateHover();
      }, HOVER_PICK_REST_MS);
    } else if (this.hoverFrame === null) {
      this.hoverFrame = requestAnimationFrame(() => {
        this.hoverFrame = null;
        this.updateHover();
      });
    }
  }

  private updateHover(): void {
    const point = this.hoverPoint;

    if (!point || this.press || this.options.isGizmoActive()) {
      return;
    }

    const gizmo = this.options.getGizmoHover();

    if (gizmo === "move-handle" || gizmo === "handle") {
      this.setCursor("pointer");
      return;
    }

    this.setRay(point.clientX, point.clientY);
    const started = performance.now();
    const objectId = this.options.pick(this.raycaster);
    this.slowPick = performance.now() - started > HOVER_PICK_SLOW_MS;
    this.setCursor(
      objectId && !this.options.getObject(objectId)?.locked ? "move" : "",
    );
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
