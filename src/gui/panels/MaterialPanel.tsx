/**
 * Wichy
 * Material Panel Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - MATERIAL_PROFILE_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

import type { Material } from "../../types/Material";

interface MaterialPanelProps {
  material: Material | null;
}

export default function MaterialPanel(
  props: MaterialPanelProps
): JSX.Element {
  if (!props.material) {
    return (
      <div
        className="
          p-4
          text-sm
          text-gray-400
        "
      >
        No material selected.
      </div>
    );
  }

  const material =
    props.material;

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
        {material.name}
      </div>

      <div>
        <strong>Category:</strong>{" "}
        {material.category}
      </div>

      <div>
        <strong>Description:</strong>{" "}
        {material.description}
      </div>

      <div>
        <strong>Nozzle:</strong>{" "}
        {material.temperature.minNozzle}
        °C -
        {" "}
        {material.temperature.maxNozzle}
        °C
      </div>

      <div>
        <strong>Bed:</strong>{" "}
        {material.temperature.minBed}
        °C -
        {" "}
        {material.temperature.maxBed}
        °C
      </div>

      <div>
        <strong>Cooling:</strong>{" "}
        {material.cooling.fanMin}
        % -
        {" "}
        {material.cooling.fanMax}
        %
      </div>

      <div>
        <strong>Density:</strong>{" "}
        {material.physical.density}
      </div>

      <div>
        <strong>Shrinkage:</strong>{" "}
        {material.physical.shrinkage}
        %
      </div>

      <div>
        <strong>Warping Risk:</strong>{" "}
        {material.physical.warpingRisk}
      </div>
    </div>
  );
}
