# SlicyWeb SMART SLICER

# FILE OWNERSHIP MATRIX

Version: 2.0.0

Status: Approved

Priority: Critical

---

# Purpose

This document defines ownership responsibilities for all major project files.

The objective is to:

- Prevent ownership conflicts
- Clarify responsibilities
- Improve impact analysis
- Improve dependency analysis
- Prevent duplicate updates
- Improve maintainability
- Improve documentation consistency

Every file must have a clear owner.

Every modification must respect file ownership.

---

# Ownership Philosophy

Each file must have:

One Primary Owner

A file may have:

Related Domains
Related Documents

But ownership remains unique.

Ownership determines:

- Who controls modifications
- Who validates consistency
- Which dependencies must be reviewed
- Which documents require verification

---

# Ownership Categories

Each file contains:

Primary Owner
Secondary Owners
Related Domains
Purpose
Mandatory Reviews
Update Triggers

Definitions:

Primary Owner: The domain responsible for approving and controlling modifications.
Secondary Owners: Domains that must participate when the file affects their responsibilities.
Related Domains: Domains that consume, implement, or are affected by the file.
Purpose: The responsibility and scope of the file.
Mandatory Reviews: Documents or domains that must be reviewed before modification.
Update Triggers: Changes that require ownership review or documentation updates.

---

# PROJECT_DOCUMENTATION_INDEX.md

Primary Owner: Documentation Domain

Purpose: Documentation Inventory

Mandatory Review When:
- New Document Added
- Document Removed
- Document Renamed
- Document Moved

Related Files:
- SlicyWeb files explication.txt
- AI_START_HERE.md
- CLAUDE_DOCUMENT_READING_ORDER.md

---

# AI_START_HERE.md

Primary Owner: Onboarding Domain

Purpose: Project Entry Point, Development Workflow Guide

Mandatory Review When:
- Reading Order Changes
- New Core Documentation
- Documentation Structure Changes
- Architecture Changes
- Development Process Changes

Related Files:
- PROJECT_DOCUMENTATION_INDEX.md
- AI_DEVELOPMENT_PROTOCOL.md
- CLAUDE_DOCUMENT_READING_ORDER.md
- PHASES_IMPLEMENTATION_PLAN.md

---

# AI_DEVELOPMENT_PROTOCOL.md

Primary Owner: Development Governance Domain

Purpose: AI Development Workflow, Coding Agent Protocols, Documentation Requirements

Mandatory Review When:
- Development Process Changes
- Validation Rules Change
- Patch Rules Change
- Governance Changes

Related Files:
- SYSTEM_RULES.md
- DEVELOPMENT_RULES.md
- CLAUDE_GOVERNANCE_PROTOCOL.md
- AI_START_HERE.md
- CHANGE_VERIFICATION_CHECKLIST.md

---

# PROJECT_SPEC.md

Primary Owner: Project Governance Domain

Purpose: Project Vision, Project Goals, Project Scope, Project Requirements

Mandatory Review When:
- Scope Changes
- Business Requirements Change
- Major Features Change
- Architecture Changes

Related Files:
- ARCHITECTURE.md
- ROADMAP.md
- PROJECT_DESCRIPTION.md
- TECHNICAL_OVERVIEW.md
- IMPORT_EXPORT_SPEC.md
- CLAUDE_PROJECT_CONTEXT.md

---

# PROJECT_DESCRIPTION.md

Primary Owner: Project Governance Domain

Purpose: Project Presentation, External Description, User-Facing Summary

Related Files:
- README.md
- PROJECT_SPEC.md

---

# ROADMAP.md

Primary Owner: Planning Domain

Purpose: Project Phases, Delivery Strategy, Future Features

Related Files:
- PHASES_IMPLEMENTATION_PLAN.md
- PROJECT_SPEC.md
- CHANGELOG.md
- AI_START_HERE.md

---

# PHASES_IMPLEMENTATION_PLAN.md

Primary Owner: Planning Domain

Purpose: Implementation Sequence, Phase Ordering, Development Priorities

Related Files:
- ROADMAP.md
- AI_START_HERE.md
- CHANGELOG.md

---

# CHANGELOG.md

Primary Owner: Release Management Domain

Purpose: Project History, Version Tracking, Change Documentation

Mandatory Review When:
- Architecture Changes
- Schema Changes
- API Changes
- Feature Changes
- Project Structure Changes
- Domain Changes
- Governance Changes

Related Files:
- VERSIONING_POLICY.md
- ARCHITECTURE.md
- DATA_SCHEMA.md
- API_SPEC.md
- TECHNICAL_OVERVIEW.md

---

# DECISIONS.md

Primary Owner: Architecture Governance Domain

Purpose: Architecture Decisions, Technology Choices, Design Rationale

Mandatory Review When:
- Architectural Decisions Change
- Technology Choices Change
- Governance Changes
- Major Design Changes

Related Files:
- ARCHITECTURE.md
- TECH_STACK.md
- TECHNICAL_OVERVIEW.md
- DOMAIN_BOUNDARIES.md

---

# ARCHITECTURE.md

Primary Owner: Architecture Domain

Secondary Owners: Repository Domain, Storage Domain, RepositorySync Domain, Application Domain

Related Domains: Architecture, Application, Repository, RepositorySync, Storage, IPC, API, Profiles, Analysis, Internationalization, Security

Purpose: System Architecture, Architectural Layers, Module Boundaries, Domain Dependencies, Communication Flows, Repository Boundaries, Storage Boundaries, RepositorySync Boundaries, Remote Source Access Rules

Mandatory Review When:
- New Domain Created
- New Layer Added
- New Module Added
- Dependency Changes
- Communication Flow Changes
- Repository Boundary Changes
- Storage Boundary Changes
- RepositorySync Changes
- IPC Flow Changes
- Domain Boundary Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- FILE_STRUCTURE.md
- TECHNICAL_OVERVIEW.md
- IMPORT_EXPORT_SPEC.md
- AI_ENGINE_SPEC.md
- SECURITY_SPEC.md
- TEST_PLAN.md
- DOMAIN_BOUNDARIES.md
- DOMAINS_DEPENDENCY_MATRIX.md
- FILE_OWNERSHIP_MATRIX.md
- CHANGELOG.md

---

# TECHNICAL_OVERVIEW.md

Primary Owner: Architecture Domain

Secondary Owners: Project Governance Domain, Development Governance Domain

Related Domains: Architecture, Application, Repository, RepositorySync, Storage, Profiles, Analysis, Internationalization

Purpose: Technical System Overview, Feature Matrix, Module Relationships, Technical Stack Summary, Architecture Summary, Development Principles, Layer Organization, Module Interactions

Mandatory Review When:
- Architecture Changes
- Module Boundary Changes
- Repository Flow Changes
- Storage Changes
- Cache Changes
- RepositorySync Changes
- Technology Stack Changes
- Major Feature Changes
- Layer Changes
- Internationalization Changes

Related Files:
- ARCHITECTURE.md
- DATA_SCHEMA.md
- API_SPEC.md
- FILE_STRUCTURE.md
- TECH_STACK.md
- IMPORT_EXPORT_SPEC.md
- PROJECT_SPEC.md
- SECURITY_SPEC.md
- TEST_PLAN.md
- DOMAIN_BOUNDARIES.md
- CHANGELOG.md

---

# TECH_STACK.md

Primary Owner: Architecture Domain

Secondary Owners: Infrastructure Domain

Purpose: Technology Choices, Runtime Technologies, Framework Choices, Core Libraries, Build Tools, Testing Tools

Mandatory Review When:
- Technology Stack Changes
- New Library Added
- Library Version Changes
- Build Tool Changes
- Testing Framework Changes

Related Files:
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- DECISIONS.md
- PROJECT_SPEC.md
- CHANGELOG.md

---

# DATA_SCHEMA.md

Primary Owner: Schema Domain

Secondary Owners: API Domain, Validation Domain, Security Domain

Related Domains: Schema, API, IPC, Validation, Security, Repository, RepositorySync, Storage

Purpose: Data Contracts, Schemas, Relationships, Runtime Validation Structures, Error Objects, IPC Payloads, Repository Data, RepositorySync Results, Cache Entries, Remote Source Metadata

Mandatory Review When:
- Schema Changes
- New Models
- Removed Models
- Contract Changes
- IPC Payload Changes
- Repository Data Changes
- RepositorySync Result Changes
- Cache Entry Changes
- Remote Source Metadata Changes
- Error Object Changes

Related Files:
- ARCHITECTURE.md
- API_SPEC.md
- SECURITY_SPEC.md
- AI_ENGINE_SPEC.md
- PRINTER_PROFILE_SPEC.md
- MATERIAL_PROFILE_SPEC.md
- FILAMENT_SETTINGS_SPEC.md
- IMPORT_EXPORT_SPEC.md
- TECHNICAL_OVERVIEW.md
- TEST_PLAN.md
- ERROR_CODES_SPEC.md
- CHANGELOG.md

---

# API_SPEC.md

Primary Owner: API Domain

Secondary Owners: IPC Domain, Validation Domain, Security Domain

Related Domains: API, IPC, Validation, Security, Repository, RepositorySync

Purpose: API Contracts, Endpoints, Payloads, Responses, IPC Contracts, Repository Contracts, RepositorySync Contracts, Cache Contracts, Error Responses, API Validation Rules, API Compatibility Rules, API Versioning Rules

Mandatory Review When:
- API Changes
- New Endpoint
- Modified Endpoint
- Payload Change
- Response Change
- IPC Change
- IPC Contract Changes
- Repository Contract Changes
- RepositorySync Contract Changes
- Cache Contract Changes
- Error Response Changes

Related Files:
- ARCHITECTURE.md
- DATA_SCHEMA.md
- SECURITY_SPEC.md
- ERROR_CODES_SPEC.md
- TECHNICAL_OVERVIEW.md
- AI_ENGINE_SPEC.md
- TEST_PLAN.md
- CHANGELOG.md

---

# ERROR_CODES_SPEC.md

Primary Owner: Error Governance Domain

Secondary Owners: API Domain, Security Domain, Validation Domain, Notification Domain

Related Domains: API, IPC, Validation, Security, Notification, Repository, RepositorySync

Purpose: Error Codes, Warning Codes, Error Severity, Error Classification, Error Naming, Error Messaging

Mandatory Review When:
- New Error Code
- Error Severity Change
- IPC Error Change
- API Error Change
- Repository Error Change
- Remote Synchronization Error Change
- Security Error Change
- Error Message Change

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- SECURITY_SPEC.md
- NOTIFICATION_DOMAIN
- IPC_SPEC (if exists)
- CHANGELOG.md

---

# FILE_STRUCTURE.md

Primary Owner: Structure Domain

Secondary Owners: Project Management Domain

Purpose: Project Organization, Folder Structure, File Organization, Module Locations, Repository Locations, Schema Locations, Storage Locations, Electron Locations, Documentation Locations

Mandatory Review When:
- Files Added
- Files Removed
- Directories Added
- Directories Removed
- Structure Changes
- Module Relocation
- Documentation Relocation

Related Files:
- DIRECTORY_PURPOSES.md
- PROJECT_DOCUMENTATION_INDEX.md
- SlicyWeb files explication.txt
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- FILE_OWNERSHIP_MATRIX.md
- CHANGELOG.md

---

# DIRECTORY_PURPOSES.md

Primary Owner: Structure Domain

Secondary Owners: Project Management Domain

Purpose: Directory Responsibilities, Folder Purposes, Module Organization, File Organization Rules

Mandatory Review When:
- Directory Purpose Changes
- New Directory Created
- Directory Removed
- Organizational Changes
- Module Structure Changes

Related Files:
- FILE_STRUCTURE.md
- PROJECT_DOCUMENTATION_INDEX.md
- SlicyWeb files explication.txt
- CHANGELOG.md

---

# SlicyWeb files explication.txt

Primary Owner: Documentation Domain

Purpose: File and Directory Explanations, Project Structure Guide, File Purposes

Mandatory Review When:
- New File Added
- New Directory Created
- File Purpose Changes
- Structure Changes

Related Files:
- FILE_STRUCTURE.md
- DIRECTORY_PURPOSES.md
- PROJECT_DOCUMENTATION_INDEX.md

---

# IMPORT_EXPORT_SPEC.md

Primary Owner: Import Export Domain

Secondary Owners: Project Management Domain, Repository Domain

Related Domains: Import, Export, Storage, Project Management, Repository, RepositorySync

Purpose: Import Specifications, Export Specifications, Format Handling, File Validation, Project Serialization, Project Deserialization

Mandatory Review When:
- Import Format Changes
- Export Format Changes
- File Validation Changes
- Project Structure Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- PROJECT_SPEC.md
- TECHNICAL_OVERVIEW.md
- SECURITY_SPEC.md
- CHANGELOG.md

---

# USER_SETTINGS_SPEC.md

Primary Owner: User Settings Domain

Secondary Owners: GUI Domain, Storage Domain

Related Domains: User Settings, GUI, Storage, Internationalization

Purpose: User Settings, Application Preferences, User Configuration, Localization Preferences, Theme Settings

Mandatory Review When:
- New Setting Added
- Setting Removed
- Setting Default Changes
- Configuration Schema Changes

Related Files:
- GUI_SPEC.md
- CLAUDE_PROJECT_CONTEXT.md
- DATA_SCHEMA.md
- INTERNATIONALIZATION_DOMAIN
- CHANGELOG.md

---

# PRINTER_PROFILE_SPEC.md

Primary Owner: Profiles Domain

Secondary Owners: Repository Domain, RepositorySync Domain

Related Domains: Profiles, Repository, RepositorySync, Analysis, Recommendation, Optimization

Purpose: Printer Profile Specifications, Hardware Profiles, Printer Configuration, Firmware Handling

Mandatory Review When:
- Printer Profile Schema Changes
- New Printer Type Added
- Firmware Support Changes
- Profile Structure Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- AI_ENGINE_SPEC.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# MATERIAL_PROFILE_SPEC.md

Primary Owner: Profiles Domain

Secondary Owners: Repository Domain, RepositorySync Domain

Related Domains: Profiles, Repository, RepositorySync, Analysis, Recommendation, Optimization

Purpose: Material Profile Specifications, Material Properties, Thermal Specifications, Material Behavior

Mandatory Review When:
- Material Profile Schema Changes
- New Material Type Added
- Property Changes
- Profile Structure Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- AI_ENGINE_SPEC.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# FILAMENT_SETTINGS_SPEC.md

Primary Owner: Profiles Domain

Secondary Owners: Repository Domain, RepositorySync Domain

Related Domains: Profiles, Repository, RepositorySync, Analysis, Recommendation, Cost Estimation

Purpose: Filament Settings, Filament Properties, Manufacturer Settings, Cost Specifications, Color Tracking

Mandatory Review When:
- Filament Settings Schema Changes
- New Filament Type Added
- Cost Information Changes
- Settings Structure Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- AI_ENGINE_SPEC.md
- RECOMMENDATION_RULES.md
- COST_ESTIMATION_DOMAIN
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# PRINT_PRESETS_SPEC.md

Primary Owner: Presets Domain

Secondary Owners: Recommendation Domain

Related Domains: Presets, Recommendation, Analysis, Profiles, Optimization

Purpose: Print Preset Definitions, Preset Templates, Quality Objectives, Print Categories

Mandatory Review When:
- Preset Schema Changes
- New Preset Type Added
- Preset Structure Changes
- Quality Objective Changes

Related Files:
- DATA_SCHEMA.md
- AI_ENGINE_SPEC.md
- PRINT_SETTINGS_SPEC.md
- API_SPEC.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# PRINT_SETTINGS_SPEC.md

Primary Owner: Recommendation Domain

Secondary Owners: Presets Domain, Analysis Domain

Related Domains: Recommendation, Presets, Analysis, Profiles, Optimization

Purpose: Print Settings, Printing Parameters, Speed Settings, Quality Settings, Layer Settings, Cooling Settings

Mandatory Review When:
- Print Setting Schema Changes
- New Setting Type Added
- Recommendation Logic Changes
- Setting Structure Changes

Related Files:
- DATA_SCHEMA.md
- AI_ENGINE_SPEC.md
- PRINT_PRESETS_SPEC.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# RECOMMENDATION_RULES.md

Primary Owner: Recommendation Domain

Secondary Owners: Analysis Domain, Classification Domain

Related Domains: Recommendation, Analysis, Classification, Profiles, Presets, Optimization

Purpose: Recommendation Logic, Decision Rules, Setting Recommendations, Support Strategies, Warning Generation

Mandatory Review When:
- Recommendation Logic Changes
- New Recommendation Rule Added
- Rule Removed
- Classification Changes
- Analysis Changes

Related Files:
- AI_ENGINE_SPEC.md
- DATA_SCHEMA.md
- PRINT_SETTINGS_SPEC.md
- PRINT_PRESETS_SPEC.md
- OBJECT_CLASSIFICATION_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# OBJECT_CLASSIFICATION_SPEC.md

Primary Owner: Classification Domain

Secondary Owners: Analysis Domain

Related Domains: Classification, Analysis, Recommendation, Profiles

Purpose: Object Classification, Category Detection, Feature Detection, Confidence Scoring

Mandatory Review When:
- Classification Logic Changes
- New Category Added
- Category Removed
- Feature Detection Changes
- Confidence Scoring Changes

Related Files:
- AI_ENGINE_SPEC.md
- DATA_SCHEMA.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# SUPPORT_GENERATION_SPEC.md

Primary Owner: Recommendation Domain

Secondary Owners: Analysis Domain

Related Domains: Recommendation, Analysis, Profiles, Optimization

Purpose: Support Generation Logic, Support Strategies, Support Optimization, Tree Support vs Grid Support

Mandatory Review When:
- Support Strategy Changes
- New Support Type Added
- Optimization Changes
- Support Logic Changes

Related Files:
- AI_ENGINE_SPEC.md
- RECOMMENDATION_RULES.md
- PRINT_SETTINGS_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# AI_ENGINE_SPEC.md

Primary Owner: AI Engine Domain

Secondary Owners: Analysis Domain, Classification Domain, Recommendation Domain, Optimization Domain

Related Domains: AI Engine, Analysis, Classification, Recommendation, Optimization, Profiles, Presets, Validation

Purpose: AI Behavior, Decision Logic, Optimization Logic, Validation Logic, Rule-Based Decision System

Mandatory Review When:
- AI Logic Changes
- New Decision Rule Added
- Optimization Algorithm Changes
- Validation Rules Change
- Confidence Scoring Changes

Related Files:
- DATA_SCHEMA.md
- ARCHITECTURE.md
- API_SPEC.md
- RECOMMENDATION_RULES.md
- OBJECT_CLASSIFICATION_SPEC.md
- SUPPORT_GENERATION_SPEC.md
- PRINT_SETTINGS_SPEC.md
- PRINT_PRESETS_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# GUI_SPEC.md

Primary Owner: GUI Domain

Secondary Owners: Application Domain, State Management Domain

Related Domains: GUI, Viewport, Application, State Management, Notification, Internationalization

Purpose: GUI Layout, User Interface, Menu Structure, Panel Organization, Dialog Specifications

Mandatory Review When:
- Layout Changes
- Menu Structure Changes
- Panel Organization Changes
- Dialog Specifications Change
- Navigation Changes

Related Files:
- ARCHITECTURE.md
- API_SPEC.md
- DATA_SCHEMA.md
- FILE_STRUCTURE.md
- TECHNICAL_OVERVIEW.md
- USER_SETTINGS_SPEC.md
- INTERNATIONALIZATION_DOMAIN
- CHANGELOG.md

---

# TEST_PLAN.md

Primary Owner: Testing Domain

Secondary Owners: Development Governance Domain

Related Domains: Testing, Architecture, Validation, Security, Repository, RepositorySync

Purpose: Testing Strategy, Unit Testing, Integration Testing, End-to-End Testing, Validation Testing, Regression Testing, Security Testing

Mandatory Review When:
- Testing Strategy Changes
- New Test Category Added
- Coverage Requirements Change
- Test Methodology Changes
- Security Test Requirements Change

Related Files:
- ARCHITECTURE.md
- DATA_SCHEMA.md
- API_SPEC.md
- SECURITY_SPEC.md
- FILE_STRUCTURE.md
- DOMAIN_BOUNDARIES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# SECURITY_SPEC.md

Primary Owner: Security Domain

Secondary Owners: Validation Domain, Repository Domain

Related Domains: Security, Validation, Repository, RepositorySync, API, IPC, Storage

Purpose: Security Rules, Input Validation, External Data Validation, Remote Source Trust Rules, Sensitive Data Protection, Error Exposure Rules

Mandatory Review When:
- Security Policy Changes
- Validation Rules Change
- Remote Trust Rules Change
- Data Protection Policy Changes
- Error Handling Changes

Related Files:
- ARCHITECTURE.md
- API_SPEC.md
- DATA_SCHEMA.md
- ERROR_CODES_SPEC.md
- TEST_PLAN.md
- TECHNICAL_OVERVIEW.md
- IMPORT_EXPORT_SPEC.md
- CHANGELOG.md

---

# PERFORMANCE_SPEC.md

Primary Owner: Performance Domain

Secondary Owners: Architecture Domain

Related Domains: Performance, Architecture, Analysis, Repository, Storage

Purpose: Performance Requirements, Optimization Targets, Scalability Goals, Resource Management

Mandatory Review When:
- Performance Requirements Change
- Scalability Goals Change
- Optimization Targets Change
- Resource Constraints Change

Related Files:
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- TEST_PLAN.md
- CHANGELOG.md

---

# DOMAIN_BOUNDARIES.md

Primary Owner: Architecture Domain

Secondary Owners: Development Governance Domain

Related Domains: All Domains

Purpose: Domain Responsibilities, Domain Boundaries, Ownership Clarity, Isolation Rules, Domain Interactions

Mandatory Review When:
- New Domain Created
- Domain Boundary Changes
- Responsibility Changes
- Interaction Rules Change

Related Files:
- ARCHITECTURE.md
- DOMAINS_DEPENDENCY_MATRIX.md
- FILE_OWNERSHIP_MATRIX.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# DOMAINS_DEPENDENCY_MATRIX.md

Primary Owner: Architecture Domain

Secondary Owners: Development Governance Domain

Related Domains: All Domains

Purpose: Domain Dependencies, Allowed Dependencies, Forbidden Dependencies, Circular Dependency Prevention

Mandatory Review When:
- Dependency Changes
- New Domain Dependencies Added
- Forbidden Dependencies Detected
- Circular Dependencies Risk

Related Files:
- DOMAIN_BOUNDARIES.md
- ARCHITECTURE.md
- FILE_OWNERSHIP_MATRIX.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# CROSS_DOCUMENT_DEPENDENCIES.md

Primary Owner: Documentation Governance Domain

Secondary Owners: Development Governance Domain

Related Domains: Documentation, Architecture, Development

Purpose: Cross-Document Relationships, Documentation Dependencies, Update Coordination, Synchronization Rules

Mandatory Review When:
- New Document Added
- Document Relationships Change
- Dependency Structure Changes
- Documentation Governance Changes

Related Files:
- DOCUMENT_UPDATE_MATRIX.md
- DOMAIN_BOUNDARIES.md
- DOMAINS_DEPENDENCY_MATRIX.md
- FILE_OWNERSHIP_MATRIX.md
- CHANGELOG.md

---

# DOCUMENT_UPDATE_MATRIX.md

Primary Owner: Documentation Governance Domain

Secondary Owners: Development Governance Domain

Related Domains: Documentation, Development

Purpose: Document Update Rules, Mandatory Updates, Conditional Updates, Review Requirements

Mandatory Review When:
- Update Rules Change
- Documentation Classification Changes
- Governance Rules Change

Related Files:
- CROSS_DOCUMENT_DEPENDENCIES.md
- CHANGE_VERIFICATION_CHECKLIST.md
- PROJECT_IMPACT_MATRIX.md
- CHANGELOG.md

---

# PROJECT_IMPACT_MATRIX.md

Primary Owner: Development Governance Domain

Secondary Owners: Architecture Domain

Related Domains: Architecture, Development, Governance

Purpose: Change Impact Analysis, Domain Impact, Document Impact, Dependency Impact

Mandatory Review When:
- Architecture Changes
- Major Feature Changes
- Schema Changes
- API Changes
- Project Structure Changes

Related Files:
- ARCHITECTURE.md
- DOMAIN_BOUNDARIES.md
- DOMAINS_DEPENDENCY_MATRIX.md
- CROSS_DOCUMENT_DEPENDENCIES.md
- CHANGE_VERIFICATION_CHECKLIST.md
- CHANGELOG.md

---

# CHANGE_CLASSIFICATION_RULES.md

Primary Owner: Development Governance Domain

Secondary Owners: Architecture Domain

Related Domains: Development, Architecture, Governance

Purpose: Change Classification, Impact Levels, Change Types, Approval Requirements

Mandatory Review When:
- Classification Rules Change
- Approval Requirements Change
- Impact Level Definitions Change

Related Files:
- CHANGE_VERIFICATION_CHECKLIST.md
- PROJECT_IMPACT_MATRIX.md
- DEVELOPMENT_RULES.md
- CHANGELOG.md

---

# CHANGE_VERIFICATION_CHECKLIST.md

Primary Owner: Development Governance Domain

Secondary Owners: Architecture Domain, Quality Domain

Related Domains: Development, Architecture, Quality, Testing

Purpose: Verification Checklist, Change Validation, Quality Gate, Approval Workflow

Mandatory Review When:
- Checklist Items Change
- Verification Requirements Change
- Quality Gate Changes
- Approval Workflow Changes

Related Files:
- CHANGE_CLASSIFICATION_RULES.md
- PROJECT_IMPACT_MATRIX.md
- CROSS_DOCUMENT_DEPENDENCIES.md
- DOCUMENT_UPDATE_MATRIX.md
- TEST_PLAN.md
- CHANGELOG.md

---

# FILE_OWNERSHIP_MATRIX.md

Primary Owner: Development Governance Domain

Secondary Owners: Architecture Domain

Related Domains: Development, Architecture, Governance, Documentation

Purpose: File Ownership, Responsibility Clarity, Ownership Verification, Conflict Prevention

Mandatory Review When:
- New Major File Added
- Ownership Changes
- Domain Boundary Changes
- Related Document Changes

Related Files:
- DOMAIN_BOUNDARIES.md
- DOMAINS_DEPENDENCY_MATRIX.md
- ARCHITECTURE.md
- FILE_STRUCTURE.md
- CHANGELOG.md

---

# SYSTEM_RULES.md

Primary Owner: Governance Domain

Secondary Owners: Development Governance Domain

Related Domains: Governance, Development, Architecture

Purpose: Global Project Rules, Development Standards, Architecture Principles, Quality Standards

Mandatory Review When:
- Rule Changes
- Standard Changes
- Principle Changes
- Quality Requirements Change

Related Files:
- DEVELOPMENT_RULES.md
- AI_DEVELOPMENT_PROTOCOL.md
- CHANGELOG.md

---

# DEVELOPMENT_RULES.md

Primary Owner: Development Governance Domain

Secondary Owners: Governance Domain

Related Domains: Development, Architecture, Governance, Testing

Purpose: Development Methodology, Coding Standards, Testing Requirements, Documentation Standards

Mandatory Review When:
- Methodology Changes
- Coding Standard Changes
- Testing Requirements Change
- Documentation Standards Change

Related Files:
- SYSTEM_RULES.md
- AI_DEVELOPMENT_PROTOCOL.md
- CHANGE_IMPACT_RULES.md
- DOCUMENT_UPDATE_RULES.md
- TEST_PLAN.md
- CHANGELOG.md

---

# CHANGE_IMPACT_RULES.md

Primary Owner: Development Governance Domain

Secondary Owners: Architecture Domain

Related Domains: Development, Architecture, Governance

Purpose: Impact Analysis Rules, Impact Assessment, Dependency Impact, Documentation Impact

Mandatory Review When:
- Impact Rules Change
- Assessment Criteria Change
- Dependency Rules Change

Related Files:
- CHANGE_VERIFICATION_CHECKLIST.md
- PROJECT_IMPACT_MATRIX.md
- DEVELOPMENT_RULES.md
- CHANGELOG.md

---

# DOCUMENT_UPDATE_RULES.md

Primary Owner: Documentation Governance Domain

Secondary Owners: Development Governance Domain

Related Domains: Documentation, Development, Governance

Purpose: Documentation Update Rules, Update Coordination, Consistency Maintenance

Mandatory Review When:
- Update Rules Change
- Documentation Governance Changes
- Coordination Procedures Change

Related Files:
- DOCUMENT_UPDATE_MATRIX.md
- CROSS_DOCUMENT_DEPENDENCIES.md
- DEVELOPMENT_RULES.md
- CHANGELOG.md

---

# INTERNATIONALIZATION_DOMAIN

Primary Owner: Internationalization Domain

Secondary Owners: GUI Domain, Storage Domain

Related Domains: Internationalization, GUI, Storage, Validation

Purpose: Localization Management, Language Management, Translation Loading, Localization Services

Mandatory Review When:
- New Language Added
- Translation Structure Changes
- Localization Logic Changes
- Language Manager Changes
- Localization Service Changes

Related Files:
- GUI_SPEC.md
- DATA_SCHEMA.md
- USER_SETTINGS_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# NOTIFICATION_DOMAIN

Primary Owner: Notification Domain

Secondary Owners: Recommendation Domain, Validation Domain

Related Domains: Notification, Recommendation, Validation, GUI, Security

Purpose: User Notifications, Information Messages, Warning Messages, Critical Messages

Mandatory Review When:
- Notification Types Change
- Message Templates Change
- Notification Logic Changes

Related Files:
- RECOMMENDATION_RULES.md
- SECURITY_SPEC.md
- GUI_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# COST_ESTIMATION_DOMAIN

Primary Owner: Cost Estimation Domain

Secondary Owners: Recommendation Domain, Analysis Domain

Related Domains: Cost Estimation, Recommendation, Analysis, Profiles, Optimization

Purpose: Cost Calculation, Material Cost, Energy Cost, Total Cost, Duration Estimation

Mandatory Review When:
- Cost Calculation Changes
- Energy Model Changes
- Material Cost Model Changes
- Duration Estimation Changes

Related Files:
- PRINT_SETTINGS_SPEC.md
- PRINTER_PROFILE_SPEC.md
- MATERIAL_PROFILE_SPEC.md
- FILAMENT_SETTINGS_SPEC.md
- RECOMMENDATION_RULES.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# PROJECT_MANAGEMENT_DOMAIN

Primary Owner: Project Management Domain

Secondary Owners: Storage Domain, Validation Domain

Related Domains: Project Management, Storage, Validation, Scene, Recovery

Purpose: Project Lifecycle, Project Creation, Project Save, Project Load, Recovery, Autosave

Mandatory Review When:
- Project Format Changes
- Save/Load Logic Changes
- Recovery Mechanism Changes
- Autosave Behavior Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- IMPORT_EXPORT_SPEC.md
- TECHNICAL_OVERVIEW.md
- ARCHITECTURE.md
- CHANGELOG.md

---

# REPOSITORY_DOMAIN

Primary Owner: Repository Domain

Secondary Owners: Storage Domain, RepositorySync Domain, Validation Domain

Related Domains: Repository, Storage, RepositorySync, Validation, Security, API

Purpose: Repository Access, Local Data Coordination, Data Retrieval, Data Persistence Coordination, Repository Contracts

Mandatory Review When:
- Repository Contract Changes
- Data Coordination Logic Changes
- Storage Coordination Changes
- RepositorySync Coordination Changes
- Validation Rules Change

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- SECURITY_SPEC.md
- DOMAIN_BOUNDARIES.md
- CHANGELOG.md

---

# REPOSITORYSYNC_DOMAIN

Primary Owner: RepositorySync Domain

Secondary Owners: Repository Domain, Validation Domain, Security Domain

Related Domains: RepositorySync, Repository, Validation, Security, Storage

Purpose: Validated Remote Synchronization, External Synchronization, Remote Data Retrieval, Remote Response Validation, Data Normalization

Mandatory Review When:
- Remote Synchronization Logic Changes
- Remote Source Access Changes
- Validation Rules Change
- Data Normalization Changes
- Error Handling Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- SECURITY_SPEC.md
- UPDATE_GOVERNANCE_PROTOCOL.md
- DOMAIN_BOUNDARIES.md
- CHANGELOG.md

---

# STORAGE_DOMAIN

Primary Owner: Storage Domain

Secondary Owners: Project Management Domain, Recovery Domain, Validation Domain

Related Domains: Storage, Repository, Project Management, Recovery, Validation

Purpose: Local Persistence, Cache Management, JSON Storage, WYPROJ Persistence, Recovery Data Storage, Cache Storage

Mandatory Review When:
- Storage Format Changes
- Cache Entry Changes
- Cache Expiration Changes
- Project Persistence Changes
- Recovery Changes

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- PROJECT_MANAGEMENT_DOMAIN
- DOMAIN_BOUNDARIES.md
- CHANGELOG.md

---

# VALIDATION_DOMAIN

Primary Owner: Validation Domain

Secondary Owners: Security Domain, API Domain

Related Domains: Validation, Security, API, Repository, RepositorySync, Storage, Profiles, Presets

Purpose: Data Validation, Schema Validation, File Validation, Profile Validation, API Validation, Input Validation

Mandatory Review When:
- Validation Rules Change
- Schema Changes
- Validation Logic Changes
- Input Requirements Change

Related Files:
- DATA_SCHEMA.md
- API_SPEC.md
- SECURITY_SPEC.md
- PRINTER_PROFILE_SPEC.md
- MATERIAL_PROFILE_SPEC.md
- FILAMENT_SETTINGS_SPEC.md
- PRINT_PRESETS_SPEC.md
- PRINT_SETTINGS_SPEC.md
- TECHNICAL_OVERVIEW.md
- CHANGELOG.md

---

# IPC_DOMAIN

Primary Owner: IPC Domain

Secondary Owners: API Domain, Service Domain

Related Domains: IPC, API, Service, Validation, Security

Purpose: Electron Communication, Renderer Communication, Main Process Communication, IPC Request Validation, IPC Response Validation

Mandatory Review When:
- IPC Contract Changes
- Communication Flow Changes
- Request Validation Changes
- Response Handling Changes
- Error Propagation Changes

Related Files:
- API_SPEC.md
- DATA_SCHEMA.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- SECURITY_SPEC.md
- DOMAIN_BOUNDARIES.md
- CHANGELOG.md

---

# VERSIONING_POLICY.md

Primary Owner: Release Management Domain

Secondary Owners: Planning Domain

Purpose: Version Strategy, Version Numbering, Release Procedure, Compatibility Rules

Mandatory Review When:
- Version Strategy Changes
- Compatibility Rules Change
- Release Procedures Change

Related Files:
- CHANGELOG.md
- CONTRIBUTING.md

---

# CLAUDE_DOCUMENT_READING_ORDER.md

Primary Owner: Onboarding Domain

Secondary Owners: Documentation Governance Domain

Purpose: Document Reading Sequence, Onboarding Path, Context Building Order

Related Files:
- AI_START_HERE.md
- PROJECT_DOCUMENTATION_INDEX.md
- CLAUDE_PROJECT_CONTEXT.md

---

# CLAUDE_PROJECT_CONTEXT.md

Primary Owner: Onboarding Domain

Secondary Owners: Project Governance Domain

Purpose: Project Context, AI Context, Project Constraints, Domain Context

Mandatory Review When:
- Architecture Changes
- Domain Boundary Changes
- Project Scope Changes
- Major Feature Changes

Related Files:
- PROJECT_SPEC.md
- ARCHITECTURE.md
- TECHNICAL_OVERVIEW.md
- DOMAIN_BOUNDARIES.md
- AI_START_HERE.md
- CLAUDE_DOCUMENT_READING_ORDER.md
- CHANGELOG.md

---

# CLAUDE_GOVERNANCE_PROTOCOL.md

Primary Owner: Development Governance Domain

Purpose: Claude AI Governance, AI Development Standards, Coding Agent Standards

Related Files:
- AI_DEVELOPMENT_PROTOCOL.md
- SYSTEM_RULES.md
- DEVELOPMENT_RULES.md

---

# README.md

Primary Owner: Project Governance Domain

Secondary Owners: Documentation Governance Domain

Purpose: Project Overview, Getting Started, Installation Guide, User Guide

Mandatory Review When:
- Major Feature Added
- Installation Process Changes
- Getting Started Changes
- Major Architecture Changes

Related Files:
- PROJECT_DESCRIPTION.md
- PROJECT_SPEC.md

---

# CONTRIBUTING.md

Primary Owner: Development Governance Domain

Secondary Owners: Governance Domain

Purpose: Contribution Guidelines, Development Workflow, Submission Process

Related Files:
- DEVELOPMENT_RULES.md
- VERSIONING_POLICY.md

---

# UPDATE_GOVERNANCE_PROTOCOL.md

Primary Owner: Development Governance Domain

Secondary Owners: Release Management Domain

Purpose: Update Procedures, Sync Procedures, Repository Update Rules, Remote Source Handling

Mandatory Review When:
- Update Procedures Change
- Synchronization Rules Change
- Repository Handling Changes
- Remote Source Management Changes

Related Files:
- ARCHITECTURE.md
- REPOSITORYSYNC_DOMAIN
- CHANGELOG.md

---

# Ownership Verification Rule

Before modifying any file:

Verify:
- Primary Owner
- Secondary Owners
- Related Files
- Mandatory Review When

Contact file owner before making changes.

Review all related files.

Update all mandatory review documents.

---

# Cross-Ownership Rule

When a file affects multiple domains:

Verify all Secondary Owners.

Notify all related domains.

Obtain all required reviews.

---

# Golden Rule

Clear ownership prevents conflicts.

Unclear ownership creates problems.

When in doubt, contact the Primary Owner.

---
