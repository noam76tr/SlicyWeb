/**
 * SlicyWeb
 * Scene Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 * - ARCHITECTURE.md
 */

import type { Object3D } from "./Object3D";

/**
 * Scene of a project (DATA_SCHEMA.md 3.16.0, Scene Schema): the objects
 * only. The printer, the material and the filament are those of the
 * project (lot 111, decision 119 of Noam, Q4 A: end of the Known
 * Duplication).
 */
export interface Scene {
  objects: Object3D[];
}
