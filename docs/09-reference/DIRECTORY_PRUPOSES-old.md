# WICHY
# DIRECTORY PURPOSES

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the purpose and responsibility of every directory used within the Wichy project.

The objective is to ensure:

- Consistent project organization
- Clear responsibilities
- Easier onboarding
- Improved maintainability
- Predictable file placement

Every file should be placed in the directory that matches its responsibility.

---

# Project Root

```text
SlicyWeb/
```

Purpose:

```text
Project Root Directory
```

Contains:

```text
Project Configuration

Documentation

Source Code

Assets

Tests

Runtime Resources
```

---

# docs/

Purpose:

```text
Project Documentation
```

Contains:

```text
Specifications

Architecture

Rules

Roadmaps

Guides
```

---

# docs/00-index/

Purpose:

```text
Documentation Entry Point
```

Contains:

```text
Documentation Index

AI Reading Guide
```

---

# docs/01-project/

Purpose:

```text
Project Definition
```

Contains:

```text
Vision

Scope

Roadmap

Planning

Change History
```

---

# docs/02-architecture/

Purpose:

```text
System Design
```

Contains:

```text
Architecture

Schemas

Tech Stack

File Structure

API Definitions
```

---

# docs/03-development/

Purpose:

```text
Development Standards
```

Contains:

```text
Workflows

Rules

Error Definitions

Settings Specifications
```

---

# docs/04-ai/

Purpose:

```text
Artificial Intelligence Specifications
```

Contains:

```text
Analysis Logic

Recommendations

Classification

Presets

Support Generation
```

---

# docs/05-profiles/

Purpose:

```text
Profile Definitions
```

Contains:

```text
Printer Profiles

Material Profiles

Filament Profiles
```

---

# docs/06-quality/

Purpose:

```text
Quality Assurance
```

Contains:

```text
Testing

Security

Performance
```

---

# docs/07-future/

Purpose:

```text
Future Systems
```

Contains:

```text
G-Code Specifications

Plugin System

Future Extensions
```

---

# docs/08-user-interface/

Purpose:

```text
User Interface Specifications
```

Contains:

```text
Layouts

Panels

Menus

User Experience Definitions
```

---

# docs/09-reference/

Purpose:

```text
Project Reference Material
```

Contains:

```text
Glossary

Terminology

Naming Rules

Acronyms

Versioning Policies

Architecture Decisions

Directory Definitions
```

---

# src/

Purpose:

```text
Application Source Code
```

Contains:

```text
Business Logic

User Interface

Data Processing

Application Systems
```

---

# src/app/

Purpose:

```text
Application Bootstrap Layer
```

Contains:

```text
Startup Logic

Shutdown Logic

Application Initialization

Dependency Management
```

---

# src/gui/

Purpose:

```text
User Interface Layer
```

Contains:

```text
Layouts

Panels

Dialogs

Menus

Components

Themes
```

---

# src/renderer/

Purpose:

```text
3D Rendering System
```

Contains:

```text
Scene Rendering

Viewport Rendering

Camera Management

Lighting Management
```

---

# src/scene/

Purpose:

```text
Scene Management
```

Contains:

```text
Workspace Data

Scene Validation

Scene Serialization
```

---

# src/object_manager/

Purpose:

```text
Model Management
```

Contains:

```text
Object Creation

Object Storage

Duplication

Validation
```

---

# src/transform/

Purpose:

```text
Transformation Tools
```

Contains:

```text
Move

Rotate

Scale

Transform Validation
```

---

# src/importer/

Purpose:

```text
Model Import System
```

Contains:

```text
STL Import

3MF Import

Import Validation
```

---

# src/printer_database/

Purpose:

```text
Printer Management System
```

Contains:

```text
Printer Loading

Printer Validation

Printer Storage

Printer Repositories
```

---

# src/material_database/

Purpose:

```text
Material Management System
```

Contains:

```text
Material Profiles

Validation

Repositories
```

---

# src/filament_database/

Purpose:

```text
Filament Management System
```

Contains:

```text
Filament Profiles

Manufacturer Data

Validation

Repositories
```

---

# src/model_analysis/

Purpose:

```text
Geometry Analysis Engine
```

Contains:

```text
Mesh Analysis

Printability Analysis

Stability Analysis

Geometry Evaluation
```

---

# src/classification_engine/

Purpose:

```text
Object Classification System
```

Contains:

```text
Object Categories

Classification Rules

Confidence Scoring

Classification Validation
```

---

# src/recommendation_engine/

Purpose:

```text
Recommendation Generation
```

Contains:

```text
Decision Rules

Validation

Warnings

Recommendations
```

---

# src/preset_engine/

Purpose:

```text
Print Preset Management
```

Contains:

```text
Preset Selection

Preset Validation

Preset Recommendations

Preset Storage
```

---

# src/optimization_engine/

Purpose:

```text
Print Optimization
```

Contains:

```text
Orientation Optimization

Support Optimization

Time Optimization

Material Optimization
```

---

# src/cost_engine/

Purpose:

```text
Cost Computation
```

Contains:

```text
Material Cost

Energy Cost

Time Estimation

Total Cost
```

---

# src/repositories/

Purpose:

```text
Data Access Layer
```

Contains:

```text
Repository Implementations

Storage Access Logic
```

---

# src/storage/

Purpose:

```text
Persistence Layer
```

Contains:

```text
Local Storage

File Storage

Future Database Integrations
```

---

# src/recovery/

Purpose:

```text
Project Recovery System
```

Contains:

```text
Auto Save

Recovery Files

Session Restoration

Recovery Validation
```

---

# src/services/

Purpose:

```text
Shared Application Services
```

Contains:

```text
Reusable Business Logic

Cross Module Operations
```

---

# src/events/

Purpose:

```text
Application Event System
```

Contains:

```text
Event Dispatching

Subscriptions

Notifications
```

---

# src/state/

Purpose:

```text
Application State Management
```

Contains:

```text
Global State

Stores

Session State
```

---

# src/config/

Purpose:

```text
Configuration Management
```

Contains:

```text
Application Configuration

Feature Flags

Environment Settings
```

---

# src/constants/

Purpose:

```text
Global Constants
```

Contains:

```text
Default Values

Limits

Shared Constants
```

---

# src/schemas/

Purpose:

```text
Runtime Validation Schemas
```

Contains:

```text
Zod Schemas

Validation Definitions

Data Models
```

---

# src/utils/

Purpose:

```text
Utility Functions
```

Contains:

```text
Helpers

Converters

Reusable Utilities
```

---

# src/types/

Purpose:

```text
Shared Type Definitions
```

Contains:

```text
TypeScript Types

Interfaces

Enums
```

---

# data/

Purpose:

```text
Project Data Repository
```

Contains:

```text
Profiles

Materials

Filaments

Presets

Repositories
```

---

# data/printers/

Purpose:

```text
Printer Profile Storage
```

Contains:

```text
Printer Definitions

Manufacturer Profiles
```

---

# data/materials/

Purpose:

```text
Material Profile Storage
```

Contains:

```text
PLA

PETG

ABS

ASA

TPU

And Other Materials
```

---

# data/filaments/

Purpose:

```text
Filament Profile Storage
```

Contains:

```text
Manufacturer-Specific Filaments
```

---

# data/presets/

Purpose:

```text
Print Preset Storage
```

Contains:

```text
Draft

Balanced

Quality

Mechanical

Miniature

Custom Presets
```

---

# tests/

Purpose:

```text
Quality Validation
```

Contains:

```text
Unit Tests

Integration Tests

Regression Tests

E2E Tests
```

---

# assets/

Purpose:

```text
Project Visual Resources
```

Contains:

```text
Icons

Images

Logos

Themes
```

---

# cache/

Purpose:

```text
Temporary Runtime Data
```

Contains:

```text
Downloaded Profiles

Analysis Cache

Repositories Cache
```

---

# logs/

Purpose:

```text
Application Diagnostics
```

Contains:

```text
Application Logs

Error Logs

Diagnostic Information
```

---

# scripts/

Purpose:

```text
Automation Tools
```

Contains:

```text
Setup Scripts

Migration Scripts

Release Scripts
```

---

# plugins/

Purpose:

```text
Plugin Management
```

Contains:

```text
Installed Plugins

Disabled Plugins

Plugin Cache
```

---

# public/

Purpose:

```text
Public Resources
```

Contains:

```text
Fonts

Icons

Localization Files

Static Resources
```

---

# releases/

Purpose:

```text
Release Artifacts
```

Contains:

```text
Alpha Releases

Beta Releases

Release Candidates

Stable Builds
```

---

# .github/

Purpose:

```text
GitHub Configuration
```

Contains:

```text
Workflows

Automation

CI/CD Configuration
```

---

# .github/workflows/

Purpose:

```text
Automation Pipeline
```

Contains:

```text
Build Validation

Testing

Linting

Release Automation
```

---

# Golden Rule

Every file should have a single clear responsibility and should be stored in the directory that best matches that responsibility.

If a file does not clearly belong to a directory, the project structure should be reviewed before creating the file.

---

# End Of Document
