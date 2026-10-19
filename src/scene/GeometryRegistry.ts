/**
 * SlicyWeb
 * Geometry Registry
 *
 * Triangle geometry of the objects of the scene, indexed by objectId.
 * The project data (Object3D, DATA_SCHEMA.md) holds only the object
 * description; the geometry itself, too large for the state stores,
 * is kept here. The viewport reads it to display the objects.
 *
 * Geometry coordinates are local to the object: millimeters, origin
 * at the center of the bounding box of the object at import (ADR-031,
 * DATA_SCHEMA.md 3.4.0).
 *
 * No business logic.
 *
 * Based on:
 * - DECISIONS.md (ADR-028, ADR-029)
 * - IMPORT_EXPORT_SPEC.md (Scene Integration)
 */

import type * as THREE from "three";

const geometries = new Map<string, THREE.BufferGeometry>();

export const GeometryRegistry = {
  set(objectId: string, geometry: THREE.BufferGeometry): void {
    geometries.get(objectId)?.dispose();
    geometries.set(objectId, geometry);
  },

  get(objectId: string): THREE.BufferGeometry | undefined {
    return geometries.get(objectId);
  },

  has(objectId: string): boolean {
    return geometries.has(objectId);
  },

  remove(objectId: string): void {
    geometries.get(objectId)?.dispose();
    geometries.delete(objectId);
  },

  clear(): void {
    for (const geometry of geometries.values()) {
      geometry.dispose();
    }

    geometries.clear();
  },
};

export default GeometryRegistry;
