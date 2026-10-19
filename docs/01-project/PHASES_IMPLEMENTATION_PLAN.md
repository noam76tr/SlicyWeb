# SlicyWeb SMART SLICER

# IMPLEMENTATION PLAN

Version: 2.1.0

Status: Approved

Priority: Medium

---


# Purpose

This document defines the implementation order of the project.

The objective is to:

- Avoid large rewrites

- Reduce bugs

- Keep development manageable

- Maintain architecture stability

- Follow the roadmap correctly


Development must follow these phases in order.

Do not skip phases.


Note:

This document defines the technical implementation sequence.

Functional project milestones are defined in:

ROADMAP.md

ROADMAP.md defines:

- Functional progression
- Project milestones
- Release objectives

PHASES_IMPLEMENTATION_PLAN.md defines:

- Technical sequencing
- Development dependencies
- Technical implementation order

If a conflict appears, ROADMAP.md governs functional objectives while this document governs technical implementation order.

---

# Roadmap And Technical Phase Mapping

The roadmap defines functional milestones.

This document defines the technical implementation sequence required to reach those milestones.

The relationship is:

```text
Technical Phases
↓
Produce the capabilities required by
↓
Functional Roadmap Phases
```

---

## Phase Mapping

The roadmap defines functional project milestones.

This document defines the technical implementation sequence required to reach those milestones.

The technical phases are organized to provide the capabilities required by the functional roadmap phases.

|-----------------|------------------------------------------|------------------------------------------------------------|
| Technical Phase | Technical Area                           | Functional Roadmap Phase                                   │
|-----------------|------------------------------------------|------------------------------------------------------------|
| Phase 0         | Foundation                               | Phase 0 - Foundation                                       |
| Phase 1         | Project Bootstrap                        | Phase 1 - GUI Foundation                                   |
| Phase 2         | Core Dependencies                        | Phase 1 - GUI Foundation and Phase 2 - 3D Rendering Engine |
| Phase 3         | GUI Foundation                           | Phase 1 - GUI Foundation                                   |
| Phase 4         | 3D Viewport                              | Phase 2 - 3D Rendering Engine                              |
| Phase 5         | Model Import                             | Phase 3 - Model Import System                              |
| Phase 6         | Transform System                         | Phase 4 - Object Manipulation                              |
| Phase 7         | Printer Database                         | Phase 5 - Printer Management                               |
| Phase 8         | Material Database and Filament Profiles  | Phase 6 - Material Management                              |
| Phase 9         | Model Analysis                           | Phase 7 - Model Analysis                                   | 
| Phase 10        | Classification and Recommendation Engine | Phase 8 - Recommendation Engine                            |
| Phase 11        | Optimization Engine                      | Phase 9 - Optimization Engine                              |
| Phase 12        | Cost Estimation                          | Phase 10 - Cost Estimation                                 |
| Phase 13        | Project Persistence                      | Phase 11 - Project Persistence                             |
| Phase 14        | Target Slicer Export                     | Phase 12 - Target Slicer Export                            |
| Phase 15        | Advanced Features                        | Phase 13 - Advanced Features                               |
| Phase 16        | Production Validation and Release        | Phase 14 - Production Release                              |
|-----------------|------------------------------------------|------------------------------------------------------------|

### Mapping Rules

```text
Technical phases define implementation order.

Functional roadmap phases define project capabilities and milestones.

A functional phase may require several technical phases.

A technical phase may support more than one functional roadmap phase.

Technical dependencies must be completed before the related functional milestone is considered complete.

No functional milestone may be marked as completed until its required technical phases have been validated.
```

---

# Implementation Governance

Implementation planning must comply with:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

DOCUMENT_UPDATE_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md
```

Purpose:

```text
- Controlled Implementation

- Dependency Governance

- Risk Reduction

- Architecture Protection

- Documentation Governance

- Change Validation
```

---

# Phase Governance Rules

Before starting any phase:

1. Verify previous phase stability

2. Verify documentation readiness

3. Verify ownership impact

4. Verify dependencies

5. Verify architectural compatibility

6. Verify roadmap alignment

7. Validate governance requirements

8. Verify ROADMAP.md consistency

No phase may begin until all governance requirements are satisfied.

---

# Required Architecture Flow

All implementation phases must preserve the following dependency flow:

```text
GUI
↓
Application / IPC
↓
Services
↓
Repositories
↓
RepositorySync
↓
Remote Sources
```

---

# PHASE 0

# FOUNDATION

Status: Completed

Date: 2026-10-14

Validation result:

- Repository Created: Git repository noam76tr/SlicyWeb
- Folder Structure Complete: every root directory and every source subdirectory listed in this phase exists
- Documentation Complete: every document listed in PROJECT_DOCUMENTATION_INDEX.md and FILE_STRUCTURE.md exists
- Root Files: README.md, LICENSE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md (the license file is named LICENSE.md, as in FILE_STRUCTURE.md)
- Tooling: Git, Node.js and npm (package.json, Phase 1)

The documentation foundation, architecture, governance rules, domain boundaries, schemas, and initial source structure have been established.

The project is transitioning from foundation definition to controlled implementation.

Existing implementation areas include:

- GUI structure
- Application services
- Repository structure
- Project management
- Internationalization
- Electron IPC structure
- Runtime schemas
- Shared types
- Analysis engines
- Recommendation engines
- Optimization engines
- Storage structure
- Recovery structure

---

## Objectives

Create the project foundation.

Phase 0 does not deliver completed business functionality.

The project may contain documented interfaces, source folders, type definitions, schemas, services, repositories, and initial module structures.

However, the following functionality is not considered complete during Phase 0:

- Complete business workflows
- Complete STL processing
- Complete 3MF processing
- Complete AI behavior
- Complete model analysis
- Complete recommendation generation
- Complete optimization workflows
- Complete production persistence

---



## Tasks



### Create Repository



```text

Initialize Git Repository

```



---



### Create Root Structure

```text

docs/
data/
src/
src-electron/
tests/
assets/
cache/
logs/
scripts/
plugins/
public/
.github/

```

---

### Create Source Subdirectory Structure

The main source directory contains the following implementation areas:

```text
src/
├── app/
├── classification_engine/
├── config/
├── constants/
├── cost_engine/
├── electron/
│   └── ipc/
├── events/
├── filament_database/
├── gui/
│   ├── panels/
│   ├── sidebar/
│   ├── statusbar/
│   └── viewport/
├── i18n/
├── importer/
├── material_database/
├── model_analysis/
├── notifications/
├── object_manager/
├── optimization_engine/
├── preset_engine/
├── printer_database/
├── project/
├── recommendation_engine/
├── recovery/
├── renderer/
├── repositories/
├── scene/
├── schemas/
├── services/
├── state/
├── storage/
├── transform/
├── types/
└── utils/
```

---

### Electron Directory Strategy

The project currently contains two Electron-related directories with different purposes.

The active Electron implementation is located in:

```text
src/electron/
├── main.ts
├── preload.ts
└── ipc/
```

This directory is currently used for:

- Electron main-process logic
- Preload bridge configuration
- IPC communication
- Renderer-to-main process coordination

The root-level directory:

```text
src-electron/
```

is currently reserved for a future Electron-specific structure.

It is intentionally kept separate from the active implementation and is not the current working code path.

This means:

```text
src/electron/
```

is the active Electron implementation directory.

```text
src-electron/
```

is a reserved directory for future use.

It must not be used for active Electron implementation unless a future architecture decision explicitly requires it.

Until that decision is made, all active Electron code must be added to:

```text
src/electron/
```

---

### Create Documentation Structure

Verify all documentation exists.


```text

PROJECT_SPEC.md

SYSTEM_RULES.md

ARCHITECTURE.md

DATA_SCHEMA.md

...

```

---



### Create Root Files



```text

README.md

LICENSE

CONTRIBUTING.md

CODE_OF_CONDUCT.md

```



---



### Configure Tooling



```text

Git

Node.js

npm

```



---



### Validation



```text

Repository Created

Folder Structure Complete

Documentation Complete

```



---



# PHASE 1

# PROJECT BOOTSTRAP

Status: Completed

Date: 2026-10-14

Validation result (Windows 11):

- Application Starts: npm start opens the application window
- Electron Works: main process and preload bridge built by vite-plugin-electron (ADR-025)
- React Works: the React application is displayed in the window
- Build Successful: npm run build
- npm run typecheck: 0 errors
- npm run lint: 0 errors, 0 warnings

The functional roadmap phase 1 (GUI Foundation) also requires technical phases 2 and 3; its status is unchanged.

---

## Objectives

Create working application shell.

---

## Tasks

### Create React Application


Technology:


```text

React

TypeScript

Vite

```

---



### Configure TypeScript



Enable:



```text

Strict Mode

```



---



### Configure ESLint



---



### Configure Prettier



---



### Configure Electron

Create:

```text

src/electron/

main.ts

preload.ts

ipc/

```

---


### Validation

```text

Application Starts

Electron Works

React Works

Build Successful

```

The Electron communication structure must follow:

```text
Renderer
↓
IPC Layer
↓
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

---


# PHASE 2

# CORE DEPENDENCIES

Status: Completed

Date: 2026-10-14

Validation result (Windows 11):

- Three.js, Zustand, Zod: installed in Phase 1 (package.json)
- Tailwind CSS 4: the application window is styled
- Lucide React: icons displayed on the import buttons
- shadcn/ui: shadcn init (Base UI, style base-nova); Button component generated
- Build Successful: npm install and npm run dev succeed; npm run typecheck and npm run lint report 0 errors

---

## Objectives

Install and configure project dependencies.

---

## Install

```text

Three.js

Zustand

Zod

Tailwind CSS

shadcn/ui

Lucide React

```



---



## Validation



```text

Build Successful



Dependencies Working

```



---



# PHASE 3

# GUI FOUNDATION

Status: Completed

Date: 2026-10-15

Progress:

- Internationalization foundation (CHANGELOG 0.1.31): dictionaries en, fr, he with the same keys; I18nProvider and useTranslation; right-to-left direction for Hebrew; npm run check:locales
- Language persistence (CHANGELOG 0.1.32): the chosen language is saved in settings.json and restored at the next start
- Layout and theme (CHANGELOG 0.1.33): dark theme with the GUI_SPEC colors; Object Panel and Properties Panel resizable and collapsible; viewport placeholder; status bar; Hebrew font
- Menu Bar and Toolbar (CHANGELOG 0.1.34): the nine menus and the eleven toolbar buttons of GUI_SPEC.md; Language menu and File > Exit functional; other actions visible and disabled until their phase
- Right-to-left in the shadcn/ui components (CHANGELOG 0.1.35): logical classes (shadcn migrate rtl)

Validation result (Windows 11):

- Responsive Layout: the layout fits the window from the minimum size 1280x720; panel widths are kept and the viewport takes the remaining space when the window is resized; checked in Chromium at 1280x720, 1920x1080, 2560x1440 and 3840x2160 (no page scrolling, toolbar and status bar without overflow)
- Panels Resize: both separators resize the Object Panel and the Properties Panel; the panel buttons collapse and expand them; the panels swap sides in Hebrew
- Menus Functional: the nine menus open; Language changes the interface language (saved); File > Exit closes the window (npm run dev and npm start); the other items are disabled until their phase
- Localization: English, French and Hebrew (right-to-left), npm run check:locales passes; the language is restored at the next start
- npm run typecheck and npm run lint report 0 errors; npm run build succeeds

Not part of this phase (ROADMAP.md, Phase 1 - GUI Foundation): theme switching (light and system themes, Edit > Preferences) and the notification area (Notification Domain) come with the phases that provide them. The dark theme is applied by default.

Before Phase 5 (Model Import): KI-016 (allow list of IPC channels in preload.ts, unsubscribe for on()), resolved in 0.1.38.

---



## Objectives


Create the graphical interface.

No STL support.

No analysis.

No AI.

---


## Create

### Main Window


---


### Top Menu

The menus are those of GUI_SPEC.md (Menu Bar to Help Menu): nine menus.

```text

File

Edit

View

Printer

Material

Filament

Tools

Language

Help

```



---



### Toolbar

The buttons are those of GUI_SPEC.md (Toolbar Buttons): eleven buttons.

```text

Import

Save

Undo

Redo

Move

Rotate

Scale

Reset

Analyze

Optimize

Generate

```

Actions not available in Phase 3 are visible and disabled until the phase that provides them.


---


### Left Panel

Object List


---

### Center

Viewport Placeholder

---

### Right Panel

Properties

---

### Bottom

Status Bar

---

### Internationalization

Create:

src/i18n/

LanguageManager.ts

LocalizationService.ts

TranslationLoader.ts

public/locales/

en.json

fr.json

he.json

---

### Localization Requirements

All user-facing text must be externalized.

The GUI must not contain hardcoded user-facing text.

Supported initial languages:

```text
English
French
Hebrew
```

---

### Validation

```text

Responsive Layout

Panels Resize

Menus Functional

```

---

# PHASE 4

# 3D VIEWPORT

Status: Completed

Date: 2026-10-16

Progress:

- 3D viewport (CHANGELOG 0.1.36): coordinate system of ADR-028 (mm, Z up, origin at the center of the build plate); grid with adaptive spacing; axes X red, Y green, Z blue; build plate and build volume limits of the selected printer (none without a printer); camera controls of GUI_SPEC.md (wheel zoom, middle button pan, right button rotate); View menu: perspective and orthographic projections, the seven view presets (Top, Bottom, Front, Back, Left, Right, Isometric) and Reset View (Home key); the canvas follows the window and the side panels
- Bundle size warning limit (CHANGELOG 0.1.37): 1500 kB in vite.config.mts (Three.js in the renderer bundle)

Validation result (Windows 11):

- Viewport Functional: grid and axes displayed (X red, Y green, Z blue); View menu: the seven view presets, perspective and orthographic projections; Home resets the view; the viewport follows the window and the side panels (resized or collapsed) without distortion
- Smooth Navigation: wheel zoom, middle button pan and right button rotate are smooth
- npm run check:locales (225 keys), npm run typecheck and npm run lint report 0 errors; npm run build succeeds and npm start opens the application

The build plate is shown only with a selected printer (Phase 7 - Printer Database); it was checked in Chromium with a simulated 256 x 256 x 256 mm printer.

---

## Objectives

Create slicer-like workspace.

---

## Create

### Build Plate

---

### Grid

---

### Axis Display

```text

X

Y

Z

```

---

### Camera Controls


```text

Zoom

Pan

Rotate

```

---

### View Presets

```text

Top

Front

Right

Isometric

```



---



### Validation



```text

Viewport Functional

Smooth Navigation

```



---



# PHASE 5



# MODEL IMPORT



Status: Completed

Date: 2026-10-17

Decisions (ADR-029):

- Files read in the renderer (file dialog, drag and drop in the viewport), parsed in a Web Worker with visible progress
- Imported objects centered on the origin and placed at Z = 0
- Import Domain depends on Scene Domain, not the reverse
- Selection stored once, in the store of its domain (KI-014 resolved, CHANGELOG 0.1.41)
- Service Domain triggers the import (ImportService); Service Domain can depend on the Import Domain
- 3MF parsed with fflate and fast-xml-parser in the Web Worker; the objects of one 3MF file keep their layout (ADR-030)

Progress:

- STL import (CHANGELOG 0.1.42): File > Import STL, toolbar Import, drag and drop in the viewport; binary and ASCII STL parsed in a Web Worker with a progress bar; validation and error messages (STL_001 to STL_003); objects centered at Z = 0, shown in the viewport, the Object Panel and the status bar; duplicate names "cube (1)", "cube (2)"
- 3MF import (CHANGELOG 0.1.43): File > Import 3MF, toolbar Import and drag and drop; units, build item transforms, components, Production extension (Bambu Studio, OrcaSlicer); archive extraction limits; one object per build item, layout kept; error messages (MF_001 to MF_003)
- Import error codes (CHANGELOG 0.1.44): every refusal has a code of ERROR_CODES_SPEC.md (IMP_001, IMP_002, MF_004 added; STL_004 reserved); KI-018 resolved
- After the closure, from an external review (CHANGELOG 0.1.45): ZIP read from its central directory, decompression stopped at the declared size of each part (zip bomb with a lying header); Cancel button for each import

Validation result (Windows 11):

- Single Import: STL files (0.1.42) and the OrcaSlicer 3MF test file with its three objects (0.1.43) imported, centered on the build plate, in npm run dev and in the built application (npm run build, npm start)
- Multiple Imports: several STL files imported at once, one after the other (0.1.42)
- Error Handling: zip-bomb.3mf, bad-xml.3mf and not-zip.3mf refused with their translated message (too large, corrupted, not a valid 3MF file), in npm run dev and in the built application; a .txt file refused with "unsupported format" (0.1.44)
- 3MF test files: bambu-pa-line.3mf, layout.3mf and cube-inch.3mf imported as expected (0.1.44)
- npm run check:locales (240 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report 0 errors

Objects cannot be moved yet and overlap at the center: moving objects is Phase 6 - Transform System. Open issues of the import: KI-019 (several build plates of a Bambu Studio file), KI-020 (3MF object names and metadata not kept).

---



## Objectives



Import models.



---



## Create



### STL Import



---



### 3MF Import



---



### File Validation



---



### Scene Registration



---



### Validation



```text

Single Import



Multiple Imports



Error Handling

```



---



# PHASE 6



# TRANSFORM SYSTEM



Status: In Progress

Decisions (ADR-031, KI-017 resolved):

- Rotation in degrees, right-hand rule, around the plate axes X then Y then Z (Euler order "ZYX" of Three.js)
- Scale along the axes of the object, applied before the rotation
- Pivot and position: center of the object defined at import (center of its bounding box; amendment of ADR-031, DATA_SCHEMA.md 3.4.0; previously the center of the base)
- The object is placed back on the plate after each rotation or scale
- 3MF export transform defined in DATA_SCHEMA.md (Transform Rules)
- Transform section (GUI_SPEC.md): position X, Y editable, Z computed (the object always stands on the plate); scale in % with a lock, size in mm linked to the scale; gizmo rotation free, by 15 degrees with Shift
- Order of the lots: Transform section of the Properties Panel, then gizmos and shortcuts G, R, S, then undo and redo; every change of transform goes through TransformService
- Viewport (lot 46): an object is moved by dragging it, after a threshold of a few pixels so that a selection click never moves it; Move gizmo by default; selection by click, and only a real click (no drag) in the empty space clears the selection
- Lot 47: the lock of the scale acts the same in the panel and on the Scale gizmo; buttons Move, Rotate, Scale over the viewport; Scale gizmo with one handle per axis (X right, Y front, Z top) and the center handle; Transform section rows by mode (Move: Position, Scale; Rotate: Rotation; Scale: Scale, Size), with the actions of the mode
- Lot 48: position = center of the object (option B); gizmo rotation free during the gesture, object placed back on the plate on release (only Z changes); mode buttons only over the viewport, active only with a selection; no object under the plate (sunk objects: KI-021)

Progress:

- Transform foundation (CHANGELOG 0.1.47): src/scene/ObjectTransform.ts (matrix, placement on the plate, 3MF export transform); the viewport applies rotation and scale; unit tests with Vitest (npm test)
- Transform section of the Properties Panel (CHANGELOG 0.1.48): position, rotation, scale, size; Reset Position, Reset Rotation, Reset Scale, Center On Bed; TransformService
- Gizmos and selection in the viewport (CHANGELOG 0.1.49): click to select, drag on the plate, Move, Rotate and Scale gizmos, shortcuts G, R, S and ESC, toolbar Move, Rotate, Scale, Edit > Deselect All
- Corrections after the tests of Noam (CHANGELOG 0.1.50): lock on the Scale gizmo, mode buttons over the viewport, three scale handles, Transform section by mode
- Rotation around the center (CHANGELOG 0.1.51): local origin at the center of the object, free rotation during the gesture and placement on release; mode buttons only over the viewport, grayed out without selection; sunk objects for later (KI-021)

---



## Objectives



Manipulate models.



---



## Create

### Undo System

### Redo System

### History Stack

### Transaction System

### Move



```text

X

Y

Z

```



---



### Rotate


```text

X

Y

Z

```

---

### Scale


```text

Uniform

Independent

```

---

### Reset

---

### Validation

Undo Works

Redo Works

Multi-Step History Works

```text

Accurate Transforms

Multiple Objects Supported

```

---

# PHASE 7

# PRINTER DATABASE

---

## Objectives

Manage printers.

---

## Create

### Printer Database

---

### Printer Selection

---



### Build Plate Generation



---



### GitHub Repository Support

Repository Layer Responsibilities:

- Load local profiles
- Save local profiles
- Validate profile data
- Expose repository operations to Services

RepositorySync Responsibilities:

- Synchronize external profile sources
- Download remote profile data
- Validate remote data
- Track synchronization status
- Handle remote source failures
- Prevent direct GUI access to remote sources

Remote Source Rule:

```text
Repositories
↓
RepositorySync
↓
Remote Sources
```

---



### Validation



```text

Printer Loads

Plate Updates

```


---

# PHASE 8

# MATERIAL DATABASE



---



## Objectives



Manage materials.



---



## Create

### Filament Profiles

### Manufacturer Filaments

### Material Database



---



### Material Profiles



---



### Material Selection



---


### Validation

```text

Material Loads

Profiles Valid

Filament Profiles Valid

```



---



# PHASE 9



# MODEL ANALYSIS

### Object Classification

### Category Detection

### Confidence Score



---



## Objectives



Analyze geometry.



---



## Create



### Dimensions



---



### Bounding Box



---



### Volume



---



### Surface Area



---



### Overhang Detection



---



### Bridge Detection



---



### Stability Detection



---



### Validation



```text

Accurate Results



Repeatable Results

```



---



# PHASE 10



# AI RECOMMENDATION ENGINE



---



## Objectives



Create intelligent recommendations.



---



## Inputs



```text

Inputs

Printer

Material

Filament

Geometry Analysis

Object Classification

```



---



## Outputs



```text

Layer Height

Supports

Speed

Cooling

Retraction

Warnings

Print Preset

Support Strategy

Confidence Score

```



---



### Validation



```text

Recommendations Respect Limits



Warnings Produced

```



---



# PHASE 11

# OPTIMIZATION ENGINE

---

## Objectives

Optimize settings.

---

## Create

### Orientation Search


---

### Time Optimization

---

### Material Optimization

---

### Support Optimization

---

### Validation

```text

Printability Improves

Reliability Maintained

```
---

# PHASE 12

# COST ESTIMATION



---



## Objectives



Estimate printing resources.



---



## Create



### Filament Usage



---



### Material Weight



---



### Material Cost



---



### Electricity Cost



---



### Print Duration



---



### Validation



```text

Values Consistent

```

---

# PHASE 13

# PROJECT PERSISTENCE

## Objectives

Implement the native WYPROJ project lifecycle.

## Required Modules

```text
src/project/

ProjectManager.ts

ProjectSerializer.ts

ProjectDeserializer.ts

ProjectValidator.ts

WYPROJImporter.ts

WYPROJExporter.ts
```

Project can be created.

Project can be serialized.

Project can be deserialized.

Invalid projects are rejected.

Unsupported project versions are detected.

Project data remains language-neutral.

Existing project data remains backward compatible.

---

# PHASE 14

# TARGET SLICER EXPORT

## Objectives

Export the model and its generated print settings to the target slicer selected by the user.

Reference: SLICER_EXPORT_SPEC.md

## Required Modules (planned)

```text
src/services/SlicerExportService.ts

src/slicer_export/

SlicerExportManager.ts

SettingsMapper.ts

ExportValidator.ts

ExportReportBuilder.ts

BambuFamilyExporter.ts

PrusaFamilyExporter.ts

CuraFamilyExporter.ts

src/schemas/SlicerMappingSchema.ts

src/types/SlicerExport.ts

data/templates/
```

## Prerequisites

Every mapping entry used is Verified (SLICER_EXPORT_SPEC.md, Rule V1).

The data model extensions listed in SLICER_EXPORT_SPEC.md are documented and implemented.

## Validation

Exported files open without error in each supported slicer.

Every exported setting has the expected value in the target slicer.

Unsupported settings are reported in the export report.

---

# PHASE 15

# ADVANCED FEATURES

---

## Future

### G-Code Engine

### Multi Material

### Remote Printers

### Cloud

### Plugins

### Plugin Marketplace

### Machine Learning

### Webcam Monitoring

### Community Profiles

### Filament Tracking

### Vision Classification

### Preset Marketplace

---

# PHASE 16

# PRODUCTION VALIDATION AND RELEASE

---

# Implementation Plan Change Rules

Before modifying this plan:

1. Identify impacted phases

2. Identify impacted documentation

3. Identify impacted domains

4. Verify dependencies

5. Perform impact analysis

6. Update ROADMAP.md if required

7. Update CHANGELOG.md

8. Validate consistency

9. Validate governance requirements

---

# IMPLEMENTATION ORDER GUARANTEE

Phases must be implemented sequentially.

A phase may only begin when:

- Development Complete
- Validation Complete
- Tests Passing
- Previous Phase Stable

---

# DEVELOPMENT RULE


Before starting a phase:


```text

Previous Phase Must Be Stable

```

---

# FORBIDDEN

Do NOT:

```text

Jump Directly To AI

Jump Directly To G-Code

Skip Validation

Skip Testing

```

---

# Implementation Governance Validation

Before approving implementation plan changes:

Verify:

- Ownership respected

- Dependencies validated

- Documentation updated

- Impact analysis completed

- Roadmap consistency maintained

- Governance requirements satisfied

Reference:

CHANGE_VERIFICATION_CHECKLIST.md

---

# GOLDEN RULE


Build the foundation first.

Build intelligence second.

Build automation last.

---

# End Of Document
