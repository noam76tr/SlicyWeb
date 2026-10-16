/**
 * SlicyWeb
 * Scene Integration
 *
 * Registers an imported model in the scene (IMPORT_EXPORT_SPEC.md,
 * Scene Integration): create the scene object, generate its
 * transform and bounding box, register it.
 *
 * Placement (ADR-029): the geometry is moved so that the center of its
 * bounding box is on the Z axis and its lowest point at Z = 0; with a
 * position (0, 0, 0), the object is centered on the build plate and
 * placed on it (ADR-028).
 *
 * The new object becomes the selected object.
 *
 * Domain: Scene. Called by the Import Domain (Import -> Scene,
 * DOMAINS_DEPENDENCY_MATRIX.md); depends on State Management.
 *
 * Based on:
 * - IMPORT_EXPORT_SPEC.md (Scene Integration, Object Naming)
 * - DATA_SCHEMA.md (Object Schema, Model Geometry Schema, Mesh Statistics Schema)
 * - DECISIONS.md (ADR-028, ADR-029)
 */

import * as THREE from "three";

import { ObjectFactory } from "../object_manager/ObjectFactory";
import { useObjectStore } from "../state/objectStore";

import { GeometryRegistry } from "./GeometryRegistry";

/** Triangle data of an imported model (millimeters) */
export interface ImportedMesh {
  /** 9 values per triangle */
  positions: Float32Array;

  /** Normal of each vertex */
  normals: Float32Array;

  triangleCount: number;

  min: [number, number, number];
  max: [number, number, number];

  /** mm³ */
  volume: number;

  /** mm² */
  surfaceArea: number;
}

/**
 * Registers an imported model and returns its objectId.
 */
export function registerImportedObject(
  fileName: string,
  fileType: string,
  mesh: ImportedMesh,
): string {
  const [minX, minY, minZ] = mesh.min;
  const [maxX, maxY, maxZ] = mesh.max;

  // Center on X and Y, lowest point at Z = 0 (local origin)
  const offsetX = -(minX + maxX) / 2;
  const offsetY = -(minY + maxY) / 2;
  const offsetZ = -minZ;
  const positions = mesh.positions;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += offsetX;
    positions[i + 1] += offsetY;
    positions[i + 2] += offsetZ;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(mesh.normals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const object = ObjectFactory.create(crypto.randomUUID(), fileName, fileType);

  object.geometry = {
    width: maxX - minX,
    depth: maxY - minY,
    height: maxZ - minZ,
    volume: mesh.volume,
    surfaceArea: mesh.surfaceArea,
  };

  // Each triangle has its own 3 vertices in STL data
  object.mesh = {
    vertices: mesh.triangleCount * 3,
    triangles: mesh.triangleCount,
  };

  GeometryRegistry.set(object.objectId, geometry);

  const store = useObjectStore.getState();
  store.addObject(object);
  store.selectObject(object.objectId);

  return object.objectId;
}
