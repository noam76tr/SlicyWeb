/**
 * SlicyWeb
 * Camera Manager
 *
 * Responsible for:
 * - Camera creation (perspective and orthographic)
 * - Camera configuration (Z axis up, ADR-027)
 * - Camera positioning (view presets)
 * - Camera controls (zoom, pan, rotate)
 * - Camera updates
 *
 * Mouse (GUI_SPEC.md, Viewport Controls):
 * - wheel: zoom (towards the cursor);
 * - middle button: pan;
 * - right button: rotate the camera around its target;
 * - left button: not used by the camera (reserved for selection).
 *
 * No business logic.
 * No AI logic.
 * No scene management.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md (Viewport Controls, Camera Views, View Menu)
 * - DECISIONS.md (ADR-027)
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
  CAMERA_FAR_MM,
  CAMERA_FOV_DEGREES,
  CAMERA_NEAR_MM,
  VIEW_FRAMING_MARGIN,
} from "../constants/ViewportConstants";

import type {
  ViewPreset,
  ViewportProjection,
} from "../state/viewportStore";

/** Box framed by the view presets: center and size, in millimeters */
export interface FramingBox {
  center: THREE.Vector3;
  size: THREE.Vector3;
}

/**
 * Directions from the target to the camera (Z up, X right, Y back).
 * Top and bottom are tilted very slightly towards the front: a view
 * exactly along the up axis has no defined orientation.
 */
const VIEW_DIRECTIONS: Record<Exclude<ViewPreset, "reset">, THREE.Vector3> = {
  top: new THREE.Vector3(0, -0.0001, 1),
  bottom: new THREE.Vector3(0, -0.0001, -1),
  front: new THREE.Vector3(0, -1, 0),
  back: new THREE.Vector3(0, 1, 0),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  isometric: new THREE.Vector3(1, -1, 1),
};

export class CameraManager {
  private readonly perspectiveCamera: THREE.PerspectiveCamera;

  private readonly orthographicCamera: THREE.OrthographicCamera;

  private projection: ViewportProjection = "perspective";

  private aspect = 1;

  /** Half height of the orthographic view at zoom 1, in millimeters */
  private orthographicHalfHeight = 100;

  private controls: OrbitControls | null = null;

  constructor() {
    THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

    this.perspectiveCamera = new THREE.PerspectiveCamera(
      CAMERA_FOV_DEGREES,
      1,
      CAMERA_NEAR_MM,
      CAMERA_FAR_MM,
    );
    this.perspectiveCamera.up.set(0, 0, 1);

    this.orthographicCamera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      -CAMERA_FAR_MM,
      CAMERA_FAR_MM,
    );
    this.orthographicCamera.up.set(0, 0, 1);
  }

  /**
   * Returns active camera.
   */
  public getCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this.projection === "perspective"
      ? this.perspectiveCamera
      : this.orthographicCamera;
  }

  public getProjection(): ViewportProjection {
    return this.projection;
  }

  /**
   * Creates the camera controls on the viewport canvas.
   */
  public attachControls(domElement: HTMLElement): void {
    this.controls?.dispose();

    const controls = new OrbitControls(this.getCamera(), domElement);

    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = CAMERA_FAR_MM / 4;
    controls.minZoom = 0.02;
    controls.maxZoom = 100;

    this.controls = controls;
  }

  /**
   * Enables or disables the camera controls (disabled while a gizmo
   * is dragged).
   */
  public setControlsEnabled(enabled: boolean): void {
    if (this.controls) {
      this.controls.enabled = enabled;
    }
  }

  /**
   * Applies the camera movement in progress (damping).
   * Called at each frame.
   */
  public update(): void {
    this.controls?.update();
  }

  /**
   * Updates camera aspect ratio.
   */
  public updateAspect(
    width: number,
    height: number,
  ): void {
    if (width <= 0 || height <= 0) {
      return;
    }

    this.aspect = width / height;

    this.perspectiveCamera.aspect = this.aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    this.updateOrthographicFrustum();
  }

  /**
   * Switches between perspective and orthographic projection,
   * keeping the point of view and the apparent size of the target.
   */
  public setProjection(projection: ViewportProjection): void {
    if (projection === this.projection) {
      return;
    }

    const target = this.getTarget();

    if (projection === "orthographic") {
      const perspective = this.perspectiveCamera;
      const distance = perspective.position.distanceTo(target);

      this.orthographicHalfHeight =
        distance * Math.tan(THREE.MathUtils.degToRad(perspective.fov / 2));

      this.orthographicCamera.position.copy(perspective.position);
      this.orthographicCamera.quaternion.copy(perspective.quaternion);
      this.orthographicCamera.zoom = 1;
      this.updateOrthographicFrustum();
    } else {
      const orthographic = this.orthographicCamera;
      const halfHeight = this.orthographicHalfHeight / orthographic.zoom;
      const distance =
        halfHeight / Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV_DEGREES / 2));
      const direction = orthographic.position.clone().sub(target).normalize();

      this.perspectiveCamera.position
        .copy(target)
        .addScaledVector(direction, distance);
      this.perspectiveCamera.quaternion.copy(orthographic.quaternion);
    }

    this.projection = projection;

    if (this.controls) {
      this.controls.object = this.getCamera();
      this.controls.update();
    }
  }

  /**
   * Places the camera on a view preset, framing the given box.
   */
  public setView(view: ViewPreset, box: FramingBox): void {
    const direction = VIEW_DIRECTIONS[view === "reset" ? "isometric" : view]
      .clone()
      .normalize();

    const radius = (box.size.length() / 2) * VIEW_FRAMING_MARGIN;
    const halfFov = THREE.MathUtils.degToRad(CAMERA_FOV_DEGREES / 2);
    const fitsHeight = radius / Math.sin(halfFov);
    const fitsWidth = radius / Math.sin(Math.atan(Math.tan(halfFov) * this.aspect));
    const distance = Math.max(fitsHeight, fitsWidth);

    for (const camera of [this.perspectiveCamera, this.orthographicCamera]) {
      camera.position.copy(box.center).addScaledVector(direction, distance);
      camera.lookAt(box.center);
    }

    this.orthographicCamera.zoom = 1;
    this.orthographicHalfHeight = Math.max(radius, radius / this.aspect);
    this.updateOrthographicFrustum();

    if (this.controls) {
      this.controls.target.copy(box.center);
      this.controls.update();
    }
  }

  /**
   * Number of screen pixels per millimeter at the camera target,
   * for a viewport of the given height in pixels.
   */
  public getPixelsPerMillimeter(viewportHeight: number): number {
    if (this.projection === "orthographic") {
      const camera = this.orthographicCamera;
      return (viewportHeight * camera.zoom) / (camera.top - camera.bottom);
    }

    const camera = this.perspectiveCamera;
    const distance = camera.position.distanceTo(this.getTarget());
    const visibleHeight =
      2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    return visibleHeight > 0 ? viewportHeight / visibleHeight : 0;
  }

  public dispose(): void {
    this.controls?.dispose();
    this.controls = null;
  }

  private getTarget(): THREE.Vector3 {
    return this.controls ? this.controls.target.clone() : new THREE.Vector3();
  }

  private updateOrthographicFrustum(): void {
    const camera = this.orthographicCamera;
    const halfHeight = this.orthographicHalfHeight;

    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * this.aspect;
    camera.right = halfHeight * this.aspect;
    camera.updateProjectionMatrix();
  }
}
