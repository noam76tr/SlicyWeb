/**
 * Wichy
 * Object3D Type Definition
 *
 * Based on:
 * - DATA_SCHEMA.md
 */

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Position;

  rotation: Rotation;

  scale: Scale;
}

export interface Geometry {
  width: number;
  depth: number;
  height: number;
  volume: number;
  surfaceArea: number;
}

export interface Mesh {
  vertices: number;
  triangles: number;
}

export interface Object3D {
  objectId: string;

  fileName: string;

  fileType: string;

  visible: boolean;

  locked: boolean;

  transform: Transform;

  geometry: Geometry;

  mesh: Mesh;
}
