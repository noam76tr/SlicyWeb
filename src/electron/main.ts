/**
 * Wichy
 * Electron Main Process
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - GUI_SPEC.md
 */

import { app, BrowserWindow } from "electron";

import path from "node:path";

let mainWindow: BrowserWindow | null =
  null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,

    height: 900,

    minWidth: 1280,

    minHeight: 720,

    show: false,

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation: true,

      nodeIntegration: false
    }
  });

  mainWindow.once(
    "ready-to-show",
    () => {
      mainWindow?.show();
    }
  );

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL
    );
  } else {
    void mainWindow.loadFile(
      path.join(
        __dirname,
        "../renderer/index.html"
      )
    );
  }

  mainWindow.on(
    "closed",
    () => {
      mainWindow = null;
    }
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on(
    "activate",
    () => {
      if (
        BrowserWindow.getAllWindows()
          .length === 0
      ) {
        createWindow();
      }
    }
  );
});

app.on(
  "window-all-closed",
  () => {
    if (
      process.platform !== "darwin"
    ) {
      app.quit();
    }
  }
);
