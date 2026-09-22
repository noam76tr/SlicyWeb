\# AI SMART SLICER

\# RECOMMENDATION RULES

Version: 1.0.0

Status: Approved

Priority: High



\---



\# Purpose



This document defines the rule-based recommendation system used by the AI Engine.



This is the decision layer that transforms:



```text

Printer

\+

Material

\+

Filament

\+

Model Analysis

\+

User Constraints

```



into:



```text

Recommended Print Profile

```



The system is deterministic.



Given the same inputs, the same recommendations must always be generated.



\---



\# Recommendation Philosophy



Priority Order:



```text

1\. Print Success



2\. Reliability



3\. Mechanical Strength



4\. Surface Quality



5\. Print Duration



6\. Material Savings

```



The engine must never sacrifice reliability for speed.



\---



\# Recommendation Pipeline



```text

Collect Inputs



↓



Validate Inputs



↓



Classify Model



↓



Evaluate Risks



↓



Generate Settings



↓



Validate Settings



↓



Optimize Settings



↓



Generate Output

```



\---



\# Required Inputs



\## Printer



```text

Printer Profile

```



\---



## Material

Material Profile

---

## Filament

Filament Profile

---

## Print Preset

Print Preset

---


\## Model Analysis



```text

Dimensions



Volume



Overhangs



Bridges



Thin Walls



Stability



Classification

```



\---



\# Object Classification Rules



The engine attempts to classify the object.



\---



\## Figurine



Indicators:



```text

High Detail



Organic Shape



Many Curves



Many Small Features

```



Priority:



```text

Surface Quality

```



\---



\## Mechanical Part



Indicators:



```text

Flat Surfaces



Precise Features



Holes



Functional Geometry

```



Priority:



```text

Strength



Accuracy

```



\---



\## Gear



Indicators:



```text

Teeth



Circular Geometry



Repeated Profile

```



Priority:



```text

Precision



Strength

```



\---



\## Vase



Indicators:



```text

Thin Wall



Single Shell



Large Vertical Surfaces

```



Priority:



```text

Surface Finish

```



\---



\## Structural Part



Indicators:



```text

Large Mass



Load Bearing Shape

```



Priority:



```text

Strength

```



\---

---

# Print Preset Selection Rules

## Draft

Recommended For:

```text
Rapid Prototypes
Large Simple Objects
Low Detail Models
```

---

## Balanced

Recommended For:

```text
General Purpose Models
Functional Parts
Mixed Use Objects
```

---

## Quality

Recommended For:

```text
Miniatures
Figurines
Decorative Models
High Detail Objects
```

---

## Strength

Recommended For:

```text
Mechanical Parts
Structural Components
Load Bearing Objects
```

\# Layer Height Rules



\---



\## High Detail Objects



Examples:



```text

Miniatures



Figurines



Decorative Models

```



Recommended:



```text

0.08

0.10

0.12

```



\---



\## Standard Objects



Recommended:



```text

0.16

0.20

```



\---



\## Large Objects



Recommended:



```text

0.24

0.28

```



\---



\# Nozzle Compatibility Rule



Maximum Layer Height



```text

Nozzle × 75%

```



Example:



```text

0.4 nozzle



↓



Maximum 0.30 layer

```



\---



\# Wall Count Rules



\---



\## Decorative Models



```text

2 - 3 Walls

```



\---



\## Functional Parts



```text

4 - 5 Walls

```



\---



\## Structural Parts



```text

5 - 8 Walls

```



\---



\## Thin Wall Warning



If model wall thickness:



```text

< nozzle width

```



Generate Warning.



\---



\# Top And Bottom Layers Rules



\---



\## Decorative



```text

4 - 5 Layers

```



\---



\## Functional



```text

5 - 7 Layers

```



\---



\## Structural



```text

6 - 10 Layers

```



\---



\# Infill Rules



\---



\## Decorative



```text

5% - 15%

```



Pattern:



```text

Lightning



Gyroid

```



\---



\## Standard



```text

15% - 25%

```



Pattern:



```text

Gyroid

```



\---



\## Mechanical



```text

25% - 50%

```



Pattern:



```text

Cubic

```



\---



\## Structural



```text

50% - 100%

```



Pattern:



```text

Cubic



Honeycomb

```



\---



\# Material-Specific Rules



\---



\# PLA



Profile:



```text

Easy Material

```



Nozzle:



```text

190 - 220°C

```



Bed:



```text

50 - 65°C

```



Fan:



```text

80 - 100%

```



Default Speed:



```text

60 - 150 mm/s

```



\---



\# PLA+



Nozzle:



```text

200 - 230°C

```



Fan:



```text

70 - 100%

```



Supports:



```text

Normal Rules

```



\---



\# PETG



Nozzle:



```text

220 - 260°C

```



Fan:



```text

30 - 70%

```



Rules:



```text

Reduce Excessive Cooling



Increase Retraction Validation

```



\---



\# ABS



Nozzle:



```text

230 - 270°C

```



Fan:



```text

0 - 30%

```



Rules:



```text

Require Heated Bed



Recommend Enclosure

```



\---



\# ASA



Rules:



```text

Recommend Enclosure



Reduce Fan



Increase Warp Monitoring

```



\---



\# TPU



Rules:



```text

Reduce Speed



Reduce Retraction



Prefer Direct Drive

```



Speed:



```text

20 - 60 mm/s

```



\---



\# Nylon



Rules:



```text

Drying Required



Enclosure Recommended



Warp Monitoring Enabled

```



\---



\# Carbon Fiber Materials



Rules:



```text

Require Hardened Nozzle

```



Generate Warning if:



```text

Brass Nozzle Detected

```



\---



\# Support Generation Rules



\---



\## Support Not Required



When:



```text

Overhang Below Threshold



Bridge Acceptable



Stable Geometry

```



\---



\## Support Required



When:



```text

Large Unsupported Areas



Critical Overhangs



Bridge Failure Risk

```



\---



\# Overhang Rules



\---



\## Safe



```text

0° - 45°

```



\---



\## Moderate



```text

46° - 60°

```



\---



\## High Risk



```text

61° - 90°

```



Support evaluation required.



\---



\# Support Type Selection



\---



\## Organic



Recommended:



```text

Figurines



Characters



Organic Assets

```



\---



\## Tree



Recommended:



```text

Complex Shapes



Decorative Models

```



\---



\## Standard



Recommended:



```text

Mechanical Parts



Functional Geometry

```



\---



\# Adhesion Rules



\---



\## Skirt



Default.



\---



\## Brim



Use When:



```text

Small Footprint



Tall Object



Warp Risk

```



\---



\## Raft



Use When:



```text

Critical Adhesion Risk



Very Difficult Materials

```



\---



\# Stability Rules



Evaluate:



```text

Object Height



Base Surface



Center Of Gravity

```



\---



\## Stable



```text

Wide Base



Low Height

```



\---



\## Medium Risk



Generate Advisory.



\---



\## High Risk



Recommend:



```text

Brim



Orientation Change

```



\---



\# Speed Rules



\---



\## High Detail



Reduce Speed.



\---



\## Thin Walls



Reduce Speed.



\---



\## Tall Objects



Reduce Speed.



\---



\## Large Flat Parts



Reduce Acceleration.



\---



\# Cooling Rules



\---



\# PLA



```text

80 - 100%

```



\---



\# PETG



```text

30 - 70%

```



\---



\# ABS



```text

0 - 30%

```



\---



\# ASA



```text

0 - 30%

```



\---



\# TPU



```text

20 - 60%

```



\---



\# Retraction Rules



\---



\# Direct Drive



Preferred:



```text

0.5 - 2 mm

```



\---



\# Bowden



Preferred:



```text

3 - 8 mm

```



\---



\# Bridge Rules



If bridge length increases:



```text

Increase Cooling



Reduce Bridge Speed

```



\---



\# Warp Risk Rules



Risk Factors:



```text

ABS



ASA



Nylon



Large Flat Surface



Small Contact Area

```



\---



\## High Warp Risk



Recommend:



```text

Brim



Enclosure



Higher Bed Temperature

```



\---



\# Confidence Rules



Confidence increases when:



```text

Verified Printer

Verified Material

Verified Filament

Complete Analysis

```


\---


\# Confidence Reduction


Unknown Printer


↓


\-30


\---


Unknown Material


↓


\-30

\---

Unknown Filament

↓

-15


\---


Incomplete Analysis


↓


\-20


\---


\# Confidence Scale


```text

90-100

Excellent



75-89

High



60-74

Moderate



40-59

Low



0-39

Very Low

```



\---



\# Recommendation Validation



Before output:



Verify:



```text

Printer Limits



Material Limits



Geometry Limits

```



\---



\# Auto Correction Rules



If recommendation exceeds limits:



```text

Correct Automatically

```



\---



Example:



```text

Recommended Speed



↓



Exceeds Printer



↓



Clamp To Printer Maximum

```



\---



\# Warning Rules



Critical Warning:



```text

Cannot Print

```



Examples:



```text

Object Too Large



Temperature Unsupported



Material Not Supported

```



\---



\# Warning



Examples:



```text

Warp Risk



Support Required



Tall Object

```



\---



\# Information



Examples:



```text

Suggestion



Optimization Opportunity



Alternative Orientation

```



\---



\# Optimization Rules



Only perform optimization if:



```text

Reliability Not Reduced

```



\---



Optimization Priorities:



```text

Support Reduction



Time Reduction



Material Reduction

```



\---



\# Learning Rules



Version 1.x



```text

No Self Learning

```



Only deterministic rules.



\---



\# Future Rules



Reserved For:



```text

Machine Learning

Print History Analysis

Community Optimization

Failure Prediction

Vision Classification

Filament Performance Learning

Community Recommendation Learning

```



\---



\# Golden Rule



A successful print is always more important than an aggressive recommendation.



\---



\# End Of Document

