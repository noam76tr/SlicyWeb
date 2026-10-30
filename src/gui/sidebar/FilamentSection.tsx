/**
 * SlicyWeb
 * Filament Section Component
 *
 * Filament section of the Properties Panel (GUI_SPEC.md, Filament
 * Section; Phase 8 lot 70):
 * - the selector lists the filaments of the selected family (all the
 *   filaments when no material is selected), grouped by brand, with
 *   "No filament" first; the filaments entered by the user come before
 *   the brands, in the group "My filaments". Choosing a filament also
 *   chooses its family (ADR-033, D9);
 * - the selected filament shows the temperature ranges of the
 *   manufacturer, its single values (manufacturerSettings) and its color;
 *   a value not published (null) is shown as "Not published", never as 0
 *   (DATA_SCHEMA.md 3.7.0). A shipped filament is a product line: its
 *   color is "Not specified".
 *
 * The choice goes through MaterialSelectionService, which saves it as the
 * last filament. Filament > Select Filament (menu) moves the focus to
 * the selector (FILAMENT_SELECTOR_ID).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Filament Section)
 * - DATA_SCHEMA.md (Filament Schema 3.7.0)
 * - DECISIONS.md (ADR-033, D9)
 */

import { useMemo } from "react";

import { MaterialSelectionService } from "../../services/MaterialSelectionService";
import { useFilamentStore } from "../../state/filamentStore";
import { useMaterialStore } from "../../state/materialStore";
import type { Filament } from "../../types/Filament";
import { useTranslation } from "../hooks/useTranslation";

import { ProfileRow, SELECT_CLASS, useRange, useValue } from "./profileRows";

export const FILAMENT_SELECTOR_ID = "filament-selector";

const NONE = "";

/** Filaments grouped by brand, in the order of the store */
function groupByBrand(filaments: Filament[]): [string, Filament[]][] {
  const groups = new Map<string, Filament[]>();

  for (const filament of filaments) {
    groups.set(filament.brand, [
      ...(groups.get(filament.brand) ?? []),
      filament,
    ]);
  }

  return [...groups.entries()];
}

export default function FilamentSection(): JSX.Element {
  const { t } = useTranslation();
  const range = useRange();
  const value = useValue();

  const filaments = useFilamentStore((state) => state.filaments);
  const userFilamentIds = useFilamentStore((state) => state.userFilamentIds);
  const selected = useFilamentStore((state) => state.selectedFilament);
  const material = useMaterialStore((state) => state.selectedMaterial);

  const listed = useMemo(
    () =>
      material
        ? filaments.filter(
            (filament) => filament.material === material.category,
          )
        : filaments,
    [filaments, material],
  );
  const userFilaments = useMemo(
    () => listed.filter((filament) => userFilamentIds.includes(filament.id)),
    [listed, userFilamentIds],
  );
  const groups = useMemo(
    () =>
      groupByBrand(
        listed.filter((filament) => !userFilamentIds.includes(filament.id)),
      ),
    [listed, userFilamentIds],
  );

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="font-medium text-foreground">
          {t("filament.selector")}
        </span>
        <select
          id={FILAMENT_SELECTOR_ID}
          value={selected?.id ?? NONE}
          onChange={(event) => {
            const id = event.target.value;
            void MaterialSelectionService.selectFilament(
              id === NONE ? null : id,
            );
          }}
          className={SELECT_CLASS}
        >
          <option value={NONE}>{t("filament.none")}</option>
          {userFilaments.length > 0 && (
            <optgroup label={t("filament.myFilaments")}>
              {userFilaments.map((filament) => (
                <option key={filament.id} value={filament.id}>
                  {filament.brand} {filament.name}
                </option>
              ))}
            </optgroup>
          )}
          {groups.map(([brand, items]) => (
            <optgroup key={brand} label={brand}>
              {items.map((filament) => (
                <option key={filament.id} value={filament.id}>
                  {filament.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {selected ? (
        <>
          <dl className="space-y-1">
            <ProfileRow label={t("filament.brand")} value={selected.brand} />
            <ProfileRow
              label={t("filament.color")}
              value={selected.color ?? t("filament.colorNotSpecified")}
            />
            <ProfileRow
              label={t("material.nozzleTemperature")}
              value={range(
                selected.temperature.minNozzle,
                selected.temperature.maxNozzle,
                "°C",
              )}
            />
            <ProfileRow
              label={t("material.bedTemperature")}
              value={range(
                selected.temperature.minBed,
                selected.temperature.maxBed,
                "°C",
              )}
            />
          </dl>

          <div className="space-y-1">
            <h4 className="font-medium text-foreground">
              {t("filament.manufacturerValues")}
            </h4>
            <dl className="space-y-1">
              <ProfileRow
                label={t("material.nozzleTemperature")}
                value={value(
                  selected.manufacturerSettings.nozzleTemperature,
                  "°C",
                )}
              />
              <ProfileRow
                label={t("material.bedTemperature")}
                value={value(
                  selected.manufacturerSettings.bedTemperature,
                  "°C",
                )}
              />
              <ProfileRow
                label={t("material.fan")}
                value={value(selected.manufacturerSettings.fanSpeed, "%")}
              />
              <ProfileRow
                label={t("filament.retractionDistance")}
                value={value(
                  selected.manufacturerSettings.retractionDistance,
                  "mm",
                )}
              />
              <ProfileRow
                label={t("filament.retractionSpeed")}
                value={value(
                  selected.manufacturerSettings.retractionSpeed,
                  "mm/s",
                )}
              />
            </dl>
          </div>
        </>
      ) : (
        <p>{t("filament.noSelection")}</p>
      )}
    </div>
  );
}
