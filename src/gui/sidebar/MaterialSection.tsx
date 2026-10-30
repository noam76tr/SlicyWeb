/**
 * SlicyWeb
 * Material Section Component
 *
 * Material section of the Properties Panel (GUI_SPEC.md, Material
 * Section; Phase 8 lot 70):
 * - the selector lists the families loaded (PLA, PETG…), with
 *   "No material" first;
 * - the selected material shows its nozzle and bed temperature ranges,
 *   its fan and its density; a value not published (null) is shown as
 *   "Not published", never as 0 (DATA_SCHEMA.md 3.7.0);
 * - when the selected printer lists materials and the family is not in
 *   its list (aliases of MATERIAL_PROFILE_SPEC.md), the warning "Not
 *   listed by the printer manufacturer" is shown; the choice is never
 *   blocked (ADR-033, D5).
 *
 * The choice goes through MaterialSelectionService, which saves it as the
 * last material. Material > Select Material (menu) moves the focus to the
 * selector (MATERIAL_SELECTOR_ID).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Material Section)
 * - DATA_SCHEMA.md (Complete Material Schema 3.7.0)
 * - DECISIONS.md (ADR-033, D5, D9)
 */

import { isFamilyNotListed } from "../../material_database/MaterialFamilies";
import { MaterialSelectionService } from "../../services/MaterialSelectionService";
import { useMaterialStore } from "../../state/materialStore";
import { usePrinterStore } from "../../state/printerStore";
import { useTranslation } from "../hooks/useTranslation";

import { ProfileRow, SELECT_CLASS, useRange, useValue } from "./profileRows";

export const MATERIAL_SELECTOR_ID = "material-selector";

const NONE = "";

export default function MaterialSection(): JSX.Element {
  const { t } = useTranslation();
  const range = useRange();
  const value = useValue();

  const materials = useMaterialStore((state) => state.materials);
  const selected = useMaterialStore((state) => state.selectedMaterial);
  const printer = usePrinterStore((state) => state.selectedPrinter);

  const notListed =
    selected !== null &&
    printer !== null &&
    isFamilyNotListed(printer.supportedMaterials, selected.category);

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="font-medium text-foreground">
          {t("material.selector")}
        </span>
        <select
          id={MATERIAL_SELECTOR_ID}
          value={selected?.id ?? NONE}
          onChange={(event) => {
            const id = event.target.value;
            void MaterialSelectionService.selectMaterial(
              id === NONE ? null : id,
            );
          }}
          className={SELECT_CLASS}
        >
          <option value={NONE}>{t("material.none")}</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </label>

      {notListed && (
        <p role="status" className="text-amber-500">
          {t("material.notListed")}
        </p>
      )}

      {selected ? (
        <dl className="space-y-1">
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
          <ProfileRow
            label={t("material.fan")}
            value={range(selected.cooling.fanMin, selected.cooling.fanMax, "%")}
          />
          <ProfileRow
            label={t("material.density")}
            value={value(selected.physical.density, "g/cm³")}
          />
        </dl>
      ) : (
        <p>{t("material.noSelection")}</p>
      )}
    </div>
  );
}
