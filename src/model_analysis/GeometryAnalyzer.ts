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
 * - face areas (Phase 12, ADR-037): areas of the faces turned up, turned
 *   down and of the side, for the estimation; not part of the analysis.
 *
 * Pure functions, no state. Used in the Web Worker of the analysis.
 *
 * Domain: Analysis.
 *
 * Based on:
 * - DATA_SCHEMA.md (3.9.0: Complete Analysis Schema, Analysis Rules)
 * - DECISIONS.md (ADR-034 D2, D6; ADR-037)
 * - DATA_SCHEMA.md (3.15.0: Cost Estimation Rules)
 */

import type { CenterOfGravity, Dimensions, Geometry } from "../types/Analysis";
import type { FaceAreas } from "../types/CostEstimation";

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

/** cos 45°: a face is turned up or down when |nz| ≥ this share */
const FLAT_FACE_COS = Math.cos((45 * Math.PI) / 180);

/**
 * Areas of the faces of the placed object for the estimation of Phase 12
 * (ADR-037, Q2 A; DATA_SCHEMA.md 3.15.0, Cost Estimation Rules), in mm²:
 * - up: faces whose normal is at most 45 degrees from +Z (less than 45
 *   degrees from the horizontal, turned up);
 * - down: the same turned down (normal at most 45 degrees from −Z);
 * - side: the other faces.
 * The normal follows the order of the corners; when the signed volume is
 * below 0 (corners in the other order, normals inward), up and down are
 * exchanged. The angle of 45 degrees is the one of DATA_SCHEMA.md 3.15.0
 * (Cost Estimation Rules). Not part of the analysis (DATA_SCHEMA.md):
 * kept in memory only.
 */
export function analyzeFaceAreas(
  placed: Float64Array,
  corners: Uint32Array,
): FaceAreas {
  let up = 0;
  let down = 0;
  let side = 0;
  let signedVolume = 0;

  for (let t = 0; t < corners.length; t += 3) {
    const a = corners[t] * 3;
    const b = corners[t + 1] * 3;
    const c = corners[t + 2] * 3;

    signedVolume +=
      placed[a] *
        (placed[b + 1] * placed[c + 2] - placed[b + 2] * placed[c + 1]) +
      placed[a + 1] * (placed[b + 2] * placed[c] - placed[b] * placed[c + 2]) +
      placed[a + 2] * (placed[b] * placed[c + 1] - placed[b + 1] * placed[c]);

    const ux = placed[b] - placed[a];
    const uy = placed[b + 1] - placed[a + 1];
    const uz = placed[b + 2] - placed[a + 2];
    const vx = placed[c] - placed[a];
    const vy = placed[c + 1] - placed[a + 1];
    const vz = placed[c + 2] - placed[a + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

    if (!(length > 0)) {
      continue;
    }

    const area = length / 2;
    const cos = nz / length;

    if (cos >= FLAT_FACE_COS) {
      up += area;
    } else if (cos <= -FLAT_FACE_COS) {
      down += area;
    } else {
      side += area;
    }
  }

  return signedVolume < 0 ? { up: down, down: up, side } : { up, down, side };
}
