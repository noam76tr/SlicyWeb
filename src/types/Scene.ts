/**
 * Wichy
 * Scene Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - ARCHITECTURE.md
 */

import type { Printer } from "./Printer";
import type { Material } from "./Material";
import type { Filament } from "./Filament";
import type { PrintPreset } from "./PrintPreset";
import type { Object3D } from "./Object3D";

export interface Scene {
  objects: Object3D[];

  printer: Printer | null;

  material: Material | null;

  filament: Filament | null;

  preset: PrintPreset | null;
}
