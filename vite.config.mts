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
 * Content Security Policy (SECURITY_SPEC.md, Renderer Content Security
 * Policy): a <meta> tag is added at the top of index.html.
 * - Built application (npm run build, npm start): strict policy,
 *   only files of the application ('self'); no inline script, no
 *   eval, no network access.
 * - Development server (npm run dev): also allows the inline script of
 *   React Fast Refresh, the <style> tags inserted by Vite and the
 *   WebSocket of hot reload. Never used by the built application.
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
import { defineConfig, type Plugin } from "vite";
import electron from "vite-plugin-electron";

const electronExternals = [
  "electron",
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

/**
 * Content Security Policy of the built application
 * (loaded from disk with BrowserWindow.loadFile).
 */
const PRODUCTION_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

/**
 * Content Security Policy of the development server (npm run dev):
 * inline script of React Fast Refresh, <style> tags of Vite,
 * WebSocket of hot reload on localhost. No eval.
 */
const DEVELOPMENT_CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self' ws://localhost:* ws://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

/**
 * Adds the Content Security Policy at the top of index.html:
 * development policy with the dev server, production policy in builds.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: "slicyweb-content-security-policy",
    transformIndexHtml: {
      order: "pre",
      handler(_html, context) {
        return [
          {
            tag: "meta",
            attrs: {
              "http-equiv": "Content-Security-Policy",
              content: context.server ? DEVELOPMENT_CSP : PRODUCTION_CSP,
            },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

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
    contentSecurityPolicy(),
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
