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

Business logic orchestration.

Can Depend On:

```text
Repository Domain
RepositorySync Domain
Validation Domain
Profiles Domain
Analysis Domain
Classification Domain
Recommendation Domain
Optimization Domain
Notification Domain
Cost Estimation Domain
State Management Domain
IPC Domain
```

Cannot Depend On:

```text
GUI Domain
Viewport Domain
```

Required Flow:

```text
IPC
↓
Service
↓
Repository
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
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

API contracts and payload specifications.

Can Depend On:

```text
Validation Domain
Data Schema Contracts
```

Cannot Depend On:

```text
GUI Domain
Service Domain (Service implements API, not vice-versa)
RepositorySync Domain
Repository Domain
Storage Domain
```

API must:

```text
Define Service Contracts
Define Payload Formats
Define Response Formats
Define Error Formats
Remain Independent from Implementation
```

API must not:

```text
Contain Business Logic
Contain Rendering Logic
Perform Validation (Validation Domain does)
Access Storage
Access Remote Sources
```

---

# IPC DOMAIN

Purpose:

Electron Renderer ↔ Main communication.

Can Depend On:

```text
Service Domain
Validation Domain
Security Domain
```

Cannot Depend On:

```text
GUI Domain (directly, GUI uses IPC through Services)
RepositorySync Domain
Remote Sources
Repository Domain (directly, through Services)
Storage Domain (directly, through Services)
```

Required Flow:

```text
Renderer (GUI)
↓
IPC
↓
Service
↓
Repository
```

IPC must:

```text
Validate All Renderer Requests
Serialize Responses Safely
Propagate Errors Safely
Enforce Request Authentication
Prevent Direct Access to Storage/Repository/RepositorySync
```

IPC must not:

```text
Contain Business Logic
Access Remote Sources
Access Storage Directly
```

---

# REPOSITORY DOMAIN

Purpose:

Local repository access and data coordination.

Can Depend On:

```text
Storage Domain
Validation Domain
RepositorySync Domain
State Management Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
Optimization Domain
Service Domain (directly, only through defined contracts)
```

Required Flow:

```text
Service
↓
Repository
├── Storage (for local data)
└── RepositorySync (for remote data)
```

Repository must:

```text
Coordinate Local Storage / Cache
Coordinate RepositorySync Requests
Validate Repository Data Before Use
Normalize External Data
Reject Invalid Data
```

---

# REPOSITORYSYNC DOMAIN

Purpose:

Validated external synchronization.

Can Depend On:

```text
Remote Sources
Validation Domain
Security Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
Optimization Domain
Repository Domain (Repository calls RepositorySync, not vice-versa)
Service Domain
```

Required Flow:

```text
Repository
↓
RepositorySync
↓
Remote Sources
↓
Validation
↓
Repository
```

RepositorySync must:

```text
Access Only Remote Sources (never Storage)
Validate All Remote Responses
Reject Invalid Remote Data
Return Normalized Synchronization Results
Handle Remote Errors Safely
Return Error Codes (never Expose Raw Errors)
```

RepositorySync must not:

```text
Write Directly to Storage
Bypass Repository
Expose Raw Remote Data
Contain Repository Logic
```

---

# STORAGE DOMAIN

Purpose:

Local persistence and cache management.

Can Depend On:

```text
Validation Domain
```

Cannot Depend On:

```text
GUI Domain
Analysis Domain
Recommendation Domain
RepositorySync Domain
Repository Domain (Repository calls Storage, not vice-versa)
```

Storage must:

```text
Persist Validated Data Only
Manage Cache Lifecycle
Invalidate Expired Cache Entries
Reject Corrupted Data
Provide Local File Access
```

Storage must not:

```text
Perform Geometry Analysis
Generate Recommendations
Access Remote Sources
Coordinate with RepositorySync Directly
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

Security enforcement and trust validation.

Can Depend On:

```text
Validation Domain
Repository Domain
Storage Domain
API Domain
Data Schema Contracts
```

Cannot Depend On:

```text
GUI Domain
RepositorySync Domain (but receives data from it for validation)
Analysis Domain
Recommendation Domain
```

Security must:

```text
Define Security Policies
Validate Input Safety
Validate Repository Data Integrity
Validate Remote Source Trust
Protect Credentials
Protect Sensitive Data
Control Error Exposure
```

Security must not:

```text
Perform Geometry Analysis
Generate Recommendations
Render UI
Access Remote Sources Directly
```

Required Flow:

```text
RepositorySync
↓
Security Validation
↓
Repository
↓
Storage
```

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
