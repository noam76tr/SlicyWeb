# SlicyWeb SMART SLICER

# DIRECTORY PURPOSES

Version: 2.1.0

Status: Approved  

---

# Purpose

This document defines the purpose and responsibility of every directory used within the SlicyWeb project.

**The objective is to ensure:**

- Consistent project organization
- Clear responsibilities
- Easier onboarding
- Improved maintainability
- Predictable file placement

Every file should be placed in the directory that matches its responsibility.

---

## Project Root

**Path:** `SlicyWeb/`

**Purpose:** Project Root Directory

**Contains:**

- Project Configuration
- Documentation
- Source Code
- Assets
- Tests
- Runtime Resources

---

## Root Governance Files

**Purpose:** AI Governance Layer

**Contains:**

- CLAUDE.md
- CLAUDE_PROJECT_CONTEXT.md
- CLAUDE_READING_PRIORITY.md
- CLAUDE_DOCUMENT_READING_ORDER.md
- CLAUDE_GOVERNANCE_PROTOCOL.md
- CLAUDE_CHANGE_IMPACT_RULES.md
- CLAUDE_FILE_UPDATE_RULES.md

---

## .github/

**Purpose:** GitHub Configuration and Workflows

**Contains:**

- GitHub Actions Workflows
- CI/CD Configuration
- GitHub Templates
- Repository Settings

---

## .github/workflows/

**Purpose:** Automation Pipeline

**Contains:**

- Build Validation
- Testing
- Linting
- Release Automation

---

## docs/

**Purpose:** Project Documentation

**Contains:**

- Specifications
- Architecture
- Rules
- Roadmaps
- Guides

---

## docs/00-index/

**Purpose:** Documentation Entry Point

**Contains:**

- Documentation Index
- AI Reading Guide
- API Reading Guide
- AI Development Protocol
- Claude Governance
- Reading Priorities
- Documentation Navigation
- Governance Navigation

---

## docs/01-project/

**Purpose:** Project Definition

**Contains:**

- Vision
- Scope
- Roadmap
- Planning
- Change History

---

## docs/02-architecture/

**Purpose:** System Design

**Contains:**

- Architecture
- Schemas
- Tech Stack
- File Structure
- API Definitions

---

## docs/03-development/

**Purpose:** Development Standards

**Contains:**

- Development Rules
- Development Workflows
- Impact Analysis
- Domain Governance
- Dependency Management
- Ownership Management
- Documentation Governance
- Bug Investigation
- Update Governance
- Verification Processes
- Settings Specifications
- Error Definitions

**Documents:**

- SYSTEM_RULES.md
- DEVELOPMENT_RULES.md
- DEVELOPMENT_WORKFLOW.md
- CHANGE_IMPACT_RULES.md
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
- ERROR_CODES_SPEC.md
- UNDO_REDO_SPEC.md
- USER_SETTINGS_SPEC.md

---

## docs/04-ai/

**Purpose:** Artificial Intelligence Specifications

**Contains:**

- Analysis Logic
- Recommendations
- Classification
- Presets
- Support Generation

---

## docs/05-profiles/

**Purpose:** Profile Definitions

**Contains:**

- Printer Profiles
- Material Profiles
- Filament Profiles

---

## docs/06-quality/

**Purpose:** Quality Assurance

**Contains:**

- Testing
- Security
- Performance

---

## docs/07-future/

**Purpose:** Future Systems

**Contains:**

- G-Code Specifications
- Plugin System
- Future Extensions

---

## docs/08-user-interface/

**Purpose:** User Interface Specifications

**Contains:**

- Layouts
- Panels
- Menus
- User Experience Definitions

---

## docs/09-reference/

**Purpose:** Project Reference Material

**Contains:**

- Glossary
- Terminology
- Naming Rules
- Acronyms
- Versioning Policies
- Architecture Decisions
- Directory Definitions
- Governance References

---

## src/

**Purpose:** Application Source Code

**Contains:**

- Business Logic
- User Interface
- Data Processing
- Application Systems

---

## src/app/

**Purpose:** Application Bootstrap Layer

**Role:** Application entry point and startup orchestration.

**Contains:**

- Startup Logic
- Shutdown Logic
- Application Initialization
- Dependency Management

**Files:**

| File | Role |
|------|------|
| `Main.ts` | Main application entry point |
| `Startup.ts` | Manages the startup initialization sequence |

---

## src/gui/

**Purpose:** User Interface Layer

**Role:** Main React components (App, MainLayout) and UI panel structure.

**Contains:**

- Layouts
- Panels
- Dialogs
- Menus
- Components
- Themes

**Files:**

| File | Role |
|------|------|
| `App.tsx` | Main application component with the global structure |
| `MainLayout.tsx` | Reusable component organizing the main page layout |

---

## src/gui/viewport/

**Purpose:** 3D Workspace User Interface

**Contains:**

- Viewport Rendering Components
- Viewport Controls
- Viewport Status Display
- Workspace Interaction Tools

**Files:**

| File | Role |
|------|------|
| `Viewport.tsx` | 3D viewport container with renderer management and resizing |
| `ViewportStatus.tsx` | Viewport status bar displaying objects, camera and FPS |
| `ViewportToolbar.tsx` | Viewport toolbar for transformation operations |

---

## src/gui/panels/

**Purpose:** Application Functional Panels

**Contains:**

- Printer Configuration Panels
- Material Panels
- Filament Panels
- Preset Panels
- Analysis Panels
- Recommendation Panels

**Files:**

| File | Role |
|------|------|
| `AnalysisPanel.tsx` | Displays the 3D model analysis results |
| `FilamentPanel.tsx` | Displays the properties of the selected filament |
| `MaterialPanel.tsx` | Displays the properties of the selected material |
| `PresetPanel.tsx` | Displays the properties of the selected print preset |
| `PrinterPanel.tsx` | Printer selection and printer details display |
| `RecommendationPanel.tsx` | Complete display of the print recommendations |

---

## src/gui/statusbar/

**Purpose:** Application Status Display

**Contains:**

- Status Messages
- Progress Indicators
- Notifications
- System Information

**Files:**

| File | Role |
|------|------|
| `StatusBar.tsx` | Status bar displaying project information |

---

## src/gui/sidebar/

**Purpose:** Sidebar Components

**Files:**

| File | Role |
|------|------|
| `LeftSidebar.tsx` | Left sidebar with project, import and object sections |
| `RightSidebar.tsx` | Right sidebar with printer, material, filament and preset sections |
| `SidebarSection.tsx` | Reusable component for sidebar sections |

---

## src/renderer/

**Purpose:** 3D Rendering System

**Role:** 3D rendering engine built on Three.js: camera, lighting, render loop and selection display.

**Contains:**

- Scene Rendering
- Viewport Rendering
- Camera Management
- Lighting Management

**Files:**

| File | Role |
|------|------|
| `CameraManager.ts` | Manages the 3D camera (creation, positioning, orientation) |
| `LightingManager.ts` | Manages lighting (ambient and directional light) |
| `Renderer.ts` | Creates and manages the WebGL renderer |
| `RendererManager.ts` | Orchestrates the rendering system (scene, camera, renderer) |
| `SceneRenderer.ts` | Manages the render loop and the scene objects |
| `SelectionRenderer.ts` | Visual rendering of object selection (BoxHelper) |

---

## src/scene/

**Purpose:** Scene Management

**Role:** 3D scene management: factory, manager, serialization, validation.

**Contains:**

- Workspace Data
- Scene Validation
- Scene Serialization

**Files:**

| File | Role |
|------|------|
| `SceneFactory.ts` | Creates scenes with a default configuration |
| `SceneManager.ts` | Manages the Three.js scene and its 3D objects |
| `SceneSerializer.ts` | Serializes and deserializes scenes to and from JSON |
| `SceneValidator.ts` | Validates scenes and allowed operations |

---

## src/object_manager/

**Purpose:** Model Management

**Role:** 3D object management: creation, duplication, validation, storage.

**Contains:**

- Object Creation
- Object Storage
- Duplication
- Validation

**Files:**

| File | Role |
|------|------|
| `ObjectDuplicator.ts` | Duplicates 3D objects with a new ID and transformations |
| `ObjectFactory.ts` | Creates 3D objects with default values |
| `ObjectManager.ts` | Stores and retrieves 3D objects |
| `ObjectRepository.ts` | In-memory storage repository for 3D objects |
| `ObjectValidator.ts` | Complete validation of objects and allowed operations |

---

## src/optimization_engine/

**Purpose:** Print Optimization Engine

**Role:** Multi-criteria optimization engine (orientation, material, speed, supports). Searches for the best print configuration according to several criteria at the same time. It does not decide what the object is: object classification belongs to src/classification_engine/.

**Contains:**

- OptimizationEngine
- OrientationOptimizer
- MaterialOptimizer
- SpeedOptimizer
- SupportOptimizer

**Files:**

| File | Role |
|------|------|
| `CategoryDetector.ts` | Detects the object category from the extracted features |
| `ClassificationEngine.ts` | Orchestrates the complete classification process |
| `ClassificationValidator.ts` | Validates Classification objects and data consistency |
| `ConfidenceScorer.ts` | Calculates and normalizes confidence scores and levels |
| `MaterialOptimizer.ts` | Optimizes profiles to reduce material consumption |
| `OptimizationEngine.ts` | Orchestrates all optimizers to produce a complete result |
| `OrientationOptimizer.ts` | Evaluates and optimizes the print orientation |
| `SpeedOptimizer.ts` | Estimates the print time reduction |
| `SupportOptimizer.ts` | Estimates the support reduction based on geometry |

**Note:**

CategoryDetector.ts, ClassificationEngine.ts, ClassificationValidator.ts and ConfidenceScorer.ts have the same class names and roles as the files in src/classification_engine/, with different implementations. They are not used by OptimizationEngine.ts.

Until the project owner decides otherwise:

- Do not delete, move or merge them
- Do not import them from other domains
- Object classification uses src/classification_engine/ (AI_ENGINE_SPEC.md)

---

## src/transform/

**Purpose:** Transformation Tools

**Role:** 3D object transformations: move, rotate, scale, history and undo/redo.

**Contains:**

- Move
- Rotate
- Scale
- Transform Validation
- Undo/Redo History

**Files:**

| File | Role |
|------|------|
| `HistoryManager.ts` | Manages the operation history with timestamps |
| `MoveTool.ts` | Move transformation for 3D objects |
| `RotateTool.ts` | Rotation transformation for 3D objects |
| `ScaleTool.ts` | Scale transformation for 3D objects |
| `TransformManager.ts` | Orchestrates all transformation operations |
| `TransformValidator.ts` | Validates transformations (position, rotation, scale) |
| `UndoRedoManager.ts` | Manages undo/redo with two state stacks |

---

## src/importer/

**Purpose:** Model Import System

**Role:** 3D file import with validation (STL, 3MF).

**Contains:**

- STL Import
- 3MF Import
- Import Validation
- File Processing

**Files:**

| File | Role |
|------|------|
| `FileValidator.ts` | Validates files before import (name, size, extension) |
| `ImportManager.ts` | Orchestrates the import workflow and routes by format |
| `STLImporter.ts` | Loads and parses STL files with geometry extraction |
| `ThreeMFImporter.ts` | Loads and parses 3MF files (placeholder implementation until Phase 3, ROADMAP.md) |

---

## src/i18n/

**Purpose:** Internationalization

**Role:** Internationalization: language and translation management (en, fr, he).

**Files:**

| File | Role |
|------|------|
| `LanguageManager.ts` | Manages the current language and validates supported languages |
| `LocalizationService.ts` | Translation service with parameter support and fallback |
| `TranslationLoader.ts` | Loads translation dictionaries with caching and fallback |

---

## src/printer_database/

**Purpose:** Printer Management System

**Role:** Printer profile database management.

**Contains:**

- Printer Loading
- Printer Validation
- Printer Storage
- Printer Repositories

**Files:**

| File | Role |
|------|------|
| `PrinterCache.ts` | Cache storage for printer profiles |
| `PrinterImporter.ts` | Imports printer profiles from JSON with validation |
| `PrinterManager.ts` | Printer profile management (add, remove, retrieve) |
| `PrinterRepository.ts` | In-memory storage and retrieval of printer profiles |
| `PrinterValidator.ts` | Complete validation of printer profiles and their parameters |

---

## src/material_database/

**Purpose:** Material Management System

**Role:** Material profile database management.

**Contains:**

- Material Profiles
- Material Validation
- Material Repositories
- Material Caching

**Files:**

| File | Role |
|------|------|
| `MaterialCache.ts` | Cache storage for material profiles |
| `MaterialImporter.ts` | Imports material profiles from JSON with validation |
| `MaterialManager.ts` | Material profile management (add, remove, retrieve) |
| `MaterialRepository.ts` | In-memory storage and retrieval of material profiles |
| `MaterialValidator.ts` | Complete validation of material profiles and their parameters |

---

## src/filament_database/

**Purpose:** Filament Management System

**Role:** Filament profile database management.

**Contains:**

- Filament Profiles
- Manufacturer Data
- Filament Validation
- Filament Repositories
- Filament Caching

**Files:**

| File | Role |
|------|------|
| `FilamentCache.ts` | Cache storage for filament profiles |
| `FilamentImporter.ts` | Imports filament profiles with validation |
| `FilamentManager.ts` | Filament profile management (add, remove, retrieve) |
| `FilamentRepository.ts` | In-memory storage and retrieval of filament profiles |
| `FilamentValidator.ts` | Complete validation of filament profiles and their parameters |

---

## src/model_analysis/

**Purpose:** Geometry Analysis Engine

**Role:** Complete 3D model analysis (geometry, stability, overhangs).

**Contains:**

- Mesh Analysis
- Printability Analysis
- Stability Analysis
- Geometry Evaluation

**Files:**

| File | Role |
|------|------|
| `GeometryAnalyzer.ts` | Analyzes geometric dimensions (bounding box, volume, surface area) |
| `MeshAnalyzer.ts` | Analyzes mesh properties (vertices, triangles, volume, surface area) |
| `MeshValidator.ts` | Validates mesh integrity (vertices, triangles, geometry) |
| `ModelAnalyzer.ts` | Orchestrates the complete 3D model analysis |
| `PrintabilityAnalyzer.ts` | Analyzes printability (overhangs, bridges, thin walls, score) |
| `StabilityAnalyzer.ts` | Analyzes stability (base area, height ratio, scores) |

---

## src/notifications/

**Purpose:** Application Notification System

**Role:** Notification system with validation and lifecycle management.

**Contains:**

- NotificationFactory
- NotificationManager
- NotificationService
- NotificationValidator

**Files:**

| File | Role |
|------|------|
| `NotificationFactory.ts` | Creates notifications with specific types and ID generation |
| `NotificationManager.ts` | Stores and retrieves notifications |
| `NotificationService.ts` | Orchestrates notification creation and management |
| `NotificationValidator.ts` | Complete validation of notifications (id, timestamp, type, message) |

---

## src/classification_engine/

**Purpose:** Object Classification System

**Role:** 3D object classification engine with category detection. Determines what an imported object is (for example: miniature, figurine, vase, mechanical part, structural component) and assigns a confidence level. Its result is used by the recommendation engine. It does not optimize orientation, material, speed or supports.

**Contains:**

- Object Categories
- Classification Rules
- Confidence Scoring
- Classification Validation

**Files:**

| File | Role |
|------|------|
| `CategoryDetector.ts` | Detects the category from the extracted features |
| `ClassificationEngine.ts` | Orchestrates the complete classification process |
| `ClassificationValidator.ts` | Validates Classification objects and data consistency |
| `ConfidenceScorer.ts` | Calculates and normalizes confidence scores and levels |

---

## src/recommendation_engine/

**Purpose:** Recommendation Generation

**Role:** Recommendation engine: generation, validation and warnings.

**Contains:**

- Decision Rules
- Validation Engine
- Warning Generation
- Recommendation Building

**Files:**

| File | Role |
|------|------|
| `DecisionEngine.ts` | Generates recommendation decisions and selects the preset |
| `RecommendationBuilder.ts` | Builds the final Recommendation object |
| `RecommendationEngine.ts` | Orchestrates the complete recommendation process |
| `ValidationEngine.ts` | Validates and normalizes the profile parameters |
| `WarningEngine.ts` | Generates warnings based on the analysis |

---

## src/preset_engine/

**Purpose:** Print Preset Management

**Role:** Print preset management.

**Contains:**

- Preset Selection
- Preset Validation
- Preset Recommendations
- Preset Storage

**Files:**

| File | Role |
|------|------|
| `PresetManager.ts` | Manages print presets and coordinates the repository |
| `PresetRepository.ts` | Storage and retrieval of presets (in-memory Map) |
| `PresetSelector.ts` | Selects presets by criteria (name, category, classification) |
| `PresetValidator.ts` | Validates preset integrity |

---

## src/cost_engine/

**Purpose:** Cost Computation

**Role:** Print cost calculation engine (material, energy, time).

**Contains:**

- Material Cost Calculation
- Energy Cost Estimation
- Time Estimation
- Total Cost Computation

**Files:**

| File | Role |
|------|------|
| `CostCalculator.ts` | Calculates the total print cost and cost ratios |
| `EnergyEstimator.ts` | Estimates energy consumption and electricity cost |
| `MaterialEstimator.ts` | Estimates material cost from the filament quantity |
| `TimeEstimator.ts` | Estimates print time (hours to minutes conversion) |

---

## src/repositories/

**Purpose:** Data Access Layer

**Role:** Remote data access: repository synchronization for external profile data.

**Contains:**

- GitHub Repository
- Printer Repository Synchronization
- Material Repository Synchronization
- Filament Repository Synchronization
- Preset Repository Synchronization
- Remote Data Access
- Sync Operations

**Files:**

| File | Role |
|------|------|
| `FilamentRepositorySync.ts` | Synchronizes filament profiles with a remote repository |
| `GitHubRepository.ts` | Access to remote repositories (GitHub) |
| `MaterialRepositorySync.ts` | Synchronizes material profiles with a remote repository |
| `PresetRepositorySync.ts` | Synchronizes preset profiles with a remote repository |
| `PrinterRepositorySync.ts` | Synchronizes printer profiles with the local printer repository |

---

## src/storage/

**Purpose:** Persistence Layer

**Role:** Storage layer: generic cache and project storage.

**Contains:**

- StorageManager
- ProjectStorage
- CacheStorage
- Project Persistence
- Local Storage
- Cache Management

**Files:**

| File | Role |
|------|------|
| `CacheStorage.ts` | Generic cache storage using a Map |
| `ProjectStorage.ts` | Project-specific storage |
| `StorageManager.ts` | Orchestrates storage (projects and cache) |

---

## src/recovery/

**Purpose:** Project Recovery System

**Role:** Project recovery: autosave, recovery management, session validation.

**Contains:**

- Auto Save Service
- Recovery Files
- Session Restoration
- Recovery Validation

**Files:**

| File | Role |
|------|------|
| `AutoSaveService.ts` | Manages automatic project autosave |
| `RecoveryManager.ts` | Manages project recovery and restoration |
| `RecoveryValidator.ts` | Validates project integrity for recovery |
| `SessionRestorer.ts` | Restores sessions and validates them |

---

## src/project/

**Purpose:** Project Lifecycle Management

**Role:** Business core: complete project lifecycle (creation, serialization, validation, WYPROJ import and export).

**Files:**

| File | Role |
|------|------|
| `ProjectDeserializer.ts` | Deserializes projects from JSON with normalization |
| `ProjectManager.ts` | Manages the complete project lifecycle |
| `ProjectSerializer.ts` | Serializes projects to JSON |
| `ProjectValidator.ts` | Complete validation of projects and metadata |
| `WYPROJExporter.ts` | Exports projects to the WYPROJ format |
| `WYPROJImporter.ts` | Imports WYPROJ files with validation |

---

## src/services/

**Purpose:** Shared Application Services

**Role:** Business services layer for analysis, filaments, materials, presets, printers, projects, recommendations and storage.

**Contains:**

- Analysis Service
- Filament Service
- Material Service
- Preset Service
- Printer Service
- Project Service
- Recommendation Service
- Storage Service

**Files:**

| File | Role |
|------|------|
| `AnalysisService.ts` | Analysis service: creation, validation, serialization and management of analysis results |
| `FilamentService.ts` | Filament service: add, remove, retrieve filaments |
| `MaterialService.ts` | Material service: add, remove, retrieve materials |
| `PresetService.ts` | Preset service: creation, validation, serialization and duplication of presets |
| `PrinterService.ts` | Printer service: add, remove, retrieve printers |
| `ProjectService.ts` | Project service: complete lifecycle (creation, validation, serialization) |
| `RecommendationService.ts` | Recommendation service that delegates generation to the RecommendationEngine |
| `StorageService.ts` | Storage service for projects and cache |

---

## src/events/

**Purpose:** Application Event System

**Role:** Centralized publish-subscribe event system.

**Contains:**

- Event Bus
- Event Dispatching
- Event Types
- Subscriptions

**Files:**

| File | Role |
|------|------|
| `EventBus.ts` | Implementation of the centralized event system (publish-subscribe) |
| `EventTypes.ts` | Definition of the event types supported by the application |

---

## src/state/

**Purpose:** Application State Management

**Role:** Global application state: Zustand stores.

**Contains:**

- Analysis Store
- Application Store
- Filament Store
- Material Store
- Object Store
- Preset Store
- Printer Store
- Recommendation Store
- Scene Store

**Files:**

| File | Role |
|------|------|
| `analysisStore.ts` | Zustand store for analysis state |
| `appStore.ts` | Zustand store for global state (printer, material, filament, preset) |
| `filamentStore.ts` | Zustand store for filaments (list and selection) |
| `materialStore.ts` | Zustand store for materials (list and selection) |
| `objectStore.ts` | Zustand store for 3D objects (list, selection, add, remove) |
| `presetStore.ts` | Zustand store for print presets (list and selection) |
| `printerStore.ts` | Zustand store for printers (list and selection) |
| `recommendationStore.ts` | Zustand store for print recommendations |
| `sceneStore.ts` | Zustand store for the 3D scene (scene and selected object) |

---

## src/config/

**Purpose:** Configuration Management

**Role:** Configuration interfaces (application, environment, feature flags).

**Contains:**

- Application Configuration
- Feature Flags
- Environment Settings

**Files:**

| File | Role |
|------|------|
| `ApplicationConfig.ts` | General application configuration interface |
| `EnvironmentConfig.ts` | Environment and path configuration interface |
| `FeatureFlags.ts` | Feature flags interface for enabling and disabling features |

---

## src/constants/

**Purpose:** Global Constants

**Role:** Centralized constants (application, analysis, materials, presets, printers).

**Contains:**

- Analysis Constants
- Application Constants
- Material Constants
- Preset Constants
- Printer Constants

**Files:**

| File | Role |
|------|------|
| `AnalysisConstants.ts` | Analysis constants (score ranges, risk and confidence levels, object categories) |
| `ApplicationConstants.ts` | Global application constants (name, version, language, theme, autosave) |
| `MaterialConstants.ts` | Material constants (categories, warping risks, cooling ranges) |
| `PresetConstants.ts` | Preset constants (categories, infill patterns, support, adhesion, layer heights) |
| `PrinterConstants.ts` | Printer constants (nozzles, build volume, temperatures, extruder types) |

---

## src/utils/

**Purpose:** Shared Utility Functions

**Role:** Generic utilities: helper functions for files, JSON, math and validation.

**Contains:**

- File Utilities
- JSON Utilities
- Validation Helpers
- Mathematical Helpers

**Must Not Contain:**

- Business Logic
- AI Logic
- Application State

**Files:**

| File | Role |
|------|------|
| `FileUtils.ts` | File helpers: get extension, get name without extension, validate extension, detect 3D model and JSON files, sanitize file names |
| `JsonUtils.ts` | JSON helpers: parse, stringify, validate, deep clone, merge objects |
| `MathUtils.ts` | Math helpers: clamp, round, degree/radian conversion, distance, range check, linear interpolation |
| `ValidationUtils.ts` | Validation helpers: empty check, number, string, email, URL, enum value, required keys |

---

## src/schemas/

**Purpose:** Runtime Validation Layer

**Role:** Core validation schemas: Zod schemas for runtime validation.

**Contains:**

- PrinterSchema
- MaterialSchema
- FilamentSchema
- PrintPresetSchema
- AnalysisSchema
- RecommendationSchema
- Zod Validation Rules
- Runtime Type Validation

**Files:**

| File | Role |
|------|------|
| `AnalysisSchema.ts` | Zod schema for runtime validation of 3D model analysis data |
| `FilamentSchema.ts` | Zod schema for runtime validation of filament data |
| `MaterialSchema.ts` | Zod schema for runtime validation of material data |
| `PrintPresetSchema.ts` | Zod schema for runtime validation of print preset data |
| `PrinterSchema.ts` | Zod schema for runtime validation of printer data |
| `RecommendationSchema.ts` | Zod schema for runtime validation of recommendation data |

---

## src/types/

**Purpose:** Shared Type Definitions

**Role:** Core TypeScript type definitions for all entities.

**Contains:**

- TypeScript Types
- Interfaces
- Enums
- Domain Models

**Files:**

| File | Role |
|------|------|
| `Analysis.ts` | Types for 3D model analysis (geometry, mesh, stability, overhangs, bridges, thin walls) |
| `Classification.ts` | Types for object classification (categories, confidence levels) |
| `CostEstimation.ts` | Types for print cost estimation (filament, energy, time) |
| `DefaultMaterial.ts` | Default material constant (PLA) with a complete profile |
| `Filament.ts` | Types for filaments (brand, material, properties, price) |
| `Material.ts` | Types for materials (temperature, cooling, parameters) |
| `Notification.ts` | Types for user notifications (type, message, timestamp) |
| `Object3D.ts` | Types for 3D objects (position, rotation, scale, geometry, mesh) |
| `Optimization.ts` | Types for optimization results (scores, reductions) |
| `PrintPreset.ts` | Types for print presets (quality, speed and support parameters) |
| `Printer.ts` | Types for printers (brand, model, systems) |
| `Project.ts` | Types for projects (metadata, scene, objects, WYPROJ format) |
| `Recommendation.ts` | Types for print recommendations (profile, optimization, warnings) |
| `Scene.ts` | Types for the 3D scene (objects, printer, material, filament, preset) |
| `UserPreferences.ts` | Types for user preferences (theme, language, units) |
| `Warning.ts` | Types for warnings (code, severity, message) |

---

## src-electron/

**Purpose:** Reserved Electron Workspace

**Contains:**

- Future Electron Entry Point/Modules
- Future Main Process Organization
- Electron Architecture Extensions

**Used For:**

- Future Electron Refactoring
- Desktop Architecture Separation

**Status:**

- Placeholder Directory

---

## src/electron/

**Purpose:** Electron Framework Integration

**Role:** Electron integration: main process, IPC and preload. Critical for the desktop application.

**Contains:**

- Main Process Logic
- Preload Scripts
- IPC Communication
- Desktop Application Integration
- Runtime Services

**Files:**

| File | Role |
|------|------|
| `main.ts` | Electron entry point: window creation and IPC handler registration |
| `preload.ts` | Exposes the IPC API to the renderer with context isolation and requestId generation |

---

## src/electron/ipc/

**Purpose:** Inter-Process Communication Handlers

**Contains:**

- ImportIPC
- PrinterIPC
- ProjectIPC
- SettingsIPC
- StorageIPC
- Electron Communication Handlers
- Renderer ↔ Main Process Communication

**Files:**

| File | Role |
|------|------|
| `ImportIPC.ts` | IPC communication for file import (STL, 3MF) and validation |
| `PrinterIPC.ts` | IPC communication for printer operations (add, remove, retrieve, count) |
| `ProjectIPC.ts` | IPC communication for project operations (create, load, save, delete) |
| `SettingsIPC.ts` | IPC communication for user settings (get, update, reset, theme, language) |
| `StorageIPC.ts` | IPC communication for storage operations (save, load, delete, clear) |

---

## data/

**Purpose:** Project Data Repository

**Contains:**

- Printer Profiles
- Material Profiles
- Filament Profiles
- Print Presets
- Configuration Files

---

## data/printers/

**Purpose:** Printer Profile Storage

**Contains:**

- Printer Definitions
- Manufacturer Profiles
- Printer Configurations

---

## data/materials/

**Purpose:** Material Profile Storage

**Contains:**

- PLA Materials
- PETG Materials
- ABS Materials
- ASA Materials
- TPU Materials
- Other Material Types

---

## data/filaments/

**Purpose:** Filament Profile Storage

**Contains:**

- Manufacturer-Specific Filaments
- Filament Definitions
- Brand Profiles

---

## data/presets/

**Purpose:** Print Preset Storage

**Contains:**

- Draft Presets
- Balanced Presets
- Quality Presets
- Mechanical Presets
- Miniature Presets
- Custom Presets

---

## assets/

**Purpose:** Static Project Assets

**Contains:**

- Icons
- Images
- Logos
- Themes
- Visual Resources

---

## assets/icons/

**Purpose:** Application Icon Resources

**Contains:**

- UI Icons
- Toolbar Icons
- Navigation Icons
- Symbol Assets

---

## assets/images/

**Purpose:** Image Assets

**Contains:**

- Screenshots
- Promotional Images
- Documentation Images
- Visual Graphics

---

## assets/logos/

**Purpose:** Project Logo Resources

**Contains:**

- Brand Logos
- Logo Variants
- Application Branding

---

## assets/themes/

**Purpose:** UI Theme Resources

**Contains:**

- Color Schemes
- Theme Definitions
- Dark Mode Assets
- Light Mode Assets

---

## public/

**Purpose:** Public Static Resources

**Contains:**

- Distributable Assets
- Public Files
- Static Content
- Build Output

---

## public/locales/

**Purpose:** Translation Dictionaries

**Role:** Language dictionaries loaded by the internationalization system (src/i18n/). One file per supported language.

**Files:**

| File | Role |
|------|------|
| `en.json` | English translation dictionary |
| `fr.json` | French translation dictionary |
| `he.json` | Hebrew translation dictionary (right-to-left language) |

---

## releases/

**Purpose:** Application Release Distribution

**Contains:**

- Alpha Releases
- Beta Releases
- Release Candidates
- Stable Releases
- Version Archives

---

## releases/alpha/

**Purpose:** Alpha Release Storage

**Contains:**

- Experimental Features
- Early Development Builds
- Unstable Versions

---

## releases/beta/

**Purpose:** Beta Release Storage

**Contains:**

- Feature Complete Builds
- Pre-Release Testing
- Beta Versions

---

## releases/rc/

**Purpose:** Release Candidate Storage

**Contains:**

- Candidate Builds
- Final Testing
- RC Versions

---

## releases/stable/

**Purpose:** Stable Release Storage

**Contains:**

- Production Builds
- Official Releases
- Stable Versions

---

## scripts/

**Purpose:** Automation Scripts and Build Tools

**Contains:**

- Build Scripts
- Migration Scripts
- Release Scripts
- Setup Scripts
- Utility Scripts

---

## scripts/build/

**Purpose:** Build Automation Scripts

**Contains:**

- Compilation Scripts
- Build Configuration
- Package Scripts
- Bundling Tools

---

## scripts/migration/

**Purpose:** Data Migration Scripts

**Contains:**

- Schema Migrations
- Data Transformations
- Upgrade Scripts
- Version Transitions

---

## scripts/release/

**Purpose:** Release Management Scripts

**Contains:**

- Release Automation
- Version Tagging
- Distribution Packaging
- Changelog Generation

---

## scripts/release/alpha/

**Purpose:** Alpha Release Automation

**Contains:**

- Alpha Build Scripts
- Alpha Distribution
- Experimental Release Tools

---

## scripts/release/beta/

**Purpose:** Beta Release Automation

**Contains:**

- Beta Build Scripts
- Beta Distribution
- Pre-Release Tools

---

## scripts/release/rc/

**Purpose:** Release Candidate Automation

**Contains:**

- RC Build Scripts
- RC Distribution
- Final Release Preparation

---

## scripts/release/stable/

**Purpose:** Stable Release Automation

**Contains:**

- Stable Build Scripts
- Stable Distribution
- Production Release Tools

---

## scripts/setup/

**Purpose:** Development Environment Setup

**Contains:**

- Installation Scripts
- Dependency Setup
- Configuration Initialization
- Development Environment Tools

---

## tests/

**Purpose:** Automated Testing Suite

**Contains:**

- Unit Tests
- Integration Tests
- End-to-End Tests
- Test Configuration
- Test Utilities

---

## tests/unit/

**Purpose:** Unit Testing

**Contains:**

- Component Tests
- Function Tests
- Module Tests
- Isolated Logic Tests

**Used For:**

- Quality Assurance
- Regression Prevention
- Feature Validation
- System Reliability
- Release Verification

---

## tests/integration/

**Purpose:** Integration Testing

**Contains:**

- Multi-Module Tests
- System Integration Tests
- API Tests
- Cross-Component Tests

---

## tests/e2e/

**Purpose:** End-to-End Testing

**Contains:**

- User Workflow Tests
- Application Flow Tests
- Complete Scenario Tests
- UI Interaction Tests

---

## cache/

**Purpose:** Application Cache Storage

**Contains:**

- Temporary Cache Files
- Performance Cache
- Session Cache
- Compiled Cache

---

## logs/

**Purpose:** Application Logging

**Contains:**

- Runtime Logs
- Error Logs
- Debug Logs
- Session Logs
- Diagnostic Information

---

## plugins/

**Purpose:** Plugin System and Extensions

**Contains:**

- Third-Party Plugins
- Custom Extensions
- Plugin Configuration
- Plugin Resources

---

# Maintenance Rule

Every source directory section lists all of its files in a **Files** table.

When a file is created, renamed, moved or deleted:

- Update the **Files** table of the affected directory in the same change
- Describe the role of the file, not its current status (no bug notes, no temporary remarks)

When a new directory is created, add a section for it using the same format.

---

# Governance Documents

**The project governance framework includes:**

- CLAUDE_GOVERNANCE_PROTOCOL.md
- CLAUDE_READING_PRIORITY.md
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

**These documents define:**

- Ownership
- Dependencies
- Impact Analysis
- Documentation Updates
- Bug Investigation
- Update Validation
- Change Verification
- Architecture Governance

---

# Golden Rule

Every file should have a single clear responsibility and should be stored in the directory that best matches that responsibility.

If a file does not clearly belong to a directory, the project structure should be reviewed before creating the file.

---

# End Of Document
