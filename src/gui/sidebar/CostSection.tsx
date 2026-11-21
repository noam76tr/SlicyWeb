/**
 * SlicyWeb
 * Cost Section
 *
 * Section "Costs" of the Printer tab, under Filament (Phase 12, ADR-037;
 * answers of Noam to lot 107, Q7 to Q11 A; GUI_SPEC.md, Cost Section):
 * - Currency: the list of CURRENCIES; the prices typed before are not
 *   converted when it changes (a line says it);
 * - Electricity price, per kWh, in the currency;
 * - Average power of the selected printer, in W (one value per printer);
 * - Price per kg of the selected filament, in the currency (a filament of
 *   the user: its own field; a shipped filament: kept in the
 *   preferences).
 * An empty field means "not given". A value is kept when the field is
 * left (Tab, a click elsewhere) or with Enter; Escape gives the saved
 * value back; a value refused shows its error under the field and is not
 * kept. These settings move to the Preferences window when it exists.
 *
 * The values go through CostSettingsService. No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Cost Section, Localization Support)
 * - USER_SETTINGS_SPEC.md (2.3.0: Cost Settings)
 * - DECISIONS.md (ADR-037)
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { CURRENCIES, type Currency } from "../../constants/CostConstants";
import { currencySymbol, formatFieldNumber } from "../../i18n/NumberFormatter";
import {
  CostSettingsService,
  parseCostField,
  type CostFieldKind,
} from "../../services/CostSettingsService";
import { useCostSettingsStore } from "../../state/costSettingsStore";
import { useFilamentStore } from "../../state/filamentStore";
import { usePrinterStore } from "../../state/printerStore";
import { useTranslation } from "../hooks/useTranslation";

import { SELECT_CLASS } from "./profileRows";

const FIELD_CLASS =
  "h-7 w-full min-w-0 rounded border border-input bg-background px-1.5 text-xs text-foreground tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive";

interface CostFieldProps {
  id: string;
  label: string;
  unit: string;
  kind: CostFieldKind;
  value: number | null;
  /** Keeps the value; false when it was not kept */
  onCommit: (value: number | null) => Promise<boolean> | Promise<void>;
}

function CostField({
  id,
  label,
  unit,
  kind,
  value,
  onCommit,
}: CostFieldProps): JSX.Element {
  const { t, language } = useTranslation();
  const shown = value === null ? "" : formatFieldNumber(value, language);
  const [text, setText] = useState(shown);
  const [error, setError] = useState<string | null>(null);
  const editing = useRef(false);
  const handled = useRef(false);

  // The saved value, when it changes from elsewhere (another printer…)
  useEffect(() => {
    if (!editing.current) {
      setText(shown);
      setError(null);
    }
  }, [shown]);

  const commit = (): void => {
    const result = parseCostField(text, kind);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);

    if (result.value === value) {
      setText(shown);
      return;
    }

    void onCommit(result.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setText(shown);
      setError(null);
      handled.current = true;
      event.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        <span className="shrink-0 text-muted-foreground" dir="ltr">
          {unit}
        </span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={text}
        placeholder={t("cost.notGiven")}
        aria-invalid={error !== null}
        aria-describedby={error ? `${id}-error` : undefined}
        onFocus={() => {
          editing.current = true;
          handled.current = false;
        }}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
        onBlur={() => {
          editing.current = false;

          if (handled.current) {
            handled.current = false;
            return;
          }

          commit();
        }}
        onKeyDown={onKeyDown}
        className={FIELD_CLASS}
      />
      {error && (
        <p id={`${id}-error`} className="text-destructive" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export const CURRENCY_SELECTOR_ID = "cost-currency";

export default function CostSection(): JSX.Element {
  const { t, language } = useTranslation();
  const settings = useCostSettingsStore((state) => state.settings);
  const printer = usePrinterStore((state) => state.selectedPrinter);
  const filament = useFilamentStore((state) => state.selectedFilament);
  // The price changes with the list of the filaments of the user
  useFilamentStore((state) => state.userFilamentIds);

  const symbol = currencySymbol(settings.currency, language);
  const filamentPrice = filament
    ? CostSettingsService.pricePerKgOf(filament, settings)
    : null;

  return (
    <div className="space-y-3" data-cost-section="">
      <label className="block space-y-1">
        <span className="font-medium text-foreground">
          {t("cost.currency")}
        </span>
        <select
          id={CURRENCY_SELECTOR_ID}
          value={settings.currency}
          onChange={(event) => {
            void CostSettingsService.setCurrency(
              event.target.value as Currency,
            );
          }}
          className={SELECT_CLASS}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {t(`cost.currencyName.${currency}`)}
            </option>
          ))}
        </select>
      </label>
      <p className="text-muted-foreground">{t("cost.notConverted")}</p>

      <CostField
        id="cost-electricity-price"
        label={t("cost.electricityPrice")}
        unit={`${symbol}/kWh`}
        kind="price"
        value={settings.electricityPrice}
        onCommit={(value) => CostSettingsService.setElectricityPrice(value)}
      />

      {printer ? (
        <CostField
          key={printer.id}
          id="cost-printer-power"
          label={t("cost.printerPower")}
          unit="W"
          kind="power"
          value={settings.printerPower[printer.id] ?? null}
          onCommit={(value) =>
            CostSettingsService.setPrinterPower(printer.id, value)
          }
        />
      ) : (
        <p>{t("cost.noPrinter")}</p>
      )}

      {filament ? (
        <CostField
          key={filament.id}
          id="cost-filament-price"
          label={t("cost.filamentPrice")}
          unit={`${symbol}/kg`}
          kind="price"
          value={filamentPrice}
          onCommit={(value) =>
            CostSettingsService.setFilamentPrice(filament, value)
          }
        />
      ) : (
        <p>{t("cost.noFilament")}</p>
      )}
    </div>
  );
}
