---
date: 2026-10-02
topic: denso-v1-scene-slice
status: completed-uncommitted
---

# Denso V1 Scene Slice

## Context

The AWS RoboMaker warehouse scene is being migrated toward the Denso TLIP external-warehouse layout. The approved operational direction is three independent East inbound cells and a West outbound handoff, with separated forklift, AGV, and AMR areas.

## What Happened

- Replaced the prior scene assembly with independently named Denso shell, rack, operational-cell, safety-barrier, and vehicle-lane components.
- Added v1 layout data for the three East gates/cells, West outbound flow, conveyors, customs fence/camera, double racks, and forklift work cells.
- Cut real East and West wall openings at each gate; gate indicators no longer sit on continuous walls.
- Added independent AGV, AMR, and safety-barrier visibility controls.
- Strengthened layout validation: v1 flow sequencing, one forklift per distinct work zone, a touching barrier for each work cell, and non-forklift lane exclusion from forklift work zones.
- Rerouted AGV so its swept path no longer crosses the outbound forklift pick zone.

## Reflection

The first v1 rendering exposed an important distinction: data objects can be separated in code while still being operationally unsafe in geometry. Structural validation now covers the vehicle/work-cell separation rule instead of relying on the drawing alone. Camera/screenshot automation was unavailable in this environment, so visual walkthrough remains a manual acceptance step.

## Decisions

- Keep `DENSO_LAYOUT_V0` as the migration baseline and export v1 as the active layout.
- Model the Denso scene as independent components so later interaction and vehicle behavior can be added without rewriting the warehouse shell.
- Treat forklift-work-cell limits and lane/barrier separation as validated layout rules, not display-only annotations.
- Do not commit or push this slice; working-tree changes remain uncommitted for user review.

## Next

- Manually review the live 3D scene against the approved v1 layout.
- Add actual vehicle actors/behaviors, beginning with the AWS-origin vehicle models requested for the demo.
- Continue maintaining negative regression coverage for duplicate forklift work zones, non-touching barriers, and vehicle-lane/work-zone overlap; these cases are now covered by tests.
