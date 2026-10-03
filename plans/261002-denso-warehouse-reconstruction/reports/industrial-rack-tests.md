---
type: tester
date: 2026-10-03
status: passed-automated-checks
---

# Test Report: Industrial Rack and 10 m AWS Roof

## Summary

Independent fresh verification: **30/30 tests pass**, no skipped tests; TypeScript and production build pass. The user-authorized changes remove hanging fixture assets, raise the active demo roof to 10 m and introduce complete, independently rendered industrial rack structure and cargo.

Automated checks do not substitute for the user's visual acceptance. Browser screenshots and interactive checks are handled by the implementation agent separately.

## Findings

### Test results

Command: `npm test`; latest suite duration approximately 444 ms.

| Suite | Passed | Failed | Scope |
|---|---:|---:|---|
| AWS environment | 6 | 0 | 9,900 m² tiling, ground/roof manifest only, active 10 m roof, obsolete 5 m active roof rejection, camera clipping, markings |
| Legacy Denso layout | 16 | 0 | V0 remains 5 m; three east inbound gates, west outbound, one-forklift-per-zone, lane/barrier contracts and invalid-input rejection |
| Industrial rack | 8 | 0 | Capacity, physical structure/decks, bearing contacts, pallet clearance, transformed bounds, orientation and inventory constraints |
| Total | 30 | 0 | No skipped/cancelled tests |

The geometry tests use the production geometry generator and transform all eight corners of each member with its quaternion. They establish:

- 6 × 10 × 2 = 120 unique bin IDs matching the existing addressing contract; 7-level fixture = 140.
- Non-empty upright, footplate, beam, support, diagonal-brace, frame-tie, spacer and deck groups even without cargo.
- Exactly one physical deck per bin; deck top equals the cargo bearing plane.
- Six elevated deck levels; 1.13 × 0.97 m pallets fit the deck and 0.5 m cargo clears adjacent levels.
- Every deck rests on at least two modeled supports/beams with underside contact.
- All generated members stay inside the storage zone, above the floor, below the roof and clear of barriers.
- Z-oriented fixtures rotate the complete structure and bin/pallet transforms.
- Deterministic inventory spans all six levels and contains occupied and empty bins without mutating structure/slots.
- Duplicate bin occupancy, duplicate pallet ID, orphan bin, empty SKU and whitespace-only SKU are rejected.
- The historical 200-pallet reference cannot create additional physical slots; undersized/invalid rack dimensions throw.

### Build and asset verification

Command: `npm run build`; **PASS**, including `tsc`. Vite transforms 642 modules; bundling completes in approximately 8.1 seconds.

The production `dist/models` contains exactly two AWS asset directories: `GroundB_01` and `RoofB_01`. All five emitted DAE/PNG files match their original source bytes by SHA-256. No Lamp or Wall asset is emitted by the current environment manifest.

`git diff --check` passes. Existing Windows line-ending notices are informational.

### Warnings and coverage limits

- Node prints its existing experimental type-stripping notice.
- Vite reports the existing >500 kB JavaScript chunk warning (approximately 1.05 MB minified / 294 kB gzip); not a build failure.
- No repository-wide coverage threshold or coverage command is configured. No coverage percentage is claimed.
- Unit tests verify production geometry/data, not GPU-rendered appearance, frame rate, or engineering load-bearing certification.

## Recommendations

1. Review the actual cargo-off rack from an aisle and rack end before accepting its visual design.
2. Check roof on/off, independent rack/cargo visibility and Day/Night in the browser; those interactive checks are reported separately.
3. Keep later vehicle/business-flow changes blocked until the user accepts the revised environment and rack.

## Unresolved Questions

No automated-check blockers. User visual approval remains pending.
