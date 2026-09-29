/**
 * Wichy
 * Viewport Toolbar Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

interface ViewportToolbarProps {
  onMove?: () => void;

  onRotate?: () => void;

  onScale?: () => void;

  onCenter?: () => void;

  onResetView?: () => void;
}

export default function ViewportToolbar(
  props: ViewportToolbarProps
): JSX.Element {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        border-b
        border-gray-700
        bg-gray-900
        p-2
      "
    >
      <button
        type="button"
        onClick={props.onMove}
      >
        Move
      </button>

      <button
        type="button"
        onClick={props.onRotate}
      >
        Rotate
      </button>

      <button
        type="button"
        onClick={props.onScale}
      >
        Scale
      </button>

      <button
        type="button"
        onClick={props.onCenter}
      >
        Center
      </button>

      <button
        type="button"
        onClick={props.onResetView}
      >
        Reset View
      </button>
    </div>
  );
}
