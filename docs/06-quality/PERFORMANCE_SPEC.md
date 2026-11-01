# SlicyWeb Smart Slicer

# PERFORMANCE SPECIFICATION



Version: 1.1.0



Status: Approved

Priority: High



---



# Purpose



Defines performance requirements.



---



# Startup Targets



```text

Cold Start < 3 seconds



Warm Start < 1 second

```



---



# Viewport Performance



Target:



```text

60 FPS

```



Minimum:



```text

30 FPS

```



---



# STL Loading Targets



```text

50 MB STL < 2 sec



500 MB STL < 10 sec

```



---



# Supported Geometry



```text

100K Triangles



500K Triangles



1M Triangles



5M Triangles+



10M Triangles Future

```



---



# Memory Targets



Normal Session:



```text

< 2 GB RAM

```



Heavy Session:



```text

< 8 GB RAM

```



---



# Optimization Methods



Use:



```text

BVH

Geometry Caching

Lazy Loading

Instancing

LOD

```



---



# Analysis Performance



Analysis should run asynchronously.



GUI must remain responsive.

Phase 9 (ADR-034 D7, D10): the analysis runs in a Web Worker, one object at a time; a computation that is no longer needed (object removed, or turned again) is dropped.

Target:

```text
1M Triangles Analyzed < 5 seconds
```

on the Windows 11 computer used for the validation, the interface staying fluid. Larger models are analyzed too (no limit of the analysis; the limits of the import stay), with "Analyzing…" in the status bar. The target is checked at the closure of Phase 9; it does not block.

Thin walls: at most 200 000 measured points per object, with a BVH (three-mesh-bvh).



---

# Classification Performance

Target:

```text
< 500 ms
```

for standard models.

---

# Confidence Calculation Performance

Target:

```text
< 100 ms
```

---

# Scene Management


Only re-render modified objects.

Avoid full scene refresh.


---


# Caching Rules



Cache:



```text

Printers

Materials

Filaments

Print Presets

Analyses

Downloads

Recommendations

```



---



# AI Performance

```text
Classification < 500 ms

Recommendation Generation < 1 second

Confidence Calculation < 100 ms
```

for standard models.


---


# Large Model Handling


When geometry exceeds threshold:



```text

Display Warning



Enable Optimized Mode

```


---

# Large Scene Handling

When scene complexity exceeds threshold:

```text
Enable LOD

Reduce Update Frequency

Use Cached Analysis

Enable Performance Mode
```

---

# Performance Monitoring



Track:

```text

FPS

RAM

CPU

GPU

Render Time

AI Response Time

Classification Time

Cache Hit Rate

```



---



# Performance Alerts



Generate warnings when:



```text

Low FPS

High RAM

Slow Analysis

Slow Classification

Slow Recommendation Generation

Cache Miss Rate High

```



---

# Repository Performance

Target:

```text
Profile Search < 500 ms

Repository Sync < 10 sec

Cache Refresh < 5 sec
```

---

# Auto Save Performance

Target:

```text
Auto Save < 1 second

Recovery Load < 3 seconds
```

---

# Database Performance

Target:

```text
Printer Lookup < 100 ms

Material Lookup < 100 ms

Filament Lookup < 100 ms

Preset Lookup < 100 ms
```

---

# Future Performance Targets

Reserved:

```text
10M Triangle Models

Multi Build Plates

Cloud Synchronization

Distributed Analysis

GPU Accelerated Classification
```

---

# Golden Rule



Performance improvements must never compromise correctness.



---



# End Of Document

