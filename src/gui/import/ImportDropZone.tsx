/**
 * SlicyWeb
 * Import Drop Zone
 *
 * Files can be dropped directly inside the viewport (GUI_SPEC.md,
 * Drag And Drop). The dropped files are sent to the import
 * (ImportService); a file of another format is refused by the import
 * with a message.
 *
 * Wraps the viewport in the GUI, so that the Viewport Domain does not
 * depend on the import (DOMAINS_DEPENDENCY_MATRIX.md).
 *
 * Based on:
 * - GUI_SPEC.md (Drag And Drop)
 * - DECISIONS.md (ADR-029)
 */

import { useState, type DragEvent, type ReactNode } from "react";

import { ImportService } from "../../services/ImportService";
import { useTranslation } from "../hooks/useTranslation";

import ImportStatus from "./ImportStatus";

interface ImportDropZoneProps {
  children: ReactNode;
}

function hasFiles(event: DragEvent<HTMLDivElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export default function ImportDropZone({
  children,
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

      <ImportStatus />
    </div>
  );
}
