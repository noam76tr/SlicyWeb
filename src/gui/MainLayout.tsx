/**
 * Wichy
 * Main Layout
 *
 * Responsible for:
 * - Main application layout
 * - Panel organization
 * - View structure
 *
 * No business logic.
 * No AI logic.
 * No rendering logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - FILE_STRUCTURE.md
 */

import type { ReactNode } from "react";

interface MainLayoutProps {
  leftPanel?: ReactNode;

  centerPanel: ReactNode;

  rightPanel?: ReactNode;

  statusBar?: ReactNode;
}

export default function MainLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  statusBar,
}: MainLayoutProps): JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-900 text-white">
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-neutral-800">
          {leftPanel}
        </aside>

        <section className="flex-1 overflow-hidden">
          {centerPanel}
        </section>

        <aside className="w-80 border-l border-neutral-800">
          {rightPanel}
        </aside>
      </main>

      <footer className="h-8 border-t border-neutral-800">
        {statusBar}
      </footer>
    </div>
  );
}
