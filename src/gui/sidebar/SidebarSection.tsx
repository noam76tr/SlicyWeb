/**
 * Wichy
 * Sidebar Section Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

interface SidebarSectionProps {
  title: string;

  children?: React.ReactNode;
}

export default function SidebarSection(
  props: SidebarSectionProps
): JSX.Element {
  return (
    <section
      className="
        border-b
        border-gray-700
      "
    >
      <header
        className="
          px-3
          py-2
          font-semibold
          text-gray-200
        "
      >
        {props.title}
      </header>

      <div
        className="
          px-3
          pb-3
          text-sm
          text-gray-400
        "
      >
        {props.children}
      </div>
    </section>
  );
}
