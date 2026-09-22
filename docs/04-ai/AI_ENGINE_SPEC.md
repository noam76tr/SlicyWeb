# AI SMART SLICER

# AI ENGINE SPECIFICATION

Version: 1.0.0

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

&#x20; "brand": "",

&#x20; "model": "",

&#x20; "buildVolume": {},

&#x20; "motion": {},

&#x20; "thermal": {}

}

```



---



## Material



```json

{

&#x20; "name": "",

&#x20; "temperature": {},

&#x20; "cooling": {},

&#x20; "physical": {}

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

&#x20; "geometry": {},

&#x20; "overhangs": {},

&#x20; "bridges": {},

&#x20; "stability": {},

&#x20; "thinWalls": {},

&#x20; "classification": {}

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



\---



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



\---



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


\---


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


\---


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



\---



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



\# Validation Outcome



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

