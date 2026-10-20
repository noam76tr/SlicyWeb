/**
 * SlicyWeb
 * Viewport
 *
 * Responsible for:
 * - Renderer container
 * - 3D viewport hosting
 * - Renderer lifecycle
 *
 * The viewport shows the coordinate grid, the axes and, when a
 * printer is selected, its build plate (WorkspaceHelpers), and the
 * objects of the scene (ObjectRenderer, object store).
 * Camera: mouse controls of GUI_SPEC.md (CameraManager); projection
 * and view presets come from the View menu (viewport store);
 * the Home key resets the view (GUI_SPEC.md, Keyboard Shortcuts).
 *
 * The canvas follows the size of its container (ResizeObserver):
 * window resize, side panels resized or collapsed.
 *
 * Objects (Phase 6): click to select, Ctrl+click to add or remove an
 * object, click in the empty space to clear the selection, drag an object
 * (or the group it belongs to) to move it on the plate
 * (ObjectInteraction); gizmo on the selected object or at the center of
 * the group (TransformGizmo): Move, Rotate, Scale, chosen with the mode
 * buttons over the viewport (GUI) or the keys G, R, S; the lock of the scale
 * (keepProportions) applies to the Scale gizmo as to the Transform section;
 * Escape clears the selection (GUI_SPEC.md, Keyboard Shortcuts).
 *
 * Domain: Viewport (DOMAINS_DEPENDENCY_MATRIX.md). It does not depend
 * on the GUI: the GUI mounts it and passes its translated label, and the
 * function that applies a transform (TransformService).
 *
 * No business logic.
 * No AI logic.
 * No analysis logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md (3D Viewport, Viewport Controls, Camera Views)
 * - FILE_STRUCTURE.md
 * - DECISIONS.md (ADR-027, ADR-031)
 */

import { useEffect, useRef, useState } from "react";

import { CameraManager } from "../../renderer/CameraManager";
import { LightingManager } from "../../renderer/LightingManager";
import { ObjectInteraction } from "../../renderer/ObjectInteraction";
import { ObjectRenderer } from "../../renderer/ObjectRenderer";
import { RendererManager } from "../../renderer/RendererManager";
import { SceneRenderer } from "../../renderer/SceneRenderer";
import { TransformGizmo } from "../../renderer/TransformGizmo";
import { WorkspaceHelpers } from "../../renderer/helpers/WorkspaceHelpers";
import { GeometryRegistry } from "../../scene/GeometryRegistry";
import {
  boundsCenter,
  groupBounds,
  type Vector3Mm,
} from "../../scene/ObjectTransform";
import { useObjectStore } from "../../state/objectStore";
import { usePrinterStore } from "../../state/printerStore";
import {
  useViewportStore,
  type TransformMode,
} from "../../state/viewportStore";

import type { Object3D, Transform } from "../../types/Object3D";

/** Keys of the gizmos (GUI_SPEC.md, Keyboard Shortcuts: G, R, S), by key position */
const TRANSFORM_KEYS: Record<string, TransformMode> = {
  KeyG: "translate",
  KeyR: "rotate",
  KeyS: "scale",
};

/** Center of the bounding box of a group of objects, on the plate */
function groupCenter(objects: Object3D[]): Vector3Mm | null {
  const bounds = groupBounds(
    objects.flatMap((object) => {
      const positions = GeometryRegistry.get(object.objectId)?.getAttribute(
        "position",
      )?.array;
      return positions ? [{ transform: object.transform, positions }] : [];
    }),
  );

  return bounds ? boundsCenter(bounds) : null;
}

/** Keys typed in a text field must not move the camera */
function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

interface ViewportProps {
  /** Accessible name of the viewport, already translated */
  label: string;

  /** Message shown when 3D rendering cannot start, already translated */
  unavailableMessage: string;

  /**
   * Applies transforms to one object or a group, by objectId
   * (TransformService); returns false when they are refused. live: step
   * of a rotation with the gizmo, not placed on the plate.
   */
  onTransformObjects: (
    transforms: Record<string, Transform>,
    live: boolean,
  ) => boolean;

  /**
   * Start and end of a gesture on one object or a group (drag on the
   * plate, gizmo): its changes make one action of the history
   * (TransformService).
   */
  onTransformGesture: (objectIds: string[], phase: "start" | "end") => void;
}

export default function Viewport({
  label,
  unavailableMessage,
  onTransformObjects,
  onTransformGesture,
}: ViewportProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  // Latest callback, read by the event handlers created once
  const onTransformRef = useRef(onTransformObjects);
  onTransformRef.current = onTransformObjects;
  const onGestureRef = useRef(onTransformGesture);
  onGestureRef.current = onTransformGesture;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const cameraManager = new CameraManager();
    let rendererManager: RendererManager;

    try {
      rendererManager = new RendererManager(container, cameraManager);
    } catch (error) {
      // No WebGL context (graphics driver or GPU not available)
      console.error("3D rendering could not start.", error);
      setUnavailable(true);
      return;
    }

    const scene = rendererManager.getScene();
    const lightingManager = new LightingManager(scene);
    const workspace = new WorkspaceHelpers(scene);
    const objectRenderer = new ObjectRenderer(scene);
    const sceneRenderer = new SceneRenderer(rendererManager);

    cameraManager.attachControls(rendererManager.getCanvas());

    const findObject = (objectId: string) =>
      useObjectStore
        .getState()
        .objects.find((object) => object.objectId === objectId);

    // Gizmo first: it receives the presses on its handles before the
    // object interaction
    const gizmo = new TransformGizmo(
      scene,
      cameraManager.getCamera(),
      rendererManager.getCanvas(),
      (transforms, live) => onTransformRef.current(transforms, live),
      (dragging) => cameraManager.setControlsEnabled(!dragging),
      (objectIds, phase) => onGestureRef.current(objectIds, phase),
    );
    gizmo.setMode(useViewportStore.getState().transformMode);
    gizmo.setUniform(useViewportStore.getState().keepProportions);

    const interaction = new ObjectInteraction({
      domElement: rendererManager.getCanvas(),
      getCamera: () => cameraManager.getCamera(),
      pick: (raycaster) => objectRenderer.pick(raycaster),
      isGizmoActive: () => gizmo.isDragging(),
      getObject: findObject,
      getSelection: () => useObjectStore.getState().selectedObjectIds,
      select: (objectId) => useObjectStore.getState().selectObject(objectId),
      toggle: (objectId) =>
        useObjectStore.getState().toggleObjectSelection(objectId),
      onGesture: (objectIds, phase) => onGestureRef.current(objectIds, phase),
      onMove: (transforms) => {
        onTransformRef.current(transforms, false);
      },
    });

    // Printer build plate (none until a printer is selected)
    workspace.setBuildVolume(
      usePrinterStore.getState().selectedPrinter?.buildVolume ?? null,
    );

    // Initial projection and view
    cameraManager.setProjection(useViewportStore.getState().projection);
    cameraManager.setView("isometric", workspace.getFramingBox());

    sceneRenderer.start(() => {
      cameraManager.update();
      workspace.updateGridSpacing(
        cameraManager.getPixelsPerMillimeter(rendererManager.getHeight()),
      );
    });

    const resizeObserver = new ResizeObserver(() => {
      rendererManager.resize();
    });
    resizeObserver.observe(container);

    // Objects of the scene (imported models)
    const syncObjects = (): void => {
      const { objects, selectedObjectIds } = useObjectStore.getState();
      objectRenderer.sync(objects, selectedObjectIds);

      const selected = objects.filter((object) =>
        selectedObjectIds.includes(object.objectId),
      );
      gizmo.attach(
        selected,
        selected.length > 1 ? groupCenter(selected) : null,
      );
    };
    syncObjects();
    const unsubscribeObjects = useObjectStore.subscribe(syncObjects);

    const unsubscribePrinter = usePrinterStore.subscribe((state, previous) => {
      if (state.selectedPrinter === previous.selectedPrinter) {
        return;
      }

      workspace.setBuildVolume(state.selectedPrinter?.buildVolume ?? null);
      cameraManager.setView("reset", workspace.getFramingBox());
    });

    const unsubscribeViewport = useViewportStore.subscribe(
      (state, previous) => {
        if (state.projection !== previous.projection) {
          cameraManager.setProjection(state.projection);
          gizmo.setCamera(cameraManager.getCamera());
        }

        if (state.transformMode !== previous.transformMode) {
          gizmo.setMode(state.transformMode);
        }

        if (state.keepProportions !== previous.keepProportions) {
          gizmo.setUniform(state.keepProportions);
        }

        if (
          state.viewRequest &&
          state.viewRequest.requestId !== previous.viewRequest?.requestId
        ) {
          cameraManager.setView(
            state.viewRequest.view,
            workspace.getFramingBox(),
          );
        }
      },
    );

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        useViewportStore.getState().requestView("reset");
      } else if (event.key === "Escape") {
        useObjectStore.getState().selectObject(null);
      } else if (
        TRANSFORM_KEYS[event.code] &&
        useObjectStore.getState().selectedObjectId !== null
      ) {
        // Like the mode buttons: active only when an object is selected
        event.preventDefault();
        useViewportStore
          .getState()
          .setTransformMode(TRANSFORM_KEYS[event.code]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribeViewport();
      unsubscribePrinter();
      unsubscribeObjects();
      resizeObserver.disconnect();
      interaction.dispose();
      gizmo.dispose();
      sceneRenderer.stop();
      objectRenderer.dispose();
      workspace.dispose();
      lightingManager.dispose();
      cameraManager.dispose();
      rendererManager.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="renderer-container"
      role="img"
      aria-label={label}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-viewport"
    >
      {unavailable && (
        <p className="px-4 text-center text-sm text-muted-foreground">
          {unavailableMessage}
        </p>
      )}
    </div>
  );
}
