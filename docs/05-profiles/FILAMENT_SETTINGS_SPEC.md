# SlicyWeb SMART SLICER

# FILAMENT SETTINGS SPECIFICATION


Version: 2.0.0


Status: Approved


Priority: High


---


# Purpose


This document defines the filament profile system used by SlicyWeb.

A filament profile represents a specific commercial filament.


Examples:


```text

Bambu PLA Basic

Prusament PLA Galaxy Black

Polymaker PolyLite PLA

eSUN PETG

Overture TPU

```



# Alignment With DATA_SCHEMA.md (2.0.0)



DATA_SCHEMA.md (priority 0) is the source of truth for the fields of a filament (Filament Schema, flat structure). This specification follows it (ADR-033):

- A filament is a product line of a brand (as Bambu Lab PLA Basic). It belongs to a family: its material field is the category of a material (MATERIAL_PROFILE_SPEC.md, Material Families).
- A filament profile has the fields of the Filament Schema of DATA_SCHEMA.md: id, brand, name, material, color, diameter, density, pricePerKg, temperature (minNozzle, maxNozzle, minBed, maxBed), manufacturerSettings (retractionDistance, retractionSpeed, fanSpeed, nozzleTemperature, bedTemperature), recommendedProfile (empty until Phase 10). No other field.
- temperature keeps the ranges published by the manufacturer; manufacturerSettings keeps the single values published by the manufacturer. A range is never turned into a single value.
- A value not published is null, never 0. The four temperature values are required (not null) for a shipped filament. A shipped filament is a product line: color null, pricePerKg null.
- A profile file is a Repository Data Schema envelope (id, type "filament", version of the profile, source, data, validated); data is the filament.
- Sources: written by SlicyWeb from the technical data sheet of the manufacturer, never copied from a profile file of a slicer (ADR-033 D1). The sheet and the date of verification of each filament are listed in data/filaments/SOURCES.md. Source types used: Official (shipped filaments) and Custom User Profile (filaments entered by the user, Manage Filaments, Phase 8 lot 71). Community sources are not used.
- The sections of this document without a field in DATA_SCHEMA.md (Profile Structure, metadata, verified, profileVersion, manufacturer and source, printing, quality, visual, moisture, stringing, warp risk, layer adhesion, surface finish, special requirements, cost settings other than pricePerKg) are future: they are not part of a profile until DATA_SCHEMA.md defines them.



---



# Objectives



The filament profile system must:


- Store manufacturer settings

- Improve print reliability

- Improve AI recommendations

- Override generic material values when necessary

- Provide accurate cost calculations


---



# Filament Hierarchy


```text

Printer

+

Material

+

Filament Profile

+

Model Analysis

↓

AI Recommendation

```



---



# Relationship With Materials



Example:


```text

Material

↓

PLA

```

---

Filament:

```text
Bambu PLA Basic

Bambu PLA Matte

eSUN PLA+

Prusament PLA
```



---



# Profile Structure


```json
{

 "metadata": {},
 
 "manufacturer": {},
 
 "thermal": {},
 
 "cooling": {},
 
 "printing": {},
 
 "physical": {},
 
 "quality": {},
 
 "visual": {},
 
 "specialRequirements": {},
 
 "cost": {}

}
```



---



# Metadata


Purpose:


Identify filament.


---


## Schema


```json

{
   "id": "",
   "name": "",
   "brand": "",
   "material": "",
   "color": "",
   "verified": true,
   "profileVersion": "1.0.0"
}

```



---



# Example



```json

{

 "id": "bambu_pla_basic_black",

 "name": "PLA Basic Black",

 "brand": "Bambu Lab",

 "material": "PLA",

 "color": "Black"

}

```



---



# Manufacturer Information



---



## Schema



```json

{

 "manufacturer": {

   "name": "",

   "country": "",

   "website": ""

 }

}

```



---



# Thermal Settings



Purpose:



Override generic material values.



---



## Schema



```json

{

 "thermal": {

   "recommendedNozzle": 220,

   "minimumNozzle": 200,

   "maximumNozzle": 230,



   "recommendedBed": 60,

   "minimumBed": 50,

   "maximumBed": 70

 }

}

```



---



# Cooling Settings



Purpose:



Define fan usage.



---



## Schema



```json

{

 "cooling": {

   "minimumFan": 70,

   "recommendedFan": 100,

   "maximumFan": 100

 }

}

```



---



# Printing Settings



Purpose:



Store tested settings.



---



## Schema



```json

{

 "printing": {

   "recommendedSpeed": 120,

   "maximumSpeed": 250,



   "recommendedRetraction": 0.8,

   "recommendedRetractionSpeed": 35

 }

}

```



---



# Physical Properties


Purpose:


Improve calculations.


---


## Schema


```json

{

  "physical": {

  "diameter": 1.75,

  "density": 1.24,

  "spoolWeight": 1000,

  "remainingWeight": 1000

  }

}

```



---



# Units



Diameter:



```text

mm

```



---



Density:



```text

g/cm³

```



---



Spool Weight:



```text

grams

```



---



# Moisture Sensitivity



Purpose:



Estimate storage requirements.



---



## Scale



```text

0 - 100

```



---



# Example



```json

{

 "quality": {

   "moistureSensitivity": 20

 }

}

```



---



# Stringing Risk



---



## Scale



```text

0 - 100

```



---



Example:



```json

{

 "quality": {

   "stringingRisk": 30

 }

}

```



---



# Warp Risk



---



## Scale



```text

0 - 100

```



---



# Example



```json

{

 "quality": {

   "warpRisk": 10

 }

}

```



---



# Layer Adhesion



---



## Scale



```text

0 - 100

```



---



# Example



```json

{

 "quality": {

   "layerAdhesion": 85

 }

}

```



---



# Surface Finish



---



## Scale



```text

0 - 100

```



---



# Example



```json

{

 "quality": {

   "surfaceQuality": 92

 }

}

```



---



# Color Properties



Purpose:



Store visual properties.



---



## Schema



```json

{

 "visual": {

   "transparent": false,

   "reflective": false,

   "glow": false,

   "silk": false

 }

}

```



---



# Special Filaments



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



---



# Special Requirements



Example:



```json

{

 "specialRequirements": {

   "hardenedNozzle": true

 }

}

```



---



# Cost Settings



Purpose:



Cost calculation.



---



## Schema



```json

{

 "cost": {

   "pricePerKg": 25.90

 }

}

```



---



# Currency



Determined by user preferences.



---



# AI Confidence Impact



Verified manufacturer profiles increase:



```text

Recommendation Confidence
Printability Confidence
Classification Confidence

```



---



# Filament Source Priority



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



---



# Validation Rules



Required:



```text

Metadata

Material

Thermal Settings

Printing Settings

Physical Properties

```



---



# Invalid Profile Conditions



Missing:



```text

Name



Material



Recommended Temperature

```



Profile becomes invalid.



---



# AI Usage



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


---



# Integration Points



Used By:



```text

MATERIAL_PROFILE_SPEC.md



PRINT_SETTINGS_SPEC.md



AI_ENGINE_SPEC.md



RECOMMENDATION_RULES.md



COST_ENGINE

```



---



# Future Extensions



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



---



# Golden Rule



A filament profile always takes precedence over generic material recommendations when verified filament-specific data is available.



---



# End Of Document
