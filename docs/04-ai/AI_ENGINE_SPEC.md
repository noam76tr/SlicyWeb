# SlicyWeb Smart Slicer

# AI ENGINE SPECIFICATION

Version: 1.1.0

Status: Approved

Priority: Critical



---



# Purpose



This document defines the complete behavior of the AI Recommendation Engine.

The engine is responsible for transforming:



```text

Printer Profile
+
Material Profile
+
Model Analysis
+
User Constraints
+
Filament Profile
+
Print Preset
+
Object Classification

```


into:


```text

Recommended Print Settings

Warnings

Optimizations

Printability Score

Confidence Score

```


---


# Primary Objectives

The AI engine must:



- Increase print success rate

- Reduce user configuration effort

- Detect potential failures

- Recommend optimal settings

- Respect printer limits

- Respect material limits

- Respect geometry constraints


The engine does not replace the user.

The engine assists the user.



---



# AI System Overview


```text

Model Import

↓

Geometry Analysis

↓

Printer Analysis

↓

Material Analysis

↓

Risk Analysis

↓

Recommendation Generation

↓

Validation

↓

Optimization

↓

Final Recommendation

```


---


# AI Engine Layers



```text

Layer 1
Data Collection

↓

Layer 2
Model Understanding

↓

Layer 3
Risk Detection

↓

Layer 4
Decision Engine

↓

Layer 5
Validation Engine

↓

Layer 6
Optimization Engine

↓

Layer 7
Final Output

```


---


# Layer 1

# Data Collection



Collect information from:



```text

Printer

Material

Filament

Print Preset

Scene

User Preferences

Model Analysis

```


---


# Required Inputs


## Printer


```json

{

 "brand": "",

 "model": "",

 "buildVolume": {},

 "motion": {},

 "thermal": {}

}

```



---



## Material



```json

{

 "name": "",

 "temperature": {},

 "cooling": {},

 "physical": {}

}

```



---


## Filament

```json
{
  "brand": "",
  "name": "",
  "material": "",
  "color": "",
  "diameter": 1.75,
  "recommendedProfile": {}
}
```

---

## Model



```json

{

 "geometry": {},

 "overhangs": {},

 "bridges": {},

 "stability": {},

 "thinWalls": {},

 "classification": {}

}

```



---



# Layer 2

# Model Understanding


The AI must classify the imported object.

Classification Engine Components:

- CategoryDetector
- ConfidenceScorer
- ClassificationValidator

source: src/classification_engine/

---


# Supported Categories



```text

Miniature

Mechanical Part

Gear

Bracket

Tool

Prototype

Decorative Object

Container

Vase

Figurine

Articulated Model

Enclosure

Structural Component

Unknown

```



---



# Classification Goals



Determine:



```text

Required Strength

Required Appearance

Required Accuracy

Required Support Strategy

```



---



# Example


Gear

Results:

```text

Strength: High

Accuracy: High

Support Priority: Medium

```



---



# Layer 3

# Risk Detection

The engine evaluates risks before recommendations.



---



# Risk Categories


## Stability Risk


Factors:


```text

Base Area

Height Ratio

Center Of Gravity

```



---



## Support Risk



Factors:


```text

Overhang Quantity

Overhang Angle

Bridge Length

```



---



## Warping Risk



Factors:



```text

Material

Object Dimensions

Contact Area

```



---



## Failure Risk



Factors:


```text

Thin Walls

Extremely Small Features

Unsupported Structures

```



---



## Collision Risk



Factors:



```text

Multi Object Distance

Object Placement

```



---



# Risk Score System



Each category receives:



```text

0 - 100

```



Where:


```text

0 = none


100 = critical

```



---



# Risk Levels


```text

0 - 20      Very Low

21 - 40     Low

41 - 60     Moderate

61 - 80     High

81 - 100    Critical

```



---



# Layer 4

# Decision Engine


The Decision Engine creates settings.

Recommendation Engine Components:

- RecommendationEngine
- DecisionEngine
- ValidationEngine
- WarningEngine
- RecommendationBuilder
  
---



# Priority System



The engine always follows:



```text

1 Reliability

2 Print Success

3 Mechanical Strength

4 Surface Quality

5 Print Time

6 Material Savings

```



---



# Decision Inputs



```text

Printer

Material

Filament

Print Preset

Model

Risk Analysis

Classification

```

---


# Decision Outputs


```text

Layer Height
Supports

Cooling

Retraction

Speed

Infill

Walls

Adhesion

Print Preset

Orientation Recommendation

Confidence Score

```


---


# Layer Height Logic


Decision Factors:


```text

Nozzle Size

Detail Level

Feature Size

Target Quality

```

---


# Example Rules


```text

Fine Details

↓

0.08 - 0.12 mm

```


---


```text

Balanced Quality

↓

0.16 - 0.20 mm

```


---


```text

Large Mechanical Parts

↓

0.20 - 0.28 mm

```


---


# Wall Count Logic

Decision Factors:


```text

Mechanical Load

Thin Structure

Expected Stress

```

---


# Example


Decorative Object


```text

2 Walls

```


---


Mechanical Part


```text

4-6 Walls

```


---

# Top/Bottom Layers Logic



Increase when:



```text

High Strength Required

Large Flat Surfaces

```



---



# Infill Decision Logic



---



## Decorative



```text

5%-15%

```



---



## Functional



```text

15%-40%

```



---



## Structural



```text

40%-100%

```



---



# Infill Pattern Selection



---



## General Purpose



```text

Gyroid

```



---



## Speed



```text

Lightning

```



---



## Strength



```text

Cubic

```



---



## Rigidity



```text

Honeycomb

```



---



# Support Decision Engine



Generate supports only when justified.



---



# Support Evaluation



Inputs:



```text

Overhang Angle



Bridge Length



Material Capability

```



---



# Support Types



```text

Organic

Tree

Standard

```



---


# Selection Rules


Figurines:


```text

Organic

```


---


Mechanical Parts:



```text

Standard

```


---



Complex Organic Shapes:


```text

Tree

```



---



# Adhesion Decision Engine



---



# Conditions



Small Contact Area

↓

Brim



---



Very Difficult Object

↓

Raft



---



Stable Object

↓

None or Skirt



---



# Cooling Decision Engine



Inputs:



```text

Material Type

Bridge Count

Feature Size

```



---



# Example



PLA


```text

80% - 100%

```


---


ABS


```text

0% - 30%

```


---


TPU


```text

20% - 60%

```


---



# Retraction Decision Engine


Inputs:


```text

Extruder Type

Material

Travel Distance

```



---



# Example



Direct Drive


```text

Short Retraction

```


---



Bowden


```text

Longer Retraction

```


---



# Speed Decision Engine


Inputs:


```text

Printer Capability

Object Complexity

Material

```



---



# Speed Reduction Rules



Reduce speed when:



```text

High Detail

Thin Walls

Tall Objects

Bridge Heavy Models

```



---



# Layer 5

# Validation Engine


Validates recommendations.

# Validation Schemas

Used Schemas:

- PrinterSchema
- MaterialSchema
- FilamentSchema
- PrintPresetSchema
- AnalysisSchema
- RecommendationSchema

---


# Validation Categories


```text

Printer Limits

Material Limits

Geometry Limits

Filament Limits

```



---



# Printer Validation



Verify:



```text

Speed

Acceleration

Temperature

Build Volume

```



---



# Material Validation



Verify:



```text

Nozzle Temperature

Bed Temperature

Cooling Limits

Retraction Limits

```



---



# Geometry Validation



Verify:


```text

Wall Thickness

Layer Height

Nozzle Compatibility

```



---



# Validation Outcome



```text

Valid

Corrected

Rejected

```



---



# Layer 6

# Optimization Engine


Improve recommendations:

Optimization Components

- OptimizationEngine
- OrientationOptimizer
- MaterialOptimizer
- SpeedOptimizer
- SupportOptimizer

Phase 11 (1.1.0, ADR-036 D1, D8): the orientation only. OptimizationEngine and OrientationOptimizer search the best orientation (Rules Of Version 1.1.0 below); SupportOptimizer, SpeedOptimizer and MaterialOptimizer are removed: the supports are reduced by the orientation, measured before and after; the time, the material and the preset are optimized in Phase 15, after the estimation of Phase 12.

---


# Optimization Goals


```text

Reduce Supports

Reduce Print Time

Reduce Material

Increase Reliability

Increase Quality

```


---


# Orientation Optimizer


Tests multiple orientations.

Example:

```text

0°

15°

30°

45°

60°

90°

```


---

# Support Optimizer

Goals:

- Reduce support volume
- Improve support accessibility
- Reduce post-processing effort

Inputs:

- Overhang Analysis
- Bridge Analysis
- Classification
- Material Capabilities

---

# Orientation Score


```text

0 - 100

```



---



# Evaluation Factors



```text

Support Volume

Stability

Finish Quality

Print Duration

```


---



# Recommended Orientation



Highest Score wins.


---



# Rules Of Version 1.1.0 (Phase 11)

DECISIONS.md, ADR-036 (decisions D1 to D8 of Noam, 2026-11-09; analysis of lot 94).

The rules of this section give the numbers of the orientation search of Phase 11. They replace the example of angles of the Orientation Optimizer (0°, 15°… 90°) and give the method and the weights of the Orientation Score. Every value is deterministic: the same object, as placed, always gives the same result. Where a factor cannot be measured (finish quality), it is not used.

---

## Orientation Candidates

ADR-036 D2. The object is laid on one of its flat sides (as "Lay on face" in Bambu Studio and OrcaSlicer).

```text
Frame: the object as placed now (scale and rotation applied, DATA_SCHEMA.md,
  Analysis Rules), along the axes of the build plate

Directions tried, in this order:
  1. the 6 directions of the axes: bottom (-Z, the current orientation),
     top (+Z), left (-X), right (+X), front (-Y), back (+Y)
  2. the faces of the convex hull of the vertices whose area is at least
     1 % of the area of the hull, the largest first, the 50 largest at most
     (outward normal of the face); faces whose normals differ by less than
     1 degree count as one face (their areas added)
  a direction closer than 1 degree to a direction already listed is not
  tried again

Turn of a candidate:
  the smallest turn, around the center of the object and the axes of the
  plate, that brings the direction down (-Z): the turn around the vertical
  axis stays the closest to the current one
  top (+Z): half turn around the X axis of the plate
  the new rotation is turn · R (Transform Schema); position X and Y do not
  change; the object is placed back on the plate (Transform Rules)

Not tried: a turn around the vertical axis alone (it changes neither the
  supports nor the stability); a tilted orientation that does not lie on a
  face of the hull
```

The convex hull of the candidates is described in PERFORMANCE_SPEC.md 1.4.0 (Optimization Performance).

---

## Orientation Score

ADR-036 D3. Each candidate, and the current orientation, is measured with the definitions of the analysis (DATA_SCHEMA.md, Analysis Rules: overhangs, stability, dimensions), then:

```text
Orientation Score = 100 - S - T - H, rounded to the nearest whole number,
  0 to 100

S, supports (at most 60):
  30 when the recommendation would enable the supports: overhangs.maxAngle
     above 60 degrees (RECOMMENDATION_RULES.md 1.1.0, Supports And
     Adhesion); a bridge is a region beyond 80 degrees, so the rule of the
     bridge longer than 50 mm never adds anything and is not computed
  + overhangs.percentage x 2, at most 30

T, stability (at most 30):
  stability.riskScore x 0.3

H, height (at most 10):
  height / largest of width, depth and height of the oriented object x 10
  (fewer layers; the only part of the time that can be seen before
  Phase 12)

Examples:
  cube of 20 mm on a face: 100 - 0 - 0 - 10 = 90
  tower 20 x 20 x 100 mm standing: risk 80, 100 - 0 - 24 - 10 = 66;
    lying: 100 - 0 - 0 - 2 = 98

Not measured in Phase 11 (no measure defined, nothing invented):
  finish quality (stair steps, visible face underneath)
  volume of the supports (the analysis gives an area)
  time and material (Phase 12; their optimization in Phase 15)
```

---

## Reliability Rules

ADR-036 D3; RECOMMENDATION_RULES.md, Optimization Rules ("Reliability Not Reduced").

```text
A candidate is never chosen when:
  its center of gravity is outside its contact hull (riskScore 100)
  it does not fit in the build volume of the selected printer: width > x,
    depth > y or height > z (the same test as OBJECT_TOO_LARGE); without a
    printer, no test
  its riskScore is above 60 (above "moderate") while the riskScore of the
    current orientation is at most 60

Choice:
  the best Orientation Score among the candidates left
  equal scores: the smallest turn, then the order of the candidates
  applied only when it gains at least 5 points on the current
    orientation; otherwise the current orientation is the best ("The
    current orientation is already the best")
  the current orientation is always measured, never excluded
```

---

## Optimization Notifications

ADR-036 D6: no automatic suggestion in Phase 11. The information "Optimization available" (Notification Rules) is not generated: the search runs only at the request of the user (GUI_SPEC.md, Tools Menu). The result of each object is shown over the viewport after the search (GUI_SPEC.md, Error Handling UI).

---



# Printability Score


Global score.

Range:


```text

0 - 100

```



---



# Score Meaning



```text

90 - 100 Excellent

75 - 89 Good

60 - 74 Acceptable

40 - 59 Risky

0 - 39 Poor

```



---



# Confidence Score



Represents recommendation confidence.



Based on:


```text

Known Printer

Known Material

Complete Analysis

Validated Database

```



---



# Confidence Range



```text

0 - 100

```



---

# Notification System

The AI engine may generate:

- Information notifications
- Warning notifications
- Critical notifications

Notification severity follows DATA_SCHEMA.md.

---

# Notification Rules

Notifications must only be generated when useful to the user.

Avoid notification spam.

Priority Order:

1 Critical
2 Warning
3 Information

Rules:

Critical
- Print impossible
- Safety issue
- Hardware limitation

Warning
- High failure probability
- Support required
- Material risk

Information
- Optimization available
- Better preset available
- Optional recommendation

Notification severity must follow DATA_SCHEMA.md.

---

# Warning Engine



Creates warnings automatically.


---



# Warning Types



```text

Critical

Warning

Information

```



---



# Examples



```text

Object Exceeds Build Volume

```



---



```text

High Warp Risk

```



---



```text

Support Required

```



---



```text

Tall Object Stability Risk

```



---



```text

Thin Wall Detected

```



---



# Recommendation Output Structure


```json

{
  "recommendation": {},
  "analysis": {},
  "classification": {},
  "optimization": {},
  "warnings": [],
  "confidenceScore": 95
}

```


---


# Future Machine Learning System

Reserved For Future Versions.

Potential Features:


```text

Print Failure Prediction

Automatic Error Detection

Community Data Learning

Printer Learning

Material Learning

Vision Classification Learning

Filament Performance Learning

Community Recommendation Learning
```


---


# AI Learning Rules


Current Version:


```text

Rule Based Only

```


No autonomous learning.

No recommendation generation without validation.


---


# Safety Rules


Never recommend values exceeding:


```text

Printer Limits

Material Limits

```


Always prefer:


```text

Reliability

Over Speed

```


Always produce warnings when uncertainty exists.


---


# Golden Rule


The AI should maximize the probability of a successful print, not the probability of generating aggressive settings.


---


# End Of Document
