---
type: implementation
date: 2026-10-03
status: awaiting-user-review
---

# Industrial rack / mái 10 m — bàn giao kiểm tra

## Tóm tắt

Đã thực hiện ba thay đổi người dùng cho phép: bỏ model đèn treo nhưng giữ ánh sáng nền; nâng mái AWS lên 10 m; thay rack placeholder bằng selective pallet rack công nghiệp back-to-back. Chưa ghi nhận người dùng duyệt hình ảnh. Không tiếp tục xe, navigation, tường/cổng hoặc UI vận hành trước gate duyệt.

## Kết quả triển khai

- Sàn/material/texture AWS, footprint 110 × 90 m (9.900 m² ≈ 10.000 m²), vạch Denso, route/layout, camera và tường ẩn được giữ.
- Mái AWS có toggle thủ công và cao tối thiểu 10 m. Đây là lựa chọn **demo**, không thay thông tin kho thực tế ban đầu khoảng 5 m thành số đo 10 m.
- Không load/render đèn treo hoặc fixture point lights; bỏ nút Lights. Giữ ambient/hemisphere/directional lighting và Day/Night; không distance fog.
- 16 rack × 120 vị trí = **1.920 positions**; mỗi rack 6 tầng × 10 bin/mặt × 2 mặt, một pallet/một SKU tối đa trong mỗi bin.
- Tám lớp kết cấu: upright, footplate, load beam, pallet support/cross member, diagonal brace, frame tie, row spacer và wire-mesh deck. Mỗi bin có deck/mặt kê rõ ràng khi không chứa hàng.
- Rack/cargo là renderer và dữ liệu độc lập. Fixture mặc định seed 42 có 1.114 bin chứa pallet/box; đây là dữ liệu demo, không phải inventory WMS hoặc thuật toán phân loại PC. Cargo/Randomize không thay kết cấu.
- Đây là demo hình học công nghiệp, **không phải thiết kế chịu tải đã kiểm định/chứng nhận**. Pitch bin 2,5 m được giữ; không ép khoảng hở pallet 0,1 m khi chưa rõ trục đo.

## Kiểm tra kỹ thuật

| Kiểm tra | Kết quả |
|---|---|
| `npm test` | 30/30 pass: 16 layout, 6 AWS environment, 8 rack/inventory |
| `npm run build` | Pass; còn cảnh báo chunk lớn, không chặn build |
| Production assets | Hai DAE sàn/mái + ba PNG; không emit Lamp |
| [Code review](./industrial-rack-review.md) | Không phát hiện P1/P2 mới |
| [Browser JSON](./industrial-rack-visuals/review-results.json) | Không runtime/network error; roof minimum Y = 10 m; không hanging lamps |
| Browser invariants | Cargo không đổi structure; cargo/rack độc lập; randomize khi rack ẩn không lỗi; camera không tự đổi roof |

Browser đo 192 draw calls và 1.109.108 triangles trong snapshot, **không phải đo FPS**. Hiệu năng trên máy người dùng vẫn cần kiểm tra trực tiếp.

## Ảnh và checklist duyệt

1. [Overview có hàng](./industrial-rack-visuals/01-overview-cargo-on.png) / [không hàng](./industrial-rack-visuals/02-overview-cargo-off.png): đọc đúng hai mặt, sáu tầng và layout.
2. [Aisle không hàng](./industrial-rack-visuals/03-aisle-cargo-off.png) / [có hàng](./industrial-rack-visuals/04-aisle-cargo-on.png): xác nhận mặt deck/support đủ rõ và hàng đặt trên deck.
3. [End frame không hàng](./industrial-rack-visuals/05-end-frame-cargo-off.png) / [có hàng](./industrial-rack-visuals/06-end-frame-cargo-on.png): xác nhận giằng, liên kết giữa hai mặt và chân đế.
4. [Mái 10 m, không đèn treo](./industrial-rack-visuals/07-interior-roof-10m.png): kiểm tra chiều cao, ánh sáng nền và toggle Roof.
5. [Zoom xa Night](./industrial-rack-visuals/08-far-night.png) / [Day](./industrial-rack-visuals/09-far-day.png): kiểm tra độ sáng/khả năng đọc toàn kho.
6. Trong app, tắt Cargo nhưng giữ Racks; bật/tắt Racks độc lập; đổi camera/Day–Night; kiểm tra cảm giác thao tác và tốc độ trên GPU thực tế.

## Trạng thái và bước tiếp theo

Phase 1: 6/7 tiêu chí kỹ thuật; Phase 2: 5/6; Phase 3: 0/6, vẫn blocked. Tổng 11/19 (58%) là tiến độ implementation, **không phải nghiệm thu**. Gate A/Gate B chưa được người dùng duyệt. Dừng tại revision này để người dùng duyệt/chỉ định chỉnh hình ảnh; không commit/push hoặc tạo folder feature/Memory mới.

Các báo cáo Step A và journal cũ giữ nguyên làm lịch sử lamps/mái 5 m; không dùng chúng làm baseline hiện hành đã nghiệm thu.

## Vấn đề còn mở

- CAD/đo đạc thật, cách hiểu trục khoảng hở pallet 0,1 m, thẩm mỹ rack/mái và FPS trên máy người dùng chưa được xác nhận.
- Chưa triển khai xe/telemetry/navigation hoặc tường/cổng trong revision này.
