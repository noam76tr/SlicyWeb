/**
 * SlicyWeb
 * Workspace Helpers
 *
 * Visual references of the 3D viewport (GUI_SPEC.md, Viewport Purpose):
 * - coordinate grid on the plane Z = 0, always visible, with adaptive
 *   spacing (Coordinate Grid);
 * - axes at the origin, always visible, X red, Y green, Z blue
 *   (Axis Display);
 * - build plate and build volume limits of the selected printer,
 *   sized from its build volume (Build Plate, Plate Display). Without
 *   a selected printer, no plate is shown: the grid covers a default
 *   workspace.
 *
 * Coordinates (ADR-027): millimeters, Z up, origin at the center of
 * the build plate, Z = 0 on the plate surface.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (3D Viewport, Build Plate, Plate Display, Axis Display, Coordinate Grid)
 * - DECISIONS.md (ADR-027)
 */

import * as THREE from "three";

import {
  AXES_LENGTH_RATIO,
  BUILD_PLATE_COLOR,
  BUILD_VOLUME_EDGE_COLOR,
  DEFAULT_WORKSPACE_HEIGHT_MM,
  DEFAULT_WORKSPACE_SIZE_MM,
  GRID_MAJOR_COLOR,
  GRID_MAJOR_EVERY,
  GRID_MIN_PIXEL_SPACING,
  GRID_MINOR_COLOR,
  GRID_SPACINGS_MM,
} from "../../constants/ViewportConstants";

import type { BuildVolume } from "../../types/Printer";
import type { FramingBox } from "../CameraManager";

/** Render order: plate first, then grid, then axes on top */
const PLATE_RENDER_ORDER = 0;
const GRID_RENDER_ORDER = 1;
const AXES_RENDER_ORDER = 10;

export class WorkspaceHelpers {
  private readonly scene: THREE.Scene;

  private buildVolume: BuildVolume | null = null;

  private gridSpacing = 0;

  private grid: THREE.LineSegments | null = null;

  private axes: THREE.AxesHelper | null = null;

  private plate: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rebuild();
  }

  /**
   * Shows the build plate of the selected printer,
   * or hides it (null: no printer selected).
   */
  public setBuildVolume(buildVolume: BuildVolume | null): void {
    const valid =
      buildVolume &&
      buildVolume.x > 0 &&
      buildVolume.y > 0 &&
      buildVolume.z > 0
        ? buildVolume
        : null;

    if (
      valid?.x === this.buildVolume?.x &&
      valid?.y === this.buildVolume?.y &&
      valid?.z === this.buildVolume?.z
    ) {
      return;
    }

    this.buildVolume = valid ? { ...valid } : null;
    this.rebuild();
  }

  /**
   * Box framed by the view presets: the build volume, or the default
   * workspace without a printer.
   */
  public getFramingBox(): FramingBox {
    const { width, depth, height } = this.getExtent();

    return {
      center: new THREE.Vector3(0, 0, height / 2),
      size: new THREE.Vector3(width, depth, height),
    };
  }

  /**
   * Adapts the grid spacing to the zoom level, so that grid lines
   * stay at least GRID_MIN_PIXEL_SPACING pixels apart.
   */
  public updateGridSpacing(pixelsPerMillimeter: number): void {
    if (!(pixelsPerMillimeter > 0)) {
      return;
    }

    const spacing =
      GRID_SPACINGS_MM.find(
        (candidate) => candidate * pixelsPerMillimeter >= GRID_MIN_PIXEL_SPACING,
      ) ?? GRID_SPACINGS_MM[GRID_SPACINGS_MM.length - 1];

    if (spacing !== this.gridSpacing) {
      this.gridSpacing = spacing;
      this.rebuildGrid();
    }
  }

  public getGridSpacing(): number {
    return this.gridSpacing;
  }

  public dispose(): void {
    this.removeGrid();
    this.removeAxes();
    this.removePlate();
  }

  private getExtent(): { width: number; depth: number; height: number } {
    if (this.buildVolume) {
      return {
        width: this.buildVolume.x,
        depth: this.buildVolume.y,
        height: this.buildVolume.z,
      };
    }

    return {
      width: DEFAULT_WORKSPACE_SIZE_MM,
      depth: DEFAULT_WORKSPACE_SIZE_MM,
      height: DEFAULT_WORKSPACE_HEIGHT_MM,
    };
  }

  private rebuild(): void {
    if (this.gridSpacing === 0) {
      this.gridSpacing = 10;
    }

    this.rebuildGrid();
    this.rebuildAxes();
    this.rebuildPlate();
  }

  private rebuildGrid(): void {
    this.removeGrid();

    const { width, depth } = this.getExtent();
    const spacing = this.gridSpacing;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const positions: number[] = [];
    const colors: number[] = [];
    const minor = new THREE.Color(GRID_MINOR_COLOR);
    const major = new THREE.Color(GRID_MAJOR_COLOR);

    const addLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      index: number,
    ): void => {
      const color = index % GRID_MAJOR_EVERY === 0 ? major : minor;
      positions.push(x1, y1, 0, x2, y2, 0);
      colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    };

    // Lines start from the origin, so that a line always goes through it
    const maxX = Math.floor(halfWidth / spacing);
    for (let i = -maxX; i <= maxX; i += 1) {
      addLine(i * spacing, -halfDepth, i * spacing, halfDepth, Math.abs(i));
    }

    const maxY = Math.floor(halfDepth / spacing);
    for (let j = -maxY; j <= maxY; j += 1) {
      addLine(-halfWidth, j * spacing, halfWidth, j * spacing, Math.abs(j));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: true });

    this.grid = new THREE.LineSegments(geometry, material);
    this.grid.name = "workspace-grid";
    this.grid.renderOrder = GRID_RENDER_ORDER;
    this.scene.add(this.grid);
  }

  private rebuildAxes(): void {
    this.removeAxes();

    const { width, depth } = this.getExtent();
    const length = Math.min(width, depth) * AXES_LENGTH_RATIO;

    // AxesHelper colors: X red, Y green, Z blue (GUI_SPEC.md, Axis Display)
    this.axes = new THREE.AxesHelper(length);
    this.axes.name = "workspace-axes";
    this.axes.renderOrder = AXES_RENDER_ORDER;

    // Drawn over the grid and the plate: always visible
    const material = this.axes.material as THREE.LineBasicMaterial;
    material.depthTest = false;

    this.scene.add(this.axes);
  }

  private rebuildPlate(): void {
    this.removePlate();

    if (!this.buildVolume) {
      return;
    }

    const { x, y, z } = this.buildVolume;
    const group = new THREE.Group();
    group.name = "workspace-build-plate";

    // Plate surface, just below Z = 0 so that the grid stays visible
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(x, y),
      new THREE.MeshBasicMaterial({
        color: BUILD_PLATE_COLOR,
        side: THREE.DoubleSide,
      }),
    );
    plate.position.z = -0.05;
    plate.renderOrder = PLATE_RENDER_ORDER;
    group.add(plate);

    // Build volume limits (Boundary Limits)
    const box = new THREE.BoxGeometry(x, y, z);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box),
      new THREE.LineBasicMaterial({
        color: BUILD_VOLUME_EDGE_COLOR,
        transparent: true,
        opacity: 0.6,
      }),
    );
    box.dispose();
    edges.position.z = z / 2;
    group.add(edges);

    this.plate = group;
    this.scene.add(group);
  }

  private removeGrid(): void {
    if (!this.grid) {
      return;
    }

    this.scene.remove(this.grid);
    this.grid.geometry.dispose();
    (this.grid.material as THREE.Material).dispose();
    this.grid = null;
  }

  private removeAxes(): void {
    if (!this.axes) {
      return;
    }

    this.scene.remove(this.axes);
    this.axes.dispose();
    this.axes = null;
  }

  private removePlate(): void {
    if (!this.plate) {
      return;
    }

    this.scene.remove(this.plate);
    this.plate.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.plate = null;
  }
}
