/**
 * SlicyWeb
 * Scale Gizmo
 *
 * Handles of the Scale mode (GUI_SPEC.md, Scale Gizmo; lot 103, decisions
 * of Noam Q4 A and Q5 B), drawn by SlicyWeb, like the Move arrows:
 * - one handle per axis of the object, X (red), Y (green), Z (blue), from
 *   the center of the object (or of the group); each handle changes the
 *   scale of the object along that axis (the Scale fields of the Transform
 *   section);
 * - the handle goes to the right, the front or the top of the plate
 *   (decision of Noam, Phase 6), from the axis of the plate closest to the
 *   axis of the object, also when the object is turned
 *   (scaleHandleSides, Q4 A);
 * - the handle (a small cube) is placed SCALE_HANDLE_GAP_PX after the edge
 *   of the box of the object seen from the camera, never on the object,
 *   the same size at every zoom; only the handle can be grabbed: a press
 *   on the line, or anywhere on the object, goes to the object and moves
 *   it freely on the plate (ObjectInteraction);
 * - a drag of a handle scales by the ratio of the distances from the
 *   center to the pointer, along the handle, at the start and now; with
 *   the lock of the scale closed (keepProportions), on the three axes;
 * - a handle almost along the direction of the camera is hidden;
 * - the handle under the pointer (or dragged) is drawn in yellow.
 * Several objects selected: the handles are in the axes of the plate and
 * always scale the group uniformly, around its center (decision of Noam,
 * Phase 6).
 *
 * placeScaleHandles(), hitScaleHandle(), scaleHandleSides() and
 * scaleFactor() are pure functions (tests); ScaleGizmo listens to the
 * pointer on the canvas and sends each change to onChange, which applies
 * it through TransformService (the only way to change a transform; it
 * places the object back on the plate).
 *
 * Domain: Viewport. Depends on the Scene Domain (bounds, transform).
 *
 * Based on:
 * - GUI_SPEC.md (Object Gizmos, Scale Gizmo)
 * - DATA_SCHEMA.md (Transform Rules)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import * as THREE from "three";

import {
  GIZMO_Z_COLOR,
  MOVE_HANDLE_HOVER_COLOR,
  MOVE_HANDLE_X_COLOR,
  MOVE_HANDLE_Y_COLOR,
  SCALE_HANDLE_GAP_PX,
  SCALE_HANDLE_GRAB_MARGIN_PX,
  SCALE_HANDLE_HIDE_COSINE,
  SCALE_HANDLE_LINE_RADIUS_PX,
  SCALE_HANDLE_SIZE_PX,
  SCALE_MIN_FACTOR,
} from "../constants/ViewportConstants";
import { scaleAroundPoint } from "../scene/ObjectTransform";

import {
  axisParameter,
  boxCorners,
  millimetersPerPixel,
  placeTip,
  segmentDistance,
  toScreen,
  viewDirection,
  type PlacedTip,
  type ScreenPoint,
} from "./MoveGizmo";

import type { Bounds, Vector3Mm } from "../scene/ObjectTransform";
import type { Object3D, Transform } from "../types/Object3D";

export type ScaleAxis = "X" | "Y" | "Z";

const SCALE_AXES: ScaleAxis[] = ["X", "Y", "Z"];

const AXIS_INDEX: Record<ScaleAxis, 0 | 1 | 2> = { X: 0, Y: 1, Z: 2 };

/**
 * Side of each handle on the plate (decision of Noam, Phase 6): right
 * (+X), front (-Y), top (+Z).
 */
export const SCALE_HANDLE_SIDE: Record<ScaleAxis, 1 | -1> = {
  X: 1,
  Y: -1,
  Z: 1,
};

/** Side of each handle in the axes of the object: +1 or -1 */
export type ScaleHandleSides = Record<ScaleAxis, 1 | -1>;

/** Axes of the plate, by priority when two are as close: top, right, front */
const PLATE_AXES: ScaleAxis[] = ["Z", "X", "Y"];

/**
 * Sides of the handles for an object turned by quaternion (lot 103, Q4
 * A): the handle of an axis of the object goes to the side of
 * SCALE_HANDLE_SIDE (right, front, top) of the plate axis closest to it.
 * Not turned: X right, Y front, Z top; turned by 180 degrees around X:
 * Z is still on top (and Y in front).
 */
export function scaleHandleSides(
  quaternion: THREE.Quaternion,
): ScaleHandleSides {
  const sides = { ...SCALE_HANDLE_SIDE };

  for (const axis of SCALE_AXES) {
    const direction = new THREE.Vector3()
      .setComponent(AXIS_INDEX[axis], 1)
      .applyQuaternion(quaternion);
    let closest: ScaleAxis = "Z";
    let best = -1;

    for (const plateAxis of PLATE_AXES) {
      const value = Math.abs(direction.getComponent(AXIS_INDEX[plateAxis]));

      // Equal within 1e-6: the first by priority is kept
      if (value > best + 1e-6) {
        best = value;
        closest = plateAxis;
      }
    }

    const component = direction.getComponent(AXIS_INDEX[closest]);
    sides[axis] = component * SCALE_HANDLE_SIDE[closest] < 0 ? -1 : 1;
  }

  return sides;
}

/** One handle placed for the camera of the frame */
export interface ScaleHandle extends PlacedTip {
  axis: ScaleAxis;
  /** Start of the line: center of the object or of the group */
  origin: THREE.Vector3;
  /** Direction of the handle in the scene (unit vector) */
  direction: THREE.Vector3;
  /** Edge of the cube of the handle, in millimeters */
  size: number;
  /** Radius of the line, in millimeters */
  lineRadius: number;
}

/**
 * Handles of the Scale gizmo for a camera: from center, along the axes of
 * the object turned by quaternion (identity: axes of the plate, for a
 * group), on the side of scaleHandleSides; the handle
 * SCALE_HANDLE_GAP_PX after the edge of the box seen from the camera.
 * Handles almost along the direction of the camera, or that cannot be
 * placed on the screen, are left out. The camera matrices must be up to
 * date.
 */
export function placeScaleHandles(
  camera: THREE.Camera,
  center: Vector3Mm,
  quaternion: THREE.Quaternion,
  bounds: Bounds,
  width: number,
  height: number,
): ScaleHandle[] {
  if (width <= 0 || height <= 0) {
    return [];
  }

  const origin = new THREE.Vector3(center.x, center.y, center.z);
  const corners = boxCorners(bounds, camera, width, height);

  if (!corners || !toScreen(origin, camera, width, height)) {
    return [];
  }

  const view = viewDirection(origin, camera);
  const sides = scaleHandleSides(quaternion);
  const handles: ScaleHandle[] = [];

  for (const axis of SCALE_AXES) {
    const direction = new THREE.Vector3()
      .setComponent(AXIS_INDEX[axis], sides[axis])
      .applyQuaternion(quaternion)
      .normalize();

    if (Math.abs(direction.dot(view)) > SCALE_HANDLE_HIDE_COSINE) {
      continue;
    }

    const tip = placeTip(
      camera,
      origin,
      direction,
      corners,
      width,
      height,
      SCALE_HANDLE_GAP_PX,
      SCALE_HANDLE_SIZE_PX,
    );

    if (!tip) {
      continue;
    }

    handles.push({
      axis,
      origin: origin.clone(),
      direction,
      ...tip,
      size:
        SCALE_HANDLE_SIZE_PX *
        millimetersPerPixel(
          tip.base.clone().lerp(tip.apex, 0.5),
          camera,
          height,
        ),
      lineRadius:
        SCALE_HANDLE_LINE_RADIUS_PX *
        millimetersPerPixel(origin, camera, height),
    });
  }

  return handles;
}

/**
 * Handle under a point of the screen (the cube and
 * SCALE_HANDLE_GRAB_MARGIN_PX around it; never the line), the nearest; or
 * null.
 */
export function hitScaleHandle(
  handles: ScaleHandle[],
  point: ScreenPoint,
): ScaleAxis | null {
  let best: ScaleAxis | null = null;
  let bestDistance = SCALE_HANDLE_SIZE_PX / 2 + SCALE_HANDLE_GRAB_MARGIN_PX;

  for (const handle of handles) {
    const distance = segmentDistance(
      point,
      handle.screenBase,
      handle.screenApex,
    );

    if (distance <= bestDistance) {
      best = handle.axis;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Factor of a drag: ratio of the distances from the center along the
 * handle, now and at the start; at least SCALE_MIN_FACTOR.
 */
export function scaleFactor(parameter: number, startParameter: number): number {
  if (!(startParameter > 0)) {
    return 1;
  }

  return Math.max(parameter / startParameter, SCALE_MIN_FACTOR);
}

/** Changes applied by the Scale gizmo, given by the transform gizmo */
export interface ScaleGizmoCallbacks {
  /** Applies transforms (one object or a group), by objectId; false: refused */
  onChange: (transforms: Record<string, Transform>) => boolean;
  /** Start and end of a drag: one action of the history */
  onGesture: (objectIds: string[], phase: "start" | "end") => void;
  /** True while a handle is dragged (camera controls disabled) */
  onDragging: (dragging: boolean) => void;
}

/** Meshes of one handle: line and cube */
interface HandleMeshes {
  line: THREE.Mesh;
  cube: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  color: number;
}

/** Drag of a handle in progress */
interface ScaleDrag {
  pointerId: number;
  axis: ScaleAxis;
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  startParameter: number;
  transforms: Record<string, Transform>;
}

const UP = new THREE.Vector3(0, 1, 0);

export class ScaleGizmo {
  private readonly scene: THREE.Scene;

  private camera: THREE.Camera;

  private readonly domElement: HTMLElement;

  private readonly callbacks: ScaleGizmoCallbacks;

  private readonly group = new THREE.Group();

  private readonly meshes: Record<ScaleAxis, HandleMeshes>;

  private readonly lineGeometry: THREE.CylinderGeometry;

  private readonly cubeGeometry: THREE.BoxGeometry;

  private readonly raycaster = new THREE.Raycaster();

  private enabled = false;

  /** Lock of the scale closed: every handle scales uniformly */
  private uniform = true;

  private objects: Object3D[] = [];

  private center: Vector3Mm | null = null;

  /** Rotation of the object (identity for a group) */
  private quaternion = new THREE.Quaternion();

  private bounds: Bounds | null = null;

  private handles: ScaleHandle[] = [];

  private hovered: ScaleAxis | null = null;

  private drag: ScaleDrag | null = null;

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !this.isShown() || this.drag) {
      return;
    }

    const axis = hitScaleHandle(this.handles, this.pointOf(event));
    const handle = this.handles.find((item) => item.axis === axis);

    if (!axis || !handle) {
      return;
    }

    const startParameter = axisParameter(
      this.rayOf(event),
      handle.origin,
      handle.direction,
    );

    if (startParameter === null || startParameter <= 0) {
      return;
    }

    this.drag = {
      pointerId: event.pointerId,
      axis,
      origin: handle.origin.clone(),
      direction: handle.direction.clone(),
      startParameter,
      transforms: Object.fromEntries(
        this.objects.map((object) => [object.objectId, object.transform]),
      ),
    };
    this.hovered = axis;
    this.domElement.setPointerCapture(event.pointerId);
    this.callbacks.onGesture(Object.keys(this.drag.transforms), "start");
    this.callbacks.onDragging(true);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;

    if (!drag) {
      this.hovered =
        this.isShown() && event.buttons === 0
          ? hitScaleHandle(this.handles, this.pointOf(event))
          : null;
      return;
    }

    if (event.pointerId !== drag.pointerId) {
      return;
    }

    const parameter = axisParameter(
      this.rayOf(event),
      drag.origin,
      drag.direction,
    );

    if (parameter === null) {
      return;
    }

    const factor = scaleFactor(parameter, drag.startParameter);
    const entries = Object.entries(drag.transforms);
    const transforms: Record<string, Transform> = {};

    if (entries.length > 1) {
      // A group is always scaled uniformly, around its center
      const pivot: Vector3Mm = {
        x: drag.origin.x,
        y: drag.origin.y,
        z: drag.origin.z,
      };

      for (const [objectId, transform] of entries) {
        transforms[objectId] = scaleAroundPoint(transform, factor, pivot);
      }
    } else {
      for (const [objectId, transform] of entries) {
        const { scale } = transform;
        const index = AXIS_INDEX[drag.axis];

        transforms[objectId] = {
          ...transform,
          scale: {
            x: scale.x * (this.uniform || index === 0 ? factor : 1),
            y: scale.y * (this.uniform || index === 1 ? factor : 1),
            z: scale.z * (this.uniform || index === 2 ? factor : 1),
          },
        };
      }
    }

    this.callbacks.onChange(transforms);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const drag = this.drag;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    this.drag = null;

    if (this.domElement.hasPointerCapture(event.pointerId)) {
      this.domElement.releasePointerCapture(event.pointerId);
    }

    this.callbacks.onGesture(Object.keys(drag.transforms), "end");
    this.callbacks.onDragging(false);
    this.hovered = hitScaleHandle(this.handles, this.pointOf(event));
  };

  private readonly onPointerLeave = (): void => {
    if (!this.drag) {
      this.hovered = null;
    }
  };

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    callbacks: ScaleGizmoCallbacks,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    // Unit line along +Y from its base, unit cube; placed at each frame
    this.lineGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
    this.lineGeometry.translate(0, 0.5, 0);
    this.cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    const handle = (axis: ScaleAxis, color: number): HandleMeshes => {
      // Drawn over the objects, as the other gizmos
      const material = new THREE.MeshBasicMaterial({
        color,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        transparent: true,
      });
      const line = new THREE.Mesh(this.lineGeometry, material);
      const cube = new THREE.Mesh(this.cubeGeometry, material);
      line.name = `scale-gizmo-line-${axis}`;
      cube.name = `scale-gizmo-handle-${axis}`;
      line.renderOrder = 1000;
      cube.renderOrder = 1000;
      this.group.add(line, cube);
      return { line, cube, material, color };
    };

    this.meshes = {
      X: handle("X", MOVE_HANDLE_X_COLOR),
      Y: handle("Y", MOVE_HANDLE_Y_COLOR),
      Z: handle("Z", GIZMO_Z_COLOR),
    };
    this.group.name = "scale-gizmo";
    this.group.visible = false;
    scene.add(this.group);

    domElement.addEventListener("pointerdown", this.onPointerDown);
    domElement.addEventListener("pointermove", this.onPointerMove);
    domElement.addEventListener("pointerup", this.onPointerUp);
    domElement.addEventListener("pointercancel", this.onPointerUp);
    domElement.addEventListener("pointerleave", this.onPointerLeave);
  }

  public setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /** Shown in the Scale mode only */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.hovered = null;
    }
  }

  /** Lock of the scale: closed, every handle scales uniformly */
  public setUniform(uniform: boolean): void {
    this.uniform = uniform;
  }

  /**
   * Objects under the gizmo (none: hidden), with the start of the handles
   * (center of the object or of the group), the rotation of the object
   * (identity for a group) and the box of the objects on the plate.
   */
  public attach(
    objects: Object3D[],
    center: Vector3Mm | null,
    quaternion: THREE.Quaternion,
    bounds: Bounds | null,
  ): void {
    this.objects = objects;
    this.center = center;
    this.quaternion = quaternion.clone();
    this.bounds = bounds;

    if (!this.isShown()) {
      this.hovered = null;
    }
  }

  /** True while a handle is dragged */
  public isDragging(): boolean {
    return this.drag !== null;
  }

  /** True while the pointer is over a handle (or one is dragged) */
  public isHovered(): boolean {
    return this.hovered !== null;
  }

  /**
   * Places the handles for the camera of the frame; called at each frame,
   * before the scene is drawn.
   */
  public update(): void {
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;

    this.camera.updateMatrixWorld();
    this.handles =
      this.isShown() && this.center && this.bounds
        ? placeScaleHandles(
            this.camera,
            this.center,
            this.quaternion,
            this.bounds,
            width,
            height,
          )
        : [];

    this.group.visible = this.handles.length > 0;

    for (const axis of SCALE_AXES) {
      const meshes = this.meshes[axis];
      const handle = this.handles.find((item) => item.axis === axis);

      meshes.line.visible = Boolean(handle);
      meshes.cube.visible = Boolean(handle);
      meshes.material.color.setHex(
        this.hovered === axis ? MOVE_HANDLE_HOVER_COLOR : meshes.color,
      );

      if (!handle) {
        continue;
      }

      const turn = new THREE.Quaternion().setFromUnitVectors(
        UP,
        handle.direction,
      );

      meshes.line.position.copy(handle.origin);
      meshes.line.quaternion.copy(turn);
      meshes.line.scale.set(
        handle.lineRadius,
        handle.base.distanceTo(handle.origin),
        handle.lineRadius,
      );

      meshes.cube.position.copy(handle.base).lerp(handle.apex, 0.5);
      meshes.cube.quaternion.copy(turn);
      meshes.cube.scale.setScalar(handle.size);
    }
  }

  /**
   * Middle of each handle on the screen, and the center (read by the
   * end-to-end tests); null when the gizmo is hidden.
   */
  public describe(): Record<string, ScreenPoint> | null {
    if (this.handles.length === 0) {
      return null;
    }

    const round = (value: number): number => Math.round(value * 10) / 10;
    const described: Record<string, ScreenPoint> = {};
    const origin = toScreen(
      this.handles[0].origin,
      this.camera,
      this.domElement.clientWidth,
      this.domElement.clientHeight,
    );

    if (origin) {
      described.origin = [round(origin[0]), round(origin[1])];
    }

    for (const handle of this.handles) {
      described[handle.axis] = [
        round((handle.screenBase[0] + handle.screenApex[0]) / 2),
        round((handle.screenBase[1] + handle.screenApex[1]) / 2),
      ];
    }

    return described;
  }

  public dispose(): void {
    const element = this.domElement;
    element.removeEventListener("pointerdown", this.onPointerDown);
    element.removeEventListener("pointermove", this.onPointerMove);
    element.removeEventListener("pointerup", this.onPointerUp);
    element.removeEventListener("pointercancel", this.onPointerUp);
    element.removeEventListener("pointerleave", this.onPointerLeave);
    this.scene.remove(this.group);
    this.lineGeometry.dispose();
    this.cubeGeometry.dispose();

    for (const axis of SCALE_AXES) {
      this.meshes[axis].material.dispose();
    }
  }

  private isShown(): boolean {
    return this.enabled && this.objects.length > 0;
  }

  private pointOf(event: PointerEvent): ScreenPoint {
    const rect = this.domElement.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  private rayOf(event: PointerEvent): THREE.Ray {
    const rect = this.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(pointer, this.camera);
    return this.raycaster.ray;
  }
}
