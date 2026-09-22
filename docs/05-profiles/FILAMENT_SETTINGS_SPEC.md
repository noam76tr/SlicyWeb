\# AI SMART SLICER

\# FILAMENT SETTINGS SPECIFICATION


Version: 1.0.0


Status: Approved


Priority: High


\---


\# Purpose


This document defines the filament profile system used by Wichy.

A filament profile represents a specific commercial filament.


Examples:


```text

Bambu PLA Basic

Prusament PLA Galaxy Black

Polymaker PolyLite PLA

eSUN PETG

Overture TPU

```



\---



\# Objectives



The filament profile system must:


\- Store manufacturer settings

\- Improve print reliability

\- Improve AI recommendations

\- Override generic material values when necessary

\- Provide accurate cost calculations


\---



\# Filament Hierarchy



```text

Printer



\+



Material



\+



Filament Profile



\+



Model Analysis



↓



AI Recommendation

```



\---



\# Relationship With Materials



Example:



```text

Material



↓



PLA

```



\---



Filament:



```text

Bambu PLA Basic



Bambu PLA Matte



eSUN PLA+



Prusament PLA

```



\---



\# Profile Structure



```json

{

&#x20; "metadata": {},

&#x20; "manufacturer": {},

&#x20; "thermal": {},

&#x20; "cooling": {},

&#x20; "printing": {},

&#x20; "physical": {},

&#x20; "quality": {},

&#x20; "visual": {},

&#x20; "specialRequirements": {},

&#x20; "cost": {}

}

```



\---



\# Metadata


Purpose:


Identify filament.


\---


\## Schema


```json

{
  &#x20; "id": "",
  &#x20; "name": "",
  &#x20; "brand": "",
  &#x20; "material": "",
  &#x20; "color": "",
  &#x20; "verified": true,
  &#x20; "profileVersion": "1.0.0"
}

```



\---



\# Example



```json

{

&#x20; "id": "bambu\_pla\_basic\_black",

&#x20; "name": "PLA Basic Black",

&#x20; "brand": "Bambu Lab",

&#x20; "material": "PLA",

&#x20; "color": "Black"

}

```



\---



\# Manufacturer Information



\---



\## Schema



```json

{

&#x20; "manufacturer": {

&#x20;   "name": "",

&#x20;   "country": "",

&#x20;   "website": ""

&#x20; }

}

```



\---



\# Thermal Settings



Purpose:



Override generic material values.



\---



\## Schema



```json

{

&#x20; "thermal": {

&#x20;   "recommendedNozzle": 220,

&#x20;   "minimumNozzle": 200,

&#x20;   "maximumNozzle": 230,



&#x20;   "recommendedBed": 60,

&#x20;   "minimumBed": 50,

&#x20;   "maximumBed": 70

&#x20; }

}

```



\---



\# Cooling Settings



Purpose:



Define fan usage.



\---



\## Schema



```json

{

&#x20; "cooling": {

&#x20;   "minimumFan": 70,

&#x20;   "recommendedFan": 100,

&#x20;   "maximumFan": 100

&#x20; }

}

```



\---



\# Printing Settings



Purpose:



Store tested settings.



\---



\## Schema



```json

{

&#x20; "printing": {

&#x20;   "recommendedSpeed": 120,

&#x20;   "maximumSpeed": 250,



&#x20;   "recommendedRetraction": 0.8,

&#x20;   "recommendedRetractionSpeed": 35

&#x20; }

}

```



\---



\# Physical Properties


Purpose:


Improve calculations.


\---


\## Schema


```json

{

 &#x20; "physical": {

 &#x20; "diameter": 1.75,

 &#x20; "density": 1.24,

 &#x20; "spoolWeight": 1000,

 &#x20; "remainingWeight": 1000

 &#x20; }

}

```



\---



\# Units



Diameter:



```text

mm

```



\---



Density:



```text

g/cm³

```



\---



Spool Weight:



```text

grams

```



\---



\# Moisture Sensitivity



Purpose:



Estimate storage requirements.



\---



\## Scale



```text

0 - 100

```



\---



\# Example



```json

{

&#x20; "quality": {

&#x20;   "moistureSensitivity": 20

&#x20; }

}

```



\---



\# Stringing Risk



\---



\## Scale



```text

0 - 100

```



\---



Example:



```json

{

&#x20; "quality": {

&#x20;   "stringingRisk": 30

&#x20; }

}

```



\---



\# Warp Risk



\---



\## Scale



```text

0 - 100

```



\---



\# Example



```json

{

&#x20; "quality": {

&#x20;   "warpRisk": 10

&#x20; }

}

```



\---



\# Layer Adhesion



\---



\## Scale



```text

0 - 100

```



\---



\# Example



```json

{

&#x20; "quality": {

&#x20;   "layerAdhesion": 85

&#x20; }

}

```



\---



\# Surface Finish



\---



\## Scale



```text

0 - 100

```



\---



\# Example



```json

{

&#x20; "quality": {

&#x20;   "surfaceQuality": 92

&#x20; }

}

```



\---



\# Color Properties



Purpose:



Store visual properties.



\---



\## Schema



```json

{

&#x20; "visual": {

&#x20;   "transparent": false,

&#x20;   "reflective": false,

&#x20;   "glow": false,

&#x20;   "silk": false

&#x20; }

}

```



\---



\# Special Filaments



Supported:



```text

Silk



Matte



Carbon Fiber



Glass Fiber



Wood



Metal Fill



Glow In The Dark

```



\---



\# Special Requirements



Example:



```json

{

&#x20; "specialRequirements": {

&#x20;   "hardenedNozzle": true

&#x20; }

}

```



\---



\# Cost Settings



Purpose:



Cost calculation.



\---



\## Schema



```json

{

&#x20; "cost": {

&#x20;   "pricePerKg": 25.90

&#x20; }

}

```



\---



\# Currency



Determined by user preferences.



\---



\# AI Confidence Impact



Verified manufacturer profiles increase:



```text

Recommendation Confidence
Printability Confidence
Classification Confidence

```



\---



\# Filament Source Priority



Priority:



```text

Official Manufacturer

↓

Manufacturer Cloud Repository

↓

Verified Repository

↓

Community Profile

↓

User Profile

```



\---



\# Validation Rules



Required:



```text

Metadata

Material

Thermal Settings

Printing Settings

Physical Properties

```



\---



\# Invalid Profile Conditions



Missing:



```text

Name



Material



Recommended Temperature

```



Profile becomes invalid.



\---



\# AI Usage



The AI engine uses:



```text

Thermal Settings

Cooling

Retraction

Quality Scores

Warp Risk

Stringing Risk

Manufacturer Data

Physical Properties

Special Requirements

```


to fine-tune recommendations.


\---



\# Integration Points



Used By:



```text

MATERIAL\_PROFILE\_SPEC.md



PRINT\_SETTINGS\_SPEC.md



AI\_ENGINE\_SPEC.md



RECOMMENDATION\_RULES.md



COST\_ENGINE

```



\---



\# Future Extensions



Reserved:



```text

RFID Identification

Automatic Filament Detection

Spool Usage Tracking

Drying History

Print History

Vision-Based Filament Detection

Community Reliability Rating

Filament Performance Learning
```



\---



\# Golden Rule



A filament profile always takes precedence over generic material recommendations when verified filament-specific data is available.



\---



\# End Of Document

