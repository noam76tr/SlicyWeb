/**
 * Wichy
 * Filament Panel Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - FILAMENT_SETTINGS_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

import type { Filament } from "../../types/Filament";

interface FilamentPanelProps {
  filament: Filament | null;
}

export default function FilamentPanel(
  props: FilamentPanelProps
): JSX.Element {
  if (!props.filament) {
    return (
      <div
        className="
          p-4
          text-sm
          text-gray-400
        "
      >
        No filament selected.
      </div>
    );
  }

  const filament =
    props.filament;

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
        <strong>Brand:</strong>{" "}
        {filament.brand}
      </div>

      <div>
        <strong>Name:</strong>{" "}
        {filament.name}
      </div>

      <div>
        <strong>Material:</strong>{" "}
        {filament.material}
      </div>

      <div>
        <strong>Color:</strong>{" "}
        {filament.color}
      </div>

      <div>
        <strong>Diameter:</strong>{" "}
        {filament.diameter}
        mm
      </div>

      <div>
        <strong>Density:</strong>{" "}
        {filament.density}
      </div>

      <div>
        <strong>Price per Kg:</strong>{" "}
        {filament.pricePerKg}
      </div>
    </div>
  );
}
