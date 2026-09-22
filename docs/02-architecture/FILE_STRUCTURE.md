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
├── src-electron/
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
├── package.json
├── tsconfig.json
├── vite.config.ts
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
│   ├── filaments/
│   ├── materials/
│   ├── presets/
│   ├── printers/
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

# Electron

```text
src/electron/

├── main.ts
├── preload.ts

└── ipc/
    ├── ImportIPC.ts
    ├── PrinterIPC.ts
    ├── ProjectIPC.ts
    ├── SettingsIPC.ts
    └── StorageIPC.ts
```

---

# GUI Layer

```text
src/gui/
├── App.tsx
└── MainLayout.tsx

src/gui/viewport/
├── Viewport.tsx
├── ViewportToolbar.tsx
└── ViewportStatus.tsx
	
src/gui/sidebar/
├── LeftSidebar.tsx
├── RightSidebar.tsx
└── SidebarSection.tsx

src/gui/panels/
├── PrinterPanel.tsx
├── MaterialPanel.tsx
├── FilamentPanel.tsx
├── PresetPanel.tsx
├── AnalysisPanel.tsx
└── RecommendationPanel.tsx

src/gui/statusbar/
└── StatusBar.tsx
	
├── src/gui/layouts/
├── src/gui/windows/
├── src/gui/dialogs/
├── src/gui/menus/
├── src/gui/toolbars/
├── src/gui/components/
├── src/gui/themes/
├── src/gui/hooks/
└── src/gui/styles/
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
└── SelectionRenderer.ts
└── helpers/
```

---

# repositories

```text
src/repositories/

├── GitHubRepository.ts
├── PrinterRepositorySync.ts
├── MaterialRepositorySync.ts
├── FilamentRepositorySync.ts
└── PresetRepositorySync.ts

```

---

# Schemas

```text
src/schemas/

├── AnalysisSchema.ts
├── FilamentSchema.ts
├── MaterialSchema.ts
├── PrintPresetSchema.ts
├── PrinterSchema.ts
└── RecommendationSchema.ts
```

---

# Scene

```text
src/scene/

├── SceneManager.ts
├── SceneFactory.ts
├── SceneSerializer.ts
└── SceneValidator.ts
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

├── MoveTool.ts
├── RotateTool.ts
├── ScaleTool.ts
├── TransformManager.ts
├── HistoryManager.ts
├── UndoRedoManager.ts
└── TransformValidator.ts
```

---

# Import System

```text
src/importer/

├── STLImporter.ts
├── ThreeMFImporter.ts
├── ImportManager.ts
└── FileValidator.ts
```

---

# Printer Database

```text
src/printer_database/

├── PrinterManager.ts
├── PrinterRepository.ts
├── PrinterValidator.ts
├── PrinterCache.ts
└── PrinterImporter.ts
```

---

# Material Database

```text
src/material_database/

├── MaterialManager.ts
├── MaterialRepository.ts
├── MaterialValidator.ts
├── MaterialCache.ts
└── MaterialImporter.ts
```

---
# Filament Database

```text
src/filament_database/

├── FilamentManager.ts
├── FilamentRepository.ts
├── FilamentValidator.ts
├── FilamentCache.ts
└── FilamentImporter.ts
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
└── StorageService.ts
```

---

# State Management

```text
src/state/

├── appStore.ts
├── filamentStore.ts
├── presetStore.ts
├── sceneStore.ts
├── objectStore.ts
├── printerStore.ts
├── materialStore.ts
├── analysisStore.ts
└── recommendationStore.ts
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
├── DefaultMaterial.ts
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

# constants

```text
src/constants

├── AnalysisConstants.ts
├── ApplicationConstants.ts
├── MaterialConstants.ts
├── PresetConstants.ts
└── PrinterConstants.ts
```
---

# Utils

```text
src/utils/

├── FileUtils.ts
├── JsonUtils.ts
├── MathUtils.ts
└── ValidationUtils.ts
```

---

# Tests

```text
tests/

├── unit/
├── integration/
└── e2e/
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

undo_redo/
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
