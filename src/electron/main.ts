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
 *   D5: profiles synchronized with the SlicyWeb profile repository;
 *   ADR-033, D6: material and filament profiles loaded by the main
 *   process)
 */

import { app, BrowserWindow } from "electron";

import path from "node:path";

import { FilamentService } from "../services/FilamentService";
import { MaterialService } from "../services/MaterialService";
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
import { FilamentIPC } from "./ipc/FilamentIPC";
import { ImportIPC } from "./ipc/ImportIPC";
import { MaterialIPC } from "./ipc/MaterialIPC";
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

/**
 * Material and filament profiles (Phase 8 lot 68): the materials of
 * data/materials/ (Official, read only); the filaments of data/filaments/
 * (Official, read only), then the filaments of the user
 * (<user data folder>/filaments/, Local Custom). No other folder is read.
 * A refused file is reported in the log (MAT_002, FIL_002).
 */
const BUNDLED_MATERIALS = path.join(__dirname, "../../data/materials");
const BUNDLED_FILAMENTS = path.join(__dirname, "../../data/filaments");

function loadMaterials(
  materialService: MaterialService,
  filamentService: FilamentService,
): void {
  const materials = materialService.loadProfiles([
    { folder: BUNDLED_MATERIALS, source: "Official" },
  ]);

  const filaments = filamentService.loadProfiles([
    { folder: BUNDLED_FILAMENTS, source: "Official" },
    {
      folder: path.join(app.getPath("userData"), "filaments"),
      source: "Local Custom",
    },
  ]);

  for (const { code, source, fileName, reason } of [
    ...materials.rejected,
    ...filaments.rejected,
  ]) {
    const kind = code === "MAT_002" ? "material" : "filament";
    console.warn(`${code} ${source} ${kind} profile refused: ${fileName} (${reason})`);
  }
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

  const materialService = new MaterialService();
  const filamentService = new FilamentService();
  loadMaterials(materialService, filamentService);

  const materialIPC = new MaterialIPC(materialService);
  materialIPC.register();

  const filamentIPC = new FilamentIPC(filamentService);
  filamentIPC.register();

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
