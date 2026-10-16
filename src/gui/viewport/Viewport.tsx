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
 * Domain: Viewport (DOMAINS_DEPENDENCY_MATRIX.md). It does not depend
 * on the GUI: the GUI mounts it and passes its translated label.
 *
 * No business logic.
 * No AI logic.
 * No analysis logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md (3D Viewport, Viewport Controls, Camera Views)
 * - FILE_STRUCTURE.md
 * - DECISIONS.md (ADR-027)
 */

import { useEffect, useRef, useState } from "react";

import { CameraManager } from "../../renderer/CameraManager";
import { LightingManager } from "../../renderer/LightingManager";
import { ObjectRenderer } from "../../renderer/ObjectRenderer";
import { RendererManager } from "../../renderer/RendererManager";
import { SceneRenderer } from "../../renderer/SceneRenderer";
import { WorkspaceHelpers } from "../../renderer/helpers/WorkspaceHelpers";
import { useObjectStore } from "../../state/objectStore";
import { usePrinterStore } from "../../state/printerStore";
import { useViewportStore } from "../../state/viewportStore";

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
}

export default function Viewport({
  label,
  unavailableMessage,
}: ViewportProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [unavailable, setUnavailable] = useState(false);

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
      const { objects, selectedObjectId } = useObjectStore.getState();
      objectRenderer.sync(objects, selectedObjectId);
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

    const unsubscribeViewport = useViewportStore.subscribe((state, previous) => {
      if (state.projection !== previous.projection) {
        cameraManager.setProjection(state.projection);
      }

      if (
        state.viewRequest &&
        state.viewRequest.requestId !== previous.viewRequest?.requestId
      ) {
        cameraManager.setView(state.viewRequest.view, workspace.getFramingBox());
      }
    });

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key === "Home" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        useViewportStore.getState().requestView("reset");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribeViewport();
      unsubscribePrinter();
      unsubscribeObjects();
      resizeObserver.disconnect();
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
