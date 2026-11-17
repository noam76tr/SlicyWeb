/**
 * SlicyWeb
 * Viewport
 *
 * Responsible for:
 * - Renderer container
 * - 3D viewport hosting
 * - Renderer lifecycle
 *
 * The viewport shows the coordinate grid and, when a printer is
 * selected, its build plate with its name (WorkspaceHelpers), and the
 * objects of the scene (ObjectRenderer, object store). The navigation
 * cube (NavigationCube), in the bottom corner on the end side, turns with
 * the camera and carries the axes X, Y, Z; a click on a face asks for its
 * view, like the View menu (viewport store).
 * Camera: mouse controls of GUI_SPEC.md (CameraManager); projection
 * and view presets come from the View menu (viewport store);
 * the Home key resets the view (GUI_SPEC.md, Keyboard Shortcuts).
 *
 * The canvas follows the size of its container (ResizeObserver):
 * window resize, side panels resized or collapsed.
 *
 * Objects (Phase 6): click to select, Ctrl+click to add or remove an
 * object, click in the empty space to clear the selection, drag in the
 * empty space to select with a rectangle (Ctrl: added), drag an object
 * (or the group it belongs to) to move it on the plate
 * (ObjectInteraction); gizmo on the selected object or at the center of
 * the group (TransformGizmo): Move, Rotate, Scale, chosen with the mode
 * buttons over the viewport (GUI) or the keys G, R, S; the tips of the Move
 * arrows (lot 102) and the handles of Scale are placed beside the selected
 * objects, from their box, and the Rotate rings around them (lot 103), and
 * the cursor shows what a drag does; the lock of the scale
 * (keepProportions) applies to the Scale gizmo as to the Transform section;
 * Escape clears the selection (GUI_SPEC.md, Keyboard Shortcuts).
 *
 * Context menu (lot 105, decisions of Noam Q1 to Q11 A): a right click
 * without drag on an object (selected first when it was not) or in the
 * empty space is given to onContextMenu (ObjectInteraction); the Menu key
 * or Shift+F10, when no other element handled it, opens the menu of the
 * selection at the center of the selection on the screen, or the menu of
 * the scene at the center of the view when nothing is selected (Q9 A).
 * The keys of the viewport (G, R, S, Escape, Home) are not read inside an
 * open menu or window: Escape closes the menu and keeps the selection.
 *
 * Overhang Display (lot 82): when it is on (viewport store), the
 * triangles beyond 45 degrees of every object of the scene, selected or
 * not (decision of Noam, Q1 B), are drawn in red, as found by its analysis (analysis task store), only while that analysis
 * is up to date: nothing during a rotation or a scale, until the object is
 * analyzed again. The viewport only draws them: it computes nothing.
 *
 * Plate Check (lot 101): the objects out of the build volume, found by
 * PlateCheckService (plate check store), are drawn in orange, also during
 * a gesture; the viewport only draws them.
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
 * - GUI_SPEC.md (3D Viewport, Viewport Controls, Camera Views, Navigation Cube,
 *   Overhang Display, Plate Check)
 * - FILE_STRUCTURE.md
 * - DECISIONS.md (ADR-027, ADR-031)
 */

import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

import { CameraManager } from "../../renderer/CameraManager";
import { LightingManager } from "../../renderer/LightingManager";
import { ObjectInteraction } from "../../renderer/ObjectInteraction";
import { ObjectRenderer } from "../../renderer/ObjectRenderer";
import { RendererManager } from "../../renderer/RendererManager";
import { SceneRenderer } from "../../renderer/SceneRenderer";
import { TransformGizmo } from "../../renderer/TransformGizmo";
import { WorkspaceHelpers } from "../../renderer/helpers/WorkspaceHelpers";
import { keepBoundsOf, objectBounds } from "../../scene/ObjectBounds";
import {
  boundsCenter,
  type Bounds,
  type Vector3Mm,
} from "../../scene/ObjectTransform";
import { useAnalysisStore } from "../../state/analysisStore";
import { useAnalysisTaskStore } from "../../state/analysisTaskStore";
import { useObjectStore } from "../../state/objectStore";
import { usePlateCheckStore } from "../../state/plateCheckStore";
import { usePrinterStore } from "../../state/printerStore";
import {
  useViewportStore,
  type TransformMode,
} from "../../state/viewportStore";

import type { CubeFace } from "../../renderer/NavigationCube";
import type { Object3D, Transform } from "../../types/Object3D";

import NavigationCube, { type NavigationCubeHandle } from "./NavigationCube";

/** Keys of the gizmos (GUI_SPEC.md, Keyboard Shortcuts: G, R, S), by key position */
const TRANSFORM_KEYS: Record<string, TransformMode> = {
  KeyG: "translate",
  KeyR: "rotate",
  KeyS: "scale",
};

/**
 * Box of the objects on the plate (one object or a group): the box of each
 * object comes from ObjectBounds, which keeps it while its geometry,
 * rotation and scale do not change (a move does not read its vertices
 * again; lot 104)
 */
function selectionBounds(objects: Object3D[]): Bounds | null {
  let result: Bounds | null = null;

  for (const object of objects) {
    const box = objectBounds(object);

    if (!box) {
      continue;
    }

    result = result
      ? {
          min: {
            x: Math.min(result.min.x, box.min.x),
            y: Math.min(result.min.y, box.min.y),
            z: Math.min(result.min.z, box.min.z),
          },
          max: {
            x: Math.max(result.max.x, box.max.x),
            y: Math.max(result.max.y, box.max.y),
            z: Math.max(result.max.z, box.max.z),
          },
        }
      : box;
  }

  return result;
}

/** Center of the bounding box of a group of objects, on the plate */
function groupCenter(objects: Object3D[]): Vector3Mm | null {
  const bounds = selectionBounds(objects);

  return bounds ? boundsCenter(bounds) : null;
}

/**
 * Triangles to draw in red: those of all the objects whose analysis is
 * up to date, when the Overhang Display is on
 */
function overhangsToShow(): Map<string, Uint32Array> {
  const shown = new Map<string, Uint32Array>();

  if (!useViewportStore.getState().showOverhangs) {
    return shown;
  }

  const { analysis } = useAnalysisStore.getState();
  const { overhangTriangles } = useAnalysisTaskStore.getState();

  for (const { objectId } of useObjectStore.getState().objects) {
    const triangles = overhangTriangles[objectId];

    if (triangles && analysis[objectId]?.status === "generated") {
      shown.set(objectId, triangles);
    }
  }

  return shown;
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

/**
 * Element of an open menu or window (lot 105): its keys belong to it
 * (Escape closes the context menu without clearing the selection)
 */
function isInMenuOrWindow(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('[role="menu"], [role="dialog"], [role="alertdialog"]') !==
      null
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface ViewportProps {
  /** Accessible name of the viewport, already translated */
  label: string;

  /** Message shown when 3D rendering cannot start, already translated */
  unavailableMessage: string;

  /**
   * Size of the build plate of the selected printer, already translated
   * (GUI_SPEC.md, Plate Display: Build Width, Build Depth); null when no
   * printer is selected.
   */
  plateLabel: string | null;

  /**
   * Name of the selected printer (brand and model), written on the build
   * plate; null when no printer is selected.
   */
  printerName: string | null;

  /** Names of the faces of the navigation cube, already translated */
  cubeLabels: Record<CubeFace, string>;

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

  /**
   * Context menu asked at this position of the window (lot 105): of the
   * selection when objectId is an object (already selected), of the scene
   * when it is null
   */
  onContextMenu: (
    objectId: string | null,
    clientX: number,
    clientY: number,
  ) => void;
}

/**
 * Writes the handles of a gizmo on the screen in a data attribute of the
 * container (end-to-end tests); removed when the gizmo is hidden
 */
function describeHandles(
  container: HTMLElement,
  key: "moveHandles" | "rotateRings" | "scaleHandles",
  handles: Record<string, [number, number]> | null,
): void {
  const described = handles ? JSON.stringify(handles) : "";

  if ((container.dataset[key] ?? "") === described) {
    return;
  }

  if (described) {
    container.dataset[key] = described;
  } else {
    delete container.dataset[key];
  }
}

export default function Viewport({
  label,
  unavailableMessage,
  plateLabel,
  printerName,
  cubeLabels,
  onTransformObjects,
  onTransformGesture,
  onContextMenu,
}: ViewportProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const workspaceRef = useRef<WorkspaceHelpers | null>(null);
  const cubeRef = useRef<NavigationCubeHandle | null>(null);
  const printerNameRef = useRef(printerName);
  printerNameRef.current = printerName;

  // Latest callback, read by the event handlers created once
  const onTransformRef = useRef(onTransformObjects);
  onTransformRef.current = onTransformObjects;
  const onGestureRef = useRef(onTransformGesture);
  onGestureRef.current = onTransformGesture;
  const onContextMenuRef = useRef(onContextMenu);
  onContextMenuRef.current = onContextMenu;

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
    workspaceRef.current = workspace;
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
      (raycaster) => objectRenderer.pick(raycaster),
    );
    gizmo.setMode(useViewportStore.getState().transformMode);
    gizmo.setUniform(useViewportStore.getState().keepProportions);

    const interaction = new ObjectInteraction({
      domElement: rendererManager.getCanvas(),
      getCamera: () => cameraManager.getCamera(),
      pick: (raycaster) => objectRenderer.pick(raycaster),
      isGizmoActive: () => gizmo.isDragging(),
      getGizmoHover: () => gizmo.getHover(),
      getObject: findObject,
      getSelection: () => useObjectStore.getState().selectedObjectIds,
      select: (objectId) => useObjectStore.getState().selectObject(objectId),
      toggle: (objectId) =>
        useObjectStore.getState().toggleObjectSelection(objectId),
      onGesture: (objectIds, phase) => onGestureRef.current(objectIds, phase),
      onMove: (transforms) => {
        onTransformRef.current(transforms, false);
      },
      selectInRect: (rect, add) => {
        const store = useObjectStore.getState();
        const touched = objectRenderer.objectsInRect(
          cameraManager.getCamera(),
          rect,
        );

        store.selectObjects(
          add
            ? [
                ...store.selectedObjectIds,
                ...touched.filter(
                  (id) => !store.selectedObjectIds.includes(id),
                ),
              ]
            : touched,
        );
      },
      onContextMenu: (objectId, clientX, clientY) =>
        onContextMenuRef.current(objectId, clientX, clientY),
    });

    // Printer build plate (none until a printer is selected)
    workspace.setBuildVolume(
      usePrinterStore.getState().selectedPrinter?.buildVolume ?? null,
    );
    workspace.setPrinterName(printerNameRef.current);

    // Initial projection and view
    cameraManager.setProjection(useViewportStore.getState().projection);
    cameraManager.setView("isometric", workspace.getFramingBox());

    sceneRenderer.start(() => {
      cameraManager.update();
      gizmo.update();

      // Handles of the gizmos on the screen, read by the end-to-end tests:
      // tips of the Move arrows, Rotate rings, Scale handles
      describeHandles(container, "moveHandles", gizmo.describeMoveHandles());
      describeHandles(container, "rotateRings", gizmo.describeRotateRings());
      describeHandles(container, "scaleHandles", gizmo.describeScaleHandles());
      cubeRef.current?.update(cameraManager.getCamera().quaternion);
      workspace.updateGridSpacing(
        cameraManager.getPixelsPerMillimeter(rendererManager.getHeight()),
      );
    });

    const resizeObserver = new ResizeObserver(() => {
      rendererManager.resize();
    });
    resizeObserver.observe(container);

    // Red triangles (Overhang Display); their number is read by the
    // end-to-end tests
    const syncOverhangs = (): void => {
      const count = objectRenderer.syncOverhangs(overhangsToShow());

      container.dataset.overhangTriangles = String(count);
    };

    // Objects of the scene (imported models)
    const syncObjects = (): void => {
      const { objects, selectedObjectIds } = useObjectStore.getState();
      const { outsideObjectIds } = usePlateCheckStore.getState();
      objectRenderer.sync(objects, selectedObjectIds, outsideObjectIds);
      syncOverhangs();
      container.dataset.outsideObjects = String(outsideObjectIds.length);

      const selected = objects.filter((object) =>
        selectedObjectIds.includes(object.objectId),
      );
      keepBoundsOf(objects);
      gizmo.attach(
        selected,
        selected.length > 1 ? groupCenter(selected) : null,
        selectionBounds(selected),
      );
    };
    syncObjects();
    const unsubscribeObjects = useObjectStore.subscribe(syncObjects);
    // Objects out of the build volume, in orange (lot 101); their number is
    // read by the end-to-end tests
    const unsubscribePlateCheck = usePlateCheckStore.subscribe(
      (state, previous) => {
        if (state.outsideObjectIds !== previous.outsideObjectIds) {
          syncObjects();
        }
      },
    );
    const unsubscribeAnalyses = useAnalysisStore.subscribe(
      (state, previous) => {
        if (state.analysis !== previous.analysis) {
          syncOverhangs();
        }
      },
    );
    const unsubscribeOverhangs = useAnalysisTaskStore.subscribe(
      (state, previous) => {
        if (state.overhangTriangles !== previous.overhangTriangles) {
          syncOverhangs();
        }
      },
    );

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

        if (state.showOverhangs !== previous.showOverhangs) {
          syncOverhangs();
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
        isEditableTarget(event.target) ||
        isInMenuOrWindow(event.target)
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

    // Menu key or Shift+F10 (lot 105, Q9 A): the browser sends a context
    // menu event that is not from the right button; one not handled by
    // another element (a row of the Object Panel) opens the menu of the
    // selection at its center on the screen, or of the scene
    const handleContextMenu = (event: MouseEvent): void => {
      if (
        event.defaultPrevented ||
        event.button === 2 ||
        isEditableTarget(event.target) ||
        isInMenuOrWindow(event.target)
      ) {
        return;
      }

      event.preventDefault();

      const { objects, selectedObjectIds } = useObjectStore.getState();
      const selected = objects.filter((object) =>
        selectedObjectIds.includes(object.objectId),
      );
      const rect = rendererManager.getCanvas().getBoundingClientRect();
      const center = groupCenter(selected);
      let x = rect.left + rect.width / 2;
      let y = rect.top + rect.height / 2;

      if (center) {
        const point = new Vector3(center.x, center.y, center.z).project(
          cameraManager.getCamera(),
        );
        x = clamp(
          rect.left + ((point.x + 1) / 2) * rect.width,
          rect.left,
          rect.right,
        );
        y = clamp(
          rect.top + ((1 - point.y) / 2) * rect.height,
          rect.top,
          rect.bottom,
        );
      }

      onContextMenuRef.current(selected[0]?.objectId ?? null, x, y);
    };
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      unsubscribeViewport();
      unsubscribePrinter();
      unsubscribeOverhangs();
      unsubscribeAnalyses();
      unsubscribePlateCheck();
      unsubscribeObjects();
      resizeObserver.disconnect();
      interaction.dispose();
      gizmo.dispose();
      sceneRenderer.stop();
      objectRenderer.dispose();
      workspaceRef.current = null;
      workspace.dispose();
      lightingManager.dispose();
      cameraManager.dispose();
      rendererManager.dispose();
    };
  }, []);

  // Printer name on the plate; the plate itself follows the printer store
  useEffect(() => {
    const workspace = workspaceRef.current;
    const container = containerRef.current;

    if (!workspace || !container) {
      return;
    }

    workspace.setPrinterName(printerName);

    // Read by the end-to-end tests: the plate is drawn in the 3D view
    const { plate, name } = workspace.getPlateState();
    if (plate) {
      container.dataset.plate = "true";
    } else {
      delete container.dataset.plate;
    }
    if (name) {
      container.dataset.plateName = name;
    } else {
      delete container.dataset.plateName;
    }
  }, [printerName, plateLabel]);

  // The cube is a sibling of the image of the 3D view: its faces are
  // buttons, which must stay reachable (not inside role="img")
  return (
    <>
      <div
        ref={containerRef}
        id="renderer-container"
        role="img"
        aria-label={label}
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-viewport"
      >
        {plateLabel && !unavailable && (
          <p className="pointer-events-none absolute start-3 bottom-3 rounded bg-card/80 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
            {plateLabel}
          </p>
        )}
        {unavailable && (
          <p className="px-4 text-center text-sm text-muted-foreground">
            {unavailableMessage}
          </p>
        )}
      </div>
      {!unavailable && (
        <NavigationCube
          ref={cubeRef}
          labels={cubeLabels}
          onSelectFace={(face) => useViewportStore.getState().requestView(face)}
        />
      )}
    </>
  );
}
