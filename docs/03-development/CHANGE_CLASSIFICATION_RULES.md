# SlicyWeb SMART SLICER

# CHANGE CLASSIFICATION RULES

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the official change classification system used throughout the project.

The objective is to:

- Standardize change evaluation
- Improve impact analysis
- Improve documentation consistency
- Improve testing decisions
- Improve release management
- Reduce regressions
- Improve maintainability

Every modification must be classified before implementation.

Classification determines:

- Required Reviews
- Required Documentation Updates
- Required Testing
- Required Validation
- Changelog Requirements
- Risk Level

---

# Classification Philosophy

Not all changes have the same impact.

A typo correction is not equivalent to:

```text
Schema Change
```

A schema change is not equivalent to:

```text
Architecture Change
```

Every modification must be classified before work begins.

---

# Classification Workflow

Before implementation determine:

```text
Change Request
↓
Change Classification
↓
Impact Analysis
↓
Dependency Analysis
↓
Validation Requirements
↓
Implementation
```

Classification must occur before modification.

---

# Change Categories

Official Categories:

```text
Documentation Change

Structure Change

Schema Change

API Change

IPC Change

Feature Change

Architecture Change

Domain Change

Profile Change

Repository Change

Security Change

Performance Change

Refactoring

Bug Fix

External Update

Governance Change

Versioning Change
```

---

# Documentation Change

Definition:

Changes that affect documentation only.

Examples:

```text
Typos

Formatting

Explanations

Examples

Clarifications
```

Typical Risk:

```text
Low
```

Required Review:

```text
Target Document
```

Testing:

```text
Not Required
```

Changelog:

```text
Usually Not Required
```

---

# Documentation Structure Change

Definition:

Changes affecting documentation organization.

Examples:

```text
New Document

Removed Document

Renamed Document

Moved Document
```

Typical Risk:

```text
Medium
```

Required Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt
```

Changelog Evaluation:

```text
Required
```

Testing:

```text
Documentation Validation
```

---

# Structure Change

Definition:

Changes affecting project organization.

Examples:

```text
New Directory

Directory Removal

Directory Rename

Module Relocation
```

Typical Risk:

```text
High
```

Required Review:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md
```

Required Validation:

```text
Path Validation

Import Validation

Build Validation
```

Changelog Evaluation:

```text
Required
```

---

# Schema Change

Definition:

Changes affecting data contracts.

Examples:

```text
New Schema

Removed Schema

Field Addition

Field Removal

Relationship Change

Validation Rule Change
```

Typical Risk:

```text
High
```

Required Review:

```text
DATA_SCHEMA.md

API_SPEC.md

ARCHITECTURE.md

AI_ENGINE_SPEC.md
```

Required Validation:

```text
Schema Validation

Integration Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# API Change

Definition:

Changes affecting API contracts.

Examples:

```text
New Endpoint

Endpoint Removal

Payload Changes

Response Changes

Contract Changes
```

Typical Risk:

```text
High
```

Required Review:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md
```

Required Validation:

```text
API Validation

Integration Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# IPC Change

Definition:

Changes affecting inter-process communication.

Examples:

```text
New IPC Channel

Channel Removal

Payload Modification

IPC Flow Changes
```

Typical Risk:

```text
High
```

Required Review:

```text
API_SPEC.md

ARCHITECTURE.md
```

Required Validation:

```text
IPC Validation

Integration Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# Feature Change

Definition:

Changes affecting user functionality.

Examples:

```text
New Feature

Feature Enhancement

Feature Removal

User Workflow Change
```

Typical Risk:

```text
Medium

to

High
```

Required Review:

```text
Affected Specifications

Affected Domains

Affected APIs
```

Required Validation:

```text
Feature Validation

Integration Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# Architecture Change

Definition:

Changes affecting system architecture.

Examples:

```text
New Layer

Removed Layer

Dependency Flow Change

Communication Change

Core System Introduction
```

Typical Risk:

```text
Critical
```

Required Review:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md
```

Required Validation:

```text
Architecture Review

Integration Validation

Regression Validation
```

Changelog Evaluation:

```text
Mandatory
```

---

# Domain Change

Definition:

Changes affecting domain ownership or responsibilities.

Examples:

```text
New Domain

Domain Expansion

Domain Split

Ownership Change

Boundary Change
```

Typical Risk:

```text
Critical
```

Required Review:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

ARCHITECTURE.md
```

Required Validation:

```text
Architecture Validation

Dependency Validation
```

Changelog Evaluation:

```text
Mandatory
```

---

# Profile Change

Definition:

Changes affecting profile systems.

Examples:

```text
Printer Changes

Material Changes

Filament Changes

Preset Changes
```

Typical Risk:

```text
Medium
```

Required Review:

```text
Relevant Profile Specifications

DATA_SCHEMA.md

API_SPEC.md
```

Required Validation:

```text
Profile Validation

Schema Validation
```

Changelog Evaluation:

```text
Required
```

---

# Repository Change

Definition:

Changes affecting repositories or synchronization.

Examples:

```text
Repository Sources

Synchronization Logic

Download Logic

Import Workflows
```

Typical Risk:

```text
High
```

Required Review:

```text
API_SPEC.md

ARCHITECTURE.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Required Validation:

```text
Repository Validation

Integration Validation
```

Changelog Evaluation:

```text
Required
```

---

# Security Change

Definition:

Changes affecting protection mechanisms.

Examples:

```text
Validation Policies

Access Policies

Import Security

Repository Security
```

Typical Risk:

```text
Critical
```

Required Review:

```text
SECURITY_SPEC.md

ARCHITECTURE.md

API_SPEC.md
```

Required Validation:

```text
Security Validation

Regression Validation
```

Changelog Evaluation:

```text
Mandatory
```

---

# Performance Change

Definition:

Changes focused on performance.

Examples:

```text
Optimization

Caching

Rendering Improvements

Memory Improvements
```

Typical Risk:

```text
Medium
```

Required Review:

```text
PERFORMANCE_SPEC.md

ARCHITECTURE.md
```

Required Validation:

```text
Performance Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# Refactoring

Definition:

Internal code improvements without behavioral changes.

Examples:

```text
Code Cleanup

Code Organization

Naming Improvements

Internal Simplification
```

Rules:

```text
Behavior Must Not Change
```

Typical Risk:

```text
Medium
```

Required Validation:

```text
Regression Validation
```

Changelog:

```text
Usually Not Required
```

---

# Bug Fix

Definition:

Corrections of unintended behavior.

Examples:

```text
Logic Fix

Calculation Fix

Validation Fix

Workflow Fix
```

Required Review:

```text
BUG_ANALYSIS_PROTOCOL.md
```

Required Analysis:

```text
Root Cause

Affected Files

Related Files

Regression Risk
```

Required Validation:

```text
Fix Validation

Regression Validation
```

Changelog Evaluation:

```text
Required
```

---

# External Update

Definition:

Changes originating from external sources.

Examples:

```text
New Printer

New Material

New Filament

New Preset

Repository Update
```

Required Review:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md
```

Required Output:

```text
Update Summary

Affected Domains

Affected Files

Risk Assessment

Recommended Action
```

Human Approval:

```text
Required
```

---

# Governance Change

Definition:

Changes affecting project rules.

Examples:

```text
New Rule

Removed Rule

Workflow Change

Governance Modification
```

Typical Risk:

```text
High
```

Required Review:

```text
SYSTEM_RULES.md

DEVELOPMENT_RULES.md

AI_DEVELOPMENT_PROTOCOL.md

CLAUDE_GOVERNANCE_PROTOCOL.md
```

Required Validation:

```text
Governance Consistency Review
```

Changelog Evaluation:

```text
Required
```

---

# Versioning Change

Definition:

Changes affecting version management.

Examples:

```text
Versioning Policy

Release Strategy

Version Rules
```

Required Review:

```text
VERSIONING_POLICY.md

CHANGELOG.md

CONTRIBUTING.md
```

Required Validation:

```text
Version Consistency Review
```

Changelog Evaluation:

```text
Required
```

---

# Multiple Classifications Rule

A change may belong to multiple categories.

Example:

```text
New Recommendation Endpoint

Classification:

API Change
+
Feature Change
+
Schema Change
```

Rule:

Apply requirements from all classifications.

Never select only the easiest classification.

---

# Classification Verification Rule

Before implementation verify:

```text
Classification Identified

Dependencies Reviewed

Impact Analyzed

Documentation Reviewed

Validation Identified

Changelog Evaluated
```

All items must be completed.

---

# Misclassification Rule

If classification is unclear:

```text
Stop

Continue Analysis

Determine Highest Impact Classification

Proceed
```

Always choose the safest classification.

---

# Priority Rule

When multiple classifications exist:

Follow the highest risk category.

Example:

```text
Documentation Change
+
Architecture Change
```

Applicable Classification:

```text
Architecture Change
```

---

# Golden Rule

Correct classification must happen before implementation.

Incorrect classification leads to incorrect impact analysis.

Incorrect impact analysis leads to regressions.
