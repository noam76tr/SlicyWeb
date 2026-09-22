\# AI SMART SLICER

\# MATERIAL PROFILE SPECIFICATION



Version: 1.0.0



Status: Approved


Priority: High

---



\# Purpose



This document defines the complete structure of material profiles used by the AI Smart Slicer.



All material profiles must follow this specification.



The profile must provide sufficient information for:



\- AI Recommendations

\- Risk Analysis

\- Cost Calculations

\- Thermal Validation

\- Speed Validation

\- Cooling Validation

\- Printability Analysis



\---



\# Objectives



A material profile must describe:



\- Thermal behavior

\- Mechanical characteristics

\- Printing requirements

\- Cooling requirements

\- Drying requirements

\- Warping characteristics

\- Compatibility constraints



The AI engine must use this data to generate safe and reliable recommendations.



\---



\# Material Categories



Supported Categories



```text

PLA



PLA+



PETG



ABS



ASA



TPU



TPE



PCTG



PC



Nylon



Nylon CF



PET CF



PLA CF



PP



HIPS



PVA



Engineering Material



Custom

```



\---



\# Profile Structure



```json

{
  &#x20;"metadata": {},
  &#x20;"thermal": {},
  &#x20;"cooling": {},
  &#x20;"mechanical": {},
  &#x20;"physical": {},
  &#x20;"printing": {},
  &#x20;"drying": {},
  &#x20;"behavior": {},
  &#x20;"compatibility": {},
  &#x20;"cost": {},
  &#x20;"riskFactors": {}
}


```



\---



\# Metadata Section

Purpose:

Identify material.

\---

\## Schema

```json

{

&#x20; "id": "",

&#x20; "name": "",

&#x20; "brand": "",

&#x20; "category": "",

&#x20; "manufacturer": "",

&#x20; "color": "",

&#x20; "verified": true,

&#x20; "profileVersion": "1.0.0"

}

```


\---


\# Example


```json

{

&#x20; "id": "pla\_generic",

&#x20; "name": "PLA",

&#x20; "brand": "Generic",

&#x20; "category": "PLA"

}

```



\---



\# Thermal Properties



Defines heating requirements.



\---



\## Schema



```json

{

&#x20; "thermal": {

&#x20;   "minNozzleTemp": 190,

&#x20;   "maxNozzleTemp": 220,

&#x20;   "recommendedNozzleTemp": 210,



&#x20;   "minBedTemp": 50,

&#x20;   "maxBedTemp": 65,

&#x20;   "recommendedBedTemp": 60

&#x20; }

}

```



\---



\# Validation



Required:



```text

Nozzle Temperature



Bed Temperature

```



\---



\# Cooling Profile



Determines cooling behavior.



\---



\## Schema



```json

{

&#x20; "cooling": {

&#x20;   "minFan": 80,

&#x20;   "maxFan": 100,

&#x20;   "recommendedFan": 100

&#x20; }

}

```



\---



\# Example



PLA



```text

80% - 100%

```



\---



PETG



```text

30% - 70%

```



\---



ABS



```text

0% - 30%

```



\---



\# Mechanical Properties



Used by AI for strength recommendations.



\---



\## Schema



```json

{

&#x20; "mechanical": {

&#x20;   "strength": 70,

&#x20;   "impactResistance": 50,

&#x20;   "flexibility": 20,

&#x20;   "layerAdhesion": 85,

&#x20;   "wearResistance": 40

&#x20; }

}

```



\---



\# Property Scale



All properties:



```text

0 - 100

```



\---



\# Meaning



```text

0 = Extremely Low



100 = Extremely High

```



\---



\# Physical Properties


Purpose:


Cost and material estimation.


\---


\## Schema



```json

{

&#x20; "physical": {

&#x20;   "density": 1.24,

&#x20;   "shrinkage": 0.2,

&#x20;   "abrasive": false

&#x20; }

}

```



\---



\# Density Units



```text

g/cm³

```



\---



\# Abrasive Materials



Examples:



```text

Carbon Fiber



Glass Fiber



Metal Filled

```



\---



\# Abrasive Material Impact



May require:



```text

Hardened Nozzle

```



\---



\# Printing Settings



Recommended values.



\---



\## Schema



```json

{

&#x20; "printing": {

&#x20;   "recommendedSpeed": 80,

&#x20;   "maximumSpeed": 150,

&#x20;   "recommendedLayerHeight": 0.20,

&#x20;   "recommendedRetractionDistance": 0.8,

&#x20;   "recommendedRetractionSpeed": 35,

&#x20;   "recommendedPrintPreset": "Balanced"

&#x20; }

}

```



\---



\# Speed Units



```text

mm/s

```



\---



\# Retraction Units



Distance:



```text

mm

```



Speed:



```text

mm/s

```



\---



\# Drying Requirements



Purpose:



Material preparation.



\---



\## Schema



```json

{

&#x20; "drying": {

&#x20;   "required": true,

&#x20;   "temperature": 55,

&#x20;   "durationHours": 6

&#x20; }

}

```



\---



\# Examples



PLA



```text

Optional

```



\---



PETG



```text

Recommended

```



\---



Nylon



```text

Required

```



\---



\# Environmental Behavior



Describes sensitivity.



\---



\## Schema



```json

{

&#x20; "behavior": {

&#x20;   "warpingRisk": 20,

&#x20;   "moistureSensitivity": 30,

&#x20;   "odorGeneration": 10,

&#x20;   "uvResistance": 20

&#x20; }

}

```



\---



\# Scale



```text

0 - 100

```



\---



\# Examples



PLA



```text

Warping Risk: Low

```



\---



ABS



```text

Warping Risk: High

```



\---



ASA



```text

UV Resistance: High

```



\---



\# Compatibility Section



Used by validation engine.



\---



\## Schema



```json

{

&#x20; "compatibility": {

&#x20;   "heatedBedRequired": true,

&#x20;   "enclosureRecommended": false,

&#x20;   "enclosureRequired": false,

&#x20;   "hardenedNozzleRequired": false,

&#x20;   "supportedPrinterTypes": []

&#x20; }

}

```



\---



\# Example



PLA



```json

{

&#x20; "heatedBedRequired": true,

&#x20; "enclosureRequired": false

}

```



\---



\# Example



ABS



```json

{

&#x20; "heatedBedRequired": true,

&#x20; "enclosureRequired": true

}

```



\---



\# Cost Data



Used by cost engine.



\---



\## Schema



```json

{

&#x20; "cost": {

&#x20;   "pricePerKg": 20

&#x20; }

}

```



\---



\# Currency



Determined by user preferences.



\---



\# Color Information



Optional.



\---



\## Schema



```json

{

&#x20; "visual": {

&#x20;   "color": "Black",

&#x20;   "transparency": false,

&#x20;   "reflective": false

&#x20; }

}

```



\---



\# Food Safety



Optional.



\---



\## Schema



```json

{

&#x20; "certifications": {

&#x20;   "foodSafe": false

&#x20; }

}

```



\---



\# Outdoor Usage



Optional.



\---



\## Schema



```json

{

&#x20; "outdoor": {

&#x20;   "recommended": false

&#x20; }

}

```



\---



\# Chemical Resistance



Optional.



\---



\## Schema



```json

{

&#x20; "chemicalResistance": {

&#x20;   "level": 60

&#x20; }

}

```



\---



\# Fire Resistance



Optional.



\---



\## Schema



```json

{

&#x20; "fireResistance": {

&#x20;   "level": 10

&#x20; }

}

```



\---



\# Material Risk Factors


Used by AI.


\---


\## Schema


```json

{

&#x20; "riskFactors": {

&#x20;   "stringing": 20,

&#x20;   "warping": 15,

&#x20;   "cracking": 5,

&#x20;   "layerSeparation": 10

&#x20; }

}

```



\---



\# AI Usage Rules



The AI engine uses:



```text

Thermal



Cooling



Mechanical



Behavior



Compatibility



Risk Factors

```



to generate recommendations.



\---



\# AI Material Scoring



Each material receives:



```text

Printability Score

Strength Score

Difficulty Score

Confidence Score

```



Range:



```text

0 - 100

```



\---



\# Example Difficulty



PLA



```text

20

```



Easy



\---



PETG



```text

45

```



Moderate



\---



ABS



```text

75

```



Difficult



\---



Nylon



```text

90

```



Very Difficult



\---



\# Validation Rules



Every profile must contain:



```text

Metadata

Thermal

Cooling

Physical

Printing

Compatibility

Risk Factors

```



\---



\# Invalid Profile Conditions



Missing:



```text

Material Name



Nozzle Temperature



Bed Temperature

```



Profile becomes invalid.



\---



\# Confidence Impact



Complete Profile



↓



Higher AI Confidence



\---



Incomplete Profile



↓



Lower AI Confidence



\---



\# Material Source Types



Supported Sources



```text

Official Manufacturer
Manufacturer Cloud Repository
Verified Repository
Community
Custom User Profile

```



\---



\# Schema



```json

{

&#x20; "source": {

&#x20;   "type": "Official",

&#x20;   "url": ""

&#x20; }

}

```



\---



\# Source Priority



```text

Official



↓



Verified



↓



Community



↓



Custom

```



\---



\# Profile Version



```json

{

&#x20; "profileVersion": "1.0.0"

}

```



\---



\# Future Extensions



Reserved



```json

{

&#x20; "recycling": {},

&#x20; "carbonFootprint": {},

&#x20; "manufacturerVerification": {},

&#x20; "batchTracking": {},

&#x20; "materialAging": {},

&#x20; "communityRating": {},

&#x20; "filamentPerformanceHistory": {}

}

```



\---



\# Backward Compatibility



Existing fields must never be removed.



New fields may be added.



Breaking changes require:



```text

Schema Update



Documentation Update



Changelog Entry



Migration Guide

```



\---



\# Example Minimal Profile



```json

{

&#x20; "metadata": {

&#x20;   "name": "PLA"

&#x20; },



&#x20; "thermal": {

&#x20;   "recommendedNozzleTemp": 210,

&#x20;   "recommendedBedTemp": 60

&#x20; },



&#x20; "cooling": {

&#x20;   "recommendedFan": 100

&#x20; }

}

```



\---



\# Golden Rule



A material profile must describe the real behavior of the material.



The AI must adapt to the material.



The material must never be modified to fit an AI recommendation.



\---



\# End Of Document

