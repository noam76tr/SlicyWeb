# SlicyWeb SMART SLICER

# UPDATE IMPACT RULES

Version: 1.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines the mandatory impact analysis process for all external updates.

The objective is to:

- Prevent regressions
- Prevent inconsistent updates
- Prevent undocumented changes
- Prevent architecture violations
- Prevent schema inconsistencies
- Improve traceability
- Improve update quality
- Improve long-term maintainability

All external updates must follow this document before implementation.

---

# Scope

This protocol applies to:

```text
Printers

Materials

Filaments

Print Presets

Repository Data

Repository Metadata

Configuration Libraries

Supported Devices

Supported Formats

External Specifications

External Integrations
```

---

# Core Principle

External changes must never be applied automatically.

Every update must follow:

```text
Detect
↓
Analyze
↓
Determine Impact
↓
Review Dependencies
↓
Produce Report
↓
Human Approval
↓
Implementation
↓
Validation
↓
Documentation Review
```

Human approval is mandatory.

---

# Update Categories

External updates are classified as:

```text
Printer Update

Material Update

Filament Update

Preset Update

Repository Update

Schema Update

API Update

Compatibility Update

Specification Update

Security Update
```

---

# Risk Levels

## Low

Examples:

```text
Description Changes

Metadata Changes

Documentation Changes

Reference Updates
```

---

## Medium

Examples:

```text
New Printer

New Material

New Filament

New Preset
```

---

## High

Examples:

```text
Profile Structure Changes

Validation Rule Changes

Repository Format Changes

Compatibility Changes
```

---

## Critical

Examples:

```text
Schema Changes

API Contract Changes

Breaking Repository Changes

Security Changes
```

---

# Mandatory Questions

Before any update Claude must answer:

```text
What Changed?

Why Did It Change?

Who Owns The Data?

What Depends On The Data?

What Is Impacted?

What Needs Review?

What Needs Updating?

What Needs Testing?

What Is The Risk Level?
```

---

# Printer Update Rules

Examples:

```text
New Printer

Updated Printer

Removed Printer

Modified Printer Capabilities
```

Mandatory Review:

```text
PRINTER_PROFILE_SPEC.md

DATA_SCHEMA.md

API_SPEC.md
```

Impact Evaluation:

```text
Recommendation Engine

Validation Rules

Profile Compatibility

Storage Compatibility
```

Possible Documentation Updates:

```text
PRINTER_PROFILE_SPEC.md

CHANGELOG.md
```

Testing:

```text
Profile Validation

Schema Validation

Compatibility Validation
```

---

# Material Update Rules

Examples:

```text
New Material

Material Property Changes

Thermal Changes

Behavior Changes
```

Mandatory Review:

```text
MATERIAL_PROFILE_SPEC.md

DATA_SCHEMA.md

AI_ENGINE_SPEC.md
```

Impact Evaluation:

```text
Recommendations

Validation

Profiles

Cost Calculations
```

Testing:

```text
Material Validation

Recommendation Validation
```

Possible Documentation Updates:

```text
MATERIAL_PROFILE_SPEC.md

CHANGELOG.md
```

---

# Filament Update Rules

Examples:

```text
New Filament

Filament Property Changes

Manufacturer Updates

Cost Updates
```

Mandatory Review:

```text
FILAMENT_SETTINGS_SPEC.md

DATA_SCHEMA.md

AI_ENGINE_SPEC.md
```

Impact Evaluation:

```text
Recommendations

Profiles

Validation

Cost Estimates
```

Testing:

```text
Filament Validation

Recommendation Validation
```

Possible Documentation Updates:

```text
FILAMENT_SETTINGS_SPEC.md

CHANGELOG.md
```

---

# Preset Update Rules

Examples:

```text
New Preset

Preset Changes

Preset Categories

Preset Configuration Updates
```

Mandatory Review:

```text
PRINT_PRESETS_SPEC.md

PRINT_SETTINGS_SPEC.md

AI_ENGINE_SPEC.md
```

Impact Evaluation:

```text
Recommendations

Preset Selection

Validation Rules
```

Testing:

```text
Preset Validation

Recommendation Validation
```

Possible Documentation Updates:

```text
PRINT_PRESETS_SPEC.md

CHANGELOG.md
```

---

# Repository Update Rules

Examples:

```text
Repository Data Changes

Repository Structure Changes

Repository Synchronization Changes

Repository Source Changes
```

Mandatory Review:

```text
ARCHITECTURE.md

API_SPEC.md

UPDATE_GOVERNANCE_PROTOCOL.md
```

Impact Evaluation:

```text
Storage

Validation

Synchronization

Profiles
```

Testing:

```text
Repository Validation

Integration Testing

Synchronization Testing
```

---

# Schema Update Rules

Examples:

```text
Schema Structure Changes

Field Changes

Validation Changes

Contract Changes
```

Mandatory Review:

```text
DATA_SCHEMA.md

API_SPEC.md

ARCHITECTURE.md

AI_ENGINE_SPEC.md
```

Impact Evaluation:

```text
Storage

Repositories

Validation

Profiles

Recommendations

API Contracts
```

Mandatory Documentation Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
Schema Validation

Integration Testing

Regression Testing
```

Risk:

```text
High

or

Critical
```

---

# API Update Rules

Examples:

```text
Contract Changes

Payload Changes

Response Changes

Endpoint Changes
```

Mandatory Review:

```text
API_SPEC.md

DATA_SCHEMA.md

ARCHITECTURE.md
```

Impact Evaluation:

```text
IPC

Services

Repositories

Validation
```

Mandatory Documentation Evaluation:

```text
CHANGELOG.md
```

Testing:

```text
API Validation

Integration Testing

Regression Testing
```

---

# Compatibility Update Rules

Examples:

```text
Supported Versions

Supported Printers

Supported Materials

Supported Formats
```

Mandatory Review:

```text
API_SPEC.md

DATA_SCHEMA.md

Relevant Specifications
```

Impact Evaluation:

```text
Existing Profiles

Existing Projects

Existing Recommendations

Existing Workflows
```

Testing:

```text
Compatibility Validation

Regression Testing
```

---

# Security Update Rules

Examples:

```text
Validation Requirements

Repository Protection

Import Protection

External Data Protection
```

Mandatory Review:

```text
SECURITY_SPEC.md

ARCHITECTURE.md

API_SPEC.md
```

Impact Evaluation:

```text
Risk Reduction

Compatibility

Validation

External Data Handling
```

Testing:

```text
Security Validation

Regression Testing
```

Risk:

```text
Critical
```

---

# Dependency Impact Analysis

Every update requires review of:

```text
Direct Dependencies

Indirect Dependencies

Document Dependencies

Domain Dependencies

Module Dependencies
```

References:

```text
CROSS_DOCUMENT_DEPENDENCIES.md

DOMAINS_DEPENDENCY_MATRIX.md

DOMAIN_BOUNDARIES.md
```

---

# Documentation Impact Analysis

Every update requires verification of:

```text
Required Updates

Conditional Updates

Review Only Documents

No Action Documents
```

Reference:

```text
DOCUMENT_UPDATE_MATRIX.md
```

---

# Ownership Impact Analysis

Before applying updates verify:

```text
File Ownership

Domain Ownership

Responsibility Ownership
```

Reference:

```text
FILE_OWNERSHIP_MATRIX.md
```

---

# Changelog Rules

Always evaluate:

```text
CHANGELOG.md
```

Mandatory evaluation for:

```text
New Printers

New Materials

New Filaments

New Presets

Schema Changes

API Changes

Compatibility Changes

Security Changes
```

---

# Required Update Report

Before approval generate:

```text
UPDATE SUMMARY

Update Type:

Source:

Detected Change:

Risk Level:

Affected Domains:

Affected Files:

Related Files:

Dependencies:

Required Reviews:

Required Documentation Updates:

Required Testing:

Compatibility Impact:

Recommendation:
```

Implementation must not begin before this report exists.

---

# Automatic Update Rule

The following are prohibited:

```text
Automatic Schema Changes

Automatic API Changes

Automatic Documentation Changes

Automatic Architecture Changes

Automatic Repository Migrations
```

Human approval is required.

---

# Stop Rules

Stop implementation immediately if:

```text
Update Source Unknown

Ownership Unknown

Dependencies Unknown

Impact Unknown

Risk Unknown

Compatibility Unknown
```

Continue analysis before proceeding.

---

# Final Verification Checklist

Before applying any update verify:

```text
Update Identified

Impact Analyzed

Dependencies Reviewed

Ownership Verified

Documentation Reviewed

Risk Evaluated

Compatibility Evaluated

Testing Defined

Human Approval Received
```

All items must be complete.

---

# Golden Rule

External updates must be analyzed before they are implemented.

Never apply an update simply because it exists.

Apply only updates that are understood, reviewed, validated, and approved.
