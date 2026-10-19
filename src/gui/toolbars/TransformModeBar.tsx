/**
 * SlicyWeb
 * Transform Mode Bar
 *
 * Buttons Move, Rotate, Scale over the 3D viewport (top, start side):
 * they choose the gizmo of the selected object, like the keys G, R, S;
 * the active tool is shown highlighted. They are the only mode buttons
 * (not in the main toolbar), active only when an object is selected and
 * grayed out otherwise (decisions of Noam, Phase 6).
 *
 * Mounted by the GUI over the viewport: the Viewport Domain does not
 * depend on the GUI.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Toolbar Buttons, Object Gizmos, Keyboard Shortcuts)
 * - CLAUDE.md (Internationalization Rule)
 */

import { Move, Rotate3d, Scaling, type LucideIcon } from "lucide-react";

import { useObjectStore } from "../../state/objectStore";
import {
  useViewportStore,
  type TransformMode,
} from "../../state/viewportStore";
import { useTranslation } from "../hooks/useTranslation";

const MODES: {
  mode: TransformMode;
  key: string;
  shortcut: string;
  icon: LucideIcon;
}[] = [
  { mode: "translate", key: "transform.move", shortcut: "G", icon: Move },
  { mode: "rotate", key: "transform.rotate", shortcut: "R", icon: Rotate3d },
  { mode: "scale", key: "transform.scale", shortcut: "S", icon: Scaling },
];

export default function TransformModeBar(): JSX.Element {
  const { t } = useTranslation();
  const transformMode = useViewportStore((state) => state.transformMode);
  const setTransformMode = useViewportStore((state) => state.setTransformMode);
  const hasSelection = useObjectStore(
    (state) => state.selectedObjectId !== null,
  );

  return (
    <div
      role="toolbar"
      aria-label={t("transform.title")}
      className="absolute start-2 top-2 z-10 flex gap-0.5 rounded-lg border border-border bg-card/90 p-0.5 shadow-sm"
    >
      {MODES.map(({ mode, key, shortcut, icon: Icon }) => {
        const label = t(key);

        return (
          <button
            key={mode}
            type="button"
            aria-pressed={mode === transformMode}
            disabled={!hasSelection}
            title={`${label} (${shortcut})`}
            onClick={() => setTransformMode(mode)}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
