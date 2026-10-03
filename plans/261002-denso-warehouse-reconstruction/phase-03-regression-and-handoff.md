---
phase: 3
title: "Regression, Visual Acceptance and Handoff"
status: blocked
priority: P1
dependencies: [2]
---

# Phase 3: Regression, Visual Acceptance and Handoff

## Overview

Verify the approved AWS-first environment and industrial rack together, record the acceptance baseline, and prepare a clean boundary for later vehicle work. This phase does not implement vehicles, walls or new operations UI.

**Execution status, 2026-10-03:** blocked by revised environment/rack user approval. Phase 2 implementation was explicitly authorized and is technically ready, but Gate A/Gate B visual acceptance is not recorded. Current 30/30 test/build and combined browser checks are implementation evidence, not completion of final workstation UAT/sign-off. All final-phase success criteria remain unchecked; see [current report](./reports/industrial-rack-implementation.md).

## Related Files

| Action | File | Responsibility |
|---|---|---|
| Modify | `tests/denso-layout.test.ts` | Keep layout constraints green after final integration. |
| Modify | `tests/aws-environment-layout.test.ts` | Confirm ground/roof-only manifest, 10 m roof elevation, tile bounds and lamp/wall exclusion. |
| Modify | `tests/industrial-rack-geometry.test.ts` | Confirm structural and cargo-separation invariants. |
| Create | `docs/denso-aws-first-uat.md` | Repeatable visual walkthrough and user sign-off evidence. |
| Modify | `docs/denso-layout-spec.md` | Record accepted visual policy, Gate A freeze and rack-standard decision. |
| Modify | `plans/261002-denso-warehouse-reconstruction/reports/pm-261002-2255-denso-v1-scene-progress.md` | Report actual completion only after sign-off. |

## Implementation Steps

1. Run `npm test`, `npm run build` and `git diff --check`; investigate any failure before manual review.
2. Run the UAT walkthrough: overview and maximum zoom-out in Day/Industrial modes; Roof off/on; walls absent; inbound, storage and outbound views; cargo off/on and rack end view.
3. Current integrated screenshots are in `reports/industrial-rack-visuals/`; request user aesthetic review and capture any requested corrections. The old Step A lamp/5 m screenshots were never accepted; do not treat them as a frozen baseline.
4. Check performance manually at overview with all 16 racks and cargo enabled; hanging lamps are absent. If performance is poor, optimize instancing/shadow budgets without reducing approved visual details. Do not infer FPS from draw/triangle counts or successful tests.
5. Update layout spec and progress report with only verified results. Do not mark any future vehicle/wall work completed.
6. Ask the user to sign off the accepted baseline and record deferred items: walls/doors/gates, AWS vehicle model integration, navigation, telemetry and broader UI redesign.

## Success Criteria

- [ ] All automated checks pass.
- [ ] User accepts revised AWS environment at 10 m without hanging lamps; remaining floor/layout/camera contracts unchanged.
- [ ] Cargo-off rack passes the industrial-structure review.
- [ ] No walls render in any UAT view.
- [ ] Deferred work is listed clearly; no unsupported UI capability is presented as active.
- [ ] User sign-off is recorded before a future vehicle or wall plan starts.

## Risk Assessment

The primary risk is treating automated geometry tests as a substitute for visual review. The acceptance record requires both: test output protects counts/bounds; user walkthrough protects visual fidelity and operational readability.

## Security Considerations

Only local assets and static demo data are involved. No deployment, telemetry or external service change is allowed.
