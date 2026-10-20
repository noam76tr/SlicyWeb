# SlicyWeb SMART SLICER

# UNDO REDO SPECIFICATION

Version: 2.1.0

Status: Approved

Priority: High

---

# Purpose


This document defines the Undo/Redo system used throughout SlicyWeb.

The system allows users to safely revert or restore actions performed during a project session.

The objective is to:


- Improve usability

- Prevent accidental mistakes

- Increase user confidence

- Support experimentation

- Improve workflow efficiency



---



# Core Principles



The Undo/Redo system must be:



```text

Reliable

Predictable

Fast

Consistent

```



---



# Terminology



---



## Undo



Reverts the most recent valid action.



---



## Redo



Restores the most recently undone action.



---



## Action



Any operation that modifies:



```text

Scene

Objects

Settings

Configuration

```



---



# Undo Redo Workflow



```text

User Action

↓

Action Recorded

↓

History Stack

↓

Undo

↓

Redo

```



---



# History Architecture



```text

Action Stack

↓

Undo Stack

↓

Redo Stack

```



---



# Maximum History Size



Default:


```text

50 Actions

```

Decision of Noam (Phase 6, 2026-10-20): 50 actions, previously 100. Beyond it, the oldest action is dropped (src/constants/HistoryConstants.ts, MAX_HISTORY_SIZE). The history is emptied when a project is closed or opened (Phase 13).



---



Future:



```text

User Configurable

```



---



# Global Rules


Every undoable action must:



```text

Store Previous State

Store New State

Be Reversible

Be Deterministic

```



---



# Implementation Status

Phase 6 (Transform System, decision of Noam, 2026-10-20): only the transform actions are undoable (MOVE, ROTATE, SCALE): fields of the Transform section, Reset and Center On Bed, gizmos, drag on the plate. TransformService (src/services/TransformService.ts) records each change; a gesture (drag on the plate, drag of a handle of a gizmo) is recorded as one action. The other categories come with their phase (import, delete, duplicate, printer, material, settings).



---



# Undoable Categories



---



## Scene Actions



Supported:



```text

Import Object

Delete Object

Duplicate Object

Center Object

Arrange Objects

```



---



## Transform Actions



Supported:



```text

Move

Rotate

Scale

```



---



## Visibility Actions



Supported:



```text

Show Object

Hide Object

Lock Object

Unlock Object

```



---



## Selection Actions



Default:



```text

Not Stored

```



Reason:



```text

Selection Changes Are Temporary

```

When an action is undone or redone, its object is selected, so that the change is visible (decision of Noam, Phase 6).



---



# Import Actions



---



## STL Import



Undo:



```text

Remove Imported Object

```



---



Redo:



```text

Restore Imported Object

```



---



## 3MF Import



Undo:



```text

Remove Imported Object

```



---



Redo:



```text

Restore Imported Object

```



---



# Delete Actions



Undo:



```text

Restore Object

```



---



Redo:



```text

Delete Object Again

```



---



# Duplicate Actions



Undo:



```text

Remove Duplicate

```



---



Redo:



```text

Restore Duplicate

```



---



# Transform Actions



---



## Move



Store:



```text

Previous Position



New Position

```



---



## Rotate



Store:



```text

Previous Rotation



New Rotation

```



---



## Scale



Store:



```text

Previous Scale



New Scale

```



---



# Multiple Object Transformations



Supported.



---



Example:



```text

Move 10 Objects

↓

Single Undo Action

```



---



# Printer Actions



Supported:



```text

Change Printer

Change Nozzle

Change Printer Profile

```



---



Undo:



```text

Restore Previous Printer Configuration

```



---



# Material Actions



Supported:



```text

Change Material

Change Filament

Change Material Profile

```



---



Undo:



```text

Restore Previous Material Configuration

```



---



# Print Settings Actions



Supported:



```text

Layer Height

Walls

Infill

Supports

Cooling

Retraction

```



---



Undo:



```text

Restore Previous Values

```



---



# AI Recommendation Actions



Supported.



---



## Apply Recommendation



Undo:



```text

Restore Previous Settings

```



---



Redo:



```text

Apply Recommendation Again

```



---



# Optimization Actions



Supported.



---



## Orientation Optimization



Undo:



```text

Restore Previous Orientation

```



---



Redo:



```text

Apply Optimized Orientation

```

---

## Support Optimization

Undo:

```text

Restore Previous Support Strategy

```

---

# User Settings

Supported Only For Current Session.

Examples:

```text
Theme
Viewport Options
Panel Layout
```

Language changes are not stored in Undo/Redo history.

Reason:

```text
Language changes affect application localization
but do not modify project data or scene state.
```

---

# Project Loading

Loading a WYPROJ project replaces the active workspace.

Undo:

```text

Not Supported

```

---



Reason:



```text

Entire Workspace Replaced

```



---



# Project Saving



Undo:



```text

Not Supported

```



---



Reason:



```text

No Scene Modification

```



---

# Auto Save And Recovery

Auto Save operations are not stored in the Undo/Redo history.

Reason:

```text
Auto Save is a persistence operation
not a user modification.
```

Recovery operations are not undoable.

Reason:

```text
Recovery restores a previously saved project state.
```

---

# Non Undoable Actions



Examples:



```text

Open File Dialog



Close Dialog



Hover Events



Object Selection



Camera Navigation

```



---



# Transaction System



Purpose:



Group actions together.



---



Example



```text

Duplicate



↓



Move



↓



Rotate

```



Saved as:



```text

Single Transaction

```



when appropriate.



---



# History Entry Schema



```json

{

 "actionId": "",

 "type": "",

 "timestamp": "",



 "before": {},

 "after": {}

}

```

Phase 6 (src/state/historyStore.ts): before and after hold the transform of each object changed, by objectId. The history is kept in memory only; it is not saved in WYPROJ files.



---



# Action Types



Supported:



```text

IMPORT



DELETE



MOVE



ROTATE



SCALE



DUPLICATE



CHANGE_PRINTER



CHANGE_MATERIAL



CHANGE_SETTINGS



OPTIMIZATION



AI_RECOMMENDATION

```



---



# Memory Management



History system must:



```text

Limit Memory Usage



Avoid Storing Heavy Geometry Multiple Times

```



---



# Geometry Storage Rules



Prefer:



```text

Reference Existing Geometry

```



Instead of:



```text

Duplicate Mesh Data

```



---



# Redo Clearing Rule



Whenever:



```text

New Action Performed

```



Then:



```text

Clear Redo Stack

```



---



# Keyboard Shortcuts



---



## Undo



```text

Ctrl + Z



Cmd + Z

```



---



## Redo



```text

Ctrl + Shift + Z



Cmd + Shift + Z

```



---



Alternative:



```text

Ctrl + Y

```



Supported.

In a text field, the shortcuts undo or redo the typing in the field; the history of the application is not touched (decision of Noam, Phase 6). The letter is read from the key typed (Z of an AZERTY keyboard), or from the key position when the layout has no Latin letters (Hebrew).



---



# GUI Integration



Menu:



```text

Edit



├── Undo

└── Redo

```



---



Toolbar:



```text

Undo Button



Redo Button

```



---



# Disabled State



If stack is empty:



```text

Disable Control

```



---



# Validation Rules



Undo and Redo operations must:



```text

Never Corrupt Scene



Never Change Hidden State



Never Lose Data

```



---



# Error Handling



If restoration fails:



```text

Cancel Operation

Log Error

Preserve Current State

```



---



# Future Support



Reserved:



```text

Undo History Panel

Visual Timeline

Action Search

Named Restore Points

Project Snapshots

```


---



# Integration Points

Used By:

```text
GUI_SPEC.md

OBJECT_MANAGER

SCENE_MANAGER

TRANSFORM_SYSTEM

PRINT_SETTINGS_SPEC.md

PROJECT_MANAGER
PROJECT_SERIALIZER
PROJECT_DESERIALIZER
PROJECT_VALIDATOR
WYPROJ_IMPORTER
WYPROJ_EXPORTER

```



---



# Golden Rule



Every reversible action should behave exactly the same every time it is undone and redone.

Predictability is more important than complexity.



---



# End Of Document
