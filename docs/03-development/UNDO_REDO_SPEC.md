# SlicyWeb SMART SLICER

# UNDO REDO SPECIFICATION

Version: 2.7.0

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

Phase 11 (2.3.0, ADR-036 D4; lot 98): Orientation Optimization is undoable (Optimization Actions).

Lot 100 (2.4.0, outside the phases, request of Noam): Delete and Duplicate are undoable (Delete Actions, Duplicate Actions). Import, printer, material and settings actions are still not recorded.

Lot 101 (2.5.0, outside the phases, request of Noam): Arrange Objects is undoable (Arrange Actions).

Lot 106 (2.6.0, outside the phases, decision 112 of Noam, Q17 A): Rename, Hide and Show, Lock and Unlock are undoable (Visibility Actions, Rename Actions).

Phase 13 (2.7.0, ADR-038; lot 111, decision 119 of Noam, Q11 and Q15 A): New Project, Close Project, Open Project, a recent project, a project dropped and Recover empty the Undo / Redo history (Project Loading); Save and Save As do not change it (Project Saving). The place of the history at the save is kept: Undo or Redo back to that place removes the "modified" mark of the project (GUI_SPEC.md, File Menu).



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

Lot 106 (2.6.0, decision 112 of Noam, Q17 A; ObjectStateService): each change is one action. Hide or Show (eye of a row, the line of the context menu, the key H) records one action VISIBILITY for all the objects changed; View > Show All and Alt+H one action VISIBILITY for all the objects shown again. Lock or Unlock (padlock of a row, the line of the context menu) records one action LOCK. before and after hold the field changed of each object (visible or locked), by objectId; the objects that do not change are not in the action, and nothing is recorded when none changes. Undo and redo write the field back; the objects of the action become the selection, hidden ones included (decision 114 of Noam, Q27 A: a hidden object stays selected; GUI_SPEC.md, Object Panel). Nothing is recorded during a gesture.

Rename Actions (lot 106): a name applied in the Object Panel records one action RENAME (before and after: the field name of the object, null for the name of the file). Undo gives the name before back, redo the new name; the object is selected.



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

Lot 100 (2.4.0): Edit > Delete and the Delete key delete the selected objects (GUI_SPEC.md, Delete Confirmation): one action DELETE for all of them. before holds each object deleted (by objectId): the object, its place in the list of the scene, a reference to its geometry, its analysis (with the category chosen by the user) and what the analysis shows (triangles beyond 45 degrees, ANA_002, ANA_005); after is empty. Undo puts the objects back at their place, selected, with their analysis as it was: no analysis is computed again; their recommendation is generated again at once with the printer and the material selected at that time (DATA_SCHEMA.md, Object Reference Rule 11). Redo deletes them again. While the objects are deleted, their analysis and recommendation are not in the project (Object Reference Rule 6): they are kept only in the history, in memory.



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

Lot 100 (2.4.0): Edit > Duplicate and Ctrl+D copy the selected objects (DATA_SCHEMA.md, Object Reference Rule 7): one action DUPLICATE for all the copies. before is empty; after holds each copy, as for Delete Actions. Undo removes the copies, keeping what they got since (their analysis) for redo; redo puts them back, selected.



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

Phase 6: a change of a group of selected objects (fields, gizmo, drag on the plate) is one action; undo and redo select the group again.



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



# Arrange Actions



Lot 101 (2.5.0, decision 103 of Noam): Edit > Arrange, the key A and the button Arrange of the toolbar place all the objects of the scene on the build plate (GUI_SPEC.md, Edit Menu, Arrange): one action of type ARRANGE for all the objects moved. before and after hold the transform of each object moved (only Position X and Y change), by objectId; the objects that do not move are not in the action; when no object moves, no action is recorded. Undo puts the objects back where they were, redo arranges them again; both select the objects of the action, as for a group (Multiple Object Transformations). The analysis and the recommendation do not become outdated (a move, ADR-026).



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

Phase 11 (2.3.0, ADR-036 D4): one action of type OPTIMIZATION for all the objects turned by one search (Tools > Optimize Orientation or the button Optimize); before and after hold the transform of each object turned (rotation and position: the object is placed back on the plate), by objectId. The objects whose orientation is kept are not in the action; when no object is turned, no action is recorded. Undo and redo select the objects of the action again, as for a group (Multiple Object Transformations). Lot 106 (decision 113 of Noam, Q24 A): an object turned and then moved to a free place (no object on another) has its new position in the same action: one undo gives back its orientation and its place. After an undo or a redo, the analysis and the recommendation become outdated and are computed again, as after any rotation.

---

## Support Optimization

Not in Phase 11 (ADR-036 D1): the supports are reduced by the orientation (Orientation Optimization); no support strategy is optimized on its own.

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

Phase 13: the history is emptied when a project is opened (Open Project, a recent project, a project dropped, Recover) and at New Project and Close Project. The analyses and recommendations of the file are shown as they were saved; their computing is never recorded.

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

Phase 13: Save and Save As keep the history. The id of the last action of the history (its top) is kept at the save; the project is modified while the top differs from it, or while a change outside the history was made (import, printer, material, filament, type of object).



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

Lot 100 (2.4.0): for DELETE and DUPLICATE, before and after hold objects instead of transforms (Delete Actions, Duplicate Actions).



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



ARRANGE



RENAME



VISIBILITY



LOCK



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

Lot 100 (2.4.0): a Delete or Duplicate action references the geometry of its objects; it is never copied by the history. A copy made by Duplicate is a new object of the scene and gets its own geometry. The geometry of deleted objects stays in memory while their action is in the history (at most 50 actions, Maximum History Size; dropped with the redo stack after a new action).



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

In a field of the Transform section (decisions of Noam, Phase 6): while typing is not applied yet (Enter, or the field losing the focus), Ctrl+Z undoes the typing: the field shows the applied value again and the history of the application is not touched; with nothing pending (value already applied), Ctrl+Z is the undo of the application: the object changes at once and the field shows the new value. Ctrl+Y and Ctrl+Shift+Z redo in the application when nothing is pending, and do nothing otherwise. Leaving the field after an undo adds no action. The undo history of the browser is never used in these fields. In other text fields, the shortcuts keep their usual meaning (undo the typing). The letter is read from the key typed (Z of an AZERTY keyboard), or from the key position when the layout has no Latin letters (Hebrew).



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
