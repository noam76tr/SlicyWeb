# CLAUDE DOCUMENT READING ORDER

Version: 2.0.0

Status: Approved

Priority: Highest

---

# Purpose

This document defines the mandatory document reading sequence that Claude must follow before performing any project analysis, modification, review, update, bug investigation, implementation, or architectural decision.

The goal is to:

- Ensure complete project understanding
- Reduce incorrect assumptions
- Prevent architectural violations
- Prevent documentation inconsistencies
- Prevent dependency violations
- Reduce regressions
- Improve update quality
- Improve impact analysis accuracy

No modification should occur before the appropriate reading sequence has been completed.

---

# Reading Principles

Claude must not read documents randomly.

Claude must read documentation in layers.

The reading process follows:

Project Understanding
↓
Architecture Understanding
↓
Dependency Understanding
↓
Impact Understanding
↓
Task Specific Reading
↓
Modification

---

# Mandatory Foundation Reading

These documents must always be read first.

## Step 1

Read:

```text
CLAUDE.md
```

Purpose:

Understand global Claude responsibilities.

---

## Step 2

Read:

```text
CLAUDE_PROJECT_CONTEXT.md
```

Purpose:

Understand project vision, goals, architecture and constraints.

---

## Step 3

Read:

```text
CLAUDE_DOCUMENT_READING_ORDER.md
```

Purpose:

Determine the required reading workflow.

---

# Core Documentation Reading

These documents define the project.

They must be read before any work.

## Step 4

Read:

```text
docs/00-index/AI_START_HERE.md
```

Purpose:

Project onboarding.

---

## Step 5

Read:

```text
docs/00-index/AI_DEVELOPMENT_PROTOCOL.md
```

Purpose:

Development workflow.

---

## Step 6

Read:

```text
docs/01-project/PROJECT_SPEC.md
```

Purpose:

Project requirements and objectives.

---

## Step 7

Read:

```text
docs/03-development/SYSTEM_RULES.md
```

Purpose:

Mandatory project rules.

---

## Step 8

Read:

```text
docs/03-development/DEVELOPMENT_RULES.md
```

Purpose:

Development methodology.

---

# Architecture Reading

## Step 9

Read:

docs/02-architecture/ARCHITECTURE.md

Purpose:

System architecture.

---

## Step 10

Read:

docs/02-architecture/TECHNICAL_OVERVIEW.md

Purpose:

Architecture overview
Project Management overview
Internationalization overview
System organization
Module boundaries

---

## Step 11

Read:

docs/02-architecture/DATA_SCHEMA.md

Purpose:

Data contracts.

---

## Step 12

Read:

docs/02-architecture/API_SPEC.md

Purpose:

All API definitions.

---

## Step 13

Read:

docs/02-architecture/FILE_STRUCTURE.md

Purpose:

Project structure.

---

## Step 14

Read:

docs/02-architecture/IMPORT_EXPORT_SPEC.md

Purpose:

Import systems
Export systems
WYPROJ format
Serialization workflow

---

## Step 15

Read:

```text
docs/03-development/DOMAIN_BOUNDARIES.md
```

Purpose:

Understand domain ownership and boundaries.

---

## Step 16

Read:

```text
docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md
```

Purpose:

Understand domain dependency rules.

---

## Step 17

Read:

```text
docs/03-development/CROSS_DOCUMENT_DEPENDENCIES.md
```

Purpose:

Understand document relationships.

---

## Step 18

Read:

```text
docs/03-development/FILE_OWNERSHIP_MATRIX.md
```

Purpose:

Understand file ownership.

---

## Step 19

Read:

```text
docs/03-development/PROJECT_IMPACT_MATRIX.md
```

Purpose:

Determine modification impact.

---

## Step 20

Read:

```text
docs/03-development/DOCUMENT_UPDATE_MATRIX.md
```

Purpose:

Determine documentation update requirements.

---

## Step 21

Read:

```text
docs/03-development/CHANGE_CLASSIFICATION_RULES.md
```

Purpose:

Classify the modification.

---

## Step 22

Read:

```text
docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md
```

Purpose:

Validate change readiness.

---

# Project History Reading

Read when modifications are expected.

## Step 23

Read:

```text
docs/01-project/CHANGELOG.md
```

Purpose:

Understand project evolution.

---

## Step 24

Read:

```text
docs/01-project/DECISIONS.md
```

Purpose:

Understand architectural decisions.

---

# Documentation Navigation Reading

Read when documentation is involved.

## Step 25

Read:

```text
docs/00-index/PROJECT_DOCUMENTATION_INDEX.md
```

Purpose:

Documentation inventory.

---

## Step 26

Read:

```text
SlicyWeb files explication.txt
```

Purpose:

Documentation organization overview.

---

# Bug Investigation Reading

Required when the task involves a bug.

Read:

```text
docs/03-development/BUG_ANALYSIS_PROTOCOL.md
```

Purpose:

Root cause investigation.

Additional Documents:

- ARCHITECTURE.md
- DATA_SCHEMA.md
- API_SPEC.md
- PROJECT_IMPACT_MATRIX.md

---

# Update Review Reading

Required when external updates are involved.

Examples:

- New Printer
- New Material
- New Filament
- New Preset
- New Repository Data
- New External Source

Read:

```text
docs/03-development/UPDATE_GOVERNANCE_PROTOCOL.md
```

```text
docs/03-development/UPDATE_IMPACT_RULES.md
```

```text
docs/03-development/UPDATE_REPORT_TEMPLATE.md
```

Purpose:

Safe update management.

---

# GUI Tasks

Read:

```text
docs/08-user-interface/GUI_SPEC.md
```

Purpose:

GUI implementation.

Additional Reading:

```text
docs/03-development/DOMAIN_BOUNDARIES.md
```

```text
docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md
```

---

# AI Tasks

Read:

```text
docs/04-ai/AI_ENGINE_SPEC.md
```

```text
docs/04-ai/RECOMMENDATION_RULES.md
```

```text
docs/04-ai/OBJECT_CLASSIFICATION_SPEC.md
```

```text
docs/04-ai/SUPPORT_GENERATION_SPEC.md
```

```text
docs/04-ai/PRINT_SETTINGS_SPEC.md
```

```text
docs/04-ai/PRINT_PRESETS_SPEC.md
```

Purpose:

AI systems.

---

# Printer Tasks

Read:

```text
docs/05-profiles/PRINTER_PROFILE_SPEC.md
```

Purpose:

Printer management.

---

# Material Tasks

Read:

```text
docs/05-profiles/MATERIAL_PROFILE_SPEC.md
```

```text
docs/05-profiles/FILAMENT_SETTINGS_SPEC.md
```

Purpose:

Material and filament management.

---

# Project Management Tasks

Read:

```text
docs/01-project/PROJECT_SPEC.md
```

```text
docs/02-architecture/IMPORT_EXPORT_SPEC.md
```

```text
docs/02-architecture/DATA_SCHEMA.md
```

```text
docs/03-development/DOMAIN_BOUNDARIES.md
```

Purpose:

```text
WYPROJ management
Project persistence
Project serialization
Project validation
Recovery systems
```

---

# Internationalization Tasks

Read:

```text
docs/01-project/PROJECT_SPEC.md
```

```text
docs/02-architecture/TECHNICAL_OVERVIEW.md
```

```text
docs/03-development/DOMAIN_BOUNDARIES.md
```

Purpose:

```text
Localization architecture
Language management
Translation management
Supported languages
```

---

# Repository Tasks

Read:

```text
docs/02-architecture/API_SPEC.md
```

```text
docs/03-development/UPDATE_GOVERNANCE_PROTOCOL.md
```

```text
docs/03-development/DOMAIN_BOUNDARIES.md
```

Purpose:

Repository and synchronization systems.

---

# Security Tasks

Read:

```text
docs/06-quality/SECURITY_SPEC.md
```

Purpose:

Security requirements.

---

# Performance Tasks

Read:

```text
docs/06-quality/PERFORMANCE_SPEC.md
```

Purpose:

Performance requirements.

---

# Testing Tasks

Read:

```text
docs/06-quality/TEST_PLAN.md
```

Purpose:

Testing requirements.

---

# Future Systems

Read only when future implementations are involved.

```text
docs/07-future/GCODE_ENGINE_SPEC.md
```

```text
docs/07-future/PLUGIN_SYSTEM_SPEC.md
```

---

# Reference Reading

Read when terminology, naming, versions, structure or documentation is involved.

```text
docs/03-development/DOCUMENT_UPDATE_MATRIX.md
```

```text
docs/09-reference/GLOSSARY.md
```

```text
docs/09-reference/TERMINOLOGY.md
```

```text
docs/09-reference/NAMING_CONVENTIONS.md
```

```text
docs/09-reference/ARCHITECTURE_DECISION_MATRIX.md
```

```text
docs/09-reference/PROJECT_ACRONYMS.md
```

```text
docs/09-reference/DIRECTORY_PURPOSES.md
```

```text
docs/09-reference/VERSIONING_POLICY.md
```

---

# Reading Completion Rule

Claude must not start implementation until:

- Required documents have been read
- Dependencies have been identified
- Impact analysis has been completed
- Ownership has been verified
- Update requirements have been identified

---

# Reading Failure Rule

If required documentation has not been read:

Do not modify.

Continue analysis.

Complete missing reading first.

---

# Golden Rule

Read first.

Understand second.

Analyze third.

Modify fourth.

Validate fifth.

Document sixth.
