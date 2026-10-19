/**
 * SlicyWeb
 * Viewport Store Definition
 *
 * Viewport state shared between the View menu (GUI) and the 3D
 * viewport:
 * - projection: perspective or orthographic camera;
 * - viewRequest: last view preset requested (View menu, Home key);
 *   requestId changes at each request, so that the same view can be
 *   requested twice;
 * - transformMode: gizmo shown on the selected object (Move by default;
 *   toolbar Move, Rotate, Scale and keys G, R, S, Phase 6).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (View Menu, Camera Views, Object Gizmos, Keyboard Shortcuts)
 * - ARCHITECTURE.md
 */

import { create } from "zustand";

export type ViewportProjection = "perspective" | "orthographic";

/**
 * View presets of GUI_SPEC.md (View Menu, Camera Views).
 * "reset" returns to the default view (isometric, framing the
 * workspace).
 */
export type ViewPreset =
  | "top"
  | "bottom"
  | "front"
  | "back"
  | "left"
  | "right"
  | "isometric"
  | "reset";

/** Gizmo of the selected object (GUI_SPEC.md, Object Gizmos) */
export type TransformMode = "translate" | "rotate" | "scale";

export interface ViewRequest {
  view: ViewPreset;
  requestId: number;
}

interface ViewportState {
  projection: ViewportProjection;

  viewRequest: ViewRequest | null;

  transformMode: TransformMode;

  setProjection: (
    projection: ViewportProjection
  ) => void;

  requestView: (
    view: ViewPreset
  ) => void;

  setTransformMode: (
    mode: TransformMode
  ) => void;
}

export const useViewportStore =
  create<ViewportState>((set) => ({
    projection: "perspective",

    viewRequest: null,

    transformMode: "translate",

    setProjection: (projection) =>
      set({ projection }),

    requestView: (view) =>
      set((state) => ({
        viewRequest: {
          view,
          requestId: (state.viewRequest?.requestId ?? 0) + 1
        }
      })),

    setTransformMode: (transformMode) =>
      set({ transformMode })
  }));
