/**
 * SlicyWeb
 * Viewport Store Definition
 *
 * Viewport state shared between the View menu (GUI) and the 3D
 * viewport:
 * - projection: perspective or orthographic camera;
 * - viewRequest: last view preset requested (View menu, Home key);
 *   requestId changes at each request, so that the same view can be
 *   requested twice.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (View Menu, Camera Views)
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

export interface ViewRequest {
  view: ViewPreset;
  requestId: number;
}

interface ViewportState {
  projection: ViewportProjection;

  viewRequest: ViewRequest | null;

  setProjection: (
    projection: ViewportProjection
  ) => void;

  requestView: (
    view: ViewPreset
  ) => void;
}

export const useViewportStore =
  create<ViewportState>((set) => ({
    projection: "perspective",

    viewRequest: null,

    setProjection: (projection) =>
      set({ projection }),

    requestView: (view) =>
      set((state) => ({
        viewRequest: {
          view,
          requestId: (state.viewRequest?.requestId ?? 0) + 1
        }
      }))
  }));
