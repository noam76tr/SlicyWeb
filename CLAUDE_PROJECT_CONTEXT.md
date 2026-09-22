# SLICYWEB SMART SLICER

# CLAUDE PROJECT CONTEXT

Version: 2.0.0

Status: Approved

Priority: High

---

# Project Overview

Project Name:

SlicyWeb Smart Slicer

Project Type:

AI-Assisted 3D Printing Preparation Software

Purpose:

Provide intelligent model analysis, print preparation, recommendations, optimization, and project management for 3D printing workflows.

The application focuses on:

- Visualization
- Analysis
- Recommendations
- Optimization
- Print Preparation

Initial versions do not generate G-Code.

---

# Core Objectives

The system must:

- Import STL files
- Import 3MF files
- Open WYPROJ projects
- Save WYPROJ projects
- Analyze 3D models
- Recommend print settings
- Detect print risks
- Estimate print time
- Estimate print cost
- Optimize orientation
- Manage printer profiles
- Manage material profiles
- Assist users in obtaining reliable print results

---

# Supported Formats

Import Formats:

- STL
- 3MF
- WYPROJ

Native Project Format:

- WYPROJ

Extension:

- .wyproj

Internal Storage Format:

- JSON

Project files must remain versioned and backward compatible.

---

# Project Persistence

The application uses WYPROJ as its native project format.

Project files:

- Must be versioned
- Must remain backward compatible whenever possible
- Must remain language-neutral
- Must use JSON as the internal storage structure

Project persistence includes:

- Scene Data
- Object Data
- Printer Selection
- Material Selection
- Filament Selection
- Presets
- Analysis Results
- Recommendations
- User Settings
- Metadata

Project persistence is handled through:

- ProjectManager
- ProjectSerializer
- ProjectDeserializer
- ProjectValidator
- WYPROJImporter
- WYPROJExporter

All project loading and saving operations must pass through the project layer.

Direct manipulation of WYPROJ files outside the project layer is discouraged.

---

# File Processing Pipeline

File routing must be determined by file extension.

STL files:

- Use STL import pipeline

3MF files:

- Use 3MF import pipeline

After loading:

All imported geometry must be converted into a single neutral internal geometry model.

All calculations must operate exclusively on the neutral model.

This includes:

- Geometry Analysis
- Orientation Analysis
- Support Analysis
- Classification
- Recommendation Generation

---

# Technology Stack

Frontend:

- React
- TypeScript

Desktop Framework:

- Electron

3D Engine:

- Three.js

State Management:

- Zustand

---

# Architecture

Application Flow:

GUI
↓
Application
↓
Service
↓
Repository
↓
RepositorySync
↓
Remote Source

Repository access must remain centralized.

Direct repository access from GUI is prohibited.

Business logic must never be implemented inside GUI components.


---

# Core Domains

The project is divided into domains.

Main Domains:

- GUI
- Viewport
- Application
- State Management
- Import
- Scene
- Analysis
- Classification
- Recommendation
- Optimization
- Profiles
- Presets
- Validation
- API
- IPC
- Repository
- RepositorySync
- Storage
- Notification
- Cost Estimation
- Project Management
- Internationalization
- Security
- Testing

Each domain owns specific responsibilities.

Responsibilities must not overlap unnecessarily.

---

# State Architecture

The application follows a Single Source Of Truth architecture.

State management responsibilities belong to:

- Zustand State Stores

GUI components must not mutate state directly.

Services are responsible for controlled state modifications.

State consistency must be preserved across all modules.

---

# Major Engines

Classification Engine

Responsible For:

- Object Detection
- Object Classification
- Category Assignment
- Confidence Scoring

---

Recommendation Engine

Responsible For:

- Recommendation Generation
- Parameter Selection
- Preset Recommendation
- User Assistance

---

Optimization Engine

Responsible For:

- Orientation Optimization
- Support Reduction
- Material Reduction
- Print Time Reduction

---

Validation Engine

Responsible For:

- Schema Validation
- Recommendation Validation
- Compatibility Validation

---

Notification System

Responsible For:

- Information Notifications
- Warning Notifications
- Critical Notifications

---

# User Interface Principles

The interface should follow professional CAD and slicer software practices.

Main areas:

- Top Toolbar
- Central 3D Workspace
- Hardware Configuration Panel
- Status Bar

The workspace should support:

- Grid View
- Printer Bed Visualization
- Axis Visualization
- Camera Controls
- Object Transformations

---

# Internationalization

Multilanguage support is mandatory.

Initial languages:

- English
- French
- Hebrew

Additional languages may be added later.

Requirements:

- No hardcoded GUI text
- No hardcoded menu labels
- No hardcoded error messages
- No hardcoded user-facing content

All interface text must be loaded through localization dictionaries.

Examples:

- en.json
- fr.json
- he.json

Managed By:

- LanguageManager
- LocalizationService
- TranslationLoader

The architecture must remain language-independent.

WYPROJ project files must remain language-neutral.

Changing application language must never modify project data.

---

# Hardware Profile System

All hardware definitions must be externalized.

Do not hardcode:

- Printer Limits
- Material Limits
- Filament Limits
- Firmware Limits
- Motion Limits
- Temperature Limits

Profiles must be stored in JSON.

Examples:

- Printers
- Materials
- Filaments
- Presets

Profile files should include version information.

Example:

version: "1.0"

---

# Validation Philosophy

Validation is mandatory.

Validate:

- Imported Files
- Profiles
- Schemas
- API Payloads
- Repository Data
- User Input
- External Data

External data must never be trusted automatically.

---

# AI Recommendation System

The recommendation engine is:

- Rule Based
- Deterministic
- Reproducible

Recommendations are based only on:

- Printer Profiles
- Material Profiles
- Filament Profiles
- Object Geometry
- Object Classification
- Analysis Results

The AI must never invent:

- Printer capabilities
- Material properties
- Filament properties
- Recommendations not supported by available data

Unknown values must remain unknown.

---

# Print Analysis Principles

The system should analyze:

- Dimensions
- Volume
- Surface Area
- Stability
- Overhangs
- Bridges
- Thin Walls
- Unsupported Regions

The system should identify:

- Best Print Orientation
- Support Requirements
- Stability Risks
- Warping Risks

---

# Development Principles

The project follows:

- Documentation First
- Impact Analysis First
- Patch First
- Compatibility First
- Domain Ownership
- Dependency Governance
- Architecture Protection
- Source Of Truth

Preferred workflow:

Analyze
↓
Verify Ownership
↓
Verify Dependencies
↓
Perform Impact Analysis
↓
Modify
↓
Validate
↓
Update Documentation
↓
Verify Consistency

Large rewrites are prohibited unless explicitly approved.

---

# Governance Principles

Documentation is the Source Of Truth.

Implementation must follow documentation.

Every modification requires:

- Ownership Verification
- Dependency Verification
- Impact Analysis
- Documentation Review
- Compatibility Verification

Governance rules are mandatory.


---

# Update Philosophy

External updates include:

- Printers
- Materials
- Filaments
- Presets
- Repositories
- External Sources

External updates must follow:

Detect
↓
Analyze
↓
Dependency Review
↓
Impact Analysis
↓
Update Report
↓
Human Approval
↓
Apply
↓
Validate
↓
Document

Automatic modifications are prohibited.

Human approval is required before implementation.

---

# Bug Investigation Philosophy

The objective is not only to fix bugs.

The objective is to understand why they occurred.

Every bug investigation should determine:

- Root Cause
- Affected Files
- Related Files
- Affected Domains
- Compatibility Risk
- Regression Risk

Root cause identification must occur before proposing a fix.

---

# Project Priorities

Priority Order:

1. Stability
2. Compatibility
3. Reliability
4. Safety
5. Quality
6. Performance
7. New Features

A working feature must never be broken to add a new feature.

---

# Source Of Truth

Highest Authority Documents:

- PROJECT_SPEC.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- DATA_SCHEMA.md
- API_SPEC.md
- SYSTEM_RULES.md
- DEVELOPMENT_RULES.md
- DECISIONS.md

Governance Documents:

- CLAUDE_GOVERNANCE_PROTOCOL.md
- CLAUDE_DOCUMENT_READING_ORDER.md
- CLAUDE_READING_PRIORITY.md
- CLAUDE_FILE_UPDATE_RULES.md
- CLAUDE_CHANGE_IMPACT_RULES.md
- DOCUMENT_UPDATE_RULES.md
- DOCUMENT_UPDATE_MATRIX.md

---

# Project Success Criteria

The project is considered successful when it remains:

- Stable
- Consistent
- Maintainable
- Predictable
- Extensible
- Well Documented
- Backward Compatible

Long-term maintainability has higher value than short-term speed.

---

# Golden Rule

Protect the architecture.

Protect the documentation.

Protect compatibility.

Protect project stability.

Improve the system without increasing risk.
