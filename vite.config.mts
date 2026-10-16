/**
 * SlicyWeb
 * Vite Configuration
 *
 * .mts extension: the file is loaded as an ES module, while
 * package.json stays CommonJS for the Electron main process (ADR-025).
 *
 * Builds:
 * - The renderer (index.html, src/gui/main.tsx) into dist/renderer/
 * - The Electron main process (src/electron/main.ts) into dist/electron/
 * - The Electron preload bridge (src/electron/preload.ts) into dist/electron/
 *
 * Renderer: Tailwind CSS 4 (@tailwindcss/vite) and the "@/" alias
 * for src/ (shadcn/ui prerequisite, ADR-025).
 *
 * Size warning: the renderer bundle includes Three.js (Phase 4, 3D
 * viewport) and is about 950 kB. The application is loaded from disk
 * by Electron, not downloaded, so this size does not slow its start.
 * The warning limit is raised to 1500 kB (DECISIONS.md, ADR-025), so
 * that it still reports an unexpected growth of the bundle.
 *
 * The output paths match src/electron/main.ts, which loads
 * preload.js next to itself and ../renderer/index.html.
 *
 * Based on:
 * - DECISIONS.md (ADR-025)
 * - TECH_STACK.md
 */

import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
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
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
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
    chunkSizeWarningLimit: 1500,
  },
});
