/**
 * SlicyWeb
 * Renderer Entry Point
 *
 * Mounts the React application in index.html, inside the
 * I18nProvider (translations, language and text direction).
 *
 * No business logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - DECISIONS.md (ADR-025)
 * - GUI_SPEC.md (Localization)
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { I18nProvider } from "./components/I18nProvider";

import "./styles/global.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element 'root' not found in index.html.");
}

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
