/**
 * SlicyWeb
 * Recommendation Service Definition
 *
 * Generates the recommendation of each object with the recommendation
 * engine (Phase 10 lot 87) and keeps it in the recommendation store
 * (Phase 10 lot 88; ADR-035 D3, D11):
 * - loadPresets(): reads the presets loaded by the main process
 *   (preset:getAll), validates them with PresetSchema and puts them in the
 *   preset store; the window reads no preset file (ADR-035 D4). Outside
 *   Electron (no window.slicyWeb), nothing is loaded.
 * - start(): automatic generation (ADR-035 D11): each object whose
 *   analysis is up to date gets a recommendation as soon as a printer and
 *   a material are selected; the filament is optional. A change of the
 *   selected printer, material or filament makes the recommendations of
 *   all the objects outdated, then they are generated again at once
 *   (DATA_SCHEMA.md, Object Reference Rules, rule 11); without a printer
 *   or a material they stay outdated. Rules only, computed at once in the
 *   window (no Web Worker).
 * - generate(): Tools > Generate Recommendations and the Generate button:
 *   the given objects again, even when their recommendation is up to date.
 * - chooseObjectType(): the object type chosen in the Recommendation
 *   section (OBJECT_CLASSIFICATION_SPEC.md 1.2.1, User Choice): a category
 *   (source user) or null for "Automatic"; kept in the classification of
 *   the analysis of the object; its recommendation becomes outdated, then
 *   is generated again (rule 11). Not part of Undo / Redo.
 *
 * Errors (ERROR_CODES_SPEC.md, Recommendation Errors): REC_002 Insufficient
 * Data (information) and REC_001 Recommendation Failed are kept in the
 * recommendation task store for the Recommendation section; no
 * recommendation is stored (an outdated one stays outdated). The object is
 * not tried again until its analysis or the selection changes, or
 * Generate Recommendations is chosen.
 *
 * The work is started after the change that asked for it is over (a
 * microtask): the analysis service stores the analysis, then the
 * indicator of a mesh not closed (ANA_002), read for the confidence.
 *
 * Domain: Service. Depends on the Recommendation Domain
 * (RecommendationEngine), the Classification Domain (ClassificationEngine),
 * the Validation Domain (PresetSchema), State Management and the IPC
 * bridge (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - ARCHITECTURE.md
 * - AI_ENGINE_SPEC.md
 * - RECOMMENDATION_RULES.md 1.1.2
 * - DATA_SCHEMA.md (3.10.0: Object Reference Rules, Classification Rules)
 * - DECISIONS.md (ADR-035 D3, D4, D11)
 * - ERROR_CODES_SPEC.md (REC_001, REC_002)
 * - API_SPEC.md (PresetIPC Channels)
 * - GUI_SPEC.md (Tools Menu, Toolbar Buttons, Recommendation Section)
 */

import { z } from "zod";

import { ClassificationEngine } from "../classification_engine/ClassificationEngine";
import { ConfidenceScorer } from "../classification_engine/ConfidenceScorer";
import {
  RecommendationEngine,
  type RecommendationInput,
} from "../recommendation_engine/RecommendationEngine";
import { PresetSchema } from "../schemas/PrintPresetSchema";
import { useAnalysisStore } from "../state/analysisStore";
import { useAnalysisTaskStore } from "../state/analysisTaskStore";
import { useFilamentStore } from "../state/filamentStore";
import { useMaterialStore } from "../state/materialStore";
import { useObjectStore } from "../state/objectStore";
import { usePresetStore } from "../state/presetStore";
import { usePrinterStore } from "../state/printerStore";
import { useRecommendationStore } from "../state/recommendationStore";
import {
  useRecommendationTaskStore,
  type RecommendationErrorCode,
} from "../state/recommendationTaskStore";
import type { Analysis } from "../types/Analysis";
import type {
  Classification,
  ClassificationCategory,
  ConfidenceLevel,
} from "../types/Classification";
import type { PrintPreset } from "../types/PrintPreset";
import type { Recommendation } from "../types/Recommendation";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const PresetsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ presets: z.array(PresetSchema) }),
});

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

/** What the service needs from the rest of the application */
export interface RecommendationServiceDependencies {
  /** Generation of one recommendation (RecommendationEngine) */
  generate: (input: RecommendationInput) => Recommendation;

  /** Reads the presets (preset:getAll); null outside Electron */
  readPresets: () => Promise<unknown>;
}

export interface RecommendationServiceInstance {
  /** Reads the presets of the main process into the preset store */
  loadPresets: () => Promise<void>;

  /**
   * Starts the automatic generation; returns the function that stops it.
   */
  start: () => () => void;

  /** Tools > Generate Recommendations: these objects, even up to date */
  generate: (objectIds: string[]) => void;

  /** Object type of an object: a category, or null for "Automatic" */
  chooseObjectType: (
    objectId: string,
    category: ClassificationCategory | null,
  ) => void;

  /** Runs at once the work waiting for the end of the change (tests) */
  flush: () => void;
}

/** A printer and a material are selected: recommendations can be made */
export function canRecommend(): boolean {
  return (
    usePrinterStore.getState().selectedPrinter !== null &&
    useMaterialStore.getState().selectedMaterial !== null
  );
}

/**
 * Automatic classification of an object ("Automatic (<category>)"),
 * from the features measured by its last analysis.
 */
export function automaticClassificationOf(
  classification: Classification,
): Classification {
  return classification.source === "automatic"
    ? classification
    : ClassificationEngine.automaticOf(classification);
}

/**
 * Confidence level of a classification (OBJECT_CLASSIFICATION_SPEC.md,
 * Confidence Levels): not stored, computed from the score.
 */
export function classificationConfidenceLevel(score: number): ConfidenceLevel {
  return ConfidenceScorer.getLevel(score);
}

/** Selections the recommendations depend on (rule 11) */
interface Selection {
  printer: RecommendationInput["printer"];
  printerIsUser: boolean;
  material: RecommendationInput["material"];
  filament: RecommendationInput["filament"];
  filamentIsUser: boolean;
  presets: PrintPreset[];
}

function readSelection(): Selection {
  const { selectedPrinter: printer, userPrinterIds } =
    usePrinterStore.getState();
  const { selectedFilament: filament, userFilamentIds } =
    useFilamentStore.getState();

  return {
    printer,
    printerIsUser: printer !== null && userPrinterIds.includes(printer.id),
    material: useMaterialStore.getState().selectedMaterial,
    filament,
    filamentIsUser: filament !== null && userFilamentIds.includes(filament.id),
    presets: usePresetStore.getState().presets,
  };
}

function sameSelection(a: Selection, b: Selection): boolean {
  return (
    a.printer === b.printer &&
    a.printerIsUser === b.printerIsUser &&
    a.material === b.material &&
    a.filament === b.filament &&
    a.filamentIsUser === b.filamentIsUser &&
    a.presets === b.presets
  );
}

/** Code of an error of the engine ("REC_002 Insufficient Data: …") */
function errorCode(error: unknown): RecommendationErrorCode {
  return error instanceof Error && error.message.startsWith("REC_002")
    ? "REC_002"
    : "REC_001";
}

export function createRecommendationService(
  dependencies: RecommendationServiceDependencies,
): RecommendationServiceInstance {
  let selection: Selection | null = null;

  /** Analysis used by the last failed generation of each object */
  const failed = new Map<string, Analysis>();

  /** Objects to generate even when up to date (generate) */
  const forced = new Set<string>();

  let scheduled = false;
  let stopWatching: (() => void) | null = null;

  const generateOne = (analysis: Analysis, current: Selection): void => {
    const { objectId } = analysis;

    try {
      const recommendation = dependencies.generate({
        analysis,
        meshClosed: !useAnalysisTaskStore
          .getState()
          .openMeshObjectIds.includes(objectId),
        printer: current.printer,
        printerIsUser: current.printerIsUser,
        material: current.material,
        filament: current.filament,
        filamentIsUser: current.filamentIsUser,
        presets: current.presets,
      });

      failed.delete(objectId);
      useRecommendationTaskStore.getState().clearError(objectId);
      useRecommendationStore.getState().setRecommendation(recommendation);
    } catch (error) {
      const code = errorCode(error);

      if (code === "REC_001") {
        console.error(`Recommendation failed: ${objectId}`, error);
      }

      failed.set(objectId, analysis);
      useRecommendationTaskStore.getState().setError(objectId, code);
    }
  };

  const update = (): void => {
    scheduled = false;

    const objects = useObjectStore.getState().objects;
    const ids = new Set(objects.map((object) => object.objectId));

    for (const objectId of [...failed.keys()]) {
      if (!ids.has(objectId)) {
        failed.delete(objectId);
      }
    }

    for (const objectId of Object.keys(
      useRecommendationTaskStore.getState().errors,
    )) {
      if (!ids.has(objectId)) {
        useRecommendationTaskStore.getState().clearError(objectId);
      }
    }

    // Rule 11: a change of the selection makes all the recommendations
    // outdated
    const current = readSelection();

    if (selection && !sameSelection(selection, current)) {
      const store = useRecommendationStore.getState();

      for (const objectId of Object.keys(store.recommendations)) {
        store.markRecommendationOutdated(objectId);
      }

      failed.clear();
      useRecommendationTaskStore.getState().clearErrors();
    }

    selection = current;

    if (current.printer === null || current.material === null) {
      forced.clear();
      return;
    }

    const analyses = useAnalysisStore.getState().analysis;
    const recommendations = useRecommendationStore.getState().recommendations;

    for (const object of objects) {
      const { objectId } = object;
      const analysis = analyses[objectId];
      const force = forced.has(objectId);

      if (
        !analysis ||
        analysis.status !== "generated" ||
        analysis.classification === null
      ) {
        continue;
      }

      if (!force) {
        if (recommendations[objectId]?.status === "generated") {
          continue;
        }

        // Not tried again with the same analysis and selection
        if (failed.get(objectId) === analysis) {
          continue;
        }
      }

      generateOne(analysis, current);
    }

    forced.clear();
  };

  const schedule = (): void => {
    if (scheduled) {
      return;
    }

    scheduled = true;
    queueMicrotask(() => {
      if (scheduled && stopWatching) {
        update();
      }
    });
  };

  return {
    async loadPresets() {
      try {
        const response = await dependencies.readPresets();

        if (response === null) {
          return;
        }

        const result = PresetsResponseSchema.safeParse(response);

        if (!result.success) {
          console.error("Presets could not be read.", result.error.issues);
          return;
        }

        usePresetStore.getState().setPresets(result.data.data.presets);
      } catch (error) {
        console.error("Presets could not be read.", error);
      }
    },

    start() {
      stopWatching?.();

      const unsubscribes = [
        useObjectStore.subscribe((state, before) => {
          if (state.objects !== before.objects) {
            schedule();
          }
        }),
        useAnalysisStore.subscribe((state, before) => {
          if (state.analysis !== before.analysis) {
            schedule();
          }
        }),
        usePrinterStore.subscribe((state, before) => {
          if (
            state.selectedPrinter !== before.selectedPrinter ||
            state.userPrinterIds !== before.userPrinterIds
          ) {
            schedule();
          }
        }),
        useMaterialStore.subscribe((state, before) => {
          if (state.selectedMaterial !== before.selectedMaterial) {
            schedule();
          }
        }),
        useFilamentStore.subscribe((state, before) => {
          if (
            state.selectedFilament !== before.selectedFilament ||
            state.userFilamentIds !== before.userFilamentIds
          ) {
            schedule();
          }
        }),
        usePresetStore.subscribe((state, before) => {
          if (state.presets !== before.presets) {
            schedule();
          }
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
      selection = null;
      update();

      return stop;
    },

    generate(objectIds) {
      for (const objectId of objectIds) {
        failed.delete(objectId);
        forced.add(objectId);
      }

      update();
    },

    chooseObjectType(objectId, category) {
      const analysis = useAnalysisStore.getState().analysis[objectId];
      const classification = analysis?.classification;

      if (!analysis || !classification) {
        return;
      }

      const next =
        category === null
          ? automaticClassificationOf(classification)
          : ClassificationEngine.chooseCategory(classification, category);

      if (
        next.source === classification.source &&
        next.category === classification.category
      ) {
        return;
      }

      failed.delete(objectId);
      useRecommendationTaskStore.getState().clearError(objectId);

      // The analysis keeps its status and its values; its recommendation
      // becomes outdated (rule 11)
      useAnalysisStore
        .getState()
        .setAnalysis({ ...analysis, classification: next });
    },

    flush() {
      if (scheduled) {
        update();
      }
    },
  };
}

const engine = new RecommendationEngine();

export const RecommendationService: RecommendationServiceInstance =
  createRecommendationService({
    generate: (input) => engine.generateRecommendation(input),
    readPresets: async () => {
      const bridge = getBridge();

      return bridge ? bridge.invoke("preset:getAll") : null;
    },
  });

/**
 * Tools > Generate Recommendations and the Generate button: the selected
 * objects, all the objects when none is selected (ADR-035 D11).
 */
export function generateRecommendations(): void {
  const { objects, selectedObjectIds } = useObjectStore.getState();

  RecommendationService.generate(
    selectedObjectIds.length > 0
      ? [...selectedObjectIds]
      : objects.map((object) => object.objectId),
  );
}

export default RecommendationService;
