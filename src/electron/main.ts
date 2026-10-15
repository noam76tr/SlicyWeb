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
 */

import { app, BrowserWindow } from "electron";

import path from "node:path";

import { StorageService } from "../services/StorageService";
import { SettingsStorage } from "../storage/SettingsStorage";
import { StorageManager } from "../storage/StorageManager";

import { ProjectIPC } from "./ipc/ProjectIPC";
import { ImportIPC } from "./ipc/ImportIPC";
import { PrinterIPC } from "./ipc/PrinterIPC";
import { SettingsIPC } from "./ipc/SettingsIPC";
import { StorageIPC } from "./ipc/StorageIPC";

let mainWindow: BrowserWindow | null = null;

function registerIPCHandlers(): void {
  const projectIPC = new ProjectIPC();
  projectIPC.register();

  const importIPC = new ImportIPC();
  importIPC.register();

  const printerIPC = new PrinterIPC();
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

app.whenReady().then(() => {
  // Register all IPC handlers
  registerIPCHandlers();

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
