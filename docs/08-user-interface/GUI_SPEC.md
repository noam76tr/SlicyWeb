# SlicyWeb Smart Slicer

# GUI SPECIFICATION

Version: 2.0.0

Status: Approved

Priority: Critical

---



# Purpose



This document defines the complete graphical user interface of the SlicyWeb Smart Slicer.



This specification serves as the reference for:



- Visual Design

- Layout

- Navigation

- User Experience

- Components

- Interaction Rules



The GUI should provide a familiar experience for users coming from:



- OrcaSlicer

- Bambu Studio

- PrusaSlicer

- Cura



while introducing a modern AI-assisted workflow.



---



# GUI Principles



The interface must be:



- Modern

- Fast

- Predictable

- Consistent

- Responsive

- Beginner Friendly

- Advanced User Friendly



---



# Design Priorities



Priority Order:



1. Clarity

2. Efficiency

3. Visibility

4. Accessibility

5. Aesthetics



---



# Visual Style



Theme:



Dark Theme default



Light Theme optional



System Theme optional



---



# Color Philosophy



Dark Theme:



```text

Background: #1E1E1E

Viewport: #252526

Panels: #2D2D30

Borders: #404040

Text: #FFFFFF

Accent: #4FA3FF

Warning: #FFB020

Error: #FF5A5A

Success: #27AE60

```



---



# Font



Primary Font:



```text

Inter

```



Hebrew Characters:

```text
Noto Sans Hebrew
```

Inter has no Hebrew glyphs. Noto Sans Hebrew follows Inter in the font stack, so Hebrew text keeps a consistent rendering while Latin text stays in Inter.

Fallback:



```text

Segoe UI

Roboto

Sans-serif

```



---



# Minimum Font Sizes



```text

Title       16px

Section     14px

Label       12px

Data        12px

Tooltip     11px

```



---



# Main Window



Layout:



```text

+--------------------------------------------------------+

| Menu Bar                                               |

+--------------------------------------------------------+

| Toolbar                                                 |

+--------------------------------------------------------+

| Object List |         3D Viewport      | Properties    |

|             |                          | Panel         |

|             |                          |               |

+--------------------------------------------------------+

| Notifications / Status Bar                              |

+--------------------------------------------------------+

```



---



# Window Areas



The application consists of:



```text

Menu Bar

Toolbar

Object Panel

Viewport

Properties Panel

Status Bar

```



---



# Menu Bar



Position:



Top



Always Visible



---



# File Menu



Functions:

```text

New Project

Open Project

Open WYPROJ

Save Project

Save As

Export WYPROJ

Import STL

Import 3MF

Close Project

Exit

```



---



# Edit Menu



Functions:



```text

Undo



Redo



Duplicate



Delete



Select All



Deselect All



Preferences

```

Undo and Redo (Phase 6) undo and redo the last change of transform; they are disabled while their history is empty (UNDO_REDO_SPEC.md).



---



# View Menu



Functions:



```text

Perspective



Orthographic



Top



Bottom



Front



Back



Left



Right



Isometric



Reset View



Show Overhangs

```

Show Overhangs (lot 82) is a check item: it turns the Overhang Display on and off, like the button Overhangs over the 3D viewport; disabled while the scene has no object.



---



# Printer Menu



Functions:



```text

Select Printer



Manage Printers



Refresh Profiles



Import Profile



Export Profile

```

Select Printer (Phase 7) moves the focus to the Printer Selector of the Properties Panel, when the menu closes. Manage Printers (Phase 7) opens the Printer Manager. The other items stay disabled until the phase that provides their action.



---



# Material Menu



Functions:



```text

Select Material

Manage Materials

Import Material

Export Material

```


---

# Filament Menu

Functions:

```text
Select Filament

Manage Filaments

Import Filament

Export Filament
```

Select Filament (Phase 8 lot 70) moves the focus to the Filament Selector of the Properties Panel. Manage Filaments (Phase 8 lot 71) opens the Filament Manager. Import Filament and Export Filament stay disabled until the phase that provides their action.

---

# Tools Menu


Functions:


```text

Analyze Models

Recompute Analysis

Generate Recommendations

Optimize Orientation

```

Phase 9 (ADR-034 D7; lot 80): Analyze Models analyzes all the objects without an analysis up to date (no analysis, or outdated); Recompute Analysis analyzes the selected objects again, even when their analysis is up to date. Both are disabled while the scene has no object (Recompute Analysis: while no object is selected). The analysis also starts by itself after the import of each object, and when its analysis becomes outdated (rotation or scale), once the gesture is over or the value confirmed, never while dragging. Generate Recommendations and Optimize Orientation stay disabled (Phases 10 and 11).

Phase 10 (ADR-035 D11): the recommendation is generated by itself for each object whose analysis is up to date, once a printer and a material are selected, and again after a change of the printer, the material, the filament or the object type (DATA_SCHEMA.md, Object Reference Rules, rule 11). Generate Recommendations generates again the recommendations of the selected objects (all the objects when none is selected); it is disabled while the scene has no object, or while no printer or no material is selected. Optimize Orientation stays disabled (Phase 11).



---

# Language Menu

Functions:

English
French
Hebrew

Managed By:
```text
- LanguageManager
- LocalizationService
- TranslationLoader
```

---

# Help Menu



Functions:


```text

Documentation

Release Notes

About

```



---



# Toolbar

Position:

Below Menu



---



# Toolbar Buttons



```text

Import



Save



Undo



Redo



Reset



Analyze



Optimize



Generate

```

Undo and Redo (Phase 6) undo and redo the last change of transform, disabled while their history is empty (UNDO_REDO_SPEC.md). Analyze (Phase 9, lot 80) does the same as Tools > Analyze Models, disabled while the scene has no object. Move, Rotate and Scale are not in the toolbar: they are shown over the 3D viewport only, at the top on the start side (decision of Noam, Phase 6). They choose the mode of the gizmo of the selected object (Move by default, shortcuts G, R, S); the active button is highlighted. They are active only when an object is selected, and grayed out otherwise. Next to them, in its own group, the button Overhangs (lot 82) turns the Overhang Display on and off (pressed while it is on), like View > Show Overhangs; it is grayed out while the scene has no object.

Generate (Phase 10, ADR-035 D11) does the same as Tools > Generate Recommendations, with the same rule to be enabled.



---



# Object Panel



Position:



Left Side



Resizable



Collapsible



---



# Contents



List of all imported models.



Each item contains:



```text

Icon



Object Name



Visibility Toggle



Lock Toggle



Selection State

```



---



# Object Context Menu



Right Click



Options:



```text

Rename



Duplicate



Delete



Center On Bed



Hide



Show



Lock



Unlock

```



---



# Multi Selection



Supported.



Examples:



```text

CTRL + Click



SHIFT + Click

```

Phase 6 (decisions of Noam):

- CTRL + Click (CMD + Click on macOS) on an object, in the 3D viewport or in the Object Panel, adds it to the selection or removes it; CTRL + A selects all the objects; a click in the empty space clears the selection; a click (without CTRL) on an object selects this object only.
- Selection rectangle, as in the Windows File Explorer: pressing the left button in the empty space of the 3D viewport and dragging draws a rectangle; on release, the objects touched by the rectangle are selected (an object is touched when the outline of its box, seen from the camera, overlaps the rectangle); with CTRL, they are added to the selection instead of replacing it. A rectangle that touches nothing clears the selection (without CTRL). The rectangle starts after the same threshold of 4 pixels, so a click in the empty space still clears the selection; a press on an object moves it (no rectangle).
- In the Object Panel, SHIFT + Click selects the range from the last object clicked to this one; CTRL + SHIFT + Click adds the range (as in the Windows File Explorer). In the 3D viewport, SHIFT + Click has no special meaning.
- Several objects selected form a group: the selected objects are shown in the accent color, the gizmo is placed at the center of the group (center of the bounding box of the objects), and dragging one of them moves the whole group.
- The group moves, turns (around its center) and scales (always uniformly, around its center); after a rotation or a scale, each object is placed back on the plate. A change of the group is one action of the undo history.
- The Object section shows the number of objects selected; the Transform section acts on the group (Transform Section).



---



# 3D Viewport



Position:



Center



Largest interface area.



---



# Viewport Purpose



Display:



- Build Plate

- Objects

- Axes

- Grid

- Selection Indicators



---



# Build Plate



Must visually represent selected printer.



Dynamic sizing.

No printer selected: no build plate is shown. The grid covers a default workspace of 400 x 400 mm, centered on the origin.

Coordinate system (ADR-028): millimeters, X to the right, Y to the back, Z up; origin at the center of the build plate, Z = 0 on the plate surface.

Appearance (lot 67, request of Noam, 2026-10-30): the build plate is drawn as a magnetic print sheet, in both themes: dark sheet with a light grain, rounded corners and a thin rim. A tab centered on the front edge (Y negative) shows the front of the printer; there is no other front mark (no arrow, no "Front" text). The coordinate grid stays visible on the sheet and stops at its rounded corners. The name of the printer (brand and model, as in the Status Bar) is written in text only, with low contrast, inside the sheet along the front edge; no logo of a manufacturer (trademarks). The sheet, the tab and the name follow the size of the build plate, are under the objects, can never be selected and never stop a click on an object; they disappear when no printer is selected.



---



# Plate Display



Show:



```text

Build Width



Build Depth



Origin Point



Boundary Limits

```

Phase 7: Build Width and Build Depth of the selected printer are shown at the bottom of the 3D viewport, on the start side: "Plate: X × Y mm". The build plate and the status bar follow the printer chosen; nothing is shown when no printer is selected.



---



# Axis Display



Visible at all times.



Colors:



```text

X = Red



Y = Green



Z = Blue

```

Lot 74 (decision of Noam, 2026-10-30): the axes are drawn on the navigation cube (Navigation Cube), from its front-left-bottom corner, each with its letter; there are no axes at the center of the build plate.



---



# Coordinate Grid



Always visible.



Adaptive spacing.



---



# Viewport Controls



Mouse:



```text

Middle Mouse = Pan



Wheel = Zoom



Right Mouse = Rotate Camera

```

Left mouse (objects):

- a click on an object selects it; a click in the empty space clears the selection;
- pressing on an object and dragging moves it on the build plate (X, Y), as in Bambu Studio and OrcaSlicer;
- the move starts only after 4 pixels: a selection click never moves the object;
- a drag that starts in the empty space draws a selection rectangle (Multi Selection);
- a press on a handle of the gizmo is left to the gizmo.



---



# Camera Views



Buttons:



```text

Top



Bottom



Left



Right



Front



Back



Isometric

```



---



# Navigation Cube



Lot 74 (decision of Noam, 2026-10-30; visible choices validated by Noam on 2026-11-01):

- position: a square area of 120 px in the bottom corner of the 3D viewport on the end side: bottom right, bottom left in Hebrew (like the rest of the interface); the cube itself is never mirrored (X stays on the right, as in the 3D view);
- the cube turns with the camera (it shows the rotation of the camera only, without perspective, whatever the projection);
- six faces with their translated names: Top, Bottom, Front, Back, Left, Right (fr: Dessus, Dessous, Avant, Arrière, Gauche, Droite; he: עליון, תחתון, חזית, אחור, שמאל, ימין); the Front face is on the side -Y, the side of the tab of the build plate; each face reads upright from its own view;
- a click on a face gives the same view as the View menu (Camera Views: same framing, projection kept); the view changes at once (no animation); only the faces can be clicked (no edge, no corner);
- the face under the mouse is highlighted;
- axes X (red), Y (green), Z (blue) from the front-left-bottom corner of the cube, with their letter (Axis Display); an axis seen end-on is not drawn.



---



# Overhang Display

Decision of Noam (2026-11-01, ADR-034 D8 option B), lot 82; choices of Noam (2026-11-03): all the objects (Q1 B), hidden while the analysis is outdated, button and View menu, not saved, red of the axis X (Q2 to Q5 A).

- When it is on, the triangles beyond 45 degrees of every object of the scene, selected or not, are drawn in red (#E5484D, the red of the axis X) over its faces, in the 3D viewport.
- They are the triangles counted by the analysis in overhangs.percentage (DATA_SCHEMA.md, Analysis Rules: angle from the vertical, triangles on the build plate excluded), computed in the Web Worker of the analysis; the viewport computes nothing.
- They are shown only while the analysis of the object is up to date: nothing during a rotation or a scale, until the object is analyzed again; nothing for an object whose analysis failed (ANA_001).
- The selection does not change the display (a selected object keeps its accent color under the red faces); a hidden object shows nothing; the red faces never stop a click on the object.
- Turned on and off with the button Overhangs over the viewport and View > Show Overhangs; off at each start, not saved (no setting, nothing in a project).



---



# Selection Visualization



Selected objects show:



```text

Selection Outline



Transform Gizmo



Bounding Box

```



---



# Object Gizmos



Move Gizmo



Rotate Gizmo



Scale Gizmo



---



# Move Gizmo



Axes:



```text

X



Y



Z

```

The gizmo moves the object along X and Y only: the object always stands on the build plate (Position Z is computed, Transform Section).



---



# Rotate Gizmo



Axes:



```text

X



Y



Z

```



Rotation may be:



```text

Free



Incremental

```

Free by default; with Shift held, by steps of 15 degrees.
The gizmo shows three rings, one per axis of the build plate. As in Bambu Studio and OrcaSlicer, during the gesture the object turns freely around its center (it may go under the plate for a moment); on release it is placed back on the plate: only Position Z changes, the rotation and Position X, Y (center of the object) are kept. Rotations typed in the Transform section are placed on the plate at once.



---



# Scale Gizmo



Modes:



```text

Uniform



Non Uniform

```

One handle per axis of the object, on one side only: X on the right, Y in front, Z on top; and the center handle, which scales uniformly (decision of Noam, Phase 6).

The lock of the Scale row (Transform Section) applies to the gizmo too: closed, every handle scales uniformly; open, an axis handle scales along that axis of the object only. After a change the object is placed back on the plate.

Several objects selected: the gizmo is in the axes of the build plate, at the center of the group, and always scales the group uniformly (Multi Selection).



---



# Properties Panel



Position:



Right Side



Resizable



Collapsible



---



# Properties Sections


```text

Project

Printer

Material

Filament

Print Preset

Object

Transform

Analysis

Recommendations

```

---

# Project Section

Displays:

```text
Project Name
Project Version
Created Date
Last Saved
Project Format
Application
```

Format:

```text
WYPROJ
```

---

# Printer Section



Displays:



```text

Brand



Model



Build Volume



Nozzle



Printer Limits

```

Details (Phase 7; DATA_SCHEMA.md 3.5.0, Printer Schema):

- Build Volume: X × Y × Z in mm; Nozzle: the default nozzle, then the list of the nozzles of the printer.
- Printer Limits: max print speed, max travel speed, max acceleration, max jerk, max nozzle temperature, max bed temperature, max chamber temperature. A value not published by the manufacturer (null) is shown as "Not published", never as 0.
- No printer selected: "No printer selected" under the selector.
- Profiles (Phase 7 lot 62): a discreet line under the selector gives the Official profiles in use: "Profiles v1.0.0 (SlicyWeb repository)" when they come from the profile repository, "Profiles v1.0.0 of the application" (or "Profiles of the application" without a tag) for the copy shipped with the application.
- Printer > Refresh Profiles checks the repository at once and shows the result after this line (role status): "Checking the profiles…", then "Profiles up to date.", "Profiles updated (v1.0.1).", "Repository unreachable, current profiles kept." (network error, no answer, HTTP error other than 404), "No published version of the profiles yet, current profiles kept." (the repository answers that index.json or the tag does not exist) or "Profiles of the repository refused (invalid file), current profiles kept." The check at start (at most once a day) shows a message only when the profiles were updated. Updated profiles replace the list at once, without restart; a selected printer no longer listed is no longer selected.
- Materials and filaments (Phase 8 lot 72; ADR-033, D7): Refresh Profiles and the check at start also check the lists of materials and of filaments, with one message for the three lists: a refused or unreachable list gives its message first, then "Profiles updated (tag)" with the tag of the first list updated (printers, then materials, then filaments), then "Profiles up to date.", then "No published version…" when no list is published. Updated materials and filaments replace the lists of the Material section at once; a material or filament no longer listed is no longer selected. The profiles line still gives the printer profiles.
- Under the profiles line, a check box "Check for profile updates automatically" (printer.autoCheckProfiles, checked by default; USER_SETTINGS_SPEC.md). Unchecked, the check at start is not made; Printer > Refresh Profiles still works. It moves to the Preferences window when that window exists.



---



# Printer Selector



Structure:



```text

Brand



 └─ Models

```



Example:



```text

Bambu Lab



 ├─ X1C

 ├─ P1S

 └─ A1



Prusa



 ├─ MK4

 └─ XL

```

Phase 7: a list of the window (select), with "No printer" first, then one group per brand; brands and models in alphabetical order. The printers are those loaded by the main process (printer:getAll; ADR-032).

The printer chosen is saved as the last printer (User Preferences, printer.defaultPrinter). At the next start, it is chosen again when autoloadLastPrinter is true and the printer is still loaded; otherwise no printer is selected. "No printer" clears the choice.

The printers entered by the user come right after "No printer", in a group "My printers" ("Brand Model", alphabetical order); the brand groups list only the Official printers. A "Manage…" button under the selector opens the Printer Manager.



---



# Printer Manager

Phase 7. A dialog opened by Printer > Manage Printers and by the "Manage…" button of the Printer Section. It adds, changes and removes the printers entered by the user (Local Custom, PRINTER_PROFILE_SPEC.md).

Structure:

```text
Start side: My printers (list), New printer, Copy a printer…
End side: form of the printer chosen, Save, Delete
```

- Copy a printer: any loaded printer, Official included; the copy is a new printer of the user, named "Model (copy)". Official printers are never listed in My printers, so they are never changed.
- Form (DATA_SCHEMA.md, Printer Schema): Brand, Model, Build Volume X, Y, Z, Default Nozzle and Nozzles are required (the default nozzle is one of the nozzles); Series, Manufacturer, Firmware, Release Date are free text; Printer Limits left empty are null, shown as "Not published"; part, auxiliary and chamber fans; extruder type (direct drive, bowden, unknown) and number of extruders; materials separated by commas. supported is always true; supportedFilaments stays empty until the filaments exist (Phase 8).
- Numbers accept a comma as decimal separator and are shown in the format of the language (Localization Support, Number Format). Nozzles are separated by semicolons or spaces.
- Opened while the selected printer is a printer of the user, the dialog opens on that printer, in edition (lot 71). The top of the form says what Save does: "Edit: Brand Model" for a printer of the user, "New printer" for a new printer or a copy.
- Errors are shown under their field: an invalid value as soon as it is typed, a required field left empty when the field is left or at Save; Save is disabled while an error is shown (lot 71). Errors of the main process (PRN_005, PRN_006, PRN_007) are shown under the form.
- Delete asks for a confirmation ("Delete Brand Model?"). When the printer deleted is the selected printer, no printer is selected and the saved choice is cleared. A change of the selected printer updates the Printer Section and the build plate at once.
- Changes of printers are not part of Undo / Redo (UNDO_REDO_SPEC.md: transforms only in Phase 6).



---



# Material Section



Displays:



```text

Material Name

Nozzle Temperature

Bed Temperature

Cooling

Speed Profile

```

Phase 8 (ADR-033 D5, D9; lot 70): a selector of the families loaded (MATERIAL_PROFILE_SPEC.md, Material Families, in the order of the list), with "No material" first, then the nozzle and bed temperature ranges, the fan, the density; a value not published shows "Not published". Choosing a family clears the filament when it belongs to another family. When the selected printer lists materials and the family is not in its list (after the aliases of MATERIAL_PROFILE_SPEC.md), a warning "Not listed by the printer manufacturer" is shown; the choice is never blocked. Material > Select Material opens this selector. The last choice is kept in the settings (USER_SETTINGS_SPEC.md, Material Settings).



---

# Filament Section

Displays:

```text
Filament Name

Brand

Color

Thermal Overrides

Cooling Overrides

Retraction Profile
```

Phase 8 (ADR-033 D9; lot 70): a selector of the filaments of the selected family (all the filaments when no material is selected), with "No filament" first, grouped by brand ("My filaments" first for the filaments of the user); choosing a filament also chooses its family. Then the brand, the color and the price per kg ("Not specified" when they are null, as for a shipped filament, a product line; lot 71), the temperature ranges of the manufacturer and its single values (manufacturerSettings, "Values of the manufacturer"); a value not published shows "Not published". Filament > Select Filament opens this selector; Filament > Manage Filaments and a "Manage…" button under the selector open the Filament Manager (lot 71). The last choice is kept in the settings.

---

# Filament Manager

Phase 8 (ADR-033 D10; lot 71). A dialog opened by Filament > Manage Filaments and by the "Manage…" button of the Filament Section. It adds, changes and removes the filaments entered by the user (Local Custom, FILAMENT_SETTINGS_SPEC.md), as the Printer Manager does for the printers.

Structure:

```text
Start side: My filaments (list), New filament, Copy a filament…
End side: form of the filament chosen, Save, Delete
```

- Copy a filament: any loaded filament, Official included; the copy is a new filament of the user, named "Name (copy)". Official filaments are never listed in My filaments, so they are never changed.
- Form (DATA_SCHEMA.md, Filament Schema): Brand, Name, Material (one of the families loaded, the selected family for a new filament) and Diameter (1.75 or 2.85 mm) are required; Color and Price per kg are entered by the user (empty: "Not specified", null); Density, the temperature ranges of the manufacturer (nozzle and bed, minimum and maximum) and the values of the manufacturer (nozzle and bed temperature, fan, retraction distance and speed) left empty are null, shown as "Not published". A minimum is never above its maximum; the fan is 0 to 100 %.
- Numbers accept a comma as decimal separator and are shown in the format of the language (Localization Support, Number Format).
- In the lists, a filament is named "Brand Name (Color)".
- Opened while the selected filament is a filament of the user, the dialog opens on that filament, in edition. The top of the form says what Save does: "Edit: Brand Name (Color)" for a filament of the user, "New filament" for a new filament or a copy.
- Errors are shown under their field: an invalid value as soon as it is typed, a required field left empty when the field is left or at Save; Save is disabled while an error is shown. Errors of the main process (FIL_001, FIL_003, FIL_004, FIL_005) are shown under the form. Two filaments with the same brand, name and color are refused.
- Delete asks for a confirmation ("Delete Brand Name?"). When the filament deleted is the selected filament, no filament is selected and the saved choice is cleared; the material stays selected. A change of the selected filament updates the Filament Section at once, and its family when the family changed.
- Changes of filaments are not part of Undo / Redo (UNDO_REDO_SPEC.md: transforms only in Phase 6).

---

# Print Preset Section

Displays:

```text
Draft

Balanced

Quality

Custom

Active Preset
```

Phase 10 (ADR-035 D12): the section shows the preset of the recommendation of the selected object (translated name of its category, preset.<category>), "—" when no object or several objects are selected, or when the object has no recommendation. It is a display only: the choice of a preset by the user and the Custom preset come in Phase 15 (Preset Library).

---

# Transform Section



Displays:



```text

Position X

Position Y

Position Z



Rotation X

Rotation Y

Rotation Z



Scale X

Scale Y

Scale Z

```

Details (Phase 6, decisions of Noam; DATA_SCHEMA.md, Transform Rules):

```text
Position X, Y   mm, editable: place of the center of the object
                (DATA_SCHEMA.md 3.4.0, Transform Rules)
Position Z      mm, shown but not editable: height of the center of the
                object, computed so that the object always stands on the
                build plate (an object can never be placed under the
                plate; sunk objects: KI-021)
Rotation X Y Z  degrees, around the axes of the build plate
Scale X Y Z     %, 100 % = imported size; a lock keeps the proportions
                (on by default)
Size X Y Z      mm, along the axes of the object, editable and linked to
                the scale: changing one updates the other
```

A value is applied with Enter or when the field loses the focus; Escape restores it; Ctrl+Z undoes the typing not applied yet, and otherwise undoes in the application (UNDO_REDO_SPEC.md, Keyboard Shortcuts); a comma is accepted as decimal separator, and the values are shown with the decimal separator of the language (Localization Support, Number Format); a value that is not a number, or a scale of 0.1 % or less, is refused. Every change of transform (fields, Transform Actions, gizmos) goes through one service (TransformService), where undo and redo are recorded.

The rows and the Transform Actions shown follow the mode of the gizmo (decision of Noam, Phase 6):

```text
Move     Position, Scale; Reset Position, Center On Bed, Reset Scale
Rotate   Rotation; Reset Rotation
Scale    Scale, Size; Reset Scale
```

Several objects selected (group, decision of Noam, Phase 6): the fields act like the gizmo on the group.

```text
Position X, Y   center of the group; a value moves the whole group
Position Z      height of the center of the group, not editable
Rotation X Y Z  0: a value turns the group around its center, around this
                axis of the build plate, then the field goes back to 0
Scale X Y Z     100 %: a value scales the group uniformly around its
                center, then the field goes back to 100 %; the lock is
                closed and cannot be opened
Size X Y Z      size of the group (bounding box); a value scales the group
                uniformly
Reset Position, Center On Bed   center of the group at the center of the
                                build plate
Reset Rotation, Reset Scale     rotation 0 or scale 100 % for each object
```



---



# Transform Actions



Buttons:



```text

Reset Position



Reset Rotation



Reset Scale



Center On Bed

```

```text
Reset Position   position X and Y back to the center of the build plate
                 (origin of the object at X = 0, Y = 0)
Reset Rotation   rotation 0, 0, 0
Reset Scale      scale 100 %
Center On Bed    the center of the bounding box of the object (as seen
                 from above, after rotation and scale) moved to the center
                 of the build plate
```

After each action, the object stands on the build plate.



---



# Analysis Section



Displays:



```text

Dimensions



Volume



Surface Area



Mesh Statistics



Overhangs



Bridges



Thin Walls



Stability

```

Phase 9 (ADR-034 D8, option A; lot 80). Values from the analysis of the object (DATA_SCHEMA.md, Complete Analysis Schema, Analysis Rules):

```text
Status: Up to date, Outdated, Analyzing…, or No analysis
Dimensions: W x D x H mm (dimensions)
Volume: cm³ (geometry.volume / 1000)
Surface Area: cm² (geometry.surfaceArea / 100)
Mesh Statistics: triangles, vertices
Overhangs: maximum angle (degrees) and % of the surface beyond 45 degrees, or "None"
Bridges: count and longest span (mm), or "None"
Thin Walls: minimum thickness (mm), "Thin walls detected" below 0.8 mm
Stability: contact area (cm²), height ratio, tip risk out of 100 with its level
           (Very low, Low, Moderate, High, Critical; AI_ENGINE_SPEC.md)
```

- One selected object: its analysis. Several selected objects: "Select a single object". No selected object: the section shows nothing else.
- An outdated analysis keeps its values, with the status Outdated, until it is computed again.
- A mesh not closed shows the warning of ANA_002 in the section (volume and wall thickness are approximate).
- Numbers follow the language (Localization Support, Number Format); the volume and the areas are shown in cm³ and cm² (the units of the slicers), the stored values stay in mm³ and mm² (DATA_SCHEMA.md).
- Texts in the three languages. The classification is not shown before Phase 10.
- src/gui/panels/AnalysisPanel.tsx (unused, text in English in the code, KI-015) is deleted (ADR-034 D9).



---



# Recommendation Section



Displays:



```text

Recommended Quality

Supports

Infill

Cooling

Retraction

Speed

Warnings

Confidence Score

Recommended Preset

```

Phase 10 (ADR-035 D3 and D12, option B). One selected object:

```text
Status: Up to date, Outdated, or No recommendation (as the Analysis section)

Visible:
  Object type: list "Automatic (<category>)" then the 15 categories
               (OBJECT_CLASSIFICATION_SPEC.md 1.2.0, User Choice), with the
               confidence level of the automatic classification
               (Very High, High, Medium, Low, Unknown)
  Preset: translated name of the category of the preset
  Warnings: translated text of each code (warning.<CODE>), the most severe
            first, with the color of their severity (critical in red)
  Confidence: score out of 100 and its level
              (Excellent, High, Moderate, Low, Very Low)

Under "Details" (folded by default):
  Quality: layer height (mm), walls, top / bottom layers
  Infill: % and pattern
  Supports: No, or Yes (type)
  Adhesion: skirt, brim or raft
  Temperatures: nozzle and bed (°C)
  Cooling: fan (%)
  Speeds: print, outer wall, inner wall, infill, travel (mm/s)
  Retraction: distance (mm) and speed (mm/s)
```

- Values are read-only: changing them means the Custom preset (Phase 15).
- Several selected objects: "Select a single object". No selected object: the section shows nothing else.
- No printer or no material selected: "Select a printer and a material" (REC_002); no message over the viewport.
- An object without an analysis up to date: "No recommendation" (the analysis comes first); an outdated recommendation keeps its values, with the status Outdated, until it is generated again.
- The object type can be chosen even when no recommendation can be generated yet; the choice is kept with the object (not saved in a project before Phase 13).
- The two confidence scales have distinct labels: "Classification confidence" (object type) and "Recommendation confidence".
- Numbers follow the language (Localization Support, Number Format). Texts in the three languages.
- src/gui/panels/RecommendationPanel.tsx and PresetPanel.tsx (unused, text in English in the code, KI-015) are deleted when the sections are done (ADR-035 D13).

Lot 88 details: the list Object type appears once the object has been analyzed (its classification exists), also without a printer or a material; before, the section shows only its status. "Classification confidence" is the level of the automatic classification, also when the user chose a category (the category chosen has the confidence 100). Colors of the warnings: critical in red, high and medium in orange (warning color), low in the color of the text, info in gray. The infill pattern, the support type and the adhesion are translated. REC_001 (in red) and REC_002 are shown in the section only. The Print Preset section and the status bar show "—" when no preset can be shown.



---



# Notification Area



Position:



Bottom



---



# Notification Types



```text

Information



Success



Warning



Error

```



---



# Status Bar



Displays:



```text

Selected Printer

Selected Material

Selected Object

Object Count

Analysis Status

Selected Filament

Active Preset

Current Language

Project Status
```

Analysis Status (Phase 9, ADR-034 D7; lot 80): "Analyzing…" while an analysis is computed.

Active Preset (Phase 10, ADR-035 D12): the preset of the recommendation of the selected object, "—" otherwise (same rule as the Print Preset section).



---



# Search System

Printer Search

Material Search

Object Search

Filament Search

Preset Search

---



# Drag And Drop



Supported

Files can be dropped directly inside viewport.

Accepted:


```text

STL

3MF

WYPROJ
```



---



# Keyboard Shortcuts



---



## Project



```text

CTRL + N     New Project



CTRL + O     Open Project



CTRL + S     Save Project

```



---



## Edit



```text

CTRL + Z     Undo



CTRL + Y     Redo



CTRL + SHIFT + Z  Redo (UNDO_REDO_SPEC.md)



DELETE       Delete Object

```



---



## Selection



```text

CTRL + A     Select All (not in a text field)



CTRL + Click Add or remove an object (Multi Selection)



SHIFT + Click  Select a range in the Object Panel (Multi Selection)



ESC          Deselect

```



---



## View



```text

F            Focus Selection



HOME         Reset Camera

```



---



## Transform



```text

G            Move



R            Rotate



S            Scale

```

G, R and S choose the mode of the gizmo, when an object is selected. They are read by their position on the keyboard, so they work the same with an English, French or Hebrew layout. The shortcuts of the viewport (G, R, S, ESC, HOME) are not active while a text field has the focus: in a field, ESC restores the value and keeps the selection.



---



# AI Assistant Panel



Future Feature



Position:



Right Side



Optional



---



# AI Assistant Displays



```text

Warnings

Recommendations

Optimization Suggestions

Printability Advice

Confidence Score

Recommended Filament

Recommended Preset
```



---



# Responsive Behavior



Panels may:



```text

Collapse



Resize



Hide

```



Layout should remain functional at:



```text

1280x720



1920x1080



2560x1440



3840x2160

```



---



# Error Handling UI



Display clear messages:



Examples:



```text

Invalid STL



Corrupted File



Unsupported Format



Profile Load Failure



Analysis Failure

```



No technical stack traces visible to user.

Analysis messages (Phase 9, ADR-034 D6; lot 80): ANA_001 (no analysis: empty or unreadable mesh, or failure of the computation) is an error; ANA_002 ("Mesh not closed: volume and wall thickness are approximate") is a warning that does not block: the analysis is shown. Both are translated and shown like the messages of the import.

Lot 80 details: the messages of the analysis are shown under those of the import and stay until closed. ANA_002 is shown over the viewport once per object (not at each new computation); the Analysis section shows it as long as the last analysis of the object found a mesh not closed. After ANA_001, the object is not analyzed again by itself until its rotation or scale changes; Tools > Analyze Models and Recompute Analysis try again.



The import messages shown over the 3D viewport (progress, confirmation, error) never stop the clicks in the viewport under them: only their Cancel and Close buttons receive the pointer (decision of Noam, lot 55).



---



# Accessibility



Support:



```text

Keyboard Navigation

High Contrast Theme

Scalable Fonts

Color Safe Warnings

RTL Language Support

```



---

# Localization Support

Supported Languages:

English
French
Hebrew

Translation Source:

```text
public/locales/
```

Files:
```text
- en.json
- fr.json
- he.json
```

Managed By:

```text
LanguageManager
LocalizationService
TranslationLoader
NumberFormatter
```

Number Format (Phase 9 lot 81, request of Noam, 2026-11-02):

- Every number shown in the interface follows the format of the language, in every section (Printer, Material, Filament, Transform, Analysis, status bar, plate size, Printer Manager, Filament Manager): comma as decimal separator in French, point in English and Hebrew; two decimals at most.
- A value only read uses the digit grouping of the language ("20,000" in English and Hebrew, "20 000" in French), as the Analysis section did first.
- A value in a field has no digit grouping, so that it can be typed and read again; a comma or a point is accepted as decimal separator in every language.
- The language never changes the stored values: projects, settings and profiles keep JSON numbers (language-neutral).

---

# Future GUI Features



Reserved:



```text

Slicing Preview

G-Code Viewer

Remote Printers

Camera Monitoring

Multi Material Visualization

Cloud Projects

Filament Manager

Preset Library

Profile Repository Browser

```

Overhang Display: done in lot 82 (see Overhang Display, under 3D Viewport).



---



# GUI Golden Rules



1. The viewport is the primary focus.



2. Important information must remain visible.



3. User actions should require the minimum number of clicks.



4. Every action should provide visual feedback.



5. Changes must never surprise the user.



6. Advanced options should be available without overwhelming beginners.



7. AI recommendations should assist, not replace, user decisions.



---



# End Of Document
