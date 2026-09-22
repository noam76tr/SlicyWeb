# SLICYWEB
# DIRECTORY PURPOSES

Version: 2.0.0

Status: Approved

---

# Purpose

This document defines the purpose and responsibility of every directory used within the SlicyWeb project.

The objective is to ensure:

- Consistent project organization
- Clear responsibilities
- Easier onboarding
- Improved maintainability
- Predictable file placement

Every file should be placed in the directory that matches its responsibility.

---

# Project Root

```text
SlicyWeb/
```

Purpose:

```text
Project Root Directory
```

Contains:

```text
Project Configuration
Documentation
Source Code
Assets
Tests
Runtime Resources
```

---

# Root Governance Files

Purpose:

```text
AI Governance Layer
```

Contains:

```text
CLAUDE.md

CLAUDE_PROJECT_CONTEXT.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_CHANGE_IMPACT_RULES.md

CLAUDE_FILE_UPDATE_RULES.md
```

---

# .github/

Purpose:

```text
GitHub Configuration and Workflows
```

Contains:

```text
GitHub Actions Workflows
CI/CD Configuration
GitHub Templates
Repository Settings
```

---

# .github/workflows/

Purpose:

```text
Automation Pipeline
```

Contains:

```text
Build Validation
Testing
Linting
Release Automation
```

---

# docs/

Purpose:

```text
Project Documentation
```

Contains:

```text
Specifications
Architecture
Rules
Roadmaps
Guides
```

---

# docs/00-index/

Purpose:

```text
Documentation Entry Point
```

Contains:

```text
Documentation Index
AI Reading Guide
API Reading Guide
AI Development Protocol
Claude Governance
Reading Priorities
Documentation Navigation
Governance Navigation
```

---

# docs/01-project/

Purpose:

```text
Project Definition
```

Contains:

```text
Vision
Scope
Roadmap
Planning
Change History
```

---

# docs/02-architecture/

Purpose:

```text
System Design
```

Contains:

```text
Architecture
Schemas
Tech Stack
File Structure
API Definitions
```

---

# docs/03-development/

Purpose:

```text
Development Standards
```

Contains:

```text
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
```

Documents:

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

# docs/04-ai/

Purpose:

```text
Artificial Intelligence Specifications
```

Contains:

```text
Analysis Logic
Recommendations
Classification
Presets
Support Generation
```

---

# docs/05-profiles/

Purpose:

```text
Profile Definitions
```

Contains:

```text
Printer Profiles
Material Profiles
Filament Profiles
```

---

# docs/06-quality/

Purpose:

```text
Quality Assurance
```

Contains:

```text
Testing
Security
Performance
```

---

# docs/07-future/

Purpose:

```text
Future Systems
```

Contains:

```text
G-Code Specifications
Plugin System
Future Extensions
```

---

# docs/08-user-interface/

Purpose:

```text
User Interface Specifications
```

Contains:

```text
Layouts
Panels
Menus
User Experience Definitions
```

---

# docs/09-reference/

Purpose:

```text
Project Reference Material
```

Contains:

```text
Glossary
Terminology
Naming Rules
Acronyms
Versioning Policies
Architecture Decisions
Directory Definitions
Governance References
```

---

# src/

Purpose:

```text
Application Source Code
```

Contains:

```text
Business Logic
User Interface
Data Processing
Application Systems
```

---

# src/app/

Purpose:

```text
Application Bootstrap Layer
```

Contains:

```text
Startup Logic
Shutdown Logic
Application Initialization
Dependency Management
```

---

# src/gui/

Purpose:

```text
User Interface Layer
```

Contains:

```text
Layouts
Panels
Dialogs
Menus
Components
Themes
```

---

# src/gui/viewport/

Purpose:
```text
3D Workspace User Interface
```

Contains:

```text
Viewport Rendering Components
Viewport Controls
Viewport Status Display
Workspace Interaction Tools
```

---

# src/gui/panels/

Purpose:

```text
Application Functional Panels
```

Contains:

```text
Printer Configuration Panels
Material Panels
Filament Panels
Preset Panels
Analysis Panels
Recommendation Panels
```

---

# src/gui/statusbar/

Purpose:

```text
Application Status Display
```

Contains:

```text
Status Messages
Progress Indicators
Notifications
System Information
```

---

# src/renderer/

Purpose:

```text
3D Rendering System
```

Contains:

```text
Scene Rendering
Viewport Rendering
Camera Management
Lighting Management
```

---

# src/scene/

Purpose:

```text
Scene Management
```

Contains:

```text
Workspace Data
Scene Validation
Scene Serialization
```

---

# src/object_manager/

Purpose:

```text
Model Management
```

Contains:

```text
Object Creation
Object Storage
Duplication
Validation
```

---

# src/optimization_engine/

Purpose:

```text
Print Optimization Engine
```

Contains:

```text
OptimizationEngine
OrientationOptimizer
MaterialOptimizer
SpeedOptimizer
SupportOptimizer
```

Components:

- OptimizationEngine.ts
- OrientationOptimizer.ts
- MaterialOptimizer.ts
- SpeedOptimizer.ts
- SupportOptimizer.ts
  
---

# src/transform/

Purpose:

```text
Transformation Tools
```

Contains:

```text
Move

Rotate
Scale
Transform Validation
Undo/Redo History
```

---

# src/importer/

Purpose:

```text
Model Import System
```

Contains:

```text
STL Import
3MF Import
Import Validation
File Processing
```

---

# src/printer_database/

Purpose:

```text
Printer Management System
```

Contains:

```text
Printer Loading
Printer Validation
Printer Storage
Printer Repositories
```

---

# src/material_database/

Purpose:

```text
Material Management System
```

Contains:

```text
Material Profiles
Material Validation
Material Repositories
Material Caching
```

---

# src/filament_database/

Purpose:

```text
Filament Management System
```

Contains:

```text
Filament Profiles
Manufacturer Data
Filament Validation
Filament Repositories
Filament Caching
```

---

# src/model_analysis/

Purpose:

```text
Geometry Analysis Engine
```

Contains:

```text
Mesh Analysis
Printability Analysis
Stability Analysis
Geometry Evaluation
```

---

# src/notifications/

Purpose:

```text
Application Notification System
```

Contains:

```text
NotificationFactory
NotificationManager
NotificationService
NotificationValidator
```

Components:
 
- NotificationFactory.ts
- NotificationManager.ts
- NotificationService.ts
- NotificationValidator.ts
  
---

# src/classification_engine/

Purpose:

```text
Object Classification System
```

Contains:

```text
Object Categories
Classification Rules
Confidence Scoring
Classification Validation
```

Components:
 
- ClassificationEngine.ts
- CategoryDetector.ts
- ConfidenceScorer.ts
- ClassificationValidator.ts
  
---

# src/recommendation_engine/

Purpose:

```text
Recommendation Generation
```

Contains:

```text
Decision Rules
Validation Engine
Warning Generation
Recommendation Building
```

Components:

- RecommendationEngine.ts
- DecisionEngine.ts
- ValidationEngine.ts
- WarningEngine.ts
- RecommendationBuilder.ts

---

# src/preset_engine/

Purpose:

```text
Print Preset Management
```

Contains:

```text
Preset Selection
Preset Validation
Preset Recommendations
Preset Storage
```

---

# src/cost_engine/

Purpose:

```text
Cost Computation
```

Contains:

```text
Material Cost Calculation
Energy Cost Estimation
Time Estimation
Total Cost Computation
```

---

# src/repositories/

Purpose:

```text
Data Access Layer
```

Contains:

```text
GitHub Repository
Printer Repository Synchronization
Material Repository Synchronization
Filament Repository Synchronization
Preset Repository Synchronization
Remote Data Access
Sync Operations
```

Components:

- GitHubRepository.ts
- PrinterRepositorySync.ts
- MaterialRepositorySync.ts
- FilamentRepositorySync.ts
- PresetRepositorySync.ts
  
---

# src/storage/

Purpose:

```text
Persistence Layer
```

Contains:

```text
StorageManager
ProjectStorage
CacheStorage
Project Persistence
Local Storage
Cache Management
```

Components:

- StorageManager.ts
- ProjectStorage.ts
- CacheStorage.ts

---

# src/recovery/

Purpose:

```text
Project Recovery System
```

Contains:

```text
Auto Save Service
Recovery Files
Session Restoration
Recovery Validation
```

---

# src/services/

Purpose:

```text
Shared Application Services
```

Contains:

```text
Analysis Service
Filament Service
Material Service
Preset Service
Printer Service
Project Service
Recommendation Service
Storage Service
```

Components:

- AnalysisService.ts
- FilamentService.ts
- MaterialService.ts
- PresetService.ts
- PrinterService.ts
- ProjectService.ts
- RecommendationService.ts
- StorageService.ts
  
---

# src/events/

Purpose:

```text
Application Event System
```

Contains:

```text
Event Bus
Event Dispatching
Event Types
Subscriptions
```

---

# src/state/

Purpose:

```text
Application State Management
```

Contains:

```text
Analysis Store

Application Store
Filament Store
Material Store
Object Store
Preset Store
Printer Store
Recommendation Store
Scene Store
```

---

# src/config/

Purpose:

```text
Configuration Management
```

Contains:

```text
Application Configuration
Feature Flags
Environment Settings
```

---

# src/constants/

Purpose:

```text
Global Constants
```

Contains:

```text
Analysis Constants
Application Constants
Material Constants
Preset Constants
Printer Constants
```

---

# src/utils/

Purpose:

```text
Shared Utility Functions
```

Contains:

```text
File Utilities
JSON Utilities
Validation Helpers
Mathematical Helpers
```

Must Not Contain:

```text
Business Logic
AI Logic
Application State
```

---

# src/schemas/

Purpose:

```text
Runtime Validation Layer
```
Contains:

```text
PrinterSchema
MaterialSchema
FilamentSchema
PrintPresetSchema
AnalysisSchema
RecommendationSchema
Zod Validation Rules
Runtime Type Validation
```

Components:
 
- PrinterSchema.ts
- MaterialSchema.ts
- FilamentSchema.ts
- PrintPresetSchema.ts
- AnalysisSchema.ts
- RecommendationSchema.ts
  
---

# src/types/

Purpose:

```text
Shared Type Definitions
```

Contains:

```text
TypeScript Types
Interfaces
Enums
Domain Models
```

---

# src-electron/

Purpose:

```text
Reserved Electron Workspace
```

Contains:

```text
Future Electron Entry Point/Modules
Future Main Process Organization
Electron Architecture Extensions
```

Status:
```text
Placeholder Directory
```

Used For:

```text
Future Electron Refactoring
Desktop Architecture Separation
```

---

# src/electron/

Purpose:

```text
Electron Framework Integration
```

Contains:

```text
Main Process Logic
Preload Scripts
IPC Communication
Desktop Application Integration
Runtime Services
```

---

# src/electron/ipc/

Purpose:

```text
Inter-Process Communication Handlers
```

Contains:

```text
ImportIPC
PrinterIPC
ProjectIPC
SettingsIPC
StorageIPC
Electron Communication Handlers
Renderer ↔ Main Process Communication
```

---

# data/

Purpose:

```text
Project Data Repository
```

Contains:

```text
Printer Profiles
Material Profiles
Filament Profiles
Print Presets
Configuration Files
```

---

# data/printers/

Purpose:

```text
Printer Profile Storage
```

Contains:

```text
Printer Definitions
Manufacturer Profiles
Printer Configurations
```

---

# data/materials/

Purpose:

```text
Material Profile Storage
```

Contains:

```text
PLA Materials

PETG Materials
ABS Materials
ASA Materials
TPU Materials
Other Material Types
```

---

# data/filaments/

Purpose:

```text
Filament Profile Storage
```

Contains:

```text
Manufacturer-Specific Filaments
Filament Definitions
Brand Profiles
```

---

# data/presets/

Purpose:

```text
Print Preset Storage
```

Contains:

```text
Draft Presets

Balanced Presets
Quality Presets
Mechanical Presets
Miniature Presets
Custom Presets
```

---

# assets/

Purpose:

```text
Static Project Assets
```

Contains:

```text
Icons
Images
Logos
Themes
Visual Resources
```

---

# assets/icons/

Purpose:

```text
Application Icon Resources
```

Contains:

```text
UI Icons
Toolbar Icons
Navigation Icons
Symbol Assets
```

---

# assets/images/

Purpose:

```text
Image Assets
```

Contains:

```text
Screenshots
Promotional Images
Documentation Images
Visual Graphics
```

---

# assets/logos/

Purpose:

```text
Project Logo Resources
```

Contains:

```text
Brand Logos
Logo Variants
Application Branding
```

---

# assets/themes/

Purpose:

```text
UI Theme Resources
```

Contains:

```text
Color Schemes
Theme Definitions
Dark Mode Assets
Light Mode Assets
```

---

# public/

Purpose:

```text
Public Static Resources
```

Contains:

```text
Distributable Assets
Public Files
Static Content
Build Output
```

---

# releases/

Purpose:

```text
Application Release Distribution
```

Contains:

```text
Alpha Releases
Beta Releases
Release Candidates
Stable Releases
Version Archives
```

---

# releases/alpha/

Purpose:

```text
Alpha Release Storage
```

Contains:

```text
Experimental Features
Early Development Builds
Unstable Versions
```

---

# releases/beta/

Purpose:

```text
Beta Release Storage
```

Contains:

```text
Feature Complete Builds
Pre-Release Testing
Beta Versions
```

---

# releases/rc/

Purpose:

```text
Release Candidate Storage
```

Contains:

```text
Candidate Builds
Final Testing
RC Versions
```

---

# releases/stable/

Purpose:

```text
Stable Release Storage
```

Contains:

```text
Production Builds
Official Releases
Stable Versions
```

---

# scripts/

Purpose:

```text
Automation Scripts and Build Tools
```

Contains:

```text
Build Scripts

Migration Scripts
Release Scripts
Setup Scripts
Utility Scripts
```

---

# scripts/build/

Purpose:

```text
Build Automation Scripts
```

Contains:

```text
Compilation Scripts
Build Configuration
Package Scripts
Bundling Tools
```

---

# scripts/migration/

Purpose:

```text
Data Migration Scripts
```

Contains:

```text
Schema Migrations
Data Transformations
Upgrade Scripts
Version Transitions
```

---

# scripts/release/

Purpose:

```text
Release Management Scripts
```

Contains:

```text
Release Automation
Version Tagging
Distribution Packaging
Changelog Generation
```

---

# scripts/release/alpha/

Purpose:

```text
Alpha Release Automation
```

Contains:

```text
Alpha Build Scripts
Alpha Distribution
Experimental Release Tools
```

---

# scripts/release/beta/

Purpose:

```text
Beta Release Automation
```

Contains:

```text
Beta Build Scripts
Beta Distribution
Pre-Release Tools
```

---

# scripts/release/rc/

Purpose:

```text
Release Candidate Automation
```

Contains:

```text
RC Build Scripts
RC Distribution
Final Release Preparation
```

---

# scripts/release/stable/

Purpose:

```text
Stable Release Automation
```

Contains:

```text
Stable Build Scripts
Stable Distribution
Production Release Tools
```

---

# scripts/setup/

Purpose:

```text
Development Environment Setup
```

Contains:

```text
Installation Scripts
Dependency Setup
Configuration Initialization
Development Environment Tools
```

---

# tests/

Purpose:

```text
Automated Testing Suite
```

Contains:

```text
Unit Tests
Integration Tests
End-to-End Tests
Test Configuration
Test Utilities
```

---

# tests/unit/

Purpose:

```text
Unit Testing
```

Contains:

```text
Component Tests
Function Tests
Module Tests
Isolated Logic Tests
```

Used For:

```text
Quality Assurance
Regression Prevention
Feature Validation
System Reliability
Release Verification
```

---

# tests/integration/

Purpose:

```text
Integration Testing
```

Contains:

```text
Multi-Module Tests
System Integration Tests
API Tests
Cross-Component Tests
```

---

# tests/e2e/

Purpose:

```text
End-to-End Testing
```

Contains:

```text
User Workflow Tests
Application Flow Tests
Complete Scenario Tests
UI Interaction Tests
```

---

# cache/

Purpose:

```text
Application Cache Storage
```

Contains:

```text
Temporary Cache Files
Performance Cache
Session Cache
Compiled Cache
```

---

# logs/

Purpose:

```text
Application Logging
```

Contains:

```text
Runtime Logs
Error Logs
Debug Logs
Session Logs
Diagnostic Information
```

---

# plugins/

Purpose:

```text
Plugin System and Extensions
```

Contains:

```text
Third-Party Plugins
Custom Extensions
Plugin Configuration
Plugin Resources
```

---

# Governance Documents

The project governance framework includes:

```text
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
```

These documents define:

```text
- Ownership
- Dependencies
- Impact Analysis
- Documentation Updates
- Bug Investigation
- Update Validation
- Change Verification
- Architecture Governance
```

---

# Golden Rule

Every file should have a single clear responsibility and should be stored in the directory that best matches that responsibility.

If a file does not clearly belong to a directory, the project structure should be reviewed before creating the file.

---

# End Of Document
