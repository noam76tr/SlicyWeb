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

/** Build plate colors (displayed when a printer is selected) */
export const BUILD_PLATE_COLOR = 0x2f2f33;
export const BUILD_VOLUME_EDGE_COLOR = 0x4fa3ff;

/** Length of the axes at the origin, as a fraction of the workspace side */
export const AXES_LENGTH_RATIO = 0.15;

/** Perspective camera vertical field of view, in degrees */
export const CAMERA_FOV_DEGREES = 45;
export const CAMERA_NEAR_MM = 0.5;
export const CAMERA_FAR_MM = 50000;

/** Margin applied when a view frames the workspace */
export const VIEW_FRAMING_MARGIN = 1.15;
