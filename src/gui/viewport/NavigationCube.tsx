/**
 * SlicyWeb
 * Navigation Cube
 *
 * Cube in the bottom corner of the 3D viewport, on the end side (bottom
 * right; bottom left in Hebrew, like the rest of the interface). It turns
 * with the camera; its six faces carry their translated names (Top,
 * Bottom, Front, Back, Left, Right), the Front face being on the side of
 * the tab of the build plate (-Y). A click on a face gives the same view
 * as the View menu (same framing, projection kept). The face under the
 * mouse is highlighted. The axes X (red), Y (green), Z (blue) start from
 * the front-left-bottom corner of the cube, with their letter
 * (GUI_SPEC.md, Navigation Cube, Axis Display).
 *
 * The cube itself is never mirrored: X stays on the right, as in the
 * 3D view.
 *
 * Part of the Viewport (mounted by Viewport.tsx), which calls update()
 * at each frame with the orientation of the camera; the layout comes
 * from NavigationCube.ts. The names of the faces come translated from
 * the GUI.
 *
 * For the end-to-end tests, data-camera-face gives the face the camera
 * looks straight at (absent otherwise).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Navigation Cube, Axis Display, Camera Views)
 * - DECISIONS.md (ADR-027)
 * - CLAUDE.md (Internationalization Rule)
 */

import { forwardRef, useImperativeHandle, useRef } from "react";
import type * as THREE from "three";

import {
  AXIS_X_COLOR,
  AXIS_Y_COLOR,
  AXIS_Z_COLOR,
  NAVIGATION_CUBE_AREA_PX,
  NAVIGATION_CUBE_AXIS_LENGTH_RATIO,
  NAVIGATION_CUBE_EDGE_PX,
  NAVIGATION_CUBE_LABEL_OFFSET_PX,
} from "../../constants/ViewportConstants";
import {
  CUBE_AXES,
  CUBE_FACES,
  computeCubeLayout,
  type CubeAxis,
  type CubeFace,
} from "../../renderer/NavigationCube";

const AXIS_COLORS: Record<CubeAxis, string> = {
  x: AXIS_X_COLOR,
  y: AXIS_Y_COLOR,
  z: AXIS_Z_COLOR,
};

const CENTER = NAVIGATION_CUBE_AREA_PX / 2;
const FACE_OFFSET = (NAVIGATION_CUBE_AREA_PX - NAVIGATION_CUBE_EDGE_PX) / 2;
const VIEW_BOX = `${-CENTER} ${-CENTER} ${NAVIGATION_CUBE_AREA_PX} ${NAVIGATION_CUBE_AREA_PX}`;

export interface NavigationCubeHandle {
  /** Turns the cube like the camera (camera.quaternion) */
  update: (cameraQuaternion: THREE.Quaternion) => void;
}

interface NavigationCubeProps {
  /** Names of the faces, already translated */
  labels: Record<CubeFace, string>;

  /** Click on a face: view of that face */
  onSelectFace: (face: CubeFace) => void;
}

/** Layer of the axes: behind the faces (hidden edges) or over them */
type AxisLayer = "back" | "front";

const NavigationCube = forwardRef<NavigationCubeHandle, NavigationCubeProps>(
  function NavigationCube({ labels, onSelectFace }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const faceRefs = useRef<Partial<Record<CubeFace, HTMLButtonElement>>>({});
    const lineRefs = useRef<
      Partial<Record<`${AxisLayer}-${CubeAxis}`, SVGLineElement>>
    >({});
    const letterRefs = useRef<Partial<Record<CubeAxis, SVGTextElement>>>({});
    const lastQuaternion = useRef<THREE.Quaternion | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        update: (cameraQuaternion) => {
          if (lastQuaternion.current?.equals(cameraQuaternion)) {
            return;
          }
          lastQuaternion.current = cameraQuaternion.clone();

          const layout = computeCubeLayout(cameraQuaternion, {
            edgePx: NAVIGATION_CUBE_EDGE_PX,
            axisLengthRatio: NAVIGATION_CUBE_AXIS_LENGTH_RATIO,
            labelOffsetPx: NAVIGATION_CUBE_LABEL_OFFSET_PX,
          });

          for (const face of CUBE_FACES) {
            const element = faceRefs.current[face];
            if (element) {
              element.style.transform = layout.faces[face].transform;
              element.style.display = layout.faces[face].visible ? "" : "none";
            }
          }

          for (const axis of CUBE_AXES) {
            const { from, to, label, front, shown } = layout.axes[axis];

            for (const layer of ["back", "front"] as const) {
              const line = lineRefs.current[`${layer}-${axis}`];
              if (line) {
                line.setAttribute("x1", from[0].toFixed(2));
                line.setAttribute("y1", from[1].toFixed(2));
                line.setAttribute("x2", to[0].toFixed(2));
                line.setAttribute("y2", to[1].toFixed(2));
                line.style.display =
                  shown && front === (layer === "front") ? "" : "none";
              }
            }

            const letter = letterRefs.current[axis];
            if (letter) {
              letter.setAttribute("x", label[0].toFixed(2));
              letter.setAttribute("y", label[1].toFixed(2));
              letter.style.display = shown ? "" : "none";
            }
          }

          const root = rootRef.current;
          if (root) {
            if (layout.cameraFace) {
              root.dataset.cameraFace = layout.cameraFace;
            } else {
              delete root.dataset.cameraFace;
            }
          }
        },
      }),
      [],
    );

    const axesLayer = (layer: AxisLayer) => (
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={NAVIGATION_CUBE_AREA_PX}
        height={NAVIGATION_CUBE_AREA_PX}
        viewBox={VIEW_BOX}
        aria-hidden="true"
      >
        {CUBE_AXES.map((axis) => (
          <line
            key={axis}
            ref={(element) => {
              lineRefs.current[`${layer}-${axis}`] = element ?? undefined;
            }}
            stroke={AXIS_COLORS[axis]}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
        {layer === "front" &&
          CUBE_AXES.map((axis) => (
            <text
              key={axis}
              ref={(element) => {
                letterRefs.current[axis] = element ?? undefined;
              }}
              fill={AXIS_COLORS[axis]}
              fontSize={12}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {axis.toUpperCase()}
            </text>
          ))}
      </svg>
    );

    return (
      <div
        ref={rootRef}
        data-navigation-cube=""
        className="pointer-events-none absolute end-3 bottom-3 z-10"
        style={{
          width: NAVIGATION_CUBE_AREA_PX,
          height: NAVIGATION_CUBE_AREA_PX,
        }}
      >
        {axesLayer("back")}
        {/* transform and display are set by update(), never by React */}
        {CUBE_FACES.map((face) => (
          <button
            key={face}
            ref={(element) => {
              faceRefs.current[face] = element ?? undefined;
            }}
            type="button"
            data-cube-face={face}
            onClick={() => onSelectFace(face)}
            className="pointer-events-auto absolute flex items-center justify-center overflow-hidden rounded-[3px] border border-border bg-card/95 text-xs leading-none text-foreground select-none hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
            style={{
              left: FACE_OFFSET,
              top: FACE_OFFSET,
              width: NAVIGATION_CUBE_EDGE_PX,
              height: NAVIGATION_CUBE_EDGE_PX,
            }}
          >
            {labels[face]}
          </button>
        ))}
        {axesLayer("front")}
      </div>
    );
  },
);

export default NavigationCube;
