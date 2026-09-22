# SlicyWeb SMART SLICER
# IMPORT EXPORT SPECIFICATION

Version: 2.0.0

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

GCODE
```

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

Settings

Recommendations
```

Metadata:

```text
"metadata": {
  "version": "2.0.0",
  "createdAt": "",
  "updatedAt": "",
  "application": "SlicyWeb Smart Slicer"
}
```

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

```json
{
  "format": "WYPROJ",
  "version": "2.0.0",
  "project": {
    "metadata": {
    "version": "2.0.0",
    "createdAt": "",
    "updatedAt": "",
    "application": "SlicyWeb Smart Slicer"
    },
    "scene": {},
    "printers": [],
    "materials": [],
    "filaments": [],
    "presets": [],
    "analysis": [],
    "recommendations": [],
    "settings": {}
  }
}
```

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

GCODE_ENGINE_SPEC.md
```

---

# Golden Rule

Imported data must be validated before entering the scene.

Reliability has priority over convenience.

---

# End Of Document
