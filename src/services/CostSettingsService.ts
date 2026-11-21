/**
 * SlicyWeb
 * Cost Settings Service Definition
 *
 * Reads and saves the cost settings of the user (Phase 12, ADR-037;
 * answers of Noam to lot 107, Q7 to Q11 A; DATA_SCHEMA.md 3.15.0, User
 * Preferences Schema: cost; USER_SETTINGS_SPEC.md 2.3.0, Cost Settings):
 * - load(): reads cost from settings.json (settings:get) into the cost
 *   settings store;
 * - setCurrency(), setElectricityPrice(), setPrinterPower(): change one
 *   value, then save cost as a whole (settings:update); the prices typed
 *   before are not converted when the currency changes (Q7 A);
 * - setFilamentPrice(): the price per kg of a filament (Q10 A): for a
 *   filament of the user, its field pricePerKg (filament:update, through
 *   MaterialSelectionService); for a shipped filament, which cannot be
 *   changed, an entry of cost.filamentPrices;
 * - pricePerKgOf(): the price used for a filament.
 * A value is shown at once; when the save is refused, the settings are
 * read again (the value saved before comes back).
 *
 * Outside Electron (no window.slicyWeb), the settings stay in memory.
 *
 * Domain: Service. Depends on State Management, the Validation Domain
 * (UserPreferencesSchema) and the IPC bridge (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DATA_SCHEMA.md (3.15.0: User Preferences Schema, Filament Schema)
 * - USER_SETTINGS_SPEC.md (2.3.0: Cost Settings)
 * - DECISIONS.md (ADR-037)
 * - GUI_SPEC.md (Cost Section)
 */

import { z } from "zod";

import { COST_LIMITS, type Currency } from "../constants/CostConstants";
import { CostPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { useCostSettingsStore } from "../state/costSettingsStore";
import { useFilamentStore } from "../state/filamentStore";
import type { Filament } from "../types/Filament";
import type { CostPreferences } from "../types/UserPreferences";

import { MaterialSelectionService } from "./MaterialSelectionService";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const SettingsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settings: z.object({ cost: CostPreferencesSchema }),
  }),
});

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

/** Kind of value typed in the Cost Section */
export type CostFieldKind = "price" | "power";

/** Reading of a field: a number, empty (null), or the key of the error */
export type CostFieldResult =
  { ok: true; value: number | null } | { ok: false; error: string };

/**
 * Reads a value typed in the Cost Section: empty = null (not given); a
 * comma is accepted as decimal separator; a price from 0 to 1 000 000, a
 * power above 0 and at most 10 000 W (USER_SETTINGS_SPEC.md 2.3.0).
 */
export function parseCostField(
  text: string,
  kind: CostFieldKind,
): CostFieldResult {
  const normalized = text.trim().replace(",", ".");

  if (normalized === "") {
    return { ok: true, value: null };
  }

  const value = Number(normalized);

  if (kind === "power") {
    return Number.isFinite(value) &&
      value > 0 &&
      value <= COST_LIMITS.MAX_POWER_W
      ? { ok: true, value }
      : { ok: false, error: "cost.error.power" };
  }

  return Number.isFinite(value) && value >= 0 && value <= COST_LIMITS.MAX_PRICE
    ? { ok: true, value }
    : { ok: false, error: "cost.error.price" };
}

/** The filament is one of the user (it can be changed) */
function isUserFilament(filamentId: string): boolean {
  return useFilamentStore.getState().userFilamentIds.includes(filamentId);
}

async function readCost(bridge: Bridge): Promise<CostPreferences | null> {
  const result = SettingsResponseSchema.safeParse(
    await bridge.invoke("settings:get"),
  );

  return result.success ? result.data.data.settings.cost : null;
}

async function load(): Promise<void> {
  const bridge = getBridge();

  if (!bridge) {
    return;
  }

  try {
    const cost = await readCost(bridge);

    if (cost) {
      useCostSettingsStore.getState().setSettings(cost);
    } else {
      console.error("Cost settings could not be read.");
    }
  } catch (error) {
    console.error("Cost settings could not be read.", error);
  }
}

/** Shows the new settings at once, then saves cost as a whole */
async function save(next: CostPreferences): Promise<void> {
  const store = useCostSettingsStore.getState();

  store.setSettings(next, store.loaded);

  const bridge = getBridge();

  if (!bridge) {
    return;
  }

  try {
    const response = (await bridge.invoke("settings:update", {
      cost: next,
    })) as { success?: boolean; errors?: unknown };

    if (response.success !== true) {
      console.error("Cost settings could not be saved.", response.errors);
      await load();
    }
  } catch (error) {
    console.error("Cost settings could not be saved.", error);
    await load();
  }
}

function current(): CostPreferences {
  return useCostSettingsStore.getState().settings;
}

/** A record without the key, or with the new value */
function withEntry(
  record: Record<string, number>,
  key: string,
  value: number | null,
): Record<string, number> {
  const next = { ...record };

  if (value === null) {
    delete next[key];
  } else {
    next[key] = value;
  }

  return next;
}

export const CostSettingsService = {
  load,

  setCurrency(currency: Currency): Promise<void> {
    return save({ ...current(), currency });
  },

  setElectricityPrice(price: number | null): Promise<void> {
    return save({ ...current(), electricityPrice: price });
  },

  /** Average power (W) of a printer, or null to forget it */
  setPrinterPower(printerId: string, power: number | null): Promise<void> {
    const settings = current();

    return save({
      ...settings,
      printerPower: withEntry(settings.printerPower, printerId, power),
    });
  },

  /**
   * Price per kg of a filament (Q10 A): pricePerKg of a filament of the
   * user, an entry of cost.filamentPrices for a shipped filament.
   */
  async setFilamentPrice(
    filament: Filament,
    price: number | null,
  ): Promise<boolean> {
    if (isUserFilament(filament.id)) {
      const change = await MaterialSelectionService.updateFilament({
        ...filament,
        pricePerKg: price,
      });

      return change.ok;
    }

    const settings = current();

    await save({
      ...settings,
      filamentPrices: withEntry(settings.filamentPrices, filament.id, price),
    });

    return true;
  },

  /** Price per kg used for a filament, or null when none is given */
  pricePerKgOf(
    filament: Filament,
    settings: CostPreferences = current(),
  ): number | null {
    if (isUserFilament(filament.id)) {
      return filament.pricePerKg;
    }

    return settings.filamentPrices[filament.id] ?? filament.pricePerKg;
  },
};

export default CostSettingsService;
