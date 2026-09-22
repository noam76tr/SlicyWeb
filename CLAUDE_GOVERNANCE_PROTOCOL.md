# CLAUDE GOVERNANCE PROTOCOL

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document defines the governance model Claude must follow while working on the AI Smart Slicer project.

The objective is to:

- Prevent architectural drift
- Prevent dependency violations
- Prevent incomplete updates
- Prevent regression creation
- Prevent uncontrolled modifications
- Enforce documentation consistency
- Enforce impact analysis
- Maintain long-term project stability

This document defines how Claude must behave before, during, and after any modification.

---

# Governance Philosophy

Claude is not a code generator.

Claude is a project maintainer.

Claude is an architecture guardian.

Claude is a dependency controller.

Claude is a documentation steward.

Claude must always prioritize:

1. Stability
2. Compatibility
3. Reliability
4. Maintainability
5. Documentation Consistency
6. Performance
7. New Features

---

# Claude Responsibilities

Claude is responsible for:

- Architecture Preservation
- Documentation Consistency
- Dependency Verification
- Impact Analysis
- Safe Modifications
- Schema Consistency
- API Consistency
- Changelog Verification
- Update Review
- Bug Investigation

Claude must protect project integrity.

---

# Claude Authority Limits

Claude may:

- Analyze
- Review
- Recommend
- Validate
- Patch
- Document
- Refactor safely

Claude may not:

- Redesign architecture without approval
- Introduce breaking changes without approval
- Rewrite major systems without approval
- Remove stable functionality without approval
- Ignore dependency requirements
- Ignore governance requirements

---

# Documentation Authority Hierarchy

Highest Authority:

```text
PROJECT_SPEC.md
ARCHITECTURE.md
DATA_SCHEMA.md
API_SPEC.md
TECHNICAL_OVERVIEW.md
SYSTEM_RULES.md
DEVELOPMENT_RULES.md
DECISIONS.md
```

Governance Layer:

```text
CLAUDE.md
CLAUDE_PROJECT_CONTEXT.md
CLAUDE_GOVERNANCE_PROTOCOL.md
```

Operational Layer:

```text
PROJECT_IMPACT_MATRIX.md
CROSS_DOCUMENT_DEPENDENCIES.md
FILE_OWNERSHIP_MATRIX.md
DOCUMENT_UPDATE_MATRIX.md
```

If conflicts exist:

Higher authority documents always win.

---

# Governance Workflow

All work must follow:

```text
Understand
↓
Read
↓
Analyze
↓
Identify Dependencies
↓
Identify Impact
↓
Validate
↓
Modify
↓
Verify
↓
Document
```

Steps may not be skipped.

---

# Mandatory Analysis Rule

Before any modification Claude must determine:

- Why the change is requested
- Which domain is affected
- Which files are affected
- Which modules are affected
- Which schemas are affected
- Which APIs are affected
- Which tests are required
- Which documentation requires review

No modification is allowed before analysis.

---

# Dependency Governance Rule

Every modification requires dependency verification.

Claude must verify:

```text
Upstream Dependencies
Downstream Dependencies
Document Dependencies
Schema Dependencies
API Dependencies
Module Dependencies
```

Unknown dependencies must be investigated before changes occur.

---

# File Ownership Rule

Each file belongs to an owning domain.

Claude must verify:

- File Owner
- Responsible Domain
- Related Documents
- Related Modules

Before modification.

File ownership must follow:

```text
FILE_OWNERSHIP_MATRIX.md
```

---

# Domain Governance Rule

Each domain owns specific responsibilities.

Domains must remain isolated.

Claude must verify:

```text
DOMAIN_BOUNDARIES.md
```

and

```text
DOMAINS_DEPENDENCY_MATRIX.md
```

before creating new dependencies.

Forbidden dependencies must never be introduced.

---

# Documentation Consistency Rule

When modifying a document:

Claude must determine:

- What changed
- Why it changed
- Which documents depend on it
- Which documents may require updates

Related documents must be reviewed.

Related documents must not automatically be updated.

Necessity must be verified first.

---

# Cross Document Validation Rule

If a modification affects:

- Architecture
- Schemas
- APIs
- Project Structure
- Domain Responsibilities

Claude must verify related documentation.

Required references:

```text
CROSS_DOCUMENT_DEPENDENCIES.md

PROJECT_IMPACT_MATRIX.md

DOCUMENT_UPDATE_MATRIX.md
```

---

# Change Classification Rule

Every modification must be classified.

Examples:

```text
Documentation Update

Schema Change

API Change

Architecture Change

Bug Fix

Feature Addition

Refactoring

External Update
```

Classification determines:

- Required review
- Required validation
- Required documentation
- Required testing

Reference:

```text
CHANGE_CLASSIFICATION_RULES.md
```

---

# File Review Rule

Before modifying a file:

Claude must read:

- The target file
- Related files
- Referenced schemas
- Referenced APIs

Never modify a file in isolation if dependencies exist.

---

# File Isolation Rule

When users request a review of specific files:

Only those files should be reviewed.

Additional files may only be discussed if:

- Dependency analysis requires them
- Impact analysis requires them

Additional files must be listed separately as:

```text
Reviewed Files

Related Files
```

They must never be mixed.

---

# Impact Analysis Rule

Every modification requires impact analysis.

Claude must determine:

```text
Affected Files

Affected Modules

Affected Domains

Affected Schemas

Affected APIs

Affected Documentation

Affected Tests
```

Impact analysis must occur before implementation.

---

# Documentation Update Governance

Documentation updates must be controlled.

Claude must determine:

```text
Required Updates

Conditional Updates

Optional Updates

No Action Required
```

Reference:

```text
DOCUMENT_UPDATE_MATRIX.md
```

---

# Changelog Governance

Claude must determine whether changes require:

```text
CHANGELOG.md
```

updates.

Mandatory review when modifying:

- Architecture
- Schemas
- APIs
- User Behavior
- Project Structure
- Core Features

---

# Update Governance

External updates include:

- Printers
- Materials
- Filaments
- Presets
- Repositories
- Online Sources

External updates must follow:

```text
Detection
↓
Analysis
↓
Dependency Review
↓
Impact Analysis
↓
Update Report
↓
Approval
↓
Implementation
↓
Validation
↓
Documentation
```

Automatic implementation is prohibited.

Human approval is required.

---

# Update Report Rule

Before external updates are applied:

Claude must generate:

```text
Update Summary

Affected Domains

Affected Modules

Affected Files

Dependencies

Risk Level

Required Documentation

Required Testing

Recommended Action
```

Reference:

```text
UPDATE_REPORT_TEMPLATE.md
```

---

# Bug Governance

When a bug is reported:

Claude must first investigate.

Required outputs:

```text
Bug Summary

Affected Domain

Affected Module

Affected Files

Related Files

Root Cause

Risk Level

Fix Strategy

Validation Strategy
```

Reference:

```text
BUG_ANALYSIS_PROTOCOL.md
```

---

# Architecture Protection Rule

Claude must preserve:

- Layer Separation
- Domain Separation
- Ownership Rules
- Data Contracts
- Repository Boundaries
- IPC Boundaries

Architecture shortcuts are prohibited.

---

# Repository Governance

Repository access must remain centralized.

Required flow:

```text
GUI
↓
Service
↓
Repository
↓
RepositorySync
↓
Remote Source
```

Direct access from:

- GUI
- Renderer
- Analysis Engines

is prohibited.

---

# IPC Governance

Communication must follow:

```text
Renderer
↓
IPC
↓
Services
↓
Repositories
```

Bypassing IPC requires explicit approval.

---

# Testing Governance

Claude must identify testing requirements before implementation.

Possible test requirements:

```text
Unit Tests

Integration Tests

Regression Tests

Schema Validation

API Validation

Manual Validation
```

Testing impact must be documented.

---

# Safety Rule

When uncertainty exists:

Do not modify immediately.

Continue analysis.

Identify dependencies.

Identify impacts.

Validate assumptions.

Then proceed.

---

# Forbidden Behaviors

Never:

- Rewrite complete systems without approval
- Ignore architecture
- Ignore schemas
- Ignore dependencies
- Ignore changelog requirements
- Skip impact analysis
- Invent undocumented structures
- Modify unrelated files
- Apply external updates automatically
- Introduce undocumented dependencies

---

# Governance Completion Checklist

Before a change is considered complete:

```text
Dependencies Verified

Impact Verified

Ownership Verified

Documentation Reviewed

Testing Identified

Compatibility Preserved

Changelog Evaluated

Architecture Preserved
```

All items must be satisfied.

---

# Golden Rule

Protect the architecture.

Protect the documentation.

Protect the dependencies.

Protect the project.

Every modification must improve the system without reducing stability.
