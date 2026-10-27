/**
 * SlicyWeb
 * Printer Selection Service
 *
 * Printers of the window (renderer, Phase 7):
 * - load(): reads the printers loaded by the main process
 *   (printer:getAll), validates them with PrinterSchema and puts them in
 *   the printer store; then reads the printer settings (settings:get).
 *   When autoloadLastPrinter is true and defaultPrinter is still a loaded
 *   printer, it is selected again. A defaultPrinter that is no longer
 *   loaded is ignored (DATA_SCHEMA.md, User Preferences Schema).
 * - select(): selects a printer (or none) and saves it as the last
 *   printer (settings:update, printer.defaultPrinter). The build plate of
 *   the viewport follows the printer store.
 *
 * The window never reads a profile file: printers come only through the
 * printer:* channels (ADR-032, D4). Outside Electron (no window.slicyWeb),
 * no printer is loaded and nothing is saved.
 *
 * Domain: Service. Depends on State Management and on the IPC bridge
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D4, D8)
 * - API_SPEC.md (PrinterIPC Channels, SettingsIPC Channels)
 * - DATA_SCHEMA.md (Printer Schema, User Preferences Schema)
 * - USER_SETTINGS_SPEC.md (Printer Settings)
 */

import { z } from "zod";

import { PrinterSchema } from "../schemas/PrinterSchema";
import { PrinterPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { usePrinterStore } from "../state/printerStore";
import type { Printer } from "../types/Printer";
import type { PrinterPreferences } from "../types/UserPreferences";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const PrintersResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ printers: z.array(PrinterSchema) }),
});

const SettingsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    settings: z.object({ printer: PrinterPreferencesSchema }),
  }),
});

function getBridge(): Bridge | null {
  return typeof globalThis.window?.slicyWeb?.invoke === "function"
    ? globalThis.window.slicyWeb
    : null;
}

async function readPrinterSettings(
  bridge: Bridge,
): Promise<PrinterPreferences | null> {
  const result = SettingsResponseSchema.safeParse(
    await bridge.invoke("settings:get"),
  );

  return result.success ? result.data.data.settings.printer : null;
}

/** Printers sorted by brand, then by model */
function sortPrinters(printers: Printer[]): Printer[] {
  return [...printers].sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model),
  );
}

export const PrinterSelectionService = {
  async load(): Promise<void> {
    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const result = PrintersResponseSchema.safeParse(
        await bridge.invoke("printer:getAll"),
      );

      if (!result.success) {
        console.error("Printers could not be read.", result.error.issues);
        return;
      }

      const printers = sortPrinters(result.data.data.printers);
      const store = usePrinterStore.getState();
      store.setPrinters(printers);

      const settings = await readPrinterSettings(bridge);

      if (settings?.autoloadLastPrinter && settings.defaultPrinter !== null) {
        const last = printers.find(
          (printer) => printer.id === settings.defaultPrinter,
        );

        if (last) {
          store.setSelectedPrinter(last);
        }
      }
    } catch (error) {
      console.error("Printers could not be read.", error);
    }
  },

  async select(printerId: string | null): Promise<void> {
    const store = usePrinterStore.getState();
    const printer =
      printerId === null
        ? null
        : (store.printers.find((item) => item.id === printerId) ?? null);

    if (printerId !== null && !printer) {
      return;
    }

    store.setSelectedPrinter(printer);

    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const settings = await readPrinterSettings(bridge);
      const response = (await bridge.invoke("settings:update", {
        printer: {
          defaultPrinter: printer?.id ?? null,
          autoloadLastPrinter: settings?.autoloadLastPrinter ?? true,
        },
      })) as { success?: boolean; errors?: unknown };

      if (response.success !== true) {
        console.error("Printer could not be saved.", response.errors);
      }
    } catch (error) {
      console.error("Printer could not be saved.", error);
    }
  },
};

export default PrinterSelectionService;
