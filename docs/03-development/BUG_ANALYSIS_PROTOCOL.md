# SlicyWeb SMART SLICER

# BUG ANALYSIS PROTOCOL

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the official bug investigation, analysis, validation, and resolution workflow for the project.

The objectives are:

- Identify root causes
- Prevent incorrect fixes
- Prevent regressions
- Improve troubleshooting
- Improve traceability
- Improve maintainability
- Improve stability
- Improve consistency
- Improve documentation accuracy
- Improve future prevention

The purpose is not simply to fix bugs.

The purpose is to understand why bugs happened and prevent them from happening again.

---

# Core Principle

Never start with a solution.

Always start with analysis.

Follow:

```text
Understand
↓
Investigate
↓
Reproduce
↓
Identify Cause
↓
Measure Impact
↓
Assess Risk
↓
Create Fix Plan
↓
Validate Plan
↓
Implement
↓
Verify
↓
Prevent Recurrence
```

No fix should be implemented before understanding the problem.

---

# Bug Definition

A bug is any behavior that differs from:

```text
Expected Behavior

Documented Behavior

Specified Behavior

Architectural Requirements

Validation Rules

Business Rules

User Expectations
```

A bug may exist in:

```text
Code

Documentation

Schemas

API Contracts

Architecture

Configuration

Dependencies

Repositories

External Data

Validation Rules

Project Structure
```

---

# Investigation Philosophy

Symptoms are not root causes.

Examples:

Incorrect:

```text
Application Crashed
```

Correct:

```text
Invalid Repository Payload
caused an unhandled validation exception.
```

A valid root cause must explain:

```text
What Happened

Why It Happened

Why Validation Failed

Why Prevention Failed
```

---

# Severity Levels

## Low

Examples:

```text
Typographical Errors

Label Errors

Minor Layout Problems

Cosmetic Display Issues
```

Impact:

```text
Limited User Impact
```

---

## Medium

Examples:

```text
Workflow Interruptions

Preset Problems

Incorrect Validation Messages

Minor Import Problems
```

Impact:

```text
Feature Impact
```

---

## High

Examples:

```text
Import Failures

Recommendation Errors

Repository Failures

Incorrect Classification

Data Inconsistencies

Storage Problems
```

Impact:

```text
Major Functional Impact
```

---

## Critical

Examples:

```text
Data Loss

Corruption

Application Crash

Architecture Failure

Security Failure

Project Recovery Failure
```

Impact:

```text
System Integrity Risk
```

---

# Investigation Workflow

Every bug investigation must follow:

```text
Bug Report
↓
Reproduction
↓
Domain Identification
↓
Ownership Verification
↓
Affected Files Analysis
↓
Dependency Analysis
↓
Root Cause Analysis
↓
Impact Analysis
↓
Risk Analysis
↓
Documentation Analysis
↓
Fix Strategy
↓
Testing Strategy
↓
Implementation
↓
Verification
↓
Closure
```

No steps may be skipped.

---

# Phase 1

# Bug Understanding

Determine:

```text
What Happened?

What Was Expected?

What Was Observed?

Where Did It Happen?

When Did It Happen?

How Often Does It Happen?

Who Is Affected?
```

Document observations.

Do not assume behavior.

Do not jump directly to conclusions.

---

# Phase 2

# Reproduction Analysis

Determine:

```text
Can The Bug Be Reproduced?
```

Possible Results:

```text
Always

Sometimes

Rarely

Unknown
```

Document:

```text
Steps To Reproduce

Expected Result

Observed Result

Environment

Conditions
```

Reproduction information is mandatory whenever possible.

---

# Phase 3

# Domain Identification

Determine the primary affected domain.

Possible Domains:

```text
GUI

Viewport

Application

State Management

Import

Scene

Analysis

Classification

Recommendation

Optimization

Profiles

Presets

Validation

API

IPC

Repository

RepositorySync

Storage

Notification

Cost Estimation

Project Management

Security
```

Every bug must be assigned to at least one domain.

---

# Phase 4

# Ownership Verification

Determine:

```text
Who Owns The Affected Area?
```

Reference:

```text
FILE_OWNERSHIP_MATRIX.md
```

Identify:

```text
Owning Domain

Owning Files

Related Domains

Related Documents

Related Specifications
```

Ownership verification is mandatory.

---

# Phase 5

# Affected Files Analysis

Identify:

```text
Directly Affected Files
```

Examples:

```text
Source Files

Documentation Files

Schema Files

Configuration Files

Validation Files
```

Create two separate lists:

```text
Affected Files

Related Files
```

Never mix the two categories.

---

# Phase 6

# Dependency Analysis

Review:

```text
CROSS_DOCUMENT_DEPENDENCIES.md

DOMAINS_DEPENDENCY_MATRIX.md

DOMAIN_BOUNDARIES.md

PROJECT_IMPACT_MATRIX.md
```

Determine:

```text
Direct Dependencies

Indirect Dependencies

Document Dependencies

Domain Dependencies

Module Dependencies

Validation Dependencies
```

Every bug may affect more than one file.

---

# Phase 7

# Root Cause Analysis

Determine:

```text
Why Did The Bug Occur?
```

Possible Categories:

```text
Logic Error

Architecture Problem

Dependency Violation

Schema Problem

API Contract Issue

Storage Problem

Repository Problem

Validation Failure

Configuration Problem

Missing Requirement

Incorrect Assumption

Documentation Error

External Data Problem

Human Error

Design Limitation
```

Root cause identification is mandatory.

---

# Root Cause Verification

A valid root cause must:

```text
Explain The Symptom

Explain Why The Problem Occurred

Be Verifiable

Be Reproducible

Be Actionable
```

Invalid Example:

```text
Recommendation Failed
```

Valid Example:

```text
Missing Input Validation
allowed invalid material data
to reach recommendation generation.
```

---

# Five Why Rule

For medium, high, and critical bugs perform additional analysis.

Ask:

```text
Why?
```

multiple times until the fundamental cause is identified.

The first explanation is rarely the true root cause.

---

# Phase 8

# Impact Analysis

Review:

```text
PROJECT_IMPACT_MATRIX.md
```

Determine:

```text
Affected Files

Affected Modules

Affected Domains

Affected Schemas

Affected APIs

Affected Documentation

Affected Users

Affected Workflows

Affected Future Features
```

Impact must be measured before selecting a fix.

---

# Phase 9

# Risk Assessment

Assign a risk level:

```text
Low

Medium

High

Critical
```

Evaluate:

```text
Architecture Risk

Compatibility Risk

Data Risk

Security Risk

Regression Risk

Operational Risk
```

Use the highest applicable risk level.

---

# Phase 10

# Documentation Analysis

Determine whether documentation contributed to the issue.

Review:

```text
DOCUMENT_UPDATE_MATRIX.md
```

Verify:

```text
Outdated Documentation

Missing Documentation

Incorrect Documentation

Incomplete Documentation

Contradictory Documentation
```

Documentation inconsistencies may be a root cause.

---

# Phase 11

# Changelog Evaluation

Determine whether the fix should be recorded.

Review:

```text
CHANGELOG.md
```

Always evaluate:

```text
Critical Bugs

Architecture Fixes

Schema Fixes

API Fixes

Security Fixes

User Visible Fixes
```

---

# Phase 12

# Fix Strategy

Before implementation define:

```text
Fix Type

Affected Files

Affected Domains

Required Reviews

Required Updates

Required Testing
```

A fix strategy must exist before changes begin.

---

# Fix Categories

Possible Categories:

```text
Logic Fix

Validation Fix

Schema Fix

API Fix

Repository Fix

Storage Fix

Configuration Fix

Documentation Fix

Architecture Fix

Security Fix
```

Select the smallest safe correction.

---

# Patch First Rule

Always prefer:

```text
Patch

Localized Change

Targeted Correction

Minimal Modification
```

Avoid:

```text
Large Rewrite

Architecture Rewrite

Mass Refactoring

System Replacement
```

Unless explicitly approved.

---

# Phase 13

# Testing Analysis

Define required validation.

Possible Tests:

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

Testing must be identified before implementation.

---

# Phase 14

# Regression Analysis

Determine:

```text
Could The Fix Create New Problems?
```

Evaluate:

```text
Affected Features

Affected Domains

Affected Workflows

Affected Schemas

Affected APIs

Affected Documentation

Affected Validations
```

Regression analysis is mandatory.

---

# Phase 15

# Verification

After implementation verify:

```text
Bug Resolved

Expected Behavior Restored

No New Problems Introduced

Documentation Consistent

Validation Successful

Tests Passed
```

The original issue must be tested again.

---

# Mandatory Bug Analysis Report

Every investigation should produce:

```text
BUG SUMMARY

Title:

Severity:

Risk Level:

Affected Domain:

Affected Files:

Related Files:

Dependencies:

Expected Behavior:

Observed Behavior:

Root Cause:

Impact Analysis:

Fix Strategy:

Required Documentation Review:

Required Documentation Updates:

Required Tests:

Regression Risk:

Final Recommendation:
```

---

# Stop Rules

Stop implementation immediately if:

```text
Root Cause Unknown

Affected Files Unknown

Dependencies Unknown

Impact Unknown

Risk Unknown

Testing Requirements Unknown
```

Continue analysis until the missing information is identified.

---

# Investigation Completion Checklist

Before implementation verify:

```text
Bug Understood

Bug Reproduced

Owner Identified

Dependencies Reviewed

Root Cause Identified

Impact Evaluated

Risk Evaluated

Fix Strategy Created

Testing Defined

Regression Risk Evaluated
```

All items must be complete.

---

# Verification Completion Checklist

Before closing the issue verify:

```text
Fix Implemented

Bug Verified

Documentation Reviewed

Documentation Updated If Required

Dependencies Rechecked

Impact Rechecked

Validation Completed

Tests Passed

Regression Verification Completed

No New Issues Detected
```

All items must be complete.

---

# Bug Closure Criteria

A bug may only be closed when:

```text
Root Cause Identified

Fix Implemented

Validation Completed

Required Tests Passed

Regression Risk Evaluated

Documentation Reviewed

Required Documentation Updates Completed
```

Closing a bug without verification is prohibited.

---

# Reporting Rule

For Medium, High, and Critical bugs produce:

```text
Bug Summary

Severity

Risk Level

Affected Domain

Affected Files

Related Files

Root Cause

Impact Analysis

Fix Strategy

Tests Performed

Regression Analysis

Final Status
```

---

# Escalation Rule

Escalate investigation when:

```text
Root Cause Cannot Be Determined

Architecture Is Affected

Multiple Domains Are Affected

Data Integrity Is At Risk

Security Is Impacted

Repeated Failures Occur
```

Additional analysis is required before implementation.

---

# Documentation Rule

If investigation reveals:

```text
Outdated Documentation

Missing Documentation

Incorrect Documentation

Incomplete Documentation
```

Documentation review becomes mandatory.

Evaluate using:

```text
DOCUMENT_UPDATE_MATRIX.md
```

---

# Prevention Rule

After resolving a bug determine:

```text
Can This Happen Again?

Can Validation Prevent It?

Can Documentation Prevent It?

Can Testing Prevent It?

Can Architecture Prevent It?
```

Every significant bug should improve the system.

---

# Golden Rule

Do not fix symptoms.

Identify the cause.

Understand the impact.

Apply the smallest safe correction.

Verify the result.

Prevent the bug from returning.
