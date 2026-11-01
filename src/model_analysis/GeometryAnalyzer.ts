/**
 * SlicyWeb
 * Geometry Analyzer
 *
 * Size, volume, area and center of gravity of the object as placed on the
 * build plate (DATA_SCHEMA.md 3.9.0, Analysis Rules; ADR-034 D2):
 * - dimensions: bounding box of the placed object along X, Y, Z, in mm;
 * - geometry: the same size (Known Duplication), volume enclosed by the
 *   mesh (sum of the signed tetrahedra from the center of the object,
 *   absolute value) in mm³, sum of the areas of the triangles in mm²;
 * - centerOfGravity: center of gravity of a full and homogeneous solid,
 *   relative to the center of the object, in mm; when the enclosed volume
 *   is 0 (flat or open mesh), the center of the surface, area weighted.
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules)
 * - DECISIONS.md (ADR-034 D2, D6)
 */

import type { CenterOfGravity, Dimensions, Geometry } from "../types/Analysis";

import { AnalysisError } from "./AnalysisError";

/**
 * Below this share of the cube of the diagonal of the bounding box, the
 * enclosed volume is taken as 0 (rounding of a flat mesh).
 */
const ZERO_VOLUME_SHARE = 1e-9;

export interface GeometryAnalysis {
  dimensions: Dimensions;

  geometry: Geometry;

  centerOfGravity: CenterOfGravity;

  /** Lowest Z of the placed vertices: the level of the build plate */
  lowestZ: number;
}

/**
 * placed: x, y, z of each vertex relative to the center of the object
 * (MeshAnalyzer.placeVertices); corners: vertex of each corner.
 * Throws ANA_001 when the mesh has no area (every triangle flat).
 */
export function analyzeGeometry(
  placed: Float64Array,
  corners: Uint32Array,
): GeometryAnalysis {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < placed.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = placed[i + axis];

      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }

  const width = max[0] - min[0];
  const depth = max[1] - min[1];
  const height = max[2] - min[2];

  let signedVolume = 0;
  let surfaceArea = 0;
  // Sums for the centers of gravity of the solid and of the surface
  let volumeX = 0;
  let volumeY = 0;
  let volumeZ = 0;
  let areaX = 0;
  let areaY = 0;
  let areaZ = 0;

  for (let t = 0; t < corners.length; t += 3) {
    const a = corners[t] * 3;
    const b = corners[t + 1] * 3;
    const c = corners[t + 2] * 3;

    const ax = placed[a];
    const ay = placed[a + 1];
    const az = placed[a + 2];
    const bx = placed[b];
    const by = placed[b + 1];
    const bz = placed[b + 2];
    const cx = placed[c];
    const cy = placed[c + 1];
    const cz = placed[c + 2];

    // Signed volume of the tetrahedron (center, a, b, c): a · (b × c) / 6
    const tetra =
      (ax * (by * cz - bz * cy) +
        ay * (bz * cx - bx * cz) +
        az * (bx * cy - by * cx)) /
      6;

    signedVolume += tetra;
    volumeX += tetra * (ax + bx + cx);
    volumeY += tetra * (ay + by + cy);
    volumeZ += tetra * (az + bz + cz);

    // Area of the triangle: |(b - a) × (c - a)| / 2
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const area = Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;

    surfaceArea += area;
    areaX += area * (ax + bx + cx);
    areaY += area * (ay + by + cy);
    areaZ += area * (az + bz + cz);
  }

  if (!(surfaceArea > 0)) {
    throw new AnalysisError(
      "ANA_001",
      "The mesh has no area: every triangle is flat.",
    );
  }

  const volume = Math.abs(signedVolume);
  const diagonal = Math.sqrt(width * width + depth * depth + height * height);
  const hasVolume = volume > ZERO_VOLUME_SHARE * diagonal ** 3;

  // Solid: sum of tetra × (0 + a + b + c) / 4 divided by the volume.
  // Surface: sum of area × (a + b + c) / 3 divided by the area.
  const centerOfGravity: CenterOfGravity = hasVolume
    ? {
        x: volumeX / (4 * signedVolume),
        y: volumeY / (4 * signedVolume),
        z: volumeZ / (4 * signedVolume),
      }
    : {
        x: areaX / (3 * surfaceArea),
        y: areaY / (3 * surfaceArea),
        z: areaZ / (3 * surfaceArea),
      };

  return {
    dimensions: { width, depth, height },
    geometry: {
      width,
      depth,
      height,
      volume: hasVolume ? volume : 0,
      surfaceArea,
    },
    centerOfGravity,
    lowestZ: min[2],
  };
}
