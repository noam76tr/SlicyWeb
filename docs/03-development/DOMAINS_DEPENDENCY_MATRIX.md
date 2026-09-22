# SlicyWeb SMART SLICER

# DOMAINS DEPENDENCY MATRIX

Version: 2.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines all allowed and forbidden dependencies between project domains.

The objective is to:

- Preserve architecture integrity
- Prevent domain coupling
- Prevent circular dependencies
- Prevent architectural violations
- Improve maintainability
- Reduce regressions
- Improve scalability
- Simplify future development

All modules, services, APIs, engines, and future extensions must comply with this matrix.

---

# Dependency Philosophy

Dependencies must always flow inward.

Business logic must remain independent from presentation logic.

Infrastructure concerns must remain isolated.

User interface components must not directly depend on low-level systems.

---

# Dependency Rule

Allowed:

```text
Higher Level
↓
Lower Level
```

Forbidden:

```text
Lower Level
↓
Higher Level
```

Example:

Allowed:

```text
GUI
↓
Services
```

Forbidden:

```text
Services
↓
GUI
```

---

# Architecture Layers

```text
GUI Domain
↓
Application Domain
↓
Service Domain
↓
Repository Domain
↓
RepositorySync Domain
↓
External Sources
```

Dependencies must follow this order.

---

# Domain Overview

Current Domains:

```text
GUI
Viewport
Scene
Import
Analysis
Classification
Recommendation
Optimization
Profiles
Presets
State Management
IPC
API
Repositories
RepositorySync
Storage
Validation
Notification
Cost Estimation
Project Management
Internationalization
Security
Testing
```

---

# GUI DOMAIN

Purpose:

Responsible for:

- Rendering
- User Interaction
- User Controls
- Layout
- Menus
- Panels

Owns:

```text
GUI_SPEC.md
src/gui/
src/components/
src/pages/
```

Can Depend On:

```text
Application Domain
Service Domain
State Management Domain
IPC Domain
Notification Domain
```

Cannot Depend On:

```text
Repository Domain
RepositorySync Domain
Storage Domain
Analysis Domain
Classification Domain
Recommendation Domain
Optimization Domain
```

Forbidden:

```text
GUI
↓
Repository
```

```text
GUI
↓
Database
```

```text
GUI
↓
Remote Sources
```

---

# VIEWPORT DOMAIN

Purpose:

Responsible for:

- Three.js Integration
- Camera
- Rendering
- Selection
- Visual Transformations

Can Depend On:

```text
GUI Domain
Scene Domain
State Management Domain
```

Cannot Depend On:

```text
Repository Domain
RepositorySync Domain
Analysis Domain
Recommendation Domain
```

---

# APPLICATION DOMAIN

Purpose:

Coordinates application workflows.

Can Depend On:

```text
Service Domain
State Management Domain
IPC Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
Remote Sources
```

---

# SERVICE DOMAIN

Purpose:

Business logic.

Can Depend On:

```text
Repository Domain
Validation Domain
Profiles Domain
Analysis Domain
Classification Domain
Recommendation Domain
Optimization Domain
Notification Domain
```

Cannot Depend On:

```text
GUI Domain
Renderer Domain
Viewport Domain
```

---

# STATE MANAGEMENT DOMAIN

Purpose:

Application state ownership.

Owns:

```text
src/state/
```

Can Depend On:

```text
Service Domain
Validation Domain
```

Cannot Depend On:

```text
RepositorySync Domain
Remote Sources
GUI Components
```

---

# IMPORT DOMAIN

Purpose:

File import.

Can Depend On:

```text
Validation Domain
Scene Domain
Storage Domain
```

Cannot Depend On:

```text
GUI Domain
Recommendation Domain
```

---

# SCENE DOMAIN

Purpose:

Scene management.

Can Depend On:

```text
Import Domain
State Management Domain
```

Cannot Depend On:

```text
Repository Domain
RepositorySync Domain
```

---

# ANALYSIS DOMAIN

Purpose:

Geometry analysis.

Can Depend On:

```text
Scene Domain
Profiles Domain
Validation Domain
```

Cannot Depend On:

```text
GUI Domain
Repository Domain
RepositorySync Domain
Remote Sources
```

Must Remain:

```text
Deterministic
Reproducible
Testable
```

---

# CLASSIFICATION DOMAIN

Purpose:

Object classification.

Can Depend On:

```text
Analysis Domain
Profiles Domain
Validation Domain
```

Cannot Depend On:

```text
GUI Domain
Storage Domain
RepositorySync Domain
```

---

# RECOMMENDATION DOMAIN

Purpose:

Recommendation generation.

Can Depend On:

```text
Analysis Domain
Classification Domain
Profiles Domain
Presets Domain
Validation Domain
Optimization Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
Remote Sources
```

---

# OPTIMIZATION DOMAIN

Purpose:

Optimization processing.

Can Depend On:

```text
Analysis Domain
Classification Domain
Profiles Domain
Recommendation Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

---

# PROFILES DOMAIN

Purpose:

Printer, material and filament profiles.

Owns:

```text
PRINTER_PROFILE_SPEC.md
MATERIAL_PROFILE_SPEC.md
FILAMENT_SETTINGS_SPEC.md
```

Can Depend On:

```text
Validation Domain
Storage Domain
Repository Domain
```

Cannot Depend On:

```text
GUI Domain
Recommendation Domain
Optimization Domain
```

---

# PRESETS DOMAIN

Purpose:

Print presets.

Can Depend On:

```text
Profiles Domain
Validation Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

---

# VALIDATION DOMAIN

Purpose:

Validation of all external and internal data.

Can Depend On:

```text
DATA_SCHEMA.md
Profiles Domain
Presets Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

Validation must remain independent.

---

# API DOMAIN

Purpose:

API contracts.

Can Depend On:

```text
Validation Domain
Service Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

API layer should never contain business logic.

---

# IPC DOMAIN

Purpose:

Renderer ↔ Main communication.

Can Depend On:

```text
Service Domain
Validation Domain
```

Cannot Depend On:

```text
RepositorySync Domain
Remote Sources
```

Required Flow:

```text
Renderer
↓
IPC
↓
Services
```

---

# REPOSITORY DOMAIN

Purpose:

Repository access.

Can Depend On:

```text
Storage Domain
Validation Domain
RepositorySync Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
Optimization Domain
```

---

# REPOSITORYSYNC DOMAIN

Purpose:

External synchronization.

Can Depend On:

```text
Remote Sources
Validation Domain
Repository Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
Optimization Domain
```

---

# STORAGE DOMAIN

Purpose:

Local persistence.

Can Depend On:

```text
Validation Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
```

---

# NOTIFICATION DOMAIN

Purpose:

User notifications.

Can Depend On:

```text
Service Domain
Recommendation Domain
Validation Domain
```

Cannot Depend On:

```text
RepositorySync Domain
Remote Sources
```

---

# COST ESTIMATION DOMAIN

Purpose:

Cost calculations.

Can Depend On:

```text
Profiles Domain
Recommendation Domain
Analysis Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

---

# PROJECT MANAGEMENT DOMAIN

Purpose:

Save, load and recovery.

Can Depend On:

```text
Storage Domain
Validation Domain
Scene Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
```

---

# INTERNATIONALIZATION DOMAIN

Purpose:

Localization and language management.

Responsible For:

```text
- Language Selection
- Translation Loading
- Translation Resolution
- Localization Services
- Language Persistence
```

Owns:

```text
src/i18n/
LanguageManager.ts
LocalizationService.ts
TranslationLoader.ts
public/locales/
```

Can Depend On:

```text
Validation Domain
Storage Domain
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain
Remote Sources
```

Requirements:

```text
- No hardcoded UI text
- Language-neutral project files
- Externalized translations
- Consistent localization behavior
```

Managed Languages:

```text
English
French
Hebrew
```

---

# SECURITY DOMAIN

Purpose:

Security enforcement.

Can Depend On:

```text
Validation Domain
Repository Domain
Storage Domain
```

Cannot Depend On:

```text
GUI Domain
```

Security concerns must remain centralized.

---

# TESTING DOMAIN

Purpose:

Verification.

Can Depend On:

```text
Any Domain
```

Production domains must never depend on testing domains.

---

# Remote Sources

Examples:

```text
GitHub
REST APIs
External Repositories
Cloud Providers
```

Remote sources must only be accessed through:

```text
RepositorySync Domain
```

Direct access is forbidden.

---

# Circular Dependency Rule

Circular dependencies are prohibited.

Forbidden Example:

```text
GUI
↓
Service
↓
GUI
```

Forbidden Example:

```text
Repository
↓
Analysis
↓
Repository
```

---

# New Domain Rule

Before creating a new domain:

Verify:

```text
Existing Responsibility?
Existing Domain?
Existing Service?
Existing Module?
```

Create a new domain only if:

```text
Responsibility is unique
Responsibility is reusable
Responsibility is clearly isolated
```

---

# Dependency Verification Rule

Before introducing a dependency:

Verify:

```text
Domain Boundaries

Ownership Rules

Architecture Rules

Impact Analysis

Documentation Impact
```

---

# Enforcement Rule

Any dependency violating this matrix must be:

```text
Rejected
```

or

```text
Explicitly Approved
```

through documented architectural review.

---

# Golden Rule

Domains must communicate through approved architecture paths.

A working architecture is more valuable than a convenient shortcut.

Protect separation of responsibilities at all times.
