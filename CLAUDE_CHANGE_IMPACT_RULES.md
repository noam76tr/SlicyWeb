# CLAUDE CHANGE IMPACT RULES

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory impact analysis rules Claude must apply before reviewing, approving, proposing, planning, or implementing any modification.

The objective is to:

- Prevent regressions
- Prevent incomplete updates
- Prevent architecture violations
- Prevent dependency violations
- Prevent documentation drift
- Improve traceability
- Improve maintainability
- Preserve project consistency
- Preserve project stability

Impact analysis is mandatory.

No modification should be considered safe until its impact has been fully analyzed.

---

# Core Principle

Every change creates impact.

Even the smallest modification may affect:

- Documentation
- Schemas
- APIs
- Domains
- Dependencies
- Validation
- Storage
- User Workflows
- Testing
- Future Features

Never assume a modification is isolated.

Always verify.

---

# Mandatory Impact Workflow

Before any modification:

```text
Understand Request
↓
Classify Change
↓
Identify Owner
↓
Identify Domain
↓
Identify Dependencies
↓
Identify Impact
↓
Identify Required Reviews
↓
Identify Required Updates
↓
Identify Required Tests
↓
Evaluate Compatibility
↓
Implement
```

No steps may be skipped.

---

# Mandatory Impact Questions

Before implementation Claude must answer:

```text
What Is Changing?

Why Is It Changing?

Who Owns It?

What Depends On It?

What Is Impacted?

What Must Be Reviewed?

What Must Be Updated?

What Must Be Tested?

What Risks Exist?

What Documentation Is Affected?
```

All questions must be answered.

---

# Impact Sources

A modification can create impact in:

```text
Files

Directories

Domains

Documentation

Schemas

APIs

Services

Repositories

Storage

Validation

Testing

Users

Future Features
```

All categories must be considered.

---

# Impact Severity Levels

## Low

Examples:

```text
Text Corrections

Formatting Improvements

Comments

Documentation Clarifications
```

Expected Actions:

```text
Review
```

---

## Medium

Examples:

```text
Profile Changes

UI Changes

Validation Changes

Preset Updates

Repository Configuration Changes
```

Expected Actions:

```text
Review

Impact Analysis

Testing Evaluation
```

---

## High

Examples:

```text
Schema Changes

API Changes

Storage Changes

Recommendation Changes

Classification Changes
```

Expected Actions:

```text
Dependency Analysis

Documentation Review

Testing Review

Compatibility Review
```

---

## Critical

Examples:

```text
Architecture Changes

Domain Changes

Ownership Changes

Core Communication Changes
```

Expected Actions:

```text
Full Impact Analysis

Architecture Review

Documentation Review

Testing Review

Governance Review
```

---

# Documentation Impact Rules

Documentation changes may affect:

```text
PROJECT_DOCUMENTATION_INDEX.md

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md

Wichy files explication.txt
```

Before modifying documentation verify:

```text
References

Dependencies

Reading Paths

Related Documents

Cross References
```

---

# Documentation Structure Impact Rules

Examples:

```text
New Document

Document Removed

Document Renamed

Document Moved
```

Must Review:

```text
PROJECT_DOCUMENTATION_INDEX.md

AI_START_HERE.md

CLAUDE_DOCUMENT_READING_ORDER.md

CLAUDE_READING_PRIORITY.md

Wichy files explication.txt
```

Must Determine:

```text
Reference Updates

Path Updates

Reading Order Updates
```

---

# Structure Impact Rules

Examples:

```text
Directory Added

Directory Removed

Directory Renamed

Module Relocated

Project Reorganization
```

May Affect:

```text
FILE_STRUCTURE.md

DIRECTORY_PURPOSES.md

PROJECT_DOCUMENTATION_INDEX.md

Wichy files explication.txt
```

Always verify references.

---

# Architecture Impact Rules

Examples:

```text
New Layer

Removed Layer

Dependency Changes

Communication Changes

Flow Changes

Architectural Responsibility Changes
```

Must Review:

```text
ARCHITECTURE.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md
```

Must Evaluate:

```text
Documentation Impact

Compatibility Impact

Testing Impact

Dependency Impact
```

Architecture modifications are considered high risk by default.

---

# Domain Impact Rules

Examples:

```text
New Domain

Domain Split

Domain Merge

Responsibility Changes

Ownership Changes

Boundary Changes
```

Must Review:

```text
DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

ARCHITECTURE.md
```

Must Determine:

```text
Ownership

Dependencies

Affected Domains

Affected Documentation
```

---

# Schema Impact Rules

Schema modifications require additional verification.

Examples:

```text
New Schema

Schema Removal

Field Addition

Field Removal

Field Rename

Relationship Changes

Validation Changes
```

Potentially Affected:

```text
API_SPEC.md

AI_ENGINE_SPEC.md

Profile Specifications

Validation Systems

Storage Systems

Repositories
```

Required Review:

```text
PROJECT_SPEC.md
DATA_SCHEMA.md
API_SPEC.md
ARCHITECTURE.md
AI_ENGINE_SPEC.md
```

Never modify schemas without dependency verification.

---

# API Impact Rules

Examples:

```text
New Endpoint

Removed Endpoint

Payload Changes

Response Changes

Contract Changes
```

Potentially Affected:

```text
IPC

Services

Repositories

Validation

Recommendations

Import Systems

Export Systems
```

Required Review:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md
```

Required Verification:

```text
Compatibility

Payload Consistency

Schema Consistency
```

---

# IPC Impact Rules

IPC changes affect communication behavior.

Examples:

```text
New Channel

Removed Channel

Payload Changes

Communication Flow Changes
```

Required Review:

```text
API_SPEC.md

ARCHITECTURE.md

AI_START_HERE.md
```

Required Validation:

```text
IPC Validation

Integration Validation
```

---

# Feature Impact Rules

Features may impact:

```text
GUI

Services

Schemas

APIs

Validation

Documentation

Tests
```

Must Determine:

```text
User Impact

Dependency Impact

Documentation Impact

Compatibility Impact
```

---

# GUI Impact Rules

Examples:

```text
Layout Changes

Panel Changes

Window Changes

Menu Changes

Navigation Changes
```

Must Review:

```text
GUI_SPEC.md

DOMAIN_BOUNDARIES.md
```

Must Verify:

```text
No Business Logic Was Added

No Repository Access Was Added

No Domain Boundaries Were Violated
```

---

# Profile Impact Rules

Examples:

```text
Printer Changes

Material Changes

Filament Changes

Preset Changes
```

Must Review:

```text
DATA_SCHEMA.md

API_SPEC.md

Relevant Profile Specifications
```

Must Determine:

```text
Validation Impact

Recommendation Impact

Storage Impact
```

---

# Recommendation Impact Rules

Examples:

```text
Recommendation Logic

Decision Rules

Confidence Rules

Warning Rules
```

Must Review:

```text
AI_ENGINE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md

RECOMMENDATION_RULES.md
```

Must Determine:

```text
Output Changes

Compatibility Impact

Validation Impact
```

---

# Classification Impact Rules

Examples:

```text
Classification Rules

Detection Rules

Confidence Rules

Category Rules
```

Must Review:

```text
AI_ENGINE_SPEC.md

OBJECT_CLASSIFICATION_SPEC.md

DATA_SCHEMA.md
```

Must Determine:

```text
Recommendation Impact

Validation Impact

Output Impact
```

---

# Repository Impact Rules

Examples:

```text
Repository Logic

Synchronization Logic

Repository Sources

Download Logic

Update Logic
```

Must Review:

```text
API_SPEC.md

ARCHITECTURE.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Must Determine:

```text
Security Impact

Validation Impact

Repository Impact
```

---

# Storage Impact Rules

Examples:

```text
Persistence Changes

Load Changes

Save Changes

Recovery Changes

Cache Changes
```

Must Review:

```text
PROJECT_SPEC.md
ARCHITECTURE.md
DATA_SCHEMA.md
API_SPEC.md
DECISIONS.md
```

Must Determine:

```text
Data Compatibility

Migration Needs

Recovery Impact
```

---

# Security Impact Rules

Examples:

```text
Security Policies

Validation Rules

Repository Protection

Import Protection
```

Must Review:

```text
SECURITY_SPEC.md

API_SPEC.md

ARCHITECTURE.md
```

Must Determine:

```text
Security Risk

Compatibility Risk

Validation Impact
```

---

# Performance Impact Rules

Examples:

```text
Caching

Optimization

Rendering Changes

Memory Improvements
```

Must Review:

```text
PERFORMANCE_SPEC.md

ARCHITECTURE.md
```

Must Verify:

```text
Behavior Preservation

Compatibility Preservation
```

Performance improvements must never introduce regressions.

---

# External Update Impact Rules

Examples:

```text
New Printer

New Material

New Filament

New Preset

Repository Updates

External Source Updates
```

Must Review:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md
```

Must Produce:

```text
Update Summary

Affected Domains

Affected Files

Dependencies

Risk Assessment

Recommended Actions
```

Human approval is required before implementation.

---

# Ownership Impact Rules

Before modifying any file determine:

```text
Who Owns It?

Which Domain Owns It?

Who Depends On It?

What Depends On It?
```

Required Reference:

```text
FILE_OWNERSHIP_MATRIX.md
```

Ownership verification is mandatory.

---

# Dependency Impact Rules

Before implementation determine:

```text
Direct Dependencies

Indirect Dependencies

Document Dependencies

Module Dependencies

Domain Dependencies
```

Required Reference:

```text
CROSS_DOCUMENT_DEPENDENCIES.md
```

Dependency analysis is mandatory.

---

# Documentation Impact Rules

Before implementation determine:

```text
What Documents Must Be Reviewed?

What Documents Must Be Updated?

What Documents Require No Changes?
```

Required Reference:

```text
DOCUMENT_UPDATE_MATRIX.md
```

Only required updates should be performed.

---

# Changelog Impact Rules

Always evaluate:

```text
CHANGELOG.md
```

Mandatory evaluation for:

```text
Architecture Changes

Schema Changes

API Changes

Feature Changes

Domain Changes

Project Structure Changes

User Visible Changes
```

Never skip changelog evaluation.

---

# Testing Impact Rules

Every modification must identify testing requirements.

Possible Requirements:

```text
Unit Tests

Integration Tests

Regression Tests

Schema Validation

API Validation

Repository Validation

Security Validation

Performance Validation

Manual Validation
```

Testing requirements must be known before implementation.

---

# Compatibility Impact Rules

Every modification must answer:

```text
Will Existing Behavior Change?

Will Existing Data Remain Valid?

Will Existing APIs Remain Compatible?

Will Existing Workflows Continue To Work?

Will Existing Features Continue To Work?
```

Compatibility risks must be identified.

---

# Risk Assessment Rules

Every modification must receive a risk classification.

Allowed Values:

```text
Low

Medium

High

Critical
```

Use the highest applicable risk level.

Never downgrade risk without justification.

---

# Multiple Impact Rules

A modification may belong to multiple impact categories.

Example:

```text
New Recommendation Field

Schema Impact
+
API Impact
+
Documentation Impact
+
Recommendation Impact
```

Rule:

Apply all applicable impact rules.

Never evaluate only one category.

---

# Stop Rules

Stop immediately if:

```text
Ownership Is Unknown

Dependencies Are Unknown

Impact Is Unknown

Related Documents Are Unknown

Required Updates Are Unknown

Compatibility Is Unknown
```

Continue analysis before proceeding.

---

# Verification Rules

Before implementation verify:

```text
Impact Complete

Dependencies Verified

Ownership Verified

Documentation Reviewed

Documentation Updates Identified

Testing Identified

Compatibility Verified

Risk Evaluated
```

All verification items must be complete.

---

# Required Impact Report Format

For significant modifications produce:

```text
Change Summary

Change Classification

Affected Domain

Affected Files

Related Files

Dependencies

Risk Level

Required Documentation Updates

Required Tests

Compatibility Assessment

Recommended Action
```

---

# Golden Rule

Never modify a file until you understand everything that depends on it.

Impact analysis must always happen before implementation.
