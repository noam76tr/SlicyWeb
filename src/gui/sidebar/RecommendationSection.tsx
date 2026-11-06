/**
 * SlicyWeb
 * Recommendation Section
 *
 * Recommendation of the selected object in the Properties Panel (Phase 10
 * lot 88; GUI_SPEC.md, Recommendation Section; ADR-035 D3, D12 option B):
 * - status: Up to date, Outdated or No recommendation;
 * - visible: Object type (list "Automatic (<category>)" then the 15
 *   categories, with the confidence level of the automatic
 *   classification), Preset, Warnings (translated text of each code, the
 *   most severe first, with the color of their severity: critical in
 *   red), Recommendation confidence (score out of 100 and its level);
 * - under "Details" (folded by default): quality, infill, supports,
 *   adhesion, temperatures, cooling, speeds, retraction.
 *
 * Values are read-only (the Custom preset comes in Phase 15). Several
 * selected objects: "Select a single object". No printer or no material:
 * "Select a printer and a material" (REC_002). The errors of the
 * generation (REC_001, REC_002) are shown here only. Numbers follow the
 * language (NumberFormatter).
 *
 * No business logic: values read from the stores; the object type is
 * chosen through RecommendationService.
 *
 * Based on:
 * - GUI_SPEC.md (Recommendation Section)
 * - OBJECT_CLASSIFICATION_SPEC.md 1.2.1 (User Choice, Confidence Levels)
 * - RECOMMENDATION_RULES.md 1.1.2 (Recommendation Warnings, Confidence)
 * - ERROR_CODES_SPEC.md (REC_001, REC_002)
 * - DECISIONS.md (ADR-035 D3, D9, D12)
 */

import { CLASSIFICATION_CATEGORIES } from "../../constants/AnalysisConstants";
import { RECOMMENDATION_CONFIDENCE_LEVELS } from "../../constants/RecommendationConstants";
import { formatNumber } from "../../i18n/NumberFormatter";
import {
  RecommendationService,
  automaticClassificationOf,
  classificationConfidenceLevel,
} from "../../services/RecommendationService";
import { useAnalysisStore } from "../../state/analysisStore";
import { useMaterialStore } from "../../state/materialStore";
import { usePrinterStore } from "../../state/printerStore";
import { useRecommendationStore } from "../../state/recommendationStore";
import { useRecommendationTaskStore } from "../../state/recommendationTaskStore";
import type { ClassificationCategory } from "../../types/Classification";
import type { WarningSeverity } from "../../types/Warning";
import { useTranslation } from "../hooks/useTranslation";

import { ProfileRow, SELECT_CLASS } from "./profileRows";

/** Id of the list Object type */
export const OBJECT_TYPE_SELECTOR_ID = "object-type-selector";

/** Value of "Automatic" in the list Object type */
const AUTOMATIC = "";

interface RecommendationSectionProps {
  /** Selected objects */
  objectIds: string[];
}

/** "mechanical_part" → "mechanicalPart" (keys of the dictionaries) */
function camel(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

/** Dictionary key of a category of classification */
export function categoryKey(category: string): string {
  return `classification.${camel(category)}`;
}

/** Dictionary key of the name of a preset (preset.<category>) */
export function presetKey(category: string): string {
  return `preset.${camel(category)}`;
}

/** Dictionary key of the level of a recommendation confidence */
export function recommendationLevelKey(score: number): string {
  const found =
    RECOMMENDATION_CONFIDENCE_LEVELS.find(({ min }) => score >= min) ??
    RECOMMENDATION_CONFIDENCE_LEVELS[
      RECOMMENDATION_CONFIDENCE_LEVELS.length - 1
    ];

  return `recommendation.level.${found.level}`;
}

/** Color of a warning by its severity (critical in red) */
const SEVERITY_CLASS: Record<WarningSeverity, string> = {
  critical: "text-destructive font-medium",
  high: "text-warning",
  medium: "text-warning",
  low: "text-foreground",
  info: "text-muted-foreground",
};

export default function RecommendationSection({
  objectIds,
}: RecommendationSectionProps): JSX.Element {
  const { t, language } = useTranslation();
  const objectId = objectIds.length === 1 ? objectIds[0] : null;

  const classification = useAnalysisStore((state) =>
    objectId ? (state.analysis[objectId]?.classification ?? null) : null,
  );
  const recommendation = useRecommendationStore((state) =>
    objectId ? state.recommendations[objectId] : undefined,
  );
  const error = useRecommendationTaskStore((state) =>
    objectId ? state.errors[objectId] : undefined,
  );
  const hasPrinter = usePrinterStore((state) => state.selectedPrinter !== null);
  const hasMaterial = useMaterialStore(
    (state) => state.selectedMaterial !== null,
  );

  const number = (value: number): string => formatNumber(value, language);

  if (objectIds.length > 1) {
    return <p>{t("analysis.selectSingle")}</p>;
  }

  if (!objectId) {
    return <p>{t("object.noSelection")}</p>;
  }

  const status = recommendation
    ? t(`result.${recommendation.status}`)
    : t("recommendation.none");

  const automatic = classification
    ? automaticClassificationOf(classification)
    : null;

  const objectType = classification && automatic && (
    <div className="space-y-1">
      <label className="block space-y-1">
        <span className="font-medium text-foreground">
          {t("recommendation.objectType")}
        </span>
        <select
          id={OBJECT_TYPE_SELECTOR_ID}
          value={
            classification.source === "user"
              ? classification.category
              : AUTOMATIC
          }
          onChange={(event) => {
            const value = event.target.value;
            RecommendationService.chooseObjectType(
              objectId,
              value === AUTOMATIC ? null : (value as ClassificationCategory),
            );
          }}
          className={SELECT_CLASS}
        >
          <option value={AUTOMATIC}>
            {t("recommendation.automatic", {
              category: t(categoryKey(automatic.category)),
            })}
          </option>
          {CLASSIFICATION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t(categoryKey(category))}
            </option>
          ))}
        </select>
      </label>
      <dl>
        <ProfileRow
          label={t("recommendation.classificationConfidence")}
          value={t(
            `confidence.${camel(classificationConfidenceLevel(automatic.confidenceScore))}`,
          )}
        />
      </dl>
    </div>
  );

  const header = (
    <>
      <dl className="space-y-1">
        <ProfileRow label={t("recommendation.status")} value={status} />
      </dl>

      {objectType}

      {!(hasPrinter && hasMaterial) && (
        <p role="note">{t("recommendation.selectPrinterMaterial")}</p>
      )}

      {error && hasPrinter && hasMaterial && (
        <p
          role="note"
          className={error === "REC_001" ? "text-destructive" : ""}
        >
          {t(`recommendation.error.${error}`)}
        </p>
      )}
    </>
  );

  if (!recommendation) {
    return (
      <div className="space-y-2" data-recommendation-status="none">
        {header}
      </div>
    );
  }

  const profile = recommendation.recommendedProfile;
  const { quality, speed, retraction, supports, temperature } = profile;
  const pattern = t(`recommendation.pattern.${profile.infillPattern}`);
  const speedValue = (value: number): string => `${number(value)} mm/s`;

  return (
    <div
      className="space-y-2"
      data-recommendation-status={recommendation.status}
    >
      {header}

      <dl className="space-y-1">
        <ProfileRow
          label={t("recommendation.preset")}
          value={t(presetKey(recommendation.preset.category))}
        />
      </dl>

      <p className="font-medium text-foreground">
        {t("recommendation.warnings")}
      </p>

      {recommendation.warnings.length > 0 ? (
        <ul className="space-y-0.5" aria-label={t("recommendation.warnings")}>
          {recommendation.warnings.map((warning) => (
            <li
              key={warning.code}
              data-severity={warning.severity}
              className={SEVERITY_CLASS[warning.severity]}
            >
              {t(`warning.${warning.code}`)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("recommendation.noWarnings")}</p>
      )}

      <dl className="space-y-1">
        <ProfileRow
          label={t("recommendation.confidence")}
          value={t("recommendation.confidenceValue", {
            score: number(recommendation.confidenceScore),
            level: t(recommendationLevelKey(recommendation.confidenceScore)),
          })}
        />
      </dl>

      <details>
        <summary className="cursor-default font-medium text-foreground">
          {t("recommendation.details")}
        </summary>

        <dl className="mt-1 space-y-1">
          <ProfileRow
            label={t("recommendation.layerHeight")}
            value={`${number(quality.layerHeight)} mm`}
          />
          <ProfileRow
            label={t("recommendation.walls")}
            value={number(quality.wallCount)}
          />
          <ProfileRow
            label={t("recommendation.topBottomLayers")}
            value={`${number(quality.topLayers)} / ${number(quality.bottomLayers)}`}
          />
          <ProfileRow
            label={t("recommendation.infill")}
            value={t("recommendation.infillValue", {
              density: number(profile.infillDensity),
              pattern:
                pattern === `recommendation.pattern.${profile.infillPattern}`
                  ? profile.infillPattern
                  : pattern,
            })}
          />
          <ProfileRow
            label={t("recommendation.supports")}
            value={
              supports.enabled
                ? t("recommendation.supportsYes", {
                    type: t(`recommendation.supportType.${supports.type}`),
                  })
                : t("recommendation.supportsNo")
            }
          />
          <ProfileRow
            label={t("recommendation.adhesion")}
            value={t(`recommendation.adhesionType.${profile.adhesion}`)}
          />
          <ProfileRow
            label={t("recommendation.nozzleTemperature")}
            value={`${number(temperature.nozzle)} °C`}
          />
          <ProfileRow
            label={t("recommendation.bedTemperature")}
            value={`${number(temperature.bed)} °C`}
          />
          <ProfileRow
            label={t("recommendation.fan")}
            value={`${number(profile.cooling.fanSpeed)} %`}
          />
        </dl>

        <p className="mt-2 font-medium text-foreground">
          {t("recommendation.speeds")}
        </p>

        <dl className="space-y-1">
          <ProfileRow
            label={t("recommendation.speed.print")}
            value={speedValue(speed.print)}
          />
          <ProfileRow
            label={t("recommendation.speed.outerWall")}
            value={speedValue(speed.outerWall)}
          />
          <ProfileRow
            label={t("recommendation.speed.innerWall")}
            value={speedValue(speed.innerWall)}
          />
          <ProfileRow
            label={t("recommendation.speed.infill")}
            value={speedValue(speed.infill)}
          />
          <ProfileRow
            label={t("recommendation.speed.travel")}
            value={speedValue(speed.travel)}
          />
          <ProfileRow
            label={t("recommendation.retraction")}
            // Isolated: two values with their units stay in order in Hebrew
            value={`\u2068${t("recommendation.retractionValue", {
              distance: number(retraction.distance),
              speed: number(retraction.speed),
            })}\u2069`}
          />
        </dl>
      </details>
    </div>
  );
}
