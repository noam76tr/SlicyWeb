# SlicyWeb SMART SLICER
# IMPORT EXPORT SPECIFICATION

Version: 3.0.0

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

Metadata

Units

Object Names
```

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

---

# Object Naming

Default:

```text
Source File Name
```

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

---

# Includes

```text
Scene

Objects

Transforms

Printer

Material

Filament

Preset

Settings

Analysis

Recommendations
```

Metadata:

```text
"metadata": {
  "application": "SlicyWeb Smart Slicer",
  "author": ""
}
```

author is optional (see Metadata Handling).

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
    "scene": {},
    "settings": {},
    "analysis": {
      "<objectId>": {}
    },
    "recommendations": {
      "<objectId>": {}
    },
    "preset": {},
    "printer": {},
    "material": {},
    "filament": {}
  },
  "metadata": {
    "application": "SlicyWeb Smart Slicer",
    "author": ""
  }
}
```

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

---

# Recovery System

Purpose:

```text
Recovery Protection
Project Persistence
Session Recovery
```

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

Codes of ERROR_CODES_SPEC.md used by the STL import (src/importer/StlParser.ts, ImportManager.ts):

| Code | When |
|---|---|
| STL_001 | The file could not be read (read failure) |
| STL_002 | Empty file; neither binary STL (size = 84 + 50 x triangle count) nor ASCII STL ("solid" with facets) |
| STL_003 | Truncated binary data or triangle count not matching the size; malformed ASCII facet (not 3 vertices); no triangle; coordinate not finite |
| STL_004 | Not used yet |

Reasons without a code in ERROR_CODES_SPEC.md (KI-018): unsupported format (extension other than .stl and .3mf), file larger than the limit of FileValidator (1 GB).

The GUI shows a translated message for each code (import.error.<code>), never the technical message.

---

# Import Progress And Placement

The import runs in the renderer; the file is parsed in a Web Worker (DECISIONS.md, ADR-029). Each file shows its progress (reading, then analyzing), then a short confirmation or its error message.

Several files can be chosen or dropped at once; they are imported one after the other.

An imported object is centered on the origin and placed on the build plate (lowest point at Z = 0, ADR-028, ADR-029). Objects may overlap.

Object names (Duplicate Names): the names "cube (1)", "cube (2)" are display names; the project keeps the file name of each object (DATA_SCHEMA.md, Object Schema).

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
Author

Creation Date

Application

Object Name
```

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
