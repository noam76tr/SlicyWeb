/**
 * Wichy
 * Preset Panel Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - PRINT_PRESETS_SPEC.md
 * - PRINT_SETTINGS_SPEC.md
 */

import React from "react";

import type { PrintPreset } from "../../types/PrintPreset";

interface PresetPanelProps {
  preset: PrintPreset | null;
}

export default function PresetPanel(
  props: PresetPanelProps
): JSX.Element {
  if (!props.preset) {
    return (
      <div
        className="
          p-4
          text-sm
          text-gray-400
        "
      >
        No preset selected.
      </div>
    );
  }

  const preset =
    props.preset;

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        p-4
        text-sm
      "
    >
      <div>
        <strong>Name:</strong>{" "}
        {preset.name}
      </div>

      <div>
        <strong>Category:</strong>{" "}
        {preset.category}
      </div>

      <div>
        <strong>Description:</strong>{" "}
        {preset.description}
      </div>

      <div>
        <strong>Layer Height:</strong>{" "}
        {preset.settings.layerHeight}
        mm
      </div>

      <div>
        <strong>Wall Count:</strong>{" "}
        {preset.settings.wallCount}
      </div>

      <div>
        <strong>Infill Density:</strong>{" "}
        {preset.settings.infillDensity}
        %
      </div>

      <div>
        <strong>Infill Pattern:</strong>{" "}
        {preset.settings.infillPattern}
      </div>

      <div>
        <strong>Print Speed:</strong>{" "}
        {preset.settings.printSpeed}
        mm/s
      </div>

      <div>
        <strong>Support Type:</strong>{" "}
        {preset.settings.supportType}
      </div>

      <div>
        <strong>Adhesion Type:</strong>{" "}
        {preset.settings.adhesionType}
      </div>
    </div>
  );
}
