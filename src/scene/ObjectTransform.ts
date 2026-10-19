/**
 * SlicyWeb
 * Object Transform
 *
 * Meaning of the transform of an object (DATA_SCHEMA.md, Transform
 * Schema, Transform Rules; DECISIONS.md, ADR-031):
 * - the geometry is stored relative to the local origin of the object:
 *   center of its bounding box at import (X, Y and Z); it is the pivot
 *   of rotation and scale (DATA_SCHEMA.md 3.4.0);
 * - scale: factors along the axes of the object, applied first;
 * - rotation: degrees, right-hand rule, around the axes of the build
 *   plate, first X, then Y, then Z: R = Rz · Ry · Rx (Euler order "ZYX"
 *   of Three.js);
 * - position: place of the local origin (center of the object) on the
 *   build plate (ADR-028);
 * - point of the plate = position + R · (S · point of the object);
 * - after each change of rotation or scale, the object is placed back on
 *   the plate: its lowest point at Z = 0 (placeOnPlate).
 *
 * Export to 3MF (build item transform, row vectors): toThreeMfTransform.
 *
 * Pure functions, no state. Used by the viewport (ObjectRenderer) and by
 * the transform tools of Phase 6.
 *
 * Domain: Scene.
 *
 * Based on:
 * - DATA_SCHEMA.md (Transform Schema, Transform Rules)
 * - DECISIONS.md (ADR-028, ADR-031)
 * - 3MF Core Specification (transform of a build item)
 */

import * as THREE from "three";

import type { Transform } from "../types/Object3D";

/** Euler order of Three.js for rotations around the plate axes X, then Y, then Z */
export const ROTATION_ORDER = "ZYX";

const DEG_TO_RAD = Math.PI / 180;

/** 3D vector of millimeters */
export interface Vector3Mm {
  x: number;
  y: number;
  z: number;
}

/**
 * Rotation of the transform (degrees) as a Three.js Euler (radians).
 */
export function rotationEuler(transform: Transform): THREE.Euler {
  const { rotation } = transform;

  return new THREE.Euler(
    rotation.x * DEG_TO_RAD,
    rotation.y * DEG_TO_RAD,
    rotation.z * DEG_TO_RAD,
    ROTATION_ORDER,
  );
}

/**
 * Matrix of the object: point of the plate = matrix · point of the object
 * (translation · rotation · scale).
 */
export function objectMatrix(transform: Transform): THREE.Matrix4 {
  const { position, scale } = transform;

  return new THREE.Matrix4().compose(
    new THREE.Vector3(position.x, position.y, position.z),
    new THREE.Quaternion().setFromEuler(rotationEuler(transform)),
    new THREE.Vector3(scale.x, scale.y, scale.z),
  );
}

/**
 * Lowest Z, on the plate, of the vertices of the object.
 * positions: x, y, z of each vertex, in the coordinate system of the object.
 */
export function lowestPoint(
  transform: Transform,
  positions: ArrayLike<number>,
): number {
  const m = objectMatrix(transform).elements;
  let lowest = Infinity;

  // Row Z of the column-major matrix: elements 2, 6, 10, 14
  for (let i = 0; i + 2 < positions.length; i += 3) {
    const z =
      m[2] * positions[i] +
      m[6] * positions[i + 1] +
      m[10] * positions[i + 2] +
      m[14];

    if (z < lowest) {
      lowest = z;
    }
  }

  return lowest;
}

/** Bounding box of the object on the plate */
export interface Bounds {
  min: Vector3Mm;
  max: Vector3Mm;
}

/**
 * Bounding box, on the plate, of the vertices of the object.
 * positions: x, y, z of each vertex, in the coordinate system of the object.
 */
export function worldBounds(
  transform: Transform,
  positions: ArrayLike<number>,
): Bounds {
  const m = objectMatrix(transform).elements;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i + 2 < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    for (let axis = 0; axis < 3; axis += 1) {
      const value =
        m[axis] * x + m[4 + axis] * y + m[8 + axis] * z + m[12 + axis];

      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }

  return {
    min: { x: min[0], y: min[1], z: min[2] },
    max: { x: max[0], y: max[1], z: max[2] },
  };
}

/**
 * Transform with the object placed back on the plate: position.z changed so
 * that the lowest point is at Z = 0 (after a change of rotation or scale).
 */
export function placeOnPlate(
  transform: Transform,
  positions: ArrayLike<number>,
): Transform {
  const lowest = lowestPoint(transform, positions);

  if (!Number.isFinite(lowest)) {
    return transform;
  }

  return {
    ...transform,
    position: {
      ...transform.position,
      z: transform.position.z - lowest,
    },
  };
}

/**
 * Transform of a 3MF build item (12 numbers, row vectors:
 * m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32). The 3 x 3 part is
 * (R · S) transposed; the translation is position plus the offset of the
 * printer origin (PRINTER_PROFILE_SPEC.md, Build Plate Origin), applied
 * only at export. The mesh is exported in the coordinate system of the
 * object (millimeters).
 */
export function toThreeMfTransform(
  transform: Transform,
  originOffset: Vector3Mm = { x: 0, y: 0, z: 0 },
): number[] {
  // Column-major: elements[column * 4 + row]; row r of the 3MF matrix is
  // column r of (R · S)
  const e = objectMatrix(transform).elements;
  const linear = [0, 1, 2, 4, 5, 6, 8, 9, 10].map((index) => e[index]);

  return [
    ...linear,
    e[12] + originOffset.x,
    e[13] + originOffset.y,
    e[14] + originOffset.z,
  ];
}
