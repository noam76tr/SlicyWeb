# SlicyWeb SMART SLICER

# PROJECT IMPACT MATRIX

Version: 2.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory impact analysis process for every modification made to the project.

The objective is to:

- Prevent regressions
- Prevent incomplete updates
- Prevent forgotten documentation updates
- Prevent dependency violations
- Improve traceability
- Improve consistency
- Improve maintainability
- Improve project stability

All modifications must be evaluated using this matrix before implementation.

---

# Impact Analysis Philosophy

Every change impacts something.

Before modifying any file determine:

```text
What Is Changing

Why It Is Changing

What Depends On It

What Will Be Impacted

What Must Be Reviewed

What Must Be Updated

What Must Be Tested
```

No modification should occur before impact analysis.

---

# Impact Severity Levels

## Low Impact

Examples:

```text
Text Corrections

Documentation Improvements

Non Functional Comments

Minor UI Styling
```

Typical Requirements:

```text
Related Document Review
```

---

## Medium Impact

Examples:

```text
Profile Changes

Preset Changes

UI Behavior Changes

Validation Improvements

Repository Changes
```

Typical Requirements:

```text
Documentation Review

Targeted Testing

Dependency Verification
```

---

## High Impact

Examples:

```text
Schema Changes

API Changes

Recommendation Logic Changes

Classification Changes

Storage Changes
```

Typical Requirements:

```text
Dependency Review

Documentation Review

Integration Tests

Regression Tests

Changelog Evaluation
```

---

## Critical Impact

Examples:

```text
Architecture Changes

New Domains

Domain Ownership Changes

Core System Changes

Communication Flow Changes
```

Typical Requirements:

```text
Full Impact Review

Architecture Review

Documentation Review

Testing Review

Changelog Update Evaluation

Governance Validation
```

---

# Documentation Change

Examples:

```text
Documentation Clarification

Formatting Changes

Text Improvements
```

Review:

```text
Target Document
```

Potential Updates:

```text
Related Documents
```

Testing:

```text
Not Required
```

Changelog:

```text
Usually Not Required
```

Impact:

```text
Low
```

---

# New Documentation File

Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md
```

Possible Updates:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt
```

Testing:

```text
Documentation Validation
```

Changelog:

```text
Required
```

Impact:

```text
Medium
```

---

# Document Removal

Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

SlicyWeb files explication.txt

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md
```

Updates:

```text
All References
```

Changelog:

```text
Required
```

Impact:

```text
High
```

---

# Architecture Change

Examples:

```text
New Layer

Removed Layer

Dependency Changes

New System

Communication Changes
```

Mandatory Review:

```text
ARCHITECTURE.md

DATA_SCHEMA.md

API_SPEC.md

FILE_STRUCTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

TECHNICAL_OVERVIEW.md

FILE_OWNERSHIP_MATRIX.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md

PROJECT_DOCUMENTATION_INDEX.md

TECHNICAL_OVERVIEW.md

DIRECTORY_PURPOSES.md
```

Testing:

```text
Architecture Validation

Integration Tests

Regression Tests
```

Impact:

```text
Critical
```

---

# Domain Creation

Examples:

```text
New Functional Area

New Architectural Responsibility
```

Mandatory Review:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

FILE_STRUCTURE.md
```

Mandatory Update Evaluation:

```text
DIRECTORY_PURPOSES.md

PROJECT_DOCUMENTATION_INDEX.md

DOMAIN_BOUNDARIES.md

SlicyWeb files explication.txt

CHANGELOG.md
```

Testing:

```text
Architecture Validation

Integration Tests
```

Impact:

```text
Critical
```

---

# Domain Ownership Change

Review:

```text
DOMAIN_BOUNDARIES.md

FILE_OWNERSHIP_MATRIX.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Architecture Review

Integration Tests
```

Impact:

```text
Critical
```

---

# Schema Change

Examples:

```text
New Field

Removed Field

Contract Change

Validation Change
```

Mandatory Review:

```text
DATA_SCHEMA.md

API_SPEC.md

ARCHITECTURE.md

AI_ENGINE_SPEC.md
```

Review If Relevant:

```text
PRINTER_PROFILE_SPEC.md

MATERIAL_PROFILE_SPEC.md

FILAMENT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md

PRINT_SETTINGS_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Schema Validation

Integration Tests

Regression Tests
```

Impact:

```text
High
```

---

# API Change

Examples:

```text
New Endpoint

Payload Change

Response Change

IPC Contract Change
```

Mandatory Review:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md
```

Review If Relevant:

```text
AI_ENGINE_SPEC.md

SECURITY_SPEC.md

IMPORT_EXPORT_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
API Validation

Integration Tests

Regression Tests
```

Impact:

```text
High
```

---

# IPC Change

Review:

```text
API_SPEC.md

ARCHITECTURE.md

AI_START_HERE.md

DOMAINS_DEPENDENCY_MATRIX.md
```

Testing:

```text
IPC Validation

Integration Tests

Regression Tests
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Impact:

```text
High
```

---

# File Structure Change

Examples:

```text
New Directory

Directory Removal

Module Relocation

Folder Reorganization
```

Mandatory Review:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md

PROJECT_DOCUMENTATION_INDEX.md

DOMAIN_BOUNDARIES.md
```

Mandatory Update Evaluation:

```text
SlicyWeb files explication.txt

CHANGELOG.md
```

Testing:

```text
Build Validation

Import Validation
```

Impact:

```text
High
```

---

# Project Format Change

Examples:

```text
WYPROJ Schema Change
Project Serialization Change
Project Save Logic
Project Load Logic
Project Version Change
```

Mandatory Review:

```text
IMPORT_EXPORT_SPEC.md
DATA_SCHEMA.md
ARCHITECTURE.md
PROJECT_SPEC.md
```

Review If Relevant:

```text
GUI_SPEC.md
TECHNICAL_OVERVIEW.md
```
Testing:

```text
Save Validation
Load Validation
Backward Compatibility Tests
```

Impact:

High

---

# Internationalization Change

Examples:

```text
New Language
Translation Structure Change
Localization Logic Change
Language Manager Change
```

Mandatory Review:

GUI_SPEC.md
ARCHITECTURE.md
DATA_SCHEMA.md
DOMAIN_BOUNDARIES.md

Review If Relevant:

FILE_STRUCTURE.md
TECHNICAL_OVERVIEW.md

Testing:

Localization Validation
RTL Validation
UI Validation

Impact:

Medium

---

# Recommendation Engine Change

Examples:

```text
Decision Logic

Recommendation Logic

Confidence Logic

Warning Logic
```

Mandatory Review:

```text
AI_ENGINE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md

RECOMMENDATION_RULES.md
```

Review If Relevant:

```text
PRINT_SETTINGS_SPEC.md

PRINT_PRESETS_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Unit Tests

Integration Tests

Regression Tests
```

Impact:

```text
High
```

---

# Classification Change

Examples:

```text
Categories

Detection Rules

Classification Logic

Confidence Rules
```

Mandatory Review:

```text
OBJECT_CLASSIFICATION_SPEC.md

AI_ENGINE_SPEC.md

DATA_SCHEMA.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Classification Tests

Regression Tests
```

Impact:

```text
High
```

---

# Optimization Change

Examples:

```text
Support Optimization

Orientation Optimization

Material Optimization

Speed Optimization
```

Mandatory Review:

```text
AI_ENGINE_SPEC.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Optimization Validation

Regression Tests
```

Impact:

```text
High
```

---

# GUI Change

Examples:

```text
Layout

Panel

Toolbar

Dialog

Menu

Navigation
```

Mandatory Review:

```text
GUI_SPEC.md

DOMAIN_BOUNDARIES.md
```

Review If Relevant:

```text
ARCHITECTURE.md
```

Testing:

```text
UI Validation

Manual Validation
```

Impact:

```text
Medium
```

---

# Printer Profile Change

Examples:

```text
Printer Properties

Hardware Properties

Validation Rules
```

Mandatory Review:

```text
PRINTER_PROFILE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Review If Relevant:

```text
AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Profile Validation

Schema Validation
```

Impact:

```text
Medium
```

---

# Material Profile Change

Mandatory Review:

```text
MATERIAL_PROFILE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Review If Relevant:

```text
AI_ENGINE_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Profile Validation

Schema Validation
```

Impact:

```text
Medium
```

---

# Filament Profile Change

Mandatory Review:

```text
FILAMENT_SETTINGS_SPEC.md

DATA_SCHEMA.md

AI_ENGINE_SPEC.md

API_SPEC.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Profile Validation

Regression Tests
```

Impact:

```text
Medium
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

Testing:

```text
Recommendation Validation

Preset Validation
```

Impact:

```text
Medium
```

---

# Repository Change

Examples:

```text
Repository Logic

Synchronization Logic

Repository Sources
```

Mandatory Review:

```text
API_SPEC.md

ARCHITECTURE.md

UPDATE_GOVERNANCE_PROTOCOL.md

DOMAINS_DEPENDENCY_MATRIX.md
```

Review If Relevant:

```text
SECURITY_SPEC.md
```

Testing:

```text
Integration Tests

Repository Validation
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Impact:

```text
High
```

---

# Storage Change

Examples:

```text
Save Logic

Load Logic

Cache Logic

Recovery Logic
```

Mandatory Review:

```text
ARCHITECTURE.md

DATA_SCHEMA.md

API_SPEC.md
```

Testing:

```text
Persistence Validation

Recovery Validation

Regression Tests
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Impact:

```text
High
```

---

# Security Change

Examples:

```text
Validation Rules

Protection Rules

Import Protection

Repository Protection
```

Mandatory Review:

```text
SECURITY_SPEC.md

API_SPEC.md

ARCHITECTURE.md
```

Mandatory Update Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Security Validation

Regression Tests
```

Impact:

```text
Critical
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

Required Output:

```text
Update Summary

Affected Domains

Affected Files

Dependencies

Risk Level

Required Reviews

Recommended Action
```

Mandatory Rule:

```text
Human Approval Required
```

Impact:

```text
Medium

to

High
```

---

# Bug Fix

Examples:

```text
Logic Error

Validation Error

Calculation Error

Workflow Error
```

Mandatory Review:

```text
BUG_ANALYSIS_PROTOCOL.md
```

Required Analysis:

```text
Root Cause

Impacted Files

Related Files

Affected Domains

Regression Risk
```

Testing:

```text
Targeted Validation

Regression Tests
```

Impact:

```text
Variable
```

---

# Changelog Evaluation Rule

Always evaluate CHANGELOG updates for:

```text
Architecture Changes

Schema Changes

API Changes

Feature Changes

Domain Changes

Project Structure Changes

User Visible Changes
```

---

# Stop Rule

If impact cannot be determined:

```text
Stop

Continue Analysis

Identify Dependencies

Identify Ownership

Identify Documentation Impact

Resume Only After Verification
```

---

# Golden Rule

Never modify a system before understanding what depends on it.

Impact analysis is mandatory before implementation.
