# SLICYWEB SMART SLICER

# CLAUDE READING PRIORITY

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory reading priorities Claude must follow before performing any analysis, review, modification, implementation, bug investigation, update evaluation, documentation update, or architectural decision.

The objectives are:

- Ensure consistent understanding
- Prevent missing important documentation
- Prevent architecture violations
- Prevent dependency violations
- Reduce incorrect assumptions
- Improve change quality
- Improve project maintainability
- Improve project stability

This document complements:

```text
CLAUDE.md

CLAUDE_PROJECT_CONTEXT.md

CLAUDE_DOCUMENT_READING_ORDER.md
```

---

# Core Principle

Not all documents have the same authority.

Not all documents require the same priority.

Whenever a conflict exists:

```text
Higher Priority Documents
Override
Lower Priority Documents
```

Claude must always read and obey the highest authority documents first.

---

# Reading Priority Levels

The project uses the following priority hierarchy:

```text
Priority 0

Priority 1

Priority 2

Priority 3

Priority 4

Priority 5
```

Priority 0 is the highest authority.

---

# Priority 0

# Project Authority

These documents are the ultimate source of truth.

Nothing may override them.

Mandatory Reading:

```text

CLAUDE.md
CLAUDE_PROJECT_CONTEXT.md
docs/01-project/PROJECT_SPEC.md
docs/02-architecture/ARCHITECTURE.md
docs/02-architecture/TECHNICAL_OVERVIEW.md
docs/02-architecture/DATA_SCHEMA.md
docs/03-development/SYSTEM_RULES.md
docs/03-development/DEVELOPMENT_RULES.md
docs/01-project/DECISIONS.md
```

Purpose:

```text
Project Vision

Project Requirements

Architecture

Data Contracts

System Rules

Development Rules

Architectural Decisions
```

If conflicts exist:

```text
Priority 0 Wins
```

Always.

---

# Priority 1

# Architecture Governance

These documents govern how the architecture must behave.

Mandatory Reading When Relevant:

```text
docs/03-development/DOMAINS_DEPENDENCY_MATRIX.md

docs/03-development/DOMAIN_BOUNDARIES.md

docs/03-development/FILE_OWNERSHIP_MATRIX.md

docs/03-development/PROJECT_IMPACT_MATRIX.md

docs/03-development/CROSS_DOCUMENT_DEPENDENCIES.md

docs/03-development/CHANGE_IMPACT_RULES.md
```

Purpose:

```text
Ownership

Dependencies

Architecture Enforcement

Impact Analysis

Boundaries
```

If conflicts exist:

```text
Priority 0 Wins

Priority 1 Overrides Lower Priorities
```

---

# Priority 2

# Contracts And Specifications

These documents define implementation details.

Mandatory Reading When Relevant:

```text
docs/02-architecture/API_SPEC.md

docs/04-ai/AI_ENGINE_SPEC.md

docs/04-ai/RECOMMENDATION_RULES.md

docs/04-ai/OBJECT_CLASSIFICATION_SPEC.md

docs/04-ai/PRINT_SETTINGS_SPEC.md

docs/04-ai/PRINT_PRESETS_SPEC.md

docs/05-profiles/PRINTER_PROFILE_SPEC.md

docs/05-profiles/MATERIAL_PROFILE_SPEC.md

docs/05-profiles/FILAMENT_SETTINGS_SPEC.md

docs/08-user-interface/GUI_SPEC.md
```

Purpose:

```text
System Behavior

AI Behavior

Profiles

Contracts

User Interface Behavior
```

If conflicts exist:

```text
Priority 0 Wins

Priority 1 Wins

Priority 2 Overrides Lower Priorities
```

---

# Priority 3

# Operational Governance

These documents define how modifications should be analyzed and validated.

Mandatory Reading When Relevant:

```text
CLAUDE_CHANGE_IMPACT_RULES.md

CLAUDE_FILE_UPDATE_RULES.md

docs/03-development/CHANGE_CLASSIFICATION_RULES.md

docs/03-development/CHANGE_VERIFICATION_CHECKLIST.md

docs/03-development/DOCUMENT_UPDATE_MATRIX.md

docs/03-development/BUG_ANALYSIS_PROTOCOL.md
```

Purpose:

```text
Change Analysis

Verification

Documentation Updates

Bug Investigation

Update Governance
```

These documents control process.

They do not override architecture.

---

# Priority 4

# Update Governance

These documents control external updates.

Mandatory Reading When Relevant:

```text
docs/03-development/UPDATE_GOVERNANCE_PROTOCOL.md

docs/03-development/UPDATE_IMPACT_RULES.md

docs/03-development/UPDATE_REPORT_TEMPLATE.md
```

Purpose:

```text
External Updates

Printers

Materials

Filaments

Presets

Repositories
```

Human approval remains mandatory.

---

# Priority 5

# Navigation And Reference

These documents provide guidance and navigation.

Mandatory Reading When Relevant:

```text
docs/00-index/AI_START_HERE.md

docs/00-index/AI_DEVELOPMENT_PROTOCOL.md

docs/00-index/PROJECT_DOCUMENTATION_INDEX.md

docs/02-architecture/FILE_STRUCTURE.md

docs/09-reference/DIRECTORY_PURPOSES.md

docs/09-reference/VERSIONING_POLICY.md

README.md

CONTRIBUTING.md

SlicyWeb files explication.txt
```

Purpose:

```text
Navigation

Project Structure

Reference Information

Project Organization
```

These documents do not override higher priority documents.

---

# Reading Rules

Before working on any task:

Determine:

```text
Task Type

Affected Domain

Affected Documents

Affected Modules
```

Then identify required reading.

Required reading depends on the task.

---

# Reading Rules For Bug Analysis

Mandatory Reading:

```text
BUG_ANALYSIS_PROTOCOL.md

PROJECT_IMPACT_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md
```

Additional Reading:

```text
Affected Specifications

Affected Domains
```

---

# Reading Rules For Architecture Changes

Mandatory Reading:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

PROJECT_IMPACT_MATRIX.md

FILE_OWNERSHIP_MATRIX.md
```

Architecture changes require the highest review level.

---

# Reading Rules For Schema Changes

Mandatory Reading:

```text
PROJECT_SPEC.md
DATA_SCHEMA.md
API_SPEC.md
AI_ENGINE_SPEC.md
PROJECT_IMPACT_MATRIX.md
DOCUMENT_UPDATE_MATRIX.md
```

Schema changes are high risk.

---

# Reading Rules For API Changes

Mandatory Reading:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md

PROJECT_IMPACT_MATRIX.md
```

---

# Reading Rules For Documentation Changes

Mandatory Reading:

```text
CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md
```

Additional Reading:

```text
Affected Documents
```

---

# Reading Rules For External Updates

Mandatory Reading:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md

PROJECT_IMPACT_MATRIX.md
```

Human approval is required before implementation.

---

# Reading Rules For New Features

Mandatory Reading:

```text
PROJECT_SPEC.md

ARCHITECTURE.md

DATA_SCHEMA.md

DOMAIN_BOUNDARIES.md

PROJECT_IMPACT_MATRIX.md
```

Additional Reading:

```text
All Impacted Specifications
```

---

# Reading Rules For File Creation

Before creating any file read:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md

FILE_OWNERSHIP_MATRIX.md

DOCUMENT_UPDATE_MATRIX.md
```

New files must not violate ownership rules.

---

# Reading Rules For File Removal

Before removing any file read:

```text
FILE_OWNERSHIP_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md
```

Never remove files without dependency analysis.

---

# Conflict Resolution Rule

When documentation conflicts occur:

Apply:

```text
Priority 0
↓
Priority 1
↓
Priority 2
↓
Priority 3
↓
Priority 4
↓
Priority 5
```

Highest priority always wins.

---

# Missing Documentation Rule

If documentation is missing:

```text
Do Not Invent

Do Not Assume

Continue Analysis

Identify Related Sources
```

Assumptions are not allowed.

---

# Reading Completion Rule

Before implementation verify:

```text
Required Documents Read

Ownership Verified

Dependencies Reviewed

Impact Analyzed

Documentation Reviewed

Update Requirements Determined
```

---

# Stop Rule

Stop implementation when:

```text
Required Documents Not Read

Ownership Unknown

Dependencies Unknown

Impact Unknown

Conflict Unresolved
```

Continue analysis first.

---

# Golden Rule

Read the highest authority documents first.

Understand before modifying.

When in doubt:

Read more,

assume less.
