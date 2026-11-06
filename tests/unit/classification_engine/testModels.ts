/**
 * SlicyWeb
 * Models built for the classification tests (Phase 10 lot 85)
 *
 * Closed meshes, triangles facing outwards (counterclockwise seen from
 * outside), coordinates relative to the center of the bounding box (as
 * stored by the import). box, centered, sphere, blocks and inverted are
 * the builders of tests/unit/model_analysis/ModelAnalyzer.test.ts; cup is
 * new (open vase and open box).
 *
 * Based on:
 * - TEST_PLAN.md (Classification and Recommendation Engine Unit Tests,
 *   Classification lot 85)
 */

export type Vec = [number, number, number];

/** 12 triangles of a box, facing outwards */
export function box(min: Vec, max: Vec): number[] {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const quads: Vec[][] = [
    [
      [x0, y0, z0],
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y0, z0],
    ], // bottom (-Z)
    [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ], // top (+Z)
    [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
    ], // front (-Y)
    [
      [x0, y1, z0],
      [x0, y1, z1],
      [x1, y1, z1],
      [x1, y1, z0],
    ], // back (+Y)
    [
      [x0, y0, z0],
      [x0, y0, z1],
      [x0, y1, z1],
      [x0, y1, z0],
    ], // left (-X)
    [
      [x1, y0, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x1, y0, z1],
    ], // right (+X)
  ];
  const triangles: number[] = [];

  for (const [a, b, c, d] of quads) {
    triangles.push(...a, ...b, ...c, ...a, ...c, ...d);
  }

  return triangles;
}

/** Coordinates relative to the center of the bounding box */
export function centered(triangles: number[]): Float32Array {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < triangles.length; i += 1) {
    min[i % 3] = Math.min(min[i % 3], triangles[i]);
    max[i % 3] = Math.max(max[i % 3], triangles[i]);
  }

  return Float32Array.from(
    triangles,
    (value, i) => value - (min[i % 3] + max[i % 3]) / 2,
  );
}

/** Each triangle turned the other way (faces towards the inside) */
export function inverted(triangles: number[]): number[] {
  const result = triangles.slice();

  for (let i = 0; i < result.length; i += 9) {
    for (let k = 0; k < 3; k += 1) {
      result[i + 3 + k] = triangles[i + 6 + k];
      result[i + 6 + k] = triangles[i + 3 + k];
    }
  }

  return result;
}

/** Sphere of radius r, poles on Z (closed, a single vertex at each pole) */
export function sphere(r: number, segments: number, rings: number): number[] {
  const point = (ring: number, segment: number): Vec => {
    if (ring === 0) return [0, 0, -r];
    if (ring === rings) return [0, 0, r];

    const theta = (Math.PI * ring) / rings;
    const phi = (2 * Math.PI * (segment % segments)) / segments;

    return [
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      -r * Math.cos(theta),
    ];
  };
  const triangles: number[] = [];

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = point(ring, segment);
      const b = point(ring, segment + 1);
      const c = point(ring + 1, segment + 1);
      const d = point(ring + 1, segment);

      if (ring > 0) triangles.push(...a, ...b, ...d);
      if (ring < rings - 1) triangles.push(...b, ...c, ...d);
    }
  }

  return triangles;
}

/**
 * Closed solid made of cubes of `size` mm. Each layer is a slice along Y
 * (front first), drawn as seen from the front, top row first ("#" =
 * full). Only the faces between a full and an empty cube are kept (one
 * closed mesh).
 */
export function blocks(layers: string[][], size = 10): number[] {
  const height = layers[0].length;
  const full = (i: number, j: number, k: number): boolean =>
    j >= 0 &&
    j < layers.length &&
    k >= 0 &&
    k < height &&
    layers[j][height - 1 - k][i] === "#";
  // Faces of box(): bottom, top, front, back, left, right
  const neighbours: Vec[] = [
    [0, 0, -1],
    [0, 0, 1],
    [0, -1, 0],
    [0, 1, 0],
    [-1, 0, 0],
    [1, 0, 0],
  ];
  const triangles: number[] = [];

  for (let k = 0; k < height; k += 1) {
    for (let j = 0; j < layers.length; j += 1) {
      for (let i = 0; i < layers[0][0].length; i += 1) {
        if (!full(i, j, k)) continue;

        const cell = box(
          [i * size, j * size, k * size],
          [(i + 1) * size, (j + 1) * size, (k + 1) * size],
        );

        neighbours.forEach(([di, dj, dk], face) => {
          if (!full(i + di, j + dj, k + dk)) {
            triangles.push(...cell.slice(face * 18, face * 18 + 18));
          }
        });
      }
    }
  }

  return triangles;
}

/** The same drawing over `depth` cubes along Y */
export function extruded(rows: string[], depth: number, size = 10): number[] {
  return blocks(
    Array.from({ length: depth }, () => rows),
    size,
  );
}

/** Regular polygon, counterclockwise seen from above, first corner on +X */
export function polygon(radius: number, sides: number): [number, number][] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides;

    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

/** Square of side `side`, counterclockwise seen from above */
export function square(side: number): [number, number][] {
  const h = side / 2;

  return [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ];
}

/**
 * Closed cup open towards the top: outer wall from 0 to `height`, inner
 * wall and inner bottom from `bottom` to `height`, rim at the top. outer
 * and inner: the same number of corners, counterclockwise seen from
 * above, inner inside outer. Bottoms made as fans from the first corner.
 */
export function cup(
  outer: [number, number][],
  inner: [number, number][],
  bottom: number,
  height: number,
): number[] {
  const n = outer.length;
  const P = (i: number, z: number): Vec => [
    outer[i % n][0],
    outer[i % n][1],
    z,
  ];
  const Q = (i: number, z: number): Vec => [
    inner[i % n][0],
    inner[i % n][1],
    z,
  ];
  const triangles: number[] = [];
  const quad = (a: Vec, b: Vec, c: Vec, d: Vec): void => {
    triangles.push(...a, ...b, ...c, ...a, ...c, ...d);
  };

  for (let i = 0; i < n; i += 1) {
    // Outer wall, facing outwards
    quad(P(i, 0), P(i + 1, 0), P(i + 1, height), P(i, height));
    // Inner wall, facing the hollow
    quad(Q(i + 1, bottom), Q(i, bottom), Q(i, height), Q(i + 1, height));
    // Rim, facing up
    quad(P(i, height), P(i + 1, height), Q(i + 1, height), Q(i, height));
  }

  for (let i = 1; i < n - 1; i += 1) {
    // Outer bottom, facing down
    triangles.push(...P(0, 0), ...P(i + 1, 0), ...P(i, 0));
    // Inner bottom, facing up
    triangles.push(...Q(0, bottom), ...Q(i, bottom), ...Q(i + 1, bottom));
  }

  return triangles;
}
