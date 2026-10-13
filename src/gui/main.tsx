/**
 * SlicyWeb
 * Renderer Entry Point
 *
 * Mounts the React application in index.html.
 *
 * No business logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - TECH_STACK.md
 * - DECISIONS.md (ADR-025)
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element 'root' not found in index.html.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
