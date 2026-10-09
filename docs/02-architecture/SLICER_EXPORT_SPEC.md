# SlicyWeb Smart Slicer

# SLICER EXPORT SPECIFICATION

Version: 1.0.0

Status: Draft

Priority: High

---

# Purpose

This document defines how SlicyWeb exports a model and its generated print settings to the target slicer selected by the user.

It defines:

- Supported target slicers
- Export formats
- Output modes
- Settings mapping rules
- Value conversion rules
- Validation rules
- Warning and error handling
- Security rules
- Architecture and module placement

This document is the detailed reference requested by:

```text
PROJECT_SPEC.md (section 3 and section 4.7)
DECISIONS.md (ADR-024)
IMPORT_EXPORT_SPEC.md (Target Slicer Export)
```

---

# Status Notice

This specification is a Draft.

The slicer file formats and setting names listed in this document come from public slicer documentation and must be verified against the source code or exported files of each target slicer before implementation.

Every mapping entry carries a verification status.

An entry marked Unverified must not be implemented until it has been verified (see Rule V1).

---

# Scope

SlicyWeb generates print settings.

SlicyWeb does not slice models.

SlicyWeb does not generate G-Code itself.

The target slicer generates the G-Code.

In scope:

- Export of the model and its print settings to a target slicer file
- Optional G-Code generation through the target slicer command line (pending decision)

Out of scope:

- Native G-Code generation (see GCODE_ENGINE_SPEC.md, docs/07-future)
- Creation of printer (machine) definitions for a target slicer
- Modification of the user's slicer installation or existing slicer profiles
- Sending files to a printer

---

# Supported Target Slicers

```text
OrcaSlicer
Bambu Studio
PrusaSlicer
Cura
```

Slicer families:

| Family | Target Slicers | Shared Format |
|--------|----------------|---------------|
| Bambu Family | OrcaSlicer, Bambu Studio | 3MF project with JSON settings |
| Prusa Family | PrusaSlicer | 3MF project or INI profile with key = value settings |
| Cura Family | Cura | Cura profile and model file |

OrcaSlicer is derived from Bambu Studio. Both use the same 3MF project structure. A shared Bambu Family exporter is allowed, with slicer-specific differences isolated.

---

# User Workflow

```text
User imports a model
↓
User selects printer, material and filament
↓
SlicyWeb analyzes the model and generates a Recommendation
↓
User selects the target slicer
↓
User reviews the generated settings
↓
User selects the output mode
↓
User confirms the export
↓
SlicyWeb validates, maps and exports
↓
SlicyWeb displays the export report
```

No export starts without user confirmation.

---

# Output Modes

## Mode 1 - Export For Slicer

Status: Accepted

SlicyWeb writes the export file.

The user opens the file in the target slicer.

The target slicer generates the G-Code.

## Mode 2 - Export And Generate G-Code

Status: Proposed (pending decision, DECISIONS.md ADR-024)

SlicyWeb writes the export file, then calls the target slicer command line to produce the G-Code.

Requirements:

- The target slicer must be installed on the user's computer
- The user must configure the slicer executable path in the application settings
- The user must confirm each execution

Availability per slicer:

| Target Slicer | Command Line Slicing | Notes |
|---------------|----------------------|-------|
| OrcaSlicer | Available | Documented CLI (`--slice`, `--load-settings`, `--load-filaments`, `--outputdir`) |
| Bambu Studio | Expected | Same CLI origin as OrcaSlicer. To be verified |
| PrusaSlicer | Available | Documented CLI (`--export-gcode`, `--load`) |
| Cura | Not supported in version 1 | The Cura application has no documented headless mode. CuraEngine requires machine definition files that SlicyWeb does not generate |

Until the decision is made, Mode 2 must not be implemented.

---

# Export Formats

## Bambu Family (OrcaSlicer, Bambu Studio)

Format:

```text
3MF project (.3mf)
```

Known structure:

```text
[Content_Types].xml
_rels/.rels
3D/3dmodel.model                     = Geometry (standard 3MF XML)
Metadata/project_settings.config     = All resolved settings (flat JSON object)
Metadata/model_settings.config       = Plate and object structure (XML)
```

SlicyWeb writes:

- The geometry of the exported objects
- The generated settings in Metadata/project_settings.config
- The plate structure in Metadata/model_settings.config

The base structure of the file is provided by the template stored in:

```text
data/templates/bambu_family/
```

## Prusa Family (PrusaSlicer)

Formats:

```text
3MF project (.3mf) with embedded configuration
INI profile (.ini)
```

Known structure of the 3MF project:

```text
3D/3dmodel.model                     = Geometry
Metadata/Slic3r_PE.config            = Settings (key = value lines)
Metadata/Slic3r_PE_model.config      = Object settings
```

INI profile:

```text
key = value
```

One setting per line.

The 3MF project is the default format.

The INI profile is exported when the user requests settings only.

Template location:

```text
data/templates/prusa_family/
```

## Cura Family (Cura)

Format:

```text
Model file (.stl or .3mf)
+
Cura profile (.curaprofile)
```

A Cura profile stores user-changed settings as instance containers (.inst.cfg) for the global stack and for each extruder.

The exact internal structure of the .curaprofile file must be verified before implementation (Rule V1).

The user imports the profile in Cura, then opens the model.

Template location:

```text
data/templates/cura_family/
```

---

# Settings Sources

The exported settings come only from validated SlicyWeb data:

| Source | Type | Location |
|--------|------|----------|
| Recommended profile | RecommendedProfile | src/types/Recommendation.ts |
| Print preset | PrintPreset | src/types/PrintPreset.ts |
| Material | Material | src/types/Material.ts |
| Filament | Filament | src/types/Filament.ts |
| Printer | Printer | src/types/Printer.ts |

SlicyWeb never invents a value that is not present in these sources.

---

# Required Data Model Extensions

The current data model does not contain every value required by a target slicer.

| Missing Value | Current Situation | Required Change |
|---------------|-------------------|-----------------|
| Nozzle temperature | Material contains only a range (minNozzle, maxNozzle) | Add a selected nozzle temperature to the recommended profile |
| Bed temperature | Material contains only a range (minBed, maxBed) | Add a selected bed temperature to the recommended profile |
| Z-Hop | Defined in PRINT_SETTINGS_SPEC.md, absent from RecommendedProfile | Add to RetractionSettings |
| Ironing | Defined in PRINT_SETTINGS_SPEC.md, absent from RecommendedProfile | Add to the recommended profile |
| Target slicer selection | Not stored | Add to the WYPROJ project data |

These extensions require updates to:

```text
DATA_SCHEMA.md
src/types/Recommendation.ts
src/schemas/RecommendationSchema.ts
```

They must follow the governance process (impact analysis, documentation first).

Until these extensions exist, the missing values are reported as warnings and are not exported.

---

# Settings Mapping

Each SlicyWeb setting is mapped to the setting name used by each target slicer.

Verification status values:

```text
Verified    = Checked against the target slicer source code or an exported file
Unverified  = Taken from public documentation, must be verified before implementation
```

All entries below are currently Unverified.

## Quality

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| quality.layerHeight | layer_height | layer_height | layer_height | Unverified |
| quality.wallCount | wall_loops | perimeters | wall_line_count | Unverified |
| quality.topLayers | top_shell_layers | top_solid_layers | top_layers | Unverified |
| quality.bottomLayers | bottom_shell_layers | bottom_solid_layers | bottom_layers | Unverified |

## Infill

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| infillDensity | sparse_infill_density | fill_density | infill_sparse_density | Unverified |
| infillPattern | sparse_infill_pattern | fill_pattern | infill_pattern | Unverified |

## Supports

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| supports.enabled | enable_support | support_material | support_enable | Unverified |
| supports.type | support_type | support_material_style | support_structure | Unverified |

## Adhesion

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| adhesion = skirt | skirt_loops | skirts | adhesion_type | Unverified |
| adhesion = brim | brim_type | brim_width | adhesion_type | Unverified |
| adhesion = raft | raft_layers | raft_layers | adhesion_type | Unverified |

## Speed

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| speed.print | (no single equivalent) | (no single equivalent) | speed_print | Unverified |
| speed.outerWall | outer_wall_speed | external_perimeter_speed | speed_wall_0 | Unverified |
| speed.innerWall | inner_wall_speed | perimeter_speed | speed_wall_x | Unverified |
| speed.infill | sparse_infill_speed | infill_speed | speed_infill | Unverified |
| speed.travel | travel_speed | travel_speed | speed_travel | Unverified |

## Cooling

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| cooling.fanSpeed | fan_max_speed | max_fan_speed | cool_fan_speed_max | Unverified |
| cooling.minimumLayerTime | slow_down_layer_time | slowdown_below_layer_time | cool_min_layer_time | Unverified |

## Retraction

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| retraction.distance | retraction_length | retract_length | retraction_amount | Unverified |
| retraction.speed | retraction_speed | retract_speed | retraction_speed | Unverified |

## Temperature (requires data model extension)

| SlicyWeb Setting | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura | Status |
|------------------|---------------------------|-------------|------|--------|
| Nozzle temperature | nozzle_temperature | temperature | material_print_temperature | Unverified |
| Bed temperature | Depends on plate type (one setting per plate type) | bed_temperature | material_bed_temperature | Unverified |

## Mapping Storage

The mapping tables are stored as data, one file per slicer family:

```text
data/templates/bambu_family/mapping.json
data/templates/prusa_family/mapping.json
data/templates/cura_family/mapping.json
```

Each mapping file declares:

```json
{
  "slicerFamily": "",
  "supportedSlicerVersions": "",
  "version": "",
  "entries": [
    {
      "slicywebSetting": "",
      "slicerSetting": "",
      "conversion": "",
      "status": "Unverified"
    }
  ]
}
```

Mapping files must be validated with a Zod schema before use.

---

# Value Conversion Rules

## Units

SlicyWeb internal units:

```text
Length       = millimeters
Speed        = millimeters per second
Temperature  = degrees Celsius
Percentage   = number from 0 to 100
Time         = seconds
```

Each mapping entry defines the conversion to the target slicer format.

Examples of known differences (Unverified):

```text
Percentage written as text with a percent sign ("15%")  : OrcaSlicer, Bambu Studio, PrusaSlicer
Percentage written as a number (15)                      : Cura
```

## Enumerations

Values such as infill pattern, support type and adhesion type must be translated with an explicit table.

Example (support type, Unverified):

| SlicyWeb | OrcaSlicer / Bambu Studio | PrusaSlicer | Cura |
|----------|---------------------------|-------------|------|
| none | enable_support = false | support_material = 0 | support_enable = false |
| standard | normal | grid | normal |
| tree | tree | organic | tree |
| organic | tree (organic style) | organic | tree |

An enumeration value without an explicit translation must not be guessed.

It produces a warning and the slicer default is kept.

## Settings Without Equivalent

When a target slicer has no equivalent setting:

- The setting is not exported
- A warning is added to the export report

Example:

```text
speed.print has no single equivalent in OrcaSlicer, Bambu Studio and PrusaSlicer.
Its value is represented by the individual speeds (outer wall, inner wall, infill).
```

---

# Printer Profiles In The Target Slicer

SlicyWeb does not create printer (machine) definitions for the target slicer.

The export references the target slicer's own system printer profile that matches the selected printer.

The matching uses the printer brand and model (Printer.brand, Printer.model).

If no matching printer profile is known for the target slicer:

- The export is blocked
- Error EXP_002 is reported

The list of known printer profile names per slicer is stored in the mapping data and must be verified (Rule V1).

---

# Validation Rules

Before export, verify:

```text
A Recommendation exists for every exported object
The Recommendation passed ValidationEngine
Every exported value is inside the printer limits (Printer.motion, Printer.thermal)
Every exported value is inside the material limits (Material.temperature)
The target slicer is supported
The output mode is allowed for the target slicer
The mapping file is valid and supports the target slicer version
A matching printer profile exists in the target slicer
Every exported object is inside the build volume of the printer
No exported object collides with another exported object
```

Any failed rule blocks the export and reports an error.

Scene checks (every exported object inside the build volume of the printer, no collision between objects) are performed again before every export.

Reason: moving an object does not make its analysis outdated (DATA_SCHEMA.md, Object Reference Rules, rule 8).

---

# Export Report

Every export produces a report displayed to the user.

The report contains:

```text
Target slicer
Output mode
Export file path
Exported settings (with values)
Settings not exported (with reason)
Warnings
Errors
```

Warnings use the Warning type (src/types/Warning.ts):

```json
{
  "code": "",
  "severity": "",
  "message": ""
}
```

All user-facing messages use the internationalization system (src/i18n/). No message text is hardcoded.

---

# Error And Warning Codes

New code family to add to ERROR_CODES_SPEC.md:

| Code | Severity | Meaning |
|------|----------|---------|
| EXP_001 | Error | Unsupported target slicer |
| EXP_002 | Error | No matching printer profile in the target slicer |
| EXP_003 | Error | Recommendation missing or not validated |
| EXP_004 | Error | Value outside printer or material limits |
| EXP_005 | Error | Invalid or unsupported mapping file |
| EXP_006 | Error | Export file could not be written |
| EXP_007 | Warning | Setting without equivalent in the target slicer (not exported) |
| EXP_008 | Warning | Enumeration value without translation (slicer default kept) |
| EXP_009 | Warning | Required value missing from the data model (not exported) |
| EXP_010 | Warning | Target slicer version not covered by the mapping file |
| EXP_011 | Error | Command line slicing failed (Mode 2) |
| EXP_012 | Error | Slicer executable not configured or not found (Mode 2) |

---

# Security Rules

The export system must:

- Never modify the user's slicer installation
- Never modify or overwrite existing slicer profiles
- Write only to the location selected by the user
- Never overwrite an existing file without user confirmation
- Never download or install a slicer automatically

Command line execution (Mode 2 only):

- Runs only in the Electron main process
- Runs only after explicit user confirmation
- Uses only the executable path configured by the user
- Passes arguments as a list, never through a shell command string
- Applies a timeout
- Never executes content read from imported files

Reference:

```text
SECURITY_SPEC.md
```

---

# Architecture

The export follows the mandatory communication flow:

```text
GUI
↓
IPC Layer
↓
SlicerExportService
↓
Slicer Exporters
↓
File Writing (Electron main process)
```

Planned modules (not yet created):

```text
src/services/SlicerExportService.ts

src/slicer_export/
├── SlicerExportManager.ts         = Orchestrates validation, mapping and export
├── SettingsMapper.ts              = Applies mapping files and value conversions
├── ExportValidator.ts             = Validation rules before export
├── ExportReportBuilder.ts         = Builds the export report
├── BambuFamilyExporter.ts         = OrcaSlicer and Bambu Studio 3MF export
├── PrusaFamilyExporter.ts         = PrusaSlicer 3MF and INI export
└── CuraFamilyExporter.ts          = Cura profile and model export

src/schemas/SlicerMappingSchema.ts = Zod schema for mapping files
src/types/SlicerExport.ts          = Export types (target slicer, output mode, report)

data/templates/
├── bambu_family/
├── prusa_family/
└── cura_family/
```

Planned IPC channels:

```text
export:slicer          = Mode 1, Export For Slicer
export:slicerGcode     = Mode 2, Export And Generate G-Code (pending decision)
```

IPC payloads must be validated with Zod before use.

Rules:

- The GUI never writes export files directly
- Exporters contain no recommendation logic
- Exporters never change a setting value except through a documented conversion
- The mapping data is the only place where slicer setting names are defined

When these modules are created, the following documents must be updated in the same change:

```text
FILE_STRUCTURE.md
DIRECTORY_PURPOSES.md
API_SPEC.md (IPC channels)
```

---

# Project Data

The WYPROJ project stores:

```text
Selected target slicer
Selected output mode
Last export report
```

The source settings remain in the WYPROJ project.

An export never changes the project settings.

---

# Testing Requirements

Unit tests:

- Each mapping entry
- Each value conversion
- Each enumeration translation
- Each validation rule

Integration tests:

- Complete export for each slicer family
- Export report content

Manual validation (for each supported slicer version):

```text
Open the exported file in the target slicer
Verify that every exported setting appears with the expected value
Verify that the slicer reports no file error
```

A mapping entry becomes Verified only after manual validation or verification against the slicer source code.

Reference:

```text
TEST_PLAN.md
```

---

# Verification Rules

## Rule V1

A mapping entry, a file structure or a printer profile name marked Unverified must not be implemented until it is verified against the target slicer source code or an exported file.

## Rule V2

Each mapping file declares the slicer versions it supports.

An export to a slicer version outside this range produces warning EXP_010.

## Rule V3

When a target slicer changes a setting name or a file format, only the mapping data and the affected exporter are updated.

---

# Implementation Phase

Target slicer export depends on:

```text
Model Analysis
Object Classification
Recommendation Engine
Project Persistence (WYPROJ)
```

Planned release:

```text
CHANGELOG.md, version 1.0.0
```

The functional phase must be added to ROADMAP.md.

---

# Impacted Documents

Creating or changing this specification requires review of:

```text
PROJECT_SPEC.md
DECISIONS.md
IMPORT_EXPORT_SPEC.md
DATA_SCHEMA.md
ERROR_CODES_SPEC.md
API_SPEC.md
SECURITY_SPEC.md
USER_SETTINGS_SPEC.md
TEST_PLAN.md
ROADMAP.md
FILE_STRUCTURE.md
DIRECTORY_PURPOSES.md
PROJECT_DOCUMENTATION_INDEX.md
CHANGELOG.md
```

---

# Related Documents

```text
PROJECT_SPEC.md
DECISIONS.md
IMPORT_EXPORT_SPEC.md
PRINT_SETTINGS_SPEC.md
PRINT_PRESETS_SPEC.md
PRINTER_PROFILE_SPEC.md
MATERIAL_PROFILE_SPEC.md
FILAMENT_SETTINGS_SPEC.md
DATA_SCHEMA.md
ERROR_CODES_SPEC.md
SECURITY_SPEC.md
GCODE_ENGINE_SPEC.md
```

---

# Golden Rule

An exported setting must mean exactly the same thing in the target slicer as in SlicyWeb.

When this cannot be guaranteed, the setting is not exported and the user is warned.

---

# End Of Document
