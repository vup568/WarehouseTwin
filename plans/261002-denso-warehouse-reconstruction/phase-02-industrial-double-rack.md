---
phase: 2
title: "Industrial Selective-Pallet Double Rack"
status: in-progress
priority: P1
dependencies: [1]
---

# Phase 2: Industrial Selective-Pallet Double Rack

## Overview

**Latest roof-only revision, 2026-10-03:** roof elevation is now **25 m**, superseding the prior 10 m authorization recorded below; no rack/cargo/layout/camera change or new phase work is authorized. Visual approval remains pending.

Build a real-looking industrial selective-pallet rack, back-to-back, using the approved Denso data. The structure must remain credible when every pallet and box is disabled.

**Technical status:** implemented and browser-checked; 30/30 tests and build pass. All 16 racks provide 120 slots each (1,920 total), with eight structural member classes and separate pallet/box rendering. See [implementation/evidence](./reports/industrial-rack-implementation.md). User visual approval remains pending; this phase is not marked completed.

**Execution authorization, 2026-10-03:** the user explicitly requested removal of hanging lamps while retaining background illumination, raising the AWS roof to 10 m, and proceeding with the previously agreed industrial rack. This supersedes the earlier restriction on beginning rack work; it is not blanket visual acceptance of Step A. Preserve AWS concrete floor, markings, routes, wall visibility and camera. Implement the three authorized changes together and then stop for visual review.

## Locked Requirements

- One double rack is `6 levels × 10 pallet positions per face × 2 faces = 120 positions`.
- Each position is a clear physical location even when unoccupied. One bin accepts at most one pallet and one SKU.
- Structure includes upright frames, load beams, pallet supports/cross members, diagonal bracing, row spacers and suitable decking.
- Pallet/box rendering is a separate data-driven layer. Cargo cannot be used as a visual substitute for deck, beams or supports.
- Maintain AWS-first policy where an AWS material/asset is visually suitable, but do not force a small AWS shelf asset into a Denso industrial rack if it makes structural geometry inaccurate.
- Preserve floor, fog, camera, wall visibility and floor markings. The user explicitly authorized roof elevation 10 m and removal of hanging lamps while keeping background lighting; no other environment revisions are implied.

## Architecture

```text
RackBlock (DENSO_LAYOUT_V1)
        │  6, 10, 2; 2.5 m bin pitch; 2.2 m double-rack depth
        ▼
IndustrialRackGeometry generator (pure transforms)
 ├── uprights + diagonal bracing
 ├── front/rear load beams
 ├── pallet support / cross members
 ├── deck surfaces
 ├── row spacers
 └── 120 stable pallet-position transforms
        │
        ├── IndustrialDoubleRackInstances (structure only)
        └── DensoPalletInstances (optional inventory/cargo only)
```

The geometry generator is authoritative for both rendering and tests. It does not inspect random cargo state. `palletPositionCount` is derived and verified against the specification; it is not trusted as a hand-entered display number.

## Related Code Files

| Action | File | Responsibility |
|---|---|---|
| Preserved contract | `src/data/denso-layout.types.ts` | Existing RackBlock/BinAddress sufficient; no replacement layout contract required. |
| Modified, approved height only | `src/data/denso-layout-v1.ts` | Retain 6×10×2/rack coordinates and routes; set warehouse demo roof elevation to 10 m. |
| Created | `src/components/scene/industrial-rack-geometry.ts` | Pure transforms/counts for eight member classes and 120 position transforms. |
| Created | `src/data/denso-industrial-racks.ts` | Shared generated structures/slots for all 16 layout racks. |
| Created | `src/components/scene/InstancedRackParts.tsx` | Shared instancing/matrix/bounds lifecycle for structural and cargo parts. |
| Replaced renderer | `src/components/scene/DensoRackInstances.tsx` | Render all industrial members, with one reusable merged wire-mesh deck geometry. |
| Created | `src/components/scene/DensoPalletInstances.tsx` | Render pallets/boxes from independent demo inventory records; honor `layers.cargo`. |
| Created | `src/data/denso-demo-inventory.ts` | Deterministic seeded occupancy/SKU fixture with duplicate/orphan validation; default seed 42. |
| Modified | `src/components/scene/Scene3D.tsx` | Mount structure and cargo separately; environment changes restricted to user-authorized lamp/roof revision. |
| Preserved cargo seed | `src/state/store.ts` | Rack and cargo visibility remain independent; seed changes only demo occupancy. |
| Created | `tests/industrial-rack-geometry.test.ts` | Eight tests for count, uniqueness, bearing geometry, rotation, bounds and cargo separation. |
| Modified validator | `src/data/denso-layout.ts` | Validate 10 m active demo height while preserving legacy v0 baseline behavior. |

## Implementation Steps

1. Before editing, re-run environment regression checks; existing Step A screenshots are unaccepted history, not an approved baseline. Change only the two newly authorized environment requirements alongside rack construction.
2. Define demo visual rack section dimensions: upright width/depth, load-beam height, deck thickness, support spacing, brace section and row-spacer offset. Preserve 2.5 m bin pitch, 2.2 m depth and 0.78 m level pitch; roof elevation is now explicitly authorized at 10 m. These are visualization dimensions, not a certified load-bearing construction design.
3. Generate two back-to-back faces. For every level and face, create 10 stable `BinAddress`/slot transforms; verify 120 locations per rack. Keep the current `2.5 m` bin pitch explicit and do not silently alter it.
4. Generate upright frames at bay boundaries; add diagonal bracing to each end frame (and intermediate frames only where required by the defined visual standard), not random diagonal bars.
5. Generate front/rear load beams, per-position pallet supports/cross members, deck surfaces, dividers where needed to read positions, and row spacers joining the two rear frames.
6. Use instanced meshes for repeated steel members. Preserve strong structural silhouette at aisle and overview distances; use material contrast between uprights, safety beams and deck/support parts without making the rack toy-like.
7. Move all pallet/box matrices into `DensoPalletInstances`. Each record references one bin, validates a maximum of one pallet and one SKU, and can be hidden without changing the rack structure.
8. Keep cargo occupancy deterministic. Fast/slow classification remains data owned and does not alter structure.
9. Validate close-up, aisle, and overview views with cargo on and cargo off. Inspect front, rear and both rack ends so row spacers and bracing cannot be hidden by camera angle.

## Tests Before / Regression Protection

- For every rack: `levels × binsPerLevel × faces = 6 × 10 × 2 = 120` unique slot IDs.
- A 7-level fixture produces exactly 140 positions without code branching in the renderer.
- Every generated pallet transform maps to exactly one valid structure slot; an orphan pallet or duplicate SKU/pallet bin fails validation.
- Structure transform counts are non-zero for each mandatory member type: upright, load beam, support/cross member, brace, spacer and deck.
- Toggling cargo changes only cargo visibility/matrices; it cannot reduce structure counts.
- All rack structural bounds remain inside `zone-main-storage` and do not intersect barriers or approved lane buffers.

## User Acceptance Gate B

Provide cargo-on and cargo-off screenshots of one representative rack from:

1. an oblique aisle view;
2. an end-frame view showing diagonal bracing and row spacers;
3. an overview showing the double-face layout.

The user accepts only if cargo-off rack geometry still reads as a robust factory selective-pallet rack.

## Success Criteria

- [x] Every double rack has exactly 120 physical pallet positions/decks in the 6-level demo; 1,920 across 16 racks.
- [x] Upright frames, load beams, supports, braces, spacers and mesh decking are present and browser-visible with cargo disabled.
- [x] Cargo is an independent data/renderer layer; browser checks confirm cargo visibility/seed cannot change structure and toggles remain independent.
- [x] Positions, bounds, bearing support, pallet capacity and one-SKU invariant pass tests.
- [x] Floor, camera, fog, markings and wall visibility are preserved; roof 10 m and lamp removal are the explicit user-authorized exceptions.
- [ ] User approves the rack visual at cargo off.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Dense 16-rack scene reduces frame rate | Instance repeated members; do not render labels for every bin at overview zoom. |
| Physical dimensions exceed storage zone | Validate generated bounds against the data layout before rendering; revise only data with explicit evidence. |
| AWS shelf asset is visually inconsistent at six-level Denso scale | Use AWS industrial materials/color cues where valid; prefer accurately generated rack members over a distorted AWS shelf mesh. |
| Phase A visual regressions leak in | Preserve non-revised environment contracts; compare only intentional lamp/10 m roof differences, then wait for combined user review. |

## Security Considerations

No external inputs or network access. Inventory fixtures remain local static demo data.
