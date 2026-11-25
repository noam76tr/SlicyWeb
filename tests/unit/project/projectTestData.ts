/**
 * SlicyWeb
 * Project Test Data
 *
 * Content of a window for the project tests (lot 111): objects with
 * their triangles (boxes), their analysis and their recommendation made
 * by the real engines, and the printer, material and filament shipped in
 * data/. Test data only.
 *
 * Based on:
 * - TEST_PLAN.md (Project Persistence, lot 111)
 */

import fs from "node:fs";
import path from "node:path";

import { ClassificationEngine } from "../../../src/classification_engine/ClassificationEngine";
import { analyzeModel } from "../../../src/model_analysis/ModelAnalyzer";
import { ObjectFactory } from "../../../src/object_manager/ObjectFactory";
import { PresetLoader } from "../../../src/preset_engine/PresetLoader";
import type { ProjectContent } from "../../../src/project/ProjectManager";
import { RecommendationEngine } from "../../../src/recommendation_engine/RecommendationEngine";
import type { Analysis } from "../../../src/types/Analysis";
import type { Filament } from "../../../src/types/Filament";
import type { Material } from "../../../src/types/Material";
import type { Object3D } from "../../../src/types/Object3D";
import type { Printer } from "../../../src/types/Printer";
import type { Recommendation } from "../../../src/types/Recommendation";

const DATA = path.resolve(__dirname, "../../../data");

export function data<T>(folder: string, id: string): T {
  const file = JSON.parse(
    fs.readFileSync(path.join(DATA, folder, `${id}.json`), "utf8"),
  ) as { data: T };

  return file.data;
}

export const printer = (id = "prusa_mk4s") => data<Printer>("printers", id);
export const material = (id = "pla") => data<Material>("materials", id);
export const filament = (id = "bambu_pla_basic") =>
  data<Filament>("filaments", id);

const loader = new PresetLoader();
loader.loadPresets([
  { folder: path.join(DATA, "presets"), source: "Official" },
]);
const PRESETS = loader.getPresets();

/** Box centered on the origin, 12 triangles (closed) */
export function box(width: number, depth: number, height: number): Float32Array {
  const [x, y, z] = [width / 2, depth / 2, height / 2];
  const v = [
    [-x, -y, -z],
    [x, -y, -z],
    [x, y, -z],
    [-x, y, -z],
    [-x, -y, z],
    [x, -y, z],
    [x, y, z],
    [-x, y, z],
  ];
  const faces = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],
    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],
  ];

  return new Float32Array(faces.flat().flatMap((index) => v[index]));
}

/** An object of the window, with its values set */
export function object(
  objectId: string,
  size: [number, number, number],
  change: Partial<Object3D> = {},
): Object3D {
  const created = ObjectFactory.create(objectId, `${objectId}.stl`, "stl");

  return {
    ...created,
    name: null,
    transform: {
      position: { x: 12.5, y: -7.25, z: size[2] / 2 },
      rotation: { x: 0, y: 0, z: 30 },
      scale: { x: 1, y: 1.5, z: 1 },
    },
    geometry: {
      width: size[0],
      depth: size[1],
      height: size[2],
      volume: size[0] * size[1] * size[2],
      surfaceArea: 2 * (size[0] * size[1] + size[1] * size[2] + size[0] * size[2]),
    },
    mesh: { vertices: 36, triangles: 12 },
    ...change,
  };
}

/** The analysis of an object, computed by the real analysis */
export function analysisOf(objectId: string, positions: Float32Array): Analysis {
  const result = analyzeModel(
    positions,
    { rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    ClassificationEngine.classifyModel,
  );

  return {
    analysisId: `analysis-${objectId}`,
    objectId,
    status: "generated",
    dimensions: result.dimensions,
    geometry: result.geometry,
    mesh: result.mesh,
    stability: result.stability,
    overhangs: result.overhangs,
    bridges: result.bridges,
    thinWalls: result.thinWalls,
    classification: result.classification,
  };
}

export function recommendationOf(
  analysis: Analysis,
  selected: { printer: Printer; material: Material; filament: Filament | null },
): Recommendation {
  return new RecommendationEngine().generateRecommendation({
    analysis,
    meshClosed: true,
    printer: selected.printer,
    printerIsUser: false,
    material: selected.material,
    filament: selected.filament,
    filamentIsUser: false,
    presets: PRESETS,
  });
}

/** Two objects (one renamed, one hidden and locked), analyzed */
export function content(): ProjectContent {
  const selected = {
    printer: printer(),
    material: material(),
    filament: filament(),
  };
  const meshA = box(20, 10, 30);
  const meshB = box(10, 10, 10);
  const analysisA = analysisOf("a", meshA);
  const analysisB = analysisOf("b", meshB);

  return {
    objects: [
      object("a", [20, 10, 30], { name: "Support gauche" }),
      object("b", [10, 10, 10], { visible: false, locked: true }),
    ],
    meshes: { a: meshA, b: meshB },
    analysis: { a: analysisA, b: analysisB },
    recommendations: { a: recommendationOf(analysisA, selected) },
    ...selected,
  };
}
