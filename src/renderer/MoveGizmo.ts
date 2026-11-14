/**
 * SlicyWeb
 * Move Gizmo
 *
 * Arrows of the Move mode (GUI_SPEC.md, Move Gizmo; lot 102, decisions of
 * Noam Q1 to Q4 A), drawn by SlicyWeb, as in Bambu Studio and
 * OrcaSlicer:
 * - one arrow per axis of the plate, toward +X (red) and +Y (green), from
 *   the center of the object (or of the group); a drag of its tip moves
 *   the object along that axis only, in both directions;
 * - the tip is placed MOVE_HANDLE_GAP_PX after the edge of the box of the
 *   object seen from the camera, never on the object; the sizes are in
 *   pixels of the screen, the same at every zoom;
 * - only the tip can be grabbed (with a margin): a press on the line, or
 *   anywhere on the object, goes to the object and moves it freely on the
 *   plate (ObjectInteraction);
 * - an arrow almost along the direction of the camera is hidden;
 * - the arrow under the pointer is drawn in yellow.
 *
 * placeMoveHandles(), hitMoveHandle() and axisParameter() are pure
 * functions (tests); MoveGizmo listens to the pointer on the canvas and
 * sends each change to onChange, which applies it through
 * TransformService (the only way to change a transform).
 *
 * Domain: Viewport. Depends on the Scene Domain (bounds, transform).
 *
 * Based on:
 * - GUI_SPEC.md (Object Gizmos, Move Gizmo)
 * - DATA_SCHEMA.md (Transform Rules)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import * as THREE from "three";

import {
  MOVE_HANDLE_GAP_PX,
  MOVE_HANDLE_GRAB_MARGIN_PX,
  MOVE_HANDLE_HIDE_COSINE,
  MOVE_HANDLE_HOVER_COLOR,
  MOVE_HANDLE_LINE_RADIUS_PX,
  MOVE_HANDLE_TIP_LENGTH_PX,
  MOVE_HANDLE_TIP_RADIUS_PX,
  MOVE_HANDLE_X_COLOR,
  MOVE_HANDLE_Y_COLOR,
} from "../constants/ViewportConstants";

import type { Bounds, Vector3Mm } from "../scene/ObjectTransform";
import type { Object3D, Transform } from "../types/Object3D";

export type MoveAxis = "X" | "Y";

/** Point of the viewport, in pixels from its top left corner */
export type ScreenPoint = [number, number];

const AXES: Record<MoveAxis, THREE.Vector3> = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
};

/** One arrow placed for the camera of the frame */
export interface MoveHandle {
  axis: MoveAxis;
  /** Start of the line: center of the object or of the group */
  origin: THREE.Vector3;
  /** Base and point of the tip, in millimeters */
  base: THREE.Vector3;
  apex: THREE.Vector3;
  /** Radius of the base of the tip, in millimeters */
  radius: number;
  /** Radius of the line, in millimeters */
  lineRadius: number;
  /** Base and point of the tip on the screen */
  screenBase: ScreenPoint;
  screenApex: ScreenPoint;
}

/** Point of the viewport of a point of the scene; null behind the camera */
function toScreen(
  point: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number,
): ScreenPoint | null {
  const projected = point.clone().project(camera);

  if (
    !Number.isFinite(projected.x) ||
    !Number.isFinite(projected.y) ||
    projected.z < -1 ||
    projected.z > 1
  ) {
    return null;
  }

  return [((projected.x + 1) / 2) * width, ((1 - projected.y) / 2) * height];
}

/**
 * Distance, along the direction dir (unit vector), from start to the
 * point where the ray leaves the outline of the points (their convex
 * hull, which contains start): the farthest crossing of the ray with a
 * segment between two of the points.
 */
function exitDistance(
  start: ScreenPoint,
  dir: ScreenPoint,
  points: ScreenPoint[],
): number {
  let farthest = 0;

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const [ax, ay] = points[i];
      const ex = points[j][0] - ax;
      const ey = points[j][1] - ay;
      const denominator = dir[0] * ey - dir[1] * ex;

      if (Math.abs(denominator) < 1e-9) {
        continue;
      }

      const sx = ax - start[0];
      const sy = ay - start[1];
      const t = (sx * ey - sy * ex) / denominator;
      const u = (sx * dir[1] - sy * dir[0]) / denominator;

      if (t > farthest && u >= 0 && u <= 1) {
        farthest = t;
      }
    }
  }

  return farthest;
}

/** Millimeters per pixel of the screen at a point of the scene */
function millimetersPerPixel(
  point: THREE.Vector3,
  camera: THREE.Camera,
  height: number,
): number {
  if (camera instanceof THREE.OrthographicCamera) {
    return (camera.top - camera.bottom) / camera.zoom / height;
  }

  if (camera instanceof THREE.PerspectiveCamera) {
    const forward = camera.getWorldDirection(new THREE.Vector3());
    const depth = point.clone().sub(camera.position).dot(forward);
    const visible =
      2 *
      Math.max(depth, 0) *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return visible / camera.zoom / height;
  }

  return 0;
}

/** Direction from the camera to a point of the scene */
function viewDirection(
  point: THREE.Vector3,
  camera: THREE.Camera,
): THREE.Vector3 {
  if (camera instanceof THREE.PerspectiveCamera) {
    return point.clone().sub(camera.position).normalize();
  }

  return camera.getWorldDirection(new THREE.Vector3());
}

/**
 * Arrows of the Move gizmo for a camera: from center, toward +X and +Y,
 * the tip MOVE_HANDLE_GAP_PX after the edge of the box seen from the
 * camera. Arrows almost along the direction of the camera, or that cannot
 * be placed on the screen, are left out. width, height: size of the
 * viewport in pixels. The camera matrices must be up to date.
 */
export function placeMoveHandles(
  camera: THREE.Camera,
  center: Vector3Mm,
  bounds: Bounds,
  width: number,
  height: number,
): MoveHandle[] {
  if (width <= 0 || height <= 0) {
    return [];
  }

  const origin = new THREE.Vector3(center.x, center.y, center.z);
  const start = toScreen(origin, camera, width, height);
  const corners: ScreenPoint[] = [];

  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = toScreen(
          new THREE.Vector3(x, y, z),
          camera,
          width,
          height,
        );

        if (!corner) {
          return [];
        }

        corners.push(corner);
      }
    }
  }

  if (!start) {
    return [];
  }

  const view = viewDirection(origin, camera);
  const handles: MoveHandle[] = [];

  for (const axis of ["X", "Y"] as const) {
    const direction = AXES[axis];

    if (Math.abs(direction.dot(view)) > MOVE_HANDLE_HIDE_COSINE) {
      continue;
    }

    // Direction of the axis on the screen
    const step = toScreen(
      origin.clone().addScaledVector(direction, 1e-3),
      camera,
      width,
      height,
    );

    if (!step) {
      continue;
    }

    const length = Math.hypot(step[0] - start[0], step[1] - start[1]);

    if (length < 1e-9) {
      continue;
    }

    const dir: ScreenPoint = [
      (step[0] - start[0]) / length,
      (step[1] - start[1]) / length,
    ];

    /** Distance on the screen of the point of the axis at t mm */
    const screenDistance = (t: number): number | null => {
      const point = toScreen(
        origin.clone().addScaledVector(direction, t),
        camera,
        width,
        height,
      );

      return point
        ? (point[0] - start[0]) * dir[0] + (point[1] - start[1]) * dir[1]
        : null;
    };

    /** Millimeters along the axis for a distance on the screen */
    const parameterAt = (distance: number): number | null => {
      let low = 0;
      let high = 1;

      for (;;) {
        const reached = screenDistance(high);

        if (reached === null || high > 1e7) {
          return null;
        }

        if (reached >= distance) {
          break;
        }

        low = high;
        high *= 2;
      }

      for (let i = 0; i < 50; i += 1) {
        const middle = (low + high) / 2;
        const reached = screenDistance(middle);

        if (reached !== null && reached >= distance) {
          high = middle;
        } else {
          low = middle;
        }
      }

      return high;
    };

    const baseDistance = exitDistance(start, dir, corners) + MOVE_HANDLE_GAP_PX;
    const baseParameter = parameterAt(baseDistance);
    const apexParameter = parameterAt(baseDistance + MOVE_HANDLE_TIP_LENGTH_PX);

    if (baseParameter === null || apexParameter === null) {
      continue;
    }

    const base = origin.clone().addScaledVector(direction, baseParameter);
    const apex = origin.clone().addScaledVector(direction, apexParameter);
    const screenBase = toScreen(base, camera, width, height);
    const screenApex = toScreen(apex, camera, width, height);

    if (!screenBase || !screenApex) {
      continue;
    }

    const perPixel = millimetersPerPixel(base, camera, height);

    handles.push({
      axis,
      origin: origin.clone(),
      base,
      apex,
      radius: MOVE_HANDLE_TIP_RADIUS_PX * perPixel,
      lineRadius:
        MOVE_HANDLE_LINE_RADIUS_PX *
        millimetersPerPixel(origin, camera, height),
      screenBase,
      screenApex,
    });
  }

  return handles;
}

/**
 * Arrow whose tip is under a point of the screen (the tip and
 * MOVE_HANDLE_GRAB_MARGIN_PX around it; never the line), the nearest; or
 * null.
 */
export function hitMoveHandle(
  handles: MoveHandle[],
  point: ScreenPoint,
): MoveAxis | null {
  let best: MoveAxis | null = null;
  let bestDistance = MOVE_HANDLE_TIP_RADIUS_PX + MOVE_HANDLE_GRAB_MARGIN_PX;

  for (const handle of handles) {
    const [ax, ay] = handle.screenBase;
    const ex = handle.screenApex[0] - ax;
    const ey = handle.screenApex[1] - ay;
    const squared = ex * ex + ey * ey;
    const u =
      squared > 0
        ? Math.min(
            1,
            Math.max(
              0,
              ((point[0] - ax) * ex + (point[1] - ay) * ey) / squared,
            ),
          )
        : 0;
    const distance = Math.hypot(
      point[0] - (ax + u * ex),
      point[1] - (ay + u * ey),
    );

    if (distance <= bestDistance) {
      best = handle.axis;
      bestDistance = distance;
    }
  }

  return best;
}

/**
 * Position along an axis (line through origin, unit direction) of the
 * point of the axis nearest to a ray (the pointer); null when the ray is
 * parallel to the axis.
 */
export function axisParameter(
  ray: THREE.Ray,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
): number | null {
  const w = origin.clone().sub(ray.origin);
  const b = direction.dot(ray.direction);
  const denominator = 1 - b * b;

  if (denominator < 1e-6) {
    return null;
  }

  const d = direction.dot(w);
  const e = ray.direction.dot(w);

  return (b * e - d) / denominator;
}

/** Changes applied by the Move gizmo, given by the transform gizmo */
export interface MoveGizmoCallbacks {
  /** Applies transforms (one object or a group), by objectId */
  onChange: (transforms: Record<string, Transform>) => void;
  /** Start and end of a drag: one action of the history */
  onGesture: (objectIds: string[], phase: "start" | "end") => void;
  /** True while a tip is dragged (camera controls disabled) */
  onDragging: (dragging: boolean) => void;
}

/** Meshes of one arrow: line and tip */
interface ArrowMeshes {
  line: THREE.Mesh;
  tip: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  color: number;
}

/** Drag of a tip in progress */
interface MoveDrag {
  pointerId: number;
  axis: MoveAxis;
  origin: THREE.Vector3;
  startParameter: number;
  transforms: Record<string, Transform>;
}

const UP = new THREE.Vector3(0, 1, 0);

export class MoveGizmo {
  private readonly scene: THREE.Scene;

  private camera: THREE.Camera;

  private readonly domElement: HTMLElement;

  private readonly callbacks: MoveGizmoCallbacks;

  private readonly group = new THREE.Group();

  private readonly arrows: Record<MoveAxis, ArrowMeshes>;

  private readonly lineGeometry: THREE.CylinderGeometry;

  private readonly tipGeometry: THREE.ConeGeometry;

  private readonly raycaster = new THREE.Raycaster();

  private enabled = false;

  private objects: Object3D[] = [];

  private center: Vector3Mm | null = null;

  private bounds: Bounds | null = null;

  private handles: MoveHandle[] = [];

  private hovered: MoveAxis | null = null;

  private drag: MoveDrag | null = null;

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !this.isShown() || this.drag) {
      return;
    }

    const axis = hitMoveHandle(this.handles, this.pointOf(event));
    const handle = this.handles.find((item) => item.axis === axis);

    if (!axis || !handle) {
      return;
    }

    const startParameter = axisParameter(
      this.rayOf(event),
      handle.origin,
      AXES[axis],
    );

    if (startParameter === null) {
      return;
    }

    this.drag = {
      pointerId: event.pointerId,
      axis,
      origin: handle.origin.clone(),
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
          ? hitMoveHandle(this.handles, this.pointOf(event))
          : null;
      return;
    }

    if (event.pointerId !== drag.pointerId) {
      return;
    }

    const parameter = axisParameter(
      this.rayOf(event),
      drag.origin,
      AXES[drag.axis],
    );

    if (parameter === null) {
      return;
    }

    const delta = parameter - drag.startParameter;
    const transforms: Record<string, Transform> = {};

    for (const [objectId, transform] of Object.entries(drag.transforms)) {
      transforms[objectId] = {
        ...transform,
        position: {
          ...transform.position,
          x: transform.position.x + (drag.axis === "X" ? delta : 0),
          y: transform.position.y + (drag.axis === "Y" ? delta : 0),
        },
      };
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
    this.hovered = hitMoveHandle(this.handles, this.pointOf(event));
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
    callbacks: MoveGizmoCallbacks,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    // Unit line and tip along +Y, from their base; placed at each frame
    this.lineGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
    this.lineGeometry.translate(0, 0.5, 0);
    this.tipGeometry = new THREE.ConeGeometry(1, 1, 16);
    this.tipGeometry.translate(0, 0.5, 0);

    const arrow = (axis: MoveAxis, color: number): ArrowMeshes => {
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
      const tip = new THREE.Mesh(this.tipGeometry, material);
      line.name = `move-gizmo-line-${axis}`;
      tip.name = `move-gizmo-tip-${axis}`;
      line.renderOrder = 1000;
      tip.renderOrder = 1000;
      this.group.add(line, tip);
      return { line, tip, material, color };
    };

    this.arrows = {
      X: arrow("X", MOVE_HANDLE_X_COLOR),
      Y: arrow("Y", MOVE_HANDLE_Y_COLOR),
    };
    this.group.name = "move-gizmo";
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

  /** Shown in the Move mode only */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.hovered = null;
    }
  }

  /**
   * Objects under the gizmo (none: hidden), with the start of the arrows
   * (center of the object or of the group) and the box of the objects on
   * the plate.
   */
  public attach(
    objects: Object3D[],
    center: Vector3Mm | null,
    bounds: Bounds | null,
  ): void {
    this.objects = objects;
    this.center = center;
    this.bounds = bounds;

    if (!this.isShown()) {
      this.hovered = null;
    }
  }

  /** True while a tip is dragged */
  public isDragging(): boolean {
    return this.drag !== null;
  }

  /** True while the pointer is over a tip (or one is dragged) */
  public isHovered(): boolean {
    return this.hovered !== null;
  }

  /**
   * Places the arrows for the camera of the frame; called at each frame,
   * before the scene is drawn.
   */
  public update(): void {
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;

    this.camera.updateMatrixWorld();
    this.handles =
      this.isShown() && this.center && this.bounds
        ? placeMoveHandles(this.camera, this.center, this.bounds, width, height)
        : [];

    this.group.visible = this.handles.length > 0;

    for (const axis of ["X", "Y"] as const) {
      const arrow = this.arrows[axis];
      const handle = this.handles.find((item) => item.axis === axis);

      arrow.line.visible = Boolean(handle);
      arrow.tip.visible = Boolean(handle);
      arrow.material.color.setHex(
        this.hovered === axis ? MOVE_HANDLE_HOVER_COLOR : arrow.color,
      );

      if (!handle) {
        continue;
      }

      const turn = new THREE.Quaternion().setFromUnitVectors(UP, AXES[axis]);

      arrow.line.position.copy(handle.origin);
      arrow.line.quaternion.copy(turn);
      arrow.line.scale.set(
        handle.lineRadius,
        handle.base.distanceTo(handle.origin),
        handle.lineRadius,
      );

      arrow.tip.position.copy(handle.base);
      arrow.tip.quaternion.copy(turn);
      arrow.tip.scale.set(
        handle.radius,
        handle.apex.distanceTo(handle.base),
        handle.radius,
      );
    }
  }

  /**
   * Middle of each tip on the screen, and the start of the arrows
   * (read by the end-to-end tests); null when the gizmo is hidden.
   */
  public describe(): Record<string, ScreenPoint> | null {
    if (this.handles.length === 0) {
      return null;
    }

    const round = (value: number): number => Math.round(value * 10) / 10;
    const described: Record<string, ScreenPoint> = {};
    const first = this.handles[0];
    const origin = toScreen(
      first.origin,
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
    this.tipGeometry.dispose();
    this.arrows.X.material.dispose();
    this.arrows.Y.material.dispose();
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
