/**
 * SlicyWeb
 * Sidebar Section Component
 *
 * Titled section of a side panel (Properties Panel sections,
 * GUI_SPEC.md). The title is passed already translated.
 *
 * Based on:
 * - GUI_SPEC.md
 * - ARCHITECTURE.md
 */

import type { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;

  children?: ReactNode;
}

export default function SidebarSection(
  props: SidebarSectionProps
): JSX.Element {
  return (
    <section className="border-b border-border">
      <h3 className="px-3 pt-2.5 pb-1 text-sm font-semibold">
        {props.title}
      </h3>

      <div className="px-3 pb-3 text-xs text-muted-foreground">
        {props.children}
      </div>
    </section>
  );
}
