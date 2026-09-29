/**
 * Wichy
 * Recommendation Panel
 *
 * Responsible for:
 * - Recommendation display
 * - Preset recommendation display
 * - Optimization display
 * - Warning display
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - Recommendation.ts
 */

import type { Recommendation } from "../../types/Recommendation";

interface RecommendationPanelProps {
  recommendation: Recommendation | null;
}

export default function RecommendationPanel({
  recommendation,
}: RecommendationPanelProps): JSX.Element {
  if (!recommendation) {
    return (
      <div className="flex h-full flex-col p-4">
        <h2 className="mb-4 text-lg font-semibold">
          Recommendation
        </h2>

        <div className="text-sm text-neutral-400">
          No recommendation available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <h2 className="text-lg font-semibold">
        Recommendation
      </h2>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Recommended Preset
        </h3>

        <div>
          {recommendation.printPreset}
        </div>

        <div>
          Confidence:{" "}
          {recommendation.confidenceScore}
          %
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Quality Settings
        </h3>

        <div>
          Layer Height:{" "}
          {
            recommendation
              .recommendedProfile
              .quality.layerHeight
          }
        </div>

        <div>
          Wall Count:{" "}
          {
            recommendation
              .recommendedProfile
              .quality.wallCount
          }
        </div>

        <div>
          Top Layers:{" "}
          {
            recommendation
              .recommendedProfile
              .quality.topLayers
          }
        </div>

        <div>
          Bottom Layers:{" "}
          {
            recommendation
              .recommendedProfile
              .quality.bottomLayers
          }
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Infill
        </h3>

        <div>
          Density:{" "}
          {
            recommendation
              .recommendedProfile
              .infillDensity
          }
          %
        </div>

        <div>
          Pattern:{" "}
          {
            recommendation
              .recommendedProfile
              .infillPattern
          }
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Optimization
        </h3>

        <div>
          Orientation Score:{" "}
          {
            recommendation
              .optimization
              .orientationScore
          }
        </div>

        <div>
          Support Reduction:{" "}
          {
            recommendation
              .optimization
              .supportReduction
          }
          %
        </div>

        <div>
          Time Reduction:{" "}
          {
            recommendation
              .optimization
              .timeReduction
          }
          %
        </div>

        <div>
          Material Reduction:{" "}
          {
            recommendation
              .optimization
              .materialReduction
          }
          %
        </div>
      </section>

      <section className="rounded border border-neutral-800 p-3">
        <h3 className="mb-2 font-medium">
          Warnings
        </h3>

        {recommendation.warnings.length ===
        0 ? (
          <div className="text-green-500">
            No warnings.
          </div>
        ) : (
          <ul className="space-y-2">
            {recommendation.warnings.map(
              (warning) => (
                <li
                  key={warning.code}
                  className="rounded border border-neutral-700 p-2"
                >
                  <div className="font-medium">
                    {warning.code}
                  </div>

                  <div className="text-sm text-neutral-400">
                    {warning.message}
                  </div>

                  <div className="text-xs text-yellow-500">
                    Severity:{" "}
                    {warning.severity}
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
