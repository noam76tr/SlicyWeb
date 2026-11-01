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
 *   process; D7: synchronized with the same repository)
 */

import { app, BrowserWindow } from "electron";

import path from "node:path";

import { FilamentService } from "../services/FilamentService";
import { MaterialService } from "../services/MaterialService";
import { PrinterService } from "../services/PrinterService";
import { FilamentRepositorySync } from "../repositories/FilamentRepositorySync";
import { MaterialRepositorySync } from "../repositories/MaterialRepositorySync";
import {
  FilamentIndexSchema,
  MaterialIndexSchema,
  compareTags,
} from "../schemas/ProfileRepositorySchema";
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

/**
 * Folder of an Official list: the cache of the repository when it is
 * valid and not older than the copy of the application, otherwise that
 * copy (CACHE_001 when a cache exists but fails).
 */
function officialFolder(
  cache: PrinterProfileCache,
  bundled: string,
  applicationTag: string | null,
  kind: "printer" | "material" | "filament",
): { folder: string; loaded: LoadedProfiles } {
  const cached = cache.readValid();
  const valid =
    cached &&
    (applicationTag === null || compareTags(cached.tag, applicationTag) >= 0)
      ? cached
      : null;

  if (!cached && cache.exists()) {
    console.warn(`CACHE_001 Cache Corrupted: ${kind} profiles of the application used`);
  }

  return valid
    ? { folder: valid.folder, loaded: { origin: "repository", tag: valid.tag } }
    : { folder: bundled, loaded: { origin: "application", tag: applicationTag } };
}

function loadPrinters(
  printerService: PrinterService,
  cache: PrinterProfileCache,
  applicationTag: string | null,
): LoadedProfiles {
  const official = officialFolder(
    cache,
    BUNDLED_PRINTERS,
    applicationTag,
    "printer",
  );

  const result = printerService.loadProfiles([
    {
      folder: official.folder,
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

  return official.loaded;
}

/**
 * Material and filament profiles (Phase 8 lots 68 and 72): the Official
 * materials, then the Official filaments and the filaments of the user
 * (<user data folder>/filaments/, Local Custom). No other folder is read.
 * Each Official list is the cache of the SlicyWeb profile repository
 * (<user data folder>/cache/materials/profiles/,
 * cache/filaments/profiles/) when it is valid and not older than the copy
 * of the application, otherwise that copy (data/materials/,
 * data/filaments/, read only), as for the printers (ADR-033, D7).
 * A refused file is reported in the log (MAT_002, FIL_002).
 */
const BUNDLED_MATERIALS = path.join(__dirname, "../../data/materials");
const BUNDLED_FILAMENTS = path.join(__dirname, "../../data/filaments");

function loadMaterials(
  materialService: MaterialService,
  cache: PrinterProfileCache,
  applicationTag: string | null,
): LoadedProfiles {
  const official = officialFolder(
    cache,
    BUNDLED_MATERIALS,
    applicationTag,
    "material",
  );

  const result = materialService.loadProfiles([
    { folder: official.folder, source: "Official" },
  ]);

  for (const { code, source, fileName, reason } of result.rejected) {
    console.warn(`${code} ${source} material profile refused: ${fileName} (${reason})`);
  }

  return official.loaded;
}

function loadFilaments(
  filamentService: FilamentService,
  cache: PrinterProfileCache,
  applicationTag: string | null,
): LoadedProfiles {
  const official = officialFolder(
    cache,
    BUNDLED_FILAMENTS,
    applicationTag,
    "filament",
  );

  const result = filamentService.loadProfiles([
    { folder: official.folder, source: "Official" },
    {
      folder: path.join(app.getPath("userData"), "filaments"),
      source: "Local Custom",
    },
  ]);

  for (const { code, source, fileName, reason } of result.rejected) {
    console.warn(`${code} ${source} filament profile refused: ${fileName} (${reason})`);
  }

  return official.loaded;
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

  const materialService = new MaterialService();
  const materialCache = new PrinterProfileCache(
    path.join(app.getPath("userData"), "cache", "materials"),
    MaterialIndexSchema,
  );
  const materialTag = readIndexTag(BUNDLED_MATERIALS, MaterialIndexSchema);
  const materialSync = new ProfileSyncService(
    materialCache,
    () => loadMaterials(materialService, materialCache, materialTag),
    { applicationTag: materialTag, sync: new MaterialRepositorySync() },
  );
  await materialSync.start();

  const filamentService = new FilamentService();
  const filamentCache = new PrinterProfileCache(
    path.join(app.getPath("userData"), "cache", "filaments"),
    FilamentIndexSchema,
  );
  const filamentTag = readIndexTag(BUNDLED_FILAMENTS, FilamentIndexSchema);
  const filamentSync = new ProfileSyncService(
    filamentCache,
    () => loadFilaments(filamentService, filamentCache, filamentTag),
    { applicationTag: filamentTag, sync: new FilamentRepositorySync() },
  );
  await filamentSync.start();

  // Printer > Refresh Profiles checks the three lists (ADR-033, D7)
  const printerIPC = new PrinterIPC(printerService, profileSync, {
    materials: materialSync,
    filaments: filamentSync,
  });
  printerIPC.register();

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
