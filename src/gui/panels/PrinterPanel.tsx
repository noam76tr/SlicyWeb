/**
 * Wichy
 * Printer Panel
 *
 * Responsible for:
 * - Printer selection
 * - Printer display
 * - Active printer information
 *
 * No business logic.
 * No AI logic.
 * No repository logic.
 *
 * Based on:
 * - ARCHITECTURE.md
 * - GUI_SPEC.md
 * - Printer.ts
 */

import type { Printer } from "../../types/Printer";

interface PrinterPanelProps {
  printers: Printer[];

  selectedPrinter: Printer | null;

  onPrinterSelected: (
    printerId: string,
  ) => void;
}

export default function PrinterPanel({
  printers,
  selectedPrinter,
  onPrinterSelected,
}: PrinterPanelProps): JSX.Element {
  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-lg font-semibold">
        Printers
      </h2>

      <select
        className="
          w-full
          rounded
          border
          border-neutral-700
          bg-neutral-800
          p-2
          text-white
        "
        value={
          selectedPrinter?.id ?? ""
        }
        onChange={(event) =>
          onPrinterSelected(
            event.target.value,
          )
        }
      >
        <option value="">
          Select Printer
        </option>

        {printers.map(
          (printer) => (
            <option
              key={printer.id}
              value={printer.id}
            >
              {printer.brand}{" "}
              {printer.model}
            </option>
          ),
        )}
      </select>

      {selectedPrinter && (
        <div className="mt-4 rounded border border-neutral-800 p-3">
          <div>
            <strong>Brand:</strong>{" "}
            {selectedPrinter.brand}
          </div>

          <div>
            <strong>Model:</strong>{" "}
            {selectedPrinter.model}
          </div>

          <div>
            <strong>Nozzle:</strong>{" "}
            {selectedPrinter.defaultNozzle}
            mm
          </div>

          <div>
            <strong>Build Volume:</strong>{" "}
            {
              selectedPrinter
                .buildVolume.x
            }
            ×
            {
              selectedPrinter
                .buildVolume.y
            }
            ×
            {
              selectedPrinter
                .buildVolume.z
            }
            mm
          </div>
        </div>
      )}
    </div>
  );
}
