---
title: "Kế hoạch tái dựng Denso Warehouse Digital Twin"
description: "AWS-first visual foundation at 10,000 m², then an approved industrial Denso double-rack implementation."
status: in-progress
priority: P1
effort: medium
branch: main
tags: [feature, frontend, simulation, denso, warehouse, aws-assets, industrial-rack]
blockedBy: []
blocks: []
created: 2026-10-02
---

# Kế hoạch tái dựng Denso Warehouse Digital Twin

> **Rebaseline 2026-10-02 — authoritative for the next implementation.** The user rejected the procedural replacement floor/roof/light treatment. The active work is now restricted to the AWS-first visual foundation and the industrial rack rebuild below. Earlier roadmap text remains as migration history only; it must not override this rebaseline.

## Kế hoạch đang hiệu lực: AWS-first Foundation → Industrial Rack

### User override — 2026-10-03, current implementation

**Latest roof-only revision:** user requested roof elevation **25 m**, replacing the 10 m demo setting below. Change only the elevation and corresponding labels/validation/tests. Preserve all floor/rack/cargo/lighting/camera/layout geometry and behavior. No new phase work is authorized by this revision.

The user explicitly authorized: remove hanging lamp models while retaining background scene illumination; raise the reused AWS roof to **10 m**; build the agreed industrial back-to-back rack now. This authorizes Phase 2 work alongside those two environment corrections, without asserting that Step A has been visually accepted. Preserve the AWS concrete floor, all Denso layout coordinates, manual roof toggle, cameras and hidden walls. Stop for user review after this slice; no vehicles, navigation, walls or broader UI rebuild. Later lamp/5 m/gate statements below are superseded only by these explicit decisions.

### Quyết định đã chốt

- **AWS-first reuse:** reuse AWS `GroundB_01`, `RoofB_01`, their materials/textures, and compatible warehouse props. Hanging `Lamp_01` is excluded by the latest user decision; keep its original source untouched.
- **Scale:** compose reusable AWS modules across the current `110 m × 90 m` footprint (≈9,900 m², accepted as the 10,000 m² demo), rather than stretching one small-world mesh until its texture and proportions break.
- **Denso overlay:** render Denso inbound, outbound, forklift, AGV and AMR markings as data-driven independent layers on top of the AWS-style floor.
- **Walls:** hide all AWS and Denso perimeter walls for now. Walls, doors and gates are explicitly deferred; no wall toggle is presented as a completed warehouse feature.
- **Roof:** reuse AWS roof visual at **25 m demo elevation** (latest roof-only revision); one explicit Roof on/off control only. No transparent or auto-cutaway roof behavior. The earlier ~5 m real-world estimate is not overwritten as measured fact.
- **Lighting:** no hanging lamp models or fixture point lights; retain ambient/hemisphere/directional fill for Day/Night. Overview must not darken merely because the camera is far from the target. Remove the obsolete Lights toggle.
- **Rack:** model a true selective-pallet industrial double rack, back-to-back, `6 levels × 10 positions/face × 2 faces = 120 positions`. Cargo is independent and cannot conceal missing rack structure.
- **Gate:** user expressly authorized rack implementation and the two environment revisions now, without accepting Step A visually. Stop after this slice for environment/rack review. No further floor, roof, lighting, camera, fog or wall changes without authorization.

### Scope boundary

| In scope now | Explicitly deferred |
|---|---|
| AWS floor/roof reuse at 10,000 m², roof at 25 m, background illumination, Denso floor markings, roof control, walls hidden | Hanging lamp models, new walls, doors, gates, vehicle behavior, navigation, telemetry, dashboard redesign, WMS integration |
| Industrial rack structure, bin-position geometry, separate pallet/box layer, structural and visual validation | Any cargo randomization used to disguise rack geometry; rendering walls during this slice |

### Active phase roadmap

| Phase | Status | Dependency | Deliverable | Approval / validation gate |
|---|---|---|---|---|
| 0. Rebaseline and asset inventory | Complete | — | Confirmed AWS-first asset policy and Denso constraints | Confirmed in conversation |
| [Phase 1: AWS visual foundation](./phase-01-aws-visual-foundation.md) | In progress — revised technical implementation, awaiting user approval | 0; latest user override | AWS floor, roof at 25 m, background lighting, Denso markings; lamps/walls absent | **User approves revised environment manually** |
| [Phase 2: Industrial double rack](./phase-02-industrial-double-rack.md) | In progress — technically implemented, awaiting user approval | Authorized explicitly on 2026-10-03 | Complete selective-pallet double rack and independent cargo | User validates cargo-off structure |
| [Phase 3: Regression and handoff](./phase-03-regression-and-handoff.md) | Blocked — combined UAT/sign-off pending | Phase 1 + Phase 2 visual approval | Final acceptance record and later-work boundary | User sign-off, not automated checks alone |

### Current execution status — 2026-10-03

- Revised environment and industrial rack are technically implemented; **Gate A/Gate B visual approval is not recorded**. Phase 1 has 6/7 and Phase 2 has 5/6 criteria technically checked; Phase 3 is 0/6. Active phase files total 11/19 (58%). These counts are implementation progress, not acceptance.
- Fresh `npm test`: 30/30 pass; `npm run build`: pass. Independent code review found no new P1/P2 issue. Build retains a large-chunk warning; FPS is not measured or claimed.
- See [current implementation report and review checklist](./reports/industrial-rack-implementation.md) and [independent code review](./reports/industrial-rack-review.md). The [Step A report](./reports/step-a-implementation.md) and its lamp/5 m screenshots remain dated history, not evidence of the revised scene.
- All 16 racks now have eight structural member classes and 120 stable slots each (1,920 total). Wire-mesh decks, load beams/supports, braces and row spacers remain when cargo is off. Cargo has independent data and renderer.
- User requested no new feature folder for now. Source remains in existing scene/data folders; no source/plan/spec relocation or commit was performed.
- Phase 2 was explicitly authorized and implemented; Phase 3 acceptance remains blocked. Next action is user review of the environment/rack revision. No vehicle, navigation or wall work starts meanwhile.

### Source assets and integration rule

| AWS asset | Current source | Planned use | Exclusion |
|---|---|---|---|
| `GroundB_01` | `models/aws_robomaker_warehouse_GroundB_01/..._visual.DAE` | Repeated/tiled floor visual and material reference | Not a single stretched floor mesh |
| `RoofB_01` | `models/aws_robomaker_warehouse_RoofB_01/..._visual.DAE` | Repeated/tiled roof visual, controlled by `layers.roof` | No flat replacement roof |
| `Lamp_01` | `models/aws_robomaker_warehouse_Lamp_01/..._visual.DAE` | None; original source retained as history | Must not load, render or emit in active environment |
| `WallB_01` | `models/aws_robomaker_warehouse_WallB_01/..._visual.DAE` | None in this slice | Must remain hidden |
| `PalletJackB_01` | `models/aws_robomaker_warehouse_PalletJackB_01/..._visual.DAE` | Reserved for a later vehicle phase | Not part of this visual/rack plan |

### Acceptance invariants

1. At minimum zoom, maximum overview zoom and every approved camera preset, the warehouse remains readable: no exponential-fog fade to a dark background and no unlit large regions caused by a small-world light range.
2. Toggling Roof affects only the reused AWS roof composition; it does not affect floor, Denso markings or rack data.
3. Walls are absent in all default views. No placeholder Denso wall is substituted.
4. Every double rack reports exactly 120 physical pallet positions. With cargo off, all frames, beams, diagonal braces, row spacers, cross members, pallet supports and decking remain visible.
5. Only explicitly authorized environment changes are permitted: lamps removed/background fill retained, roof at 10 m. All other Phase A layout/camera/floor controls stay unchanged; next work awaits user approval.

### Technical approach selected

Use an AWS asset loader/cache that loads a DAE source once, then clones controlled modules with a single Gazebo-to-Three transform adapter. Floor and roof placement derive from `DENSO_LAYOUT_V1.warehouse`, not duplicated magic coordinates. Background lighting uses no lamp geometry. The Denso renderer owns operational geometry and markings; AWS assets own the floor/roof visual language. Rack structure and cargo are separate instanced renderers backed by the same `RackBlock`/slot specification; structural sections are demo visual dimensions, not a certified load-bearing design.

### Known risks and controls

| Risk | Control |
|---|---|
| Tiling reveals seams or repeated texture artifacts | Inspect one module’s local bounds before placement; use overlap/spacing only where the AWS geometry permits; capture seam screenshots in Phase 1 UAT. |
| Dense structural/deck scene costs GPU work | Instance repeated members and reuse one merged mesh deck; keep one directional shadow map. Measure workstation performance in final UAT, not infer FPS from tests. |
| Roof tiles hide interior | Roof remains a simple manual on/off layer, default off while reviewing the operational layout. |
| Rack geometry becomes visually dense | Use instanced structural members and test cargo-off silhouette from aisle and overview cameras. |
| Existing Denso data and component coordinates diverge | Keep `DENSO_LAYOUT_V1` as the only source for footprint, rack transforms and marking paths; unit-test generated counts and bounds. |

### Execution rule

Phase 2 implementation was explicitly authorized in the latest user request. Stop at the revised environment/rack approval boundary; do not begin vehicles, navigation or walls as side tasks. Do not mark either visual gate complete based on automated tests.

---

## Archived migration roadmap (superseded for the next implementation)

## Mục tiêu đã chốt

Tái dựng kho theo ảnh mặt bằng Denso, trước hết chính xác ở góc nhìn top-down và sau đó nhất quán khi xem 3D. Giữ chất lượng mô hình xe/tài sản AWS; thay thế bố cục AWS hiện có bằng dữ liệu layout Denso; đưa kệ, xe và thao tác vận hành về một mô hình dữ liệu duy nhất.

Kết quả v1 phải có:

- Mặt bằng, luồng IN/OUT, khu Loading, Receive, Storage, staging/condem và các khu phụ thể hiện theo ảnh.
- Kệ đôi liên tục, **6 tầng trong demo = 120 pallet positions** (`6 × 10 × 2`); mỗi bin chứa đúng một pallet; cargo tách khỏi kết cấu kệ.
- Xe dùng visual AWS, chạy theo lối đi hợp lệ, không xuyên kệ/tường và có Play/Pause/Reset.
- Thanh điều khiển gọn, theo nhóm chức năng, với các thao tác cần thiết thay vì nút thử nghiệm rời rạc.
- Nền, mái và tường bao có thể bật/tắt độc lập, nhưng cùng tham chiếu đúng mặt bằng Denso.

## Trạng thái triển khai hiện tại

- Layout v1 đã được người dùng duyệt: ba inbound cell phía Đông và outbound/internal handoff phía Tây.
- Scene slice v1 đang active từ một nguồn dữ liệu: shell, rack đôi, operational cell, forklift work-cell, safety barrier và AGV/AMR lane là các component độc lập trong `Scene3D`.
- QA an toàn dữ liệu: `validateDensoLayout(DENSO_LAYOUT_V1)` hợp lệ; `npm test` 16/16 pass; `npm run build` pass.
- Chưa đánh dấu các phase scene/flow hoàn tất: cần visual walkthrough thủ công trong app (không có `agent-browser` trong môi trường) trước khi nghiệm thu. Phase vehicle simulation, UI vận hành và acceptance vẫn chưa bắt đầu/hoàn tất.

## Phạm vi và nguyên tắc

**Trong phạm vi:** mô hình client-side React/R3F hiện có; dữ liệu layout; mô phỏng xe deterministic; UI vận hành; kiểm thử thuật toán thuần và walkthrough trực quan.

**Ngoài phạm vi v1:** kết nối WMS/ERP thật, backend/WebSocket, đa tầng, AI copilot, LiDAR, fault injection phức tạp, và sao chép toàn bộ engine WareTwin. Chỉ đưa lại sau khi mặt bằng và luồng xe v1 được nghiệm thu.

**Nguyên tắc kiến trúc:** `denso_layout` là single source of truth. Kệ, tường, zone overlay, vật cản và navigation grid đều sinh từ cùng dữ liệu này. Không hard-code cùng một toạ độ ở component render và engine xe.

## Thông số đã chốt từ nghiệp vụ Denso

| Hạng mục | Quyết định cho demo v1 |
|---|---|
| Mặt bằng và vỏ kho | Diện tích xấp xỉ 10.000 m²; chiều cao nhà kho 5 m. Chiều dài × rộng sẽ được chọn theo tỉ lệ ảnh và được giữ data-driven. |
| Rack | Rack đơn: 6 tầng × 10 bin = 60 positions. Kệ đôi demo: `6 tầng × 10 bin/tầng × 2 mặt = 120 positions`; biến thể 7 tầng = 140 positions. “~200 pallets” là capacity ước lượng nghiệp vụ, không phải số vị trí demo. |
| Bin | Rộng khoảng 2,5 m, cao dưới 1 m. Một bin chỉ gán một mã sản phẩm/SKU và đúng một pallet. |
| Pallet / cargo | Pallet 1.130 × 970 mm; pallet thấp cao 0,5 m; khoảng hở giữa pallet khoảng 0,1 m. Demo chỉ mô phỏng pallet và box, không mô phỏng chi tiết SKU trên từng box. |
| Putaway | Freeway: hàng `fast-moving` gần đường lấy/chuyển, hàng `slow-moving` xa hơn. Phân loại do PC cung cấp. |
| Phân tách domestic/international | Vách rào cố định ở phía Bắc: phía Bắc hàng rào là Domestic (VAT), phía Nam là International (không VAT); camera giám sát 24/24 hướng vào hàng rào. |
| Inbound flow | Ba cell độc lập ở phía Đông: hai gate xe tải phía Đông Bắc và một gate container phía Đông Nam. Mỗi cell: gate → staging → inspection → conveyor → staging 2 → storage. Không chia sẻ staging/inspection/conveyor giữa các gate. |
| Outbound flow | Storage → forklift outbound của zone → conveyor QC → dispatch staging → xe chở vào kho trong. |
| Xe | Mỗi zone chỉ có một forklift; forklift work cell, AGV lane và AMR lane có hàng rào ngăn cách. AGV theo line; AMR dùng map; forklift chưa tracking nên chỉ visual/static/manual, không giả telemetry. |

### Công thức capacity đã chốt

Rack đơn: `6 tầng × 10 bin = 60 pallet positions`. Kệ đôi demo: `6 tầng × 10 bin/tầng × 2 mặt = 120 pallet positions`; khi cấu hình 7 tầng là 140 positions. Một bin = một pallet = một SKU. Nhãn nghiệp vụ “khoảng 200 pallets/rack đôi” được giữ dưới dạng capacity reference/annotation, nhưng dashboard, occupancy và test phải tính theo số positions thực render (120 hoặc 140), không làm tròn thành 200.

## Hiện trạng đã xác nhận

| Hạng mục | Hiện trạng | Hệ quả kế hoạch |
|---|---|---|
| 3D shell | `ColladaModels.tsx` nạp nền/tường/mái DAE AWS từ `warehouse_data.json`. | Giữ asset AWS có giá trị, nhưng không dùng layout AWS làm layout Denso. |
| Kệ | `RACK_LAYOUT` có 12 kệ, mỗi kệ 4 tầng × 2 bay. | Thay bằng dữ liệu kệ đôi Denso: demo 120 positions/rack đôi (6 × 10 × 2), một pallet/SKU/bin, pallet gap 0,1 m và bin address. |
| Xe | Có asset `PalletJackB_01` trong AWS. Cờ `layers.amr` tồn tại nhưng scene chưa render xe động. | Không coi toggle hiện tại là tính năng hoàn chỉnh; tạo module fleet riêng. |
| Migration cũ | Báo cáo ghi Phase 3 AMR ở `stash@{0}: WIP-Phase3-AMR`. Stash sửa 6 file lõi, chưa có component xe riêng. | Chỉ review/extract chọn lọc trên branch/worktree; tuyệt đối không `stash pop` vào `main`. |
| UI | `TopBar.tsx` chứa layer toggles, zone pills, scenario và lighting trong một dải. | Tổ chức lại thông tin sau khi các capability thật đã tồn tại. |

## Diễn giải ảnh tham chiếu (bản nháp cần duyệt)

Ảnh là sơ đồ 2D, không phải CAD; mọi kích thước tuyệt đối phải xem là **provisional** đến khi có đo đạc/ảnh CAD. Các quan sát đủ chắc để dựng v1:

| Vùng trong ảnh | Diễn giải v1 | Mức tin cậy |
|---|---|---|
| Vành ngoài "TLIP external warehouse" | Đường bao/luồng xe ngoài nhà kho. | Cao |
| Phía Tây "LOADING", Gate 2, mũi tên OUT | Loading/outbound, luồng đi ra và khu staging sát loading. | Cao |
| Phía Đông "RECEIVE", Gate 1, mũi tên IN | Receive/inbound, luồng đi vào và các pallet chờ nhận. | Cao |
| Trung tâm | Các dãy kệ dài song song, lối đi xen giữa; có luồng chính ngang theo mũi tên xanh. | Cao |
| Góc phải giữa | Khu red-frame / condem / pallet staging. | Trung bình |
| Phía Bắc | Hàng rào cố định phân tách Domestic (phía Bắc) và International (phía Nam), kèm camera giám sát. | Cao |
| Phía Nam | Các phòng/chức năng phụ, desk/office và vùng kệ nhỏ. | Trung bình |
| Nhãn G.1/G.2, số pallet | Gate/điểm vận hành và capacity annotation. | Cần xác nhận |

## Quyết định kỹ thuật đề xuất

1. Tạo `src/data/denso_layout.ts` gồm kích thước chuẩn hoá (m), polygon/rect cho shell, zones, đường xe, obstacles, docks, fixtures và rack runs. Đây là nguồn dữ liệu duy nhất.
2. Tạo renderer procedural cho sàn, tường, mái, cửa và vạch đường; vẫn dùng DAE AWS cho xe và các fixture phù hợp. AWS DAE shell cũ được tách thành fallback/toggle trong thời gian chuyển đổi, rồi không còn là shell chính.
3. Biểu diễn một rack đôi bằng `RackBlock` (hai mặt, `levels: 6 | 7`, `binsPerLevel: 10`, `capacity = levels × 10 × 2`, orientation), rồi sinh `BinAddress` ổn định như `ST-A-03-FR-L05-B08`. Mỗi bin có `skuId?`, `movementClass: fast | slow`, `palletCapacity = 1`, `occupiedPallets: 0 | 1`; `skuPerBin = 1` là invariant.
4. Navigation grid sinh từ `denso_layout`: cell blocked = tường + rack + fixture + vùng restricted; waypoint chỉ ở lối đi. A* chạy trong module độc lập, không phụ thuộc React.
5. Xe v1 là Pallet Jack/visual AWS tương đương. AGV bám lane riêng có rào, AMR dùng navgrid/map lane riêng có rào; mỗi zone một forklift static/untracked. `ForkliftWorkCell`, `AgvLaneComponent`, `AmrLaneComponent` và `SafetyBarrierComponent` là component riêng. State tối thiểu của xe có tracking là `idle | moving | waiting | error`; không migrate nguyên engine WareTwin 100 KB.
6. UI có ba nhóm: **View** (camera/layers), **Operations** (focus zone, rack/bin selection), **Simulation** (xe play/pause/speed/reset). Nút chỉ xuất hiện khi capability tương ứng hoạt động.

## Lộ trình thực hiện

| Phase | Nội dung | Ưu tiên | Phụ thuộc | Gate nghiệm thu |
|---|---|---:|---|---|
| [x] 0 | Khảo sát, baseline và chốt bản vẽ dữ liệu | P1 | — | Layout v1 được người dùng duyệt |
| [ ] 1 | Nền, tường, mái, cửa và camera theo Denso | P1 | 0 | So sánh top-down pass |
| [ ] 2 | Kệ đôi liên tục 120 positions, bin/pallet inventory | P1 | 0, 1 | Bin count/address + capacity đúng dữ liệu |
| [ ] 3 | Zones, fixtures, luồng IN/OUT và overlay | P1 | 0, 1, 2 | Luồng/obstacle khớp map |
| [ ] 4 | Xe AWS và navigation ổn định | P1 | 2, 3 | 20 lượt chạy không collision |
| [ ] 5 | Điều khiển màn hình và telemetry tối giản | P2 | 1--4 | UAT theo task matrix |
| [ ] 6 | Regression, performance và nghiệm thu | P1 | 1--5 | Build + test + review pass |

## Chi tiết từng phase

### Phase 0 — Khảo sát, baseline và chốt bản vẽ dữ liệu

**Mục tiêu:** biến ảnh tham chiếu thành đặc tả có thể triển khai, tránh bắt đầu dựng 3D từ ước lượng không thể kiểm chứng.

**Tạo/sửa dự kiến:**

- Create: `docs/denso-layout-spec.md`
- Create: `src/data/denso_layout.ts`
- Create: `src/data/denso_layout.types.ts`
- Create: `tests/denso-layout.test.ts` (hoặc vị trí test tương thích toolchain sau khi thiết lập)

**Các bước:**

1. Chọn hệ toạ độ: gốc ở góc tây-nam sàn, X hướng Đông, Z hướng Bắc, đơn vị mét.
2. Lập bảng đối chiếu ảnh → `zones`, `docks`, `rackRuns`, `fixtures`, `roads`, `walkways`, `restrictedAreas`, `cameraPresets`.
3. Đặt kích thước v0 theo tỉ lệ ảnh; đánh dấu tất cả giá trị không đo được là `assumption` thay vì ngầm coi là chính xác.
4. Ghi thông số đã chốt: rack đơn = `6 × 10 = 60 positions`; kệ đôi demo = `6 × 10 × 2 = 120 positions`; biến thể 7 tầng = 140 positions. Một bin = một pallet = một SKU; bin rộng 2,5 m/cao <1 m; pallet 1.130 × 970 mm, low pallet 0,5 m; pallet gap 0,1 m.
5. Tách capacity reference nghiệp vụ `~200 pallets` khỏi capacity render; validation phải chứng minh 120 positions ở demo 6 tầng và 140 ở biến thể 7 tầng.
6. Ghi fence Domestic/International, camera fixed location, ba inbound cell riêng và outbound flow vào layout; xác định từng cell `receive/staging/inspection/conveyor/staging 2/storage` như flow graph độc lập.
7. Gắn movement class `fast-moving | slow-moving` cho bin/zone theo PC input hoặc mock PC profile; không gán cứng theo màu mesh.
8. Ghi ảnh chụp baseline AWS, trạng thái `git`, nội dung `stash@{0}` bằng lệnh chỉ đọc. Không áp stash.
9. Viết validation dữ liệu: id unique; bin address unique; `skuPerBin = 1`; rack/fixture nằm trong shell; mỗi inbound gate có đủ component cell riêng; outbound có QC + dispatch; lane không cắt obstacle/barrier của loại xe khác; mọi dock có zone.

**Tiêu chí xong:** user duyệt bản overlay/top-down và bảng rack; toàn bộ assumption được gắn nhãn; data validation pass.

**Rủi ro:** ảnh không có scale và nhãn nghiệp vụ “~200 pallets” có thể bị nhầm là capacity render. Giảm thiểu bằng layout versioned, tách `referenceCapacity` khỏi `palletPositionCount`, và sign-off trước khi dựng 3D.

### Phase 1 — Dựng nền, tường, mái, cửa và camera theo Denso

**Mục tiêu:** shell phản ánh footprint Denso nhưng vẫn cho phép xem nội thất rõ ràng.

**Tạo/sửa dự kiến:**

- Create: `src/components/scene/DensoWarehouseShell.tsx`
- Create: `src/components/scene/CameraController.tsx`
- Modify: `src/components/scene/Scene3D.tsx`
- Modify: `src/components/scene/ColladaModels.tsx`
- Modify: `src/state/store.ts`
- Modify: `src/App.css`

**Các bước:**

1. Render floor (≈10.000 m²), perimeter walls cao 5 m, ba inbound doors phía Đông (2 truck + 1 container), outbound/internal-transfer door phía Tây, columns, roof/truss và lane markings từ `denso_layout`.
2. Dựng rào fixed-location ở phía Bắc, chia Domestic/International và mount camera hướng theo hàng rào; đây là geometry/obstacle thật, không chỉ là overlay.
3. Giữ roof/walls/floor là layers riêng; top-down preset tự ẩn mái hoặc dùng cutaway để không che kệ.
4. Giữ DAE AWS cho model có ích; ngăn DAE wall/roof/ground cũ render chồng lên Denso shell sau cutover.
5. Cài camera presets: Overview, Inbound/Receive, Storage, Loading/Outbound, Customs Fence; focus phải sử dụng toạ độ layout chứ không dùng số rời rạc.
6. Kiểm tra occlusion, Z-fighting, shadows và performance ở cả roof ON/OFF.

**Tiêu chí xong:** ở camera Overview, ba inbound gate, outbound/internal-transfer, hướng IN/OUT, vehicle barrier và các lối chính khớp layout v1; mái/tường không che nội thất ngoài ý muốn.

### Phase 2 — Kệ đôi Denso liên tục, 120 pallet positions và tồn kho

**Mục tiêu:** thay 12 kệ rời AWS bằng rack block đôi 120 positions trong demo 6 tầng, một pallet/SKU/bin, và mỗi bin có địa chỉ/capacity/SKU class ổn định.

**Tạo/sửa dự kiến:**

- Modify: `src/data/rack_layout.ts` (thay/tháo dần `RACK_LAYOUT` AWS)
- Create: `src/data/rack-bin-layout.ts`
- Modify: `src/components/scene/RackInstances.tsx`
- Create: `src/components/scene/RackLabels.tsx`
- Modify: `src/simulation/engine.ts`
- Modify: `src/state/store.ts`
- Create: `tests/rack-bin-layout.test.ts`

**Các bước:**

1. Đổi model từ rack đơn (`size`, `levels`, `bays`) thành rack block đôi liên tục: `faces = 2`, `levels = 6`, `binsPerLevel = 10`, `palletPositionCount = 120`, `palletCapacityPerBin = 1`, bin width 2,5 m và pallet gap 0,1 m. Cho phép data cấu hình `levels = 7` và tính ra 140 positions.
2. Sinh post/beam/deck/divider theo bin và level; không tạo khe hở giữa các run liền kề trừ khi data định nghĩa lối đi.
3. Sinh đúng một pallet/box deterministically theo `binId` và seed; mỗi bin chỉ hiển thị một SKU class, không cần chi tiết sản phẩm trên từng box.
4. Đặt fast-moving gần receive/loading/luồng chính và slow-moving ở vùng xa theo profile PC mock; đây là policy data, không phải randomize.
5. Hiện label/select bin theo zoom, không render HTML label cho tất cả bin khi overview để tránh giảm FPS.
6. Tính đúng dashboard: rack runs, total bins, pallet capacity, occupied pallets, empty bins, fast/slow mix; bỏ wording "12 racks" cố định.
7. Viết test count, unique bin address, one-SKU-per-bin invariant, slot-to-world transform, movement-class policy và seeded occupancy.

**Tiêu chí xong:** một rack đôi đã duyệt hiển thị liền mạch, đúng 120 positions ở demo 6 tầng (140 khi data chọn 7 tầng); mỗi bin có tối đa một pallet/SKU; cùng seed cho cùng occupancy; cargo ON/OFF không ảnh hưởng structure; không có bin nằm trong lối xe.

### Phase 3 — Zones, fixture và luồng vận hành Denso

**Mục tiêu:** layout không chỉ là kệ; Receive/Loading/Condem/staging/office và một chiều IN/OUT phải nhìn thấy được và dùng được cho route.

**Tạo/sửa dự kiến:**

- Modify: `src/data/zone_layout.ts` hoặc hợp nhất vào `src/data/denso_layout.ts`
- Modify: `src/components/scene/ZoneOverlay.tsx`
- Create: `src/components/scene/FixtureInstances.tsx`
- Create: `src/components/scene/FlowArrows.tsx`
- Modify: `src/components/scene/Scene3D.tsx`
- Modify: `src/state/store.ts`
- Create: `tests/layout-obstacles.test.ts`

**Các bước:**

1. Tạo zones thật cho 3 inbound cell (`TRUCK_01`, `TRUCK_02`, `CONTAINER_01`) và component staging/inspection/conveyor/staging 2 riêng, cùng `OUTBOUND_PICK`, `OUTBOUND_CONVEYOR_QC`, `OUTBOUND_DISPATCH_STAGING`, `MAIN_STORAGE`, `DOMESTIC`, `INTERNATIONAL`, `OFFICE_SUPPORT`.
2. Dựng `InboundGateComponent`, `InboundStagingComponent`, `InspectionComponent`, `ConveyorComponent`, `TransferStagingComponent`, `OutboundPickComponent`, `OutboundConveyorComponent`, `DispatchStagingComponent`, `InternalTransferHandoffComponent` và fixture từ data; tái dùng DAE AWS khi phù hợp.
3. Vẽ/mô hình hoá ba luồng inbound riêng và một outbound flow `Storage → QC → dispatch → internal warehouse`; màu chỉ là overlay và không thay thế geometry.
4. Map `zoneId` đến camera preset, allowed task endpoint và status; thay 4 zone AWS bằng zones Denso.
5. Xác nhận obstacle geometry cùng nguồn với navigation; test lane/door/zone intersections.

**Tiêu chí xong:** người xem nhận ra ngay Receive phía Đông/IN, Loading phía Tây/OUT, central storage, hai staging + conveyor QC, rào Domestic/International và luồng chính ở top-down.

### Phase 4 — Xe AWS và navigation ổn định

**Mục tiêu:** xe dùng visual AWS, di chuyển trên lối hợp lệ và trạng thái mô phỏng có thể lặp lại.

**Tạo/sửa dự kiến:**

- Create: `src/data/vehicle-layout.ts`
- Create: `src/simulation/navgrid.ts`
- Create: `src/simulation/astar.ts`
- Create: `src/simulation/fleet-engine.ts`
- Create: `src/components/scene/Vehicles.tsx`
- Modify: `src/components/scene/ColladaModels.tsx`
- Modify: `src/components/scene/Scene3D.tsx`
- Modify: `src/state/store.ts`
- Create: `tests/astar.test.ts`
- Create: `tests/fleet-engine.test.ts`

**Các bước:**

1. Review diff của `stash@{0}` và WareTwin (`navgrid.ts`, `astar.ts`, `runner.ts`) ở branch/worktree riêng; chỉ port phần không gắn schema đa tầng/backend.
2. Sinh navgrid từ `denso_layout`, block rack/wall/fixture, reserve clearance và validate access cho mỗi pickup/dropoff point.
3. Tạo state machine v1: `idle → planning → moving → waiting → idle/error`; task inbound chọn đúng một cell `Gate → staging → inspection → conveyor → staging 2 → Storage`; task outbound là `Storage → QC conveyor → dispatch staging → internal handoff`.
4. Mô hình AGV bám `AgvLaneComponent`; AMR dùng `AmrLaneComponent`/navgrid và không được đi vào fixed fence, restricted zone hoặc vehicle barrier. Mỗi `ForkliftWorkCell` chỉ có một forklift; forklift không có telemetry nên render static/untracked, không báo position/route giả.
5. Dùng mesh/DAE Pallet Jack gốc AWS làm vehicle visual; loại instance static trùng lặp khỏi `ColladaModels` khi xe động bật.
6. Render smoothing chỉ ở layer view; engine là authoritative cho position/heading. Replan khi target blocked, dừng an toàn nếu không có path.
7. Thêm collision separation/reservation tối thiểu, fixed timestep và seed để replay được.
8. Viết test A* (normal, blocked, no path), invalid destination, route clearance, no-cross-fence, reset/replay và two-vehicle separation.

**Tiêu chí xong:** xe không spawn trong kệ, không xuyên shell/rack; reset tái lập cùng route; 20 lượt Receive→Storage→Loading không collision; no-path hiển thị lỗi có thể đọc.

### Phase 5 — UI vận hành và telemetry tối giản

**Mục tiêu:** thay top bar lộn xộn bằng thao tác theo vai trò, không đưa ra control không hoạt động.

**Tạo/sửa dự kiến:**

- Modify: `src/components/shell/TopBar.tsx`
- Create: `src/components/shell/ViewControls.tsx`
- Create: `src/components/shell/SimulationControls.tsx`
- Create: `src/components/panels/OperationsPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/state/store.ts`

**Các bước:**

1. Thiết kế IA với ba nhóm đã nêu và responsive overflow; keyboard focus, title/aria label, tooltip nhất quán.
2. **View:** overview/zone camera presets, roof/walls/lights/zones/racks/cargo/vehicle visibility.
3. **Simulation:** play, pause, speed, reset, dispatch task demo, toggle path/debug (debug chỉ dev mode).
4. **Operations:** zone status, selected rack/bin, selected vehicle, bin occupancy, alerts đơn giản. Chỉ show action đã được cài.
5. Thay telemetry card cứng bằng số liệu layout/fleet thật; giữ thông điệp concise, bỏ "Phase 1 + 2 active".
6. Viết manual UAT checklist: 1366px desktop, 1024px laptop, mobile/compact fallback; không overlap Canvas; mọi action có visible feedback.

**Tiêu chí xong:** một operator có thể xem toàn kho, focus zone, đổi visibility, chạy/dừng/reset xe và xem trạng thái bin/xe trong tối đa 3 thao tác từ UI.

### Phase 6 — Regression, performance và nghiệm thu

**Mục tiêu:** chứng minh v1 ổn định trước khi mở lại các tính năng nâng cao từ WareTwin.

**Tạo/sửa dự kiến:**

- Create: `docs/denso-uat-checklist.md`
- Create: `docs/denso-layout-signoff.md`
- Modify: `package.json` (chỉ khi bổ sung runner test cần thiết)
- Modify: `README.md`

**Các bước:**

1. Chạy TypeScript build và toàn bộ test layout/rack/path/fleet.
2. Thực hiện walkthrough ở Overview + 4 camera presets, roof/walls ON/OFF, cargo randomize, light modes và 20-route fleet soak test.
3. Dùng screenshot top-down overlay để review với ảnh tham chiếu; log mọi sai lệch thành issue `P1/P2/P3`.
4. Đo FPS/memory ở cấu hình rack đầy; giảm label/instance cost trước khi giảm chi tiết đã được duyệt.
5. Chỉ merge khi sign-off checklist pass và stash cũ vẫn nguyên vẹn.

**Tiêu chí xong:** build/test pass; không có P1 collision/occlusion/layout error; user sign-off map v1; rollback path và trạng thái migration được ghi trong README.

## Luồng phụ thuộc

```text
0 Layout specification & sign-off
├── 1 Shell + camera
├── 2 Rack runs + bins
└── 3 Zones + fixtures + flow  (needs 1, 2)
    └── 4 Fleet/navigation     (needs 2, 3)
        └── 5 UI operations    (needs 1–4)
            └── 6 Acceptance   (needs 1–5)
```

## Kiểm thử và acceptance matrix

| Mảng | Case bắt buộc | Điều kiện pass |
|---|---|---|
| Layout | top-down overlay, gate/flow/zone review | Vị trí tương đối khớp bản duyệt; sai lệch có owner/priority |
| Rack/bin | kệ đôi 6 × 10 × 2, một pallet/bin, seeded cargo | đúng 120 position/address (140 khi 7 tầng); một SKU/bin; rack liên tục; không đè lối đi |
| Storage policy | fast/slow profile + putaway | fast-moving gần flow chính; slow-moving xa; policy thay đổi được từ data |
| Shell | roof/wall/floor toggle + camera preset | Không che nội thất sai; không Z-fighting rõ rệt |
| Pathfinding | direct, detour, blocked, no route, customs fence | không path xuyên obstacle/fence; no route dừng an toàn |
| Fleet | replay/reset + 20 route loop | deterministic; không collision; không duplicate static vehicle |
| UI | every displayed button + keyboard/compact viewport | action phản hồi đúng; không có dead control/overlap |
| Build | typecheck + Vite build | exit 0 trước sign-off |

## Rủi ro và biện pháp

| Rủi ro | Tác động | Biện pháp |
|---|---|---|
| Ảnh không có kích thước dài × rộng | Sai tỷ lệ | Biết diện tích 10.000 m²/cao 5 m nhưng vẫn dùng assumption ledger + sign-off; hỗ trợ đổi data không sửa renderer |
| Nhầm “~200 pallets” với 120 positions demo | Capacity visual sai nghiệp vụ | Tách `referenceCapacity` và `palletPositionCount`; test theo số thực render |
| Port nguyên stash WareTwin | Hồi quy, phụ thuộc schema lớn, khó debug | Không `stash pop`; extract nhỏ, test trước, engine mới tối thiểu |
| Geometry và navgrid lệch nhau | Xe chạy xuyên vật thể/đi vào vùng cấm | Một `denso_layout`; test obstacle/lane coverage |
| Kệ/bin quá nhiều label/mesh | FPS thấp | InstancedMesh, LOD/zoom labels, benchmark ở Phase 6 |
| DAE asset có trục/scale khác R3F | Xe hoặc fixture sai orientation | Adapter transform per asset trong một chỗ, visual verification theo preset |
| UI chạy trước simulation | Nút chết và kỳ vọng sai | Chỉ expose control sau acceptance của capability |

## Câu hỏi cần chốt trước Phase 1

1. Có bản CAD/PDF hoặc kích thước dài × rộng, bề rộng lane và khoảng cách rack không? Nếu chưa có, tôi sẽ dựng tỉ lệ v0 từ khoảng 10.000 m² trong ảnh.
2. Vị trí và chiều dài chính xác của hàng rào Domestic/International trong hình có đúng là một đường ngang phía Bắc không? Có cổng kiểm soát trên hàng rào không?
3. Trong demo v1, cần bao nhiêu AGV và AMR; có cần render forklift static không?

## Bước tiếp theo

Thực hiện visual walkthrough thủ công cho scene slice v1: overview, inbound East, storage, outbound West, roof/walls ON/OFF và các barrier/lane. Sau khi gate này pass, tiếp tục theo Phase 4 để dùng visual AWS cho xe và navigation deterministic; chưa bắt đầu mô phỏng xe động hoặc mở rộng UI vận hành trước gate đó.
