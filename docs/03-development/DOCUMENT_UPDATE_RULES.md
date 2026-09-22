# DOCUMENT UPDATE RULES

Version: 2.0.0

Status: Approved

Priority: Mandatory

---

# Purpose

This document defines the mandatory rules for updating project documentation.

Its purpose is to:

- maintain documentation consistency
- prevent outdated documentation
- reduce architectural drift
- ensure traceability
- keep implementation and documentation synchronized

Documentation is considered part of the project source code.

Documentation updates are mandatory whenever project changes occur.

---

# Governance Integration

Documentation updates must comply with:

```text
CLAUDE_GOVERNANCE_PROTOCOL.md

DOMAIN_BOUNDARIES.md

DOMAINS_DEPENDENCY_MATRIX.md

FILE_OWNERSHIP_MATRIX.md

PROJECT_IMPACT_MATRIX.md

CHANGE_CLASSIFICATION_RULES.md

CHANGE_VERIFICATION_CHECKLIST.md

CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md

BUG_ANALYSIS_PROTOCOL.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Purpose:

```text
Protect documentation consistency

Prevent architecture drift

Maintain domain ownership

Control documentation dependencies

Reduce regressions

Standardize documentation validation
```

---

# Documentation First Rule

Documentation has priority over implementation.

Before modifying code:

1. Read documentation
2. Identify impacted documents
3. Evaluate documentation impact
4. Update documentation if required
5. Modify implementation
6. Verify consistency

---

# Documentation Maintenance Principle

Every significant change must trigger a documentation review.

No module should evolve independently from its documentation.

Implementation and documentation must remain synchronized.

---

# Documentation Ownership Rules

Before modifying documentation:

- Verify ownership
- Verify impacted domains
- Verify cross-document dependencies

Cross-domain documentation modifications require impact analysis.

Documentation ownership must follow:

```text
FILE_OWNERSHIP_MATRIX.md

DOMAIN_BOUNDARIES.md
```

Documentation dependencies must follow:

```text
CROSS_DOCUMENT_DEPENDENCIES.md

DOCUMENT_UPDATE_MATRIX.md
```

---

# Mandatory Documentation Review

The following documents must always be reviewed when modifying the project:

- PROJECT_DOCUMENTATION_INDEX.md
- FILE_STRUCTURE.md
- ARCHITECTURE.md
- DATA_SCHEMA.md
- SYSTEM_RULES.md
- AI_DEVELOPMENT_PROTOCOL.md

---

# Documentation Impact Analysis

Before updating documentation: 

1. Identify impacted documents
2. Identify impacted domains
3. Identify ownership
4. Review document dependencies
5. Update affected documents
6. Validate consistency
7. Update CHANGELOG.md if required

---

# Documentation Dependency Rules

Before updating any document:

Review:

```text
CROSS_DOCUMENT_DEPENDENCIES.md
```

---

# File Creation Rules

Whenever a new file is added:

Review:

- FILE_STRUCTURE.md
- DIRECTORY_PURPOSES.md
- PROJECT_DOCUMENTATION_INDEX.md

Update them if necessary.

---

# Directory Creation Rules

Whenever a new directory is added:

Review:

- FILE_STRUCTURE.md
- DIRECTORY_PURPOSES.md
- ARCHITECTURE.md

Update them if necessary.

---

# Architecture Change Rules

Whenever architecture changes:

Mandatory review:

- ARCHITECTURE.md
- FILE_STRUCTURE.md
- TECHNICAL_OVERVIEW.md
- PROJECT_DOCUMENTATION_INDEX.md
- CHANGELOG.md

Documentation updates are required before implementation is considered complete.

---

# Schema Change Rules

Whenever a schema changes:

Mandatory review:

- DATA_SCHEMA.md
- Related Type Definitions
- Related Zod Schemas
- API_SPEC.md
- PROJECT_SPEC.md

All schema definitions must remain consistent.

---

# API Change Rules

Whenever an API changes:

Mandatory review:

- API_SPEC.md
- PROJECT_DOCUMENTATION_INDEX.md
- CHANGELOG.md

All public interfaces must remain documented.

---

# Documentation Update Checklist

Before closing a modification:

Verify:

- Architecture documentation updated
- Schema documentation updated
- API documentation updated
- File structure updated
- Directory purposes updated
- Changelog updated
- Index updated
- Ownership verified
- Dependencies reviewed
- Impact analysis completed
- Cross-document references validated
All applicable items must be completed.

---

# New Module Checklist

When adding a new module:

Verify:

- Module documented
- Architecture updated
- File structure updated
- Directory purpose documented
- Related schema documented
- Changelog updated

---

# New Engine Checklist

When adding a new engine:

Verify:

- ARCHITECTURE.md updated
- FILE_STRUCTURE.md updated
- AI_ENGINE_SPEC.md updated
- PROJECT_DOCUMENTATION_INDEX.md updated

Examples:

- Classification Engine
- Recommendation Engine
- Optimization Engine
- Cost Engine

---

# New Service Checklist

When adding a service:

Verify:

- FILE_STRUCTURE.md updated
- DIRECTORY_PURPOSES.md updated
- PROJECT_DOCUMENTATION_INDEX.md reviewed

Examples:

- AnalysisService
- ProjectService
- StorageService

---

# New Documentation Checklist

When creating a new document:

Verify:

- Correct directory
- Correct category
- Added to PROJECT_DOCUMENTATION_INDEX.md
- Added to related reference documents
- Referenced where appropriate

---

# Changelog Rules

CHANGELOG.md must be updated whenever:

- feature added
- feature removed
- architecture modified
- schema modified
- service added
- engine added
- API modified

---

# Version Synchronization Rules

Documentation versions should remain synchronized.

When major modifications occur:

Review:

- ARCHITECTURE.md
- DATA_SCHEMA.md
- FILE_STRUCTURE.md
- PROJECT_SPEC.md
- CHANGELOG.md

---

# AI Documentation Rules

AI systems must never assume documentation is up to date.

Before creating, deleting or modifying files:

1. Read existing documentation
2. Verify documentation consistency
3. Apply updates if necessary
4. Validate cross-document references

---

# Documentation Validation Rules

Before marking a task complete:

Verify:

- no broken references
- no duplicate documents
- no outdated file paths
- no outdated module names
- no outdated architecture descriptions

---

# Documentation Update Matrix Reference

Documentation impact relationships are maintained in:

DOCUMENT_UPDATE_MATRIX.md

This document defines:

- Change Types
- Impacted Documents
- Review Requirements
- Update Requirements
- Cross-Document Dependencies

The matrix is the authoritative reference for documentation impact analysis.

---

# Documentation Governance Validation

Before marking documentation complete:

Verify:

- Ownership respected

- Dependencies validated

- References updated

- Impact analysis completed

- Governance requirements satisfied

Reference:

```text
CHANGE_VERIFICATION_CHECKLIST.md
```

---

# Completion Rule

A modification cannot be considered complete until:

- code updated
- documentation reviewed
- documentation synchronized
- references validated

---

# Golden Rule

If implementation changes,
documentation must be reviewed.

If documentation becomes outdated,
the task is not complete.

Documentation and implementation must evolve together.

---

# End Of Document
