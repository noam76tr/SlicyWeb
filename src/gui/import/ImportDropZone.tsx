/**
 * SlicyWeb
 * Import Drop Zone
 *
 * Files can be dropped directly inside the viewport (GUI_SPEC.md,
 * Drag And Drop). The dropped files are sent to the import
 * (ImportService); a file of another format is refused by the import
 * with a message.
 *
 * Messages over the viewport, top end: the imports (ImportStatus), then
 * the warning of the objects out of the build volume (PlateMessage, lot
 * 101), then the messages of the analysis (AnalysisMessages, Phase 9 lot
 * 80), then the messages of the optimization (OptimizationMessages, Phase
 * 11 lot 98).
 *
 * Top row (lot 104, decision of Noam, Q1 A): the buttons over the viewport
 * (Move, Rotate, Scale, Overhangs; given by the GUI) on the start side, the
 * messages on the end side. When the viewport is too narrow for both, the
 * messages go just under the buttons (the row wraps): they never pass under
 * a button, at any size of the window or of the side panels.
 *
 * Wraps the viewport in the GUI, so that the Viewport Domain does not
 * depend on the import (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - GUI_SPEC.md (Drag And Drop, Messages Over The Viewport)
 * - DECISIONS.md (ADR-029)
 */

import { useState, type DragEvent, type ReactNode } from "react";

import { ImportService } from "../../services/ImportService";
import { useTranslation } from "../hooks/useTranslation";

import AnalysisMessages from "../analysis/AnalysisMessages";
import OptimizationMessages from "../optimization/OptimizationMessages";
import PlateMessage from "../plate/PlateMessage";

import ImportStatus from "./ImportStatus";

interface ImportDropZoneProps {
  children: ReactNode;

  /** Buttons over the viewport, top row, start side (TransformModeBar) */
  toolbar: ReactNode;
}

function hasFiles(event: DragEvent<HTMLDivElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export default function ImportDropZone({
  children,
  toolbar,
}: ImportDropZoneProps): JSX.Element {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className="relative h-full w-full"
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (!hasFiles(event)) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setDragging(true);
      }}
      onDragLeave={(event: DragEvent<HTMLDivElement>) => {
        // Leaving the zone, not moving over one of its children
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        if (!hasFiles(event)) {
          return;
        }

        event.preventDefault();
        setDragging(false);
        ImportService.importFiles(Array.from(event.dataTransfer.files));
      }}
    >
      {children}

      {dragging && (
        <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
          <p className="rounded-md bg-card px-4 py-2 text-sm">
            {t("import.dropHint")}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap items-start gap-2">
        {toolbar}

        <div
          data-viewport-messages
          className="ms-auto me-1 mt-1 flex w-80 max-w-[calc(100%-0.25rem)] flex-col gap-2"
        >
          <ImportStatus />
          <PlateMessage />
          <AnalysisMessages />
          <OptimizationMessages />
        </div>
      </div>
    </div>
  );
}
