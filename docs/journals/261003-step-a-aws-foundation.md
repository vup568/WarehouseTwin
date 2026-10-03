---
date: 2026-10-03
session: step-a-aws-foundation
status: waiting-user-visual-approval
---

# Journal: 2026-10-03 — Step A AWS Foundation

## Context

User requested an AWS-first warehouse foundation for the current Denso 110 × 90 m footprint. Step A must receive explicit visual approval before Phase B industrial-rack construction starts. Feature-folder reorganization is deferred.

## What Happened

- Reused AWS GroundB_01, RoofB_01 and Lamp_01 models, textures and materials; repeated modules cover 9,900 m² with clipped perimeter edges.
- Removed the small-warehouse distance fog, adapted camera limits and lighting to the large footprint, and retained manual roof and light controls with Day/Night modes.
- Added independent Denso inbound, outbound, forklift, AGV and AMR floor markings. Walls remain absent from the scene.
- Fixed a floor-seam defect: old painted-route geometry extended outside the concrete and inflated its bounds. Concrete-only geometry groups now define normalization and module spacing (13.98046997 × 20.90666382 m).
- Rendered floor paint after opaque ground to prevent later ground draw calls covering markings.
- Kept the existing rack structure. A visibility-lifecycle correction keeps instance refs mounted when Racks is OFF, preventing Randomize errors and invalid matrices after toggling ON.

## Reflection

Asset bounding boxes must reflect the geometry actually displayed. Hiding a material alone does not exclude its vertices from bounds. Static data tests and visual inspection serve different purposes; technical verification does not constitute user acceptance.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| AWS assets define the visual foundation | User's AWS-first reuse policy | Preserve floor, roof and fixture appearance at Denso scale |
| Separate concrete from old AWS route geometry | Avoid gaps and inaccurate placement | Correct tile dimensions and retain Denso markings independently |
| Step A waits for explicit user visual approval | Previously agreed acceptance gate | Phase B remains blocked by the approval gate |

## Next Steps

- Present Step A for user review: floor, roof ON/OFF, fixtures, Day/Night, zoom-out and floor markings.
- Record requested visual adjustments and approval before beginning Phase B.
- Once accepted, preserve the approved floor, roof, lighting and camera while constructing the industrial rack; report any mandatory technical exception.
