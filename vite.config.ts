/**
 * SlicyWeb
 * Vite Configuration
 *
 * Builds:
 * - The renderer (index.html, src/gui/main.tsx) into dist/renderer/
 * - The Electron main process (src/electron/main.ts) into dist/electron/
 * - The Electron preload bridge (src/electron/preload.ts) into dist/electron/
 *
 * The output paths match src/electron/main.ts, which loads
 * preload.js next to itself and ../renderer/index.html.
 *
 * Based on:
 * - DECISIONS.md (ADR-025)
 * - TECH_STACK.md
 */

import { builtinModules } from "node:module";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";

const electronExternals = [
  "electron",
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

const electronBuild = {
  outDir: "dist/electron",
  emptyOutDir: false,
  rolldownOptions: {
    external: electronExternals,
  },
};

export default defineConfig({
  // Relative asset paths: the built index.html is loaded from disk
  // with BrowserWindow.loadFile (src/electron/main.ts).
  base: "./",
  plugins: [
    react(),
    electron([
      {
        entry: "src/electron/main.ts",
        vite: {
          build: electronBuild,
        },
      },
      {
        entry: "src/electron/preload.ts",
        vite: {
          build: electronBuild,
        },
      },
    ]),
  ],
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
  },
});
