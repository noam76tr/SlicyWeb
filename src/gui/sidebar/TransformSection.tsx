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
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { TransformService, type Axis } from "../../services/TransformService";
import { Button } from "../components/ui/button";
import { useTranslation } from "../hooks/useTranslation";

import type { Object3D } from "../../types/Object3D";

const AXES: Axis[] = ["x", "y", "z"];

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
  const cancelled = useRef(false);

  useEffect(() => {
    if (!editing) {
      setText(format(value));
    }
  }, [value, editing]);

  const commit = (): void => {
    setEditing(false);

    // Escape: the field loses the focus without applying the value
    if (cancelled.current) {
      cancelled.current = false;
      setText(format(value));
      return;
    }

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

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      cancelled.current = true;
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
        onFocus={() => setEditing(true)}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
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
  const [uniform, setUniform] = useState(true);

  const { objectId, transform } = object;
  const size = TransformService.size(object);
  const fieldLabel = (row: string, axis: Axis): string =>
    `${row} ${axis.toUpperCase()}`;

  return (
    <div className="space-y-3">
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

      <div className="grid grid-cols-2 gap-1.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => TransformService.resetPosition(objectId)}
        >
          {t("transform.resetPosition")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => TransformService.resetRotation(objectId)}
        >
          {t("transform.resetRotation")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => TransformService.resetScale(objectId)}
        >
          {t("transform.resetScale")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => TransformService.centerOnBed(objectId)}
        >
          {t("transform.centerOnBed")}
        </Button>
      </div>
    </div>
  );
}
