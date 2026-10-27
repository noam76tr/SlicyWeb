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
 * - add(), update(), remove(): printers of the user (Local Custom,
 *   Phase 7 lot 61) through printer:add, printer:update and
 *   printer:remove, then the printers are read again. The selected
 *   printer follows its update; when it is removed, no printer is
 *   selected and the saved choice is cleared.
 * - refresh(): checks the SlicyWeb profile repository (printer:refresh,
 *   Phase 7 lot 62). load() asks for it in the background when the
 *   setting printer.autoCheckProfiles is true (at most once a day,
 *   decided by the main process); Printer > Refresh Profiles forces it,
 *   whatever the setting. setAutoCheckProfiles() saves the setting. When the profiles were updated, the printers are read
 *   again (a printer no longer listed is no longer selected). The
 *   origin and tag of the profiles and the message of the last check
 *   are kept in the printer store; a failed check in the background
 *   shows nothing.
 *
 * The window never reads a profile file: printers come only through the
 * printer:* channels (ADR-032, D4). Outside Electron (no window.slicyWeb),
 * no printer is loaded and nothing is saved.
 *
 * Domain: Service. Depends on State Management and on the IPC bridge
 * (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - DECISIONS.md (ADR-032, D4, D5, D8)
 * - API_SPEC.md (PrinterIPC Channels, SettingsIPC Channels)
 * - DATA_SCHEMA.md (Printer Schema, User Preferences Schema)
 * - USER_SETTINGS_SPEC.md (Printer Settings)
 */

import { z } from "zod";

import { PrinterSchema } from "../schemas/PrinterSchema";
import { PrinterPreferencesSchema } from "../schemas/UserPreferencesSchema";
import { usePrinterStore, type ProfilesMessage } from "../state/printerStore";
import type { Printer } from "../types/Printer";
import type { PrinterPreferences } from "../types/UserPreferences";

type Bridge = Pick<Window["slicyWeb"], "invoke">;

const ProfilesStatusSchema = z.object({
  origin: z.enum(["repository", "application"]),
  tag: z.string().nullable(),
  checkedAt: z.string().nullable(),
});

const PrintersResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    printers: z.array(PrinterSchema),
    userPrinterIds: z.array(z.string()).default([]),
    profiles: ProfilesStatusSchema.nullable().default(null),
  }),
});

const RefreshResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      status: z.enum(["skipped", "upToDate", "updated", "failed"]),
      profiles: ProfilesStatusSchema,
    })
    .partial()
    .default({}),
  errors: z.array(z.string()).default([]),
});

const PrinterResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ printer: PrinterSchema }),
});

const ErrorResponseSchema = z.object({
  errors: z.array(z.string()).default([]),
});

/** Result of a change of a printer of the user */
export type PrinterChange =
  { ok: true; printer: Printer | null } | { ok: false; errors: string[] };

/** Errors of a refused response: "PRN_00X Name" or "path: message" */
function errorsOf(response: unknown): string[] {
  const result = ErrorResponseSchema.safeParse(response);
  const errors = result.success ? result.data.errors : [];

  return errors.length > 0 ? errors : ["Unknown error"];
}

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

/**
 * Saves a change of the printer settings (settings:update). printer is
 * replaced as a whole: the other fields keep their saved values.
 */
async function savePrinterSettings(
  bridge: Bridge,
  change: Partial<PrinterPreferences>,
): Promise<void> {
  try {
    const settings = await readPrinterSettings(bridge);
    const response = (await bridge.invoke("settings:update", {
      printer: {
        defaultPrinter: settings?.defaultPrinter ?? null,
        autoloadLastPrinter: settings?.autoloadLastPrinter ?? true,
        autoCheckProfiles: settings?.autoCheckProfiles ?? true,
        ...change,
      },
    })) as { success?: boolean; errors?: unknown };

    if (response.success !== true) {
      console.error("Printer settings could not be saved.", response.errors);
    }
  } catch (error) {
    console.error("Printer settings could not be saved.", error);
  }
}

/** Printers sorted by brand, then by model */
function sortPrinters(printers: Printer[]): Printer[] {
  return [...printers].sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model),
  );
}

/**
 * Reads the printers (printer:getAll) into the store; null when the
 * response is refused.
 */
async function readPrinters(bridge: Bridge): Promise<Printer[] | null> {
  const result = PrintersResponseSchema.safeParse(
    await bridge.invoke("printer:getAll"),
  );

  if (!result.success) {
    console.error("Printers could not be read.", result.error.issues);
    return null;
  }

  const printers = sortPrinters(result.data.data.printers);
  const store = usePrinterStore.getState();
  store.setPrinters(printers);
  store.setUserPrinterIds(result.data.data.userPrinterIds);
  store.setProfiles(result.data.data.profiles);

  return printers;
}

/**
 * Keeps the selected printer up to date with the printers read: its new
 * version, or no printer (and the saved choice cleared) when it is no
 * longer loaded.
 */
async function followSelection(printers: Printer[]): Promise<void> {
  const selected = usePrinterStore.getState().selectedPrinter;

  if (!selected) {
    return;
  }

  const current = printers.find((item) => item.id === selected.id);

  if (current) {
    usePrinterStore.getState().setSelectedPrinter(current);
  } else {
    await PrinterSelectionService.select(null);
  }
}

/** Message of a check of the profiles */
function refreshMessage(
  status: string | undefined,
  tag: string | null,
  errors: string[],
): ProfilesMessage {
  if (status === "updated") {
    return { key: "printer.profiles.updated", tag };
  }
  if (status === "upToDate" || status === "skipped") {
    return { key: "printer.profiles.upToDate", tag };
  }
  return {
    key: errors.some((error) => error.startsWith("SYNC_004"))
      ? "printer.profiles.refused"
      : "printer.profiles.unreachable",
    tag,
  };
}

/**
 * Sends a change of a printer of the user, then reads the printers
 * again. The selected printer is replaced by its new version, or
 * cleared when it is no longer loaded.
 */
async function change(
  channel: "printer:add" | "printer:update" | "printer:remove",
  payload: unknown,
): Promise<PrinterChange> {
  const bridge = getBridge();

  if (!bridge) {
    return { ok: false, errors: ["Printers are not available"] };
  }

  try {
    const response = await bridge.invoke(channel, payload);

    if ((response as { success?: unknown } | null)?.success !== true) {
      return { ok: false, errors: errorsOf(response) };
    }

    const changed = PrinterResponseSchema.safeParse(response);
    await followSelection((await readPrinters(bridge)) ?? []);

    return {
      ok: true,
      printer: changed.success ? changed.data.data.printer : null,
    };
  } catch (error) {
    console.error("Printer could not be changed.", error);
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export const PrinterSelectionService = {
  /** Adds a printer of the user; its id is chosen by the main process */
  add(printer: Printer): Promise<PrinterChange> {
    return change("printer:add", printer);
  },

  /** Replaces a printer of the user */
  update(printer: Printer): Promise<PrinterChange> {
    return change("printer:update", printer);
  },

  /** Removes a printer of the user */
  remove(printerId: string): Promise<PrinterChange> {
    return change("printer:remove", { printerId });
  },

  /**
   * Checks the profile repository: now when force is true (Printer >
   * Refresh Profiles), otherwise when the main process decides it is
   * time. A forced check always shows its message.
   */
  async refresh(force: boolean): Promise<void> {
    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    const store = usePrinterStore.getState();

    if (force) {
      store.setProfilesMessage({ key: "printer.profiles.checking", tag: null });
    }

    try {
      const result = RefreshResponseSchema.safeParse(
        await bridge.invoke("printer:refresh", { force }),
      );

      if (!result.success) {
        console.error("Profiles could not be checked.", result.error.issues);
        if (force) {
          store.setProfilesMessage({
            key: "printer.profiles.unreachable",
            tag: null,
          });
        }
        return;
      }

      const { status, profiles } = result.data.data;

      if (status === "updated") {
        await followSelection((await readPrinters(bridge)) ?? []);
      }

      if (profiles) {
        usePrinterStore.getState().setProfiles(profiles);
      }

      if (force || status === "updated") {
        usePrinterStore
          .getState()
          .setProfilesMessage(
            refreshMessage(status, profiles?.tag ?? null, result.data.errors),
          );
      }
    } catch (error) {
      console.error("Profiles could not be checked.", error);
      if (force) {
        store.setProfilesMessage({
          key: "printer.profiles.unreachable",
          tag: null,
        });
      }
    }
  },

  async load(): Promise<void> {
    const bridge = getBridge();

    if (!bridge) {
      return;
    }

    try {
      const printers = await readPrinters(bridge);

      if (!printers) {
        return;
      }

      const store = usePrinterStore.getState();

      const settings = await readPrinterSettings(bridge);
      store.setAutoCheckProfiles(settings?.autoCheckProfiles ?? true);

      if (settings?.autoloadLastPrinter && settings.defaultPrinter !== null) {
        const last = printers.find(
          (printer) => printer.id === settings.defaultPrinter,
        );

        if (last) {
          store.setSelectedPrinter(last);
        }
      }

      // In the background: the start never waits for the network
      if (settings?.autoCheckProfiles ?? true) {
        void PrinterSelectionService.refresh(false);
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

    await savePrinterSettings(bridge, { defaultPrinter: printer?.id ?? null });
  },

  /**
   * Saves the setting "Check for profile updates automatically"
   * (printer.autoCheckProfiles); the next start follows it.
   */
  async setAutoCheckProfiles(enabled: boolean): Promise<void> {
    usePrinterStore.getState().setAutoCheckProfiles(enabled);

    const bridge = getBridge();

    if (bridge) {
      await savePrinterSettings(bridge, { autoCheckProfiles: enabled });
    }
  },
};

export default PrinterSelectionService;
