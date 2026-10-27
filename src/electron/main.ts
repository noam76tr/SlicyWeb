/**
 * SlicyWeb
 * Electron Main Process
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md
 * - API_SPEC.md (IPC Layer)
 * - USER_SETTINGS_SPEC.md (Storage Location)
 * - DECISIONS.md (ADR-032, D4: printer profiles loaded by the main process;
 *   D5: profiles synchronized with the SlicyWeb profile repository)
 */

import { app, BrowserWindow } from "electron";

import path from "node:path";

import { PrinterService } from "../services/PrinterService";
import { compareTags } from "../schemas/ProfileRepositorySchema";
import { ProfileSyncService } from "../services/ProfileSyncService";
import { StorageService } from "../services/StorageService";
import {
  PrinterProfileCache,
  readIndexTag,
} from "../storage/PrinterProfileCache";
import { SettingsStorage } from "../storage/SettingsStorage";
import type { LoadedProfiles } from "../types/ProfileSync";
import { StorageManager } from "../storage/StorageManager";

import { ProjectIPC } from "./ipc/ProjectIPC";
import { ImportIPC } from "./ipc/ImportIPC";
import { PrinterIPC } from "./ipc/PrinterIPC";
import { SettingsIPC } from "./ipc/SettingsIPC";
import { StorageIPC } from "./ipc/StorageIPC";

let mainWindow: BrowserWindow | null = null;

/**
 * Printer profiles: the Official list, then the printers of the user
 * (<user data folder>/printers/, Local Custom). No other folder is read.
 * The Official list is the cache of the SlicyWeb profile repository
 * (<user data folder>/cache/printers/profiles/) when it is valid and
 * not older than the copy shipped with the application (the most recent
 * tag wins), otherwise that copy (data/printers/, read only; CACHE_001
 * when a cache exists but fails).
 * The main process runs from dist/electron/; the location of data/ in the
 * installed application is decided with the packaging (Phase 16).
 */
const BUNDLED_PRINTERS = path.join(__dirname, "../../data/printers");

function loadPrinters(
  printerService: PrinterService,
  cache: PrinterProfileCache,
  applicationTag: string | null,
): LoadedProfiles {
  const bundled = BUNDLED_PRINTERS;
  const cached = cache.readValid();
  const valid =
    cached &&
    (applicationTag === null || compareTags(cached.tag, applicationTag) >= 0)
      ? cached
      : null;

  if (!cached && cache.exists()) {
    console.warn("CACHE_001 Cache Corrupted: printer profiles of the application used");
  }

  const result = printerService.loadProfiles([
    {
      folder: valid?.folder ?? bundled,
      source: "Official",
    },
    {
      folder: path.join(app.getPath("userData"), "printers"),
      source: "Local Custom",
    },
  ]);

  for (const { code, source, fileName, reason } of result.rejected) {
    console.warn(`${code} ${source} printer profile refused: ${fileName} (${reason})`);
  }

  return valid
    ? { origin: "repository", tag: valid.tag }
    : { origin: "application", tag: applicationTag };
}

async function registerIPCHandlers(): Promise<void> {
  const projectIPC = new ProjectIPC();
  projectIPC.register();

  const importIPC = new ImportIPC();
  importIPC.register();

  const printerService = new PrinterService();
  const profileCache = new PrinterProfileCache(
    path.join(app.getPath("userData"), "cache", "printers"),
  );
  const applicationTag = readIndexTag(BUNDLED_PRINTERS);
  const profileSync = new ProfileSyncService(
    profileCache,
    () => loadPrinters(printerService, profileCache, applicationTag),
    { applicationTag },
  );
  await profileSync.start();

  const printerIPC = new PrinterIPC(printerService, profileSync);
  printerIPC.register();

  // User preferences: settings.json in the user data folder
  // (Windows: %APPDATA%\SlicyWeb), separate from WYPROJ project files
  // (USER_SETTINGS_SPEC.md, Storage Location).
  const storageService = new StorageService(
    new StorageManager(
      new SettingsStorage(
        path.join(app.getPath("userData"), "settings.json"),
      ),
    ),
  );

  const settingsIPC = new SettingsIPC(storageService);
  settingsIPC.register();

  const storageIPC = new StorageIPC();
  storageIPC.register();
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, "../renderer/index.html"),
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Register all IPC handlers
  await registerIPCHandlers();

  // Create application window
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
