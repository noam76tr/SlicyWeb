/**
 * Wichy
 * Right Sidebar Component
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import React from "react";

import SidebarSection from "./SidebarSection";

interface RightSidebarProps {
  children?: React.ReactNode;
}

export default function RightSidebar(
  props: RightSidebarProps
): JSX.Element {
  return (
    <aside
      className="
        flex
        h-full
        w-80
        flex-col
        border-l
        border-gray-700
        bg-gray-900
      "
    >
      <SidebarSection title="Printer">
        <div>
          Printer settings
        </div>
      </SidebarSection>

      <SidebarSection title="Material">
        <div>
          Material settings
        </div>
      </SidebarSection>

      <SidebarSection title="Filament">
        <div>
          Filament settings
        </div>
      </SidebarSection>

      <SidebarSection title="Preset">
        <div>
          Preset settings
        </div>
      </SidebarSection>

      <SidebarSection title="Analysis">
        <div>
          Analysis results
        </div>
      </SidebarSection>

      <SidebarSection title="Recommendations">
        <div>
          Recommendation results
        </div>
      </SidebarSection>

      {props.children}
    </aside>
  );
}
