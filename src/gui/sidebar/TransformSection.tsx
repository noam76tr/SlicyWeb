/**
 * SlicyWeb
 * Transform Section (Properties Panel)
 *
 * Transform of the selected object (GUI_SPEC.md, Transform Section,
 * Transform Actions):
 * - Position X, Y in mm; Position Z shown, not editable: the object always
 *   stands on the plate;
 * - Rotation X, Y, Z in degrees (around the axes of the plate, ADR-031);
 * - Scale X, Y, Z in %, with a lock that keeps the proportions (on by
 *   default);
 * - Size X, Y, Z in mm (along the axes of the object), linked to the scale:
 *   changing one updates the other;
 * - Reset Position, Reset Rotation, Reset Scale, Center On Bed.
 *
 * The rows follow the mode of the gizmo (decision of Noam, Phase 6):
 * - Move: Position and Scale; Reset Position, Center On Bed, Reset Scale;
 * - Rotate: Rotation; Reset Rotation;
 * - Scale: Scale and Size; Reset Scale.
 * The lock of the scale is kept in the viewport store: the Scale gizmo
 * uses the same one.
 *
 * A value is applied with Enter or when the field loses the focus; Escape
 * restores it. A comma is accepted as decimal separator. Every change goes
 * through TransformService (one place for undo and redo).
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Transform Section, Transform Actions)
 * - DATA_SCHEMA.md (Transform Rules)
 * - CLAUDE.md (Internationalization Rule)
 */

import { Lock, LockOpen } from "lucide-react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { TransformService, type Axis } from "../../services/TransformService";
import {
  useViewportStore,
  type TransformMode,
} from "../../state/viewportStore";
import { Button } from "../components/ui/button";
import { useTranslation } from "../hooks/useTranslation";

import type { Object3D } from "../../types/Object3D";

const AXES: Axis[] = ["x", "y", "z"];

type TransformRow = "position" | "rotation" | "scale" | "size";

type TransformAction =
  | "resetPosition"
  | "centerOnBed"
  | "resetRotation"
  | "resetScale";

/** Rows and actions shown for each mode of the gizmo */
const MODE_LAYOUT: Record<
  TransformMode,
  { rows: TransformRow[]; actions: TransformAction[] }
> = {
  translate: {
    rows: ["position", "scale"],
    actions: ["resetPosition", "centerOnBed", "resetScale"],
  },
  rotate: { rows: ["rotation"], actions: ["resetRotation"] },
  scale: { rows: ["scale", "size"], actions: ["resetScale"] },
};

const ACTIONS: Record<TransformAction, (objectId: string) => boolean> = {
  resetPosition: (objectId) => TransformService.resetPosition(objectId),
  centerOnBed: (objectId) => TransformService.centerOnBed(objectId),
  resetRotation: (objectId) => TransformService.resetRotation(objectId),
  resetScale: (objectId) => TransformService.resetScale(objectId),
};

/** Value shown in a field: 2 decimals at most */
function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function parse(text: string): number {
  const normalized = text.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

interface NumberFieldProps {
  axis: Axis;
  value: number;
  label: string;
  readOnly?: boolean;
  title?: string;
  /** Returns false when the value is refused */
  onCommit?: (value: number) => boolean;
}

function NumberField({
  axis,
  value,
  label,
  readOnly = false,
  title,
  onCommit,
}: NumberFieldProps): JSX.Element {
  const [text, setText] = useState(format(value));
  const [editing, setEditing] = useState(false);

  // Set by Enter and Escape, which handle the value themselves: the blur
  // that follows must not apply it again (or apply a cancelled value)
  const handled = useRef(false);

  useEffect(() => {
    if (!editing) {
      setText(format(value));
    }
  }, [value, editing]);

  const commit = (): void => {
    setEditing(false);
    const number = parse(text);

    if (
      !onCommit ||
      !Number.isFinite(number) ||
      format(number) === format(value) ||
      !onCommit(number)
    ) {
      setText(format(value));
    }
  };

  const onBlur = (): void => {
    if (handled.current) {
      handled.current = false;
      return;
    }

    commit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      handled.current = true;
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      // The value typed is dropped at once, whatever happens next
      event.preventDefault();
      setText(format(value));
      setEditing(false);
      handled.current = true;
      event.currentTarget.blur();
    }
  };

  return (
    <label className="flex min-w-0 items-center gap-1" title={title}>
      <span className="w-3 shrink-0 text-center font-medium text-muted-foreground uppercase">
        {axis}
      </span>
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        aria-label={label}
        readOnly={readOnly}
        value={text}
        onFocus={() => {
          handled.current = false;
          setEditing(true);
        }}
        onChange={(event) => setText(event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="h-6 w-full min-w-0 rounded border border-input bg-background px-1.5 text-xs text-foreground tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 read-only:bg-muted read-only:text-muted-foreground"
      />
    </label>
  );
}

interface RowProps {
  title: string;
  unit: string;
  children: ReactNode;
  extra?: ReactNode;
}

function Row({ title, unit, children, extra }: RowProps): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">
          {title} <span className="text-muted-foreground">({unit})</span>
        </span>
        {extra}
      </div>
      <div className="grid grid-cols-3 gap-1.5">{children}</div>
    </div>
  );
}

export default function TransformSection({
  object,
}: {
  object: Object3D;
}): JSX.Element {
  const { t } = useTranslation();
  const mode = useViewportStore((state) => state.transformMode);
  const uniform = useViewportStore((state) => state.keepProportions);
  const setUniform = useViewportStore((state) => state.setKeepProportions);

  const { objectId, transform } = object;
  const size = TransformService.size(object);
  const layout = MODE_LAYOUT[mode];
  const fieldLabel = (row: string, axis: Axis): string =>
    `${row} ${axis.toUpperCase()}`;

  const rows: Record<TransformRow, JSX.Element> = {
    position: (
      <Row title={t("transform.position")} unit={t("unit.mm")}>
        {AXES.map((axis) =>
          axis === "z" ? (
            <NumberField
              key={axis}
              axis={axis}
              value={transform.position.z}
              label={fieldLabel(t("transform.position"), axis)}
              readOnly
              title={t("transform.onPlate")}
            />
          ) : (
            <NumberField
              key={axis}
              axis={axis}
              value={transform.position[axis]}
              label={fieldLabel(t("transform.position"), axis)}
              onCommit={(value) =>
                TransformService.setPosition(objectId, axis, value)
              }
            />
          ),
        )}
      </Row>
    ),

    rotation: (
      <Row title={t("transform.rotation")} unit={t("unit.degree")}>
        {AXES.map((axis) => (
          <NumberField
            key={axis}
            axis={axis}
            value={transform.rotation[axis]}
            label={fieldLabel(t("transform.rotation"), axis)}
            onCommit={(value) =>
              TransformService.setRotation(objectId, axis, value)
            }
          />
        ))}
      </Row>
    ),

    scale: (
      <Row
        title={t("transform.scale")}
        unit={t("unit.percent")}
        extra={
          <button
            type="button"
            aria-pressed={uniform}
            aria-label={t("transform.keepProportions")}
            title={t("transform.keepProportions")}
            onClick={() => setUniform(!uniform)}
            className={`rounded p-0.5 hover:bg-muted ${
              uniform ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {uniform ? (
              <Lock className="size-3.5" aria-hidden="true" />
            ) : (
              <LockOpen className="size-3.5" aria-hidden="true" />
            )}
          </button>
        }
      >
        {AXES.map((axis) => (
          <NumberField
            key={axis}
            axis={axis}
            value={transform.scale[axis] * 100}
            label={fieldLabel(t("transform.scale"), axis)}
            onCommit={(value) =>
              TransformService.setScale(objectId, axis, value / 100, uniform)
            }
          />
        ))}
      </Row>
    ),

    size: (
      <Row title={t("transform.size")} unit={t("unit.mm")}>
        {AXES.map((axis) => (
          <NumberField
            key={axis}
            axis={axis}
            value={size[axis]}
            label={fieldLabel(t("transform.size"), axis)}
            onCommit={(value) =>
              TransformService.setSize(objectId, axis, value, uniform)
            }
          />
        ))}
      </Row>
    ),
  };

  return (
    <div className="space-y-3">
      {layout.rows.map((row) => (
        <Fragment key={row}>{rows[row]}</Fragment>
      ))}

      <div className="grid grid-cols-2 gap-1.5">
        {layout.actions.map((action, index) => (
          <Button
            key={action}
            variant="outline"
            size="xs"
            // An odd last button takes the full width
            className={
              index === layout.actions.length - 1 && index % 2 === 0
                ? "col-span-2"
                : undefined
            }
            onClick={() => ACTIONS[action](objectId)}
          >
            {t(`transform.${action}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
