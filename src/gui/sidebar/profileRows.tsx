/**
 * SlicyWeb
 * Profile Rows
 *
 * Rows of values of the Material and Filament sections (Phase 8 lot 70):
 * a label and its value; a value not published (null) is shown as "Not
 * published", never as 0 (DATA_SCHEMA.md 3.7.0). A range shows its two
 * values ("190 – 230 °C").
 *
 * No business logic.
 *
 * Based on:
 * - GUI_SPEC.md (Material Section, Filament Section)
 */

import { useTranslation } from "../hooks/useTranslation";

/** Class of the selectors of the Properties Panel */
export const SELECT_CLASS =
  "h-7 w-full rounded border border-input bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

/** Value shown: 2 decimals at most */
function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

interface ProfileRowProps {
  label: string;
  value: string;
}

export function ProfileRow({ label, value }: ProfileRowProps): JSX.Element {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="text-end text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

/** A single value with its unit, or "Not published" */
export function useValue(): (value: number | null, unit: string) => string {
  const { t } = useTranslation();

  return (value, unit) =>
    value === null ? t("printer.notPublished") : `${format(value)} ${unit}`;
}

/** A range "min – max unit"; a bound not published is named as such */
export function useRange(): (
  min: number | null,
  max: number | null,
  unit: string,
) => string {
  const { t } = useTranslation();
  const notPublished = t("printer.notPublished");

  return (min, max, unit) =>
    min === null && max === null
      ? notPublished
      : `${min === null ? notPublished : format(min)} – ${
          max === null ? notPublished : format(max)
        } ${unit}`;
}
