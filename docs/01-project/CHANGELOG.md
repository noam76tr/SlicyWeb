# SlicyWeb SMART SLICER

# CHANGELOG

Version: 2.0.0

Status: Approved

Priority: Medium

This file records all significant changes made to the project.

---

The purpose of this document is to:


- Track project evolution

- Maintain development history

- Improve debugging

- Improve maintainability

- Track architectural decisions

- Document breaking changes

- Document migrations

- Reduce regression risks


---


# CHANGELOG FORMAT

Project follows:

Semantic Versioning


Format:

MAJOR.MINOR.PATCH


Example:

1.0.0


Where:

MAJOR = Breaking Changes

MINOR = New Features

PATCH = Fixes


---


# RELEASE STATUS DEFINITIONS

## Planned

Feature not started.


---


## In Progress


Feature being developed.


---



## Completed

Feature validated and approved.

---

## Deprecated

Feature scheduled for removal.

---


## Removed

Feature no longer supported.

---

# VERSION 0.1.0

Release Type: Foundation Release

Status: Completed

Date: 2026-10-14 (formal closure of Phase 0)

---


## Added

Project Documentation

- PROJECT_SPEC.md
- PROJECT_DESCRIPTION.md
- ARCHITECTURE.md
- DATA_SCHEMA.md
- FILE_STRUCTURE.md
- PROJECT_DOCUMENTATION_INDEX.md
- AI_START_HERE.md
- AI_DEVELOPMENT_PROTOCOL.md
- API_SPEC.md
- ROADMAP.md
- CHANGELOG.md
- DEVELOPMENT_RULES.md
- SYSTEM_RULES.md
- GUI_SPEC.md

---


## Added


Initial Project Structure

```text

data/
docs/
src/
src-electron/
tests/
assets/
cache/
logs/
scripts/
plugins/
public/
releases/
.github/

```


---


## Added


Architecture Definition


---


## Added


Development Rules


---


## Added


Versioning Rules


---


## Added


Data Schema Specification


---

# VERSION 0.1.1

Release Type:

Documentation Governance Update

Status: Completed

Date: TBD

---

## Added

Governance Framework

AI Governance Layer

Impact Analysis Layer

Domain Governance Layer

Ownership Management Layer

Documentation Governance Layer

Update Governance Layer

Bug Analysis Framework

Architecture Governance Framework

---

## Added Documents

- CLAUDE.md
- CLAUDE_GOVERNANCE_PROTOCOL.md
- CLAUDE_READING_PRIORITY.md
- CLAUDE_CHANGE_IMPACT_RULES.md
- CLAUDE_FILE_UPDATE_RULES.md

- DOMAIN_BOUNDARIES.md
- DOMAINS_DEPENDENCY_MATRIX.md
- FILE_OWNERSHIP_MATRIX.md
- PROJECT_IMPACT_MATRIX.md

- CROSS_DOCUMENT_DEPENDENCIES.md
- DOCUMENT_UPDATE_MATRIX.md

- CHANGE_CLASSIFICATION_RULES.md
- CHANGE_VERIFICATION_CHECKLIST.md

- BUG_ANALYSIS_PROTOCOL.md

- UPDATE_GOVERNANCE_PROTOCOL.md
- UPDATE_IMPACT_RULES.md
- UPDATE_REPORT_TEMPLATE.md

- DIRECTORY_PURPOSES.md
---

## Documentation Updated

- AI_START_HERE.md
- PROJECT_DOCUMENTATION_INDEX.md
- FILE_STRUCTURE.md
- DIRECTORY_PURPOSES.md
- README.md
- ARCHITECTURE.md
- PROJECT_SPEC.md
- PROJECT_DESCRIPTION.md
- CHANGELOG.md
- FILE_OWNERSHIP_MATRIX.md

- SlicyWeb files explication.txt

---

## Purpose

Establish a complete governance framework for:

- Architecture Protection

- Dependency Governance

- Ownership Management

- Documentation Governance

- Impact Analysis

- Change Verification

- Update Governance

- AI-Assisted Development

---

## Validation Result

Governance Layer Complete

Documentation Synchronized

Ready For AI Assisted Development

---

# VERSION 0.1.2

Release Type:
Architecture & Internationalization Update

Status:
Completed

Date:
TBD

---

## Added

Project Management Domain

Internationalization Domain

WYPROJ Project System

ProjectManager
ProjectSerializer
ProjectDeserializer
ProjectValidator
WYPROJImporter
WYPROJExporter

LanguageManager
LocalizationService
TranslationLoader

English Localization
French Localization
Hebrew Localization

---

## Documentation Updated

ARCHITECTURE.md

DATA_SCHEMA.md

IMPORT_EXPORT_SPEC.md

TECHNICAL_OVERVIEW.md

GUI_SPEC.md

DOMAIN_BOUNDARIES.md

PROJECT_IMPACT_MATRIX.md

---

## Result

Project Persistence Layer Defined

Internationalization Layer Defined

WYPROJ Format Standardized

Documentation Synchronized

---

# VERSION 0.1.3

Release Type:
Scope And Documentation Update

Status:
Completed

Date:
2026-10-06

## Changed

- PROJECT_SPEC.md 2.1.0: target slicer export added to the project scope
- DIRECTORY_PURPOSES.md 2.1.0: uniform format and role of every source file
- DECISIONS.md: ADR-024 Target Slicer Export
- IMPORT_EXPORT_SPEC.md 2.1.0: target slicer export formats

## Removed

- DIRECTORY_PRUPOSES-old.md

## Fixed

- FilamentManager.ts: duplicate removeFilament replaced by addFilament
- PrinterRepositorySync.ts: reference to missing REPOSITORY_SPEC.md removed
- WYPROJExporter.ts: missing ProjectMetadata import and metadata field
- .gitignore: folder replaced by a root file (node_modules/, dist/, .env, *.log)
- DIRECTORY_PURPOSES.md: missing governance files and public/locales/ section added

---

# VERSION 0.1.4

Release Type:
Documentation Update

Status:
Completed

Date:
2026-10-08

## Added

- SLICER_EXPORT_SPEC.md 1.0.0 (Draft): target slicer export specification
- DIRECTORY_PURPOSES.md: data/cache/ and data/templates/ sections

## Changed

- CLAUDE_DOCUMENT_READING_ORDER.md: single official AI reading sequence, small change reading path, slicer export tasks
- CLAUDE_DOCUMENT_READING_ORDER.md: SlicyWeb files explication.txt removed from the AI reading sequence (personal reference file)
- AI_START_HERE.md, API_START_HERE.md, PROJECT_DOCUMENTATION_INDEX.md: authority hierarchy refers to CLAUDE_READING_PRIORITY.md
- CLAUDE_PROJECT_CONTEXT.md, AI_START_HERE.md: target slicer export scope
- FILE_STRUCTURE.md: config, events and storage sections, planned items list, undo_redo/ removed from future modules
- Project name unified to SlicyWeb in all documents

---

# VERSION 0.1.5

Release Type:
Roadmap Update

Status:
Completed

Date:
2026-10-09

## Changed

- ROADMAP.md 2.1.0: new Phase 12 - Target Slicer Export; Advanced Features becomes Phase 13; Production Release becomes Phase 14
- PHASES_IMPLEMENTATION_PLAN.md 2.1.0: new technical Phase 14 - Target Slicer Export; Advanced Features becomes Phase 15; Production Validation and Release becomes Phase 16
- PHASES_IMPLEMENTATION_PLAN.md: Phase 12 (Cost Estimation) section placed before Phase 13 (Project Persistence)

## Fixed

- Escaped Markdown characters removed from documentation files

---

# VERSION 0.1.6

Release Type:
Schema Update

Status:
Completed

Date:
2026-10-09

## Added

- DECISIONS.md: ADR-026 Object-Scoped Analysis And Recommendations
- ARCHITECTURE_DECISION_MATRIX.md 2.1.0: ADM-021 (reference to ADR-026)
- DATA_SCHEMA.md: Object Reference Rules (removal, duplication, transformation)

## Changed

- DATA_SCHEMA.md 2.1.0: analysisId, objectId and status added to the Complete Analysis Schema; objectId added to the Recommendation Schema; status values defined (generated, outdated); analysis and recommendations indexed by objectId in the Project Schema
- API_SPEC.md 2.1.0: Analysis Result gains analysisId, objectId and status; Generate Recommendation returns one recommendation per objectId
- Note: the DATA_SCHEMA.md changes are additive. The Generate Recommendation response change in API_SPEC.md is non-additive (recommendation becomes recommendations, indexed by objectId); the API is not implemented yet, no migration required
- IMPORT_EXPORT_SPEC.md 2.2.0: Project Schema aligned with DATA_SCHEMA.md (WYPROJ format unchanged, 2.0.0)

## Fixed

- Source file headers: "Based on" references to missing documents (STARTUP_SPEC, CONFIG_SPEC, EVENT_SPEC, SCENE_SPEC, OBJECT_MANAGEMENT_SPEC, UTILS_SPEC, I18N_SPEC) replaced by existing documents (20 files)

---

# VERSION 0.1.7

Release Type:
Schema Implementation

Status:
Completed

Date:
2026-10-12

## Added

- src/schemas/ProjectSchema.ts: Zod runtime validation for the Project Schema and the Project File Schema (DATA_SCHEMA.md 2.1.0), including Object Reference Rules 3 to 5 (ADR-026)

## Changed

- FILE_STRUCTURE.md: ProjectSchema.ts added to the Schemas section
- DIRECTORY_PURPOSES.md: ProjectSchema.ts added to src/schemas/

## Fixed

- src/electron/ipc/ProjectIPC.ts: missing module ../../schemas/ProjectSchema (blocked the Electron main process build)

---

# VERSION 0.1.8

Release Type:
Schema Update

Status:
Completed

Date:
2026-10-12

## Added

- DATA_SCHEMA.md: Selection Fields in the Project Schema and in the Scene Schema (printer, material, filament and preset are null while no selection has been made)
- DATA_SCHEMA.md: Known Duplication note (the four selections exist in both the Project Schema and the Scene Schema; source of truth to be defined in a later change)

## Changed

- DATA_SCHEMA.md 2.2.0 (additive; WYPROJ format unchanged, 2.0.0)
- src/schemas/ProjectSchema.ts: preset, printer, material and filament accept null

---

# VERSION 0.1.9

Release Type:
Type Alignment

Status:
Completed

Date:
2026-10-12

## Changed

- src/types/Project.ts: Project aligned with the Project Schema of DATA_SCHEMA.md 2.2.0 (projectId, projectName, projectFormat, createdAt, updatedAt, version, scene, settings, analysis and recommendations indexed by objectId, nullable preset, printer, material and filament)
- src/types/Project.ts: unused ProjectMetadata removed (not part of the Project Schema)
- src/services/ProjectService.ts: createProject sets projectFormat, analysis, and printer, material and filament to null

## Fixed

- TypeScript errors on the Project type in ProjectService.ts, RecoveryValidator.ts and SessionRestorer.ts (10 errors)

---

# VERSION 0.1.10

Release Type:
Project Format Implementation

Status:
Completed

Date:
2026-10-12

## Changed

- src/project/: ProjectState and ProjectMetadata replaced by the Project type (DATA_SCHEMA.md 2.2.0) in ProjectManager, ProjectSerializer, ProjectDeserializer, ProjectValidator, WYPROJImporter and WYPROJExporter
- src/project/ProjectValidator.ts: validation delegated to ProjectSchema (Project Schema and Object Reference Rules 3 to 5)
- src/project/WYPROJExporter.ts: the file metadata contains application only (IMPORT_EXPORT_SPEC.md); project identity, version and dates stay in the project
- src/services/ProjectService.ts: serialization and deserialization delegated to the Project layer (ProjectSerializer, ProjectDeserializer, ProjectValidator)

## Fixed

- WYPROJ files were read and written in the former structure (metadata, printers, materials, filaments, presets, analysis and recommendations as arrays)
- src/project/WYPROJExporter.ts: the file name is based on projectName instead of the application name; letters of every language are kept
- src/services/ProjectService.ts: new projects are created with version 2.0.0 (WYPROJ format version) instead of 1.0.0

---

# VERSION 0.1.11

Release Type:
Bug Fix

Status:
Completed

Date:
2026-10-12

## Fixed

- src/project/WYPROJExporter.ts: file name keeps accents and vowel marks (Unicode normalization NFC, combining marks kept)
- src/project/WYPROJExporter.ts: Windows reserved names (CON, PRN, AUX, NUL, COM1 to COM9, LPT1 to LPT9) are prefixed with "_"
- src/project/WYPROJExporter.ts: file name limited to 60 characters before the extension

---

# VERSION 0.1.12

Release Type:
Refactor

Status:
Completed

Date:
2026-10-13

## Changed

- src/services/ProjectService.ts: createProject delegated to ProjectManager.createProject; ProjectManager is the only project creator (CLAUDE.md, Project Management Rule)

## Removed

- src/services/ProjectService.ts: duplicate construction of the Project object

---

# VERSION 0.1.13

Release Type:
Schema Implementation

Status:
Completed

Date:
2026-10-13

## Added

- src/types/Analysis.ts: analysisId, objectId and status (Complete Analysis Schema, ADR-026); ResultStatus type (generated, outdated)
- src/types/Recommendation.ts: recommendationId, objectId, analysisId and status (Recommendation Schema, ADR-026)
- src/schemas/AnalysisSchema.ts: analysisId, objectId and status
- src/schemas/RecommendationSchema.ts: recommendationId, objectId, analysisId and status

## Changed

- src/recommendation_engine/RecommendationBuilder.ts: the recommendation references the object and the analysis it is built from (Object Reference Rules 2 and 5); status is generated
- src/recommendation_engine/RecommendationEngine.ts: the analysis is passed to RecommendationBuilder
- src/state/analysisStore.ts: one analysis per object, indexed by objectId; removal (Object Reference Rule 6) and outdated status (Object Reference Rule 8)
- src/state/recommendationStore.ts: one recommendation per object, indexed by objectId; removal (Object Reference Rule 6) and outdated status (Object Reference Rules 8 and 9)

## Fixed

- Projects containing analyses or recommendations were rejected at load: the entries had no analysisId, objectId or status

---

# VERSION 0.1.14

Release Type:
Documentation

Status:
Completed

Date:
2026-10-13

## Added

- CHANGELOG.md: KNOWN ISSUES section (KI-001 to KI-004), inconsistencies left after 0.1.13 (ADR-026)

---

# VERSION 0.1.15

Release Type:
Architecture Decision

Status:
Completed

Date:
2026-10-13

## Added

- DECISIONS.md: ADR-025 Build Tooling And Library Versions (Vite with vite-plugin-electron, React 18, Zod 3.25.x from Phase 1)
- ARCHITECTURE_DECISION_MATRIX.md 2.2.0: ADM-022 (reference to ADR-025)

## Changed

- TECH_STACK.md 2.1.0: React version 18 instead of "Latest Stable"; Zod version 3.25.x; Vite builds the Electron main process and the preload bridge through vite-plugin-electron; renderer entry index.html and src/gui/main.tsx
- FILE_STRUCTURE.md: index.html added to the root structure and to the planned root files (Phase 1)

---

# VERSION 0.1.16

Release Type:
Project Bootstrap

Status:
Completed

Date:
2026-10-13

## Added

- package.json: dependencies, versions and scripts (dev, build, start, typecheck, lint, format, format:check)
- tsconfig.json: TypeScript strict mode
- vite.config.ts: renderer build (dist/renderer/), Electron main process and preload bridge build (dist/electron/) with vite-plugin-electron
- index.html and src/gui/main.tsx: renderer entry point
- eslint.config.js and prettier.config.js
- .env.example: no environment variable required
- README.md: Development section (requirements and commands)
- CONTRIBUTING.md: check commands in Coding Standards
- DIRECTORY_PURPOSES.md: Root Configuration Files; src/gui/main.tsx

## Changed

- DECISIONS.md: ADR-025 defines the Electron version (major version 44)
- ARCHITECTURE_DECISION_MATRIX.md: ADM-022 includes the Electron version
- TECH_STACK.md: Electron version 44
- FILE_STRUCTURE.md: created root files removed from Planned Items; src/gui/main.tsx added to the GUI Layer

## Validation Result

- Phase 1 validation on Windows 11 (2026-10-14): npm install, npm run build, npm run dev and npm start succeed; the application window opens and displays the React application (Application Starts, Electron Works, React Works, Build Successful)
- Phase 1 closed in 0.1.22, after KI-005 was resolved (0.1.21)

---

# VERSION 0.1.17

Release Type:
Bug Fix

Status:
Completed

Date:
2026-10-13

## Fixed

- prettier.config.js: endOfLine "auto" instead of "lf"; with Git for Windows (core.autocrlf), files checked out with CRLF were reported by format:check
- .env.example: file missing from the repository (not uploaded with 0.1.16)

## Added

- README.md: Windows note (npm.cmd when PowerShell blocks npm.ps1)

---

# VERSION 0.1.18

Release Type:
Tooling

Status:
Completed

Date:
2026-10-13

## Changed

- vite.config.ts renamed to vite.config.mts: the configuration is loaded as an ES module; Vite no longer reports "ESM syntax in a file loaded as CommonJS". package.json stays without "type": "module" (ADR-025)
- package.json (lint, format, format:check), tsconfig.json, FILE_STRUCTURE.md and DIRECTORY_PURPOSES.md: vite.config.mts

## Added

- KNOWN ISSUES: KI-005 (10 TypeScript errors, 5 ESLint errors, decisions for MaterialOptimizer and ProjectDeserializer)

---

# VERSION 0.1.19

Release Type:
Schema Implementation

Status:
Completed

Date:
2026-10-13

## Changed

- src/types/Recommendation.ts: Recommendation aligned with the Recommendation Schema (DATA_SCHEMA.md): printerId, materialId, filamentId, classification, preset and createdAt added; printPreset and optimization removed
- src/schemas/RecommendationSchema.ts: same fields; preset validated with PresetSchema (object) instead of a string; classification validated with AnalysisClassificationSchema
- src/schemas/AnalysisSchema.ts: classification schema extracted as AnalysisClassificationSchema (content unchanged)
- src/recommendation_engine/RecommendationBuilder.ts, RecommendationEngine.ts and src/services/RecommendationService.ts: the printer, material and filament identifiers are inputs of the generation (API_SPEC.md, Generate Recommendation input)
- src/gui/panels/RecommendationPanel.tsx: displays the preset name; the optimization result is an optional separate property (Optimization Result Schema)

## Fixed

- KI-001 and KI-002 resolved
- TypeScript error in RecommendationPanel.tsx:56 (PrintPreset displayed as a React node)

## Added

- KNOWN ISSUES: KI-006 (sub-types of the Recommendation) and KI-007 (API_SPEC.md Generate Recommendation response)

---

# VERSION 0.1.20

Release Type:
Schema Update

Status:
Completed

Date:
2026-10-14

## Changed

- DATA_SCHEMA.md 2.3.0: Recommended Profile Schema gains infillDensity and infillPattern at the profile level (not in quality); Export Values rule: the target slicer export uses the recommended profile values, never preset.settings
- src/recommendation_engine/DecisionEngine.ts: generate receives the selected print preset instead of building an empty preset
- src/recommendation_engine/RecommendationEngine.ts and src/services/RecommendationService.ts: the available presets are an input; the preset is selected with DecisionEngine.selectPreset; generation fails when no preset is available

## Fixed

- Recommendations generated with an empty preset failed RecommendationSchema (KI-006)
- CHANGELOG 0.1.16: status Completed (Phase 1 validation on Windows 11)

---

# VERSION 0.1.21

Release Type:
Bug Fix

Status:
Completed

Date:
2026-10-14

## Fixed

- src/classification_engine/ClassificationEngine.ts: ConfidenceScorer.calculate called as a static method
- src/classification_engine/ConfidenceScorer.ts: an unknown category gives a confidence score of 0, as in src/optimization_engine/ConfidenceScorer.ts; category typed as ClassificationCategory
- src/cost_engine/CostCalculator.ts: calculate returns the Cost Estimation Schema only; printTime and layerCount belong to the Print Estimation Schema (DATA_SCHEMA.md)
- src/i18n/LocalizationService.ts: TranslationLoader.load called as a static method; unused constructor dependency removed
- src/notifications/NotificationFactory.ts: create accepts a NotificationType
- src/optimization_engine/ClassificationEngine.ts: ClassificationValidator used as an instance
- src/optimization_engine/OptimizationEngine.ts: optimize receives the recommended profile; materialReduction is the percentage computed by MaterialOptimizer.optimizeInfillDensity and estimateMaterialReduction
- src/optimization_engine/MaterialOptimizer.ts: material parameter removed from optimize (no documented rule uses the material for infill; validateMaterialSettings keeps it)
- src/preset_engine/PresetManager.ts: uses PresetRepository.save and count
- src/project/ProjectDeserializer.ts: the rethrown error keeps the parse error as cause
- src/electron/ipc/ProjectIPC.ts and src/scene/SceneManager.ts: unused imports removed
- KI-005 resolved

## Validation Result

- npm run typecheck and npm run lint on Windows 11 (2026-10-14): 0 errors

---

# VERSION 0.1.22

Release Type:
Phase Closure

Status:
Completed

Date:
2026-10-14

## Completed

- Technical Phase 1 - Project Bootstrap (PHASES_IMPLEMENTATION_PLAN.md): Application Starts, Electron Works, React Works, Build Successful; npm run typecheck and npm run lint report 0 errors on Windows 11

## Changed

- PHASES_IMPLEMENTATION_PLAN.md: Phase 1 status Completed, with the validation result
- README.md: Current Status

---

# VERSION 0.1.23

Release Type:
Schema Update

Status:
Completed

Date:
2026-10-14

## Completed

- Phase 0 - Foundation closed: PHASES_IMPLEMENTATION_PLAN.md Phase 0 status Completed with its validation result; CHANGELOG 0.1.0 status Completed

## Changed

- DATA_SCHEMA.md 3.0.0 (breaking: allowed category values changed): Classification Categories with the 15 categories of OBJECT_CLASSIFICATION_SPEC.md and their stored values; Print Preset Categories with the 12 categories of PRINT_PRESETS_SPEC.md and their stored values; Category Value Format (lowercase snake_case); Print Preset Schema gains confidenceScore; Object Classification Schema notes (classificationVersion, confidence level not stored)
- PRINT_PRESETS_SPEC.md 1.1.0: Classification To Preset Mapping (15 categories), Default Preset (Balanced), Preset Selection Warnings (CLASSIFICATION_UNCERTAIN, EXPECTED_PRESET_UNAVAILABLE), Recommended Profile Initialization; "Brackets" removed from the intended objects of the Functional preset; Example Mapping replaced by the mapping table
- OBJECT_CLASSIFICATION_SPEC.md 1.1.0: Print Preset Influence refers to the mapping of PRINT_PRESETS_SPEC.md; Unknown Object Strategy also applies to the Unknown confidence level
- src/types/Classification.ts: Classification follows the Object Classification Schema (subcategory, detectedTags, classificationVersion added; confidenceLevel and validated removed); ConfidenceLevel gains very_high; ClassificationCategory derived from CLASSIFICATION_CATEGORIES
- src/types/PrintPreset.ts: PresetCategory derived from PRESET_CATEGORIES (12 categories)
- src/types/Recommendation.ts and src/schemas/RecommendationSchema.ts: RecommendedProfile.printPreset renamed preset; RecommendedProfileSchema validates preset
- src/schemas/AnalysisSchema.ts: AnalysisClassificationSchema validates the whole Object Classification Schema
- src/schemas/PrintPresetSchema.ts: category, supportType and adhesionType validated against their allowed values; confidenceScore validated
- src/constants/AnalysisConstants.ts: CLASSIFICATION_CATEGORIES and CLASSIFICATION_VERSION
- src/constants/PresetConstants.ts: PRESET_CATEGORIES (12), DEFAULT_PRESET_CATEGORY, CLASSIFICATION_PRESET_CATEGORIES
- src/classification_engine and src/optimization_engine (ClassificationEngine, ConfidenceScorer, ClassificationValidator, CategoryDetector): Classification output aligned; confidence levels computed with CONFIDENCE_LEVELS (40, 60, 75, 90); structural_component renamed structural_part; the features "functional" and "engineering" give functional_part
- src/preset_engine/PresetSelector.ts: uses the mapping table
- src/recommendation_engine/DecisionEngine.ts: the profile is initialized from preset.settings, then adjusted (supports when overhangs are detected); the preset is selected with the mapping table and the default preset rules; the first preset of the list is never used as a fallback
- src/recommendation_engine/RecommendationEngine.ts: the preset selection warnings are added to the recommendation warnings; REC_002 when no Balanced preset is available
- src/services/AnalysisService.ts: getConfidenceLevel
- src/gui/panels/AnalysisPanel.tsx: the confidence level is an optional property

## Removed

- ClassificationValidator: validateState (classification_engine), validateConsistency and validateComplete (optimization_engine); no code used the validated field to make a decision

## Fixed

- KI-006 resolved

## Added

- KNOWN ISSUES: KI-008 (printer and material limits not applied to the recommended profile)

---

# VERSION 0.1.24

Release Type:
Project Format Update

Status:
Completed

Date:
2026-10-14

## Changed

- WYPROJ format version 3.0.0 (ADR-027): DATA_SCHEMA.md Project File Schema (WYPROJ Version Rule), IMPORT_EXPORT_SPEC.md 3.0.0 (Project Schema example, Compatibility Policy exception), PROJECT_SPEC.md (container example)
- src/constants/ApplicationConstants.ts: WYPROJ_FORMAT_VERSION 3.0.0 (moved from src/project/ProjectManager.ts, which re-exports it)
- src/project/ProjectValidator.ts: validateFormatVersion; a project of another version, or without a version, is refused with PROJ_003 Project Version Mismatch and a message giving the found and supported versions
- src/project/WYPROJImporter.ts: the version of the file container is checked before the project is read
- TERMINOLOGY.md: Quality Preset renamed High Quality Preset; reference to the preset categories of PRINT_PRESETS_SPEC.md
- DIRECTORY_PURPOSES.md: data/presets/ examples use the preset categories of PRINT_PRESETS_SPEC.md

## Added

- DECISIONS.md: ADR-027 WYPROJ Format Version 3.0.0
- ARCHITECTURE_DECISION_MATRIX.md 2.3.0: ADM-023 (reference to ADR-027)
- KNOWN ISSUES: KI-009 (fixed speeds above the preset print speed), KI-010 (recommendation confidence ignores the classification confidence), KI-011 (ClassificationValidator not called; confidence level not displayed), KI-012 (supports.type value table per target slicer)

## Breaking Changes

- WYPROJ 2.0.0 files are refused at load. No migration: no 2.0.0 file was distributed.

---

# VERSION 0.1.25

Release Type:
Validation Update

Status:
Completed

Date:
2026-10-14

## Changed

- src/schemas/ProjectSchema.ts: analysis and recommendation entries are validated in full with AnalysisSchema and RecommendationSchema at project load (previously reference fields only); Object Reference Rules 3 to 5 unchanged
- src/schemas/AnalysisSchema.ts: ResultStatusSchema defined here (removes the import cycle with ProjectSchema); ProjectSchema re-exports it
- src/schemas/RecommendationSchema.ts: imports ResultStatusSchema from AnalysisSchema

## Removed

- src/schemas/ProjectSchema.ts: AnalysisEntryReferenceSchema and RecommendationEntryReferenceSchema (replaced by the full schemas; not used elsewhere)

## Fixed

- KI-003 resolved

---

# VERSION 0.1.26

Release Type:
Feature Implementation

Status:
Completed

Date:
2026-10-14

## Added

- src/project/ProjectManager.ts: Object Reference Rules 6 to 9 (ADR-026) on the project: removeObject (rule 6), duplicateObject (rule 7), updateObjectTransform (rule 8), setObjectAnalysis (rule 9, recomputed analysis keeps its analysisId), markAnalysisOutdated (rules 8 and 9)
- src/transform/TransformValidator.ts: changesOrientation (rule 8: rotation or scale changed; position alone does not count)
- src/state/objectStore.ts: removeObject removes the analysis and the recommendation of the object (rule 6); updateObjectTransform (rule 8)

## Changed

- src/state/analysisStore.ts: setAnalysis keeps the analysisId of the object and makes its recommendation outdated; markAnalysisOutdated also makes the recommendation outdated (rule 9, link between the two stores)
- DATA_SCHEMA.md 3.1.0: Object Reference Rule 9 states that a recomputed analysis keeps the analysisId of the object (rule 5)

## Fixed

- KI-004 resolved

---

# VERSION 0.1.27

Release Type:
Bug Fix

Status:
Completed

Date:
2026-10-14

## Fixed

- src/recommendation_engine/DecisionEngine.ts: the outer wall, inner wall and infill speeds of the recommended profile are limited to preset.settings.printSpeed; the travel speed is unchanged
- PRINT_PRESETS_SPEC.md 1.2.0: Recommended Profile Initialization states the speed limit
- KI-009 resolved

---

# VERSION 0.1.28

Release Type:
Core Dependencies

Status:
Completed

Date:
2026-10-14

## Added

- Technical Phase 2 - Core Dependencies: Three.js, Zustand and Zod were already installed (0.1.16); Tailwind CSS 4 (tailwindcss, @tailwindcss/vite) and Lucide React (lucide-react) added
- src/gui/styles/global.css: Tailwind CSS 4 entry point, imported by src/gui/main.tsx
- vite.config.mts: @tailwindcss/vite plugin and "@/" alias for src/ (shadcn/ui prerequisite)
- tsconfig.json: "@/*" path for src/*
- src/gui/App.tsx: Lucide Upload icon on the import buttons (dependency check)

## Changed

- DECISIONS.md: ADR-025 defines Tailwind CSS 4, Lucide React 1 and the shadcn/ui installation (shadcn command line tool, "@/" alias)
- ARCHITECTURE_DECISION_MATRIX.md: ADM-022 updated
- TECH_STACK.md: Tailwind CSS, Lucide React and shadcn/ui installation details
- FILE_STRUCTURE.md: src/gui/styles/global.css created; removed from Planned Items
- DIRECTORY_PURPOSES.md: src/gui/styles/global.css

## Validation Result

- Windows 11 (2026-10-14): npm install and npm run dev succeed; the window is styled by Tailwind CSS; Lucide icons are displayed; npm run typecheck and npm run lint report 0 errors
- shadcn init completed (Base UI, preset Nova); generated files integrated in 0.1.29

---

# VERSION 0.1.29

Release Type:
Phase Closure

Status:
Completed

Date:
2026-10-14

## Added

- shadcn/ui, initialized with shadcn init (component library Base UI, preset Nova, style base-nova, Lucide icons): components.json, src/gui/components/ui/button.tsx, src/utils/cn.ts; dependencies @base-ui/react, class-variance-authority, cn, shadcn, tw-animate-css
- src/gui/styles/global.css: shadcn/ui theme variables (light and dark) generated by shadcn init
- Font Inter (@fontsource-variable/inter), fallback Segoe UI, Roboto, sans-serif (GUI_SPEC.md, Font)
- package-lock.json listed in FILE_STRUCTURE.md and DIRECTORY_PURPOSES.md

## Changed

- Files generated by shadcn init moved to the documented structure: src/components/ui/button.tsx to src/gui/components/ui/button.tsx, src/lib/utils.ts to src/utils/cn.ts; components.json aliases updated so that shadcn add writes there
- The Geist font of the Nova preset is replaced by Inter (GUI_SPEC.md)
- DECISIONS.md: ADR-025 records the shadcn/ui settings and the font; ARCHITECTURE_DECISION_MATRIX.md (ADM-022) and TECH_STACK.md updated
- FILE_STRUCTURE.md: root files package-lock.json and components.json; src/gui/components/ui/; src/utils/cn.ts; src/gui/components/ removed from Planned Items
- DIRECTORY_PURPOSES.md: package-lock.json, components.json, button.tsx, cn.ts

## Completed

- Technical Phase 2 - Core Dependencies (PHASES_IMPLEMENTATION_PLAN.md): Three.js, Zustand, Zod, Tailwind CSS, shadcn/ui, Lucide React

---

# VERSION 0.1.30

Release Type:
Security

Status:
Completed

Date:
2026-10-15

## Changed

- package.json: shadcn moved from dependencies to devDependencies. It is used by the command line tool and by the CSS import resolved at build time (src/gui/styles/global.css, "shadcn/tailwind.css"); it is not needed at runtime and is no longer part of the shipped dependencies

## Added

- KNOWN ISSUES: KI-013 (braces advisory GHSA-vfj7-8cjw-p6xm reported by npm audit; no patched version; npm audit fix --force rejected)

---

# VERSION 0.1.31

Release Type:
GUI Foundation

Status:
Completed

Date:
2026-10-15

## Added

- Technical Phase 3 - GUI Foundation, internationalization foundation
- src/gui/components/I18nProvider.tsx: loads the dictionary of the current language (default English, fallback to English when a dictionary cannot be loaded) and provides it to the GUI; sets lang and dir on the document (dir="rtl" for Hebrew, LanguageManager.isRTL)
- src/gui/hooks/useTranslation.ts: access to the translated texts, the current language, the supported languages and the language change
- scripts/build/check-locales.mjs and npm script check:locales: checks that fr.json and he.json have exactly the keys of en.json, with no empty value
- public/locales: keys for the GUI_SPEC menus (9 menus and their items), the 11 toolbar buttons, the object and properties panels, the status bar fields, the 12 preset categories (PRINT_PRESETS_SPEC), the 15 classification categories and the 5 confidence levels (OBJECT_CLASSIFICATION_SPEC), and app.notAvailable for actions not available yet

## Changed

- public/locales/en.json: reference dictionary (217 keys); obsolete keys removed: preset.fast, preset.quality, preset.prototype, preset.mechanical (not preset categories), menu.settings (not a GUI_SPEC menu)
- public/locales/fr.json: aligned on en.json; "app.loadin" corrected to "app.loading"; existing translations kept
- public/locales/he.json: rebuilt on the en.json keys (it used a different key scheme: 42 keys in common out of 120); existing Hebrew translations kept where the meaning matched
- src/i18n/TranslationLoader.ts: dictionaries loaded with a path relative to the page (./locales/), so that they are found in the built application loaded from disk (BrowserWindow.loadFile); XMLHttpRequest is used for file: pages, since Chromium's fetch does not accept file: URLs; invalid JSON reported with its cause
- src/gui/main.tsx: App mounted inside I18nProvider
- src/gui/App.tsx: texts read from the dictionaries; temporary language buttons in the footer, to be replaced by the Language menu
- DOMAINS_DEPENDENCY_MATRIX.md: the GUI Domain can depend on the Internationalization Domain
- FILE_STRUCTURE.md: I18nProvider.tsx, hooks/useTranslation.ts, scripts/build/check-locales.mjs; src/gui/hooks/ removed from Planned Items
- DIRECTORY_PURPOSES.md: src/gui/ files, public/locales/ reference rule, scripts/build/ files
- PHASES_IMPLEMENTATION_PLAN.md: Phase 3 In Progress

## Validation Result

- Windows 11 (2026-10-15): npm run check:locales, npm run typecheck and npm run lint report 0 errors; npm run dev and the built application (npm run build, npm start) switch between English, French and Hebrew; Hebrew is displayed right-to-left

---

# VERSION 0.1.32

Release Type:
GUI Foundation

Status:
Completed

Date:
2026-10-15

## Added

- Language persistence: the chosen language is saved in the user settings and restored at the next start (USER_SETTINGS_SPEC.md, General Settings)
- src/storage/SettingsStorage.ts: reads and writes settings.json in the user data folder (Windows: %APPDATA%\SlicyWeb); missing or invalid file gives the default preferences; an invalid field takes its default value; other top-level entries are kept; write through a temporary file and a rename
- src/schemas/UserPreferencesSchema.ts: Zod schemas of the user preferences (theme, language, units), partial update schema, default preferences (ApplicationConstants)
- StorageManager and StorageService: loadSettings/getSettings, saveSettings/updateSettings, resetSettings
- API_SPEC.md: SettingsIPC Channels (payloads and response data)
- USER_SETTINGS_SPEC.md: location and content of settings.json, reading rules

## Changed

- src/electron/ipc/SettingsIPC.ts: the five channels (settings:get, settings:update, settings:reset, settings:theme, settings:language) call StorageService instead of TODO stubs; payloads validated by UserPreferencesSchema (settings:update no longer casts the payload); responses carry the stored preferences in data.settings
- src/electron/main.ts: creates the settings storage (app.getPath("userData")/settings.json) and passes StorageService to SettingsIPC
- src/gui/components/I18nProvider.tsx: reads the saved language at start (settings:get) and saves each language change (settings:language); outside Electron nothing is saved
- src/types/UserPreferences.ts: Language limited to en, fr, he (DATA_SCHEMA.md, Language Values); es, de, it are Future Extensions
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: SettingsStorage.ts, UserPreferencesSchema.ts

## Validation Result

- Windows 11 (2026-10-15): the application starts in the last chosen language; settings.json is created in %APPDATA%\SlicyWeb with the chosen language

---

# VERSION 0.1.33

Release Type:
GUI Foundation

Status:
Completed

Date:
2026-10-15

## Added

- src/gui/components/ui/resizable.tsx: shadcn/ui Resizable component (shadcn add resizable), on react-resizable-panels ^4.14.5
- @fontsource-variable/noto-sans-hebrew ^5.3.0: Hebrew font placed after Inter in the font stack (Inter has no Hebrew glyphs)
- Dark theme colors of GUI_SPEC.md (Color Philosophy) in the .dark variables of global.css; viewport, warning and success colors (bg-viewport, text-warning, text-success)
- Locale keys: project.none, object.noSelection, result.generated, result.outdated, panel.collapse, panel.expand (223 keys)
- KNOWN ISSUES: KI-014 (selection state duplicated between stores)

## Changed

- index.html: class "dark" on <html> (dark theme by default, GUI_SPEC.md, Visual Style)
- src/gui/MainLayout.tsx: main window layout with resizable panels; Object Panel (start side) and Properties Panel (end side) resizable and collapsible, their width kept when the window is resized; a collapsed panel stays visible as a 40 px bar with an expand button; sides swap in right-to-left
- src/gui/App.tsx: uses MainLayout; header with the application name and the temporary language buttons; viewport placeholder (#renderer-container)
- src/gui/sidebar/LeftSidebar.tsx: Object Panel content: objects of the object store with icon, name, visibility and lock state, selection on click; empty state
- src/gui/sidebar/RightSidebar.tsx: Properties Panel content: the nine sections of GUI_SPEC.md (Properties Sections) with the current selection or an empty state
- src/gui/sidebar/SidebarSection.tsx, src/gui/statusbar/StatusBar.tsx: texts from the dictionaries; colors from the theme variables; the status bar shows the nine fields of GUI_SPEC.md (Status Bar)
- src/gui/hooks/useTranslation.ts: LANGUAGE_NAME_KEYS shared by the header and the status bar
- DECISIONS.md (ADR-025), ARCHITECTURE_DECISION_MATRIX.md (ADM-022), TECH_STACK.md: Noto Sans Hebrew, react-resizable-panels 4
- GUI_SPEC.md (Font): Noto Sans Hebrew for Hebrew characters
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: resizable.tsx; roles of MainLayout, sidebar and status bar files
- PHASES_IMPLEMENTATION_PLAN.md: Phase 3 progress

## Validation Result

- Windows 11 (2026-10-15): npm install, npm run check:locales (223 keys), npm run typecheck and npm run lint report 0 errors; in npm run dev both separators resize the panels, the panel buttons collapse and expand them, the panels swap sides in Hebrew, and Rendered Fonts shows Noto Sans Hebrew Variable for Hebrew text

---

# VERSION 0.1.34

Release Type:
GUI Foundation

Status:
Completed

Date:
2026-10-15

## Added

- src/gui/components/ui/menubar.tsx and dropdown-menu.tsx: shadcn/ui Menubar and Dropdown Menu components (shadcn add menubar, Base UI); no new dependency
- src/gui/menus/MenuBar.tsx: the nine menus of GUI_SPEC.md (File, Edit, View, Printer, Material, Filament, Tools, Language, Help) with their items and the shortcuts of GUI_SPEC.md (Keyboard Shortcuts, displayed only); Language changes the interface language; File > Exit closes the window; the other items are disabled until their phase
- src/gui/toolbars/Toolbar.tsx: the eleven buttons of GUI_SPEC.md (Toolbar Buttons) with Lucide icons, in four groups; disabled (aria-disabled, tooltip "Available in a later version") until their phase; Undo and Redo icons mirrored in right-to-left
- Locale keys: menu.title, toolbar.title (225 keys)

## Changed

- src/gui/App.tsx: header with the Menu Bar and the Toolbar (the temporary language buttons are removed); DirectionProvider (Base UI) receives the direction of the current language
- PHASES_IMPLEMENTATION_PLAN.md (Phase 3): Top Menu and Toolbar follow GUI_SPEC.md (nine menus, eleven buttons); actions not available in Phase 3 are visible and disabled
- FILE_STRUCTURE.md: src/gui/menus/MenuBar.tsx, src/gui/toolbars/Toolbar.tsx, menubar and dropdown-menu components; src/gui/menus/ and src/gui/toolbars/ removed from Planned Items
- DIRECTORY_PURPOSES.md, TECH_STACK.md: menu and toolbar files; Base UI DirectionProvider


## Validation Result

- Windows 11 (2026-10-15): npm run check:locales (225 keys), npm run typecheck and npm run lint report 0 errors; npm run build succeeds; the nine menus open, only Exit and the three languages are active; Language changes the whole interface and closes the menu; the toolbar tooltips are shown in the three languages; File > Exit closes the window

---

# VERSION 0.1.35

Release Type:
Phase Closure

Status:
Completed

Date:
2026-10-15

## Changed

- components.json: "rtl": true (shadcn migrate rtl)
- src/gui/components/ui/button.tsx, resizable.tsx, menubar.tsx, dropdown-menu.tsx: left and right classes replaced by logical classes (ms, me, ps, pe, start, end) by shadcn migrate rtl; in Hebrew the check mark of the Language menu is on the right and the shortcuts on the left; submenus open on the inline end side; project headers kept
- DECISIONS.md (ADR-025), TECH_STACK.md, DIRECTORY_PURPOSES.md: right-to-left support of the shadcn/ui components
- PHASES_IMPLEMENTATION_PLAN.md: Phase 3 - GUI Foundation Completed, with the validation result; theme switching and the notification area (ROADMAP.md, Phase 1) left to the phases that provide them

## Added

- KNOWN ISSUES: KI-015 (unused GUI components with hardcoded English text), KI-016 (preload bridge open to any IPC channel; no unsubscribe for on())


## Validation Result

- Windows 11 (2026-10-16): npm run typecheck and npm run lint report 0 errors; in Hebrew the check mark of the Language menu is on the right and the shortcuts are against the left edge of the menu; in English and French the shortcuts stay on the right

---

# VERSION 0.1.36

Release Type:
3D Viewport

Status:
Completed

Date:
2026-10-16

## Added

- Technical Phase 4 - 3D Viewport
- DECISIONS.md: ADR-028 (viewport coordinate system: mm, X right, Y back, Z up, origin at the center of the build plate; no build plate without a selected printer; the GUI Domain depends on the Viewport Domain, not the reverse); ARCHITECTURE_DECISION_MATRIX.md: ADM-024
- src/renderer/helpers/WorkspaceHelpers.ts: grid on Z = 0 with adaptive spacing (1 to 100 mm, lines at least 10 pixels apart, one major line out of five), axes at the origin always visible (X red, Y green, Z blue), build plate and build volume limits sized from the build volume of the selected printer
- src/state/viewportStore.ts: projection (perspective, orthographic) and requested view preset
- src/constants/ViewportConstants.ts: background #252526 (GUI_SPEC.md), default workspace 400 x 400 mm, grid, colors and camera values
- Locale key viewport.unavailable (message when WebGL is not available); viewport.placeholder removed (225 keys)
- KNOWN ISSUES: KI-017 (unit and order of rotation not defined in the Transform Schema)

## Changed

- src/renderer/CameraManager.ts: perspective and orthographic cameras with Z up; view presets framing the workspace or the build volume; projection change keeping the point of view; controls (OrbitControls): wheel zoom towards the cursor, middle button pan, right button rotate, left button left free for selection, damping; pixels per millimeter for the grid spacing
- src/renderer/RendererManager.ts: uses the camera of CameraManager instead of its own; background color of GUI_SPEC.md; canvas positioned over its container; resize ignores an empty container
- src/renderer/SceneRenderer.ts: start() accepts a frame callback (camera damping, grid spacing)
- src/gui/viewport/Viewport.tsx: builds the viewport (renderer, camera, lights, workspace helpers, render loop); follows its container size (ResizeObserver: window, side panels), the selected printer (printer store), the View menu (viewport store) and the Home key (Reset View); shows a message when WebGL is not available; receives its translated texts from the GUI
- src/gui/App.tsx: the viewport replaces the placeholder
- src/gui/menus/MenuBar.tsx: View menu active: Perspective and Orthographic as a choice, Top, Bottom, Front, Back, Left, Right, Isometric, Reset View
- DATA_SCHEMA.md 3.2.0: Transform Schema states the coordinate system of position (ADR-028); no field change
- GUI_SPEC.md (Build Plate): no plate without a selected printer, default workspace, coordinate system
- DOMAINS_DEPENDENCY_MATRIX.md: GUI Domain can depend on the Viewport Domain; Viewport Domain owns src/renderer/, src/gui/viewport/ and ViewportConstants.ts, can depend on Scene, State Management and Internationalization, and cannot depend on the GUI Domain
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: WorkspaceHelpers.ts, viewportStore.ts, ViewportConstants.ts; roles of the renderer files; src/renderer/helpers/ removed from Planned Items
- PHASES_IMPLEMENTATION_PLAN.md: Phase 4 In Progress
- KNOWN ISSUES: KI-015 updated (Viewport.tsx is used; Renderer.ts is unused and duplicates RendererManager)
- PASSATION.md: working rules (Windows PowerShell, no git status, check of the GitHub upload)


## Validation Result

- Windows 11 (2026-10-16): npm run check:locales (225 keys), npm run typecheck and npm run lint report 0 errors; grid and axes displayed; zoom, pan and rotation work and are smooth; all View menu items work; Home resets the view; resizing and collapsing the side panels do not distort the viewport; npm run build succeeds (warning: renderer bundle larger than 500 kB, see 0.1.37) and npm start opens the application

---

# VERSION 0.1.37

Release Type:
Phase Closure

Status:
Completed

Date:
2026-10-16

## Changed

- vite.config.mts: build.chunkSizeWarningLimit 1500 kB; the renderer bundle includes Three.js (about 950 kB) and is loaded from disk by Electron
- DECISIONS.md (ADR-025): bundle size warning limit
- PHASES_IMPLEMENTATION_PLAN.md: Phase 4 - 3D Viewport Completed, with the validation result

## Validation Result

- Windows 11 (2026-10-16): npm run build succeeds without the bundle size warning; npm run lint reports 0 errors

---

# VERSION 0.1.38

Release Type:
Security

Status:
Completed

Date:
2026-10-16

## Added

- src/electron/ipc/IpcChannels.ts: allow list of the IPC channels the renderer may use: INVOKE_CHANNELS (the 22 channels registered with ipcMain.handle), SEND_CHANNELS and RECEIVE_CHANNELS (none yet)
- scripts/build/check-ipc-channels.mjs and npm script check:ipc: checks that INVOKE_CHANNELS matches the ipcMain.handle registrations of src/electron/ipc/
- API_SPEC.md: Allowed IPC Channels

## Changed

- src/electron/preload.ts: invoke() rejects a channel outside the allow list; send() and on() throw an error for such a channel; on() returns a function that removes its listener; the callback of on() receives the data only, not the Electron event
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: IpcChannels.ts, check-ipc-channels.mjs
- PHASES_IMPLEMENTATION_PLAN.md: KI-016 resolved

## Fixed

- KI-016 resolved (preload bridge open to any IPC channel; no unsubscribe for on())

## Validation Result

- Windows 11 (2026-10-16): npm run check:ipc (22 invoke channels), npm run check:locales (225 keys), npm run typecheck and npm run lint report 0 errors; in the console, window.slicyWeb.invoke("fs:readFile") is refused with "IPC channel not allowed: fs:readFile"

---

# VERSION 0.1.39

Release Type:
Security

Status:
Completed

Date:
2026-10-16

## Added

- Content Security Policy of the renderer page, added to index.html by vite.config.mts (plugin slicyweb-content-security-policy): strict policy for the built application (only files of the application, no inline script, no eval, no network access); development policy for npm run dev (inline script of React Fast Refresh, style elements of Vite, WebSocket of hot reload on localhost, no eval)
- SECURITY_SPEC.md: Renderer Content Security Policy

## Changed

- SECURITY_SPEC.md (IPC Security Rules): reference to the IPC allow list
- DECISIONS.md (ADR-025): Content Security Policy in vite.config.mts

## Fixed

- Electron Security Warning "Insecure Content-Security-Policy" in npm run dev: the page had no Content Security Policy

## Validation Result

- Windows 11 (2026-10-16): npm run dev shows no Content Security Policy warning or violation; npm run build and npm start: two fonts refused by font-src 'self' (Noto Sans Hebrew cyrillic-ext and greek-ext subsets, 1.2 kB each, inlined by Vite as data: URLs), fixed in 0.1.40

---

# VERSION 0.1.40

Release Type:
Security

Status:
Completed

Date:
2026-10-16

## Fixed

- Built application: two font files of Noto Sans Hebrew (cyrillic-ext and greek-ext subsets, 1.2 kB each) were inlined by Vite as data: URLs and refused by the Content Security Policy (font-src 'self'). vite.config.mts: build.assetsInlineLimit 0, every asset is a file of the application; the policy stays strict

## Changed

- SECURITY_SPEC.md (Renderer Content Security Policy): built assets are never inlined as data: URLs

## Validation Result

- Windows 11 (2026-10-16): npm run build writes the small Noto Sans Hebrew font as a file (the cyrillic-ext and greek-ext subsets have the same content, Vite writes one file); npm start shows no Content Security Policy violation; npm run lint reports 0 errors

---

# VERSION 0.1.41

Release Type:
Model Import

Status:
Completed

Date:
2026-10-16

## Added

- Technical Phase 5 - Model Import started: decisions recorded before implementation
- DECISIONS.md: ADR-029 (files read in the renderer, parsed in a Web Worker with progress; imported objects centered on the origin at Z = 0; Import Domain depends on Scene Domain; one store per selection); ARCHITECTURE_DECISION_MATRIX.md: ADM-025
- DIRECTORY_PURPOSES.md (src/state/): Selection Reference table

## Changed

- src/state/sceneStore.ts: keeps the scene only; selectedObject, setSelectedObject and clearSelection removed (objectStore.selectedObjectId is the reference)
- DOMAINS_DEPENDENCY_MATRIX.md: the Scene Domain no longer depends on the Import Domain (circular dependency removed); the Import Domain keeps its dependency on the Scene Domain
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: appStore.ts removed, sceneStore.ts role
- PHASES_IMPLEMENTATION_PLAN.md: Phase 5 In Progress, with its decisions

## Removed

- src/state/appStore.ts: its four selections (printer, material, filament, preset) duplicated printerStore, materialStore, filamentStore and presetStore; it was not used

## Fixed

- KI-014 resolved (selection state duplicated between stores)

## Validation Result

- Windows 11 (2026-10-16): npm run typecheck and npm run lint report 0 errors; npm run dev starts, the interface is unchanged; src/state/appStore.ts removed locally and on GitHub

---

# VERSION 0.1.42

Release Type:
Model Import

Status:
Completed

Date:
2026-10-16

## Added

- STL import (Technical Phase 5): File > Import STL and the toolbar Import button open the system file dialog (several files at once); STL files can be dropped in the viewport (GUI_SPEC.md, Drag And Drop)
- src/importer/StlParser.ts: binary and ASCII STL parser without DOM; format detection (size of the binary data first, then "solid" with facets); validation of SECURITY_SPEC.md (empty file, truncated data, triangle count, malformed facet, no triangle, non finite coordinates) with the codes STL_002 and STL_003; normals recomputed from the vertices; bounds, volume and surface area
- src/importer/workers/stlParser.worker.ts: Web Worker running the parser, with progress messages (ADR-029)
- src/importer/ImportError.ts: import errors with their code
- src/scene/GeometryRegistry.ts, src/scene/SceneIntegration.ts: geometry of the scene objects; registration of an imported model, centered on the origin and placed at Z = 0, with its Model Geometry (width, depth, height, volume, surface area) and Mesh Statistics; the new object is selected
- src/services/ImportService.ts, src/state/importStore.ts: files imported one after the other; progress, success and errors for the GUI
- src/renderer/ObjectRenderer.ts: one mesh per object in the viewport; selected object in the accent color
- src/gui/import/: file dialog, drop zone, import status over the viewport (progress bar, confirmation, translated error message that stays until closed)
- src/gui/sidebar/objectNames.ts: display names, "cube (1)", "cube (2)" for objects from files with the same name
- Locale keys import.* (237 keys)
- IMPORT_EXPORT_SPEC.md: Import Error Codes, Import Progress And Placement
- KNOWN ISSUES: KI-018 (import errors without code in ERROR_CODES_SPEC.md)

## Changed

- src/importer/STLImporter.ts: reads the file with progress and parses it in the Web Worker (three.js STLLoader no longer used)
- src/importer/ImportManager.ts: import workflow with errors and codes; registers the objects in the scene; 3MF refused with "available in a later version" until the 3MF step
- src/importer/FileValidator.ts: getMaxFileSize()
- src/gui/viewport/Viewport.tsx: displays the scene objects (ObjectRenderer, object store)
- src/renderer/LightingManager.ts: directional light from the front right above the plate (Z up), ambient light 0.8
- src/gui/menus/MenuBar.tsx: File > Import STL active; src/gui/toolbars/Toolbar.tsx: Import active (STL)
- src/gui/App.tsx: the viewport is wrapped in the import drop zone
- src/gui/sidebar/LeftSidebar.tsx, RightSidebar.tsx, src/gui/statusbar/StatusBar.tsx: display names of the objects
- src/constants/ViewportConstants.ts: object colors
- vite.config.mts, SECURITY_SPEC.md: worker-src 'self' in the Content Security Policy (both modes)
- DOMAINS_DEPENDENCY_MATRIX.md: Service Domain can depend on the Import Domain
- API_SPEC.md: the import does not use the import:* IPC channels (ADR-029)
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: new files and src/gui/import/
- PHASES_IMPLEMENTATION_PLAN.md: Phase 5 progress

## Validation Result

- Windows 11 (2026-10-16): STL files imported, centered on the build plate; 3MF refused with "available in a later version"; same behavior with npm run build and npm start (Web Worker in the built application); src/gui/import/ and src/importer/workers/ on GitHub. Objects cannot be moved yet and overlap at the center: expected (ADR-029; moving objects is Phase 6 - Transform System)

---

# VERSION 0.1.43

Release Type:
Model Import

Status:
Completed

Date:
2026-10-16

## Added

- 3MF import (Technical Phase 5): File > Import 3MF and the toolbar Import button (STL and 3MF) open the system file dialog; 3MF files can be dropped in the viewport
- DECISIONS.md: ADR-030 (3MF parsed with fflate and fast-xml-parser in the Web Worker, not with the 3MFLoader of three.js; layout of the file kept); ARCHITECTURE_DECISION_MATRIX.md: ADM-026
- Dependencies: fflate (ZIP archive) and fast-xml-parser (XML), MIT licenses
- src/importer/ThreeMFParser.ts: 3MF parser without DOM; package and relationships; XML checked with XMLValidator, then read tag by tag without XML tree; units converted to millimeters; build item and component transforms; Production extension (model parts 3D/Objects/*.model of Bambu Studio and OrcaSlicer); objects of type "other" not imported; mirror transforms keep the normals outward; codes MF_002 and MF_003
- src/importer/workers/threeMfParser.worker.ts: Web Worker running the 3MF parser, with progress messages
- src/importer/ImportRunner.ts: file reading with progress and parser worker, shared by the STL and 3MF importers
- SECURITY_SPEC.md: how the 3MF import applies the 3MF rules; Archive Extraction Limits (only the needed parts decompressed; 500 MB per part, 1 GB in total, checked before decompression; 20 million triangles)
- IMPORT_EXPORT_SPEC.md: 3MF Reading; codes MF_001 to MF_003; 3MF placement
- Locale keys import.error.MF_001, MF_002, MF_003, MF_TOO_LARGE (240 keys)
- KNOWN ISSUES: KI-019 (several build plates of a Bambu Studio file), KI-020 (3MF object names and metadata not kept)

## Changed

- src/importer/ThreeMFImporter.ts: reads the file with progress and parses it in the Web Worker (placeholder replaced)
- src/importer/STLImporter.ts: uses ImportRunner.ts (same behavior)
- src/importer/StlParser.ts: TriangleCollector exported for the 3MF parser, with the error code of the format
- src/importer/ImportManager.ts: 3MF files imported; one object per build item
- src/scene/SceneIntegration.ts: registerImportedObjects, the objects of one file keep their layout, the group centered on the origin at Z = 0; the first object is selected; vertex count of the mesh statistics given by the parser (3MF)
- src/importer/ImportError.ts: reason MF_TOO_LARGE (3MF content over the extraction limits); MF_NOT_AVAILABLE removed
- src/gui/menus/MenuBar.tsx: File > Import 3MF active; src/gui/toolbars/Toolbar.tsx: Import accepts STL and 3MF; src/gui/import/openImportDialog.ts: accepted extensions
- Locale key import.dropHint: STL or 3MF
- TECH_STACK.md: STL Support (project parser, STLLoader not used since 0.1.42) and 3MF Support (fflate, fast-xml-parser)
- IMPORT_EXPORT_SPEC.md (Unit Conversion): micron and foot for 3MF files
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: new files
- PHASES_IMPLEMENTATION_PLAN.md: Phase 5 progress

## Removed

- Locale key import.error.MF_NOT_AVAILABLE

## Validation Result

- Windows 11 (2026-10-17): npm install fflate@0.8.3 fast-xml-parser@5.11.2; npm run check:locales (240 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report 0 errors; orca-badge.3mf imported; zip-bomb.3mf, bad-xml.3mf and not-zip.3mf refused with their translated message, in npm run dev and in the built application (npm run build, npm start); package.json and package-lock.json on GitHub with the two dependencies

---

# VERSION 0.1.44

Release Type:
Model Import

Status:
Completed

Date:
2026-10-17

## Added

- ERROR_CODES_SPEC.md 2.1.0: Import Errors IMP_001 (Unsupported File Format) and IMP_002 (File Too Large); MF_004 (3MF Content Too Large, archive extraction limits)
- PASSATION.md: decision rule (options marked "Recommended" applied without asking, except for data and file formats, security, choices visible to the user, removal of code or features, contradictions between documents of the same priority; listed in each lot under "Décisions prises seul")
- Technical Phase 5 - Model Import closed (PHASES_IMPLEMENTATION_PLAN.md: validation result)

## Changed

- src/importer/ImportError.ts, ImportManager.ts, ThreeMFParser.ts: codes IMP_001, IMP_002 and MF_004 replace the reasons UNSUPPORTED_FORMAT, FILE_TOO_LARGE and MF_TOO_LARGE
- Locale keys import.error.UNSUPPORTED_FORMAT, FILE_TOO_LARGE and MF_TOO_LARGE renamed import.error.IMP_001, IMP_002 and MF_004 (same texts, 240 keys)
- ERROR_CODES_SPEC.md: STL_004 reserved, not used (no STL format has a version)
- IMPORT_EXPORT_SPEC.md (Import Error Codes), SECURITY_SPEC.md (Archive Extraction Limits), DIRECTORY_PURPOSES.md: codes
- PHASES_IMPLEMENTATION_PLAN.md: Phase 5 Completed

## Fixed

- KI-018 resolved (import refusals without code in ERROR_CODES_SPEC.md)

## Validation Result

- Windows 11 (2026-10-17): npm run check:locales (240 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report 0 errors; a .txt file refused with "unsupported format", zip-bomb.3mf with "too large"; bambu-pa-line.3mf (8 thin lines in 2 columns), layout.3mf (3 cubes in a row, the last one raised) and cube-inch.3mf (254 mm cube) imported; files on GitHub

---

# VERSION 0.1.45

Release Type:
Security

Status:
Completed

Date:
2026-10-17

## Added

- src/importer/ZipReader.ts: ZIP reader of the 3MF import; central directory (data descriptor, Zip64), declared sizes checked before decompression, parts decompressed by chunks of 16 kB with the Inflate stream of fflate and stopped as soon as they produce more than their declared size; encrypted parts, unknown compression methods, duplicate names and offsets outside the file refused
- Cancel button for each import waiting or in progress (src/gui/import/ImportStatus.tsx, ImportService.cancel): the reading is aborted or the parser worker is terminated at once, nothing is added to the scene, the next file starts
- src/importer/ImportError.ts: ImportCancelledError (cancel, not an error)
- Locale key import.cancel (241 keys)
- PASSATION.md rewritten: rules, current state, lots 1 to 42, decisions, remaining work

## Changed

- src/importer/ThreeMFParser.ts: the archive is read by ZipReader.ts instead of fflate unzipSync; progress during the decompression
- src/importer/ImportRunner.ts, STLImporter.ts, ThreeMFImporter.ts, ImportManager.ts, src/services/ImportService.ts: cancel signal (AbortSignal)
- DECISIONS.md (ADR-030): amendment; ARCHITECTURE_DECISION_MATRIX.md (ADM-026), TECH_STACK.md (3MF Support), SECURITY_SPEC.md (Archive Extraction Limits), IMPORT_EXPORT_SPEC.md (Import Error Codes, Import Progress And Placement), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md

## Fixed

- A 3MF file whose ZIP header declares a small size for a part that inflates to gigabytes was refused (MF_003) with bounded memory, but only after inflating all the data: 47 s for 3 GB, hours for larger files. It is now refused after the first chunk (0.2 s)
- A part with a data descriptor (Bambu Studio) whose data contains the bytes of the data descriptor signature is read correctly (checked with a test file; the streaming Unzip of fflate cut it)

## Validation Result

- Windows 11 (2026-10-18): bombe-annonce-1ko.3mf and bombe-annonce-400mo.3mf refused ("the 3MF file is corrupted"); bit3-fausse-signature.3mf imported (one cube); Cancel works (nothing added, the next file starts); a 3MF file exported by the user imported; console: only the expected import errors, no Content Security Policy violation; files on GitHub
- After Cancel, the line disappears without message (choice confirmed by Noam)
- Windows 11 (2026-10-18): npm run build writes both parser workers (stlParser.worker, threeMfParser.worker) in dist/renderer/assets; npm start opens the application

---

# VERSION 0.1.46

Release Type:
GUI Foundation

Status:
Completed

Date:
2026-10-18

## Changed

- public/locales/he.json: import.cancel "בטל" instead of "ביטול" (Noam)

## Validation Result

- Windows 11 (2026-10-18): files on GitHub

---

# VERSION 0.1.47

Release Type:
Transform System

Status:
Completed

Date:
2026-10-18

## Added

- Technical Phase 6 - Transform System started
- DECISIONS.md: ADR-031 (meaning of the transform: rotation in degrees, right-hand rule, around the plate axes X then Y then Z; scale along the object axes, applied first; pivot and position at the center of the base defined at import; object placed back on the plate after each rotation or scale; 3MF export transform); ARCHITECTURE_DECISION_MATRIX.md: ADM-027
- DATA_SCHEMA.md 3.3.0: Transform Rules (Transform Schema); conversion at export (3MF build item transform)
- src/scene/ObjectTransform.ts: matrix of an object, lowest point, placement on the plate, 3MF export transform
- Vitest 5.0.3 (development dependency, TECH_STACK.md), vitest.config.mts, npm script test; tests/unit/scene/ObjectTransform.test.ts (7 tests, among them: a cube stretched to 200 % along X, then turned +90° around Z, is long along Y)

## Changed

- src/renderer/ObjectRenderer.ts: applies the full transform (scale, rotation, position)
- tsconfig.json: tests/ and vitest.config.mts type-checked; npm script lint: tests/ and vitest.config.mts linted
- TECH_STACK.md (Testing Framework, Vitest), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md (Phase 6 In Progress)

## Fixed

- KI-017 resolved (unit and order of rotation not defined in the Transform Schema)

## Validation Result

- Windows 11 (2026-10-18): npm install -D vitest@5.0.3; scripts test and lint added (npm pkg set with a value containing a space fails in PowerShell; done with node -e); npm test: 7 tests passed; npm run check:locales (241 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report 0 errors; npm run dev: nothing changed on screen; files on GitHub
- tests/README.md and tests/unit/README.me removed on GitHub by Noam (placeholders of folders that are no longer empty)

---

# VERSION 0.1.48

Release Type:
Transform System

Status:
Completed

Date:
2026-10-18

## Added

- Transform section of the Properties Panel (src/gui/sidebar/TransformSection.tsx): position X and Y in mm, position Z shown and computed (the object always stands on the plate), rotation X, Y, Z in degrees, scale X, Y, Z in % with a lock that keeps the proportions (on by default), size X, Y, Z in mm linked to the scale; Reset Position, Reset Rotation, Reset Scale, Center On Bed (GUI_SPEC.md, Transform Section, Transform Actions)
- src/services/TransformService.ts: the only way to change the transform of an object; refuses values that are not finite and scales of 0.1 % or less; places the object on the plate; undo and redo will be recorded there
- src/scene/ObjectTransform.ts: worldBounds (bounding box on the plate)
- tests/unit/services/TransformService.test.ts (7 tests)
- Locale keys transform.position, rotation, size, keepProportions, onPlate, resetPosition, resetRotation, resetScale, centerOnBed, unit.mm, unit.degree, unit.percent (253 keys)

## Changed

- src/gui/sidebar/RightSidebar.tsx: the Transform section shows TransformSection for the selected object
- DOMAINS_DEPENDENCY_MATRIX.md: the Service Domain can depend on the Scene Domain (TransformService)
- GUI_SPEC.md: details of the Transform section and of the Transform Actions; Move Gizmo along X and Y only; Rotate Gizmo free, by 15 degrees with Shift
- PASSATION.md: commands with a value containing a space (npm pkg set) replaced by node -e
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md

## Validation Result

- Windows 11 (2026-10-18): npm run check:locales (253 keys), npm run typecheck and npm run lint report 0 errors, npm test: 14 tests passed; files on GitHub
- A rotation changes position Z by itself (the object stays on the plate); the lock keeps the proportions; a size in mm updates the scale; Hebrew unit "מ״מ" approved; console: only the React DevTools message
- Reported: a value typed in Position X without Enter, then Escape, stayed in the field (fixed in 0.1.49)

---

# VERSION 0.1.49

Release Type:
Transform System

Status:
Completed

Date:
2026-10-18

## Added

- src/renderer/ObjectInteraction.ts: left mouse in the viewport; a click on an object selects it, a click in the empty space clears the selection; pressing on an object and dragging moves it on the build plate (X, Y); the move starts after 4 pixels (DRAG_THRESHOLD_PX), so a selection click never moves the object and a drag in the empty space keeps the selection
- src/renderer/TransformGizmo.ts: Move (X, Y), Rotate (rings X, Y, Z of the plate, by 15 degrees with Shift) and Scale (one axis or uniform) gizmos of the selected object, with TransformControls of Three.js; each change goes through TransformService
- Shortcuts G, R, S (mode of the gizmo, read by key position, so they work with any keyboard layout) and ESC (clears the selection) in the viewport; not active while a text field has the focus
- Toolbar Move, Rotate, Scale: choose the mode of the gizmo; the active button is shown pressed
- Edit > Deselect All active
- src/state/viewportStore.ts: transformMode (Move by default); src/constants/ViewportConstants.ts: ROTATION_SNAP_DEGREES, DRAG_THRESHOLD_PX

## Changed

- src/renderer/ObjectRenderer.ts: object under the pointer (pick); src/renderer/CameraManager.ts: the camera controls are turned off while a gizmo is dragged
- src/gui/viewport/Viewport.tsx: gizmo, selection and drag; the change callback is given by App.tsx (the Viewport Domain does not depend on the Service Domain)
- GUI_SPEC.md (Toolbar Buttons, Viewport Controls, Rotate Gizmo, Scale Gizmo, Keyboard Shortcuts), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Fixed

- Transform section: Escape in a field restores the previous value and keeps the selection, on every engine (the restore no longer depends on the order of the blur and key events)

## Validation Result

- Windows 11 (2026-10-19): a click on the cube selects it and the cube can be dragged; a click in the empty space clears the selection; keys R and S, then the toolbar button Move, change the mode and the button is highlighted; a rotation keeps the object on the plate; the Scale gizmo enlarges and reduces
- Reported, corrected in 0.1.50: the Scale gizmo ignored the lock of the scale; the mode buttons were not found; too many handles on the Scale gizmo; Transform section to adapt to the mode
- releases/README.me, scripts/README.me, scripts/build/README.me, scripts/release/README.me removed on GitHub by Noam (misnamed placeholders)

---

# VERSION 0.1.50

Release Type:
Transform System

Status:
Completed

Date:
2026-10-19

## Added

- src/gui/toolbars/TransformModeBar.tsx: buttons Move, Rotate, Scale over the 3D viewport (top, start side), active tool highlighted (existing keys transform.title, transform.move, transform.rotate, transform.scale; 253 keys)
- src/state/viewportStore.ts: keepProportions, the lock of the scale shared by the Transform section and the Scale gizmo (on by default)

## Changed

- src/renderer/TransformGizmo.ts: Scale gizmo with one handle per axis, X on the right, Y in front, Z on top, and the center handle; plane handles removed
- src/gui/sidebar/TransformSection.tsx: rows and actions by mode of the gizmo (Move: Position, Scale, Reset Position, Center On Bed, Reset Scale; Rotate: Rotation, Reset Rotation; Scale: Scale, Size, Reset Scale); the lock is read from the viewport store
- src/gui/toolbars/Toolbar.tsx: active mode highlighted in the accent color of the application (primary)
- GUI_SPEC.md (Toolbar Buttons, Scale Gizmo, Transform Section), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Fixed

- Scale gizmo: with the lock closed, an axis handle changed that axis only; it now scales the three axes by the same factor, as the Transform section

## Validation Result

- Windows 11 (2026-10-19): npm run check:locales (253 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report 0 errors, npm test: 14 tests passed; console without error; lots 46 and 47 on GitHub
- Scale: lock closed, uniform; lock open, one axis only; Transform section by mode; in Hebrew, the mode buttons are at the top right of the viewport; a click with a 2 px jiggle selects without moving
- Reported, changed in 0.1.51: the mode buttons were shown twice (toolbar and viewport); the gizmo rotation kept the object on the plate during the gesture and did not turn around its center

---

# VERSION 0.1.51

Release Type:
Transform System

Status:
Completed

Date:
2026-10-19

## Added

- tests/unit/services/TransformService.test.ts: a cube of 20 mm imported at X = 0, Y = 0, turned 90° around X: position X = 0, Y = 0 kept, Z = 10, standing on the plate (test asked by Noam); free rotation during a gesture, placed on the plate at the end (16 tests)
- KNOWN ISSUES: KI-021 (sunk objects, partly under the plate)

## Changed

- DATA_SCHEMA.md 3.4.0 (Transform Rules): the local origin of an object is the center of its bounding box at import (X, Y and Z), no longer the center of its base; the object turns around its center; position is the place of its center (position Z = height of the center); decision of Noam (option B)
- DECISIONS.md: amendment of ADR-031; ARCHITECTURE_DECISION_MATRIX.md (ADM-027); IMPORT_EXPORT_SPEC.md (Import Progress And Placement)
- src/scene/SceneIntegration.ts: geometry stored relative to the center of the object; position of the center (a cube of 20 mm is imported at Z = 10)
- src/renderer/TransformGizmo.ts, src/services/TransformService.ts (apply, option live): with the Rotate gizmo, the object turns freely around its center during the gesture and may go under the plate for a moment; on release it is placed back on the plate (only Z changes), as in Bambu Studio and OrcaSlicer
- src/gui/toolbars/Toolbar.tsx: Move, Rotate, Scale removed from the toolbar (they stay over the viewport); locale keys toolbar.move, toolbar.rotate, toolbar.scale removed (250 keys)
- src/gui/toolbars/TransformModeBar.tsx: buttons grayed out without selection; src/gui/viewport/Viewport.tsx: keys G, R, S active only with a selection
- tests/unit/scene/ObjectTransform.test.ts: test cube with its local origin at its center
- GUI_SPEC.md (Toolbar Buttons, Rotate Gizmo, Transform Section, Keyboard Shortcuts), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-20): npm run check:locales (250 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 16 tests passed (ObjectTransform 7, TransformService 9); files on GitHub
- External review: transform formulas and 3MF export matrix checked, correct
- Windows 11 (2026-10-20, reported with lot 49): free rotation with the gizmo then placement on release, Position Z = half the height, mode buttons grayed out without selection: OK

---

# VERSION 0.1.52

Release Type:
Transform System

Status:
Completed

Date:
2026-10-20

## Added

- Undo and redo of the transform changes (UNDO_REDO_SPEC.md; decisions of Noam): fields of the Transform section, Reset and Center On Bed, gizmos, drag on the plate; a gesture (drag on the plate, drag of a handle of a gizmo) is one action; the object of the action undone or redone is selected; selection changes are not recorded
- src/state/historyStore.ts (undo and redo stacks, History Entry Schema), src/constants/HistoryConstants.ts (MAX_HISTORY_SIZE = 50)
- src/services/TransformService.ts: each change recorded; beginGesture, endGesture, undo, redo, clearHistory (project closed or opened, Phase 13)
- Toolbar Undo and Redo, Edit > Undo and Edit > Redo: active, disabled while their history is empty
- src/gui/hooks/useUndoRedoShortcuts.ts: Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z (Cmd on macOS); in a text field, the shortcuts undo the typing only
- tests/unit/services/UndoRedo.test.ts (7 tests; 23 tests in total)

## Changed

- src/renderer/TransformGizmo.ts, src/renderer/ObjectInteraction.ts, src/gui/viewport/Viewport.tsx, src/gui/App.tsx: start and end of a gesture sent to TransformService
- UNDO_REDO_SPEC.md 2.1.0: 50 actions (decision of Noam, previously 100); implementation status of Phase 6 (transforms only); selection on undo; shortcuts in a text field; history entry of Phase 6
- GUI_SPEC.md (Edit Menu, Toolbar Buttons, Keyboard Shortcuts: CTRL + SHIFT + Z), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md (src/transform/HistoryManager.ts and UndoRedoManager.ts marked not used), PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-20): npm run check:locales (250 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 23 tests passed (ObjectTransform 7, UndoRedo 7, TransformService 9; the message "Undo or redo: object not found" is expected); files on GitHub
- History size kept at 50 actions (Noam)
- Not reported: the manual controls of undo and redo; asked again with lot 50

---

# VERSION 0.1.53

Release Type:
Transform System

Status:
Completed

Date:
2026-10-20

## Added

- Selection of several objects (GUI_SPEC.md, Multi Selection; decisions of Noam): Ctrl+click (Cmd+click) on an object, in the 3D viewport or in the Object Panel, adds it to the selection or removes it; Ctrl+A and Edit > Select All select all the objects; a click in the empty space clears the selection
- src/state/objectStore.ts: selectedObjectIds (selectedObjectId is the last object added), selectObjects, toggleObjectSelection, selectAllObjects
- Group of objects: moved, turned around its center and scaled uniformly around its center, with the gizmo (at the center of the group) or by dragging one of its objects; each object placed back on the plate after a rotation or a scale; one undo action per change of the group
- Transform section with several objects: acts like the gizmo on the group (Position = center of the group; Rotation relative, back to 0; Scale 100 % = size of the group, lock closed; Size = size of the group); Reset Position and Center On Bed center the group; Reset Rotation and Reset Scale reset each object
- src/scene/ObjectTransform.ts: groupBounds, boundsCenter, rotateAroundPoint, scaleAroundPoint; src/services/TransformService.ts: applyMany, groupInfo, moveGroup, centerGroupOnBed, rotateGroup, scaleGroup, setGroupSize, resetGroupRotation, resetGroupScale; beginGesture takes several objects
- src/gui/hooks/useSelectAllShortcut.ts (Ctrl+A, not in a text field)
- Locale key object.multipleSelected ("{count} objects selected"; 251 keys)
- tests/unit/services/GroupTransform.test.ts (10 tests; 33 tests in total)
- KNOWN ISSUES: KI-022 (selection with a rectangle and Shift+click)

## Changed

- src/renderer/TransformGizmo.ts, src/renderer/ObjectInteraction.ts, src/renderer/ObjectRenderer.ts, src/gui/viewport/Viewport.tsx, src/gui/App.tsx: one object or a group (transforms by objectId)
- src/gui/sidebar/LeftSidebar.tsx, RightSidebar.tsx, TransformSection.tsx, src/gui/statusbar/StatusBar.tsx, src/gui/menus/MenuBar.tsx: several objects selected
- GUI_SPEC.md (Multi Selection, Scale Gizmo, Transform Section, Keyboard Shortcuts), UNDO_REDO_SPEC.md (Multiple Object Transformations), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-20): npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 33 tests passed; Ctrl+click and Ctrl+A OK; console without error
- Requested next (Noam): selection with a rectangle in the 3D viewport, Shift+click in the Object Panel (0.1.54)
- Not reported: the manual controls of the group transforms and of undo and redo; asked again with lot 51

---

# VERSION 0.1.54

Release Type:
Transform System

Status:
Completed

Date:
2026-10-20

## Added

- Selection rectangle in the 3D viewport, as in the Windows File Explorer (decision of Noam): left button pressed in the empty space and dragged (after the threshold of 4 pixels); on release, the objects touched by the rectangle are selected; Ctrl + rectangle adds them to the selection; a press on an object still moves it
- src/renderer/ObjectRenderer.ts: objectsInRect (outline of the box of each object, seen from the camera, overlapping the rectangle)
- Object Panel: Shift+click selects the range from the last object clicked; Ctrl+Shift+click adds the range
- tests/unit/renderer/ObjectRenderer.test.ts (4 tests; 37 tests in total)

## Changed

- src/renderer/ObjectInteraction.ts, src/gui/viewport/Viewport.tsx: a drag in the empty space draws a selection rectangle; a rectangle without Ctrl replaces the selection, so a rectangle that touches nothing clears it (before: a drag in the empty space kept the selection)
- src/gui/sidebar/LeftSidebar.tsx: Shift+click
- GUI_SPEC.md (Multi Selection, Viewport Controls, Keyboard Shortcuts), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Fixed

- KI-022 resolved (selection with a rectangle and Shift+click)

## Validation Result

- Windows 11 (2026-10-21): files on GitHub (27 files checked); manual controls A, B, C passed (undo and redo, group transforms, selection rectangle and Shift+click); D passed except control 16 (fixed in 0.1.55)
- A rectangle that touches nothing clears the selection: accepted (Noam)
- Requested next (Noam): fix of control 16, then the closure of Phase 6, then automatic tests with Playwright

---

# VERSION 0.1.55

Release Type:
Transform System

Status:
Completed

Date:
2026-10-21

## Added

- tests/unit/gui/hooks/UndoRedoShortcuts.test.ts (3 tests); tests/unit/services/UndoRedo.test.ts: no action when a field is left after an undo (41 tests in total)
- src/gui/hooks/useUndoRedoShortcuts.ts: undoRedoCommand (keys of undo and redo, shared by the window and the fields)

## Changed

- UNDO_REDO_SPEC.md 2.2.0 (Keyboard Shortcuts): Ctrl+Z in a field of the Transform section; GUI_SPEC.md (Transform Section), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PHASES_IMPLEMENTATION_PLAN.md, PASSATION.md

## Fixed

- Control 16 of lot 51 (src/gui/sidebar/TransformSection.tsx): after a value was applied in a field (Scale X = 50 %) with the focus still in a field, Ctrl+Z used the undo history of the browser: the field showed 100 but the object did not change, and leaving the field applied 100 as a new action. Rule of Noam: typing not applied yet -> Ctrl+Z undoes the typing (the field shows the applied value again, no action); nothing pending -> Ctrl+Z is the undo of the application, the object changes at once and the field shows the new value; Ctrl+Y and Ctrl+Shift+Z redo when nothing is pending. Leaving the field afterwards adds no action
- The fields now follow the value while they have the focus and nothing is typed (before: only when they did not have the focus)

## Validation Result

- Windows 11 (2026-10-21): files on GitHub (11 files, identical to lot 52); Ctrl+Z in a field: typing not applied yet undone alone, a value already applied undone in the application with the object; checked in Position, Rotation and Scale (Noam)

---

# VERSION 0.1.56

Release Type:
Transform System

Status:
Completed

Date:
2026-10-21

## Added

- Technical Phase 6 - Transform System closed (PHASES_IMPLEMENTATION_PLAN.md: validation result, from the manual controls of Noam for lots 49 to 52)

## Changed

- PHASES_IMPLEMENTATION_PLAN.md: Phase 6 Completed
- PASSATION.md: Phase 6 Completed; next: automatic tests with Playwright (requested by Noam), then Phase 7
- KNOWN ISSUES: KI-015 updated (ViewportToolbar and ViewportStatus removed; the panels of Phases 7 to 10 and Renderer.ts remain)
- FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: removed files; src/transform/ keeps TransformValidator.ts only

## Removed

- Files never used, replaced by the code of Phase 6 (decision of Noam): src/gui/viewport/ViewportToolbar.tsx and ViewportStatus.tsx (hardcoded English text, KI-015; replaced by the mode buttons over the viewport and the status bar); src/transform/HistoryManager.ts, UndoRedoManager.ts, TransformManager.ts, MoveTool.ts, RotateTool.ts, ScaleTool.ts (replaced by TransformService and historyStore)

## Validation Result

- Windows 11 (2026-10-21): files on GitHub (d11cd96); the 8 files removed on main and in the local folder; npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 41 tests passed (6 files), npm run build OK

---

# VERSION 0.1.57

Release Type:
Tooling

Status:
Completed

Date:
2026-10-21

## Added

- End-to-end tests with Playwright (requested by Noam; TECH_STACK.md, Playwright; TEST_PLAN.md, End-To-End Testing): @playwright/test 1.64.1 (development dependency), playwright.config.mts, npm script test:e2e (vite build, then playwright test); the tests start the built Electron application, in a new user data folder for each test (the settings of the user are not changed)
- tests/e2e/fixtures.ts; tests/e2e/app.spec.ts (3 tests: main window, language kept after a restart, Hebrew from right to left); tests/e2e/import.spec.ts (5 tests: STL, several files, 3MF, unsupported and corrupted files); tests/e2e/transform.spec.ts (8 tests: fields, undo and redo, Ctrl+Z in a field, modes G, R, S and Escape, Ctrl+A, Shift+click, selection rectangle, group); 16 tests in total
- The test of Ctrl+Z in a field fails with the code before 0.1.55 (control 16 of lot 51)

## Changed

- tsconfig.json: playwright.config.mts type-checked; npm script lint: playwright.config.mts linted; .gitignore: test-results/ and playwright-report/
- TECH_STACK.md (End-To-End Testing, Playwright), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-23): npm install -D @playwright/test@1.64.1 and the node -e command run; package.json and package-lock.json sent (same scripts and versions as the lot); npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 41 tests passed; npm run test:e2e: 16 tests passed (29.8 s)
- Bug reported (Noam): the message "... imported" over the 3D viewport stops the clicks under it (fixed in 0.1.58)

---

# VERSION 0.1.58

Release Type:
Bug Fix

Status:
Completed

Date:
2026-10-23

## Fixed

- src/gui/import/ImportStatus.tsx: the import messages over the 3D viewport (progress, confirmation, error) stopped the clicks in the viewport under them for 3 seconds after an import, and until closed for an error (bug found by Noam in 0.1.57). The messages now let the pointer through; only their Cancel and Close buttons receive it

## Changed

- tests/e2e/transform.spec.ts: the selection rectangle is tested from the top corner of the view, under the import message, and from the bottom corner (the test from the top corner fails without the fix)
- tests/e2e/import.spec.ts: the error message is closed with its Close button (17 end-to-end tests in total)
- GUI_SPEC.md (Error Handling UI), DIRECTORY_PURPOSES.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-24): files on GitHub (72ab053, identical to the lot); npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 41 tests passed; npm run test:e2e: 17 tests passed (31.0 s); a click under an import error reaches the 3D viewport, the error closes with its Close button; Cancel still works on a large file (Noam)

---

# VERSION 0.1.59

Release Type:
Architecture Decision

Status:
Completed

Date:
2026-10-24

## Added

- ADR-032 (DECISIONS.md) and ADM-028 (ARCHITECTURE_DECISION_MATRIX.md 2.4.0): sources of the printer profiles (written by SlicyWeb from the pages of the manufacturers, never copied from a profile file of a slicer), licences, profile files as Repository Data Schema envelopes, loading by the main process, list of printers from the public SlicyWeb repository noam76tr/slicyweb-profiles (all rights reserved, no token in the application), data/printers/ as the offline fallback list (decisions D1 to D8 of Noam, analysis of lot 56)
- DATA_SCHEMA.md 3.5.0: null = unknown for the values of motion and thermal of a printer; User Preferences Schema: printer.defaultPrinter (id or null) and printer.autoloadLastPrinter (USER_SETTINGS_SPEC.md)
- KNOWN ISSUES: KI-023 (legal review of the printer profiles and of the licences before the public release), KI-024 (web version of SlicyWeb, to decide)

## Changed

- PRINTER_PROFILE_SPEC.md 2.0.0: aligned with DATA_SCHEMA.md (flat Printer Schema, names of DATA_SCHEMA.md, null for unknown values, Repository Data Schema envelope); sections without a field in DATA_SCHEMA.md marked future; sources Official and Local Custom
- USER_SETTINGS_SPEC.md (Printer Settings): defaultPrinter null when no printer was selected
- PHASES_IMPLEMENTATION_PLAN.md: Phase 7 In Progress, its decisions and the order of the lots 57 to 63; PASSATION.md

## Validation Result

- Windows 11 (2026-10-26): lots 56 and 57 on GitHub (0ac47d9, identical to the lot; DATA_SCHEMA.md 3.5.0, PRINTER_PROFILE_SPEC.md 2.0.0, ADR-032, KI-023, KI-024 checked by Noam); npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 41 tests passed

---

# VERSION 0.1.60

Release Type:
Feature

Status:
Completed

Date:
2026-10-26

## Added

- Printer profiles loaded by the main process at start (ADR-032, D4): src/storage/PrinterProfileStorage.ts reads the *.json files of data/printers/ (Official) and of the printers/ folder of the user data folder (Local Custom), and nothing else (subfolders and links not followed, 1 MB at most per file); PrinterManager validates each file (Repository Data Schema envelope, PrinterSchema, source of its folder, id not already loaded) and refuses an invalid file with PRN_002 without stopping the others
- printer:getAll, printer:get (PRN_001 for an unknown id) and printer:count serve the loaded printers (API_SPEC.md, PrinterIPC Channels)
- User preferences: printer (defaultPrinter null, autoloadLastPrinter true; DATA_SCHEMA.md 3.5.0) in UserPreferencesSchema and settings.json; a settings.json without printer keeps its theme, language and units
- Tests: tests/unit/printer_database/PrinterLoading.test.ts, tests/unit/storage/SettingsStorage.test.ts, tests/unit/electron/PrinterIPC.test.ts (59 unit tests in total); tests/e2e/printer.spec.ts (19 end-to-end tests in total)

## Changed

- src/schemas/PrinterSchema.ts: null (unknown) for the values of motion and thermal, unknown fields refused, id, brand and model not empty, at least one nozzle; PrinterProfileFileSchema (printer profile file)
- src/types/Printer.ts: number or null for the values of motion and thermal
- src/printer_database/PrinterValidator.ts: validation with PrinterSchema (a missing field is refused instead of a crash); validateThermal accepts null
- printer:add, printer:update and printer:remove: payload validated, then refused (success false, nothing changed) until the printers entered by the user (lot 61); before, they answered success without doing anything
- API_SPEC.md (PrinterIPC Channels, settings:update), ERROR_CODES_SPEC.md (PRN_001, PRN_002), SECURITY_SPEC.md (Printer Profile Files), USER_SETTINGS_SPEC.md (Backward Compatibility), PRINTER_PROFILE_SPEC.md (loading), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-26): lot 58 on GitHub (4d0023d, identical to the lot); npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 58 tests passed, 1 skipped (link test: no right to create a link on Windows); npm run test:e2e: 19 tests passed; manual check: a damaged abime.json in %APPDATA%\SlicyWeb\printers is refused with "PRN_002 Local Custom printer profile refused: abime.json (Invalid JSON)" and the application starts normally (Noam)

---

# VERSION 0.1.61

Release Type:
Feature

Status:
Completed

Date:
2026-10-26

## Added

- data/printers/: the 10 first printer profiles (ADR-032, D7), written from the pages of the manufacturers: Bambu Lab X1 Carbon, P1S, A1, A1 mini; Prusa MK4S, CORE One+, MINI+; Creality K1C, Ender-3 V3 SE; Elegoo Neptune 4 Pro. A value not published by the manufacturer is null; no value is copied from a slicer profile
- data/printers/SOURCES.md: for each printer, the pages of the manufacturer read and the date of verification (2026-10-26), the values taken from each page, the null values, and the rules used (fans, extruder, nozzles, speeds, bed temperature, materials)
- tests/unit/printer_database/PrinterProfiles.test.ts: each profile passes the schema, file name = id, source Official, listed in SOURCES.md, all loaded (72 unit tests in total)

## Changed

- tests/e2e/printer.spec.ts: the 10 printers of data/printers/ are served by printer:getAll with the printer of the user
- DIRECTORY_PURPOSES.md (data/printers/), FILE_STRUCTURE.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-27): lot 59 on GitHub (4280ee9, identical to the lot); npm run check:locales (251 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 71 tests passed, 1 skipped (link test: no right to create a link on Windows); npm run test:e2e: 19 tests passed (Noam)

---

# VERSION 0.1.62

Release Type:
Feature

Status:
Completed

Date:
2026-10-27

## Added

- Printer section of the Properties Panel (GUI_SPEC.md, Printer Section, Printer Selector): src/gui/sidebar/PrinterSection.tsx; selector with "No printer" first, then the printers grouped by brand (brands and models in alphabetical order); Brand, Model, Build Volume, Nozzle, Nozzles and Printer Limits of the selected printer; a value not published by the manufacturer (null) is shown as "Not published"
- src/services/PrinterSelectionService.ts: at start, the printers served by printer:getAll are checked with PrinterSchema and put in the printer store; the last printer (printer.defaultPrinter) is chosen again when autoloadLastPrinter is true and the printer is still loaded; a choice is saved with settings:update (autoloadLastPrinter kept as saved)
- Plate Display (GUI_SPEC.md): "Plate: X × Y mm" of the selected printer at the bottom of the 3D viewport; the build plate and the status bar follow the printer chosen
- Printer > Select Printer: gives the focus to the printer selector when the menu closes
- Translations (en, fr, he): 15 keys of the Printer section and of the plate (266 keys)
- Tests: tests/unit/services/PrinterSelection.test.ts (82 unit tests in total); tests/e2e/printer.spec.ts, Printer section: printer chosen, limits, plate, status bar, menu, printer chosen again at the next start, "No printer" (20 end-to-end tests in total)

## Changed

- src/gui/sidebar/RightSidebar.tsx: the Printer section shows PrinterSection instead of the name of the printer only
- src/gui/menus/MenuBar.tsx: an item can give the focus to an element of the window when its menu closes (focusId)
- GUI_SPEC.md (Printer Menu, Printer Section, Printer Selector, Plate Display), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PASSATION.md
- KNOWN ISSUES: KI-015 updated (PrinterPanel removed; the panels of Phases 8 to 10 and Renderer.ts remain)

## Removed

- src/gui/panels/PrinterPanel.tsx: never used, hardcoded English text (KI-015); replaced by the Printer section of the Properties Panel (decision of Noam)

## Validation Result

- Windows 11 (2026-10-27): lot 60 on GitHub (6ea31df, identical to the lot); npm run check:locales (266 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 81 tests passed, 1 skipped (link test: no right to create a link on Windows); npm run test:e2e: 20 tests passed; manual checks: X1 Carbon plate 256 × 256 mm and status bar, "Not published" for the jerk and the chamber temperature, MK4S speeds and acceleration "Not published", MK4S chosen again after a restart, "No printer" hides the plate and its size, Printer > Select Printer gives the focus to the list, plate size at the bottom right in Hebrew (Noam)

---

# VERSION 0.1.63

Release Type:
Feature

Status:
Completed

Date:
2026-10-27

## Added

- Printers entered by the user (Local Custom, Phase 7 lot 61): printer:add, printer:update and printer:remove change them (API_SPEC.md, PrinterIPC Channels). The main process chooses the id of a new printer (user_ + random UUID), writes one file per printer in the printers/ folder of the user data folder (Repository Data Schema envelope, source Local Custom), then changes the printers; Official printers are never changed
- Printer Manager (GUI_SPEC.md): src/gui/dialogs/PrinterManagerDialog.tsx and printerForm.ts, opened by Printer > Manage Printers and by the "Manage…" button of the Printer section; My printers, New printer, Copy a printer (copy named "Model (copy)"), form of all the fields of the Printer Schema (a limit left empty is null, "Not published"), Save, Delete with a confirmation
- Printer selector: the printers of the user in the group "My printers", after "No printer"
- src/gui/components/ui/dialog.tsx: shadcn/ui Dialog component (Base UI, no new npm dependency)
- ERROR_CODES_SPEC.md 2.2.0: PRN_005 Printer Not Editable, PRN_006 Printer Already Exists, PRN_007 Printer Not Saved
- Translations (en, fr, he): 42 keys of the Printer Manager (308 keys)
- Tests: tests/unit/printer_database/UserPrinters.test.ts, tests/unit/gui/dialogs/printerForm.test.ts, printers of the user in PrinterIPC.test.ts and PrinterSelection.test.ts (104 unit tests in total); tests/e2e/printer.spec.ts, Printer Manager (21 end-to-end tests in total)

## Changed

- printer:getAll also returns userPrinterIds (ids of the printers of the user); printers unchanged
- printer:add and printer:update: the default nozzle must be one of the nozzles; validation errors given as "path: message"
- src/storage/PrinterProfileStorage.ts: writes (temporary file, then renamed) and deletes a profile file, by file name only
- src/services/PrinterSelectionService.ts: add, update, remove; the selected printer follows its update and is cleared (with the saved choice) when it is removed
- API_SPEC.md (PrinterIPC Channels), GUI_SPEC.md (Printer Menu, Printer Selector, Printer Manager), SECURITY_SPEC.md (Printer Profile Files), PRINTER_PROFILE_SPEC.md (printers of the user), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-27): npm run check:locales (308 keys), npm run check:ipc (22 channels), npm run typecheck and npm run lint report no errors, npm test: 103 tests passed, 1 skipped (link test); npm run test:e2e: 21 tests passed; the 10 manual checks of the Printer Manager passed, Hebrew included (Noam). src/gui/panels/PresetPanel.tsx restored and src/gui/panels/PrinterPanel.tsx deleted on main. Repository noam76tr/slicyweb-profiles created (public, LICENSE.md all rights reserved, the 10 profiles and SOURCES.md). Sending of lot 61 to GitHub: checked with lot 62

---

# VERSION 0.1.64

Release Type:
Feature

Status:
Completed

Date:
2026-10-27

## Added

- Synchronization of the printer profiles with the SlicyWeb profile repository noam76tr/slicyweb-profiles (ADR-032 D5 and its amendment, Phase 7 lot 62): src/repositories/PrinterRepositorySync.ts downloads index.json from the main branch, then each profile file at the tag named by the index; HTTPS under https://raw.githubusercontent.com/noam76tr/slicyweb-profiles/ only, no redirection, 15 seconds and 1 MB per file, 20 MB for the whole download, at most 500 profiles; SHA-256, Repository Data Schema envelope, PrinterSchema, source Official and id checked; all or nothing (SYNC_002, SYNC_003, SYNC_004)
- src/services/ProfileSyncService.ts: check at start in the background, at most once every 24 hours, or at once with Printer > Refresh Profiles; version rule: profiles of the repository older than those of the application (tag vX.Y.Z) are never kept, and the cache is used only when its tag is not older than data/printers/index.json; a new index.json is kept in the cache, then the printers are loaded again; a failure keeps the profiles in use; each check is saved (RepositorySync Result Schema); a cache lost after a successful check is rebuilt at the next start
- src/storage/PrinterProfileCache.ts: cache in cache/printers/ of the user data folder (profile files and index.json, cache.json in the Cache Schema, sync.json); written in a temporary folder then swapped; validated again at each start, and used in place of data/printers/ only when it is complete and unchanged (CACHE_001 otherwise)
- printer:refresh (23 IPC channels): `{ force }`, answers `{ status, profiles }`; printer:getAll also returns `profiles` (origin, tag, date of the last check)
- Printer section: a line gives the profiles in use ("Profiles v1.0.0 (SlicyWeb repository)" or "Profiles v1.0.0 of the application"); Printer > Refresh Profiles is available and shows its result in this line; updated profiles replace the list without restart
- Setting "Check for profile updates automatically" (printer.autoCheckProfiles, true by default): a check box under the profiles line; when unchecked, no check at start (Refresh Profiles still works); a settings.json without it loads with true
- DATA_SCHEMA.md 3.6.0: Profile Repository Index Schema (index.json, tag vX.Y.Z, version rule); cache.json of the printer profile cache; User Preferences Schema: printer.autoCheckProfiles
- data/printers/index.json (tag v1.0.0, 10 profiles) and scripts/build/generate-profile-index.mjs (npm run profiles:index -- vX.Y.Z)
- src/schemas/ProfileRepositorySchema.ts, src/types/ProfileSync.ts (ProfileCacheStore contract)
- Translations (en, fr, he): 9 keys of the profiles (317 keys)
- Tests: tests/unit/repositories/PrinterRepositorySync.test.ts, tests/unit/services/ProfileSync.test.ts, printer:refresh in PrinterIPC.test.ts, refresh and autoCheckProfiles in PrinterSelection.test.ts, index.json in PrinterProfiles.test.ts (134 unit tests in total); tests/e2e/printer.spec.ts, profiles line, Refresh Profiles and the setting (22 end-to-end tests in total)

## Changed

- src/repositories/PrinterRepositorySync.ts: the placeholder (never used, never registered) is replaced by the download of the profile repository
- src/electron/main.ts: the Official printers come from the cache when it is valid, otherwise from data/printers/; the IPC handlers are registered after the printers are loaded
- src/storage/PrinterProfileStorage.ts: index.json is not read as a profile
- DECISIONS.md: ADR-032 amended (tag read from index.json on main; KI-024 decided, option B)
- API_SPEC.md (PrinterIPC Channels, Allowed IPC Channels), SECURITY_SPEC.md (Printer Profile Download), GUI_SPEC.md (Printer Section), PRINTER_PROFILE_SPEC.md (profile repository, publishing an update), ERROR_CODES_SPEC.md (use of CACHE_001, SYNC_001 to SYNC_004 for the printer profiles; no new code), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md, PASSATION.md
- USER_SETTINGS_SPEC.md (Printer Settings, Backward Compatibility)
- KNOWN ISSUES: KI-025 added (signature of index.json)
- KI-024 resolved (decision of Noam, option B: the desktop application stays the target; the logic of the download and of the validation of the profiles uses no Electron and no Node.js module, for a future web version)

## Validation Result

- Windows 11 (2026-10-27): lots 61 and 62 on GitHub (3fa56a2, identical to the lots); npm ci, npm run check:locales (317 keys), npm run check:ipc (23 channels), npm run typecheck and npm run lint report no errors, npm test: 133 tests passed, 1 skipped (link test); npm run test:e2e: 22 tests passed. index.json sent to noam76tr/slicyweb-profiles and release v1.0.0 created (external review: the tag points to main, the 10 SHA-256 match). Manual checks: Refresh Profiles gives "Profiles updated (v1.0.0)" and "Profiles v1.0.0 (SlicyWeb repository)", kept after a restart; without network "Repository unreachable, current profiles kept"; setting "Check for profile updates automatically" and Hebrew correct (Noam). Defect reported: before the release, the message "Repository unreachable" was shown while index.json was missing (fixed in 0.1.65)

---

# VERSION 0.1.65

Release Type:
Fix and Security

Status:
Completed

Date:
2026-10-27

## Fixed

- Refresh Profiles: a repository that answers HTTP 404 for index.json or for a file at the tag (no version published yet, or tag not created yet) is no longer shown as "Repository unreachable": printer:refresh answers the status notPublished (success, no error) and the Printer section shows "No published version of the profiles yet, current profiles kept."; network errors, timeouts and other HTTP errors stay "Repository unreachable" (SYNC_002, SYNC_003)

## Security

- Electron 44.9.3 (was 44.7.1): GHSA-jr5w-w6x2-84p9, compromised eMudhra intermediate certificates (Electron 44.0.0 to 44.9.0)
- npm audit fix (without --force): shadcn 4.23.0 (development dependency, command line tool, not shipped with the application) no longer depends on express and body-parser (GHSA-27r3-jxmh-p828); fast-uri 3.1.9 (through ajv, used by shadcn; GHSA-w74x-v6f9-j3xg, GHSA-xhq7-xmqj-769h, GHSA-wjr9-j795-jxcr, GHSA-333x-w4r6-6crp); undici 7.30.1 (through shadcn and @electron/get, used at install time to download Electron; GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472, GHSA-xjj6-f33q-929c). None of these three packages is part of the built application
- npm audit now reports only zod (KI-026)

## Changed

- API_SPEC.md (printer:refresh, status notPublished), GUI_SPEC.md (Printer Section), ERROR_CODES_SPEC.md (SYNC_002), PRINTER_PROFILE_SPEC.md, DECISIONS.md (ADR-025, Electron 44.9.3), DIRECTORY_PURPOSES.md, PASSATION.md
- Translations (en, fr, he): 1 key, printer.profiles.notPublished (318 keys)
- Tests: HTTP 404 and 503 in PrinterRepositorySync.test.ts, notPublished in ProfileSync.test.ts and PrinterSelection.test.ts, message accepted in tests/e2e/printer.spec.ts (135 unit tests in total, 22 end-to-end tests)
- KNOWN ISSUES: KI-013 resolved (npm audit no longer reports braces); KI-026 added (zod 3)

## Validation Result

- Windows 11 (2026-10-27): lot 63 on GitHub (81e9964, identical to the lot), with package.json and package-lock.json produced by Noam (electron 44.9.3, shadcn 4.23.0, undici 7.30.1, fast-uri 3.1.9, body-parser no longer installed); npx electron --version: v44.9.3; npm audit reports only zod (KI-026); npm run check:locales (318 keys), npm run check:ipc (23 channels), npm run typecheck and npm run lint report no errors, npm test: 134 tests passed, 1 skipped (link test); npm run test:e2e: 22 tests passed; manual checks: import, printer and move, Refresh Profiles "Profiles up to date", Hebrew (Noam). The check without network was not repeated (checked with lot 62)

---

# VERSION 0.1.66

Release Type:
Printer Database

Status:
Completed

Date:
2026-10-27

## Added

- Technical Phase 7 - Printer Database closed (PHASES_IMPLEMENTATION_PLAN.md: progress and validation result, from the checks and manual controls of Noam for lots 58 to 63)

## Changed

- PHASES_IMPLEMENTATION_PLAN.md: Phase 7 Completed
- PASSATION.md: Phase 7 Completed; next: Phase 8 - Material Database
- ARCHITECTURE.md (Printer Repository Module), FILE_STRUCTURE.md, DIRECTORY_PURPOSES.md: PrinterCache replaced by PrinterProfileCache; PrinterImporter.ts kept for Import Profile (Phase 15)

## Removed

- src/printer_database/PrinterCache.ts: never used (an in-memory Map), replaced by src/storage/PrinterProfileCache.ts (lot 62)

## Validation Result

- Windows 11 (2026-10-27): lot 64 on GitHub (ff9c550, identical to the lot), PrinterCache.ts deleted on GitHub and in the local folder; npm run check:locales (318 keys), npm run check:ipc (23 channels), npm run typecheck and npm run lint report no errors, npm test: 134 tests passed, 1 skipped (link test); npm run test:e2e: 22 tests passed; manual check: printer list unchanged (Noam). Technical Phase 7 closed

---

# VERSION 0.1.67

Release Type:
Architecture Decision

Status:
Completed

Date:
2026-10-28

## Added

- ADR-033 (DECISIONS.md) and ADM-029 (ARCHITECTURE_DECISION_MATRIX.md 2.5.0): sources of the materials and filaments (written by SlicyWeb from the technical data sheets of the manufacturers, never copied from a profile file of a slicer), a material is a family whose ranges come from its shipped filaments, profile files as Repository Data Schema envelopes, null for values not published, families and aliases, loading by the main process and new IPC channels, first list (5 families, 12 product lines), Material and Filament sections, filaments of the user, later updates from noam76tr/slicyweb-profiles (decisions D1 to D11 of Noam, analysis of lot 65)
- DATA_SCHEMA.md 3.7.0: Material rules (brand and description optional, null when not published, ranges of a shipped family); Filament rules (temperature ranges with the structure of Material Thermal Properties, decision of Noam in lot 66; manufacturerSettings with exactly its five fields; color, density and pricePerKg may be null; recommendedProfile empty until Phase 10); Repository Data Schema types printer, material and filament; User Preferences Schema: material.defaultMaterial, material.defaultFilament (new) and material.autoloadLastMaterial
- ERROR_CODES_SPEC.md: Filament Errors FIL_001 (Filament Not Found) and FIL_002 (Invalid Filament Profile)

## Changed

- MATERIAL_PROFILE_SPEC.md 2.0.0: aligned with DATA_SCHEMA.md (flat Complete Material Schema, null, envelope); Material Families (reference list) and aliases of the words of the printer pages; sections without a field in DATA_SCHEMA.md marked future
- FILAMENT_SETTINGS_SPEC.md 2.0.0: aligned with DATA_SCHEMA.md (flat Filament Schema, temperature ranges and single values, null, envelope); sources Official and Custom User Profile; sections without a field in DATA_SCHEMA.md marked future
- USER_SETTINGS_SPEC.md (Material Settings): defaultMaterial null instead of "PLA", defaultFilament added
- GUI_SPEC.md: Material Section and Filament Section (Phase 8 behaviour); Printer Manager: supportedFilaments empty until the filaments exist (Phase 8, was "Phase 9")
- PHASES_IMPLEMENTATION_PLAN.md: Phase 8 In Progress, its decisions and the order of the lots 65 to 72; PASSATION.md
- KNOWN ISSUES: KI-023 also covers the materials and filaments (ADR-033)

## Validation Result

- Windows 11 (2026-10-30): lot 66 on GitHub (d5d414f, identical to the lot), checked with the printer profiles v1.0.1 (0.1.68, same run of Noam)

---

# VERSION 0.1.68

Release Type:
Printer Database (data)

Status:
Completed

Date:
2026-10-28

## Added

- Printer profiles v1.0.1: 69 printers added to data/printers/ (79 in total, the 10 printers of v1.0.0 unchanged): 47 printers on sale from ten brands and 22 older printers or printers of other brands, written from pages of the manufacturers read on 2026-10-28 (ADR-032, D2): Anycubic (10), Artillery (2), Bambu Lab (2), BIQU (3), Creality (19), Elegoo (4), Flashforge (6), Prusa (2), QIDI (6), Raise3D (2), Snapmaker (2), Sovol (5), UltiMaker (6, with the MakerBot Sketch Sprint); a value that is not published is null (DATA_SCHEMA.md 3.5.0)
- data/printers/SOURCES.md: one section per new printer (pages and values read), and the rules added in v1.0.1 (nozzle 0.4 when no diameter is published, volume of one nozzle for a printer with several nozzles, lower value kept when two pages differ), and a list of the printers whose official sheet was not found (not added)

## Changed

- data/printers/index.json: tag v1.0.1, 79 profiles with their SHA-256 (fewer than MAX_INDEX_PROFILES, 500)
- Tests: PrinterProfiles.test.ts (79 profiles with the 10 first printers, SOURCES.md read on 2026-10-28), PrinterRepositorySync.test.ts (79 profiles, first file anycubic_kobra2_max.json), ProfileSync.test.ts (tag v1.0.1 of data/printers/, 80 files in the cache folder), tests/e2e/printer.spec.ts (79 printers and the printer of the user, line "Profiles v1.0.1")
- DIRECTORY_PURPOSES.md, PASSATION.md

## Validation Result

- Windows 11 (2026-10-30): printer profiles v1.0.1 on GitHub; npm test: 203 tests passed, 1 skipped (link test); npm run test:e2e: 22 tests passed; release v1.0.1 of noam76tr/slicyweb-profiles published; Printer > Refresh Profiles shows "Profiles updated (v1.0.1)" with the new printers (Noam)

---

# VERSION 0.1.69

Release Type:
3D Viewport

Status:
In Progress

Date:
2026-10-30

## Added

- Build plate drawn as a magnetic print sheet when a printer is selected (request of Noam, 2026-10-30; GUI_SPEC.md, Build Plate): dark sheet with a light grain (tiled texture drawn by the application), rounded corners and a thin rim; a tab centered on the front edge (Y negative, ADR-028) shows the front of the printer, with no arrow and no "Front" text; the grid stays visible on the sheet and stops at its rounded corners
- Name of the printer (brand and model) written on the sheet along the front edge, in text only and with low contrast; no logo of a manufacturer
- tests/e2e/printer.spec.ts: the plate and the printer name are drawn with a printer and removed with "No printer"; a click on the plate is a click in the empty space, a click on the object over the plate selects it (23 end-to-end tests)

## Changed

- src/renderer/helpers/WorkspaceHelpers.ts: sheet (ShapeGeometry, grain, rim, tab), grid clipped at the rounded corners, printer name (setPrinterName), getPlateState for the tests; the sheet and the name are never picked (only the objects are), they follow the size of the plate and disappear without a printer
- src/constants/ViewportConstants.ts: BUILD_PLATE_COLOR #1A1A1D, grain, rim, corner radius and tab sizes, text of the printer name (PLATE_NAME_*)
- src/gui/viewport/Viewport.tsx: printerName property; data-plate and data-plate-name attributes of the viewport, read by the end-to-end tests
- src/gui/App.tsx: passes the name of the selected printer to the viewport
- GUI_SPEC.md (Build Plate): appearance of the plate; DIRECTORY_PURPOSES.md
- PHASES_IMPLEMENTATION_PLAN.md: lot 67 outside Phase 8; the Phase 8 lots become 68 to 73; navigation cube after the closure of Phase 8 (decision of Noam, 2026-10-30); lot numbers updated in DECISIONS.md (ADR-033), GUI_SPEC.md, FILAMENT_SETTINGS_SPEC.md, ERROR_CODES_SPEC.md and PASSATION.md
- PASSATION.md

## Known Limitations

- No light theme yet (GUI_SPEC.md, Visual Style: optional); the sheet is dark in both themes, like a real sheet, so that the grid and the name stay readable on a light background

---

# VERSION 0.2.0

Release Type:

GUI Foundation

Status: Planned

Date: TBD


---


## Planned Features

Main Window

Menu Bar

Toolbar

Left Sidebar

Object List

Viewport Container

Property Panels

Status Bar

Theme Support

Dark Theme

Light Theme

Panel Resizing


---


## Validation Requirements


Application Starts

Layout Stable

Responsive Panels

Persistent Layout

---



# VERSION 0.3.0

Release Type: 3D Viewport

Status: Planned

Date: TBD

---

## Planned Features



3D Renderer

Grid Visualization

Axis Visualization

Camera Controls

View Presets

Selection Support

Viewport Navigation

---


## Camera Features

Zoom

Pan

Rotate

Focus

Reset Camera

---



## Validation Requirements

Smooth Rendering

Stable Navigation

Large Scene Support



---



# VERSION 0.4.0

Release Type: Model Import

Status: Planned

Date: TBD

---
## Planned Features

STL Import

3MF Import

File Validation

Scene Integration

Object Registration


---


## Validation Requirements


Multiple Imports

Large Files Supported

Corruption Detection

Import Error Handling


---

# VERSION 0.5.0

Release Type: Transformation System

Status: Planned

Date: TBD


---


## Planned Features

Move Tool

Rotate Tool

Scale Tool

Duplicate Tool

Delete Tool

Center Tool

Reset Tool

Undo System

Redo System

History Stack

Transaction System


---



## Validation Requirements

Accurate Transformations

No Geometry Corruption

Multi Object Support


---


# VERSION 0.6.0

Release Type: Printer Management

Status: Planned

Date: TBD


---


## Planned Features

Printer Database

Printer Selection

Printer Profiles

Build Plate Generation

Printer Validation


---



## Future Integrations

GitHub Printer Profiles

Official Manufacturer Profiles

Community Profiles


---


## Validation Requirements

Dynamic Build Plate

Printer Consistency

Profile Validation


---


# VERSION 0.7.0

Release Type: Material Management

Status: Planned

Date: TBD


---



## Planned Features


Material Database

Material Profiles

Material Selection

Material Validation

Material Presets

Filament Profiles

Manufacturer Filaments

Filament Validation


---



## Initial Supported Materials


PLA

PLA+

PETG

ABS

ASA

TPU

PCTG

PC

Nylon

Nylon CF

PP

---


## Validation Requirements


Material Consistency

Temperature Validation

Profile Integrity


---


# VERSION 0.8.0

Release Type: Model Analysis

Status: Planned

Date: TBD


---


## Planned Features

Geometry Analysis

Mesh Analysis

Dimensions

Volume

Surface Area

Overhang Detection

Bridge Detection

Thin Wall Detection

Stability Analysis

Object Classification

Category Detection

Confidence Score

---



## Validation Requirements


Repeatable Results

Deterministic Analysis

Large Model Support

---


# VERSION 0.9.0

Release Type:
Recommendation Engine
Classification Integration
Filament Analysis
Print Preset Selection
Confidence Scoring

Status: Planned

Date: TBD

---

## Planned Features

Automatic Recommendations

Quality Suggestions

Speed Suggestions

Support Suggestions

Cooling Suggestions

Retraction Suggestions

Warning Generation

Print Preset Selection

Support Strategy

Confidence Score


---


## Recommendation Inputs

Printer

Material

Filament

Model Analysis

Object Classification


---



## Validation Requirements


Printer Safe

Material Safe

Geometry Safe

---



# VERSION 1.0.0

Release Type: Stable Release

Status: Planned

Date: TBD

---


## Planned Features

- Optimization Engine
- Orientation Search
- Support Reduction
- Cost Estimation
- Project Save
- Project Load
- Settings Persistence
- Error Reporting
- Performance Improvements
- WYPROJ Project Format
- Auto Save
- Recovery Mode
- Material Optimization
- Schema Validation Layer
- Repository Synchronization
- Notification System
- IPC Layer
- Recovery System
- Target Slicer Export (OrcaSlicer, Bambu Studio, PrusaSlicer, Cura)

---


## Validation Requirements

Stable Platform
No Critical Errors
Documentation Complete
Testing Complete

---


# PLANNED FUTURE VERSIONS

---

# VERSION 1.1.0

Status: Future

---


## Candidate Features


Plugin System

Plugin Marketplace

G-Code Engine


---



# VERSION 1.2.0

Status: Future


---


## Candidate Features

Multi Material Support

AMS Support

Color Assignment

Material Mapping


---


# VERSION 1.3.0


Status: Future


---


## Candidate Features

Cloud Synchronization

Remote Project Storage

Profile Synchronization


---


# VERSION 1.4.0

Status: Future


---



## Candidate Features


Remote Printer Monitoring

Camera Integration

Live Status Reporting


---


# VERSION 1.5.0

Status: Future

---


## Candidate Features


Machine Learning Optimization

Automatic Profile Learning

Print Success Prediction

Failure Detection Models

Vision Classification

Filament Tracking

Community Learning
---



# BREAKING CHANGES SECTION


Any breaking changes must be recorded here.


Template:


```text

Version:

Affected Module:

Reason:

Migration Required:

Migration Instructions:

```



---



# DEPRECATION SECTION



Any deprecated functionality must be recorded here.


Template:



```text

Feature:

Deprecated In:

Removal Version:

Replacement:

```



---



# HOTFIX SECTION



Used only for urgent production fixes.



Template:



```text

Version:

Issue:

Impact:

Fix:

```



---



# MIGRATION HISTORY


Used when data structures change.


Template:



```text

Version:

Schema:

Changes:

Migration Tool:

Required:

```



---



# KNOWN ISSUES


Known inconsistencies that are not resolved yet.

An entry is removed when the version that resolves it is released; that version records the fix.


Template:



```text

Identifier:

Since:

Affected Module:

Issue:

Resolve Before:

Planned Resolution:

```


---


Identifier: KI-007

Since: 0.1.19

Affected Module: docs/02-architecture/API_SPEC.md

Issue: The response of Generate Recommendation differs from the Recommendation Schema (DATA_SCHEMA.md): it uses printPreset instead of preset and omits printerId, materialId, filamentId, classification and createdAt. API_SPEC.md is still 2.1.0, while the change of this response to one recommendation per object is non-additive (VERSIONING_POLICY.md: 3.0.0).

Resolve Before: Implementation of the Recommendation API

Planned Resolution: Documentation lot, with the API_SPEC.md 3.0.0 decision


---


Identifier: KI-008

Since: 0.1.23

Affected Module: src/recommendation_engine/DecisionEngine.ts, src/recommendation_engine/ValidationEngine.ts

Issue: The recommended profile is initialized from preset.settings and adjusted for geometry (supports when overhangs are detected) and generic ranges (ValidationEngine). Printer limits and material limits are not applied (PRINT_PRESETS_SPEC.md, Printer Overrides, Material Overrides, Golden Rule): the recommendation generation receives printer, material and filament identifiers only.

Resolve Before: Phase 14 - Target Slicer Export (technical plan); Roadmap Phase 12

Planned Resolution: With Technical Phase 10 (Classification and Recommendation Engine)


---


Identifier: KI-010

Since: 0.1.23

Affected Module: src/recommendation_engine/DecisionEngine.ts, src/recommendation_engine/RecommendationBuilder.ts

Issue: The confidenceScore of the recommendation is the confidenceScore of the preset only. It does not take the classification confidence (classification.confidenceScore) into account.

Planned Resolution: Define the combination rule in RECOMMENDATION_RULES.md or AI_ENGINE_SPEC.md (decision required), then apply it.

Resolve Before: Phase 14 - Target Slicer Export (technical plan); Roadmap Phase 12


---


Identifier: KI-011

Since: 0.1.23

Affected Module: src/classification_engine/ClassificationValidator.ts, src/optimization_engine/ClassificationValidator.ts, src/gui/panels/AnalysisPanel.tsx, src/services/AnalysisService.ts

Issue: ClassificationValidator is not called anywhere since the validated field was removed (0.1.23). AnalysisPanel no longer displays the confidence level: no component passes the confidenceLevel property (AnalysisService.getConfidenceLevel).

Planned Resolution: Call ClassificationValidator in the classification workflow; pass the confidence level to AnalysisPanel when the panel is connected.

Resolve Before: Technical Phase 3 - GUI Foundation (panel); Technical Phase 10 - Classification and Recommendation Engine (validator)


---


Identifier: KI-012

Since: 0.1.23

Affected Module: docs/02-architecture/SLICER_EXPORT_SPEC.md, src/recommendation_engine/DecisionEngine.ts

Issue: The support type "organic" is forced when overhangs are detected and the preset has no supports. SLICER_EXPORT_SPEC.md has no value table for supports.type per target slicer (Value Conversion Rules, Enumerations); Cura has no "organic" support type (Cura equivalent: tree).

Planned Resolution: Add the supports.type value table per target slicer to SLICER_EXPORT_SPEC.md (Cura: organic = tree).

Resolve Before: Phase 14 - Target Slicer Export (technical plan); Roadmap Phase 12


---


Identifier: KI-015

Since: 0.1.35

Affected Module: src/gui/panels/ (MaterialPanel, FilamentPanel, PresetPanel, AnalysisPanel, RecommendationPanel), src/renderer/Renderer.ts

Issue: These components are not used by the interface of Phase 3, and some of them contain hardcoded English text, against the Internationalization Rule (CLAUDE.md). The Properties Panel (src/gui/sidebar/RightSidebar.tsx) is used instead of the panels. Since 0.1.36, Viewport.tsx is used (3D viewport); src/renderer/Renderer.ts is no longer used and duplicates RendererManager.

Resolve Before: the phase that displays each component (Phases 7 to 10 for the panels; KI-011 for AnalysisPanel); Renderer.ts can be removed at any time. ViewportToolbar and ViewportStatus removed in 0.1.56 (replaced by the mode buttons over the viewport and the status bar); PrinterPanel removed in 0.1.62 (replaced by the Printer section of the Properties Panel)

Planned Resolution: When a component is used, read its texts from the dictionaries (useTranslation) and its colors from the theme variables, or remove it if the Properties Panel section replaces it.


---


Identifier: KI-019

Since: 0.1.43

Affected Module: src/importer/ThreeMFParser.ts, src/scene/SceneIntegration.ts

Issue: A Bambu Studio (or OrcaSlicer) project with several build plates stores the objects of every plate in one build, each plate placed beside the previous one. The import keeps the layout of the file (ADR-030): the objects of the different plates are far from each other, and the group can be larger than the build plate.

Resolve Before: Phase 14 - Target Slicer Export (technical plan, Bambu Family)

Planned Resolution: Read the plate of each object (Metadata/model_settings.config of Bambu Studio), then import one plate chosen by the user or place each plate on the build plate; or keep the layout and let the user arrange the objects (Phase 6 - Transform System).


---


Identifier: KI-020

Since: 0.1.43

Affected Module: DATA_SCHEMA.md (Object Schema), src/importer/ThreeMFParser.ts

Issue: IMPORT_EXPORT_SPEC.md (3MF Import, Extracted Data; Metadata Handling) lists the object names and the metadata (author, creation date, application) of a 3MF file, but the Object Schema has no field for them. The import does not keep them: the objects of a 3MF file are named after the file ("plate (1)", "plate (2)").

Resolve Before: Phase 13 - Project Persistence (technical plan)

Planned Resolution: Decide whether the Object Schema gets a name field (and where the metadata of an imported file are stored), then read them in ThreeMFParser.ts; or remove them from IMPORT_EXPORT_SPEC.md.


---


Identifier: KI-021

Since: 0.1.51

Affected Module: src/services/TransformService.ts, DATA_SCHEMA.md (Transform Rules)

Issue: An object is always placed on the build plate (lowest point at Z = 0); it cannot be sunk partly under the plate (advanced feature of the slicers, used to cut off the bottom of a model). Decision of Noam: not allowed for now.

Resolve Before: Phase 15 - Advanced Features (technical plan)

Planned Resolution: Decide how a sunk object is chosen (Position Z editable below its resting height, or a dedicated tool), how it is stored (Transform Rules) and exported (cut at Z = 0), then allow it in TransformService.


---


Identifier: KI-023

Since: 0.1.59

Affected Module: data/printers/, data/materials/, data/filaments/, noam76tr/slicyweb-profiles (ADR-032, ADR-033)

Issue: The printer profiles, materials and filaments of SlicyWeb are written from the pages and technical data sheets of the manufacturers and no profile file of a slicer is copied (the slicer profiles are under AGPL-3.0 or LGPL-3.0, or without licence). No legal review has confirmed this approach (copyright of the pages, database right in Europe, licence of the data of the profile repository, all rights reserved).

Resolve Before: Phase 16 - Production Release (technical plan)

Planned Resolution: Legal review of the printer profiles, materials and filaments, of the SOURCES.md files and of the licences before the public release.


---


Identifier: KI-025

Since: 0.1.64

Affected Module: Printer profile synchronization (src/repositories/PrinterRepositorySync.ts, noam76tr/slicyweb-profiles; ADR-032)

Issue: The SHA-256 of index.json checks the integrity of the profile files, not their author. Anyone who can write to the profile repository (a stolen GitHub account, for example) can publish profiles that the application accepts. The GitHub account of the owner uses two-factor authentication.

Resolve Before: Phase 16 - Production Release

Planned Resolution: Signature of index.json: a private key kept by Noam signs index.json when the profiles are published; the public key is in the application, which refuses an index without a valid signature (SYNC_004). Algorithm and file format to decide (ADR and DATA_SCHEMA.md).


---


Identifier: KI-026

Since: 0.1.65

Affected Module: package.json (zod 3.25, used by the application for every runtime validation; also by shadcn and eslint-plugin-react-hooks)

Issue: npm audit reports GHSA-mrhx-c7xc-m3w5 (high): zod before 4.6.6 can exhaust memory while validating oversized constrained collections. The only fix is zod 4 (npm audit fix --force installs zod 4.6.7), a major version with breaking changes for the schemas of the application (ADR-025: Zod 3.25.x). In the application, the data validated by zod is bounded before validation: profile files and index.json at 1 MB each (20 MB for a download), 500 profiles, imported files read by size-limited readers, IPC payloads from the window of the application only.

Resolve Before: Phase 16 - Production Validation and Release

Planned Resolution: Migrate the schemas to zod 4 in a dedicated lot (ADR-025 amendment, all tests), then check npm audit. Never run npm audit fix --force: it changes major versions without review.


---



# RELEASE CHECKLIST TEMPLATE


Before every release:

[ ] Documentation Updated

[ ] Changelog Updated

[ ] Version Updated

[ ] Tests Passed

[ ] Schema Validated

[ ] Compatibility Verified

[ ] No Critical Bugs

[ ] Release Notes Written

[ ] Impact Analysis Completed

[ ] Documentation Dependencies Reviewed

[ ] Governance Validation Completed


---


# CONTRIBUTION RULE


Every modification affecting:


- Architecture

- Data Schema

- Public APIs

- Project Structure


must include a CHANGELOG update.


---

# GOVERNANCE CHANGE RULE

Changes affecting:

- Architecture
- Domain Ownership
- Dependencies
- Documentation Structure
- Governance Documents

must be recorded in the changelog.

---

# GOLDEN RULE


If a change is important enough to be remembered,

it is important enough to be written in this file.


---


# End Of Document
