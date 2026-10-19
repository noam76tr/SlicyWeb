/**
 * SlicyWeb
 * Scene Integration
 *
 * Registers an imported model in the scene (IMPORT_EXPORT_SPEC.md,
 * Scene Integration): create the scene object, generate its
 * transform and bounding box, register it.
 *
 * Placement (ADR-029, ADR-031): the geometry of each object is moved so
 * that its local origin is the center of its bounding box (X, Y and Z):
 * the object turns around its center, and its position is the place of
 * its center (DATA_SCHEMA.md 3.4.0, Transform Rules).
 * - One object (STL): position (0, 0, half the height), the object is
 *   centered on the build plate and placed on it (ADR-028).
 * - Several objects of one file (3MF, ADR-030): the layout of the file is
 *   kept; the group is centered on the origin and its lowest point is at
 *   Z = 0; each object gets the position of its center.
 *
 * The first new object becomes the selected object.
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
  /** Vertex count (Mesh Statistics); default: 3 per triangle (STL) */
  vertexCount?: number;

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
  return registerImportedObjects(fileName, fileType, [mesh])[0];
}

/**
 * Registers the objects of one file, keeping their layout, and returns
 * their objectId.
 */
export function registerImportedObjects(
  fileName: string,
  fileType: string,
  meshes: ImportedMesh[],
): string[] {
  if (meshes.length === 0) {
    return [];
  }

  // Bounding box of the group
  const groupMin = [Infinity, Infinity, Infinity];
  const groupMax = [-Infinity, -Infinity, -Infinity];

  for (const mesh of meshes) {
    for (let axis = 0; axis < 3; axis += 1) {
      groupMin[axis] = Math.min(groupMin[axis], mesh.min[axis]);
      groupMax[axis] = Math.max(groupMax[axis], mesh.max[axis]);
    }
  }

  const groupCenterX = (groupMin[0] + groupMax[0]) / 2;
  const groupCenterY = (groupMin[1] + groupMax[1]) / 2;

  const store = useObjectStore.getState();
  const objectIds: string[] = [];

  for (const mesh of meshes) {
    const [minX, minY, minZ] = mesh.min;
    const [maxX, maxY, maxZ] = mesh.max;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Local origin: center of the bounding box
    const positions = mesh.positions;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] -= centerX;
      positions[i + 1] -= centerY;
      positions[i + 2] -= centerZ;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(mesh.normals, 3));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const object = ObjectFactory.create(crypto.randomUUID(), fileName, fileType);

    // Position of the center in the group (ADR-028 frame): the group stands
    // on the plate
    object.transform.position = {
      x: centerX - groupCenterX,
      y: centerY - groupCenterY,
      z: centerZ - groupMin[2],
    };

    object.geometry = {
      width: maxX - minX,
      depth: maxY - minY,
      height: maxZ - minZ,
      volume: mesh.volume,
      surfaceArea: mesh.surfaceArea,
    };

    object.mesh = {
      // STL data: each triangle has its own 3 vertices
      vertices: mesh.vertexCount ?? mesh.triangleCount * 3,
      triangles: mesh.triangleCount,
    };

    GeometryRegistry.set(object.objectId, geometry);
    store.addObject(object);
    objectIds.push(object.objectId);
  }

  store.selectObject(objectIds[0]);

  return objectIds;
}
