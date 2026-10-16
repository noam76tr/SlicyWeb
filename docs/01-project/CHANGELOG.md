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
In Progress

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


Identifier: KI-013

Since: 0.1.29

Affected Module: package.json (development dependencies: shadcn and its dependency chain)

Issue: npm audit reports 7 high severity vulnerabilities from the braces package (GHSA-vfj7-8cjw-p6xm, braces through 3.0.3: deeply nested brace patterns exhaust the call stack, denial of service). No patched version of braces exists. The only fix offered by npm (npm audit fix --force) installs shadcn 1.0.0, an obsolete major version, and is rejected. braces is used by development tools to expand file patterns; SlicyWeb never passes user data to it, and the shadcn package is a development dependency (0.1.30), not shipped with the application.

Resolve Before: Phase 16 - Production Validation and Release (technical plan)

Planned Resolution: Update shadcn (or the package in the chain) when a version depending on a patched braces is published; check with npm audit and npm audit --omit=dev.


---


Identifier: KI-014

Since: 0.1.33

Affected Module: src/state/ (appStore.ts, printerStore.ts, materialStore.ts, filamentStore.ts, presetStore.ts, sceneStore.ts, objectStore.ts)

Issue: The selection is stored twice. appStore holds selectedPrinter, selectedMaterial, selectedFilament and selectedPreset, which printerStore, materialStore, filamentStore and presetStore also hold; sceneStore holds selectedObject while objectStore holds selectedObjectId. No document says which store is the reference. The GUI (status bar, Properties Panel, Object Panel) reads printerStore, materialStore, filamentStore, presetStore and objectStore, the stores that also hold the lists.

Resolve Before: Phase 5 - Model Import (technical plan), before objects and selections are written by the application

Planned Resolution: Decide the reference store for each selection, document it (DIRECTORY_PURPOSES.md, State Management), and remove or derive the duplicate.


---


Identifier: KI-015

Since: 0.1.35

Affected Module: src/gui/panels/ (PrinterPanel, MaterialPanel, FilamentPanel, PresetPanel, AnalysisPanel, RecommendationPanel), src/gui/viewport/ (ViewportToolbar, ViewportStatus), src/renderer/Renderer.ts

Issue: These components are not used by the interface of Phase 3, and some of them contain hardcoded English text, against the Internationalization Rule (CLAUDE.md). The Properties Panel (src/gui/sidebar/RightSidebar.tsx) is used instead of the panels. Since 0.1.36, Viewport.tsx is used (3D viewport); src/renderer/Renderer.ts is no longer used and duplicates RendererManager.

Resolve Before: the phase that displays each component (Phase 6 - Transform System for ViewportToolbar and ViewportStatus; Phases 7 to 10 for the panels; KI-011 for AnalysisPanel); Renderer.ts can be removed at any time

Planned Resolution: When a component is used, read its texts from the dictionaries (useTranslation) and its colors from the theme variables, or remove it if the Properties Panel section replaces it.


---


Identifier: KI-016

Since: 0.1.35

Affected Module: src/electron/preload.ts (window.slicyWeb)

Issue: The preload bridge exposes send(channel, data), invoke(channel, data) and on(channel, callback) for any channel name given by the renderer. Nothing limits the renderer to the channels registered by the main process (src/electron/ipc/: project:*, import:*, printer:*, settings:*, storage:*). on() adds an ipcRenderer listener that can never be removed: a component that subscribes again at each display accumulates listeners. Today only invoke("settings:get") and invoke("settings:language") are used (I18nProvider); send and on are not used.

Resolve Before: Phase 5 - Model Import (technical plan), and at the latest with the first IPC channel that reads files on disk (import:stl, import:3mf, project:load or storage:load once implemented)

Planned Resolution: Allow list of the IPC channels in preload.ts (invoke, send and on refuse any other channel); on() returns a function that removes its listener; document the allowed channels in API_SPEC.md (IPC API).


---


Identifier: KI-017

Since: 0.1.36

Affected Module: DATA_SCHEMA.md (Transform Schema), src/types/Object3D.ts (Transform)

Issue: The Transform Schema gives rotation x, y, z without unit (degrees or radians) and without the order in which the three rotations are applied. ADR-028 defines the coordinate system of position only.

Resolve Before: Phase 6 - Transform System (technical plan)

Planned Resolution: Define the unit and the order of rotation in DATA_SCHEMA.md (Transform Schema), then use them in the transform code and in the viewport.


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
