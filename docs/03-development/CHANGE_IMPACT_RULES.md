# SlicyWeb SMART SLICER

# CHANGE IMPACT RULES

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document defines the mandatory impact analysis process that must be performed before any project modification.

The objective is to:

- Prevent regressions
- Protect project architecture
- Protect domain boundaries
- Protect dependencies
- Maintain documentation consistency
- Improve change traceability
- Improve AI-assisted development safety

No modification should be implemented before impact analysis has been completed.

---

# Governance References

All impact analysis must follow:

```text
CLAUDE_CHANGE_IMPACT_RULES.md

CLAUDE_FILE_UPDATE_RULES.md

CLAUDE_GOVERNANCE_PROTOCOL.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md
```

---

# Fundamental Principle

Every modification has consequences.

Before changing anything, the following questions must be answered:

```text
What is changing?

Who owns it?

What depends on it?

What documents reference it?

What modules consume it?

How will it be validated?
```

---

# Mandatory Impact Analysis Workflow

Every change must follow:

```text
Identify Change

↓

Classify Change

↓

Identify Ownership

↓

Analyze Dependencies

↓

Analyze Documentation Impact

↓

Analyze Domain Impact

↓

Analyze Testing Requirements

↓

Validate Compatibility

↓

Apply Modification

↓

Verify Results
```

---

# Step 1 - Identify Change

Clearly identify:

```text
What is changing

Why it is changing

Who requested the change

Expected outcome
```

Examples:

```text
Add new feature

Fix bug

Refactor component

Update dependency

Modify schema

Update documentation
```

---

# Step 2 - Classify Change

Reference:

```text
CHANGE_CLASSIFICATION_RULES.md
```

Possible classifications:

```text
Documentation Change

Code Change

Schema Change

Architecture Change

Dependency Change

Security Change

Performance Change

Bug Fix

External Update
```

The classification determines:

```text
Review requirements

Validation requirements

Testing requirements

Documentation requirements
```

---

# Step 3 - Identify Ownership

Reference:

```text
FILE_OWNERSHIP_MATRIX.md

DOMAIN_BOUNDARIES.md
```

Determine:

```text
Owning Domain

Responsible Module

Responsible Documents

Affected Components
```

Questions:

```text
Who owns this file?

Who owns this module?

Who owns this document?

Which domain is responsible?
```

---

# Step 4 - Analyze Domain Impact

Reference:

```text
DOMAIN_BOUNDARIES.md
```

Determine:

```text
Affected Domain

Affected Subsystems

Affected Workflows

Affected Responsibilities
```

Verify:

```text
No domain boundaries are violated
```

---

# Step 5 - Analyze Dependency Impact

Reference:

```text
DOMAINS_DEPENDENCY_MATRIX.md
```

Identify:

```text
Direct Dependencies

Indirect Dependencies

Runtime Dependencies

Documentation Dependencies
```

Verify:

```text
No forbidden dependency is introduced
```

---

# Step 5A - Analyze RepositorySync and Remote Source Impact

Reference:

```text
DOMAIN_BOUNDARIES.md
DOMAINS_DEPENDENCY_MATRIX.md
API_SPEC.md
FILE_STRUCTURE.md
```

Determine:

```text
Whether the change affects repository synchronization
Whether the change affects remote data retrieval
Whether the change affects external profile sources
Whether the change affects cache behavior
Whether the change affects local-first data integrity
Whether the change affects downstream services
```

Verify:

```text
No direct GUI access to remote sources
No direct access from unrelated modules
No bypass of RepositorySync
No bypass of validation before remote consumption
No silent failure in remote data synchronization
```

Required checks:

```text
Repository layer reviewed
RepositorySync layer reviewed
Remote source contract reviewed
Cache behavior reviewed
Fallback strategy reviewed
Failure handling reviewed
```

A change is high risk when it modifies:

```text
RepositorySync logic
Remote source access
External profile retrieval
Synchronization timing
Cache invalidation rules
```

---

# Step 6 - Analyze Project Impact

Reference:

```text
PROJECT_IMPACT_MATRIX.md
```

Determine:

```text
Low Impact

Medium Impact

High Impact

Critical Impact
```

Evaluate:

```text
Regression Risk

Compatibility Risk

Architecture Risk

Maintenance Risk
```

---

# Step 7 - Analyze Documentation Impact

Reference:

```text
DOCUMENT_UPDATE_MATRIX.md

CROSS_DOCUMENT_DEPENDENCIES.md
```

Determine whether the modification affects:

```text
Specifications

Architecture Documents

Schemas

Governance Documents

Reference Documents

Development Documents
```

Questions:

```text
Which documents reference this change?

Which documents must be updated?

Which dependent documents must be reviewed?
```

---

# Step 8 - Analyze Compatibility Impact

Verify compatibility with:

```text
Existing APIs

Existing Schemas

Existing Profiles

Existing Project Files

Existing Workflows
```

Questions:

```text
Will existing functionality continue to work?

Will users be affected?

Will existing data remain valid?
```

---

# Step 9 - Analyze Testing Requirements

Determine required validation:

```text
Unit Tests

Integration Tests

Regression Tests

Documentation Validation

Architecture Validation
```

Reference:

```text
TEST_PLAN.md

CHANGE_VERIFICATION_CHECKLIST.md
```

---

# Step 10 - Verification

Before implementation verify:

```text
Ownership Confirmed

Dependencies Analyzed

Impact Assessed

Documentation Reviewed

Testing Defined

Compatibility Verified
```

---

# Impact Categories

## Low Impact

Examples:

```text
Typo Fix

Comment Update

Non-Functional Documentation Update
```

Required:

```text
Basic Review
```

---

## Medium Impact

Examples:

```text
Feature Enhancement

Method Update

Service Modification

UI Improvement
```

Required:

```text
Impact Review

Dependency Validation

Testing
```

---

## High Impact

Examples:

```text
Schema Changes

API Changes

Module Refactoring

Repository Changes
```

Required:

```text
Full Impact Analysis

Compatibility Review

Documentation Update

Testing Validation
```

---

## Critical Impact

Examples:

```text
Architecture Changes

Domain Changes

Core System Changes

Dependency Model Changes

RepositorySync Changes

Remote Source Access Changes

External Data Contract Changes

Cache Invalidation Changes

Synchronization Flow Changes
```

Required:

```text
Full Governance Review

Architecture Review

Dependency Review

Documentation Review

Extended Validation
```

---

# Mandatory Questions Before Any Change

```text
What is changing?
Why is it changing?
Who owns it?
What depends on it?
What documents reference it?
What tests are required?
What risks exist?
Does the change affect RepositorySync?
Does the change affect Remote Sources?
Does the change affect Local Storage or Cache?
Does the change introduce a new external dependency?
Does the change bypass the Repository layer?
Does the change require a rollback or fallback strategy?
How will success be validated?
```

---

# AI Impact Analysis Rules

Before making any modification an AI system must:

```text
Read Ownership Information

Read Dependency Rules

Read Impact Rules

Read Documentation Dependencies

Read Verification Requirements
```

The AI must never:

```text
Modify files blindly

Ignore dependencies

Ignore ownership

Ignore architecture rules

Ignore documentation impact
```

---

# Documentation Impact Rules

Documentation updates are mandatory when changes affect:

```text
Architecture

Schemas

APIs

Workflows

Governance Rules

Project Behavior
```

Reference:

```text
DOCUMENT_UPDATE_MATRIX.md
```

---

# Bug Fix Impact Rules

Bug fixes must follow:

```text
BUG_ANALYSIS_PROTOCOL.md
```

Before fixing a bug:

```text
Perform Root Cause Analysis

Analyze Dependency Impact

Analyze Regression Risk

Analyze Documentation Impact
```

---

# External Update Impact Rules

External updates must follow:

```text
UPDATE_GOVERNANCE_PROTOCOL.md

UPDATE_IMPACT_RULES.md

UPDATE_REPORT_TEMPLATE.md
```

No external update should be applied without impact analysis.

---

# Verification Checklist

Before approving a modification:

```text
✓ Change Classified

✓ Ownership Verified

✓ Dependencies Verified

✓ Impact Assessed

✓ Documentation Reviewed

✓ Testing Planned

✓ Compatibility Verified

✓ Risks Evaluated
```

---

# Golden Rule

No modification is considered safe until its impact has been analyzed.

Impact Analysis First.

Modification Second.

---

# End Of Document

---
