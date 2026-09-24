# SlicyWeb SMART SLICER

# DEVELOPMENT WORKFLOW

Version: 2.0.0

Status: Approved

Priority: High


---

# Purpose

This document defines the complete development workflow for SlicyWeb.

The objectives are:

- Reduce bugs
- Reduce regressions
- Maintain consistency
- Improve traceability
- Standardize development
- Preserve architecture
- Reduce unnecessary rewrites

Every contributor should follow this workflow.

---

# Governance References

This workflow must be used together with:

```text
CLAUDE_CHANGE_IMPACT_RULES.md
CLAUDE_FILE_UPDATE_RULES.md
DOCUMENT_UPDATE_RULES.md
DOCUMENT_UPDATE_MATRIX.md
CROSS_DOCUMENT_DEPENDENCIES.md
FILE_OWNERSHIP_MATRIX.md
PROJECT_IMPACT_MATRIX.md
DOMAIN_BOUNDARIES.md
DOMAINS_DEPENDENCY_MATRIX.md
CHANGE_CLASSIFICATION_RULES.md
CHANGE_VERIFICATION_CHECKLIST.md
```

Before implementation, the contributor must verify:

```text
File ownership
Domain ownership
Direct dependencies
Indirect dependencies
Documentation dependencies
Architecture impact
API impact
Schema impact
Testing requirements
Compatibility requirements
```

No implementation may begin until the required reviews have been completed.

---

# Development Lifecycle

```text
Documentation

↓

Planning

↓

Implementation

↓

Testing

↓

Validation

↓

Documentation Update

↓

Commit

↓

Release
```

---

# Step 1

# Understand Requirement

---

# Documentation Verification

Before starting any implementation:

Read:

```text
AI_START_HERE.md

PROJECT_DOCUMENTATION_INDEX.md

DECISIONS.md
```

Verify:

```text
Relevant Documentation Exists

Feature Already Specified

Architecture Already Defined
```

If documentation exists:

```text
Follow Documentation

Do Not Invent New Implementations
```

---

# Specification First Rule

Before implementing a feature:

Verify whether a specification already exists.

Examples:

```text
GUI Feature

↓

Read GUI_SPEC.md
```

```text
AI Feature

↓

Read AI_ENGINE_SPEC.md
```

```text
Printer Feature

↓

Read PRINTER_PROFILE_SPEC.md
```

```text
Material Feature

↓

Read MATERIAL_PROFILE_SPEC.md
```

```text
Support Feature

↓

Read SUPPORT_GENERATION_SPEC.md
```

```text
Object Classification Feature

↓

Read OBJECT_CLASSIFICATION_SPEC.md
```

Implementation must follow specifications.

Specifications are the source of truth.

---

# Read

```text
PROJECT_SPEC.md

ROADMAP.md

PHASES_IMPLEMENTATION_PLAN.md

ARCHITECTURE.md
```

---

# Determine

```text
Affected Module

Current Phase

Dependencies
```

---

# Step 2

# Review Existing Code

---

Read:

```text
Existing File

Related Services

Related Schemas
```

---

Never modify code blindly.

Understand existing behavior before making changes.

---

# Step 3

# Impact Analysis

---

# Repository and Remote Source Impact

When a change affects repositories, profiles, synchronization, cache, or external sources, verify the complete flow:

```text
GUI
↓
Application / IPC
↓
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Verify:

GUI does not access Repositories directly.

GUI does not access Storage directly.

GUI does not access Remote Sources directly.

Services do not bypass the Repository layer.

Repositories do not bypass RepositorySync when accessing Remote Sources.

Remote data is validated before being consumed.

Local data and Cache are preferred before Remote Sources.

Synchronization failures are handled correctly.

Review when applicable:

```text
API_SPEC.md
ARCHITECTURE.md
TECHNICAL_OVERVIEW.md
DATA_SCHEMA.md
DOMAIN_BOUNDARIES.md
DOMAINS_DEPENDENCY_MATRIX.md
UPDATE_GOVERNANCE_PROTOCOL.md
UPDATE_IMPACT_RULES.md
```

---

# Phase Validation

Verify current project phase.

Reference:

```text
ROADMAP.md

PHASES_IMPLEMENTATION_PLAN.md
```

Do not implement functionality from future phases unless explicitly requested.

Example:

```text
Current Phase

↓

GUI Foundation

Allowed:

Menus
Panels
Layout

Not Allowed:

AI Engine
G-Code Engine
Machine Learning
```

---

Determine:

```text
Files To Modify

Services Affected

Tests Affected

Documentation Affected
```

---

# Step 4

# Apply Patch

---

# Documentation Impact Check

Before applying modifications

Review the documentation impact of the change.

Determine whether each affected document requires:

```text
Mandatory Update
Conditional Update
Review Only
No Action Required
```

Review the following documents when applicable:

```text
ARCHITECTURE.md
DATA_SCHEMA.md
API_SPEC.md
TECH_STACK.md
CHANGELOG.md
DECISIONS.md
FILE_STRUCTURE.md
PROJECT_DOCUMENTATION_INDEX.md
DOCUMENT_UPDATE_MATRIX.md
```

Update documentation when the affected content is no longer consistent with the implementation, architecture, API, schema, workflow, or project structure.

Do not update unrelated documentation.

Documentation updates must be targeted.

Do not regenerate complete documentation files for a small change.

---

Preferred:

```text
Modify Existing Code
```

Avoid:

```text
Rewrite Entire File
```

---

Preferred Order:

```text
Configuration

↓

Data

↓

Method

↓

Class

↓

Module
```

---

# Step 5

# Validation

---

Verify:

```text
TypeScript

Build

Lint

Unit Tests
```

---

# Step 6

# Regression Check

---

Verify:

```text
Existing Functionality

Previous Workflows

Interfaces
```

still operate correctly.

---

Run regression tests whenever possible.

---

# Step 7

# Documentation Update

---

Update documentation only if needed.

Examples:

```text
Architecture Change

Schema Change

API Change

Feature Change

Behavior Change
```

---

Documentation updates should be targeted.

Avoid regenerating entire documentation files.

---

# Step 8

# Changelog Update

---

Update CHANGELOG.md when:

```text
Feature Added

Bug Fixed

Breaking Change

Public Behavior Changed
```

---

# Step 9

# Commit

---

Commit Format

```text
feat:

fix:

docs:

refactor:

test:

perf:

build:

ci:
```

---

Examples

```text
feat: add STL importer

fix: correct volume calculation

docs: update AI engine specification

refactor: simplify scene manager

perf: improve viewport rendering
```

---

# Step 10

# Release Validation

---

Verify:

```text
No Critical Errors
No Build Errors
Documentation Impact Reviewed
Required Documentation Updated
No Unnecessary Documentation Updated
Tests Passed
Compatibility Preserved
Architecture Preserved
Domain Boundaries Preserved
RepositorySync Rules Preserved
Remote Source Access Rules Preserved
```

---

# Feature Workflow

For every new feature:

```text
Specification

↓

Design

↓

Implementation

↓

Testing

↓

Documentation

↓

Release
```

---

# Bug Fix Workflow

```text
Identify

↓

Reproduce

↓

Fix

↓

Test

↓

Regression Check

↓

Release
```

---

# Refactoring Workflow

```text
Analyze

↓

Measure Benefit

↓

Implement

↓

Validate

↓

Regression Tests
```

---

# Emergency Fix Workflow

```text
Issue Report

↓

Critical Validation

↓

Minimal Fix

↓

Validation

↓

Hotfix Release
```

---

# Forbidden Workflow

Never:

```text
Code First

↓

Think Later
```

---

Never:

```text
Implement

↓

Document Never
```

---

Never:

```text
Rewrite

↓

Hope It Works
```

---

# SlicyWeb Development Principle

```text
Documentation

↓

Architecture

↓

Implementation

↓

Optimization
```

Never reverse this order.

---

# Large Project Rule

SlicyWeb is a large modular project.

Before modifying any code:

```text
Read

↓

Analyze

↓

Patch

↓

Validate
```

Never:

```text
Rewrite Entire Module

Rewrite Entire Folder

Regenerate Full Project
```

---

Preferred Modification Order:

```text
Configuration

↓

Data

↓

Method

↓

Class

↓

Module
```

Always choose the smallest safe modification.

---

# Architectural Decision Check

Before introducing:

```text
New Dependency

New Framework

New Database

New Architecture Pattern
```

Verify:

```text
DECISIONS.md
```

If no decision exists:

```text
Create New ADR

Review Impact

Document Decision

Then Implement
```

---

# Documentation Authority

When conflicts occur, follow this priority:

```text
PROJECT_SPEC.md

↓

ARCHITECTURE.md

↓

DATA_SCHEMA.md

↓

SYSTEM_RULES.md

↓

DEVELOPMENT_RULES.md

↓

Other Documents
```

---

# Golden Rule

The smallest safe change is always preferred over the largest possible change.

Preserve existing work whenever possible.

---

# End Of Document
