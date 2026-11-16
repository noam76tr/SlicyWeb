/**
 * SlicyWeb
 * Viewport Constants
 *
 * Coordinate system of the 3D viewport (DECISIONS.md, ADR-027):
 * - units: millimeters (DATA_SCHEMA.md, Units);
 * - Z axis up, X axis to the right, Y axis to the back;
 * - origin (0, 0, 0) at the center of the build plate, Z = 0 on the
 *   plate surface.
 *
 * Based on:
 * - GUI_SPEC.md (3D Viewport, Coordinate Grid, Axis Display, Color Philosophy)
 * - DECISIONS.md (ADR-027)
 */

/** Viewport background (GUI_SPEC.md, Color Philosophy: Viewport #252526) */
export const VIEWPORT_BACKGROUND_COLOR = 0x252526;

/**
 * Side of the square workspace shown by the grid when no printer is
 * selected (no build plate is displayed then), in millimeters.
 */
export const DEFAULT_WORKSPACE_SIZE_MM = 400;

/**
 * Height used to frame the workspace when no printer is selected,
 * in millimeters.
 */
export const DEFAULT_WORKSPACE_HEIGHT_MM = 200;

/** Grid line colors */
export const GRID_MINOR_COLOR = 0x3a3a3c;
export const GRID_MAJOR_COLOR = 0x505054;

/**
 * Possible spacings between minor grid lines, in millimeters.
 * The grid uses the smallest spacing whose lines stay at least
 * GRID_MIN_PIXEL_SPACING pixels apart (GUI_SPEC.md: adaptive spacing).
 * One line out of GRID_MAJOR_EVERY is a major line.
 */
export const GRID_SPACINGS_MM = [1, 2, 5, 10, 20, 50, 100] as const;
export const GRID_MIN_PIXEL_SPACING = 10;
export const GRID_MAJOR_EVERY = 5;

/**
 * Build plate, drawn as a magnetic print sheet when a printer is
 * selected: dark sheet with rounded corners, a light grain texture and
 * a rim; a tab centered on the front edge (Y negative, ADR-028) shows
 * the front of the printer.
 * BUILD_PLATE_COLOR: mean color of the sheet; BUILD_PLATE_GRAIN: maximum
 * change of its grain (0 to 255), one texture tile every
 * BUILD_PLATE_GRAIN_TILE_MM.
 * Corner radius and tab: ratios of the smaller plate side, between
 * their minimum and maximum in millimeters.
 */
export const BUILD_PLATE_COLOR = 0x1a1a1d;
export const BUILD_PLATE_GRAIN = 12;
export const BUILD_PLATE_GRAIN_TILE_MM = 40;
export const BUILD_PLATE_RIM_COLOR = 0x4a4a50;
export const BUILD_PLATE_CORNER_RATIO = 0.03;
export const BUILD_PLATE_CORNER_MIN_MM = 3;
export const BUILD_PLATE_CORNER_MAX_MM = 10;
export const BUILD_PLATE_TAB_WIDTH_RATIO = 0.16;
export const BUILD_PLATE_TAB_WIDTH_MIN_MM = 24;
export const BUILD_PLATE_TAB_WIDTH_MAX_MM = 60;
export const BUILD_PLATE_TAB_DEPTH_RATIO = 0.06;
export const BUILD_PLATE_TAB_DEPTH_MIN_MM = 8;
export const BUILD_PLATE_TAB_DEPTH_MAX_MM = 16;
export const BUILD_VOLUME_EDGE_COLOR = 0x4fa3ff;

/**
 * Printer name written on the plate, along the front edge: low
 * contrast, under the objects, never picked. Height of its text:
 * PLATE_NAME_TEXT_RATIO of the smaller plate side, between
 * PLATE_NAME_TEXT_MIN_MM and PLATE_NAME_TEXT_MAX_MM.
 */
export const PLATE_NAME_COLOR = "#8e8e96";
export const PLATE_NAME_OPACITY = 0.5;
export const PLATE_NAME_TEXT_RATIO = 0.04;
export const PLATE_NAME_TEXT_MIN_MM = 5;
export const PLATE_NAME_TEXT_MAX_MM = 12;
export const PLATE_NAME_FONT =
  "'Inter Variable', 'Noto Sans Hebrew Variable', 'Segoe UI', Roboto, sans-serif";

/** Color of the objects, and of the selected object (GUI_SPEC.md accent #4FA3FF) */
export const OBJECT_COLOR = 0xb4b8c0;
export const SELECTED_OBJECT_COLOR = 0x4fa3ff;

/**
 * Colors of an object out of the build volume (lot 101, decision 103 of
 * Noam: Q2 A, Q3 A): orange, the warning color of GUI_SPEC.md (#FFB020),
 * bright when the object is selected, darker otherwise. The orange comes
 * before the accent color of the selection.
 */
export const OUTSIDE_SELECTED_OBJECT_COLOR = 0xffb020;
export const OUTSIDE_OBJECT_COLOR = 0xa86a08;

/**
 * Faces beyond 45 degrees of the objects (GUI_SPEC.md, Overhang
 * Display, lot 82): red, the red of the axis X
 */
export const OVERHANG_COLOR = 0xe5484d;

/**
 * Navigation cube (GUI_SPEC.md, Navigation Cube): square area in the
 * bottom corner on the end side of the viewport, edge of the cube, axes
 * from its front-left-bottom corner (GUI_SPEC.md, Axis Display).
 */
export const NAVIGATION_CUBE_AREA_PX = 120;
export const NAVIGATION_CUBE_EDGE_PX = 54;
export const NAVIGATION_CUBE_AXIS_LENGTH_RATIO = 1.2;
export const NAVIGATION_CUBE_LABEL_OFFSET_PX = 8;

/** Colors of the axes X, Y, Z (GUI_SPEC.md, Axis Display: red, green, blue) */
export const AXIS_X_COLOR = "#e5484d";
export const AXIS_Y_COLOR = "#46a758";
export const AXIS_Z_COLOR = "#3e83f8";

/** Perspective camera vertical field of view, in degrees */
export const CAMERA_FOV_DEGREES = 45;
export const CAMERA_NEAR_MM = 0.5;
export const CAMERA_FAR_MM = 50000;

/** Margin applied when a view frames the workspace */
export const VIEW_FRAMING_MARGIN = 1.15;

/** Rotation step of the gizmo while Shift is held, in degrees (Phase 6) */
export const ROTATION_SNAP_DEGREES = 15;

/**
 * Pointer travel, in pixels, before a press becomes a drag: a click that
 * selects never moves the object, and only a real click (no drag) in the
 * empty space clears the selection (Phase 6, decision of Noam).
 */
export const DRAG_THRESHOLD_PX = 4;

/**
 * Arrows of the Move gizmo (GUI_SPEC.md, Move Gizmo, lot 102, decisions
 * of Noam Q1 to Q3 A): one arrow per axis of the plate, toward +X and +Y,
 * from the center of the object; its tip is placed MOVE_HANDLE_GAP_PX
 * after the edge of the box of the object seen from the camera, never on
 * the object. Sizes in pixels of the screen, the same at every zoom.
 * Only the tip can be grabbed, with MOVE_HANDLE_GRAB_MARGIN_PX around it
 * (Q2 A): a press on the line goes to the object (free move).
 * An arrow almost along the direction of the camera (cosine of the angle
 * above MOVE_HANDLE_HIDE_COSINE) is hidden: its tip would be over the
 * object. Colors of the axes of the gizmos (X red, Y green; Z:
 * GIZMO_Z_COLOR), and yellow for the handle under the pointer.
 */
export const MOVE_HANDLE_GAP_PX = 12;
export const MOVE_HANDLE_TIP_LENGTH_PX = 18;
export const MOVE_HANDLE_TIP_RADIUS_PX = 6;
export const MOVE_HANDLE_LINE_RADIUS_PX = 1;
export const MOVE_HANDLE_GRAB_MARGIN_PX = 6;
export const MOVE_HANDLE_HIDE_COSINE = 0.97;
export const MOVE_HANDLE_X_COLOR = 0xff0000;
export const MOVE_HANDLE_Y_COLOR = 0x00ff00;
export const MOVE_HANDLE_HOVER_COLOR = 0xffff00;

/**
 * Rings of the Rotate gizmo (GUI_SPEC.md, Rotate Gizmo, lot 103, decisions
 * of Noam Q1 to Q3 A): one full ring per axis of the plate, around the
 * object: its radius is the distance from the center of the object to the
 * farthest corner of its box, plus ROTATE_RING_GAP_PX, and at least
 * ROTATE_RING_MIN_RADIUS_PX on the screen. The line is ROTATE_RING_WIDTH_PX
 * wide; it can be grabbed ROTATE_RING_GRAB_MARGIN_PX around it, only
 * outside the selected objects (Q3 A: over them, a press goes to the
 * object, free move). A ring seen almost edge on (cosine between its axis
 * and the view below ROTATE_RING_EDGE_COSINE) turns with the pointer
 * along the ring on the screen, not around its center.
 */
export const ROTATE_RING_GAP_PX = 12;
export const ROTATE_RING_MIN_RADIUS_PX = 60;
export const ROTATE_RING_WIDTH_PX = 3;
export const ROTATE_RING_GRAB_MARGIN_PX = 6;
export const ROTATE_RING_SEGMENTS = 128;
export const ROTATE_RING_EDGE_COSINE = 0.2;

/**
 * Handles of the Scale gizmo (GUI_SPEC.md, Scale Gizmo, lot 103, decisions
 * of Noam Q4 A and Q5 B): one handle per axis of the object, from its
 * center, toward the right, the front or the top of the plate; the handle
 * (a cube of SCALE_HANDLE_SIZE_PX) is placed SCALE_HANDLE_GAP_PX after the
 * edge of the box of the object seen from the camera, never on the
 * object. Only the handle can be grabbed, with SCALE_HANDLE_GRAB_MARGIN_PX
 * around it. A handle almost along the direction of the camera (cosine
 * above SCALE_HANDLE_HIDE_COSINE) is hidden. SCALE_MIN_FACTOR: smallest
 * factor of one drag (the handle crossed over the center).
 */
export const SCALE_HANDLE_GAP_PX = 12;
export const SCALE_HANDLE_SIZE_PX = 12;
export const SCALE_HANDLE_LINE_RADIUS_PX = 1;
export const SCALE_HANDLE_GRAB_MARGIN_PX = 6;
export const SCALE_HANDLE_HIDE_COSINE = 0.97;
export const SCALE_MIN_FACTOR = 0.01;

/** Color of the Z axis of the gizmos (Rotate, Scale), blue */
export const GIZMO_Z_COLOR = 0x0000ff;

/**
 * Cursor over the viewport (lot 102, Q5 A): the object under the pointer
 * is looked for at most once per frame; when one search took more than
 * HOVER_PICK_SLOW_MS (a model of about a million triangles), only after
 * the pointer has rested HOVER_PICK_REST_MS, so that the view stays fluid.
 */
export const HOVER_PICK_SLOW_MS = 8;
export const HOVER_PICK_REST_MS = 80;
