/**
 * SlicyWeb
 * Analysis Section
 *
 * Analysis of the selected object in the Properties Panel (Phase 9 lot 80;
 * GUI_SPEC.md, Analysis Section; ADR-034 D8 option A):
 * - status: Up to date, Outdated, Analyzing… or No analysis;
 * - dimensions (mm), volume (cm³), surface area (cm²), mesh (triangles,
 *   vertices), overhangs, bridges, thin walls, stability (contact area in
 *   cm², height ratio, tip risk out of 100 with its level of
 *   AI_ENGINE_SPEC.md);
 * - the warning ANA_002 when the mesh is not closed.
 *
 * Several selected objects: "Select a single object". An outdated
 * analysis keeps its values until it is computed again. Numbers follow
 * the language (NumberFormatter, as in every section), a value with its
 * unit kept left to right in Hebrew (formatQuantity, lot 89); the stored values
 * stay in mm³ and mm² (DATA_SCHEMA.md 3.9.0, Analysis Rules). The
 * classification is not shown before Phase 10.
 *
 * No business logic: values read from the analysis store and the analysis
 * task store (AnalysisService).
 *
 * Based on:
 * - GUI_SPEC.md (Analysis Section)
 * - DATA_SCHEMA.md (Complete Analysis Schema, Analysis Rules)
 * - AI_ENGINE_SPEC.md (risk levels)
 * - DECISIONS.md (ADR-034 D6, D8)
 */

import { RISK_LEVELS } from "../../constants/AnalysisConstants";
import {
  formatNumber,
  formatQuantity,
  isolateValue,
} from "../../i18n/NumberFormatter";
import { useAnalysisStore } from "../../state/analysisStore";
import { useAnalysisTaskStore } from "../../state/analysisTaskStore";
import { useTranslation } from "../hooks/useTranslation";

import { ProfileRow } from "./profileRows";

interface AnalysisSectionProps {
  /** Selected objects */
  objectIds: string[];
}

/** Dictionary key of the level of a tip risk (AI_ENGINE_SPEC.md) */
export function riskLevelKey(score: number): string {
  if (score <= RISK_LEVELS.VERY_LOW.max) {
    return "analysis.risk.veryLow";
  }

  if (score <= RISK_LEVELS.LOW.max) {
    return "analysis.risk.low";
  }

  if (score <= RISK_LEVELS.MODERATE.max) {
    return "analysis.risk.moderate";
  }

  return score <= RISK_LEVELS.HIGH.max
    ? "analysis.risk.high"
    : "analysis.risk.critical";
}

export default function AnalysisSection({
  objectIds,
}: AnalysisSectionProps): JSX.Element {
  const { t, language } = useTranslation();
  const objectId = objectIds.length === 1 ? objectIds[0] : null;

  const analysis = useAnalysisStore((state) =>
    objectId ? state.analysis[objectId] : undefined,
  );
  const analyzing = useAnalysisTaskStore((state) =>
    objectId ? state.pendingObjectIds.includes(objectId) : false,
  );
  const openMesh = useAnalysisTaskStore((state) =>
    objectId ? state.openMeshObjectIds.includes(objectId) : false,
  );

  // Format of the language, as in every section (NumberFormatter)
  const number = (value: number): string => formatNumber(value, language);
  const quantity = (value: number, unit: string): string =>
    formatQuantity(value, unit, language);

  if (objectIds.length > 1) {
    return <p>{t("analysis.selectSingle")}</p>;
  }

  if (!objectId) {
    return <p>{t("object.noSelection")}</p>;
  }

  const status = analyzing
    ? t("analysis.analyzing")
    : analysis
      ? t(`result.${analysis.status}`)
      : t("analysis.none");

  const statusRow = <ProfileRow label={t("analysis.status")} value={status} />;

  if (!analysis) {
    return <dl className="space-y-1">{statusRow}</dl>;
  }

  const { dimensions, geometry, mesh, overhangs, bridges, thinWalls } =
    analysis;
  const { stability } = analysis;
  const none = t("analysis.noneDetected");

  return (
    <div className="space-y-2" data-analysis-status={analysis.status}>
      <dl className="space-y-1">
        {statusRow}
        <ProfileRow
          label={t("analysis.dimensions")}
          value={isolateValue(
            t("analysis.dimensionsValue", {
              width: number(dimensions.width),
              depth: number(dimensions.depth),
              height: number(dimensions.height),
            }),
            language,
          )}
        />
        <ProfileRow
          label={t("analysis.volume")}
          value={quantity(geometry.volume / 1000, "cm³")}
        />
        <ProfileRow
          label={t("analysis.surfaceArea")}
          value={quantity(geometry.surfaceArea / 100, "cm²")}
        />
        <ProfileRow
          label={t("analysis.mesh")}
          value={t("analysis.meshValue", {
            triangles: number(mesh.triangles),
            vertices: number(mesh.vertices),
          })}
        />
        <ProfileRow
          label={t("analysis.overhangs")}
          value={
            overhangs.detected
              ? t("analysis.overhangsValue", {
                  angle: quantity(overhangs.maxAngle, "°"),
                  percent: quantity(overhangs.percentage, "%"),
                })
              : none
          }
        />
        <ProfileRow
          label={t("analysis.bridges")}
          value={
            bridges.detected && bridges.count > 0
              ? t("analysis.bridgesValue", {
                  count: number(bridges.count),
                  length: quantity(bridges.longestBridge, "mm"),
                })
              : none
          }
        />
        <ProfileRow
          label={t("analysis.thinWalls")}
          value={
            thinWalls.minimumThickness > 0
              ? t("analysis.minimumThickness", {
                  thickness: quantity(thinWalls.minimumThickness, "mm"),
                })
              : t("analysis.notMeasured")
          }
        />
      </dl>

      {thinWalls.detected && (
        <p className="text-warning">{t("analysis.thinWallsDetected")}</p>
      )}

      <p className="font-medium text-foreground">{t("analysis.stability")}</p>

      <dl className="space-y-1">
        <ProfileRow
          label={t("analysis.contactArea")}
          value={quantity(stability.contactArea / 100, "cm²")}
        />
        <ProfileRow
          label={t("analysis.heightRatio")}
          value={number(stability.heightRatio)}
        />
        <ProfileRow
          label={t("analysis.tipRisk")}
          value={t("analysis.tipRiskValue", {
            score: number(stability.riskScore),
            level: t(riskLevelKey(stability.riskScore)),
          })}
        />
      </dl>

      {openMesh && (
        <p className="text-warning" role="note">
          {t("analysis.meshNotClosed")}
        </p>
      )}
    </div>
  );
}
