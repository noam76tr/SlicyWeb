/**
 * Wichy
 * Viewport Status Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 * - DATA_SCHEMA.md
 */

import React from "react";

interface ViewportStatusProps {
  objectCount: number;

  selectedObjectName?: string;

  cameraMode?: string;

  fps?: number;
}

export default function ViewportStatus(
  props: ViewportStatusProps
): JSX.Element {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-t
        border-gray-700
        bg-gray-900
        px-3
        py-2
        text-sm
      "
    >
      <div>
        Objects: {props.objectCount}
      </div>

      <div>
        Selected:{" "}
        {props.selectedObjectName ??
          "None"}
      </div>

      <div>
        Camera:{" "}
        {props.cameraMode ??
          "Perspective"}
      </div>

      <div>
        FPS: {props.fps ?? 0}
      </div>
    </div>
  );
}
