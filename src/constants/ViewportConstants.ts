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

/** Length of the axes at the origin, as a fraction of the workspace side */
export const AXES_LENGTH_RATIO = 0.15;

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
