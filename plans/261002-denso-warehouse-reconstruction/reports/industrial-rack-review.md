# Industrial rack and roof revision — independent review

Date: 2026-10-03. Scope: the user's explicit authorization to remove hanging lamp models, retain background illumination, raise the AWS roof to 10 m, and build the previously agreed industrial double rack. This is not acceptance of the previous Step A or of the current visuals.

## Verdict

Technical spec/code review: **PASS, no new P1/P2 findings** in the implementation inspected. User visual acceptance remains pending. Geometry is a warehouse visualization, not a certified structural/load-bearing engineering design.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| No hanging fixtures; scene remains lit | AWS manifest and loader now contain only floor/roof; environment renderer mounts no lamps; lighting retains ambient, hemisphere and directional fill; Lights control removed. Legacy `layers.lights` retained as false for compatibility, not consumed by the active scene. |
| AWS roof at 10 m; manual visibility | `DENSO_LAYOUT_V1.warehouse.heightM = 10`; roof clones use that elevation; Roof toggle retained. Legacy v0 stays 5 m; validation intentionally handles the two versions. |
| 6 × 10 × 2 positions | Generator produces 120 stable unique slots per rack; all 16 racks total 1,920; seven-level fixture produces 140. The historical 200-pallet reference does not create physical slots. |
| Industrial structure without cargo | Each rack has 44 uprights, 44 baseplates, 240 front/rear beams, 360 pallet supports, 132 diagonal braces, 154 frame ties, 33 back-to-back spacers and 120 decks. Picking openings are not blocked by depth-plane diagonal bracing. |
| Actual deck/support geometry | Mesh deck uses shared merged wire geometry, not pallets as a substitute; generator tests locate exactly one deck under each slot and actual bearings touching its underside. Six deck tops are 0.24, 1.02, 1.80, 2.58, 3.36 and 4.14 m; frame height is 4.68 m. |
| Pallet/box separate from rack | `DensoPalletInstances` is a sibling of structure in Scene3D, keyed to cargo visibility only; cargo remains visible when structure is hidden. Wooden pallet members, box and tape are distinct parts; deterministic fixture uses one pallet/SKU per bin, 1,114 occupied bins at seed 42. |
| Toggle/randomization lifecycle | Shared instanced renderer keeps refs mounted and refreshes instance matrices plus bounding box/sphere on parts changes. Structural transforms are independent of cargo seed and visibility. |
| No unrelated layout change | SHA256 unchanged for floor-marking renderer/data, safety barriers, operational cells and forklift work cells. Exact v1 source comparison shows only warehouse height 5→10 plus an explanatory comment; all rack centers, lanes, gates, flow nodes, cameras and presets remain identical. |
| Bounds/orientation | Tests verify transformed members inside main storage, clear of operational barriers, at non-negative elevations, and correct X/Z orientation. |

## Fresh verification

- `npm test`: 30/30 pass, 0 failures.
- `npm run build`: exit 0; TypeScript and Vite pass; emitted AWS static files contain floor/roof only. Existing large-chunk warning remains informational.
- `git diff --check`: exit 0.
- Browser technical checks: **PASS**. Independently inspected `industrial-rack-visuals/review-results.json`: `errors: []`, roof minimum world Y = 10 m, no fog, eight structure classes and 1,920 deck instances, 1,114 occupied demo bins. Active light classes are AmbientLight, HemisphereLight and DirectionalLight only; no hanging fixture/point-light layer or Lights button remains.
- DOM/browser checks pass: cargo OFF does not change structure; racks OFF leaves cargo ON; Randomize while racks are hidden updates/restores matrices and bounds; roof visibility is preserved when changing camera presets. Captured scene reports 192 draw calls and 1,109,108 triangles. These are renderer counts, not measured FPS or performance acceptance.
- Main agent inspected cargo-off aisle/end screenshots and the 10 m roof screenshot for decking, supports, bracing and back-to-back separation. User visual acceptance remains pending.

## Risks / remaining approval

- Physical deck mesh has 31 small box members per deck (about 714,240 deck triangles across 1,920 slots), with deck shadow casting disabled. Browser checks establish bounded draw calls and working controls; actual device FPS/performance and user close-up/overview acceptance remain unverified.
- Existing 2.5 m bay pitch is deliberately preserved; with one 1.13 m pallet per bin, no claim is made that the historical 10 cm pallet-gap statement has been geometrically reconciled.
- Confirm cargo-off aisle/end/overview appearance and roof clearance with the user before starting vehicles, walls, navigation or other deferred work.

## Read-only Git audit

Branch: `main`. Staged diff is empty. The worktree was already dirty, including package/config/App changes and untracked migration/layout documentation. Review performed no application edits, commit, stage, push, stash, reset, checkout or cleanup; existing user/session changes were preserved.
