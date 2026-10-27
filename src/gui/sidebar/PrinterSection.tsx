/**
 * SlicyWeb
 * Printer Section Component
 *
 * Printer section of the Properties Panel (GUI_SPEC.md, Printer Section,
 * Printer Selector):
 * - the selector lists the printers by brand, then by model
 *   (Brand └─ Models), with "No printer" first;
 * - the selected printer shows its Brand, Model, Build Volume, Nozzle
 *   and Printer Limits. A limit not published by the manufacturer
 *   (null) is shown as "Not published", never as 0 (DATA_SCHEMA.md 3.5.0).
 *
 * The choice goes through PrinterSelectionService, which saves it as the
 * last printer. Printer > Select Printer (menu) moves the focus to the
 * selector (PRINTER_SELECTOR_ID).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Printer Section, Printer Selector)
 * - DATA_SCHEMA.md (Printer Schema)
 * - DECISIONS.md (ADR-032, D8)
 */

import { useMemo } from "react";

import { PrinterSelectionService } from "../../services/PrinterSelectionService";
import { usePrinterStore } from "../../state/printerStore";
import type { Printer } from "../../types/Printer";
import { useTranslation } from "../hooks/useTranslation";

export const PRINTER_SELECTOR_ID = "printer-selector";

const NONE = "";

/** Value shown: 2 decimals at most */
function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Printers grouped by brand, in the order of the store */
function groupByBrand(printers: Printer[]): [string, Printer[]][] {
  const groups = new Map<string, Printer[]>();

  for (const printer of printers) {
    groups.set(printer.brand, [...(groups.get(printer.brand) ?? []), printer]);
  }

  return [...groups.entries()];
}

interface RowProps {
  label: string;
  value: string;
}

function Row({ label, value }: RowProps): JSX.Element {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="text-end text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

export default function PrinterSection(): JSX.Element {
  const { t } = useTranslation();

  const printers = usePrinterStore((state) => state.printers);
  const selected = usePrinterStore((state) => state.selectedPrinter);
  const groups = useMemo(() => groupByBrand(printers), [printers]);

  const limit = (value: number | null, unit: string): string =>
    value === null ? t("printer.notPublished") : `${format(value)} ${unit}`;

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="font-medium text-foreground">
          {t("printer.selector")}
        </span>
        <select
          id={PRINTER_SELECTOR_ID}
          value={selected?.id ?? NONE}
          onChange={(event) => {
            const value = event.target.value;
            void PrinterSelectionService.select(value === NONE ? null : value);
          }}
          className="h-7 w-full rounded border border-input bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value={NONE}>{t("printer.none")}</option>
          {groups.map(([brand, models]) => (
            <optgroup key={brand} label={brand}>
              {models.map((printer) => (
                <option key={printer.id} value={printer.id}>
                  {printer.model}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {selected ? (
        <>
          <dl className="space-y-1">
            <Row label={t("printer.brand")} value={selected.brand} />
            <Row label={t("printer.model")} value={selected.model} />
            <Row
              label={t("printer.buildVolume")}
              value={`${format(selected.buildVolume.x)} × ${format(
                selected.buildVolume.y,
              )} × ${format(selected.buildVolume.z)} mm`}
            />
            <Row
              label={t("printer.nozzle")}
              value={`${format(selected.defaultNozzle)} mm`}
            />
            <Row
              label={t("printer.supportedNozzles")}
              value={`${selected.supportedNozzles.map(format).join(" · ")} mm`}
            />
          </dl>

          <div className="space-y-1">
            <h4 className="font-medium text-foreground">
              {t("printer.limits")}
            </h4>
            <dl className="space-y-1">
              <Row
                label={t("printer.maxPrintSpeed")}
                value={limit(selected.motion.maxPrintSpeed, "mm/s")}
              />
              <Row
                label={t("printer.maxTravelSpeed")}
                value={limit(selected.motion.maxTravelSpeed, "mm/s")}
              />
              <Row
                label={t("printer.maxAcceleration")}
                value={limit(selected.motion.maxAcceleration, "mm/s²")}
              />
              <Row
                label={t("printer.maxJerk")}
                value={limit(selected.motion.maxJerk, "mm/s")}
              />
              <Row
                label={t("printer.maxNozzleTemp")}
                value={limit(selected.thermal.maxNozzleTemp, "°C")}
              />
              <Row
                label={t("printer.maxBedTemp")}
                value={limit(selected.thermal.maxBedTemp, "°C")}
              />
              <Row
                label={t("printer.maxChamberTemp")}
                value={limit(selected.thermal.maxChamberTemp, "°C")}
              />
            </dl>
          </div>
        </>
      ) : (
        <p>{t("printer.noSelection")}</p>
      )}
    </div>
  );
}
