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
 *   sized from its build volume (Build Plate, Plate Display), drawn as
 *   a magnetic print sheet: rounded corners, grain, and a tab centered
 *   on the front edge that shows the front of the printer; the grid
 *   stays inside the sheet; the name of the printer is written along
 *   the front edge. Without a selected printer, no plate is shown: the
 *   grid covers a default workspace.
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
  BUILD_PLATE_CORNER_MAX_MM,
  BUILD_PLATE_CORNER_MIN_MM,
  BUILD_PLATE_CORNER_RATIO,
  BUILD_PLATE_GRAIN,
  BUILD_PLATE_GRAIN_TILE_MM,
  BUILD_PLATE_RIM_COLOR,
  BUILD_PLATE_TAB_DEPTH_MAX_MM,
  BUILD_PLATE_TAB_DEPTH_MIN_MM,
  BUILD_PLATE_TAB_DEPTH_RATIO,
  BUILD_PLATE_TAB_WIDTH_MAX_MM,
  BUILD_PLATE_TAB_WIDTH_MIN_MM,
  BUILD_PLATE_TAB_WIDTH_RATIO,
  BUILD_VOLUME_EDGE_COLOR,
  DEFAULT_WORKSPACE_HEIGHT_MM,
  DEFAULT_WORKSPACE_SIZE_MM,
  GRID_MAJOR_COLOR,
  GRID_MAJOR_EVERY,
  GRID_MIN_PIXEL_SPACING,
  GRID_MINOR_COLOR,
  GRID_SPACINGS_MM,
  PLATE_NAME_COLOR,
  PLATE_NAME_FONT,
  PLATE_NAME_OPACITY,
  PLATE_NAME_TEXT_MAX_MM,
  PLATE_NAME_TEXT_MIN_MM,
  PLATE_NAME_TEXT_RATIO,
} from "../../constants/ViewportConstants";

import type { BuildVolume } from "../../types/Printer";
import type { FramingBox } from "../CameraManager";

/** Render order: plate first, then grid, then axes on top */
const PLATE_RENDER_ORDER = 0;
const GRID_RENDER_ORDER = 1;
const AXES_RENDER_ORDER = 10;
const NAME_RENDER_ORDER = 2;

/** Pixels of the grain texture tile, and of a text line of the name */
const GRAIN_TEXTURE_PX = 256;
const NAME_TEXTURE_LINE_PX = 96;

/** Value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Corner radius of the sheet of a build volume, in millimeters */
function cornerRadius({ x, y }: BuildVolume): number {
  return clamp(
    Math.min(x, y) * BUILD_PLATE_CORNER_RATIO,
    BUILD_PLATE_CORNER_MIN_MM,
    Math.min(BUILD_PLATE_CORNER_MAX_MM, Math.min(x, y) / 4),
  );
}

/**
 * Outline of the sheet: rectangle of the plate with rounded corners,
 * and the front tab (Y negative) centered on the front edge.
 */
function sheetShape(buildVolume: BuildVolume): THREE.Shape {
  const { x, y } = buildVolume;
  const side = Math.min(x, y);
  const a = x / 2;
  const b = y / 2;
  const r = cornerRadius(buildVolume);
  const tabWidth = Math.min(
    x / 2,
    clamp(
      side * BUILD_PLATE_TAB_WIDTH_RATIO,
      BUILD_PLATE_TAB_WIDTH_MIN_MM,
      BUILD_PLATE_TAB_WIDTH_MAX_MM,
    ),
  );
  const tabDepth = clamp(
    side * BUILD_PLATE_TAB_DEPTH_RATIO,
    BUILD_PLATE_TAB_DEPTH_MIN_MM,
    BUILD_PLATE_TAB_DEPTH_MAX_MM,
  );
  const t = tabWidth / 2;
  const tr = tabDepth * 0.5;
  const half = Math.PI / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-a + r, -b);
  // Front tab
  shape.lineTo(-t, -b);
  shape.lineTo(-t, -b - tabDepth + tr);
  shape.absarc(-t + tr, -b - tabDepth + tr, tr, Math.PI, Math.PI + half);
  shape.lineTo(t - tr, -b - tabDepth);
  shape.absarc(t - tr, -b - tabDepth + tr, tr, -half, 0);
  shape.lineTo(t, -b);
  // Rounded corners, counterclockwise
  shape.lineTo(a - r, -b);
  shape.absarc(a - r, -b + r, r, -half, 0);
  shape.lineTo(a, b - r);
  shape.absarc(a - r, b - r, r, 0, half);
  shape.lineTo(-a + r, b);
  shape.absarc(-a + r, b - r, r, half, Math.PI);
  shape.lineTo(-a, -b + r);
  shape.absarc(-a + r, -b + r, r, Math.PI, Math.PI + half);
  return shape;
}

/** Grain of the sheet: small random changes of its color, tiled */
function grainTexture(): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = GRAIN_TEXTURE_PX;
  canvas.height = GRAIN_TEXTURE_PX;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  // Color in sRGB values, as written in the constant
  const base = [16, 8, 0].map((shift) => (BUILD_PLATE_COLOR >> shift) & 0xff);
  const image = context.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const grain = (Math.random() * 2 - 1) * BUILD_PLATE_GRAIN;
    image.data[i] = base[0] + grain;
    image.data[i + 1] = base[1] + grain;
    image.data[i + 2] = base[2] + grain;
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // ShapeGeometry UVs are in millimeters
  texture.repeat.set(
    1 / BUILD_PLATE_GRAIN_TILE_MM,
    1 / BUILD_PLATE_GRAIN_TILE_MM,
  );
  return texture;
}

/** Flat text of the given height in millimeters, on the plane Z = 0 */
function textMesh(text: string, height: number): THREE.Mesh {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = `600 ${NAME_TEXTURE_LINE_PX}px ${PLATE_NAME_FONT}`;
  let width = NAME_TEXTURE_LINE_PX;

  if (context) {
    context.font = font;
    width = Math.ceil(context.measureText(text).width) + 8;
  }

  canvas.width = width;
  canvas.height = Math.ceil(NAME_TEXTURE_LINE_PX * 1.3);

  if (context) {
    context.font = font;
    context.direction = document.documentElement.dir === "rtl" ? "rtl" : "ltr";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const planeHeight = height * 1.3;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(
      (planeHeight * canvas.width) / canvas.height,
      planeHeight,
    ),
    new THREE.MeshBasicMaterial({
      color: PLATE_NAME_COLOR,
      map: texture,
      transparent: true,
      opacity: PLATE_NAME_OPACITY,
      alphaTest: 0.02,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = NAME_RENDER_ORDER;
  return mesh;
}

export class WorkspaceHelpers {
  private readonly scene: THREE.Scene;

  private buildVolume: BuildVolume | null = null;

  private gridSpacing = 0;

  private grid: THREE.LineSegments | null = null;

  private axes: THREE.AxesHelper | null = null;

  private plate: THREE.Group | null = null;

  private printerName: string | null = null;

  private name: THREE.Mesh | null = null;

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
      buildVolume && buildVolume.x > 0 && buildVolume.y > 0 && buildVolume.z > 0
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
   * Name of the printer written on the plate (brand and model), or
   * none. Shown only with a build plate.
   */
  public setPrinterName(printerName: string | null): void {
    if (printerName === this.printerName) {
      return;
    }

    this.printerName = printerName;
    this.rebuildName();

    // The fonts of the window may load after the first drawing
    if (printerName && document.fonts) {
      void document.fonts
        .load(`600 ${NAME_TEXTURE_LINE_PX}px ${PLATE_NAME_FONT}`, printerName)
        .then(() => {
          if (this.printerName === printerName) {
            this.rebuildName();
          }
        })
        .catch(() => undefined);
    }
  }

  /** What is drawn on the plate, read by the end-to-end tests */
  public getPlateState(): { plate: boolean; name: string | null } {
    return {
      plate: this.plate !== null,
      name: this.name ? this.printerName : null,
    };
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
        (candidate) =>
          candidate * pixelsPerMillimeter >= GRID_MIN_PIXEL_SPACING,
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
    this.removeName();
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
    this.rebuildName();
  }

  private rebuildGrid(): void {
    this.removeGrid();

    const { width, depth } = this.getExtent();
    const spacing = this.gridSpacing;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    // On the sheet, lines stop at its rounded corners
    const radius = this.buildVolume ? cornerRadius(this.buildVolume) : 0;
    const inset = (offset: number, half: number): number => {
      const into = Math.abs(offset) - (half - radius);
      return into > 0
        ? radius - Math.sqrt(Math.max(0, radius * radius - into * into))
        : 0;
    };

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
      const cut = inset(i * spacing, halfWidth);
      addLine(
        i * spacing,
        -halfDepth + cut,
        i * spacing,
        halfDepth - cut,
        Math.abs(i),
      );
    }

    const maxY = Math.floor(halfDepth / spacing);
    for (let j = -maxY; j <= maxY; j += 1) {
      const cut = inset(j * spacing, halfDepth);
      addLine(
        -halfWidth + cut,
        j * spacing,
        halfWidth - cut,
        j * spacing,
        Math.abs(j),
      );
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

    // Sheet, just below Z = 0 so that the grid stays visible
    const shape = sheetShape(this.buildVolume);
    const grain = grainTexture();
    const plate = new THREE.Mesh(
      new THREE.ShapeGeometry(shape, 12),
      new THREE.MeshBasicMaterial({
        color: grain ? 0xffffff : BUILD_PLATE_COLOR,
        map: grain,
        side: THREE.DoubleSide,
      }),
    );
    plate.position.z = -0.05;
    plate.renderOrder = PLATE_RENDER_ORDER;
    group.add(plate);

    // Rim of the sheet
    const rim = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(shape.getPoints(12)),
      new THREE.LineBasicMaterial({ color: BUILD_PLATE_RIM_COLOR }),
    );
    rim.position.z = -0.02;
    group.add(rim);

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

  /** Printer name, inside the sheet along its front edge */
  private rebuildName(): void {
    this.removeName();

    if (!this.buildVolume || !this.printerName) {
      return;
    }

    const { x, y } = this.buildVolume;
    const height = clamp(
      Math.min(x, y) * PLATE_NAME_TEXT_RATIO,
      PLATE_NAME_TEXT_MIN_MM,
      PLATE_NAME_TEXT_MAX_MM,
    );
    const name = textMesh(this.printerName, height);
    const width = (name.geometry as THREE.PlaneGeometry).parameters.width;
    if (width > x * 0.9) {
      name.scale.setScalar((x * 0.9) / width);
    }
    name.name = "workspace-printer-name";
    name.position.set(0, -y / 2 + height * 1.3 * name.scale.y, 0.02);

    this.name = name;
    this.scene.add(name);
  }

  private removeName(): void {
    if (!this.name) {
      return;
    }

    this.scene.remove(this.name);
    this.name.geometry.dispose();
    const material = this.name.material as THREE.MeshBasicMaterial;
    material.map?.dispose();
    material.dispose();
    this.name = null;
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
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        const material = child.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();
      }
    });
    this.plate = null;
  }
}
