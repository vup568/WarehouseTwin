# Denso Migration Phase 0 Baseline

## Post-baseline v1 implementation update

- Bản layout v1 đã được duyệt và active qua `src/data/denso-layout-v1.ts`; `DENSO_LAYOUT` hiện trỏ tới v1, còn `DENSO_LAYOUT_V0` chỉ là baseline migration.
- `Scene3D.tsx` đã compose các component độc lập: `DensoWarehouseShell`, `DensoRackInstances`, `DensoOperationalCells`, `DensoSafetyBarriers`, `DensoVehicleLanes` và `DensoForkliftWorkCells`.
- QA sau safety regression: `npm test` 16/16 pass, `npm run build` pass và `validateDensoLayout(DENSO_LAYOUT_V1)` trả về hợp lệ/không lỗi.
- Chưa có visual walkthrough tự động vì môi trường vẫn không có executable `agent-browser`; cần walkthrough thủ công trong app trước khi nghiệm thu các phase scene/flow liên quan.

## Repository baseline

| Field | Value |
|---|---|
| Captured date | 2026-10-02 |
| Branch | `main` |
| HEAD | `1d36a51` |
| Stable migrated scope | Phase 0–2 from `docs/MIGRATION_REPORT.md` |
| AMR work | `stash@{0}: On main: WIP-Phase3-AMR` |
| Phase 0 policy | Inspect stash read-only; do not `stash pop` into `main` |

## Current application baseline

- React 18 + TypeScript + Vite.
- React Three Fiber/Drei + Three.js for rendering.
- Zustand for client state.
- `ColladaModels.tsx` loads AWS shell/facility/vehicle DAE assets.
- `RackInstances.tsx` and `ZoneOverlay.tsx` describe the AWS baseline; active scene uses the Denso components listed above.
- Store contains `layers.amr`; v1 renders static lane/work-cell geometry, while dynamic vehicle simulation remains future work.
- Existing AWS reference image: [`images/small_warehouse_gazebo.png`](./images/small_warehouse_gazebo.png).

An automated live-app screenshot was not captured in Phase 0 because the configured `agent-browser` executable is unavailable in this environment. Phase 1 visual gate must capture the current app before replacing the shell and then capture the Denso top-down result using the same viewport.

## Dependency baseline

| Package group | Versions |
|---|---|
| React | `react@^18.2.0`, `react-dom@^18.2.0` |
| 3D | `three@^0.163.0`, `@react-three/fiber@^8.16.0`, `@react-three/drei@^9.105.0` |
| State | `zustand@^4.5.2` |
| Build | `typescript@^5.2.2`, `vite@^5.2.0` |

## Phase 0 artifacts

- `docs/denso-layout-spec.md`
- `docs/denso-layout-v0.svg`
- `src/data/denso-layout.types.ts`
- `src/data/denso-layout.ts`
- `tests/denso-layout.test.ts`

## Known pre-Phase-1 constraints

1. Footprint is an approximation: 110 × 90 m = 9.900 m².
2. Customs fence and aisle coordinates are estimated from the provided image.
3. The active Denso v1 layout is connected to `Scene3D.tsx`; visual acceptance is still pending manual walkthrough.
4. Main Vite bundle exceeds the 500 kB warning threshold (current production JS is about 1.0 MB); this is a non-blocking performance follow-up.
