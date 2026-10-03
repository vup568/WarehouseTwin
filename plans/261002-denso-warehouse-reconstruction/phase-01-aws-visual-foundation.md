---
phase: 1
title: "AWS Visual Foundation at 10,000 m²"
status: in-progress
priority: P1
dependencies: [0]
---

# Phase 1: AWS Visual Foundation at 10,000 m²

## Overview

**Latest roof-only revision, 2026-10-03:** roof elevation is now **25 m**, superseding the 10 m setting recorded below; preserve every other environment/rack/layout/camera behavior. Earlier checks and screenshots remain dated evidence, not 25 m visual acceptance.

Restore the AWS visual language for the current Denso footprint: AWS floor and roof assets are composed at `110 m × 90 m`; walls remain hidden. Latest user revision removes hanging lamps while retaining background illumination and raises the reused roof to 10 m for the demo.

**Execution status, 2026-10-03:** revised technical implementation and browser verification completed; user visual approval is pending. Footprint is exactly 9,900 m², approximating the 10,000 m² demo requirement. See [current implementation report](./reports/industrial-rack-implementation.md). The user expressly authorized Phase 2 alongside these environment revisions; this is not visual acceptance. [Original Step A report](./reports/step-a-implementation.md) remains dated history of the previous lamps/5 m design.

## Locked Requirements

- Reuse AWS `GroundB_01`, `RoofB_01`, their material/texture appearance and compatible props. Exclude `Lamp_01` from active load/render/production assets; preserve its original source.
- Compose modules to cover the Denso footprint. Do not scale one small AWS warehouse mesh to 10,000 m².
- Render Denso floor markings separately for inbound, outbound, forklift, AGV and AMR. Markings must not be baked into an AWS model.
- Preserve a manual Roof on/off control. Do not implement opacity, auto-hide or cutaway behavior.
- Hide both AWS and procedural Denso walls. The UI must not imply walls/gates are accepted functionality in this phase.
- Support Day and Industrial/Night lighting. The scene must stay legible at the largest OrbitControls distance.
- Roof placement is 10 m in the demo; the earlier ~5 m actual-warehouse estimate remains historical information, not a revised field measurement.
- Keep ambient/hemisphere/directional scene lighting, with no hanging fixtures or fixture point lights. Remove the obsolete Lights control.
- Do not move racks, operational cells, barriers, camera presets or flow data except to correct an evidenced technical incompatibility.

## Architecture

```text
DENSO_LAYOUT_V1.warehouse (110 × 90 m)
          │
          ├── AwsAssetLibrary: cache one DAE per model ID; clone with one transform adapter
          │      ├── AwsGroundTiles
          │      ├── AwsRoofTiles          ← layers.roof only
          │      └── ambient/hemisphere/directional fill (no lamp models)
          │
          └── DensoFloorMarkings: independent paths/surfaces from layout lanes and flows

Scene3D: camera + fog/lighting policy + above layers + existing Denso operations
```

The loader must filter out AWS `wall` and old `rack` instances. It must not re-add the original small-world placement group wholesale. A local-bounds inspection chooses tile pitch and overlap; all placement derives from footprint dimensions.

## Related Code Files

| Action | File | Responsibility |
|---|---|---|
| Created | `src/components/scene/aws-asset-library.ts` | Cache approved DAE templates; use ColladaLoader unit/up-axis conversion once; select concrete geometry bounds, preserve maps and handle failed loads/retry. |
| Created, revised | `src/components/scene/AwsEnvironmentAssets.tsx` | Clone 40 clipped ground/roof modules; place roof at 10 m; no lamp composition. |
| Created, revised | `src/components/scene/AwsWarehouseLighting.tsx` | Day/Night base fill and one shadow-casting directional light; no fixture point lights. |
| Created, revised | `src/data/aws-environment-layout.ts` | Measured concrete module pitch; footprint-derived tiles and unchanged camera range; manifest only ground/roof. |
| Created | `src/data/denso-floor-markings.ts` | Five marking categories from existing flow/lane/work-cell data; do not connect inbound STORE nodes through racks. |
| Created | `src/components/scene/DensoFloorMarkings.tsx` | Independent line/arrow/label renderer above concrete and stage surfaces; render-order correction. |
| Modified | `src/components/scene/Scene3D.tsx` | Mount AWS environment/markings, omit old shell/walls and old lane renderer, remove fog, scale clipping/range and expose camera presets. |
| Modified | `src/state/store.ts` | Walls off, camera preset state, manual roof control and independent rack/cargo visibility; no fixture lights layer. |
| Modified | `src/components/shell/TopBar.tsx` | Roof/Day-Night/preset controls; no wall/Lights control; indicate revised scene pending review. |
| Modified | `src/App.tsx`, `src/App.css` | Current review description, marking legend, asset-status UI and compact control wrapping. |
| Modified | `vite.config.ts` | Emit two approved ground/roof DAE assets and three referenced PNG textures into production `dist/models/`. |
| Phase 2 revision | `src/components/scene/DensoRackInstances.tsx` | Now render independent industrial structure; former placeholder retained only in dated Step A history. |
| Created, revised | `tests/aws-environment-layout.test.ts` | Six tile/manifest/10 m roof/camera/marking/invalid-dimension tests. |
| Preserved | `src/components/scene/ColladaModels.tsx`, `src/components/scene/DensoWarehouseShell.tsx`, `tests/denso-layout.test.ts` | Original loaders/shell retained but unmounted; 16 previous layout tests retained. |

## Implementation Steps

1. Inventory each active AWS source DAE’s local bounds, material maps and orientation. Record the selected ground/roof module size in a code comment or data constant, not guessed numbers in JSX.
2. Create the cached asset-loader interface in `aws-asset-library.ts`, leaving the old `ColladaModels.tsx` intact and unmounted. It loads each approved DAE once, marks texture maps sRGB/materials double-sided, and returns clone-safe templates. Concrete material geometry alone defines floor bounds; old AWS route paint is excluded.
3. Derive the tile plan and camera policy in `src/data/aws-environment-layout.ts` from `DENSO_LAYOUT_V1.warehouse`; share these pure calculations with tests.
4. Render repeated `GroundB_01` modules. Validate no visible seam, z-fighting or large unpainted edge. If source geometry cannot tile cleanly, preserve its material/texture through a purpose-built tiled plane; do not fall back to the current grey box.
5. Render repeated `RoofB_01` modules at the user-authorized **10 m demo elevation**, not a claimed real-world warehouse height. Bind all roof meshes solely to `layers.roof`. Default roof off for interior/layout review, but preserve the user-controlled Roof button.
6. Remove hanging lamp composition and fixture point lights. Keep ambient/hemisphere base and one directional shadow light for readable Day/Night review; remove Lights UI. This explicitly replaces the original fixture grid decision.
7. Remove the current `fogExp2` behavior that darkens a large scene while zooming out. Use no fog for the acceptance scene unless a distance-fog alternative is visibly neutral at overview. Set camera clipping/OrbitControls range from the Denso footprint.
8. Render Denso floor-marking components above AWS ground by a controlled elevation. Keep color, line width and arrows in data/configuration. Include distinct markings for forklift, AGV, AMR, inbound and outbound; do not change their underlying flow/lane coordinates in this phase.
9. Force wall layers off and omit both AWS `WallB_01` and `DensoWarehouseShell` perimeter-wall meshes. Do not create substitute walls, gates or doors.
10. Run automated checks and browser walkthrough at overview, maximum zoom out, rack aisle/end and roof interior views. Supply evidence, then wait for user visual approval.

## Tests Before / Regression Protection

- Add tests that tile transforms cover `[0, 110] × [0, 90]` without gaps beyond an agreed perimeter tolerance.
- Test roof transforms are derived from exactly the same tile plan as ground transforms, at the warehouse roof elevation.
- Test active manifest has only ground/roof, with no AWS wall/lamp model ID; test current roof elevation is 10 m.
- Test all floor-marking path points are valid Denso layout points and preserve their vehicle-mode association.
- Preserve `npm test`, `npm run build`, and `git diff --check` as mandatory commands.

## User Acceptance Gate A

The implementation stops and waits for the user after the following evidence is supplied:

- One overview screenshot with roof off and markings visible.
- One interior/oblique screenshot with roof on at 10 m and no hanging lamps.
- One maximum zoom-out screenshot proving the scene is not darkened by distance/fog.
- Confirmation that no wall is rendered and that the roof button works.

The user may approve, request changes or reject the revised environment. Phase 2 implementation has already been explicitly authorized, but its visual gate is still pending. Phase 3 sign-off and all later feature work remain blocked.

## Success Criteria

- [x] AWS ground/roof models and materials—not procedural stand-ins—cover the 9,900 m² scene; roof is at 10 m and hanging lamps are absent.
- [x] Floor markings are independent Denso layers and remain visible above the AWS ground.
- [x] Walls are not rendered by default or through hidden leftover AWS instances.
- [x] Roof has only a manual on/off toggle.
- [x] Maximum zoom-out view is readable in both Day and Industrial/Night modes in browser evidence.
- [x] Technical browser review found no runtime errors; revised manifest excludes lamps, roof minimum Y is 10 m, and camera changes preserve manual roof visibility. User aesthetic review remains pending.
- [ ] User explicitly approves Step A.

These technical checks do not represent user acceptance. Current screenshots and `industrial-rack-visuals/review-results.json` are linked in the report; workstation performance and visual preferences must be checked by the user before Gate A is closed.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AWS DAE module cannot tile without obvious seams | Measure local bounds first; choose controlled overlap or retain texture/material on tiled geometry only if clone tiling is visually unacceptable. |
| Dense integrated scene causes GPU cost | No fixture lights; retain one directional shadow map and measure workstation performance during final UAT. |
| Refactor accidentally restores AWS walls or old racks | Explicit category allow-list and a test against `wall`/`rack` model IDs. |
| User-approved scene changes during Phase B | Gate A freeze rule; record any exception in the plan and obtain explicit approval. |

## Security Considerations

No network or user data changes. Asset loading stays local and uses known warehouse manifest paths; do not accept arbitrary model URLs.
