/**
 * Wichy
 * Left Sidebar Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

import SidebarSection from "./SidebarSection";

interface LeftSidebarProps {
  children?: React.ReactNode;
}

export default function LeftSidebar(
  props: LeftSidebarProps
): JSX.Element {
  return (
    <aside
      className="
        flex
        h-full
        w-80
        flex-col
        border-r
        border-gray-700
        bg-gray-900
      "
    >
      <SidebarSection title="Project">
        <div>
          Project information
        </div>
      </SidebarSection>

      <SidebarSection title="Import">
        <div>
          STL / 3MF import tools
        </div>
      </SidebarSection>

      <SidebarSection title="Objects">
        <div>
          Object management
        </div>
      </SidebarSection>

      {props.children}
    </aside>
  );
}
