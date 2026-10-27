/**
 * SlicyWeb
 * Printer Section Component
 *
 * Printer section of the Properties Panel (GUI_SPEC.md, Printer Section,
 * Printer Selector):
 * - the selector lists the printers by brand, then by model
 *   (Brand └─ Models), with "No printer" first; the printers entered by
 *   the user come before the brands, in the group "My printers"
 *   (Phase 7 lot 61);
 * - "Manage…" opens the Printer Manager (PrinterManagerDialog);
 * - under it, the origin and the tag of the Official profiles (SlicyWeb
 *   profile repository or copy of the application), then the message of
 *   the last check (Printer > Refresh Profiles; Phase 7 lot 62), and
 *   the setting "Check for profile updates automatically"
 *   (printer.autoCheckProfiles, saved by PrinterSelectionService);
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
 * - GUI_SPEC.md (Printer Section, Printer Selector, Printer Manager)
 * - DATA_SCHEMA.md (Printer Schema)
 * - DECISIONS.md (ADR-032, D8)
 */

import { useMemo } from "react";

import { PrinterSelectionService } from "../../services/PrinterSelectionService";
import { usePrinterStore } from "../../state/printerStore";
import type { Printer } from "../../types/Printer";
import { Button } from "../components/ui/button";
import { openPrinterManager } from "../dialogs/PrinterManagerDialog";
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
  const userPrinterIds = usePrinterStore((state) => state.userPrinterIds);
  const selected = usePrinterStore((state) => state.selectedPrinter);
  const profiles = usePrinterStore((state) => state.profiles);
  const profilesMessage = usePrinterStore((state) => state.profilesMessage);
  const autoCheckProfiles = usePrinterStore((state) => state.autoCheckProfiles);
  const userPrinters = useMemo(
    () => printers.filter((printer) => userPrinterIds.includes(printer.id)),
    [printers, userPrinterIds],
  );
  const groups = useMemo(
    () =>
      groupByBrand(
        printers.filter((printer) => !userPrinterIds.includes(printer.id)),
      ),
    [printers, userPrinterIds],
  );

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
          {userPrinters.length > 0 && (
            <optgroup label={t("printer.myPrinters")}>
              {userPrinters.map((printer) => (
                <option key={printer.id} value={printer.id}>
                  {printer.brand} {printer.model}
                </option>
              ))}
            </optgroup>
          )}
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

      <Button variant="outline" size="xs" onClick={openPrinterManager}>
        {t("printer.manageButton")}
      </Button>

      {profiles && (
        <p className="text-muted-foreground">
          {profiles.origin === "repository"
            ? t("printer.profiles.repository", { tag: profiles.tag ?? "" })
            : profiles.tag
              ? t("printer.profiles.applicationTag", { tag: profiles.tag })
              : t("printer.profiles.application")}
          {profilesMessage && (
            <span role="status" className="block">
              {t(profilesMessage.key, { tag: profilesMessage.tag ?? "" })}
            </span>
          )}
        </p>
      )}

      <label className="flex items-center gap-2 text-muted-foreground">
        <input
          type="checkbox"
          checked={autoCheckProfiles}
          onChange={(event) =>
            void PrinterSelectionService.setAutoCheckProfiles(
              event.target.checked,
            )
          }
        />
        {t("printer.profiles.autoCheck")}
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
