# SlicyWeb SMART SLICER

# DEVELOPMENT WORKFLOW

Version: 1.1.0

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

Before applying modifications:

Verify whether these documents require updates:

```text
ARCHITECTURE.md

DATA_SCHEMA.md

API_SPEC.md

TECH_STACK.md

CHANGELOG.md

DECISIONS.md
```

Only update documentation if project behavior changes.

Avoid unnecessary documentation updates.

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

Documentation Updated

Tests Passed

Compatibility Preserved
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
