/**
 * Wichy
 * Status Bar Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

interface StatusBarProps {
  projectName?: string;

  objectCount?: number;

  selectedPrinter?: string;

  selectedMaterial?: string;

  selectedFilament?: string;
}

export default function StatusBar(
  props: StatusBarProps
): JSX.Element {
  return (
    <footer
      className="
        flex
        items-center
        justify-between
        border-t
        border-gray-700
        bg-gray-900
        px-4
        py-2
        text-sm
        text-gray-300
      "
    >
      <div>
        Project:{" "}
        {props.projectName ??
          "Untitled"}
      </div>

      <div>
        Objects:{" "}
        {props.objectCount ?? 0}
      </div>

      <div>
        Printer:{" "}
        {props.selectedPrinter ??
          "None"}
      </div>

      <div>
        Material:{" "}
        {props.selectedMaterial ??
          "None"}
      </div>

      <div>
        Filament:{" "}
        {props.selectedFilament ??
          "None"}
      </div>
    </footer>
  );
}
