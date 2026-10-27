/**
 * SlicyWeb
 * Printer Manager Dialog
 *
 * Printers entered by the user (GUI_SPEC.md, Printer Manager; Phase 7
 * lot 61). Opened by Printer > Manage Printers and by the "Manage…"
 * button of the Printer section (openPrinterManager):
 * - on the start side, the list of the printers of the user, "New" and
 *   "Copy a printer" (any loaded printer, Official included: the copy is
 *   a new printer of the user named "Model (copy)");
 * - on the end side, the form of the printer (printerForm.ts): a value
 *   of motion or thermal left empty is "Not published" (null);
 * - Save adds or replaces the printer, Delete removes it after a
 *   confirmation. Official printers are never shown in the list, so they
 *   are never changed.
 *
 * Changes go through PrinterSelectionService (printer:add,
 * printer:update, printer:remove); the main process validates the
 * printer and chooses the id of a new one. Errors are shown under their
 * field, or under the form for the errors of the main process (PRN_*).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Printer Menu, Printer Manager)
 * - DATA_SCHEMA.md (Printer Schema)
 * - API_SPEC.md (PrinterIPC Channels)
 * - ERROR_CODES_SPEC.md (PRN_001, PRN_005, PRN_006, PRN_007)
 * - DECISIONS.md (ADR-032)
 */

import { useMemo, useState, type ReactNode } from "react";
import { create } from "zustand";

import { PrinterSelectionService } from "../../services/PrinterSelectionService";
import { usePrinterStore } from "../../state/printerStore";
import type { ExtruderType, Printer } from "../../types/Printer";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useTranslation } from "../hooks/useTranslation";

import {
  emptyPrinterForm,
  formToPrinter,
  NEW_PRINTER_ID,
  printerToForm,
  type PrinterForm,
  type PrinterFormErrors,
  type PrinterFormField,
} from "./printerForm";

const useManagerStore = create<{ open: boolean }>(() => ({ open: false }));

/** Opens the Printer Manager (menu, Printer section) */
export function openPrinterManager(): void {
  useManagerStore.setState({ open: true });
}

const ERROR_CODES = ["PRN_001", "PRN_005", "PRN_006", "PRN_007"];

/** Translation key of an error of the main process */
function errorKey(error: string): string {
  const code = ERROR_CODES.find((item) => error.startsWith(item));
  return code ? `printerManager.error.${code}` : "printerManager.error.invalid";
}

const EXTRUDER_TYPES: [ExtruderType, string][] = [
  ["direct_drive", "printer.extruderDirectDrive"],
  ["bowden", "printer.extruderBowden"],
  ["unknown", "printer.extruderUnknown"],
];

const LIMITS: [PrinterFormField, string, string][] = [
  ["maxPrintSpeed", "printer.maxPrintSpeed", "mm/s"],
  ["maxTravelSpeed", "printer.maxTravelSpeed", "mm/s"],
  ["maxAcceleration", "printer.maxAcceleration", "mm/s²"],
  ["maxJerk", "printer.maxJerk", "mm/s"],
  ["maxNozzleTemp", "printer.maxNozzleTemp", "°C"],
  ["maxBedTemp", "printer.maxBedTemp", "°C"],
  ["maxChamberTemp", "printer.maxChamberTemp", "°C"],
];

const INPUT_CLASS =
  "h-7 w-full min-w-0 rounded border border-input bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/** The printer being edited: an id of the user, or a new printer */
interface Editing {
  id: string | null;
  form: PrinterForm;
}

type Message = { kind: "status" | "error"; key: string } | null;

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 font-medium text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

export default function PrinterManagerDialog(): JSX.Element {
  const { t } = useTranslation();

  const open = useManagerStore((state) => state.open);
  const printers = usePrinterStore((state) => state.printers);
  const userPrinterIds = usePrinterStore((state) => state.userPrinterIds);

  const [editing, setEditing] = useState<Editing | null>(null);
  const [errors, setErrors] = useState<PrinterFormErrors>({});
  const [message, setMessage] = useState<Message>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const userPrinters = useMemo(
    () => printers.filter((printer) => userPrinterIds.includes(printer.id)),
    [printers, userPrinterIds],
  );

  const start = (next: Editing | null): void => {
    setEditing(next);
    setErrors({});
    setMessage(null);
    setConfirmDelete(false);
  };

  const close = (): void => {
    useManagerStore.setState({ open: false });
    start(null);
  };

  const copy = (printer: Printer): void => {
    const form = printerToForm(printer);
    start({
      id: null,
      form: {
        ...form,
        model: t("printerManager.copySuffix", { model: printer.model }),
      },
    });
  };

  const setField = <K extends PrinterFormField>(
    field: K,
    value: PrinterForm[K],
  ): void => {
    if (!editing) return;
    setEditing({ ...editing, form: { ...editing.form, [field]: value } });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const save = async (): Promise<void> => {
    if (!editing) return;

    const result = formToPrinter(editing.form, editing.id ?? NEW_PRINTER_ID);

    if (!result.ok) {
      setErrors(result.errors);
      setMessage({ kind: "error", key: "printerManager.error.form" });
      return;
    }

    setBusy(true);
    const change =
      editing.id === null
        ? await PrinterSelectionService.add(result.printer)
        : await PrinterSelectionService.update(result.printer);
    setBusy(false);

    if (!change.ok) {
      setMessage({ kind: "error", key: errorKey(change.errors[0] ?? "") });
      return;
    }

    const saved = change.printer ?? result.printer;
    setEditing({ id: saved.id, form: printerToForm(saved) });
    setErrors({});
    setMessage({ kind: "status", key: "printerManager.saved" });
  };

  const remove = async (): Promise<void> => {
    if (!editing?.id) return;

    setBusy(true);
    const change = await PrinterSelectionService.remove(editing.id);
    setBusy(false);

    if (!change.ok) {
      setConfirmDelete(false);
      setMessage({ kind: "error", key: errorKey(change.errors[0] ?? "") });
      return;
    }

    start(null);
    setMessage({ kind: "status", key: "printerManager.deleted" });
  };

  /** A text or number field of the form */
  const field = (
    name: PrinterFormField,
    label: string,
    options: {
      unit?: string;
      placeholder?: string;
      required?: boolean;
      ltr?: boolean;
    } = {},
  ): JSX.Element => {
    const value = editing?.form[name];
    const error = errors[name];
    const errorId = `printer-form-${name}-error`;

    return (
      <div className="space-y-1">
        <label className="block space-y-1">
          <span>
            {label}
            {options.required && <span aria-hidden="true"> *</span>}
            {options.unit && (
              <span className="text-muted-foreground"> ({options.unit})</span>
            )}
          </span>
          <input
            type="text"
            dir={options.ltr ? "ltr" : undefined}
            name={name}
            value={typeof value === "string" ? value : ""}
            placeholder={options.placeholder}
            required={options.required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => setField(name, event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        {error && (
          <span id={errorId} className="block text-destructive">
            {t(error)}
          </span>
        )}
      </div>
    );
  };

  const checkbox = (
    name: "partFan" | "auxFan" | "chamberFan",
    label: string,
  ): JSX.Element => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={editing?.form[name] ?? false}
        onChange={(event) => setField(name, event.target.checked)}
      />
      {label}
    </label>
  );

  const editedName = editing
    ? `${editing.form.brand.trim()} ${editing.form.model.trim()}`.trim()
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        closeLabel={t("action.close")}
        className="grid max-h-[90vh] grid-rows-[auto_minmax(0,1fr)] text-xs sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>{t("printer.manage")}</DialogTitle>
          <DialogDescription>
            {t("printerManager.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-[12rem_minmax(0,1fr)] gap-4">
          {/* Printers of the user, New, Copy a printer */}
          <div className="flex min-h-0 flex-col gap-2">
            <h3 className="font-medium text-foreground">
              {t("printer.myPrinters")}
            </h3>
            {userPrinters.length === 0 ? (
              <p className="text-muted-foreground">
                {t("printerManager.empty")}
              </p>
            ) : (
              <ul
                aria-label={t("printer.myPrinters")}
                className="min-h-0 space-y-0.5 overflow-y-auto"
              >
                {userPrinters.map((printer) => (
                  <li key={printer.id}>
                    <button
                      type="button"
                      aria-pressed={editing?.id === printer.id}
                      onClick={() =>
                        start({ id: printer.id, form: printerToForm(printer) })
                      }
                      className="w-full truncate rounded px-2 py-1 text-start hover:bg-muted aria-pressed:bg-muted aria-pressed:font-medium"
                    >
                      {printer.brand} {printer.model}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => start({ id: null, form: emptyPrinterForm() })}
            >
              {t("printerManager.new")}
            </Button>

            <select
              aria-label={t("printerManager.copy")}
              value=""
              onChange={(event) => {
                const printer = printers.find(
                  (item) => item.id === event.target.value,
                );
                if (printer) copy(printer);
              }}
              className={INPUT_CLASS}
            >
              <option value="">{t("printerManager.copy")}</option>
              {printers.map((printer) => (
                <option key={printer.id} value={printer.id}>
                  {printer.brand} {printer.model}
                </option>
              ))}
            </select>

            {!editing && message && (
              <p role="status" className="text-muted-foreground">
                {t(message.key)}
              </p>
            )}
          </div>

          {/* Form of the printer */}
          {editing ? (
            <form
              aria-label={editedName || t("printerManager.new")}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
              className="flex min-h-0 flex-col gap-3"
            >
              <div className="min-h-0 space-y-4 overflow-y-auto pe-1">
                <div className="grid grid-cols-2 gap-2">
                  {field("brand", t("printer.brand"), { required: true })}
                  {field("model", t("printer.model"), { required: true })}
                  {field("series", t("printer.series"))}
                  {field("manufacturer", t("printer.manufacturer"))}
                  {field("firmware", t("printer.firmware"))}
                  {field("releaseDate", t("printer.releaseDate"))}
                </div>

                <Fieldset legend={t("printer.buildVolume")}>
                  <div className="grid grid-cols-3 gap-2">
                    {field("buildX", "X", {
                      unit: "mm",
                      required: true,
                      ltr: true,
                    })}
                    {field("buildY", "Y", {
                      unit: "mm",
                      required: true,
                      ltr: true,
                    })}
                    {field("buildZ", "Z", {
                      unit: "mm",
                      required: true,
                      ltr: true,
                    })}
                  </div>
                </Fieldset>

                <Fieldset legend={t("printer.nozzle")}>
                  <div className="grid grid-cols-2 gap-2">
                    {field("defaultNozzle", t("printer.defaultNozzle"), {
                      unit: "mm",
                      required: true,
                      ltr: true,
                    })}
                    {field("supportedNozzles", t("printer.supportedNozzles"), {
                      unit: "mm",
                      required: true,
                      placeholder: t("printerManager.nozzleListHint"),
                      ltr: true,
                    })}
                  </div>
                </Fieldset>

                <Fieldset legend={t("printer.limits")}>
                  <p className="text-muted-foreground">
                    {t("printerManager.limitHint")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LIMITS.map(([name, key, unit]) => (
                      <div key={name}>
                        {field(name, t(key), {
                          unit,
                          placeholder: t("printer.notPublished"),
                          ltr: true,
                        })}
                      </div>
                    ))}
                  </div>
                </Fieldset>

                <Fieldset legend={t("printer.cooling")}>
                  <div className="flex flex-wrap gap-4">
                    {checkbox("partFan", t("printer.partFan"))}
                    {checkbox("auxFan", t("printer.auxFan"))}
                    {checkbox("chamberFan", t("printer.chamberFan"))}
                  </div>
                </Fieldset>

                <Fieldset legend={t("printer.extruder")}>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span>{t("printer.extruderType")}</span>
                      <select
                        name="extruderType"
                        value={editing.form.extruderType}
                        onChange={(event) =>
                          setField(
                            "extruderType",
                            event.target.value as ExtruderType,
                          )
                        }
                        className={INPUT_CLASS}
                      >
                        {EXTRUDER_TYPES.map(([value, key]) => (
                          <option key={value} value={value}>
                            {t(key)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {field("extruderCount", t("printer.extruderCount"), {
                      required: true,
                      ltr: true,
                    })}
                  </div>
                </Fieldset>

                {field("supportedMaterials", t("printer.supportedMaterials"), {
                  placeholder: t("printerManager.listHint"),
                })}

                <p className="text-muted-foreground">
                  {t("printerManager.requiredHint")}
                </p>
              </div>

              {message && (
                <p
                  role={message.kind === "error" ? "alert" : "status"}
                  className={
                    message.kind === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {t(message.key)}
                </p>
              )}

              {confirmDelete ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="me-auto">
                    {t("printerManager.deleteConfirm", { name: editedName })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmDelete(false)}
                  >
                    {t("action.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() => void remove()}
                  >
                    {t("action.delete")}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  {editing.id !== null && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="me-auto"
                      disabled={busy}
                      onClick={() => setConfirmDelete(true)}
                    >
                      {t("action.delete")}
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={busy}>
                    {t("action.save")}
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <p className="text-muted-foreground">
              {t("printerManager.chooseOrCreate")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
