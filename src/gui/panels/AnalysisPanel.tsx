/**
 * Wichy
 * Analysis Panel
 *
 * Responsible for:
 * - Analysis result display
 * - Geometry information display
 * - Mesh statistics display
 * - Classification display
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - Analysis.ts
 */

import type { Analysis } from "../../types/Analysis";

interface AnalysisPanelProps {
  analysis: Analysis | null;
}

export default function AnalysisPanel({
  analysis,
}: AnalysisPanelProps): JSX.Element {
  if (!analysis) {
    return (
      <div className="flex h-full flex-col p-4">
        <h2 className="mb-4 text-lg font-semibold">
          Analysis
        </h2>

        <div className="text-sm text-neutral-400">
          No analysis available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 overflow-auto">
      <h2 className="text-lg font-semibold">
        Analysis
      </h2>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Geometry
        </h3>

        <div>
          Width: {analysis.geometry.width}
        </div>

        <div>
          Depth: {analysis.geometry.depth}
        </div>

        <div>
          Height: {analysis.geometry.height}
        </div>

        <div>
          Volume: {analysis.geometry.volume}
        </div>

        <div>
          Surface: {analysis.geometry.surfaceArea}
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Mesh
        </h3>

        <div>
          Vertices: {analysis.mesh.vertices}
        </div>

        <div>
          Triangles: {analysis.mesh.triangles}
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Stability
        </h3>

        <div>
          Contact Area:{" "}
          {analysis.stability.contactArea}
        </div>

        <div>
          Height Ratio:{" "}
          {analysis.stability.heightRatio}
        </div>

        <div>
          Risk Score:{" "}
          {analysis.stability.riskScore}
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Printability
        </h3>

        <div>
          Overhangs:{" "}
          {analysis.overhangs.detected
            ? "Detected"
            : "None"}
        </div>

        <div>
          Bridges:{" "}
          {analysis.bridges.detected
            ? "Detected"
            : "None"}
        </div>

        <div>
          Thin Walls:{" "}
          {analysis.thinWalls.detected
            ? "Detected"
            : "None"}
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Classification
        </h3>

        <div>
          Category:{" "}
          {analysis.classification.category}
        </div>

        <div>
          Confidence:{" "}
          {
            analysis.classification
              .confidenceScore
          }
          %
        </div>

        <div>
          Level:{" "}
          {
            analysis.classification
              .confidenceLevel
          }
        </div>
      </section>
    </div>
  );
}
