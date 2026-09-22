# SlicyWeb SMART SLICER

# CHANGE VERIFICATION CHECKLIST

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory verification process that must be completed before any modification is approved for implementation.

The objective is to:

- Prevent regressions
- Prevent incomplete updates
- Prevent architecture violations
- Prevent dependency violations
- Prevent undocumented changes
- Improve consistency
- Improve traceability
- Improve project stability

No modification should begin until this checklist has been completed.

---

# Verification Philosophy

A modification is not approved because it appears correct.

A modification is approved only after:

```text
Analysis

Dependency Verification

Impact Verification

Documentation Verification

Validation Planning
```

Every proposed change must pass this checklist.

---

# Mandatory Rule

Before modifying:

```text
Documentation

Source Code

Schemas

APIs

Profiles

Repositories

Architecture

Project Structure
```

Complete this checklist.

Skipping checklist items is prohibited.

---

# SECTION 1

# CHANGE IDENTIFICATION

## 1.1

Have you clearly identified the requested change?

```text
[ ] Yes

[ ] No
```

---

## 1.2

Have you clearly identified the reason for the change?

```text
[ ] Yes

[ ] No
```

---

## 1.3

Can the purpose of the change be explained in one sentence?

```text
[ ] Yes

[ ] No
```

---

## 1.4

Have you classified the change?

Reference:

```text
CHANGE_CLASSIFICATION_RULES.md
```

```text
[ ] Yes

[ ] No
```

---

## 1.5

Change Classification

Select all applicable categories:

```text
[ ] Documentation Change

[ ] Structure Change

[ ] Schema Change

[ ] API Change

[ ] IPC Change

[ ] Feature Change

[ ] Architecture Change

[ ] Domain Change

[ ] Profile Change

[ ] Repository Change

[ ] Security Change

[ ] Performance Change

[ ] Refactoring

[ ] Bug Fix

[ ] External Update

[ ] Governance Change

[ ] Versioning Change
```

---

# SECTION 2

# DOCUMENT READING VERIFICATION

## 2.1

Have all mandatory documents been read?

```text
[ ] Yes

[ ] No
```

---

## 2.2

Has the relevant domain documentation been read?

```text
[ ] Yes

[ ] No
```

---

## 2.3

Has the target file been fully reviewed?

```text
[ ] Yes

[ ] No
```

---

## 2.4

Have related files been reviewed?

```text
[ ] Yes

[ ] No
```

---

## 2.5

Have ownership documents been reviewed?

Reference:

```text
FILE_OWNERSHIP_MATRIX.md
```

```text
[ ] Yes

[ ] No
```

---

# SECTION 3

# DOMAIN VERIFICATION

## 3.1

What domain owns this change?

```text
________________________________
```

---

## 3.2

Has domain ownership been verified?

```text
[ ] Yes

[ ] No
```

---

## 3.3

Have domain boundaries been verified?

Reference:

```text
DOMAIN_BOUNDARIES.md
```

```text
[ ] Yes

[ ] No
```

---

## 3.4

Have domain dependencies been verified?

Reference:

```text
DOMAINS_DEPENDENCY_MATRIX.md
```

```text
[ ] Yes

[ ] No
```

---

## 3.5

Will the modification violate any domain boundary?

```text
[ ] Yes

[ ] No
```

If Yes:

```text
STOP
```

Review architecture before continuing.

---

# SECTION 4

# DEPENDENCY VERIFICATION

## 4.1

Have direct dependencies been identified?

```text
[ ] Yes

[ ] No
```

---

## 4.2

Have indirect dependencies been identified?

```text
[ ] Yes

[ ] No
```

---

## 4.3

Have document dependencies been identified?

Reference:

```text
CROSS_DOCUMENT_DEPENDENCIES.md
```

```text
[ ] Yes

[ ] No
```

---

## 4.4

Have module dependencies been identified?

```text
[ ] Yes

[ ] No
```

---

## 4.5

Have schema dependencies been identified?

```text
[ ] Yes

[ ] No
```

---

## 4.6

Have API dependencies been identified?

```text
[ ] Yes

[ ] No
```

---

# SECTION 5

# IMPACT ANALYSIS

## 5.1

Have impacted files been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.2

Have impacted modules been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.3

Have impacted domains been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.4

Have impacted schemas been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.5

Have impacted APIs been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.6

Have impacted documents been identified?

```text
[ ] Yes

[ ] No
```

---

## 5.7

Has PROJECT_IMPACT_MATRIX.md been reviewed?

```text
[ ] Yes

[ ] No
```

---

# SECTION 6

# DOCUMENTATION VERIFICATION

## 6.1

Has DOCUMENT_UPDATE_MATRIX.md been reviewed?

```text
[ ] Yes

[ ] No
```

---

## 6.2

Have all required document reviews been completed?

```text
[ ] Yes

[ ] No
```

---

## 6.3

Have all required document updates been identified?

```text
[ ] Yes

[ ] No
```

---

## 6.4

Does PROJECT_DOCUMENTATION_INDEX.md require an update?

```text
[ ] Yes

[ ] No
```

---

## 6.5

Does SlicyWeb files explication.txt require an update?

```text
[ ] Yes

[ ] No
```

---

## 6.6

Does README.md require an update?

```text
[ ] Yes

[ ] No
```

---

## 6.7

Does CONTRIBUTING.md require an update?

```text
[ ] Yes

[ ] No
```

---

# SECTION 7

# CHANGELOG VERIFICATION

## 7.1

Has CHANGELOG.md been evaluated?

```text
[ ] Yes

[ ] No
```

---

## 7.2

Does the modification affect:

```text
Architecture

Schema

API

Structure

Feature

User Behavior
```

```text
[ ] Yes

[ ] No
```

---

## 7.3

Is a CHANGELOG update required?

```text
[ ] Yes

[ ] No
```

---

# SECTION 8

# COMPATIBILITY VERIFICATION

## 8.1

Will the change preserve backward compatibility?

```text
[ ] Yes

[ ] No
```

---

## 8.2

Will existing functionality continue to work?

```text
[ ] Yes

[ ] No
```

---

## 8.3

Will any existing workflow change?

```text
[ ] Yes

[ ] No
```

---

## 8.4

Will existing data remain valid?

```text
[ ] Yes

[ ] No
```

---

## 8.5

Will existing APIs remain compatible?

```text
[ ] Yes

[ ] No
```

---

# SECTION 9

# TESTING REQUIREMENTS

## 9.1

Have testing requirements been identified?

```text
[ ] Yes

[ ] No
```

---

## 9.2

Required Tests

```text
[ ] Unit Tests

[ ] Integration Tests

[ ] Regression Tests

[ ] Schema Validation

[ ] API Validation

[ ] Security Validation

[ ] Performance Validation

[ ] Manual Validation
```

---

## 9.3

Have regression risks been identified?

```text
[ ] Yes

[ ] No
```

---

# SECTION 10

# EXTERNAL UPDATE VERIFICATION

Complete only when external updates are involved.

## 10.1

Has UPDATE_GOVERNANCE_PROTOCOL.md been reviewed?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 10.2

Has UPDATE_IMPACT_RULES.md been reviewed?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 10.3

Has an update summary been created?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 10.4

Has human approval been received?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

# SECTION 11

# BUG FIX VERIFICATION

Complete only for bug fixes.

## 11.1

Has BUG_ANALYSIS_PROTOCOL.md been completed?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 11.2

Has a root cause been identified?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 11.3

Have affected files been identified?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

## 11.4

Has regression risk been evaluated?

```text
[ ] Yes

[ ] No

[ ] Not Applicable
```

---

# SECTION 12

# FINAL APPROVAL

## 12.1

Documentation Reviewed

```text
[ ] Complete
```

---

## 12.2

Dependencies Verified

```text
[ ] Complete
```

---

## 12.3

Impact Analysis Complete

```text
[ ] Complete
```

---

## 12.4

Ownership Verified

```text
[ ] Complete
```

---

## 12.5

Testing Requirements Defined

```text
[ ] Complete
```

---

## 12.6

Documentation Updates Identified

```text
[ ] Complete
```

---

## 12.7

Changelog Evaluated

```text
[ ] Complete
```

---

## 12.8

Backward Compatibility Verified

```text
[ ] Complete
```

---

## FINAL DECISION

```text
[ ] APPROVED FOR IMPLEMENTATION

[ ] REQUIRES FURTHER ANALYSIS

[ ] REJECTED
```

---

# Stop Rule

If any critical verification item is incomplete:

```text
STOP

Continue Analysis

Complete Verification

Then Proceed
```

Implementation must not begin until verification is complete.

---

# Golden Rule

Never modify first.

Verify first.

The safest change is the change that has been fully understood.
