/**
 * SlicyWeb
 * Navigation Cube
 *
 * Layout of the navigation cube of the 3D viewport (GUI_SPEC.md,
 * Navigation Cube): the cube turns with the camera, one face per view
 * preset, and the axes X, Y, Z start from its front-left-bottom corner
 * (GUI_SPEC.md, Axis Display).
 *
 * The cube is drawn by the GUI with HTML elements (one button per face,
 * so that the faces are translated, clickable and readable by a screen
 * reader). This module computes, from the orientation of the camera:
 * - the CSS transform of each face and whether it is turned towards the
 *   viewer;
 * - the ends of the axes on the screen, and whether each axis runs along
 *   a visible edge of the cube (drawn over the faces) or a hidden one
 *   (drawn behind them);
 * - the face the camera looks at, when it looks straight at one.
 *
 * Coordinates (ADR-027): Z up, X right, Y to the back; the Front face is
 * on the side -Y, the side of the tab of the build plate. The cube
 * shows only the rotation of the camera (orthographic, whatever the
 * projection of the viewport).
 *
 * Screen coordinates (CSS): pixels from the center of the cube, x to
 * the right, y down, z towards the viewer.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Navigation Cube, Axis Display, Camera Views)
 * - DECISIONS.md (ADR-027)
 */

import * as THREE from "three";

/** Faces of the cube: the view presets of the View menu, except Isometric */
export type CubeFace = "top" | "bottom" | "front" | "back" | "left" | "right";

/** Faces in the order of the View menu (GUI_SPEC.md, Camera Views) */
export const CUBE_FACES: readonly CubeFace[] = [
  "top",
  "bottom",
  "front",
  "back",
  "left",
  "right",
];

export type CubeAxis = "x" | "y" | "z";

export const CUBE_AXES: readonly CubeAxis[] = ["x", "y", "z"];

/** Point on the screen, in pixels from the center of the cube */
export type ScreenPoint = [number, number];

export interface CubeFaceLayout {
  /** True when the face is turned towards the viewer */
  visible: boolean;

  /** CSS transform of the face (matrix3d), its element centered on the cube */
  transform: string;
}

export interface CubeAxisLayout {
  from: ScreenPoint;
  to: ScreenPoint;

  /** Position of the letter, beyond the end of the axis */
  label: ScreenPoint;

  /** True when the axis runs along a visible edge: drawn over the faces */
  front: boolean;

  /** False when the axis is seen end-on (a point): neither line nor letter */
  shown: boolean;
}

export interface CubeLayout {
  faces: Record<CubeFace, CubeFaceLayout>;
  axes: Record<CubeAxis, CubeAxisLayout>;

  /** Face the camera looks straight at (within about 1°), or null */
  cameraFace: CubeFace | null;
}

/**
 * Frame of a face, in world directions: right and down as read when the
 * face is seen from its view preset (CameraManager, VIEW_DIRECTIONS),
 * and the outward normal.
 */
interface FaceFrame {
  right: THREE.Vector3;
  down: THREE.Vector3;
  normal: THREE.Vector3;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const FACE_FRAMES: Record<CubeFace, FaceFrame> = {
  // Top view: X to the right, Y (back) up on the screen
  top: { right: v(1, 0, 0), down: v(0, -1, 0), normal: v(0, 0, 1) },
  // Bottom view (from under): X to the right, Y (back) down on the screen
  bottom: { right: v(1, 0, 0), down: v(0, 1, 0), normal: v(0, 0, -1) },
  // Side views: Z up on the screen
  front: { right: v(1, 0, 0), down: v(0, 0, -1), normal: v(0, -1, 0) },
  back: { right: v(-1, 0, 0), down: v(0, 0, -1), normal: v(0, 1, 0) },
  left: { right: v(0, -1, 0), down: v(0, 0, -1), normal: v(-1, 0, 0) },
  right: { right: v(0, 1, 0), down: v(0, 0, -1), normal: v(1, 0, 0) },
};

/** Directions of the axes, in world coordinates */
const AXIS_DIRECTIONS: Record<CubeAxis, THREE.Vector3> = {
  x: v(1, 0, 0),
  y: v(0, 1, 0),
  z: v(0, 0, 1),
};

/** The two faces that share the edge of each axis, at the corner -X -Y -Z */
const AXIS_EDGE_FACES: Record<CubeAxis, [CubeFace, CubeFace]> = {
  x: ["front", "bottom"],
  y: ["left", "bottom"],
  z: ["left", "front"],
};

/** Cosine of about 1°: the camera looks straight at a face */
const STRAIGHT_VIEW_COS = 0.9998;

/** Below this length on the screen, in pixels, an axis is seen end-on */
const AXIS_MIN_SCREEN_PX = 4;

/** Below this, a face is seen edge-on: not shown (the Top and Bottom views are tilted by 0.0001) */
const VISIBLE_EPSILON = 1e-3;

export interface CubeLayoutOptions {
  /** Edge of the cube, in pixels */
  edgePx: number;

  /** Length of each axis from the corner, as a multiple of the edge */
  axisLengthRatio: number;

  /** Distance of the letter beyond the end of its axis, in pixels */
  labelOffsetPx: number;
}

/** CSS number: fixed precision, never "-0" */
function css(value: number): string {
  const rounded = Number(value.toFixed(5));
  return String(rounded === 0 ? 0 : rounded);
}

/**
 * Layout of the cube for a camera orientation (camera.quaternion: from
 * the camera frame to the world).
 */
export function computeCubeLayout(
  cameraQuaternion: THREE.Quaternion,
  { edgePx, axisLengthRatio, labelOffsetPx }: CubeLayoutOptions,
): CubeLayout {
  const toCamera = cameraQuaternion.clone().invert();

  // World direction → screen (CSS): camera frame, then y flipped
  const toScreen = (world: THREE.Vector3): THREE.Vector3 => {
    const point = world.clone().applyQuaternion(toCamera);
    point.y = -point.y;
    return point;
  };

  const half = edgePx / 2;
  const faces = {} as Record<CubeFace, CubeFaceLayout>;

  for (const face of CUBE_FACES) {
    const frame = FACE_FRAMES[face];
    const right = toScreen(frame.right);
    const down = toScreen(frame.down);
    const normal = toScreen(frame.normal);
    const offset = normal.clone().multiplyScalar(half);

    const values = [
      right.x,
      right.y,
      right.z,
      0,
      down.x,
      down.y,
      down.z,
      0,
      normal.x,
      normal.y,
      normal.z,
      0,
      offset.x,
      offset.y,
      offset.z,
      1,
    ];

    faces[face] = {
      visible: normal.z > VISIBLE_EPSILON,
      transform: `matrix3d(${values.map(css).join(", ")})`,
    };
  }

  const corner = toScreen(v(-1, -1, -1)).multiplyScalar(half);
  const length = edgePx * axisLengthRatio;
  const axes = {} as Record<CubeAxis, CubeAxisLayout>;

  for (const axis of CUBE_AXES) {
    const direction = toScreen(AXIS_DIRECTIONS[axis]);
    const end = corner.clone().addScaledVector(direction, length);
    const flat = new THREE.Vector2(direction.x, direction.y);
    const label =
      flat.lengthSq() > 0
        ? new THREE.Vector2(end.x, end.y).addScaledVector(
            flat.normalize(),
            labelOffsetPx,
          )
        : new THREE.Vector2(end.x, end.y);
    const [faceA, faceB] = AXIS_EDGE_FACES[axis];

    axes[axis] = {
      from: [corner.x, corner.y],
      to: [end.x, end.y],
      label: [label.x, label.y],
      front: faces[faceA].visible || faces[faceB].visible,
      shown:
        Math.hypot(end.x - corner.x, end.y - corner.y) >= AXIS_MIN_SCREEN_PX,
    };
  }

  // Direction from the target to the camera, in world coordinates
  const back = v(0, 0, 1).applyQuaternion(cameraQuaternion);
  const cameraFace =
    CUBE_FACES.find(
      (face) => FACE_FRAMES[face].normal.dot(back) >= STRAIGHT_VIEW_COS,
    ) ?? null;

  return { faces, axes, cameraFace };
}
