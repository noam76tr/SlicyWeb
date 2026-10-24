/**
 * SlicyWeb
 * Import End-To-End Tests
 *
 * Import of models in the built application (IMPORT_EXPORT_SPEC.md;
 * ADR-029, ADR-030): files chosen in the file dialog of the Import
 * button, STL and 3MF, shown in the Object Panel and the status bar,
 * centered and standing on the plate; refused files give their
 * translated message (ERROR_CODES_SPEC.md), closed with their Close
 * button.
 *
 * Based on:
 * - TEST_PLAN.md (End-To-End Testing, Import Module)
 * - IMPORT_EXPORT_SPEC.md
 */

import { strToU8, zipSync } from "fflate";

import en from "../../public/locales/en.json";

import {
  cubeStl,
  expect,
  expectObjectCount,
  importFiles,
  objectRows,
  test,
  transformField,
} from "./fixtures";

/** 3MF with one cube of 10 mm (units: mm), corner at the origin */
function cube3mf(): Uint8Array {
  const vertices: string[] = [];
  for (const z of [0, 10]) {
    for (const [x, y] of [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]) {
      vertices.push(`<vertex x="${x}" y="${y}" z="${z}"/>`);
    }
  }
  const triangles = [
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
  ].map(([v1, v2, v3]) => `<triangle v1="${v1}" v2="${v2}" v3="${v3}"/>`);

  return zipSync({
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>',
    ),
    "3D/3dmodel.model": strToU8(
      `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices>${vertices.join("")}</vertices><triangles>${triangles.join("")}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`,
    ),
  });
}

test("imports an STL file, centered and standing on the plate", async ({
  window,
  files,
  started,
}) => {
  await importFiles(window, [files("cube.stl", cubeStl("cube", 20))]);

  await expect(objectRows(window)).toHaveText(["cube.stl"]);
  await expectObjectCount(window, 1);

  // Position = center of the object: X = Y = 0, Z = half of 20 mm
  await expect(transformField(window, "position", "x")).toHaveValue("0");
  await expect(transformField(window, "position", "y")).toHaveValue("0");
  await expect(transformField(window, "position", "z")).toHaveValue("10");
  expect(started.errors).toEqual([]);
});

test("imports several files and numbers the same names", async ({
  window,
  files,
}) => {
  const first = files("a/cube.stl", cubeStl("cube", 20));
  const second = files("b/cube.stl", cubeStl("cube", 10));
  await importFiles(window, [first, second]);

  await expectObjectCount(window, 2);
  await expect(objectRows(window)).toHaveText(["cube (1)", "cube (2)"]);
});

test("imports a 3MF file", async ({ window, files }) => {
  await importFiles(window, [files("box.3mf", cube3mf())]);

  await expectObjectCount(window, 1);
  await expect(transformField(window, "position", "z")).toHaveValue("5");
});

test("refuses an unsupported file with its message", async ({
  window,
  files,
}) => {
  await importFiles(window, [files("notes.txt", "not a model")]);

  const message = window.getByRole("alert").filter({
    hasText: en["import.error.IMP_001"].replace("{name}", "notes.txt"),
  });
  await expect(message).toBeVisible();
  await expectObjectCount(window, 0);

  // The error stays until closed; its Close button still receives the
  // click (the messages let the other clicks through, lot 55)
  await message.getByRole("button", { name: en["import.dismiss"] }).click();
  await expect(message).toHaveCount(0);
});

test("refuses a corrupted STL file", async ({ window, files }) => {
  await importFiles(window, [
    files("broken.stl", "solid broken\nfacet normal 0 0 1\n"),
  ]);

  await expect(window.getByText(/^broken\.stl: /)).toBeVisible();
  await expectObjectCount(window, 0);
});
