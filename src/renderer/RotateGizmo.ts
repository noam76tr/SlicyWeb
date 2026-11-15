/**
 * SlicyWeb
 * Rotate Gizmo
 *
 * Rings of the Rotate mode (GUI_SPEC.md, Rotate Gizmo; lot 103, decisions
 * of Noam Q1 to Q3 A), drawn by SlicyWeb, as in Bambu Studio and
 * OrcaSlicer:
 * - one full ring per axis of the plate, X (red), Y (green), Z (blue),
 *   around the center of the object (or of the group);
 * - the ring is around the object: its radius is the distance from the
 *   center to the farthest corner of the box of the object, plus
 *   ROTATE_RING_GAP_PX, and at least ROTATE_RING_MIN_RADIUS_PX on the
 *   screen; the rings are large on a large object and small on a small
 *   one; the line keeps the same width at every zoom;
 * - a ring is grabbed on its line (with a margin), only outside the
 *   selected objects: where a ring passes over them, a press goes to the
 *   object and moves it freely on the plate (ObjectInteraction);
 * - a drag of a ring turns the objects around that axis of the plate,
 *   around the center, freely, by steps of ROTATION_SNAP_DEGREES while
 *   Shift is held; during the gesture the objects are not placed on the
 *   plate (live), on release they are (as in Bambu Studio and
 *   OrcaSlicer);
 * - the ring under the pointer (or dragged) is drawn in yellow.
 *
 * placeRotateRings(), hitRotateRing(), ringAngle() and snapAngle() are
 * pure functions (tests); RotateGizmo listens to the pointer on the
 * canvas and sends each change to onChange, which applies it through
 * TransformService (the only way to change a transform).
 *
 * Domain: Viewport. Depends on the Scene Domain (bounds, transform).
 *
 * Based on:
 * - GUI_SPEC.md (Object Gizmos, Rotate Gizmo)
 * - DATA_SCHEMA.md (Transform Rules)
 * - DECISIONS.md (ADR-028, ADR-031)
 */

import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

import {
  GIZMO_Z_COLOR,
  MOVE_HANDLE_HOVER_COLOR,
  MOVE_HANDLE_X_COLOR,
  MOVE_HANDLE_Y_COLOR,
  ROTATE_RING_EDGE_COSINE,
  ROTATE_RING_GAP_PX,
  ROTATE_RING_GRAB_MARGIN_PX,
  ROTATE_RING_MIN_RADIUS_PX,
  ROTATE_RING_SEGMENTS,
  ROTATE_RING_WIDTH_PX,
  ROTATION_SNAP_DEGREES,
} from "../constants/ViewportConstants";
import { rotateAroundPoint } from "../scene/ObjectTransform";

import {
  millimetersPerPixel,
  segmentDistance,
  toScreen,
  viewDirection,
  type ScreenPoint,
} from "./MoveGizmo";

import type { Bounds, Vector3Mm } from "../scene/ObjectTransform";
import type { Object3D, Transform } from "../types/Object3D";

export type RotateAxis = "X" | "Y" | "Z";

const ROTATE_AXES: RotateAxis[] = ["X", "Y", "Z"];

/**
 * Axis of each ring and the two directions of its plane (u, v), with
 * u x v = axis: the point at angle a is center + radius (u cos a + v sin a),
 * and a rotation by +b around the axis brings it to the angle a + b.
 */
const RING_BASIS: Record<
  RotateAxis,
  { axis: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3 }
> = {
  X: {
    axis: new THREE.Vector3(1, 0, 0),
    u: new THREE.Vector3(0, 1, 0),
    v: new THREE.Vector3(0, 0, 1),
  },
  Y: {
    axis: new THREE.Vector3(0, 1, 0),
    u: new THREE.Vector3(0, 0, 1),
    v: new THREE.Vector3(1, 0, 0),
  },
  Z: {
    axis: new THREE.Vector3(0, 0, 1),
    u: new THREE.Vector3(1, 0, 0),
    v: new THREE.Vector3(0, 1, 0),
  },
};

/** Axis of a ring, unit vector of the plate */
export function ringAxis(axis: RotateAxis): THREE.Vector3 {
  return RING_BASIS[axis].axis.clone();
}

/** Point of a ring at an angle (radians) */
export function ringPoint(
  axis: RotateAxis,
  center: THREE.Vector3,
  radius: number,
  angle: number,
): THREE.Vector3 {
  const { u, v } = RING_BASIS[axis];

  return center
    .clone()
    .addScaledVector(u, radius * Math.cos(angle))
    .addScaledVector(v, radius * Math.sin(angle));
}

/** One ring placed for the camera of the frame */
export interface RotateRing {
  axis: RotateAxis;
  /** Center of the object or of the group */
  center: THREE.Vector3;
  /** Radius in millimeters */
  radius: number;
  /** ROTATE_RING_SEGMENTS + 1 points of the ring on the screen (closed);
   * null for a point behind the camera */
  points: (ScreenPoint | null)[];
}

/**
 * Radius of the rings, in millimeters: the distance from center to the
 * farthest corner of the box, plus ROTATE_RING_GAP_PX, and at least
 * ROTATE_RING_MIN_RADIUS_PX, in pixels of the screen at the center.
 */
export function ringRadius(
  camera: THREE.Camera,
  center: Vector3Mm,
  bounds: Bounds,
  height: number,
): number {
  const origin = new THREE.Vector3(center.x, center.y, center.z);
  let farthest = 0;

  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        farthest = Math.max(
          farthest,
          origin.distanceTo(new THREE.Vector3(x, y, z)),
        );
      }
    }
  }

  const perPixel = millimetersPerPixel(origin, camera, height);

  return Math.max(
    farthest + ROTATE_RING_GAP_PX * perPixel,
    ROTATE_RING_MIN_RADIUS_PX * perPixel,
  );
}

/**
 * Rings of the Rotate gizmo for a camera: X, Y and Z around center
 * (ringRadius). width, height: size of the viewport in pixels. The
 * camera matrices must be up to date.
 */
export function placeRotateRings(
  camera: THREE.Camera,
  center: Vector3Mm,
  bounds: Bounds,
  width: number,
  height: number,
): RotateRing[] {
  if (width <= 0 || height <= 0) {
    return [];
  }

  const origin = new THREE.Vector3(center.x, center.y, center.z);

  if (!toScreen(origin, camera, width, height)) {
    return [];
  }

  const radius = ringRadius(camera, center, bounds, height);

  if (!(radius > 0) || !Number.isFinite(radius)) {
    return [];
  }

  return ROTATE_AXES.map((axis) => {
    const points: (ScreenPoint | null)[] = [];

    for (let i = 0; i <= ROTATE_RING_SEGMENTS; i += 1) {
      const angle = (i / ROTATE_RING_SEGMENTS) * Math.PI * 2;
      points.push(
        toScreen(ringPoint(axis, origin, radius, angle), camera, width, height),
      );
    }

    return { axis, center: origin.clone(), radius, points };
  });
}

/** A ring under a point of the screen */
export interface RingHit {
  axis: RotateAxis;
  /** Angle of the nearest point of the ring (radians) */
  angle: number;
  /** Distance on the screen to the line, in pixels */
  distance: number;
}

/**
 * Ring whose line is under a point of the screen (the line and
 * ROTATE_RING_GRAB_MARGIN_PX around it), the nearest; or null. The test
 * of the objects (Q3 A) is made by the gizmo.
 */
export function hitRotateRing(
  rings: RotateRing[],
  point: ScreenPoint,
): RingHit | null {
  let best: RingHit | null = null;
  const limit = ROTATE_RING_WIDTH_PX / 2 + ROTATE_RING_GRAB_MARGIN_PX;

  for (const ring of rings) {
    for (let i = 0; i < ring.points.length - 1; i += 1) {
      const a = ring.points[i];
      const b = ring.points[i + 1];

      if (!a || !b) {
        continue;
      }

      const distance = segmentDistance(point, a, b);

      if (distance <= limit && (!best || distance < best.distance)) {
        best = {
          axis: ring.axis,
          angle: ((i + 0.5) / ROTATE_RING_SEGMENTS) * Math.PI * 2,
          distance,
        };
      }
    }
  }

  return best;
}

/**
 * Angle (radians) around the axis of a ring of the point where a ray (the
 * pointer) crosses the plane of the ring; null when the ray is parallel
 * to the plane or crosses it behind the camera.
 */
export function ringAngle(
  ray: THREE.Ray,
  center: THREE.Vector3,
  axis: RotateAxis,
): number | null {
  const { axis: normal, u, v } = RING_BASIS[axis];
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, center);
  const point = ray.intersectPlane(plane, new THREE.Vector3());

  if (!point) {
    return null;
  }

  const offset = point.sub(center);

  if (offset.lengthSq() < 1e-12) {
    return null;
  }

  return Math.atan2(offset.dot(v), offset.dot(u));
}

/** Angle by steps of ROTATION_SNAP_DEGREES when snap is true */
export function snapAngle(angle: number, snap: boolean): number {
  if (!snap) {
    return angle;
  }

  const step = THREE.MathUtils.degToRad(ROTATION_SNAP_DEGREES);
  return Math.round(angle / step) * step;
}

/** Angle wrapped to ]-PI, PI] */
function wrapAngle(angle: number): number {
  let wrapped = angle % (Math.PI * 2);

  if (wrapped > Math.PI) {
    wrapped -= Math.PI * 2;
  } else if (wrapped <= -Math.PI) {
    wrapped += Math.PI * 2;
  }

  return wrapped;
}

/** Changes applied by the Rotate gizmo, given by the transform gizmo */
export interface RotateGizmoCallbacks {
  /**
   * Applies transforms (one object or a group), by objectId. live: step
   * of the gesture, not placed on the plate.
   */
  onChange: (transforms: Record<string, Transform>, live: boolean) => void;
  /** Start and end of a drag: one action of the history */
  onGesture: (objectIds: string[], phase: "start" | "end") => void;
  /** True while a ring is dragged (camera controls disabled) */
  onDragging: (dragging: boolean) => void;
  /**
   * True when one of the selected objects is under a point of the screen
   * (a press there goes to the object, Q3 A)
   */
  isOverObjects: (point: ScreenPoint) => boolean;
}

/** Line of one ring */
interface RingLine {
  line: Line2;
  material: LineMaterial;
  color: number;
}

/** Drag of a ring in progress */
interface RotateDrag {
  pointerId: number;
  axis: RotateAxis;
  center: THREE.Vector3;
  /** Plane mode: angle of the pointer in the plane at the last move */
  lastAngle: number | null;
  /** Angle turned since the start (radians, not snapped) */
  turned: number;
  /** Edge mode: pointer at the start, direction of the ring on the
   * screen, and pixels per radian */
  startPoint: ScreenPoint;
  tangent: ScreenPoint;
  pixelsPerRadian: number;
  /** Ring seen from the side: the pointer moves along the ring */
  edge: boolean;
  transforms: Record<string, Transform>;
  /** Transforms of the last step, placed on the plate on release */
  last: Record<string, Transform> | null;
}

export class RotateGizmo {
  private readonly scene: THREE.Scene;

  private camera: THREE.Camera;

  private readonly domElement: HTMLElement;

  private readonly callbacks: RotateGizmoCallbacks;

  private readonly group = new THREE.Group();

  private readonly lines: Record<RotateAxis, RingLine>;

  private readonly raycaster = new THREE.Raycaster();

  private enabled = false;

  private objects: Object3D[] = [];

  private center: Vector3Mm | null = null;

  private bounds: Bounds | null = null;

  private rings: RotateRing[] = [];

  private hovered: RotateAxis | null = null;

  private drag: RotateDrag | null = null;

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !this.isShown() || this.drag) {
      return;
    }

    const point = this.pointOf(event);
    const hit = this.hitAt(point);
    const ring = this.rings.find((item) => item.axis === hit?.axis);

    if (!hit || !ring) {
      return;
    }

    const center = ring.center.clone();
    const normal = ringAxis(hit.axis);
    const edge =
      Math.abs(normal.dot(viewDirection(center, this.camera))) <
      ROTATE_RING_EDGE_COSINE;

    // Direction of the ring on the screen at the grabbed point
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    const grabbed = ringPoint(hit.axis, center, ring.radius, hit.angle);
    const ahead = ringPoint(hit.axis, center, ring.radius, hit.angle + 1e-3);
    const screenGrabbed = toScreen(grabbed, this.camera, width, height);
    const screenAhead = toScreen(ahead, this.camera, width, height);
    let tangent: ScreenPoint = [1, 0];
    let pixelsPerRadian = 1;

    if (screenGrabbed && screenAhead) {
      const dx = screenAhead[0] - screenGrabbed[0];
      const dy = screenAhead[1] - screenGrabbed[1];
      const length = Math.hypot(dx, dy);

      if (length > 1e-9) {
        tangent = [dx / length, dy / length];
        pixelsPerRadian = length / 1e-3;
      }
    }

    this.drag = {
      pointerId: event.pointerId,
      axis: hit.axis,
      center,
      lastAngle: edge ? null : ringAngle(this.rayOf(event), center, hit.axis),
      turned: 0,
      startPoint: point,
      tangent,
      pixelsPerRadian,
      edge,
      transforms: Object.fromEntries(
        this.objects.map((object) => [object.objectId, object.transform]),
      ),
      last: null,
    };
    this.hovered = hit.axis;
    this.domElement.setPointerCapture(event.pointerId);
    this.callbacks.onGesture(Object.keys(this.drag.transforms), "start");
    this.callbacks.onDragging(true);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag;

    if (!drag) {
      this.hovered =
        this.isShown() && event.buttons === 0
          ? (this.hitAt(this.pointOf(event))?.axis ?? null)
          : null;
      return;
    }

    if (event.pointerId !== drag.pointerId) {
      return;
    }

    if (drag.edge) {
      const point = this.pointOf(event);
      drag.turned =
        ((point[0] - drag.startPoint[0]) * drag.tangent[0] +
          (point[1] - drag.startPoint[1]) * drag.tangent[1]) /
        drag.pixelsPerRadian;
    } else {
      const angle = ringAngle(this.rayOf(event), drag.center, drag.axis);

      if (angle === null) {
        return;
      }

      if (drag.lastAngle !== null) {
        drag.turned += wrapAngle(angle - drag.lastAngle);
      }

      drag.lastAngle = angle;
    }

    const rotation = new THREE.Quaternion().setFromAxisAngle(
      ringAxis(drag.axis),
      snapAngle(drag.turned, event.shiftKey),
    );
    const pivot: Vector3Mm = {
      x: drag.center.x,
      y: drag.center.y,
      z: drag.center.z,
    };
    const transforms: Record<string, Transform> = {};

    for (const [objectId, transform] of Object.entries(drag.transforms)) {
      transforms[objectId] = rotateAroundPoint(transform, rotation, pivot);
    }

    drag.last = transforms;
    this.callbacks.onChange(transforms, true);
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

    // End of the gesture: the objects are placed back on the plate
    if (drag.last) {
      this.callbacks.onChange(drag.last, false);
    }

    this.callbacks.onGesture(Object.keys(drag.transforms), "end");
    this.callbacks.onDragging(false);
    this.hovered = null;
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
    callbacks: RotateGizmoCallbacks,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    // Unit ring of each axis around the origin; placed at each frame
    const ring = (axis: RotateAxis, color: number): RingLine => {
      const positions: number[] = [];

      for (let i = 0; i <= ROTATE_RING_SEGMENTS; i += 1) {
        const angle = (i / ROTATE_RING_SEGMENTS) * Math.PI * 2;
        const point = ringPoint(axis, new THREE.Vector3(), 1, angle);
        positions.push(point.x, point.y, point.z);
      }

      const geometry = new LineGeometry();
      geometry.setPositions(positions);
      // Drawn over the objects, as the other gizmos; width in pixels
      const material = new LineMaterial({
        color,
        linewidth: ROTATE_RING_WIDTH_PX,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
      });
      const line = new Line2(geometry, material);
      line.name = `rotate-gizmo-ring-${axis}`;
      line.renderOrder = 1000;
      line.frustumCulled = false;
      this.group.add(line);
      return { line, material, color };
    };

    this.lines = {
      X: ring("X", MOVE_HANDLE_X_COLOR),
      Y: ring("Y", MOVE_HANDLE_Y_COLOR),
      Z: ring("Z", GIZMO_Z_COLOR),
    };
    this.group.name = "rotate-gizmo";
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

  /** Shown in the Rotate mode only */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.hovered = null;
    }
  }

  /**
   * Objects under the gizmo (none: hidden), with the center of the rings
   * (center of the object or of the group) and the box of the objects.
   * During a drag the rings stay where the drag started.
   */
  public attach(
    objects: Object3D[],
    center: Vector3Mm | null,
    bounds: Bounds | null,
  ): void {
    this.objects = objects;

    if (!this.drag) {
      this.center = center;
      this.bounds = bounds;
    }

    if (!this.isShown()) {
      this.hovered = null;
    }
  }

  /** True while a ring is dragged */
  public isDragging(): boolean {
    return this.drag !== null;
  }

  /** True while the pointer is over a ring (or one is dragged) */
  public isHovered(): boolean {
    return this.hovered !== null;
  }

  /**
   * Places the rings for the camera of the frame; called at each frame,
   * before the scene is drawn.
   */
  public update(): void {
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;

    this.camera.updateMatrixWorld();
    this.rings =
      this.isShown() && this.center && this.bounds
        ? placeRotateRings(this.camera, this.center, this.bounds, width, height)
        : [];

    this.group.visible = this.rings.length > 0;

    for (const axis of ROTATE_AXES) {
      const line = this.lines[axis];
      const ring = this.rings.find((item) => item.axis === axis);

      line.line.visible = Boolean(ring);
      line.material.color.setHex(
        this.hovered === axis ? MOVE_HANDLE_HOVER_COLOR : line.color,
      );
      line.material.resolution.set(width, height);

      if (ring) {
        line.line.position.copy(ring.center);
        line.line.scale.setScalar(ring.radius);
      }
    }
  }

  /**
   * For each ring, on the screen: the point farthest from the center
   * (outside the object) and the point nearest to it ("X-inner": where
   * the ring passes over a large object); and the center. Read by the
   * end-to-end tests; null when the gizmo is hidden.
   */
  public describe(): Record<string, ScreenPoint> | null {
    if (this.rings.length === 0) {
      return null;
    }

    const round = (value: number): number => Math.round(value * 10) / 10;
    const described: Record<string, ScreenPoint> = {};
    const origin = toScreen(
      this.rings[0].center,
      this.camera,
      this.domElement.clientWidth,
      this.domElement.clientHeight,
    );

    if (!origin) {
      return null;
    }

    described.origin = [round(origin[0]), round(origin[1])];

    for (const ring of this.rings) {
      let outer: ScreenPoint | null = null;
      let inner: ScreenPoint | null = null;
      let outerDistance = -1;
      let innerDistance = Infinity;

      for (const point of ring.points) {
        if (!point) {
          continue;
        }

        const distance = Math.hypot(point[0] - origin[0], point[1] - origin[1]);

        if (distance > outerDistance) {
          outerDistance = distance;
          outer = point;
        }

        if (distance < innerDistance) {
          innerDistance = distance;
          inner = point;
        }
      }

      if (outer && inner) {
        described[ring.axis] = [round(outer[0]), round(outer[1])];
        described[`${ring.axis}-inner`] = [round(inner[0]), round(inner[1])];
      }
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

    for (const axis of ROTATE_AXES) {
      this.lines[axis].line.geometry.dispose();
      this.lines[axis].material.dispose();
    }
  }

  private isShown(): boolean {
    return this.enabled && this.objects.length > 0;
  }

  /** Ring under a point, outside the selected objects (Q3 A) */
  private hitAt(point: ScreenPoint): RingHit | null {
    const hit = hitRotateRing(this.rings, point);

    return hit && !this.callbacks.isOverObjects(point) ? hit : null;
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
