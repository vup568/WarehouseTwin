# Denso TLIP Warehouse Layout Specification v1 (operational revision)

## Mục đích

Tài liệu này thay thế đề xuất vận hành v0 bằng bản v1 đã được duyệt để triển khai scene slice; đây chưa phải CAD và không được dùng để khẳng định kích thước thi công. Bản v1 phản ánh ba inbound cell độc lập, outbound hai chặng và phân tách vật lý theo loại xe. Quyết định mới nhất ngày 2026-10-03 chỉ nâng mái demo từ 10 m lên 25 m, giữ nguyên mọi phần khác của bản không có đèn treo và có rack công nghiệp; không đồng nghĩa người dùng đã nghiệm thu toàn bộ hình ảnh.

[`denso-layout-v1.svg`](./denso-layout-v1.svg) là snapshot top-down nghiệp vụ đã duyệt. `src/data/denso-layout-v1.ts` là nguồn dữ liệu v1; `src/data/denso-layout.ts` xuất `DENSO_LAYOUT` trỏ tới v1 cho consumer mới, đồng thời giữ `DENSO_LAYOUT_V0` chỉ làm baseline migration. Scene active dùng sàn/mái AWS, vạch sàn Denso, rack công nghiệp và pallet/box tách riêng, operational cell, work-cell và barrier. Shell procedural và renderer lane cũ được giữ trong source nhưng không mount; tường và model đèn treo không render. [Báo cáo revision hiện tại](../plans/261002-denso-warehouse-reconstruction/reports/industrial-rack-implementation.md) ghi trạng thái kỹ thuật; **người dùng chưa duyệt hình ảnh môi trường/rack mới**. [Step A cũ](../plans/261002-denso-warehouse-reconstruction/reports/step-a-implementation.md) giữ làm lịch sử, không phải baseline đã nghiệm thu.

## Chính sách hình ảnh đang hiệu lực — revision mái/rack 2026-10-03

- AWS-first: reuse `GroundB_01`, `RoofB_01` và material/texture phù hợp, compose theo footprint 110 × 90 m = 9.900 m² (xấp xỉ 10.000 m²). `Lamp_01` không thuộc manifest active; source AWS gốc vẫn được giữ.
- Sàn tile theo bounds của concrete, loại bỏ line AWS cũ; vạch inbound/outbound/forklift/AGV/AMR là layer độc lập.
- Mái AWS đặt cao 25 m cho demo, chỉ bật/tắt thủ công; đổi camera preset không tự ẩn mái. Bỏ đèn treo và nút Lights; giữ ambient/hemisphere/directional scene lighting, Day và Industrial/Night; scene không dùng distance fog.
- Tường, cổng/cửa và xe động chưa thuộc scope này. Chưa tạo folder feature hoặc chuyển spec/plan/source.
- Rack đã thay placeholder bằng selective pallet back-to-back 6 × 10 × 2, đủ upright, footplate, load beam, cross member/support, diagonal bracing, frame tie, row spacer và mesh decking. Cargo tắt không thay đổi kết cấu; chưa đánh dấu người dùng duyệt hình ảnh.
- Người dùng đã cho phép thực hiện ba thay đổi trên cùng nhau trước gate duyệt tiếp theo. Không tự đổi sàn, layout, tường, camera, fog hoặc vạch sàn; sau revision này phải dừng để người dùng kiểm tra trước phần tiếp theo.

## Hệ tọa độ và footprint

- Đơn vị: mét.
- Gốc `(0, 0)` đặt tại góc Tây Nam của mặt sàn.
- Trục `X` tăng về phía Đông; trục `Z` tăng về phía Bắc.
- Footprint v0: `110 m × 90 m = 9.900 m²`, xấp xỉ yêu cầu 10.000 m².
- Cao đặt mái trong demo hiện tại: `25 m`, được người dùng yêu cầu ngày 2026-10-03, thay cho bản demo `10 m`. Thông tin kho thực tế ban đầu là khoảng `5 m`; 25 m là lựa chọn mô phỏng, không phải số đo/CAD Denso đã xác nhận.
- Inbound: ba cổng ở phía Đông: hai cổng xe tải ở Đông Bắc và một cổng container ở Đông Nam.
- Outbound: cửa/khu chuyển hàng về kho trong ở phía Tây.

Footprint là assumption có kiểm soát vì ảnh tham chiếu không có kích thước dài × rộng. Khi có CAD, chỉ thay `warehouse.widthM`, `warehouse.depthM` và tọa độ layout; các component tiêu thụ dữ liệu không đổi contract.

## Quy tắc kệ và bin

| Thuộc tính | Giá trị demo |
|---|---:|
| Loại | Kệ đôi, hai mặt FRONT/BACK |
| Tầng | 6 |
| Bin mỗi tầng/mặt | 10 |
| Capacity rack đơn | 60 pallet positions |
| Capacity rack đôi | 120 pallet positions |
| Biến thể 7 tầng | 140 pallet positions |
| Capacity mỗi bin | 1 pallet |
| SKU mỗi bin | Tối đa 1 SKU |
| Rộng bin | ~2,5 m |
| Cao bin | <1 m; demo dùng pitch 0,78 m |
| Pallet | 1,13 × 0,97 m |
| Pallet thấp | 0,5 m |
| Khoảng hở pallet mục tiêu | ~0,1 m |

Nhãn nghiệp vụ “~200 pallets/rack đôi” chỉ là số tham chiếu. Dashboard và kiểm thử phải dùng số vị trí thực được render: 120 ở demo 6 tầng hoặc 140 khi cấu hình 7 tầng.

Địa chỉ bin có dạng:

```text
<rack-id>-<face>-L<level>-B<bin>
ST-A01-FR-L01-B01
ST-A01-BK-L06-B10
```

Mỗi địa chỉ là duy nhất. Một bin có `palletCapacity = 1`, `occupiedPallets` chỉ nhận `0 | 1`, và không được gán nhiều SKU.

### Kết cấu rack công nghiệp đang triển khai

Generator `industrial-rack-geometry.ts` tạo tám lớp member: `uprights`, `footplates`, `beams`, `supports`, `braces`, `frameTies`, `spacers`, `decks`. Mỗi vị trí có deck lưới thép riêng và mặt kê chịu hàng xác định; dầm/support đỡ deck, giằng nằm trên mặt chiều sâu của khung, row spacer nối hai mặt back-to-back. Kết cấu không lấy dữ liệu từ occupancy.

`DensoRackInstances` chỉ render kết cấu; `DensoPalletInstances` chỉ render pallet gỗ/box từ fixture deterministic `denso-demo-inventory.ts`. Nút Cargo và Racks độc lập. Một pallet 1,13 × 0,97 m đặt trên deck của một bin; seed cargo chỉ thay occupancy, không đổi geometry hoặc phân loại fast/slow. Đây là **demo hình học công nghiệp**, không phải thiết kế kết cấu chịu tải được kiểm định/chứng nhận.

## Phân vùng vận hành v1

| Zone | Vị trí tương đối | Chức năng |
|---|---|---|
| `LOADING_OUTBOUND` | Tây | Loading, staging xuất và Gate 2/OUT |
| `INBOUND_TRUCK_01` | Đông Bắc | Cổng xe tải 01 với staging, inspection, conveyor, staging 2 riêng |
| `INBOUND_TRUCK_02` | Đông Bắc | Cổng xe tải 02 với staging, inspection, conveyor, staging 2 riêng |
| `INBOUND_CONTAINER_01` | Đông Nam | Cổng container với staging, inspection, conveyor, staging 2 riêng |
| `OUTBOUND_PICK` | Giáp storage phía Tây | Forklift outbound lấy pallet từ storage |
| `OUTBOUND_CONVEYOR_QC` | Tây | Conveyor kiểm tra hàng xuất |
| `OUTBOUND_DISPATCH_STAGING` | Tây | Tập kết hàng đã kiểm tra, chờ xe chở vào kho trong |
| `MAIN_STORAGE` | Trung tâm | Các rack đôi chính |
| `DOMESTIC` | Phía Bắc hàng rào | Hàng trong nước/có VAT |
| `INTERNATIONAL` | Toàn bộ vùng hàng phía Nam hàng rào | Hàng quốc tế/không VAT; có thể chồng lớp nghiệp vụ với `MAIN_STORAGE` |
| `OFFICE_SUPPORT` | Nam | Bàn làm việc và khu hỗ trợ |

Mỗi inbound cell là một module khép kín: `gate → arrival staging → inspection → conveyor → transfer staging`. Không dùng staging, inspection hoặc conveyor chung giữa ba cổng.

## Hàng rào và camera

- Hàng rào customs v0 chạy ngang phía Bắc tại `Z = 76,5 m`, từ `X = 22 m` đến `X = 82 m`.
- `DOMESTIC` nằm phía Bắc hàng rào; `INTERNATIONAL` nằm phía Nam.
- Camera `CUST-CAM-01` giám sát hàng rào 24/24.
- Hàng rào là fixed obstacle thật cho navigation, không chỉ là overlay.
- Vị trí cổng kiểm soát trên hàng rào chưa có trong ảnh/đặc tả; v0 không tự thêm cổng.

## Luồng inbound đã chốt

```text
Truck 01 gate → Truck 01 staging → Truck 01 inspection → Truck 01 conveyor → Truck 01 staging 2 → Storage
Truck 02 gate → Truck 02 staging → Truck 02 inspection → Truck 02 conveyor → Truck 02 staging 2 → Storage
Container gate → Container staging → Container inspection → Container conveyor → Container staging 2 → Storage
```

Mỗi cell có flow riêng, với ID riêng; phase xe phải dùng flow/node trong data thay vì hard-code waypoint riêng.

## Luồng outbound đã chốt

```text
Storage → forklift outbound của zone storage → outbound QC conveyor
  → dispatch staging → xe chở vào kho trong
```

Forklift lấy hàng chỉ làm việc trong zone được giao. Xe nhận hàng từ dispatch staging để chuyển vào kho trong là phương tiện/luồng khác, không chia sẻ route với forklift storage.

## Phân tách xe và component độc lập

- Mỗi zone chỉ có **một forklift** làm việc; `ForkliftWorkCell` có hàng rào, vùng thao tác và quyền vào zone riêng.
- AGV và AMR có data lane/hàng rào riêng; scene Step A render line độc lập qua `DensoFloorMarkings`. `AgvLaneComponent` và `AmrLaneComponent` cũ vẫn còn trong source nhưng không mount song song để tránh trùng line.
- `DensoOperationalCells` compose `InboundCellComponent`, `OutboundCellComponent` và `ConveyorComponent` cho từng cell từ layout data; zone staging/inspection/transfer được render độc lập bằng `StageSurface`.
- Các component active là `AwsEnvironmentAssets`, `AwsWarehouseLighting`, `DensoFloorMarkings`, `DensoRackInstances`, `DensoPalletInstances`, `DensoSafetyBarriers` và `DensoForkliftWorkCells`; `DensoWarehouseShell` và `DensoVehicleLanes` tạm unmount.
- `SafetyBarrierComponent` sinh geometry rào từ data; validator dùng cùng barrier/work-cell/lane data để chặn lane cắt work zone hoặc rào.
- `Scene3D` chỉ compose các component trên từ layout data; component không giữ tọa độ nghiệp vụ hard-code.

## Putaway fast/slow-moving

- `FAST_MOVING`: ưu tiên rack gần Storage Handoff và trục di chuyển chính.
- `SLOW_MOVING`: ưu tiên rack xa điểm handoff.
- Nguồn phân loại thực tế là đơn vị PC.
- Demo dùng `movementClass` mock trên rack/bin; renderer chỉ hiển thị dữ liệu, không tự suy đoán fast/slow.
- Randomize cargo không được thay đổi `movementClass`.

## Layout rack v1

V1 bố trí 16 rack đôi trong `MAIN_STORAGE`: 8 hàng theo trục Bắc–Nam, mỗi hàng gồm hai rack run dài 25 m. Mỗi rack có 120 positions; tổng capacity render v1 là 1.920 pallet positions.

Các vị trí này nhằm tạo bản top-down reviewable theo ảnh. Số rack, khoảng cách aisle và tọa độ sẽ được hiệu chỉnh sau khi có CAD hoặc feedback trực quan. Lối forklift, AGV và AMR phải được chừa riêng và được rào ngăn cách; không ưu tiên số rack hơn an toàn luồng xe.

## Phương tiện

- AGV: chạy theo lane/line riêng có hàng rào.
- AMR: dùng map/navgrid và lane riêng có hàng rào.
- Forklift: một xe/zone; chưa tracking nên chỉ thể hiện static/manual, không phát telemetry vị trí giả.
- Fixed fence, vehicle barrier, rack và các vật cản sẽ dựng sau phải trở thành obstacle từ cùng layout data. Chưa dựng tường/đèn treo hoặc engine navigation trong revision này.

## Validation bắt buộc

- Tất cả ID trong từng collection là duy nhất.
- Mỗi rack nằm hoàn toàn trong footprint và không cắt hàng rào customs.
- Mỗi rack demo có đúng 120 bin addresses duy nhất.
- Capacity 7 tầng tính ra 140 mà không đổi code renderer.
- Mỗi bin chứa tối đa một pallet và một SKU.
- Ba inbound flow tồn tại, mỗi flow có staging/inspection/conveyor/staging 2 riêng.
- Outbound flow bắt buộc có storage pick → conveyor QC → dispatch staging → internal handoff.
- Không lane AGV/AMR/forklift nào cắt barrier của loại xe khác; một forklift work cell chỉ gán một zone.
- `DOMESTIC` nằm phía Bắc và `INTERNATIONAL` nằm phía Nam hàng rào.
- `validateDensoLayout(DENSO_LAYOUT_V1)` không trả lỗi; ngày 2026-10-03 regression có 30/30 test pass (16 layout + 6 AWS environment + 8 industrial rack/inventory) và production build pass. Production chỉ emit hai DAE sàn/mái AWS và ba PNG liên quan, không emit Lamp. Kết quả này không thay cho gate duyệt hình ảnh của người dùng; chưa đo FPS trên máy người dùng.

## Assumptions còn mở

1. Footprint 110 × 90 m thay cho kích thước CAD chưa có.
2. Tọa độ và chiều dài hàng rào customs là ước lượng từ ảnh.
3. Chưa có vị trí cổng kiểm soát trên hàng rào.
4. Chưa chốt số lượng AGV/AMR và vị trí forklift static; v1 chỉ chốt nguyên tắc một forklift/zone.
5. Khoảng cách aisle/rack v1 và vị trí chính xác ba cổng vẫn provisional cho đến khi có CAD/đo đạc; bản top-down v1 đã được duyệt để triển khai scene slice.
6. `binWidthM = 2,5 m` và `pallet.targetGapM = 0,1 m` vẫn là hai thông số nghiệp vụ độc lập. Demo giữ pitch bin 2,5 m và một pallet/bin, không tự thu hẹp bin để ép khoảng cách 0,1 m; trục đo/cách hiểu khoảng hở thực tế vẫn cần xác nhận khi có CAD.
