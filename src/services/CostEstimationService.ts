/**
 * SlicyWeb
 * Cost Estimation Service Definition
 *
 * Keeps the estimation of each object up to date (Phase 12, ADR-037;
 * answers of Noam to lot 107, Q13 A):
 * - start(): the estimation of an object is computed by itself as soon as
 *   its recommendation is up to date (with its analysis and the areas of
 *   its faces), and again when a cost setting, the price of the filament
 *   or the list of the objects changes; an object whose recommendation
 *   is outdated, missing or failed has no estimation ("—"). No menu, no
 *   button. Computed at once in the window: a few multiplications per
 *   object (the areas of the faces come from the Web Worker of the
 *   analysis).
 * - totalOf(): sum of several objects (the selection, or the visible
 *   objects of the plate: a hidden object is not counted, as at export).
 *
 * Nothing is saved (Q14 A).
 *
 * Domain: Service. Depends on the Cost Estimation Domain (CostCalculator),
 * State Management and CostSettingsService (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules, Print Estimation Rules)
 * - DECISIONS.md (ADR-037)
 * - GUI_SPEC.md (Estimation Section, Status Bar)
 */

import { currencyDigits } from "../constants/CostConstants";
import { CostCalculator } from "../cost_engine/CostCalculator";
import { useAnalysisStore } from "../state/analysisStore";
import { useAnalysisTaskStore } from "../state/analysisTaskStore";
import { useCostSettingsStore } from "../state/costSettingsStore";
import { useEstimationStore } from "../state/estimationStore";
import { useFilamentStore } from "../state/filamentStore";
import { useObjectStore } from "../state/objectStore";
import { usePrinterStore } from "../state/printerStore";
import { useRecommendationStore } from "../state/recommendationStore";
import type {
  EstimationTotal,
  ObjectEstimation,
} from "../types/CostEstimation";

import { CostSettingsService } from "./CostSettingsService";

const calculator = new CostCalculator();

/** Computes the estimation of every object that can have one */
function update(): void {
  const objects = useObjectStore.getState().objects;
  const analyses = useAnalysisStore.getState().analysis;
  const { faceAreas } = useAnalysisTaskStore.getState();
  const recommendations = useRecommendationStore.getState().recommendations;
  const printer = usePrinterStore.getState().selectedPrinter;
  const { filaments } = useFilamentStore.getState();
  const settings = useCostSettingsStore.getState().settings;
  const digits = currencyDigits(settings.currency);

  const estimations: Record<string, ObjectEstimation> = {};
  const noVolume: string[] = [];

  for (const object of objects) {
    const { objectId } = object;
    const analysis = analyses[objectId];
    const recommendation = recommendations[objectId];
    const areas = faceAreas[objectId];

    if (
      !analysis ||
      analysis.status !== "generated" ||
      !recommendation ||
      recommendation.status !== "generated" ||
      !areas ||
      printer === null ||
      printer.id !== recommendation.printerId
    ) {
      continue;
    }

    if (!(analysis.geometry.volume > 0)) {
      noVolume.push(objectId);
      continue;
    }

    const filament =
      recommendation.filamentId === null
        ? null
        : (filaments.find((item) => item.id === recommendation.filamentId) ??
          null);

    estimations[objectId] = calculator.estimateObject({
      objectId,
      recommendationId: recommendation.recommendationId,
      profile: recommendation.recommendedProfile,
      volume: analysis.geometry.volume,
      height: analysis.dimensions.height,
      faceAreas: areas,
      nozzle: printer.defaultNozzle,
      filament,
      pricePerKg: filament
        ? CostSettingsService.pricePerKgOf(filament, settings)
        : null,
      powerW: settings.printerPower[printer.id] ?? null,
      pricePerKwh: settings.electricityPrice,
      digits,
    });
  }

  useEstimationStore.getState().setEstimations(estimations, noVolume);
}

let scheduled = false;
let stopWatching: (() => void) | null = null;

function schedule(): void {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(() => {
    if (scheduled && stopWatching) {
      scheduled = false;
      update();
    }
  });
}

export const CostEstimationService = {
  /** Starts the automatic estimation; returns the function that stops it */
  start(): () => void {
    stopWatching?.();

    const unsubscribes = [
      useObjectStore.subscribe((state, before) => {
        if (state.objects !== before.objects) schedule();
      }),
      useAnalysisStore.subscribe((state, before) => {
        if (state.analysis !== before.analysis) schedule();
      }),
      useAnalysisTaskStore.subscribe((state, before) => {
        if (state.faceAreas !== before.faceAreas) schedule();
      }),
      useRecommendationStore.subscribe((state, before) => {
        if (state.recommendations !== before.recommendations) schedule();
      }),
      usePrinterStore.subscribe((state, before) => {
        if (state.selectedPrinter !== before.selectedPrinter) schedule();
      }),
      useFilamentStore.subscribe((state, before) => {
        if (
          state.filaments !== before.filaments ||
          state.userFilamentIds !== before.userFilamentIds
        ) {
          schedule();
        }
      }),
      useCostSettingsStore.subscribe((state, before) => {
        if (state.settings !== before.settings) schedule();
      }),
    ];

    const stop = (): void => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }

      scheduled = false;

      if (stopWatching === stop) {
        stopWatching = null;
      }
    };

    stopWatching = stop;
    update();

    return stop;
  },

  /** Runs at once the work waiting for the end of the change (tests) */
  flush(): void {
    if (scheduled) {
      scheduled = false;
      update();
    }
  },

  /**
   * Sum of the estimations of these objects; missing counts those without
   * an estimation
   */
  totalOf(
    objectIds: readonly string[],
    estimations: Record<
      string,
      ObjectEstimation
    > = useEstimationStore.getState().estimations,
  ): EstimationTotal {
    const found: ObjectEstimation[] = [];
    let missing = 0;

    for (const objectId of objectIds) {
      const estimation = estimations[objectId];

      if (estimation) {
        found.push(estimation);
      } else {
        missing += 1;
      }
    }

    return calculator.sum(
      found,
      missing,
      currencyDigits(useCostSettingsStore.getState().settings.currency),
    );
  },

  /** Visible objects of the plate (a hidden object is not counted) */
  plateObjectIds(): string[] {
    return useObjectStore
      .getState()
      .objects.filter((object) => object.visible)
      .map((object) => object.objectId);
  },
};

export default CostEstimationService;
