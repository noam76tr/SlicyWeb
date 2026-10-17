/**
 * SlicyWeb
 * Toolbar
 *
 * The eleven buttons of GUI_SPEC.md (Toolbar Buttons): Import, Save,
 * Undo, Redo, Move, Rotate, Scale, Reset, Analyze, Optimize, Generate.
 *
 * Import (Phase 5) opens the system file dialog (STL and 3MF). The other
 * buttons are visible and disabled until the phase that provides
 * their action. They use aria-disabled
 * instead of disabled, so that their tooltip ("available in a later
 * version") is still shown and they stay reachable with the keyboard.
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Toolbar Buttons)
 * - CLAUDE.md (Internationalization Rule)
 */

import { Fragment } from "react";
import {
  Move,
  Redo2,
  Rotate3d,
  RotateCcw,
  Save,
  Scaling,
  ScanSearch,
  Sparkles,
  Undo2,
  Upload,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { useTranslation } from "../hooks/useTranslation";
import { IMPORT_ACCEPT, openImportDialog } from "../import/openImportDialog";

interface ToolbarButtonDefinition {
  /** Dictionary key of the button label */
  key: string;

  icon: LucideIcon;

  /** The icon has a direction and is mirrored in right-to-left */
  mirrorInRtl?: boolean;

  /** Action of the button; a button without action is disabled */
  action?: () => void;
}

/** Groups of buttons, separated by a line */
const TOOLBAR_GROUPS: ToolbarButtonDefinition[][] = [
  [
    {
      key: "toolbar.import",
      icon: Upload,
      action: () => openImportDialog(IMPORT_ACCEPT.all),
    },
    { key: "toolbar.save", icon: Save },
  ],
  [
    { key: "toolbar.undo", icon: Undo2, mirrorInRtl: true },
    { key: "toolbar.redo", icon: Redo2, mirrorInRtl: true },
  ],
  [
    { key: "toolbar.move", icon: Move },
    { key: "toolbar.rotate", icon: Rotate3d },
    { key: "toolbar.scale", icon: Scaling },
    { key: "toolbar.reset", icon: RotateCcw },
  ],
  [
    { key: "toolbar.analyze", icon: ScanSearch },
    { key: "toolbar.optimize", icon: Sparkles },
    { key: "toolbar.generate", icon: WandSparkles },
  ],
];

export default function Toolbar(): JSX.Element {
  const { t } = useTranslation();

  const notAvailable = t("app.notAvailable");

  return (
    <div
      role="toolbar"
      aria-label={t("toolbar.title")}
      className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-card px-2"
    >
      {TOOLBAR_GROUPS.map((group, index) => (
        <Fragment key={group[0].key}>
          {index > 0 && (
            <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />
          )}

          {group.map((button) => {
            const Icon = button.icon;
            const label = t(button.key);
            const disabled = !button.action;

            return (
              <button
                key={button.key}
                type="button"
                aria-disabled={disabled || undefined}
                title={disabled ? `${label} (${notAvailable})` : label}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-transparent"
                onClick={disabled ? undefined : button.action}
              >
                <Icon
                  className={`size-4 ${button.mirrorInRtl ? "rtl:-scale-x-100" : ""}`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
