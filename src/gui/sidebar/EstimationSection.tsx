/**
 * SlicyWeb
 * Estimation Section
 *
 * Estimation of the selected objects in the Settings tab, under
 * Recommendation (Phase 12, ADR-037; answers of Noam to lot 107, Q12 A;
 * GUI_SPEC.md, Estimation Section):
 * - Print time, Layers, Filament (length · weight), Filament cost,
 *   Electricity, Total, each with "≈";
 * - several selected objects: their sum (highest layer count), with the
 *   number of objects without an estimation;
 * - a value that cannot be computed: "—" (no filament: "Select a filament
 *   for the weight and the cost", Q6 A); the total counts the known costs
 *   and says which one is not counted (Q10 A);
 * - supports and a brim or raft of the recommendation: "not counted"
 *   (Q5 A);
 * - no estimation yet (no recommendation up to date): "—" and why.
 *
 * No business logic: values read from the stores; the sum comes from
 * CostEstimationService.
 *
 * Based on:
 * - GUI_SPEC.md (Estimation Section)
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules)
 * - DECISIONS.md (ADR-037)
 */

import { CostEstimationService } from "../../services/CostEstimationService";
import { useCostSettingsStore } from "../../state/costSettingsStore";
import { useEstimationStore } from "../../state/estimationStore";
import { useFilamentStore } from "../../state/filamentStore";
import { useTranslation } from "../hooks/useTranslation";
import { formatNumber } from "../../i18n/NumberFormatter";

import {
  aboutDuration,
  aboutLength,
  aboutMoney,
  aboutWeight,
  joinValues,
} from "./estimationFormat";
import { ProfileRow } from "./profileRows";

interface EstimationSectionProps {
  /** Selected objects */
  objectIds: string[];
}

const NONE = "—";

export default function EstimationSection({
  objectIds,
}: EstimationSectionProps): JSX.Element {
  const { t, language } = useTranslation();
  // The sum is computed again when an estimation or a setting changes
  const estimations = useEstimationStore((state) => state.estimations);
  const noVolume = useEstimationStore((state) => state.noVolumeObjectIds);
  const currency = useCostSettingsStore((state) => state.settings.currency);
  const hasFilament = useFilamentStore(
    (state) => state.selectedFilament !== null,
  );

  if (objectIds.length === 0) {
    return <p>{t("object.noSelection")}</p>;
  }

  if (objectIds.length === 1 && !estimations[objectIds[0]]) {
    return (
      <p data-estimation="none">
        {noVolume.includes(objectIds[0])
          ? t("estimation.noVolume")
          : t("estimation.waiting")}
      </p>
    );
  }

  const total = CostEstimationService.totalOf(objectIds, estimations);

  if (total.count === 0) {
    return <p data-estimation="none">{t("estimation.waiting")}</p>;
  }

  const { cost } = total;
  const money = (value: number | null): string =>
    value === null ? NONE : aboutMoney(value, currency, language);

  const filament =
    cost.filamentLength === null
      ? NONE
      : cost.filamentWeight === null
        ? aboutLength(cost.filamentLength, language)
        : joinValues(
            [
              aboutLength(cost.filamentLength, language),
              aboutWeight(cost.filamentWeight, language),
            ],
            language,
          );

  const notes: string[] = [];

  if (total.missing > 0) {
    notes.push(
      t("estimation.missing", {
        count: formatNumber(total.missing, language),
      }),
    );
  }

  if (cost.filamentLength === null && !hasFilament) {
    notes.push(t("estimation.noFilament"));
  }

  if (cost.totalCost !== null && cost.electricityCost === null) {
    notes.push(t("estimation.electricityNotCounted"));
  }

  if (cost.totalCost !== null && cost.materialCost === null) {
    notes.push(t("estimation.filamentNotCounted"));
  }

  if (total.notCounted.supports) {
    notes.push(t("estimation.supportsNotCounted"));
  }

  if (total.notCounted.adhesion) {
    notes.push(t(`estimation.${total.notCounted.adhesion}NotCounted`));
  }

  return (
    <div
      className="space-y-2"
      data-estimation="shown"
      data-estimation-time={total.printTime}
      data-estimation-weight={cost.filamentWeight ?? ""}
      data-estimation-total={cost.totalCost ?? ""}
    >
      <dl className="space-y-1">
        <ProfileRow
          label={t("estimation.printTime")}
          value={aboutDuration(total.printTime, language)}
        />
        <ProfileRow
          label={t("estimation.layers")}
          value={formatNumber(total.layerCount, language)}
        />
        <ProfileRow label={t("estimation.filament")} value={filament} />
        <ProfileRow
          label={t("estimation.filamentCost")}
          value={money(cost.materialCost)}
        />
        <ProfileRow
          label={t("estimation.electricity")}
          value={money(cost.electricityCost)}
        />
        <ProfileRow
          label={t("estimation.total")}
          value={money(cost.totalCost)}
        />
      </dl>
      {notes.length > 0 && (
        <ul className="space-y-0.5 text-muted-foreground">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
