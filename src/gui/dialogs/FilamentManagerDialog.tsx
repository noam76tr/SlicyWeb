/**
 * SlicyWeb
 * Filament Manager Dialog
 *
 * Filaments entered by the user (GUI_SPEC.md, Filament Manager; Phase 8
 * lot 71, ADR-033 D10). Opened by Filament > Manage Filaments and by the
 * "Manage…" button of the Filament section (openFilamentManager):
 * - on the start side, the list of the filaments of the user, "New" and
 *   "Copy a filament" (any loaded filament, Official included: the copy
 *   is a new filament of the user named "Name (copy)");
 * - on the end side, the form of the filament (filamentForm.ts): the
 *   family is one of the loaded materials; color and price per kg are
 *   entered by the user; a value left empty is "Not published" (null);
 * - Save adds or replaces the filament, Delete removes it after a
 *   confirmation. Official filaments are never shown in the list, so
 *   they are never changed.
 *
 * Changes go through MaterialSelectionService (filament:add,
 * filament:update, filament:remove); the main process validates the
 * filament and chooses the id of a new one. Errors are shown under their
 * field, or under the form for the errors of the main process (FIL_*).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Filament Menu, Filament Manager)
 * - DATA_SCHEMA.md (Filament Schema 3.7.0)
 * - API_SPEC.md (FilamentIPC Channels)
 * - ERROR_CODES_SPEC.md (FIL_001, FIL_003, FIL_004, FIL_005)
 * - DECISIONS.md (ADR-033, D10)
 */

import { useMemo, useState, type ReactNode } from "react";
import { create } from "zustand";

import { MaterialSelectionService } from "../../services/MaterialSelectionService";
import { useFilamentStore } from "../../state/filamentStore";
import { useMaterialStore } from "../../state/materialStore";
import type { Filament } from "../../types/Filament";
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
  emptyFilamentForm,
  FILAMENT_DIAMETERS,
  filamentToForm,
  formToFilament,
  NEW_FILAMENT_ID,
  type FilamentDiameter,
  type FilamentForm,
  type FilamentFormErrors,
  type FilamentFormField,
} from "./filamentForm";

const useManagerStore = create<{ open: boolean }>(() => ({ open: false }));

/** Opens the Filament Manager (menu, Filament section) */
export function openFilamentManager(): void {
  useManagerStore.setState({ open: true });
}

const ERROR_CODES = ["FIL_001", "FIL_003", "FIL_004", "FIL_005"];

/** Translation key of an error of the main process */
function errorKey(error: string): string {
  const code = ERROR_CODES.find((item) => error.startsWith(item));
  return code
    ? `filamentManager.error.${code}`
    : "filamentManager.error.invalid";
}

/** Fields typed as text (the diameter is a list) */
type TextField = Exclude<FilamentFormField, "diameter">;

const TEMPERATURES: [TextField, string][] = [
  ["minNozzle", "filamentManager.minNozzle"],
  ["maxNozzle", "filamentManager.maxNozzle"],
  ["minBed", "filamentManager.minBed"],
  ["maxBed", "filamentManager.maxBed"],
];

const MANUFACTURER_VALUES: [TextField, string, string][] = [
  ["nozzleTemperature", "material.nozzleTemperature", "°C"],
  ["bedTemperature", "material.bedTemperature", "°C"],
  ["fanSpeed", "material.fan", "%"],
  ["retractionDistance", "filament.retractionDistance", "mm"],
  ["retractionSpeed", "filament.retractionSpeed", "mm/s"],
];

const INPUT_CLASS =
  "h-7 w-full min-w-0 rounded border border-input bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/** The filament being edited: an id of the user, or a new filament */
interface Editing {
  id: string | null;
  form: FilamentForm;
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

/** Name of a filament in the lists: "Brand Name (color)" */
function filamentLabel(filament: Filament): string {
  const name = `${filament.brand} ${filament.name}`;
  return filament.color ? `${name} (${filament.color})` : name;
}

export default function FilamentManagerDialog(): JSX.Element {
  const { t } = useTranslation();

  const open = useManagerStore((state) => state.open);
  const filaments = useFilamentStore((state) => state.filaments);
  const userFilamentIds = useFilamentStore((state) => state.userFilamentIds);
  const materials = useMaterialStore((state) => state.materials);
  const selectedMaterial = useMaterialStore((state) => state.selectedMaterial);

  const [editing, setEditing] = useState<Editing | null>(null);
  const [errors, setErrors] = useState<FilamentFormErrors>({});
  const [message, setMessage] = useState<Message>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const userFilaments = useMemo(
    () => filaments.filter((filament) => userFilamentIds.includes(filament.id)),
    [filaments, userFilamentIds],
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

  const copy = (filament: Filament): void => {
    const form = filamentToForm(filament);
    start({
      id: null,
      form: {
        ...form,
        name: t("filamentManager.copySuffix", { name: filament.name }),
      },
    });
  };

  const setField = <K extends FilamentFormField>(
    field: K,
    value: FilamentForm[K],
  ): void => {
    if (!editing) return;
    setEditing({ ...editing, form: { ...editing.form, [field]: value } });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  };

  const save = async (): Promise<void> => {
    if (!editing) return;

    const result = formToFilament(editing.form, editing.id ?? NEW_FILAMENT_ID);

    if (!result.ok) {
      setErrors(result.errors);
      setMessage({ kind: "error", key: "filamentManager.error.form" });
      return;
    }

    setBusy(true);
    const change =
      editing.id === null
        ? await MaterialSelectionService.addFilament(result.filament)
        : await MaterialSelectionService.updateFilament(result.filament);
    setBusy(false);

    if (!change.ok) {
      setMessage({ kind: "error", key: errorKey(change.errors[0] ?? "") });
      return;
    }

    const saved = change.filament ?? result.filament;
    setEditing({ id: saved.id, form: filamentToForm(saved) });
    setErrors({});
    setMessage({ kind: "status", key: "filamentManager.saved" });
  };

  const remove = async (): Promise<void> => {
    if (!editing?.id) return;

    setBusy(true);
    const change = await MaterialSelectionService.removeFilament(editing.id);
    setBusy(false);

    if (!change.ok) {
      setConfirmDelete(false);
      setMessage({ kind: "error", key: errorKey(change.errors[0] ?? "") });
      return;
    }

    start(null);
    setMessage({ kind: "status", key: "filamentManager.deleted" });
  };

  /** A text or number field of the form */
  const field = (
    name: TextField,
    label: string,
    options: {
      unit?: string;
      placeholder?: string;
      required?: boolean;
      ltr?: boolean;
    } = {},
  ): JSX.Element => {
    const error = errors[name];
    const errorId = `filament-form-${name}-error`;

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
            value={editing?.form[name] ?? ""}
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

  const editedName = editing
    ? `${editing.form.brand.trim()} ${editing.form.name.trim()}`.trim()
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
          <DialogTitle>{t("filament.manage")}</DialogTitle>
          <DialogDescription>
            {t("filamentManager.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-[12rem_minmax(0,1fr)] gap-4">
          {/* Filaments of the user, New, Copy a filament */}
          <div className="flex min-h-0 flex-col gap-2">
            <h3 className="font-medium text-foreground">
              {t("filament.myFilaments")}
            </h3>
            {userFilaments.length === 0 ? (
              <p className="text-muted-foreground">
                {t("filamentManager.empty")}
              </p>
            ) : (
              <ul
                aria-label={t("filament.myFilaments")}
                className="min-h-0 space-y-0.5 overflow-y-auto"
              >
                {userFilaments.map((filament) => (
                  <li key={filament.id}>
                    <button
                      type="button"
                      aria-pressed={editing?.id === filament.id}
                      onClick={() =>
                        start({
                          id: filament.id,
                          form: filamentToForm(filament),
                        })
                      }
                      className="w-full truncate rounded px-2 py-1 text-start hover:bg-muted aria-pressed:bg-muted aria-pressed:font-medium"
                    >
                      {filamentLabel(filament)}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                start({
                  id: null,
                  form: emptyFilamentForm(selectedMaterial?.category ?? ""),
                })
              }
            >
              {t("filamentManager.new")}
            </Button>

            <select
              aria-label={t("filamentManager.copy")}
              value=""
              onChange={(event) => {
                const filament = filaments.find(
                  (item) => item.id === event.target.value,
                );
                if (filament) copy(filament);
              }}
              className={INPUT_CLASS}
            >
              <option value="">{t("filamentManager.copy")}</option>
              {filaments.map((filament) => (
                <option key={filament.id} value={filament.id}>
                  {filamentLabel(filament)}
                </option>
              ))}
            </select>

            {!editing && message && (
              <p role="status" className="text-muted-foreground">
                {t(message.key)}
              </p>
            )}
          </div>

          {/* Form of the filament */}
          {editing ? (
            <form
              aria-label={editedName || t("filamentManager.new")}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
              className="flex min-h-0 flex-col gap-3"
            >
              <div className="min-h-0 space-y-4 overflow-y-auto pe-1">
                <div className="grid grid-cols-2 gap-2">
                  {field("brand", t("filament.brand"), { required: true })}
                  {field("name", t("filamentManager.name"), {
                    required: true,
                  })}

                  <div className="space-y-1">
                    <label className="block space-y-1">
                      <span>
                        {t("filamentManager.family")}
                        <span aria-hidden="true"> *</span>
                      </span>
                      <select
                        name="material"
                        value={editing.form.material}
                        required
                        aria-invalid={errors.material ? true : undefined}
                        aria-describedby={
                          errors.material
                            ? "filament-form-material-error"
                            : undefined
                        }
                        onChange={(event) =>
                          setField("material", event.target.value)
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="">
                          {t("filamentManager.chooseFamily")}
                        </option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.category}>
                            {material.category}
                          </option>
                        ))}
                      </select>
                    </label>
                    {errors.material && (
                      <span
                        id="filament-form-material-error"
                        className="block text-destructive"
                      >
                        {t(errors.material)}
                      </span>
                    )}
                  </div>

                  {field("color", t("filament.color"), {
                    placeholder: t("filament.colorNotSpecified"),
                  })}

                  <label className="block space-y-1">
                    <span>
                      {t("filamentManager.diameter")}
                      <span aria-hidden="true"> *</span>
                      <span className="text-muted-foreground"> (mm)</span>
                    </span>
                    <select
                      name="diameter"
                      dir="ltr"
                      value={editing.form.diameter}
                      onChange={(event) =>
                        setField(
                          "diameter",
                          event.target.value as FilamentDiameter,
                        )
                      }
                      className={INPUT_CLASS}
                    >
                      {FILAMENT_DIAMETERS.map((diameter) => (
                        <option key={diameter} value={diameter}>
                          {diameter}
                        </option>
                      ))}
                    </select>
                  </label>

                  {field("pricePerKg", t("filament.pricePerKg"), {
                    placeholder: t("filament.priceNotSpecified"),
                    ltr: true,
                  })}
                  {field("density", t("material.density"), {
                    unit: "g/cm³",
                    placeholder: t("printer.notPublished"),
                    ltr: true,
                  })}
                </div>

                <p className="text-muted-foreground">
                  {t("filamentManager.valueHint")}
                </p>

                <Fieldset legend={t("filamentManager.temperatures")}>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPERATURES.map(([name, key]) => (
                      <div key={name}>
                        {field(name, t(key), {
                          unit: "°C",
                          placeholder: t("printer.notPublished"),
                          ltr: true,
                        })}
                      </div>
                    ))}
                  </div>
                </Fieldset>

                <Fieldset legend={t("filament.manufacturerValues")}>
                  <div className="grid grid-cols-2 gap-2">
                    {MANUFACTURER_VALUES.map(([name, key, unit]) => (
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

                <p className="text-muted-foreground">
                  {t("filamentManager.requiredHint")}
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
                    {t("filamentManager.deleteConfirm", { name: editedName })}
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
              {t("filamentManager.chooseOrCreate")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
