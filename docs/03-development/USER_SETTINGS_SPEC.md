# SlicyWeb SMART SLICER

# USER SETTINGS SPECIFICATION


Version: 2.4.0

Status: Approved

Priority: High


---



# Purpose



Defines all user preferences and application settings.



Provides:



- User customization

- Persistent preferences

- UI configuration

- AI behavior preferences

- Workspace restoration



---



# Settings Categories



```text

General

GUI

Viewport

Printer

Material

Cost

AI

Performance

Files

Shortcuts

Advanced

```



---



# General Settings



```json

{

  "language": "en",

  "theme": "dark",

  "units": "metric"

}

```


Supported Values:

```text
en
fr
he
```

---

# Project Settings

```json
{
  "project": {
    "autoSave": true,
    "autoSaveInterval": 300
  }
}
```

Used By:

```text
ProjectService (window: when to write the copy)
AutoSaveService
RecoveryManager
```

2.4.0 (lot 111, ADR-038; PASSATION.md decision 119 of Noam, Q18 and Q19 A; DATA_SCHEMA.md 3.16.0, User Preferences Schema: project):

- autoSave (true by default): a copy of the project modified is written every autoSaveInterval seconds, in the recovery folder of the user data folder (Windows: %APPDATA%\SlicyWeb\recovery), never in the file of the user. The copy is removed at a save, at "Don't Save" and at a normal close; after a forced close, it is offered at the next start (IMPORT_EXPORT_SPEC.md, Recovery System).
- autoSaveInterval: seconds, an integer from 5 to 3600, 300 by default.
- restoreLastSession is removed (Q19 A): a normal start shows an empty scene; the last project is not opened by itself. It may come back with the Preferences window (later).
- These settings are not shown in the GUI yet (Preferences window, later).

---

# Supported Languages

```text
English

French

Hebrew
```

---

# Internationalization

Language management is handled by:

```text
LanguageManager
LocalizationService
TranslationLoader
```

Requirements:

```text
No hardcoded UI text
Externalized translations
Language-neutral project files
Runtime language switching
```

---

# Theme Modes



```text

Dark

Light

System

```



---



# GUI Settings



```json

{

  "gui": {

    "rememberLayout": true,

    "showTooltips": true,

    "showStatusBar": true

  }

}

```

No GUI setting is stored today: rememberLayout, showTooltips and showStatusBar come with a Preferences window. The open tab of the Properties Panel is not a setting: the Printer tab is open at every start (lot 95, DATA_SCHEMA.md 3.12.0; GUI_SPEC.md, Properties Tabs). propertiesTab, stored by lot 93 (3.11.0), is no longer stored (see Backward Compatibility).



---



# Viewport Settings



```json

{

  "viewport": {

    "showGrid": true,

    "showAxes": true,

    "showBuildVolume": true,

    "showBoundingBoxes": true

  }

}

```



---



# Camera Settings



```json

{

  "camera": {

    "invertZoom": false,

    "invertRotation": false,

    "defaultView": "isometric"

  }

}

```



---



# Printer Settings



```json

{

  "printer": {

    "defaultPrinter": null,

    "autoloadLastPrinter": true,

    "autoCheckProfiles": true

  }

}

```



defaultPrinter: id of the last printer selected, or null (none selected yet). With autoloadLastPrinter true, this printer is selected again at startup (Phase 7, ADR-032; DATA_SCHEMA.md, User Preferences Schema).

autoCheckProfiles: "Check for profile updates automatically", true by default (Phase 7 lot 62, DATA_SCHEMA.md 3.6.0). When true, the SlicyWeb profile repository is checked at start, in the background, at most once every 24 hours (the printers, and since Phase 8 lot 72 the materials and the filaments, each list on its own). When false, it is checked only with Printer > Refresh Profiles. The setting is a check box in the Printer section (GUI_SPEC.md), until a Preferences window exists.



---



# Material Settings



```json

{

  "material": {

    "defaultMaterial": null,

    "defaultFilament": null,

    "autoloadLastMaterial": true

  }

}

```

defaultMaterial: id of the last material (family) selected, or null (none selected yet). defaultFilament: id of the last filament selected, or null. With autoloadLastMaterial true, they are selected again at startup (Phase 8, ADR-033 D9; DATA_SCHEMA.md 3.7.0, User Preferences Schema). An id no longer in the database is ignored.



---



# Cost Settings



```json

{

  "cost": {

    "currency": "EUR",

    "electricityPrice": null,

    "printerPower": {},

    "filamentPrices": {}

  }

}

```

Phase 12 (ADR-037; DATA_SCHEMA.md 3.15.0, User Preferences Schema; answers of Noam to lot 107, Q7 to Q11 A). Set in the Costs section of the Printer tab (GUI_SPEC.md, Cost Section), until a Preferences window exists; each value is saved when its field is left or with Enter:

- currency: EUR, USD, ILS, GBP, CHF, CAD, AUD or JPY. At the first start (no cost in settings.json): EUR in French, ILS in Hebrew, USD in English; then only the choice of the user counts (a change of language does not change it). The prices typed before are not converted when it changes.
- electricityPrice: price of a kWh in the currency, from 0 to 1 000 000; empty (null) = not given: no cost of electricity.
- printerPower: average power of each printer while it prints, in W (above 0, at most 10 000), by printer id; given for the selected printer. A printer without a value has no cost of electricity.
- filamentPrices: price per kg of a shipped filament (0 to 1 000 000), by filament id; given for the selected filament. A filament of the user keeps its price in its own field pricePerKg (Filament Manager, or the same field of the Costs section).

A value refused (a negative price, a power of 0, words) shows its error under the field and is not saved.



---



# AI Settings



```json

{

  "ai": {

    "autoAnalyze": true,

    "autoRecommend": true,

    "showWarnings": true

  }

}

```



---



# Performance Settings



```json

{

  "performance": {

    "enableCaching": true,

    "maxMemoryMB": 4096,

    "enableBVH": true

  }

}

```



---



# File Settings



```json

{

  "files": {

    "recentProjects": []

  }

}

```

2.4.0 (lot 111, Q17 A; DATA_SCHEMA.md 3.16.0, User Preferences Schema: files): recentProjects is the list of the paths of the last projects opened or saved, the most recent first, 10 at most (was "20", a number, before 2.4.0), shown in File > Recent Projects. A project opened again moves to the top; a project not found is removed (PROJ_001); Clear List empties the list. Written by the main process only (settings:update refuses files).



---



# Keyboard Shortcuts



Customizable.



---



# Storage Location



```text

settings.json

```

Stored separately from WYPROJ project files.
User settings must not alter project data.

Location: the user data folder of the application (Electron app.getPath("userData"); on Windows: %APPDATA%\SlicyWeb\settings.json).

Content (DATA_SCHEMA.md, User Preferences Schema):

```json
{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "units": "metric"
  }
}
```

Read and written by src/storage/SettingsStorage.ts, through StorageService and SettingsIPC (API_SPEC.md, SettingsIPC Channels).

Reading rules:

```text
Missing or unreadable file: default preferences (ApplicationConstants)
Invalid field: default value for that field, valid fields kept
Other top-level entries: kept when the file is written
```

The language choice is saved at each change and restored at the next start.

---



# Backward Compatibility



Old settings must migrate automatically.

A settings.json without printer (written before DATA_SCHEMA.md 3.5.0) loads without error: theme, language and units are kept, printer takes its default value (defaultPrinter null, autoloadLastPrinter true, autoCheckProfiles true). A printer without autoCheckProfiles (written before DATA_SCHEMA.md 3.6.0) keeps its other fields, with autoCheckProfiles true. A settings.json without material (written before DATA_SCHEMA.md 3.7.0) loads in the same way, with defaultMaterial null, defaultFilament null and autoloadLastMaterial true. A settings.json written by lot 93 (DATA_SCHEMA.md 3.11.0), with gui (propertiesTab), loads without error: gui is ignored, every other setting is kept, and gui is no longer in the file after the next write; the Printer tab is open, as at every start (3.12.0, lot 95). A settings.json without cost (written before DATA_SCHEMA.md 3.15.0) loads without error, with the currency of its language, no price and no power; each entry of printerPower and filamentPrices is read on its own, an invalid one is left out (Phase 12, lot 108). An invalid field takes its default value; the other fields are kept.



---



# Golden Rule



User settings must never corrupt a project.



---



# End Of Document

