# SlicyWeb Smart Slicer

# MATERIAL PROFILE SPECIFICATION



Version: 1.0.0



Status: Approved


Priority: High

---



# Purpose



This document defines the complete structure of material profiles used by the SlicyWeb Smart Slicer.



All material profiles must follow this specification.



The profile must provide sufficient information for:



- AI Recommendations

- Risk Analysis

- Cost Calculations

- Thermal Validation

- Speed Validation

- Cooling Validation

- Printability Analysis



---



# Objectives



A material profile must describe:



- Thermal behavior

- Mechanical characteristics

- Printing requirements

- Cooling requirements

- Drying requirements

- Warping characteristics

- Compatibility constraints



The AI engine must use this data to generate safe and reliable recommendations.



---



# Material Categories



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



---



# Profile Structure



```json

{
   "metadata": {},
   "thermal": {},
   "cooling": {},
   "mechanical": {},
   "physical": {},
   "printing": {},
   "drying": {},
   "behavior": {},
   "compatibility": {},
   "cost": {},
   "riskFactors": {}
}


```



---



# Metadata Section

Purpose:

Identify material.

---

## Schema

```json

{

  "id": "",

  "name": "",

  "brand": "",

  "category": "",

  "manufacturer": "",

  "color": "",

  "verified": true,

  "profileVersion": "1.0.0"

}

```


---


# Example


```json

{

  "id": "pla\_generic",

  "name": "PLA",

  "brand": "Generic",

  "category": "PLA"

}

```



---



# Thermal Properties



Defines heating requirements.



---



## Schema



```json

{

  "thermal": {

    "minNozzleTemp": 190,

    "maxNozzleTemp": 220,

    "recommendedNozzleTemp": 210,



    "minBedTemp": 50,

    "maxBedTemp": 65,

    "recommendedBedTemp": 60

  }

}

```



---



# Validation



Required:



```text

Nozzle Temperature



Bed Temperature

```



---



# Cooling Profile



Determines cooling behavior.



---



## Schema



```json

{

  "cooling": {

    "minFan": 80,

    "maxFan": 100,

    "recommendedFan": 100

  }

}

```



---



# Example



PLA



```text

80% - 100%

```



---



PETG



```text

30% - 70%

```



---



ABS



```text

0% - 30%

```



---



# Mechanical Properties



Used by AI for strength recommendations.



---



## Schema



```json

{

  "mechanical": {

    "strength": 70,

    "impactResistance": 50,

    "flexibility": 20,

    "layerAdhesion": 85,

    "wearResistance": 40

  }

}

```



---



# Property Scale



All properties:



```text

0 - 100

```



---



# Meaning



```text

0 = Extremely Low



100 = Extremely High

```



---



# Physical Properties


Purpose:


Cost and material estimation.


---


## Schema



```json

{

  "physical": {

    "density": 1.24,

    "shrinkage": 0.2,

    "abrasive": false

  }

}

```



---



# Density Units



```text

g/cm³

```



---



# Abrasive Materials



Examples:



```text

Carbon Fiber



Glass Fiber



Metal Filled

```



---



# Abrasive Material Impact



May require:



```text

Hardened Nozzle

```



---



# Printing Settings



Recommended values.



---



## Schema



```json

{

  "printing": {

    "recommendedSpeed": 80,

    "maximumSpeed": 150,

    "recommendedLayerHeight": 0.20,

    "recommendedRetractionDistance": 0.8,

    "recommendedRetractionSpeed": 35,

    "recommendedPrintPreset": "Balanced"

  }

}

```



---



# Speed Units



```text

mm/s

```



---



# Retraction Units



Distance:



```text

mm

```



Speed:



```text

mm/s

```



---



# Drying Requirements



Purpose:



Material preparation.



---



## Schema



```json

{

  "drying": {

    "required": true,

    "temperature": 55,

    "durationHours": 6

  }

}

```



---



# Examples



PLA



```text

Optional

```



---



PETG



```text

Recommended

```



---



Nylon



```text

Required

```



---



# Environmental Behavior



Describes sensitivity.



---



## Schema



```json

{

  "behavior": {

    "warpingRisk": 20,

    "moistureSensitivity": 30,

    "odorGeneration": 10,

    "uvResistance": 20

  }

}

```



---



# Scale



```text

0 - 100

```



---



# Examples



PLA



```text

Warping Risk: Low

```



---



ABS



```text

Warping Risk: High

```



---



ASA



```text

UV Resistance: High

```



---



# Compatibility Section



Used by validation engine.



---



## Schema



```json

{

  "compatibility": {

    "heatedBedRequired": true,

    "enclosureRecommended": false,

    "enclosureRequired": false,

    "hardenedNozzleRequired": false,

    "supportedPrinterTypes": []

  }

}

```



---



# Example



PLA



```json

{

  "heatedBedRequired": true,

  "enclosureRequired": false

}

```



---



# Example



ABS



```json

{

  "heatedBedRequired": true,

  "enclosureRequired": true

}

```



---



# Cost Data



Used by cost engine.



---



## Schema



```json

{

  "cost": {

    "pricePerKg": 20

  }

}

```



---



# Currency



Determined by user preferences.



---



# Color Information



Optional.



---



## Schema



```json

{

  "visual": {

    "color": "Black",

    "transparency": false,

    "reflective": false

  }

}

```



---



# Food Safety



Optional.



---



## Schema



```json

{

  "certifications": {

    "foodSafe": false

  }

}

```



---



# Outdoor Usage



Optional.



---



## Schema



```json

{

  "outdoor": {

    "recommended": false

  }

}

```



---



# Chemical Resistance



Optional.



---



## Schema



```json

{

  "chemicalResistance": {

    "level": 60

  }

}

```



---



# Fire Resistance



Optional.



---



## Schema



```json

{

  "fireResistance": {

    "level": 10

  }

}

```



---



# Material Risk Factors


Used by AI.


---


## Schema


```json

{

  "riskFactors": {

    "stringing": 20,

    "warping": 15,

    "cracking": 5,

    "layerSeparation": 10

  }

}

```



---



# AI Usage Rules



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



---



# AI Material Scoring



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



---



# Example Difficulty



PLA



```text

20

```



Easy



---



PETG



```text

45

```



Moderate



---



ABS



```text

75

```



Difficult



---



Nylon



```text

90

```



Very Difficult



---



# Validation Rules



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



---



# Invalid Profile Conditions



Missing:



```text

Material Name



Nozzle Temperature



Bed Temperature

```



Profile becomes invalid.



---



# Confidence Impact



Complete Profile



↓



Higher AI Confidence



---



Incomplete Profile



↓



Lower AI Confidence



---



# Material Source Types



Supported Sources



```text

Official Manufacturer
Manufacturer Cloud Repository
Verified Repository
Community
Custom User Profile

```



---



# Schema



```json

{

  "source": {

    "type": "Official",

    "url": ""

  }

}

```



---



# Source Priority



```text

Official



↓



Verified



↓



Community



↓



Custom

```



---



# Profile Version



```json

{

  "profileVersion": "1.0.0"

}

```



---



# Future Extensions



Reserved



```json

{

  "recycling": {},

  "carbonFootprint": {},

  "manufacturerVerification": {},

  "batchTracking": {},

  "materialAging": {},

  "communityRating": {},

  "filamentPerformanceHistory": {}

}

```



---



# Backward Compatibility



Existing fields must never be removed.



New fields may be added.



Breaking changes require:



```text

Schema Update



Documentation Update



Changelog Entry



Migration Guide

```



---



# Example Minimal Profile



```json

{

  "metadata": {

    "name": "PLA"

  },



  "thermal": {

    "recommendedNozzleTemp": 210,

    "recommendedBedTemp": 60

  },



  "cooling": {

    "recommendedFan": 100

  }

}

```



---



# Golden Rule



A material profile must describe the real behavior of the material.



The AI must adapt to the material.



The material must never be modified to fit an AI recommendation.



---



# End Of Document

