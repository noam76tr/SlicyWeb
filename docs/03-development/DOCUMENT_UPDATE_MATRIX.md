# SlicyWeb SMART SLICER

# DOCUMENT UPDATE MATRIX

Version: 2.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines when documentation must be:

- Reviewed
- Updated
- Verified
- Left Unchanged

The objective is to:

- Prevent documentation drift
- Prevent incomplete updates
- Prevent unnecessary updates
- Ensure consistency
- Improve traceability
- Reduce regressions
- Maintain project integrity

This document must be consulted before modifying:

- Documentation
- Schemas
- APIs
- Architecture
- Features
- Domains
- Project Structure
- Governance Rules

---

# Update Philosophy

Every change requires documentation review.

Not every change requires documentation updates.

Required workflow:

```text
Modification
↓
Impact Analysis
↓
Dependency Review
↓
Documentation Review
↓
Determine Required Updates
↓
Update Only What Is Necessary
```

Documentation must remain synchronized with the project.

Documentation must not be updated without a valid reason.

---

# Update Classification

Documentation actions belong to one of four categories:

```text
Mandatory Update

Conditional Update

Review Only

No Action Required
```

---

# Mandatory Update

A document must be updated.

The update is required.

Failure to update creates inconsistency.

---

# Conditional Update

The document must be reviewed.

Update only if the affected content changed.

---

# Review Only

Review required.

No update unless inconsistency is detected.

---

# No Action Required

No documentation action needed.

---

# New Documentation File

Examples:

```text
New Protocol

New Specification

New Reference Document

New Governance Document
```

Mandatory Updates:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt
```

Conditional Updates:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md
```

Changelog Evaluation:

```text
Required
```

---

# Documentation File Removed

Mandatory Updates:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt
```

Conditional Updates:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md
```

Changelog Evaluation:

```text
Required
```

---

# Documentation File Renamed

Mandatory Updates:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt

All References
```

Conditional Updates:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md
```

Changelog Evaluation:

```text
Required
```

---

# Documentation File Moved

Mandatory Updates:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt

All Path References
```

Conditional Updates:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md
```

Changelog Evaluation:

```text
Required
```

---

# Architecture Change

Examples:

```text
New Layer

Removed Layer

Communication Changes

Domain Changes

Dependency Changes
```

Mandatory Reviews:

```text
ARCHITECTURE.md

DOMAINS_DEPENDENCY_MATRIX.md

DOMAIN_BOUNDARIES.md
```

Mandatory Update Evaluation:

```text
DATA_SCHEMA.md

API_SPEC.md

FILE_STRUCTURE.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGELOG.md
```

Conditional Updates:

```text
AI_START_HERE.md

README.md

DIRECTORY_PURPOSES.md

TECHNICAL_OVERVIEW.md

TECH_STACK.md
```

---

# Domain Creation

Examples:

```text
New Architectural Domain

New Business Domain
```

Mandatory Updates:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md
```

Mandatory Update Evaluation:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md

PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt

CLAUDE_PROJECT_CONTEXT.md

CHANGELOG.md
```

---

# Domain Responsibility Change

Examples:

```text
Ownership Change

Responsibility Change

Boundary Change
```

Mandatory Updates:

```text
DOMAIN_BOUNDARIES.md

FILE_OWNERSHIP_MATRIX.md
```

Mandatory Review:

```text
DOMAINS_DEPENDENCY_MATRIX.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Schema Change

Examples:

```text
New Field

Removed Field

Contract Change

Validation Change

New Schema
```

Mandatory Updates:

```text
DATA_SCHEMA.md
```

Mandatory Review:

```text
PROJECT_SPEC.md

API_SPEC.md

AI_ENGINE_SPEC.md

ARCHITECTURE.md
```

Conditional Updates:

```text
PRINTER_PROFILE_SPEC.md

MATERIAL_PROFILE_SPEC.md

FILAMENT_SETTINGS_SPEC.md

PRINT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---
# Project Format Change

Examples:

```text
Native Project Format Change
Project Metadata Change
Project Versioning Change
Project Persistence Change
WYPROJ Structure Change
```

Mandatory Review:

```text
PROJECT_SPEC.md
DATA_SCHEMA.md
API_SPEC.md
IMPORT_EXPORT_SPEC.md
TECHNICAL_OVERVIEW.md
DECISIONS.md
ARCHITECTURE_DECISION_MATRIX.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Conditional Updates:

```text
ARCHITECTURE_DECISION_MATRIX.md
```

---

# Internationalization Change

Examples:

```text
New Language
Translation Structure Change
Localization Logic Change
Language Manager Change
Localization Service Change
Translation Loader Change
```

Mandatory Review:

```text
PROJECT_SPEC.md
TECHNICAL_OVERVIEW.md
DOMAIN_BOUNDARIES.md
USER_SETTINGS_SPEC.md
```

Conditional Updates:

```text
GUI_SPEC.md
DATA_SCHEMA.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# API Change

Examples:

```text
New Endpoint

Modified Endpoint

Payload Change

Response Change

IPC Change
```

Mandatory Updates:

```text
API_SPEC.md
```

Mandatory Review:

```text
ARCHITECTURE.md

DATA_SCHEMA.md
```

Conditional Updates:

```text
AI_ENGINE_SPEC.md

SECURITY_SPEC.md

IMPORT_EXPORT_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# IPC Change

Examples:

```text
New IPC Channel

Modified IPC Payload

IPC Flow Changes
```

Mandatory Review:

```text
API_SPEC.md

ARCHITECTURE.md
```

Conditional Updates:

```text
AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# File Structure Change

Examples:

```text
New Directory

Directory Removal

File Relocation

Project Reorganization
```

Mandatory Updates:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md

PROJECT_DOCUMENTATION_INDEX.md
```

Mandatory Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Conditional Updates:

```text
README.md
```

---

# AI Engine Change

Examples:

```text
Decision Logic

Validation Logic

Recommendation Logic

Notification Logic

Optimization Logic
```

Mandatory Review:

```text
AI_ENGINE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Conditional Updates:

```text
RECOMMENDATION_RULES.md

OBJECT_CLASSIFICATION_SPEC.md

PRINT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md

SUPPORT_GENERATION_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Recommendation Logic Change

Mandatory Review:

```text
AI_ENGINE_SPEC.md

RECOMMENDATION_RULES.md
```

Conditional Updates:

```text
PRINT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Classification Logic Change

Mandatory Review:

```text
OBJECT_CLASSIFICATION_SPEC.md

AI_ENGINE_SPEC.md
```

Conditional Updates:

```text
DATA_SCHEMA.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Optimization Logic Change

Mandatory Review:

```text
AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Printer Profile Change

Mandatory Review:

```text
PRINTER_PROFILE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Conditional Updates:

```text
AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Material Profile Change

Mandatory Review:

```text
MATERIAL_PROFILE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Conditional Updates:

```text
AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Filament Profile Change

Mandatory Review:

```text
FILAMENT_SETTINGS_SPEC.md

DATA_SCHEMA.md

API_SPEC.md

AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Print Preset Change

Mandatory Review:

```text
PRINT_PRESETS_SPEC.md

PRINT_SETTINGS_SPEC.md

AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# GUI Change

Examples:

```text
Layout

Menu

Toolbar

Dialog

Navigation

Panels
```

Mandatory Review:

```text
GUI_SPEC.md
```

Conditional Updates:

```text
README.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Repository Change

Examples:

```text
Repository Workflow

Synchronization Logic

External Sources
```

Mandatory Review:

```text
API_SPEC.md

ARCHITECTURE.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Conditional Updates:

```text
SECURITY_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Security Change

Mandatory Review:

```text
SECURITY_SPEC.md

ARCHITECTURE.md

API_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Conditional Updates:

```text
README.md
```

---

# Performance Change

Mandatory Review:

```text
PERFORMANCE_SPEC.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Governance Change

Examples:

```text
New Rule

Removed Rule

Workflow Change

Validation Change
```

Mandatory Review:

```text
SYSTEM_RULES.md

DEVELOPMENT_RULES.md

AI_DEVELOPMENT_PROTOCOL.md

CLAUDE_GOVERNANCE_PROTOCOL.md

DOCUMENT_UPDATE_RULES.md

DOCUMENT_UPDATE_MATRIX.md
```

Conditional Updates:

```text
CONTRIBUTING.md

CLAUDE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

---

# Versioning Policy Change

Mandatory Updates:

```text
VERSIONING_POLICY.md
```

Mandatory Review:

```text
CHANGELOG.md

CONTRIBUTING.md
```

---

# User Visible Feature Change

Examples:

```text
New Functionality

Feature Removal

User Workflow Changes
```

Mandatory Review:

```text
CHANGELOG.md
```

Conditional Updates:

```text
README.md

PROJECT_DESCRIPTION.md
```

---

# External Update

Examples:

```text
New Printer

New Material

New Filament

New Preset

Repository Update
```

Mandatory Review:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md
```

Documentation Updates:

```text
Only If Impact Analysis Requires It
```

Automatic Updates:

```text
Forbidden
```

Human Approval:

```text
Required
```

---

# README.md Rules

Update When:

```text
Major Feature Added

User Workflow Changed

Installation Changed

Important Capability Added
```

Do Not Update For:

```text
Internal Refactoring

Minor Fixes

Schema Updates

Implementation Details
```

unless user-visible impact exists.

---

# CONTRIBUTING.md Rules

Update When:

```text
Contribution Workflow Changes

Governance Changes

Review Process Changes

Versioning Changes
```

---

# PROJECT_DOCUMENTATION_INDEX.md Rules

Update When:

```text
Document Added

Document Removed

Document Renamed

Document Moved
```

Always review during documentation structure changes.

---

# SlicyWeb files explication.txt Rules

Update When:

```text
Documentation Structure Changes

Document Added

Document Removed

Document Renamed

Document Moved

Documentation Category Added
```

---

# CHANGELOG.md Rules

Always evaluate.

Mandatory evaluation when:

```text
Architecture Changes

Schema Changes

API Changes

Feature Changes

Project Structure Changes

User Visible Changes

Domain Changes
```

Never ignore changelog impact.

---

# Final Verification Checklist

Before closing a task verify:

```text
Dependencies Reviewed

Impacts Reviewed

Required Documents Updated

Unnecessary Updates Avoided

Changelog Evaluated

Ownership Verified

Architecture Preserved
```

---

# Golden Rule

Review every related document.

Update only documents that truly require updating.

Missing updates create inconsistency.

Unnecessary updates create noise.

Avoid both.
