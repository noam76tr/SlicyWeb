# SlicyWeb SMART SLICER
# IMPORT EXPORT SPECIFICATION

Version: 3.2.0

Status: Approved

Priority: Medium

---

# Purpose

This document defines the import and export system used by SlicyWeb.

The objective is to standardize:

- Supported file formats
- Import workflows
- Export workflows
- Validation rules
- File integrity checks
- Future format extensions

This document serves as the source of truth for all file exchange operations.

---

# Objectives

The Import Export system must:

- Support industry-standard formats
- Validate imported files
- Prevent invalid data
- Preserve geometry integrity
- Remain extensible
- Support future formats

---

# Import Workflow

```text
User Selects File

↓

File Validation

↓

Format Detection

↓

Parser Selection

↓

Geometry Extraction

↓

Mesh Validation

↓

Scene Integration

↓

Analysis Pipeline
```

---

# Export Workflow

```text
Scene

↓

Validation

↓

Format Serializer

↓

File Generation

↓

Export
```

---

# Supported Import Formats

Version 1:

```text
STL

3MF
```

---

# Planned Future Formats

```text
OBJ

STEP

AMF

PLY

GLTF

GLB
```

---

# STL Import

Purpose:

```text
Industry Standard Mesh Format
```

---

# Supported Types

```text
ASCII STL

Binary STL
```

---

# Extracted Data

```text
Vertices

Triangles

Bounding Box

Mesh Statistics
```

---

# Unsupported STL Data

```text
Materials

Colors

Textures

Metadata
```

---

# Validation Rules

Required:

```text
Valid Header

Valid Triangle Count

Finite Coordinates
```

---

# 3MF Import

Purpose:

```text
Modern Additive Manufacturing Format
```

---

# Extracted Data

```text
Geometry

Units

Object Names
```

3.2.0 (lot 111, PASSATION.md decision 119 of Noam, Q21 A: KI-020 closed): the name of the object of each build item (attribute name, when it is given) becomes the name of the object (DATA_SCHEMA.md, Object Schema: name), as a name given by the user: spaces at the start and the end taken off, 100 characters at most, null when empty or equal to the file name. The other metadata of the 3MF file (author, date, application) are not kept.

---

# Future Support

```text
Materials

Colors

Build Information
```

---

# Validation Rules

Required:

```text
Valid Package Structure

Valid XML

Valid Geometry
```

---

# Format Detection

Detection Order:

```text
File Extension

↓

File Signature

↓

Content Validation
```

---

# File Validation

Before import:

Verify:

```text
File Exists

File Accessible

Non Empty File

Supported Format
```

---

# Geometry Validation

Before loading:

Verify:

```text
Valid Vertices

Valid Triangles

Non Corrupted Mesh

Finite Coordinates
```

---

# Mesh Statistics

Generated During Import

```json
{
  "vertices": 0,
  "triangles": 0,
  "size": 0
}
```

---

# Import Result

```json
{
  "success": true,
  "fileType": "",
  "objectsImported": 1,
  "warnings": []
}
```

---

# Scene Integration

After successful import:

```text
Create Scene Object

↓

Generate Transform

↓

Generate Bounding Box

↓

Register Object

↓

Run Analysis
```

Place of a new object (3.1.0, lot 106, PASSATION.md decision 114 of Noam, Q31 to Q33 A): a new object is placed at the center of the build plate when that place is free. When it would touch an object already on the plate, or be less than 10 mm from it, it goes to the free place of the plate nearest to the center, found as for Arrange (GUI_SPEC.md, Edit Menu, Arrange; 10 mm between two objects). The objects of one 3MF keep their layout and move together as a block. The objects already on the plate never move; hidden objects are not counted, locked ones are. With no free place, the object goes to the right of the plate and gets the warning of the Plate Check. Without a printer, every place is free. The files of one import are placed one after the other, each one around those before it.

---

# Object Naming

Default:

```text
Source File Name
```

Name given by the user (3.1.0, lot 106, PASSATION.md decision 112 of Noam): an object renamed in the Object Panel shows its name (DATA_SCHEMA.md 3.14.0, Object Schema: name) instead of the file name; the file name is kept (fileName). An empty name gives the file name back. The name is written in the project, never translated.

3MF (3.2.0, lot 111, Q21 A): the name of an object in the 3MF file is its name at import ("Support", "Base" instead of "plate (1)", "plate (2)").

---

# Duplicate Names

Example:

```text
cube.stl

cube.stl

↓

cube (1)

cube (2)
```

The rule applies to every name shown, given or not (lot 106, Q4 A): two objects named "Support" are shown "Support (1)" and "Support (2)", in their order in the scene. The extension is taken off a file name only. The numbers are shown, never written in the project.

---

# Units

Internal Standard:

```text
Millimeters
```

---

# Unit Conversion

Supported:

```text
mm

cm

m

inches
```

3MF files also use micron and foot (3MF Core Specification); they are converted too (3MF Reading). STL files have no unit: their values are millimeters.

---

# Export Formats

Version 1:

```text
WYPROJ
```

---

# Planned Export Formats

```text
STL

3MF
```

---

# Target Slicer Export

Purpose:

Export the model and its generated print settings to the target slicer selected by the user.

The target slicer generates the G-Code.

| Target Slicer | Export Format |
|---------------|---------------|
| OrcaSlicer | 3MF project with embedded print, filament and printer settings |
| Bambu Studio | 3MF project with embedded print, filament and printer settings |
| PrusaSlicer | 3MF project with embedded configuration, or INI profile |
| Cura | Cura profile and model file |

Rules:

- Only validated settings are exported
- A setting the target slicer does not support produces a warning, never a guessed value
- The user's slicer installation and existing profiles are never modified

Reference: PROJECT_SPEC.md, section 4.7, and SLICER_EXPORT_SPEC.md (detailed rules)

A native G-Code engine is not part of the current scope (DECISIONS.md, ADR-006 and ADR-024).

---

# Project Export

Purpose:

Save complete workspace.

---

# Project Components

ProjectManager
ProjectSerializer
ProjectDeserializer
ProjectValidator
WYPROJImporter
WYPROJExporter

---

# WYPROJ Project Lifecycle

Application State
↓
ProjectValidator
↓
ProjectSerializer
↓
WYPROJExporter
↓
.wyproj File

.wyproj File
↓
WYPROJImporter
↓
ProjectDeserializer
↓
ProjectValidator
↓
Application State

Phase 13 (3.2.0, lot 111, ADR-038; PASSATION.md decision 119 of Noam, Q1 to Q22 A):

```text
Window (ProjectService)                Main process (ProjectIPC)
  objects, triangles, analyses,  ──►    ProjectManager.createProject
  recommendations, printer,             (the only creator; validated in
  material, filament                    full) → WYPROJExporter → file
                                        written through a temporary file
                                        of the same folder, renamed at
                                        the end

  scene replaced, history        ◄──    WYPROJImporter (extension, size,
  cleared, profiles chosen              version, JSON, ProjectSchema,
  (Q3 A)                                triangles) → project without
                                        meshData + triangles as numbers
```

- The Windows dialogs, the reading and the writing of the files are done by the main process only. The window never sends a path to write: a project opened or saved is known by a token (SECURITY_SPEC.md, Project Security). Paths read: a number of the list of recent projects, and a .wyproj dropped on the viewport.
- The name of the project is the name of its file, without .wyproj (Q9 A); "Untitled" before the first save (never written).
- A file refused changes nothing in the window (Q16 A).

---

# Includes

```text
Scene

Objects (name, file name, visible, locked)

Transforms

Triangles of each object (meshData, 3.2.0)

Printer (full copy)

Material (full copy)

Filament (full copy)

Preset (always null: chosen for each object, in its recommendation)

Settings (always {})

Analysis

Recommendations
```

Not saved (Q6 A): the selection, the camera, the open tab, the overhangs shown, the history of Undo and Redo, the estimations, the costs (preferences of the user).

Metadata:

```text
"metadata": {
  "application": "SlicyWeb Smart Slicer"
}
```

author is optional (see Metadata Handling): never written by SlicyWeb (3.2.0, Q21 A: SlicyWeb does not know the name of the user, and a file sent to someone must not hold it without the user knowing); a file that has it (text) is accepted.

Project identity, version and dates are stored in the project itself (projectId, projectName, version, createdAt, updatedAt).

A WYPROJ project may contain one or more imported objects.

Supported Sources:

```text
- STL
- 3MF
```

Mixed format projects are supported.

---

# Project Format

Official Extension:

```text
.wyproj
```

---

# Project Schema

The WYPROJ file follows the Project File Schema and the Project Schema of DATA_SCHEMA.md.

```json
{
  "format": "WYPROJ",
  "version": "3.0.0",
  "project": {
    "projectId": "",
    "projectName": "",
    "projectFormat": "WYPROJ",
    "createdAt": "",
    "updatedAt": "",
    "version": "3.0.0",
    "scene": { "objects": [] },
    "settings": {},
    "analysis": {
      "<objectId>": {}
    },
    "recommendations": {
      "<objectId>": {}
    },
    "preset": null,
    "printer": null,
    "material": null,
    "filament": null
  },
  "metadata": {
    "application": "SlicyWeb Smart Slicer"
  }
}
```

Each object of scene.objects holds its triangles (meshData, DATA_SCHEMA.md 3.16.0, Object Schema). A file of 1 000 000 triangles is about 48 MB. A file larger than 500 MB is refused before it is read (PROJ_005).

analysis and recommendations are indexed by objectId (ADR-026, Object Reference Rules in DATA_SCHEMA.md).

In case of conflict, DATA_SCHEMA.md prevails.

---

# Save Operations

Supported:

```text
Save

Save As

Auto Save
```

3.2.0 (lot 111, Q10, Q17 and Q18 A):

- Save (Ctrl+S) writes the file of the project; a project never saved opens Save As. Save As (Ctrl+Shift+S) opens the Windows dialog: the folder of the last project opened or saved, otherwise Documents; the name proposed is the name of the project, otherwise the name of the first object; Windows asks before replacing a file. ".wyproj" is added when it is missing.
- The file is written through a temporary file in the same folder, renamed at the end: an interruption never leaves a file half written. A writing that fails gives PROJ_004; the existing file is not changed.
- projectId and createdAt are kept at each save (Save As included); updatedAt is the time of the save.
- A project opened or saved goes to the top of File > Recent Projects (10 at most, USER_SETTINGS_SPEC.md File Settings).
- Auto Save: every 5 minutes (project.autoSaveInterval), only when the project is modified, a copy is written in the recovery folder of the user data folder (Windows: %APPDATA%\SlicyWeb\recovery), never in the file of the user: autosave.wyproj (a project file) and autosave.json (its description). The copy is removed at a save, at "Don't Save" and at a normal close.

---

# Recovery System

Purpose:

```text
Recovery Protection
Project Persistence
Session Recovery
```

3.2.0 (lot 111, Q19 A): at start, when a copy of the automatic save is still there (crash, power cut, forced close), the window asks "SlicyWeb did not close normally. Recover “cube” (saved on 24/11 at 14:32)?": Recover opens the project, marked modified, attached to its file when it had one; Ignore removes the copy. A copy damaged (description or project not valid) is moved to recovery/quarantine/<time>/ with a message, never opened. A normal start shows an empty scene: the last project is not opened by itself.

---

# Import Warnings

Examples:

```text
Large Model Detected

High Triangle Count

Potentially Corrupted Mesh
```

---

# Import Errors

Examples:

```text
Unsupported Format

Invalid Geometry

Corrupted File

Read Failure
```

---

# Import Error Codes

Codes of ERROR_CODES_SPEC.md used by the import (src/importer/StlParser.ts, ThreeMFParser.ts, ImportManager.ts):

| Code | When |
|---|---|
| IMP_001 | Unsupported format: extension other than .stl and .3mf |
| IMP_002 | File larger than the limit of FileValidator (1 GB) |
| STL_001 | The file could not be read (read failure) |
| STL_002 | Empty file; neither binary STL (size = 84 + 50 x triangle count) nor ASCII STL ("solid" with facets) |
| STL_003 | Truncated binary data or triangle count not matching the size; malformed ASCII facet (not 3 vertices); no triangle; coordinate not finite |
| STL_004 | Reserved, not used: no STL format has a version |
| MF_001 | The file could not be read (read failure) |
| MF_002 | Empty file; not a ZIP archive; [Content_Types].xml or _rels/.rels missing; no 3D model relationship, or its part missing |
| MF_003 | Corrupted archive (part larger than its declared size, encrypted part, unknown compression method, duplicate part); invalid XML or UTF-8; DOCTYPE; no model element; invalid number, vertex index or transform; unknown unit; object or model part not found; component cycle or nesting deeper than 32; no build item; no triangle |
| MF_004 | 3MF content over the archive extraction limits (SECURITY_SPEC.md, Archive Extraction Limits) |

Every import refusal has a code of ERROR_CODES_SPEC.md (KI-018 resolved in 0.1.44).

The GUI shows a translated message for each code (import.error.<code>), never the technical message.

---

# Import Progress And Placement

The import runs in the renderer; the file is parsed in a Web Worker (DECISIONS.md, ADR-029). Each file shows its progress (reading, then analyzing), then a short confirmation or its error message.

Several files can be chosen or dropped at once; they are imported one after the other.

An import waiting or in progress can be cancelled (Cancel): the reading is aborted or the parser worker is terminated at once, nothing is added to the scene, and the next file starts.

An imported object is centered on the origin and placed on the build plate (lowest point at Z = 0, ADR-028, ADR-029). Its local origin is the center of its bounding box: its position is the place of its center (ADR-031, DATA_SCHEMA.md 3.4.0). Objects may overlap.

A 3MF file gives one object per build item; its objects keep the layout of the file, the group is centered on the origin and its lowest point is at Z = 0 (ADR-030). Each object has its own transform position; the first object is selected.

Object names (Duplicate Names): the names "cube (1)", "cube (2)" are display names; the project keeps the file name of each object (DATA_SCHEMA.md, Object Schema). The objects of one 3MF file share its file name ("plate (1)", "plate (2)") when the file gives no name to its objects; the name of an object in the 3MF file becomes its name (3.2.0, lot 111, Q21 A: KI-020 closed). The other metadata of the 3MF file are not kept.

---

# 3MF Reading

The 3MF import follows the 3MF Core Specification and the Production extension (DECISIONS.md, ADR-030):

| Element | Handling |
|---|---|
| Package | _rels/.rels gives the root model part (3D model relationship) |
| Units | unit of the root model: micron, millimeter (default), centimeter, inch, foot, meter; converted to millimeters |
| Build items | each item becomes one object, with its transform |
| Components | merged into the object of the build item, with their transforms |
| Production extension | a component (or item) with a path attribute references an object of another model part (3D/Objects/*.model, Bambu Studio and OrcaSlicer) |
| Object type "other" | not printed, not imported (for example modifier parts) |
| Mirror transform | triangle order reversed, normals stay outward |
| Mesh Statistics | vertices: vertices of the meshes used by the object; triangles: triangles produced |

Not read: materials, colors, textures, thumbnails, slicer settings (Metadata/), build plates of Bambu Studio (KI-019).

---

# Security Requirements

The import system must:

```text
Never Execute File Content

Never Execute Embedded Scripts

Never Access External Resources Automatically
```

---

# Performance Requirements

The importer should:

```text
Handle Large Models

Avoid UI Freezes

Provide Progress Updates
```

---

# Metadata Handling

When available:

Store:

```text
Object Name
```

3.2.0 (lot 111, Q21 A): only the name of each object of a 3MF file is kept (3MF Import). The author, the creation date and the application of a 3MF file are not kept: the Object Schema has no field for them. WYPROJ: metadata.application is written; metadata.author is never written.

---

# Compatibility Policy

New formats may be added.

Existing formats must remain supported.

Exception: WYPROJ files of format version 2.0.0 are not supported. They are refused at load (DATA_SCHEMA.md, Project File Schema, WYPROJ Version Rule).

---

# Future Extensions

Reserved:

```text
OBJ Import

STEP Import

AMF Import

GLTF Import

Direct CAD Import

Cloud Import Sources
```

---

# Integration Points

Used By:

```text
IMPORT_MANAGER
STL_IMPORTER
THREEMF_IMPORTER
PROJECT_MANAGER
WYPROJ_IMPORTER
WYPROJ_EXPORTER
SCENE_MANAGER
MODEL_ANALYSIS
OBJECT_MANAGER
```

---

# Related Documents

```text
FILE_STRUCTURE.md

ARCHITECTURE.md

DATA_SCHEMA.md

PROJECT_SPEC.md

DECISIONS.md

SLICER_EXPORT_SPEC.md

GCODE_ENGINE_SPEC.md
```

---

# Golden Rule

Imported data must be validated before entering the scene.

Reliability has priority over convenience.

---

# End Of Document
