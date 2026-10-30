# SlicyWeb SMART SLICER

# FILE STRUCTURE

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document defines the official project directory structure.

Goals:

- Maintain consistency
- Simplify navigation
- Reduce technical debt
- Improve maintainability
- Prevent duplicate functionality
- Allow future expansion

This structure is the official reference for the entire project.

---

# Root Structure

```text
SlicyWeb/

├── data/
├── docs/
├── src/
├── src-electron/              = Reserved Electron source directory
├── tests/
├── assets/
├── cache/
├── logs/
├── scripts/
├── plugins/
├── public/
│   └── locales/
├── releases/
├── .github/
│
├── CLAUDE.md
├── CLAUDE_PROJECT_CONTEXT.md
├── CLAUDE_DOCUMENT_READING_ORDER.md
├── CLAUDE_CHANGE_IMPACT_RULES.md
├── CLAUDE_FILE_UPDATE_RULES.md
├── CLAUDE_GOVERNANCE_PROTOCOL.md		= Gouvernance officielle des modifications et validations
├── CLAUDE_READING_PRIORITY.md       	= Priorités de lecture et hiérarchie documentaire
│
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE.md
│
├── index.html
├── package.json
├── package-lock.json          = Exact installed versions (npm)
├── components.json            = shadcn/ui configuration (ADR-025)
├── tsconfig.json
├── vite.config.mts
├── vitest.config.mts          = unit tests (tests/unit/), separate from vite.config.mts
├── playwright.config.mts      = end-to-end tests (tests/e2e/) on the built application
├── electron-builder.json
├── eslint.config.js
├── prettier.config.js
├── .gitignore
└── .env.example
```

---

# Documentation Structure

```text
data/
│   ├── cache/
│   ├── filaments/                      = profils de filaments Official (un fichier JSON par gamme, SOURCES.md)
│   ├── materials/                      = profils de matériaux Official (un fichier JSON par famille, SOURCES.md)
│   ├── presets/
│   ├── printers/                       = profils d'imprimantes Official (un fichier JSON par imprimante, SOURCES.md, index.json)
│   └── templates/

docs/
│
├── 00-index/
│   ├── AI_START_HERE.md                 = Point d'entrée principal pour l'IA et les nouveaux contributeurs
│   ├── AI_DEVELOPMENT_PROTOCOL.md       = Protocole officiel de développement et de revue pour les IA
│   ├── API_START_HERE.md                = Guide de démarrage rapide pour l'API et les services
│   └── PROJECT_DOCUMENTATION_INDEX.md   = Index complet de toute la documentation du projet
│
├── 01-project/
│   ├── PROJECT_DESCRIPTION.md           = Présentation générale, vision et objectifs du projet
│   ├── PROJECT_SPEC.md                  = Cahier des charges principal du projet
│   ├── ROADMAP.md                       = Planification des futures fonctionnalités et phases
│   ├── PHASES_IMPLEMENTATION_PLAN.md    = Ordre détaillé d'implémentation des modules
│   ├── CHANGELOG.md                     = Historique des modifications et versions
│   └── DECISIONS.md                     = Journal des décisions architecturales (ADR)
│
├── 02-architecture/
│   ├── ARCHITECTURE.md                  = Comment le logiciel est construit
│   ├── API_SPEC.md                      = Comment les modules communiquent entre eux
│   ├── FILE_STRUCTURE.md                = Où se trouve chaque fichier et dossier
│   ├── IMPORT_EXPORT_SPEC.md            = Gestion des imports et exports de fichiers
│   ├── SLICER_EXPORT_SPEC.md            = Export des réglages vers le slicer cible
│   ├── TECH_STACK.md                    = Technologies utilisées dans le projet
│   ├── DATA_SCHEMA.md                   = Structure officielle de toutes les données
│   └── TECHNICAL_OVERVIEW.md            = Vue technique globale du projet
│
├── 03-development/
│   ├── SYSTEM_RULES.md                  = Règles globales du projet
│   ├── CHANGE_IMPACT_RULES.md           = Analyse d'impact obligatoire avant modification
│   ├── DEVELOPMENT_WORKFLOW.md          = Workflow officiel de développement
│   ├── DEVELOPMENT_RULES.md             = Règles de codage, refactoring et maintenance
│   ├── USER_SETTINGS_SPEC.md            = Paramètres utilisateur et préférences
│   ├── ERROR_CODES_SPEC.md              = Liste normalisée des erreurs et avertissements
│   ├── DOMAIN_BOUNDARIES.md             = Limites et responsabilités des domaines
│   ├── DOMAINS_DEPENDENCY_MATRIX.md     = Dépendances autorisées entre domaines
│   ├── FILE_OWNERSHIP_MATRIX.md         = Ownership et responsabilité officiels des fichiers
│   ├── PROJECT_IMPACT_MATRIX.md         = Analyse d'impact des changements
│   ├── CROSS_DOCUMENT_DEPENDENCIES.md   = Dépendances entre documents
│   ├── DOCUMENT_UPDATE_RULES.md         = Gouvernance des mises à jour documentaires
│   ├── DOCUMENT_UPDATE_MATRIX.md        = Règles de mise à jour documentaire
│   ├── CHANGE_CLASSIFICATION_RULES.md   = Classification officielle des changements
│   ├── CHANGE_VERIFICATION_CHECKLIST.md = Vérification obligatoire avant changement
│   ├── BUG_ANALYSIS_PROTOCOL.md         = Analyse et résolution des bugs
│   ├── UPDATE_IMPACT_RULES.md           = Analyse d'impact des mises à jour
│   ├── UPDATE_GOVERNANCE_PROTOCOL.md    = Gouvernance des mises à jour externes
│   ├── UPDATE_REPORT_TEMPLATE.md        = Modèle de rapport de mise à jour
│   └── UNDO_REDO_SPEC.md                = Fonctionnement du système Undo / Redo
│
├── 04-ai/
│   ├── AI_ENGINE_SPEC.md                = Architecture du moteur IA
│   ├── RECOMMENDATION_RULES.md          = Règles utilisées pour les recommandations
│   ├── OBJECT_CLASSIFICATION_SPEC.md    = Classification automatique des modèles 3D
│   ├── SUPPORT_GENERATION_SPEC.md       = Génération intelligente des supports
│   ├── PRINT_PRESETS_SPEC.md            = Profils prédéfinis d'impression
│   └── PRINT_SETTINGS_SPEC.md           = Tous les paramètres d'impression disponibles
│
├── 05-profiles/
│   ├── MATERIAL_PROFILE_SPEC.md         = Profils des matériaux d'impression
│   ├── FILAMENT_SETTINGS_SPEC.md        = Profils détaillés des filaments
│   └── PRINTER_PROFILE_SPEC.md          = Profils et capacités des imprimantes 
│
├── 06-quality/
│   ├── TEST_PLAN.md                     = Stratégie de tests du projet
│   ├── SECURITY_SPEC.md                 = Règles de sécurité et validation
│   └── PERFORMANCE_SPEC.md              = Objectifs de performances et optimisation
│
├── 07-future/
│   ├── GCODE_ENGINE_SPEC.md             = Future architecture du moteur G-Code
│   └── PLUGIN_SYSTEM_SPEC.md            = Future architecture du système de plugins
│
├── 08-user-interface/
│   └── GUI_SPEC.md                      = Spécification complète de l'interface utilisateur
│
├── 09-reference/
│   ├── ARCHITECTURE_DECISION_MATRIX.md  = Comparatif et justification des choix techniques
│   ├── DIRECTORY_PURPOSES.md            = Description du rôle de chaque dossier
│   ├── GLOSSARY.md                      = Dictionnaire des termes techniques du projet
│   ├── NAMING_CONVENTIONS.md            = Conventions de nommage du code et fichiers
│   ├── PROJECT_ACRONYMS.md              = Liste des acronymes utilisés dans le projet
│   ├── TERMINOLOGY.md                   = Terminologie officielle à utiliser partout
│   └── VERSIONING_POLICY.md             = Politique de gestion des versions
│
├── README.md                            = Page d'accueil du dépôt GitHub
├── CONTRIBUTING.md                      = Guide de contribution au projet
├── CODE_OF_CONDUCT.md                   = Règles de conduite pour les contributeurs
└── LICENSE.md                           = Conditions légales d'utilisation du projet
```

---

# Documentation Statistics

Documentation Count Maintained In:

```text
PROJECT_DOCUMENTATION_INDEX.md
```

Governance & AI Control Files:

```text
CLAUDE.md

CLAUDE_PROJECT_CONTEXT.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_CHANGE_IMPACT_RULES.md

CLAUDE_FILE_UPDATE_RULES.md

CLAUDE_GOVERNANCE_PROTOCOL.md

CLAUDE_READING_PRIORITY.md
```

---

# Governance Documentation:

```text
Domain Governance

Impact Analysis

Document Dependency Management

File Ownership Management

Bug Analysis Framework

Update Governance Framework

Change Verification Framework
```

GitHub Repository Documents:

```text
README.md

CONTRIBUTING.md

CODE_OF_CONDUCT.md

LICENSE.md
```

---

# Documentation Status:

```text
Core Documentation Complete

Architecture Documentation Complete

AI Governance Layer Complete

Impact Analysis Layer Complete

Update Governance Layer Complete

Bug Analysis Layer Complete

Reference Documentation Complete

Ready For AI Assisted Development
```

---

# Source Structure

```text

src/
├── i18n/
├── app/
├── gui/
├── renderer/
├── scene/
├── object_manager/
├── transform/
├── importer/
├── printer_database/
├── material_database/
├── model_analysis/
├── recommendation_engine/
├── optimization_engine/
├── filament_database/
├── classification_engine/
├── project/
├── preset_engine/
├── recovery/
├── cost_engine/
├── notifications/
├── repositories/
├── schemas/
├── storage/
├── events/
├── electron/
├── services/
├── state/
├── config/
├── constants/
├── utils/
└── types/
```

---

# Application Layer

```text
src/app/

├── Main.ts
└── Startup.ts
```

---

# Electron Layer

The Electron integration is located in:

```text
src/electron/
```

Purpose:

```text
Electron Main Process
Preload Bridge
IPC Communication
Desktop Application Integration
```

Structure:

```text
src/electron/

├── main.ts
├── preload.ts

└── ipc/
    ├── FilamentIPC.ts         = filament:getAll (Phase 8)
    ├── ImportIPC.ts
    ├── IpcChannels.ts         = allow list of the IPC channels (API_SPEC.md)
    ├── MaterialIPC.ts         = material:getAll (Phase 8)
    ├── PrinterIPC.ts
    ├── ProjectIPC.ts
    ├── SettingsIPC.ts
    └── StorageIPC.ts
```

Rules:

```text
The Electron layer must not contain business logic.

IPC handlers must validate incoming payloads.

IPC handlers must delegate operations to Services.

IPC handlers must not access Remote Sources directly.

Renderer communication must pass through the IPC layer.
```

The root-level directory:

```text
src-electron/
```

is reserved for future use and must not duplicate the active implementation in:

```text
src/electron/
```

---

# GUI Layer

```text
src/gui/

├── main.tsx                   = Renderer entry point (ADR-025)
├── App.tsx
├── MainLayout.tsx
├── viewport/
│   └── Viewport.tsx
├── sidebar/
│   ├── LeftSidebar.tsx
│   ├── RightSidebar.tsx
│   ├── SidebarSection.tsx
│   ├── PrinterSection.tsx     = Printer section of the Properties Panel (Phase 7)
│   ├── MaterialSection.tsx    = Material section of the Properties Panel (Phase 8)
│   ├── FilamentSection.tsx    = Filament section of the Properties Panel (Phase 8)
│   ├── profileRows.tsx        = rows of values of the Material and Filament sections (Phase 8)
│   ├── TransformSection.tsx   = Transform section of the Properties Panel (Phase 6)
│   └── objectNames.ts         = display names of the objects (duplicates: "cube (1)")
├── import/
│   ├── openImportDialog.ts    = system file dialog for File > Import STL and the toolbar
│   ├── ImportDropZone.tsx     = drag and drop of files in the viewport
│   └── ImportStatus.tsx       = progress, Cancel, confirmation and errors of the imports
├── panels/
│   ├── PresetPanel.tsx
│   ├── AnalysisPanel.tsx
│   └── RecommendationPanel.tsx
├── statusbar/
│   └── StatusBar.tsx
├── layouts/
├── windows/
├── dialogs/
│   ├── PrinterManagerDialog.tsx = Printer Manager: printers entered by the user (Phase 7)
│   └── printerForm.ts         = form of the Printer Manager and its conversion to a printer
├── menus/
│   └── MenuBar.tsx            = the nine menus of GUI_SPEC.md
├── toolbars/
│   ├── Toolbar.tsx            = the eight toolbar buttons of GUI_SPEC.md
│   └── TransformModeBar.tsx   = buttons Move, Rotate, Scale over the viewport, the only mode buttons (Phase 6)
├── components/
│   ├── I18nProvider.tsx       = translations, language and text direction for the GUI
│   └── ui/                    = shadcn/ui components (button, dialog, dropdown-menu, menubar, resizable)
├── themes/
├── hooks/
│   ├── useSelectAllShortcut.ts = Ctrl+A (Phase 6)
│   ├── useTranslation.ts      = access to translations from GUI components
│   └── useUndoRedoShortcuts.ts = Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z (Phase 6)
└── styles/
    └── global.css             = Tailwind CSS 4 entry point (ADR-025)
```

---

# Renderer Layer

```text
src/renderer/

├── Renderer.ts
├── RendererManager.ts
├── CameraManager.ts
├── LightingManager.ts
├── SceneRenderer.ts
├── ObjectRenderer.ts          = meshes of the scene objects in the viewport
├── ObjectInteraction.ts       = click to select, drag an object on the build plate (Phase 6)
├── TransformGizmo.ts          = Move, Rotate and Scale gizmos of the selected object (Phase 6)
├── SelectionRenderer.ts
└── helpers/
    └── WorkspaceHelpers.ts    = grid, axes and build plate of the viewport (ADR-028)
```

---

# Repositories

Purpose:

```text
Local Data Access
Repository Coordination
Cache Coordination
RepositorySync Coordination
Validated Data Retrieval
```

Repository files are located in:

```text
src/repositories/
```

Structure:

```text
src/repositories/

├── GitHubRepository.ts
├── PrinterRepositorySync.ts   = download of the profiles of noam76tr/slicyweb-profiles, without Electron (Phase 7)
├── MaterialRepositorySync.ts
├── FilamentRepositorySync.ts
└── PresetRepositorySync.ts
```

Repository rules:

```text
Repositories must access local data through the Storage and Cache layers.

Repositories must use RepositorySync when remote data is required.

Repositories must validate data received from RepositorySync.

Repositories must not access the GUI.

Repositories must not contain rendering logic.

Repositories must not perform geometry analysis.

Repositories must not generate recommendations.

Repositories must not access Remote Sources outside RepositorySync.

```

Required communication flow:

```text
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Remote Sources must not be represented as a direct application directory.

They are external systems accessed only through RepositorySync.

---

# Schemas

```text
src/schemas/

├── AnalysisSchema.ts
├── ErrorSchema.ts
├── FilamentSchema.ts
├── MaterialSchema.ts
├── PrintPresetSchema.ts
├── PrinterSchema.ts
├── ProfileRepositorySchema.ts = index.json of the profile repository, cache.json, last check (Phase 7)
├── ProjectSchema.ts
├── RecommendationSchema.ts
└── UserPreferencesSchema.ts
```

---

# Scene

```text
src/scene/

├── SceneManager.ts
├── SceneFactory.ts
├── SceneSerializer.ts
├── SceneValidator.ts
├── GeometryRegistry.ts        = triangle geometry of the objects, by objectId (ADR-029)
├── ObjectTransform.ts         = meaning of the transform: matrix, placement on the plate, 3MF export (ADR-031)
└── SceneIntegration.ts        = registers imported models in the scene (ADR-029, ADR-030)
```

---

# Object Management

```text
src/object_manager/

├── ObjectManager.ts
├── ObjectFactory.ts
├── ObjectRepository.ts
├── ObjectValidator.ts
└── ObjectDuplicator.ts
```

---

# Transformations

```text
src/transform/

└── TransformValidator.ts
```

---

# Import System

```text
src/importer/

├── STLImporter.ts
├── StlParser.ts               = binary and ASCII STL parser with validation (no DOM)
├── ThreeMFImporter.ts
├── ThreeMFParser.ts           = 3MF parser with fflate and fast-xml-parser (no DOM, ADR-030)
├── ZipReader.ts               = ZIP central directory, parts decompressed by chunks with limits
├── ImportRunner.ts            = file reading with progress, parser worker, cancel (STL and 3MF)
├── ImportManager.ts
├── ImportError.ts             = import errors with their code (ERROR_CODES_SPEC.md)
├── FileValidator.ts
└── workers/
    ├── stlParser.worker.ts    = Web Worker parsing STL files (ADR-029)
    └── threeMfParser.worker.ts = Web Worker parsing 3MF files (ADR-030)
```

---

# Printer Database

```text
src/printer_database/

├── PrinterManager.ts
├── PrinterRepository.ts
├── PrinterValidator.ts
└── PrinterImporter.ts         = not used yet (Import Profile, Phase 15)
```

---

# Material Database

```text
src/material_database/

├── MaterialManager.ts         = loading of the material profile files (Phase 8)
├── MaterialFamilies.ts        = words of a printer compared with the families, aliases (Phase 8)
├── MaterialRepository.ts
├── MaterialCache.ts
└── MaterialImporter.ts        = not used yet (Import Material, Phase 15)
```

---
# Filament Database

```text
src/filament_database/

├── FilamentManager.ts         = loading of the filament profile files (Phase 8)
├── FilamentRepository.ts
├── FilamentCache.ts
└── FilamentImporter.ts        = not used yet (Import Filament, Phase 15)
```

---

# Analysis Engine

```text
src/model_analysis/

├── GeometryAnalyzer.ts
├── MeshAnalyzer.ts
├── MeshValidator.ts
├── ModelAnalyzer.ts
├── PrintabilityAnalyzer.ts
└── StabilityAnalyzer.ts
```

---

# Classification Engine

```text
src/classification_engine/

├── ClassificationEngine.ts
├── CategoryDetector.ts
├── ConfidenceScorer.ts
└── ClassificationValidator.ts
```
---

# Preset Engine

```text
src/preset_engine/

├── PresetManager.ts
├── PresetRepository.ts
├── PresetValidator.ts
└── PresetSelector.ts
```

---

# Recommendation Engine

```text
src/recommendation_engine/

├── RecommendationEngine.ts
├── DecisionEngine.ts
├── ValidationEngine.ts
├── WarningEngine.ts
└── RecommendationBuilder.ts
```

---

# Optimization Engine

```text
src/optimization_engine/

├── OptimizationEngine.ts
├── OrientationOptimizer.ts
├── MaterialOptimizer.ts
├── SpeedOptimizer.ts
└── SupportOptimizer.ts
```

---

# Recovery System

```text
src/recovery/

├── RecoveryManager.ts
├── AutoSaveService.ts
├── SessionRestorer.ts
├── RecoveryValidator.ts
└── backups/
```

---

# Cost Engine

```text
src/cost_engine/

├── CostCalculator.ts
├── MaterialEstimator.ts
├── EnergyEstimator.ts
└── TimeEstimator.ts
```

---

# Notifications

```text
src/notifications/

├── NotificationFactory.ts
├── NotificationManager.ts
├── NotificationService.ts
└── NotificationValidator.ts
```

---

# Project Persistence

```text
src/project/

├── ProjectManager.ts
├── ProjectSerializer.ts
├── ProjectDeserializer.ts
├── ProjectValidator.ts
├── WYPROJImporter.ts
└── WYPROJExporter.ts
```

---

# Services

```text
src/services/

├── AnalysisService.ts
├── FilamentService.ts
├── MaterialService.ts
├── PresetService.ts
├── PrinterService.ts
├── ProjectService.ts
├── RecommendationService.ts
├── ImportService.ts           = import queue, progress, cancel and errors for the GUI (ADR-029)
├── TransformService.ts        = the only way to change the transform of an object (Phase 6)
├── PrinterSelectionService.ts = printers of the window, last printer (Phase 7)
├── MaterialSelectionService.ts = materials and filaments of the window, last choice (Phase 8)
├── ProfileSyncService.ts      = check of the profile repository, once a day or forced (Phase 7)
└── StorageService.ts
```

---

# State Management

```text
src/state/

├── filamentStore.ts
├── presetStore.ts
├── sceneStore.ts
├── objectStore.ts
├── printerStore.ts
├── materialStore.ts
├── analysisStore.ts
├── recommendationStore.ts
├── importStore.ts             = imports in progress and their result
├── historyStore.ts            = undo and redo stacks (Phase 6)
└── viewportStore.ts           = projection and view presets of the viewport
```

---

# Shared Types

```text
src/types/

├── Printer.ts
├── Material.ts
├── Filament.ts
├── PrintPreset.ts
├── Analysis.ts
├── Classification.ts
├── Recommendation.ts
├── Project.ts
├── Scene.ts
├── Object3D.ts
├── Warning.ts
├── Notification.ts
├── Optimization.ts
├── CostEstimation.ts
├── ProfileSync.ts             = origin of the profiles, ProfileCacheStore contract (Phase 7)
└── UserPreferences.ts
```

---

# Internationalization

```text
src/i18n/

├── LanguageManager.ts
├── LocalizationService.ts
└── TranslationLoader.ts
```

---

# Configuration

```text
src/config/

├── ApplicationConfig.ts
├── EnvironmentConfig.ts
└── FeatureFlags.ts
```

---

# Events

```text
src/events/

├── EventBus.ts
└── EventTypes.ts
```

---

# Storage

```text
src/storage/

├── CacheStorage.ts
├── PrinterProfileCache.ts     = cache of the downloaded profiles, cache/printers/ (Phase 7)
├── PrinterProfileStorage.ts
├── ProjectStorage.ts
├── SettingsStorage.ts
└── StorageManager.ts
```

---

# constants

```text
src/constants

├── AnalysisConstants.ts
├── ApplicationConstants.ts
├── MaterialConstants.ts
├── PresetConstants.ts
├── PrinterConstants.ts
├── HistoryConstants.ts        = MAX_HISTORY_SIZE (undo and redo)
└── ViewportConstants.ts       = coordinate system, colors and camera of the viewport (ADR-028)
```
---

# Utils

```text
src/utils/

├── FileUtils.ts
├── JsonUtils.ts
├── MathUtils.ts
├── ValidationUtils.ts
└── cn.ts
```

---

# Tests

```text
tests/

├── unit/
│   ├── electron/
│   │   ├── MaterialIPC.test.ts = material:getAll, filament:getAll (Phase 8)
│   │   └── PrinterIPC.test.ts = printer:* channels (Phase 7)
│   ├── gui/
│   │   ├── dialogs/
│   │   │   └── printerForm.test.ts = form of the Printer Manager (Phase 7)
│   │   └── hooks/
│   │       └── UndoRedoShortcuts.test.ts = keys of undo and redo (Phase 6)
│   ├── material_database/
│   │   ├── MaterialLoading.test.ts = material and filament profile files, MaterialSchema, FilamentSchema (Phase 8)
│   │   └── MaterialProfiles.test.ts = the profiles of data/materials/ and data/filaments/ (Phase 8)
│   ├── printer_database/
│   │   ├── PrinterLoading.test.ts = printer profile files, PrinterSchema (Phase 7)
│   │   ├── PrinterProfiles.test.ts = the profiles of data/printers/ and their index.json (Phase 7)
│   │   └── UserPrinters.test.ts = printers entered by the user (Phase 7)
│   ├── repositories/
│   │   └── PrinterRepositorySync.test.ts = download of the profile repository (Phase 7)
│   ├── renderer/
│   │   └── ObjectRenderer.test.ts = selection rectangle (Phase 6)
│   ├── scene/
│   │   └── ObjectTransform.test.ts = Transform Rules (ADR-031)
│   ├── storage/
│   │   └── SettingsStorage.test.ts = settings.json, printer and material settings (Phases 7 and 8)
│   └── services/
│       ├── GroupTransform.test.ts = several objects selected (Phase 6)
│       ├── MaterialSelection.test.ts = materials and filaments of the window, last choice, families of a printer (Phase 8)
│       ├── PrinterSelection.test.ts = printers of the window, last printer, profiles (Phase 7)
│       ├── ProfileSync.test.ts = check of the profile repository, cache (Phase 7)
│       ├── TransformService.test.ts = transform changes, object on the plate
│       └── UndoRedo.test.ts = undo and redo of the transform changes
├── integration/
└── e2e/
    ├── fixtures.ts = starts the built application, test files
    ├── app.spec.ts = main window, languages
    ├── import.spec.ts = STL and 3MF import, refused files
    ├── material.spec.ts = materials and filaments served by the main process (Phase 8)
    ├── printer.spec.ts = printers served by the main process, Printer section, Printer Manager, profiles (Phase 7)
    └── transform.spec.ts = transforms, undo and redo, several objects (Phase 6)
```

---

# Assets

```text
assets/

├── icons/
├── images/
├── logos/
└── themes/
```

---

# Cache

```text
cache/
```

---

# Logs

```text
logs/

├── application/
├── errors/
└── diagnostics/
```

---

# Scripts

```text
scripts/

├── build/
│   ├── check-locales.mjs      = checks that en, fr and he dictionaries share the same keys
│   ├── check-ipc-channels.mjs = checks the IPC allow list against the registered handlers
│   └── generate-profile-index.mjs = writes data/printers/index.json (npm run profiles:index -- vX.Y.Z)
├── migration/
├── release/
└── setup/
```

---

# Plugins

```text
plugins/
```

---

# Public

```text
public/
├── locales/
│   ├── en.json
│   ├── fr.json
│   └── he.json
```

---

# Releases

```text
releases/

├── alpha/
├── beta/
├── rc/
└── stable/
```

---

# GitHub

```text
.github/

└── workflows/

    ├── lint.yml
    ├── test.yml
    ├── build.yml
    └── release.yml
```

---

# Planned Items (Not Yet Created)

This document describes the target structure of the project.

The following items are part of the target structure but do not exist yet in the repository.

They must not be assumed to exist.

Root configuration files (Phase 1 - Project Bootstrap, ADR-025):

```text
electron-builder.json
```

Application packaging is not configured yet: no packaging setting (application identifier, product name, targets) is documented.

GitHub workflows:

```text
.github/workflows/lint.yml
.github/workflows/test.yml
.github/workflows/build.yml
.github/workflows/release.yml
```

Source directories and files:

```text
src/gui/layouts/
src/gui/windows/
src/gui/themes/
src/recovery/backups/
src/schemas/ErrorSchema.ts
```

Log directories:

```text
logs/application/
logs/errors/
logs/diagnostics/
```

When one of these items is created, remove it from this list.

---

# Structure Rules

1. Every directory must have a single responsibility.

2. Business logic must never be placed in GUI.

3. Shared logic must be extracted into Services or Utils.

4. New modules must be documented.

5. Architecture changes require documentation updates.

6. Documentation structure must remain synchronized with implementation structure.

7. File ownership must follow FILE_OWNERSHIP_MATRIX.md

8. Domain boundaries must follow DOMAIN_BOUNDARIES.md

9. Domain dependencies must follow DOMAINS_DEPENDENCY_MATRIX.md

10. Impact analysis is mandatory before modifications

11. Documentation updates must follow DOCUMENT_UPDATE_MATRIX.md

12. Bug fixes must follow BUG_ANALYSIS_PROTOCOL.md

---

# Future Reserved Modules

```text
machine_learning/

multi_material/

cloud/

remote_printer/

webcam/

marketplace/
```

---

# Governance Rules

All modifications must follow:

CLAUDE_GOVERNANCE_PROTOCOL.md

CLAUDE_CHANGE_IMPACT_RULES.md

CLAUDE_FILE_UPDATE_RULES.md

CHANGE_CLASSIFICATION_RULES.md

PROJECT_IMPACT_MATRIX.md

CHANGE_VERIFICATION_CHECKLIST.md

DOCUMENT_UPDATE_MATRIX.md

BUG_ANALYSIS_PROTOCOL.md

UPDATE_GOVERNANCE_PROTOCOL.md

---

# Golden Rule

---

A new contributor should be able to understand where a file belongs in less than 60 seconds.

---

# End Of Document
