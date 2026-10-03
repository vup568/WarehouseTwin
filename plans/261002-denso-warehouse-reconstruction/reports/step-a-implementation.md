---
date: 2026-10-03
plan: 261002-denso-warehouse-reconstruction
phase: 1
status: awaiting-user-review
---

# Step A: AWS Visual Foundation Implementation

## Summary

Step A is technically implemented and ready for user review. **Gate A is not accepted.** Phase 2 industrial rack and Phase 3 combined regression/handoff remain blocked. Existing folders are retained; no feature folder, source relocation or commit was created.

| Item | Verified result |
|---|---|
| Footprint | 110 × 90 m = 9,900 m², approximating 10,000 m²; warehouse height 5 m |
| AWS visuals | GroundB_01 concrete, RoofB_01, Lamp_01 with original maps/materials |
| Modules | 40 ground tiles and 40 roof tiles, clipped at footprint edges; 32 aisle-safe fixtures |
| Lighting | Day/Industrial-Night; distance-independent base fill, one directional shadow caster, at most six fixture point lights |
| Camera/fog | No distance fog; far plane 568.51 m; footprint-derived OrbitControls range |
| Markings | Separate inbound, outbound, forklift, AGV, AMR layers from Denso data |
| Roof/Lights | Actual UI buttons tested; separate visibility; camera preset preserves manual roof state |
| Walls | No AWS or Denso wall meshes mounted |
| Rack | Existing geometry/cargo placeholders retained; visibility lifecycle fix only |

## Verification

- Fresh `npm test`: **22/22 pass** after concrete-bound tiling, marking render-order and rack toggle lifecycle fixes.
- Fresh `npm run build`: **pass**. All three DAE sources and four referenced PNG textures emitted in `dist/models/`; relative `../materials/textures/` paths resolve to existing files.
- `git diff --check`: **pass**. Git reports normal LF/CRLF conversion notices only.
- Local HTTP check: all three models and four source texture paths return **200**.
- Headless Chrome CDP review: `errors: []`, `fog: null`; four camera presets inspected. DOM Roof/Lights buttons toggle state correctly; `rackRestored: true` after Racks off → Randomize → Racks on; `roofPreservedByCamera: true`.
- Browser geometry inspection confirms concrete-only floor draw groups and markings above floor at approximately 0.018–0.020 m. Concrete bounds define tile pitch, avoiding seams introduced by outlying original AWS paint geometry.
- [Code review](./step-a-code-review.md) records the final review separately from user approval.

Browser measurements: [review-results.json](./step-a-visuals/review-results.json).

## Visual Evidence

| View | Evidence |
|---|---|
| Overview, Industrial/Night | [01-overview-night.png](./step-a-visuals/01-overview-night.png) |
| Overview, Day | [02-overview-day.png](./step-a-visuals/02-overview-day.png) |
| Roof on | [03-roof-on.png](./step-a-visuals/03-roof-on.png) |
| Interior, roof/fixtures | [04-interior-roof-lamps.png](./step-a-visuals/04-interior-roof-lamps.png) |
| Maximum zoom-out, Day | [05-far-day.png](./step-a-visuals/05-far-day.png) |
| Maximum zoom-out, Night | [06-far-night.png](./step-a-visuals/06-far-night.png) |
| Lights off | [07-lights-off.png](./step-a-visuals/07-lights-off.png) |
| Outbound West | [08-outbound.png](./step-a-visuals/08-outbound.png) |
| Compact viewport | [09-compact-overview.png](./step-a-visuals/09-compact-overview.png) |

## Implementation Boundaries

The new loader is `src/components/scene/aws-asset-library.ts`; `ColladaModels.tsx` was preserved. The procedural `DensoWarehouseShell.tsx` was preserved but unmounted. Actual touched-file inventory is recorded in [Phase 1](../phase-01-aws-visual-foundation.md#related-code-files).

Rack dimensions, posts/beams, seeded cargo and existing operational geometry remain the prior placeholders. `DensoRackInstances` only keeps meshes mounted behind group visibility and initializes instance matrices before paint, fixing the Racks off/on lifecycle. Industrial decking, supports, braces, spacers and independent inventory renderer belong to Phase 2 after approval.

## User Review Checklist — Pending

- [ ] Sàn giữ chất liệu/phong cách AWS, không có khe module hoặc line AWS cũ gây hiểu nhầm.
- [ ] Mái và fixture đèn AWS nhìn phù hợp với kho lớn; Roof bật/tắt đúng mong muốn, không trong suốt/auto-hide.
- [ ] Day/Night và zoom ra xa vẫn đủ rõ, không tối dần do khoảng cách.
- [ ] Vạch inbound/outbound/forklift/AGV/AMR và camera presets đủ dễ đọc; tường vẫn ẩn.
- [ ] Người dùng đồng ý Step A để khóa baseline và mở Phase 2, hoặc nêu các chỉnh sửa cần làm trong Step A.

## Warnings and Next Action

Production JS is approximately **1,045.25 kB**, above Vite's 500 kB chunk warning threshold. Node's type stripping runner is experimental. Headless renderer statistics (215 draw calls, 30,360 triangles in the recorded view) are diagnostic evidence, **not a performance benchmark of the user's workstation**; interactive smoothness still needs local review.

Next action: user reviews Step A. Do not claim acceptance or begin Phase 2/3, vehicles, walls, navigation or broader UI work before the appropriate approval gate.

## Unresolved

User visual approval and local workstation performance assessment remain pending. No technical blocker was found by the current test/build/browser checks.
