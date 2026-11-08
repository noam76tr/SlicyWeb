# SlicyWeb Smart Slicer

# TEST PLAN

Version: 2.0.0

Status: Approved

Priority: High

---



# Purpose



This document defines the testing strategy for the SlicyWeb Smart Slicer project.



The objectives are:



- Detect bugs early

- Prevent regressions

- Ensure reliability

- Validate AI recommendations

- Validate calculations

- Validate GUI behavior

- Maintain stability across releases



Testing is mandatory.



No feature is considered complete until it is tested.



---



# Testing Philosophy



The project follows:



```text

Develop



↓



Test



↓



Validate



↓



Release

```



Testing is continuous.



Testing is not optional.



---



# Testing Levels



The project uses:



```text

Unit Testing



Integration Testing



System Testing



End-To-End Testing



Performance Testing



Regression Testing



Security Testing



User Acceptance Testing

```



---



# Test Environment



Supported Platforms



```text

Windows 10



Windows 11



Linux



macOS

```



---



# Display Testing



Resolutions



```text

1280x720



1920x1080



2560x1440



3840x2160

```



---



# Phase Testing Strategy



Every roadmap phase requires:



```text

Unit Tests



Integration Tests



Regression Tests

```



before completion.



---

# Domain Testing Requirements

Every implemented domain must include appropriate tests.

Required domains:

```text
GUI
Electron IPC
Services
Repositories
RepositorySync
Remote Sources
Storage
Cache
Project Management
Internationalization
Import
Scene Management
Analysis
Classification
Recommendation
Optimization
Cost Estimation
Notifications
Recovery
```

Each domain must define:

```text
Unit Tests
Integration Tests
Failure Tests
Validation Tests
Regression Tests
```

A domain must not be considered complete until its required tests pass.

---

# UNIT TESTS



Purpose:



Test individual components.



---



# GUI Unit Tests



Modules



```text

Buttons



Menus



Panels



Dialogs



Layout Components

```



---



# Validation



Verify:



```text

Component Renders



Events Trigger



Props Update



State Updates

```



---



# Renderer Unit Tests



Test:



```text

Camera Manager



Grid Renderer



Selection Renderer



Axis Renderer

```



---



# Import Module Unit Tests



Test:



```text

STL Parsing



3MF Parsing



File Validation



Import Errors

```



---



# Printer Database Unit Tests



Test:



```text

Printer Loading



Printer Validation



Printer Search



Printer Caching

```



---



# Material Database Unit Tests



Test:



```text

Material Loading



Material Validation



Material Search



Material Caching

```


---

# Filament Database Unit Tests

Test:

```text
Filament Loading

Filament Validation

Filament Search

Filament Caching
```

---

# Analysis Engine Unit Tests



Test:



```text

Bounding Box Calculation

Volume Calculation

Surface Calculation

Overhang Detection

Bridge Detection

Thin Wall Detection

Stability Scoring

Object Classification

Confidence Scoring

```

Phase 9 (ADR-034; DATA_SCHEMA.md, Analysis Rules): Object Classification and Confidence Scoring move to Phase 10. The analysis is tested on models built in the tests (no model file), each value with a tolerance:

```text
Cube 20 mm: dimensions 20 x 20 x 20, volume 8000 mm³, area 2400 mm²,
  8 vertices, 12 triangles, contact area 400 mm², center of gravity 0, 0, 0,
  height ratio 1, risk 0, no overhang, no bridge, minimum thickness 20 mm
  (the ray meets neither its own face nor a neighbouring face at its start)
Cube 20 mm rotated and scaled (200 % in X, then +90 degrees around Z):
  dimensions 20 x 40 x 20, volume 16000 mm³
Cube rotated 45 degrees around X: overhang angle 45, percentage 0 (only
  beyond 45 degrees counts); not detected
Tower 20 x 20 x 100 mm: height ratio 5, risk 80 (High)
Sphere: no contact area, risk 100 (Critical)
Stool on four legs: contact area = the four legs only, center of gravity
  inside the hull of the legs, low risk: at most 40 (correction of Noam, D4;
  seat 40 x 40 x 5 mm on four legs of 4 x 4 x 40 mm at its corners: height
  45 mm, hull 40 x 40 mm, height ratio 1.125, risk 3)
Object whose center of gravity is outside its contact hull: risk 100
Two pillars and a slab: 1 bridge, longest span = distance between the pillars
Cantilever (slab with one support): 0 bridges, overhang detected, angle 90
Plate 0.5 mm thick: thin walls detected, minimum thickness 0.5 mm
Mesh not closed (cube without one face): analysis computed, warning ANA_002
Empty mesh: ANA_001, no analysis
Repeatable: the same object analyzed twice gives the same analysis
AnalysisSchema: classification null accepted, a classification object
  accepted (WYPROJ 3.0.0), unknown field refused, values out of range refused
```



---



# Recommendation Engine Unit Tests



Test:



```text

Layer Height Selection

Wall Selection

Infill Selection

Support Generation Rules

Cooling Rules

Retraction Rules

Print Preset Selection

Confidence Calculation

Warning Generation

```

Phase 10 (ADR-035; OBJECT_CLASSIFICATION_SPEC.md 1.2.0, RECOMMENDATION_RULES.md 1.1.0, PRINT_PRESETS_SPEC.md 1.3.0). Models built in the tests (no model file); printers, materials and filaments of data/ (shipped profiles):

```text
Classification (lot 85):
  cube 20 mm: planar; no hole; unknown (confidence 0)
  tower 20 x 20 x 100 mm: tall
  sphere: curved, not hollow; figurine (65)
  small sphere (diameter 20 mm): small and curved; miniature (70)
  open vase (tall cylinder, open top, thin wall, with a bottom): vase (75)
  open box (low, open top): container (70)
  plate with holes: planar and holes; mechanical_part (65)
  closed box (hollow, with a lid): not open_top; not container
  L bracket (thin, hollow, base low and facing up; also mirrored and turned
    on the plate): not open_top; neither container nor vase (Noam,
    2026-11-05)
  open box with three walls only: not open_top; with its four walls:
    open_top
  open vase upside down: not open_top, not vase
  mesh not closed: holes not computed
  repeatable: the same mesh gives the same classification twice
  category chosen by the user: source user, confidence 100, kept after a
    new analysis (rotation, scale), detectedFeatures computed again
  ClassificationValidator called; AnalysisSchema accepts a classification
    without source (read as automatic)

Presets (lot 86):
  the 11 shipped presets are valid (PresetSchema, strict) and have the
    values of Preset Values; a field fanSpeed or a support type organic is
    refused; a file refused does not stop the other presets
  preset:getAll returns the 11 presets (unit test and end-to-end test)

Recommendation (lot 87):
  Ultimaker S5 (maxPrintSpeed and maxTravelSpeed null) + Fast Prototype:
    print speed at most 100 mm/s with VALUE_LIMITED, travel at most
    150 mm/s without warning of its own (test required by Noam; answer C,
    2026-11-05)
  travel lowered by a published maxTravelSpeed: no VALUE_LIMITED (answer A
    of Noam, 2026-11-06); a limit lowering the print speed by less than
    10 %: no VALUE_LIMITED
  printer with maxPrintSpeed published (as 500) + Balanced: print 150 mm/s,
    no VALUE_LIMITED
  printer with maxPrintSpeed 100 + Balanced: 100 mm/s and VALUE_LIMITED
  TPU: print speed at most 30 mm/s, retraction distance divided by two
  layer height: nozzle 0.2 mm gives at most 0.15 mm; always 0.08 to 0.28 mm
  temperatures: Bambu PLA Basic 210 / 40 °C; Prusament PLA nozzle 210
    (published); Polymaker PolyLite PLA bed 40 (middle 42.5); without a
    filament, the middle of the range of the material; capped by the
    printer (TEMPERATURE_UNSUPPORTED when the minimum is above it)
  fan: published by the filament, otherwise PLA 90, PETG 50, ABS 15, ASA 15,
    TPU 40
  retraction: direct drive 0.8 mm 35 mm/s, bowden 5 mm 40 mm/s, unknown
    (Bambu Lab) direct drive values with EXTRUDER_UNKNOWN
  supports: maxAngle 60 no support, 61 supports (type of the preset); bridge
    51 mm supports; Vase preset: no support, VASE_SUPPORTS_IGNORED
  adhesion: brim for risk 41, for ABS and ASA, for a tall object; never raft
  warnings: each code of Recommendation Warnings, one per code, most severe
    first; a critical warning does not stop the recommendation
  confidence: Official printer + material + filament, user category: 100;
    no filament -15; mesh not closed -20; printer and filament of the user
    -10 each; automatic unknown -20
  no printer or no material: REC_002, no recommendation
  RecommendationSchema: temperature required, filamentId null accepted,
    supports {enabled, type}

Interface (lot 88, end-to-end):
  recommendation shown after the import once a printer and a material are
    selected; outdated then generated again after a change of printer;
    object type chosen by the user; "Details" folded by default; Tools >
    Generate Recommendations
  done in lot 88 (tests/e2e/recommendation.spec.ts): before the printer and
    the material, "Select a printer and a material" and Generate disabled;
    a cube of 20 mm: Automatic (Unknown), Balanced, 65/100 (Moderate),
    CLASSIFICATION_UNCERTAIN; Print Preset section and status bar; Details
    folded, then layer height, supports, adhesion; Prototype chosen: Fast
    Prototype, 85/100 (High); Automatic again; Tools > Generate
    Recommendations and Generate; two objects: "Select a single object" and
    "—"

Values with a unit in Hebrew (lot 89):
  unit (NumberFormatter.test.ts): formatQuantity "200 mm/s", "15 %",
    "45°"; several values and a range; in Hebrew only, the value wrapped in
    a left-to-right isolate
  end to end (tests/e2e/units.spec.ts), in Hebrew: build volume, maximum
    print speed, nozzle range of the filament, volume, print speed and
    nozzle temperature of the recommendation, plate size: each value
    isolated, and its number drawn left of its unit (a range: minimum on
    the left)

Performance (lot 92):
  unit (ModelAnalyzer.test.ts): edge table compared with the pairs of
    vertices on random triangles (a vertex in many triangles: sorted
    group); a sphere: every edge shared by two triangles
  unit (Classification.test.ts): the same features with or without the
    edges and the BVH of the analysis; a volume above 35 % of the bounding
    box is never hollow
  comparison (not in the suite): every value of the analysis and every
    feature identical to lot 91 on 9 models, sphere of 998 000 triangles
    included
  manual (Noam): the sphere of 998 000 triangles analyzed in less than 5 s

Mesh defects (lot 91):
  unit (ModelAnalyzer.test.ts): two cubes touching along an edge: closed,
    not manifold, volume exact; an edge with three triangles: open; a cube:
    closed and manifold
  unit (Classification.test.ts): four cubes touching along edges: holes not
    computed, classificationVersion 1.2.2
  end to end (analysis.spec.ts): two cubes touching along an edge: ANA_005
    in the Analysis section, volume 2 cm³, no message over the viewport

Closure of Phase 10 (lot 90):
  unit (Classification.test.ts): on 8 models (sphere, sphere turned, open
    vase, open box, closed box, plate with holes, L bracket, cube turned 45
    degrees), the two bounds frame the exact convex hull volume and
    isHollow gives the same answer as the exact ratio; a ratio close to the
    limit is decided by the exact hull; a flat mesh has no bounds and is
    never hollow
  manual (models of Noam): category and features of each model, duration
    of "Analyzing…" for the largest model (PERFORMANCE_SPEC.md: 1M
    triangles in less than 5 s)

Recommendation service (lot 88, unit, RecommendationService.test.ts):
  generated by itself once the analysis is up to date and a printer and a
    material are selected, the filament optional; started after the change
    is over (mesh not closed read: -20); only the objects analyzed and
    classified; generated again after a new analysis (rule 9), not while it
    is outdated; rule 11: a change of the filament generates again all the
    recommendations, without a printer or a material they stay outdated;
    printer and filament of the user; object type chosen (confidence 100,
    Fast Prototype for Prototype) and Automatic again; REC_002 and REC_001
    kept, not tried again before a change or Generate; error of a removed
    object forgotten; Generate on the given objects only; presets read
    through preset:getAll, a refused response keeps the store
```



---



# Cost Engine Unit Tests



Test:

```text

Time Estimation

Material Estimation

Weight Estimation

Cost Calculation

```



---

# Project Management Unit Tests

Test:

```text
Project Creation
Project Validation
Project Serialization
Project Deserialization
WYPROJ Import
WYPROJ Export
Project Version Validation
Invalid Project Rejection
```

---

# Storage Unit Tests

Test:
```text
Project Save
Project Load
Project Cache Save
Project Cache Load
Invalid Data Rejection
Corrupted Data Handling
Storage Error Handling
```

---

# Recovery Unit Tests

Test:

```text
Auto Save Creation
Auto Save Validation
Recovery File Validation
Session Restoration
Corrupted Recovery Rejection
Safe State Restoration
```

---

# Internationalization Unit Tests

Test:

```text
Language Selection
Translation Loading
Translation Key Resolution
Missing Translation Handling
Invalid Translation File Rejection
Language Persistence
English Translation Loading
French Translation Loading
Hebrew Translation Loading
```

---

# Notification Unit Tests

Test:

```text
Notification Creation
Notification Severity
Warning Generation
Error Notification
Success Notification
Notification Validation
```

---

# INTEGRATION TESTS



Purpose:



Verify communication between modules.



---



# Import To Scene



Process



```text

Import File

↓

Create Object

↓

Add To Scene

↓

Update GUI

```

Must succeed.


---



# Scene To Analysis


Process


```text

Object Imported

↓

Analysis Triggered

↓

Analysis Stored

```

Must succeed.

Phase 9 (ADR-034 D7): the analysis is computed in a Web Worker, validated with AnalysisSchema and stored by objectId; a rotation or a scale makes it outdated, then it is computed again once the gesture is over; an object removed during its computation gets no analysis. End-to-end tests (Playwright, lot 80): import a model, then its analysis is shown in the Analysis section; rotate it, then the analysis is computed again.

---

# Analysis To Recommendation

Process

```text

Analysis Complete

↓

Recommendation Generated

↓

Warnings Generated

```

Must succeed.

---

# Printer To Recommendation

Process

```text

Printer Selected

↓

Settings Updated

↓

Recommendations Updated

```

Must succeed.

---

# Material To Recommendation

Process

```text

Material Changed

↓

Validation Triggered

↓

Recommendations Updated

```

Must succeed.

---

# Filament To Recommendation

Process

```text
Filament Selected

↓

Validation Triggered

↓

Recommendations Updated
```

Must succeed.

---

# Database To Cache


Verify:


```text

Data Loaded

↓

Cached

↓

Reloaded Successfully

```

---

# Electron IPC Integration Tests

Verify:

```text
Renderer Request Reaches IPC
IPC Request Is Validated
IPC Handler Is Registered
IPC Handler Calls Correct Service
Service Response Returns Through IPC
Invalid IPC Payload Is Rejected
IPC Errors Are Handled Safely
```

---

# Service To Repository Integration Tests

Verify:

```text
Service Calls Correct Repository
Repository Returns Validated Data
Invalid Repository Data Is Rejected
Repository Errors Reach The Service
Business Logic Does Not Move Into The Repository
```

---

# RepositorySync Integration Tests

Verify:

```text
Repository Requests Synchronization
RepositorySync Selects The Correct Remote Source
Remote Data Is Downloaded
Remote Data Is Validated
Validated Data Returns To The Repository
Synchronization Failure Is Reported
Cache Is Used When Available
Local Data Is Preferred Before Remote Data
```

---

# Remote Source Integration Tests

Verify:

```text
Remote Source Is Reachable
Remote Source Is Unavailable
Remote Source Times Out
Remote Response Is Invalid
Remote Response Is Incomplete
Remote Response Has An Unsupported Version
Remote Data Is Rejected Safely
```

Required flow:

```text
GUI
↓
IPC
↓
Services
↓
Repositories
├── Local Storage / Cache
└── RepositorySync
    ↓
    Remote Sources
```

Direct GUI access to RepositorySync or Remote Sources must fail validation.

---

# SYSTEM TESTS

Purpose:

Test complete workflows.

---

# Workflow 1

Import STL

---

Expected


```text

Import Successful

Visible On Plate

Selectable

Transformable

```



---


# Workflow 2

Import Multiple Files

---



Expected



```text

Objects Added

No Collision Error

Object List Updated

```


---


# Workflow 3


Select Printer


---


Expected


```text

Build Plate Updated

Printer Information Updated

```

---

# Workflow 4

Select Material

---

Expected

```text
Material Data Loaded

Recommendations Updated
```

---

# Workflow 5

Select Filament

---

Expected

```text
Filament Data Loaded

Recommendations Updated

Confidence Updated
```

---


---



# Workflow 6


Run Full Analysis


---


Expected


```text

Analysis Results Generated

No Crashes

Scores Produced

```


---


# Workflow 7


Generate Recommendations


---


Expected


```text

Printer Safe

Material Safe

Geometry Safe

```


---


# END TO END TESTS



Purpose:



Validate complete user behavior.



---



# E2E Scenario 1


New Project

↓

Import STL

↓

Select Printer

↓

Select Material

↓

Select Filament

↓

Generate Recommendation

↓

Save Project



Must succeed.



---



# E2E Scenario 2


Import Multiple Models

↓

Arrange Models

↓

Analyze

↓

Optimize

↓

Save


Must succeed.



---



# E2E Scenario 3


Load Existing Project

↓

Restore Scene

↓

Restore Settings

↓

Restore Recommendations

↓

Restore Filament Selection

Must succeed.

---

# E2E Scenario 4

Create New Project

↓
Add Multiple Objects

↓
Select Printer

↓
Select Material

↓
Select Filament

↓
Select Print Preset

↓
Run Analysis

↓
Generate Recommendation

↓
Save WYPROJ Project

↓
Close Project

↓
Reload WYPROJ Project

↓
Restore Complete Project State

Must succeed.

---

# E2E Scenario 5

Create Project

↓
Save Project

↓
Modify Scene

↓
Trigger Auto Save

↓
Simulate Application Restart

↓
Start Recovery

↓
Validate Recovery File

↓
Restore Project

Must succeed without data loss.

---

# E2E Scenario 6

Open Invalid WYPROJ File

↓
Validate Project

↓
Reject Invalid Data

↓
Display Localized Error

↓
Preserve Safe Application State

Must succeed without application crash.

---

# PERFORMANCE TESTS



Purpose:



Ensure smooth operation.



---



# Startup Time



Target



```text

< 3 seconds

```



---



# STL Loading



Medium Model



Target



```text

< 2 seconds

```



---



# Large STL



Target



```text

< 10 seconds

```



---



# Scene FPS



Target



```text

60 FPS

```



Minimum



```text

30 FPS

```



---



# Memory Usage



Monitor



```text

Small Scene



Medium Scene



Large Scene

```

---

# RepositorySync Performance Tests

Measure:

```text
Remote Profile Search
Remote Profile Download
Repository Synchronization
Cache Refresh
Remote Failure Recovery
```

Targets:

```text
Profile Search < 500 ms
Repository Synchronization < 10 seconds
Cache Refresh < 5 seconds
```

---

# Project Persistence Performance Tests

Measure:

```text
Project Save
Project Load
Project Serialization
Project Deserialization
Recovery Load
```

Targets:

```text
Project Save < 1 second
Project Load < 3 seconds
Recovery Load < 3 seconds
```

---



# Stress Tests



Purpose:



Determine limits.



---



# High Object Count



Test



```text

10 Objects



50 Objects



100 Objects



200 Objects

```



---



# Large Mesh Tests



Test



```text

100k Triangles



500k Triangles



1M Triangles



5M Triangles

```

Analysis (Phase 9, PERFORMANCE_SPEC.md): 1M triangles analyzed in less than 5 seconds, the interface staying fluid.



---



# REGRESSION TESTS



Purpose:



Ensure new features do not break old features.



---



# Required After



```text

Bug Fix



Feature Addition



Refactor



Version Upgrade

```



---



# Regression Areas



```text

Import



Transformations

Analysis

Recommendations

Saving

Loading

Filaments

Print Presets

Auto Save

Recovery
```



---



# SECURITY TESTS



Purpose:



Validate protection against invalid data.



---



# STL Validation



Test



```text

Valid STL

Corrupted STL

Truncated STL

Malformed STL

```



---



# 3MF Validation


Test


```text

Valid 3MF

Corrupted 3MF

Missing Files

Invalid Metadata

```



---



# Printer Profile Validation



Test



```text

Missing Fields

Invalid Values

Negative Values

Corrupted JSON

```



---



# Material Profile Validation


Test


```text

Missing Temperatures



Invalid Cooling



Invalid Schema

```



---

# Filament Profile Validation

Test

```text
Missing Fields

Invalid Temperatures

Invalid Schema

Corrupted JSON
```

---

# Repository Security


Verify


```text

Invalid Response

Missing Data

Unexpected Data

Corrupted Cache

```

---

# RepositorySync Security Tests

Test:

```text
Invalid Remote Response
Missing Remote Fields
Unexpected Remote Fields
Unsupported Remote Version
Corrupted Remote Data
Untrusted Remote Source
Remote Data Integrity Failure
```

---

# IPC Security Tests

Test:

```text
Invalid IPC Payload
Missing IPC Fields
Invalid IPC Types
Unauthorized IPC Request
Unknown IPC Channel
IPC Handler Failure
Sensitive IPC Data Exposure
```

---

# Project Security Tests

Test:

```text
Corrupted WYPROJ
Invalid WYPROJ Version
Missing Project References
Invalid Scene Data
Broken Profile Links
Corrupted Auto Save
Corrupted Recovery File
```

---

# Internationalization Security Tests

Test:

```text
Invalid Translation File
Missing Translation Key
Unexpected Translation Data
Unsupported Language
Corrupted Language File
```

---



# AI VALIDATION TESTS



Purpose:



Ensure recommendations remain valid.



---



# Printer Limit Test



Verify



```text

Never Exceeds



Maximum Speed



Maximum Temperature



Maximum Acceleration

```



---



# Material Limit Test



Verify



```text

Nozzle Temperature



Bed Temperature



Cooling Limits

```



---



# Geometry Test



Verify



```text

Layer Height Compatibility



Thin Wall Handling



Overhang Handling

```



---



# Confidence Score Test



Verify



```text

Complete Data

High Confidence

Missing Data

Lower Confidence

```

# Classification Test

Verify

```text
Known Object

High Classification Confidence

Unknown Object

Lower Classification Confidence
```

---

---



# Optimization Tests



Purpose:



Verify optimizations improve results.



---



# Orientation Test



Verify



```text

Support Reduction



Improved Stability



Improved Quality

```



---



# Material Usage Test



Verify



```text

Reduced Material



No Reliability Loss

```



---



# Print Time Optimization Test



Verify



```text

Reduced Time



No Safety Violation

```



---



# USER ACCEPTANCE TESTING



Purpose:



Validate real-world usability.



---



# Beginner User Tests



Verify



```text

Import Easily



Find Settings



Generate Recommendations

```



---



# Advanced User Tests



Verify



```text

Modify Settings



Override Recommendations



Export Profiles

```



---



# Professional User Tests



Verify



```text

Consistent Results



Reliable Calculations



Stable Performance

```



---



# TEST REPORT FORMAT



Every test execution must include:



```text

Test ID



Module



Result



Execution Date



Tester



Notes

```



---



# Test Result Types



```text

PASS



FAIL



BLOCKED



SKIPPED

```



---



# Release Criteria



A release may proceed only if:



```text

All Critical Tests Pass

No Critical Bugs

No Data Loss

No Security Issues

No Invalid AI Recommendations

```



---



# Critical Fail Conditions



Release must be blocked if:



```text

Project Corruption



Data Loss



Invalid Recommendations



Import Failure



Crash During Normal Operations

```



---



# Automated Testing Goals



Target Coverage



```text

Unit Tests > 80%



Critical Services > 90%



AI Engine > 90%

```



---



# Manual Testing Requirements



Required Before Release



```text

GUI Review



Import Review



Analysis Review



Recommendation Review



Performance Review

```



---



# Golden Rule



If a feature is not tested, it must be considered unstable.



No exception.



---



# End Of Document

