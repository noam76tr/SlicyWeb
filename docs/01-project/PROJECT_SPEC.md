# SlicyWeb SMART SLICER

# Project Specification

Version: 2.1.0

Status: Approved

Priority: Mandatory

---

# 1. Project Overview


## Project Name

SlicyWeb

## Project Goal

Develop a modern intelligent 3D printing preparation software capable of automatically analyzing imported models and generating optimal 

print settings based on:

- Selected printer

- Printer hardware capabilities

- Selected material

- Material characteristics

- Object geometry

- Object dimensions

- Object application

- User constraints

- Selected target slicer

The generated settings are exported to the target slicer chosen by the user, so the model can be printed without manual configuration in that slicer.

The software must assist users in obtaining reliable and efficient print results with minimal manual configuration.

---

# Project Governance

All project modifications must follow the governance framework.

Reference Documents:

```text
CLAUDE_GOVERNANCE_PROTOCOL.md
CLAUDE_CHANGE_IMPACT_RULES.md
CLAUDE_FILE_UPDATE_RULES.md
DOMAIN_BOUNDARIES.md
DOMAINS_DEPENDENCY_MATRIX.md
FILE_OWNERSHIP_MATRIX.md
PROJECT_IMPACT_MATRIX.md
CHANGE_CLASSIFICATION_RULES.md
CHANGE_VERIFICATION_CHECKLIST.md
DOCUMENT_UPDATE_MATRIX.md
CROSS_DOCUMENT_DEPENDENCIES.md
BUG_ANALYSIS_PROTOCOL.md
UPDATE_GOVERNANCE_PROTOCOL.md
```

Purpose:

```text
Protect project architecture

Control dependencies

Prevent regressions

Manage ownership

Standardize modifications

Maintain documentation consistency
```

---

# 2. Core Objectives

The application must:

- Import STL files

- Import 3MF files

- Open WYPROJ project files

- Save WYPROJ project files

- Export the model and its generated print settings to the selected target slicer

- Display objects in a 3D environment

- Manage multiple objects simultaneously

- Support printer profile management

- Support material profile management

- Analyze imported models

- Recommend printing settings automatically

- Estimate printing cost

- Estimate printing duration

- Detect printing risks

- Optimize orientation automatically

- Classify object types automatically

- Generate support recommendations

- Apply validated print presets

- Support undo and redo operations

The system should operate similarly to professional slicers while providing intelligent assistance.


Examples:

- OrcaSlicer

- PrusaSlicer

- Cura

- Bambu Studio

---

# 3. Project Scope

SlicyWeb is a print preparation and print settings generation platform.

SlicyWeb does not slice models itself.

SlicyWeb shall:

- Visualize and analyze imported models

- Generate complete print settings automatically, based on the selected printer, material, filament, model analysis and object classification

- Export the model and its generated settings to the target slicer selected by the user, in that slicer's native format

The target slicer generates the G-Code.

Supported Target Slicers:

- OrcaSlicer

- Bambu Studio

- PrusaSlicer

- Cura

The user selects the target slicer they use.

Rules:

- Settings must be mapped to the target slicer's own parameter names, units and value ranges

- A setting the target slicer does not support must produce a warning, never a guessed value

- Mapping rules are defined in SLICER_EXPORT_SPEC.md

A native SlicyWeb G-Code engine is not part of the current scope.

It remains a long-term idea, documented in:

GCODE_ENGINE_SPEC.md (docs/07-future)

---

# 4. Main Features

## 4.1 File Import

Supported Formats:

- STL
- 3MF
- WYPROJ

Purpose:

- STL: Mesh Geometry Import
- 3MF: Advanced Model Import
- WYPROJ: Native Project Format

Internal Data Format:

- JSON

Future Support:

- OBJ
- AMF
- STEP

---

## 4.2 Internationalization

The application shall support multilingual user interfaces.

Initial supported languages:
- English
- French
- Hebrew

Managed By:
- LanguageManager
- LocalizationService
- TranslationLoader

Additional languages may be added in future releases.

Requirements:
- All user-facing text must support localization.
- GUI text must not be hardcoded.
- Application architecture must remain language-independent whenever possible.
- Language switching should be supported without requiring project file changes.
- WYPROJ project files must remain language-neutral and independent from interface language.

Purpose:
- Improve accessibility
- Support international users
- Simplify future localization
- Preserve compatibility across languages

---

## Project File Format

Native Project Format:

WYPROJ

Project Extension:

.wyproj

Project files may contain:

- Scene Data
- Object Data
- Printer Selection
- Material Selection
- Filament Selection
- Target Slicer Selection
- Print Presets
- Analysis Results
- Recommendations
- User Settings
- Metadata
- Project Version Information

Storage Format:
- JSON-Based Structure

Container Format:
{
  "format": "WYPROJ",
  "version": "2.0.0",
  "project": {},
  "metadata": {}
}

Project Versioning:
- Mandatory

Managed By:
- ProjectManager
- ProjectSerializer
- ProjectDeserializer
- ProjectValidator
- WYPROJImporter
- WYPROJExporter

---

## 4.3 Object Management

The user must be able to:

- Add objects

- Remove objects

- Duplicate objects

- Rename objects

- Hide objects

- Show objects

- Lock objects

- Unlock objects

- Center objects on bed

- Arrange objects automatically

- Arrange objects manually

---

## 4.4 Transformations

Each object shall support:

### Move

- X

- Y

- Z



### Rotate

- X Axis

- Y Axis

- Z Axis



Modes:

- Step rotation

- Continuous rotation


### Scale

- Uniform scale

- Independent scale



Examples:

- 50%

- 100%

- 150%

- 2x


---


## 4.5 Multi Object Support


The system shall:

- Support multiple objects

- Detect collisions

- Detect overlaps

- Arrange objects automatically

- Arrange objects manually

---

## 4.6 History System

The system shall support:

-  Undo
-  Redo
-  Action History

Supported Actions:

-  Import
-  Delete
-  Duplicate
-  Move
-  Rotate
-  Scale
-  Printer Changes
-  Material Changes
-  Print Settings Changes

The history system must preserve project integrity.

---

## 4.7 Target Slicer Export

The user must be able to:

- Select the target slicer they use
- Review the generated print settings before export
- Export the model and its settings to the target slicer

Supported Target Slicers:

- OrcaSlicer
- Bambu Studio
- PrusaSlicer
- Cura

Export Formats:

| Target Slicer | Export Format |
|---------------|---------------|
| OrcaSlicer | 3MF project with embedded print, filament and printer settings |
| Bambu Studio | 3MF project with embedded print, filament and printer settings |
| PrusaSlicer | 3MF project with embedded configuration, or INI profile |
| Cura | Cura profile and model file |

Output Mode:

The user chooses the output mode through a selection list and confirms it before export:

- Export For Slicer: SlicyWeb writes the export file; the user opens it in the target slicer
- Export And Generate G-Code: SlicyWeb calls the target slicer's command line to produce the G-Code (optional, requires the slicer to be installed)

Status: The availability of Export And Generate G-Code is pending decision (see DECISIONS.md).

Rules:

- Export must never modify the user's slicer installation or existing profiles
- Unsupported or unmapped settings must be listed in an export warning report
- Export must be undoable at the project level (WYPROJ keeps the source settings)
- Export must use only validated settings

Managed By:

- SlicerExportService
- Slicer-specific exporters

Detailed mapping and file format rules:

SLICER_EXPORT_SPEC.md

---

# 5. Visualization Engine

The workspace shall contain:


## Build Plate


- Grid view

- Axis indicators

- Real printer dimensions

- Dynamic plate updates


---


## Camera


Supported views:


- Perspective

- Orthographic

- Isometric

- Top

- Bottom

- Front

- Back

- Left

- Right


---


## Interaction


- Zoom

- Pan

- Orbit

- Focus selected object


---


# 6. Printer System

## Printer Selection


Printer list shall be organized:

Brand → Model


Example:


Creality

&#x20;→ K1

&#x20;→ K1 Max

&#x20;→ Ender 3 V3



Bambu Lab

&#x20;→ X1 Carbon

&#x20;→ P1S

&#x20;→ A1



Prusa

&#x20;→ MK4

&#x20;→ MINI+

&#x20;→ XL


---


## Printer Data


Each printer profile shall contain:


- Brand

- Model

- Build Volume

- Nozzle Diameter

- Supported Nozzles

- Firmware Type

- Extruder Type

- Direct Drive/Bowden


Motion Capabilities:


- Max Print Speed

- Max Travel Speed

- Max Acceleration

- Max Jerk


Thermal Capabilities:


- Max Nozzle Temperature

- Max Bed Temperature

- Chamber Temperature


Other:


- Cooling System

- Supported Materials


---


## Printer Data Sources


Priority:
1. Local Database
2. Local Cache
3. Official Profiles
4. Verified Repositories
5. Community Sources


---


# 7. Material System


Supported Materials

- PLA

- PLA+

- PETG

- ABS

- ASA

- TPU

- PCTG

- Nylon

- Nylon CF

- PC

- PET CF

- PP


---


## Material Properties


Each material shall contain:


- Nozzle Temperature

- Bed Temperature

- Fan Speed

- Cooling Requirements

- Drying Requirements

- Warping Tendency

- Shrinkage Rate

- Recommended Speed

- Mechanical Characteristics


---


# 8. Model Analysis Engine

The system shall analyze:


## Dimensions


- Width

- Depth

- Height


---


## Geometry

- Volume

- Surface Area

- Center of Mass


---


## Printability


- Overhangs

- Bridges

- Thin Walls

- Unsupported Areas

- Sharp Edges

- Fine Details

---

## Classification

The system shall automatically classify objects.

Supported categories:

- Figurine
- Miniature
- Mechanical Part
- Gear
- Bracket
- Tool
- Enclosure
- Vase
- Prototype
- Structural Part
- Functional Part


## Stability


- Contact Area

- Height/Base Ratio

- Center Of Gravity

- Tip Risk


---


# 9. Artificial Intelligence Recommendation Engine


Input:

Printer
+
Material
+
Filament
+
Model Analysis
+
Object Classification


Output:


Recommended Printing Profile


---


## Priorities


Priority Order:

1. Print Success

2. Mechanical Reliability

3. Surface Quality

4. Time Reduction

5. Material Reduction

---

# 10. Recommended Parameters

The AI may recommend:

## Quality

- Layer Height

- Adaptive Layers


---


## Walls

- Wall Count

- Wall Thickness


---


## Top And Bottom

- Top Layers

- Bottom Layers


---


## Infill


Type:

- Gyroid

- Grid

- Cubic

- Honeycomb

- Lightning

Density: 0% - 100%

---

## Supports

Types:

- Organic

- Tree

- Standard


Settings:

- Density

- Angle Threshold

- Interface Layers

---

## Adhesion


Types:

- None

- Skirt

- Brim

- Raft


---


## Cooling

- Fan Speed

- Minimum Layer Time


---


## Retraction

- Distance

- Speed


---


## Speed

- Print Speed

- Inner Wall Speed

- Outer Wall Speed

- Travel Speed

- Infill Speed


---

## Print Presets

The AI may recommend:

- Draft
- Fast
- Balanced
- Quality
- Ultra Quality
- Mechanical
- Prototype
- Miniature
- Vase
- Structural

# 11. Automatic Optimization

The system shall be capable of:


## Orientation Search


Determine best orientation according to:

- Support Reduction

- Stability

- Surface Quality

- Printing Time

---

## Optimization Goals

- Reduce Supports

- Reduce Print Time

- Reduce Material Usage

- Improve Surface Quality

- Improve Print Reliability

---

# 12. Cost Estimation


Estimate:


- Filament Length

- Filament Weight

- Material Cost

- Electricity Cost

- Printing Duration

---

# 13. Warning System



Generate warnings for:


- Build Volume Exceeded

- Collision Detected

- Excessive Overhang

- High Warp Risk

- Unsupported Structures

- Fragile Features

- Unstable Orientation

- Excessive Print Time

---

# 14. Development Strategy

The project shall be developed incrementally.
Every phase must be completed and validated before starting the next one.
The project shall prioritize stability and maintainability.

All modifications must include:

- Impact analysis
- Dependency validation
- Documentation review
- Governance review when required

---

# 15. Project Phases

Project phases are defined in: 

ROADMAP.md

Detailed technical implementation sequencing is defined in: 

PHASES_IMPLEMENTATION_PLAN.md

These documents are the authoritative references for project planning and implementation order.

---

# 16 Documentation Status

Documentation Status:

- Core Documentation Complete
- Architecture Defined
- Governance Layer Complete
- Impact Analysis Layer Complete
- Update Governance Layer Complete
- Bug Analysis Layer Complete
- Development Ready
- Ready For AI Assisted Development
- Ready For Governance Controlled Development

Reference:

AI_START_HERE.md
PROJECT_DOCUMENTATION_INDEX.md

---

# 17 Governance Principles

The project follows:

```text
Patch First

Impact Analysis First

Documentation First

Domain Ownership

Dependency Governance

Architecture Protection
```

---

# 18. Long Term Vision

Create a professional AI-assisted slicer capable of:

- Working with existing slicers by configuring them automatically

- Reducing configuration complexity

- Improving print success rates

- Providing intelligent print guidance

- Automatically adapting to hardware and material limitations

---

End of Document
