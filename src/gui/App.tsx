/**
 * Wichy
 * App
 *
 * Main application component.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import { useEffect } from "react";

export default function App(): JSX.Element {
  useEffect(() => {
    document.title = "Wichy";
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-900 text-white">
      <header className="h-14 flex items-center px-4 border-b border-neutral-800">
        <h1 className="text-lg font-semibold">
          Wichy
        </h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-neutral-800 p-4">
          <h2 className="text-sm font-semibold mb-4">
            Project
          </h2>

          <div className="space-y-2">
            <button
              className="
                w-full
                rounded
                bg-blue-600
                px-3
                py-2
                text-left
                hover:bg-blue-500
              "
            >
              Import STL
            </button>

            <button
              className="
                w-full
                rounded
                bg-blue-600
                px-3
                py-2
                text-left
                hover:bg-blue-500
              "
            >
              Import 3MF
            </button>
          </div>
        </aside>

        <section className="flex-1 relative">
          <div
            id="renderer-container"
            className="absolute inset-0"
          />
        </section>

        <aside className="w-80 border-l border-neutral-800 p-4">
          <h2 className="text-sm font-semibold mb-4">
            Analysis
          </h2>

          <div className="text-sm text-neutral-400">
            No model loaded.
          </div>
        </aside>
      </main>

      <footer className="h-8 flex items-center px-4 border-t border-neutral-800 text-xs text-neutral-500">
        Wichy v1.0.0
      </footer>
    </div>
  );
}
