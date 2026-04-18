/**
 * notify.js — Hệ thống thông báo thống nhất.
 *
 * QUY TẮC CỨNG:
 * - Text-only: không icon, không emoji, không ký hiệu.
 * - Mỗi action = 1 message cố định, không thay đổi.
 * - Gọi qua toastStore → hiển thị tại top-right màn hình (Sileo style).
 * - Không gọi sileo / react-hot-toast trực tiếp bất kỳ đâu khác.
 *
 * BẢNG PHÂN CÔNG (action → message cố định):
 * ┌──────────────────────┬───────────────────────────────────┬─────────┐
 * │ Action               │ Message                           │ Type    │
 * ├──────────────────────┼───────────────────────────────────┼─────────┤
 * │ add_personal_wish    │ Thêm wish cá nhân thành công      │ success │
 * │ add_group_wish       │ Thêm wish nhóm thành công         │ success │
 * │ delete_wish          │ Xóa wish thành công               │ success │
 * │ update_wish / group  │ Cập nhật thành công               │ success │
 * │ create_group         │ Tạo nhóm thành công               │ success │
 * │ delete_group         │ Xóa nhóm thành công               │ success │
 * │ join_group           │ Tham gia nhóm thành công          │ success │
 * │ copy                 │ Đã sao chép                       │ success │
 * │ error                │ <message do caller truyền vào>    │ error   │
 * └──────────────────────┴───────────────────────────────────┴─────────┘
 */

import { toastStore } from "./toastStore";

// ── XÓA WISH (delete_wish) ────────────────────────────────────────────────────
export function notifyXoaWish() {
  toastStore.show("Xóa thành công");
}

// ── THÊM WISH CÁ NHÂN (add_personal_wish) ────────────────────────────────────
export function notifyThemWishCaNhan() {
  toastStore.show("Đã thêm vào danh sách của bạn");
}

// ── THÊM WISH NHÓM (add_group_wish) ──────────────────────────────────────────
export function notifyThemWishNhom() {
  toastStore.show("Đã thêm vào danh sách nhóm");
}

/**
 * Wrapper tự động chọn đúng hàm dựa vào context.
 * @param {boolean} isGroup - true nếu đang thêm vào nhóm.
 */
export function notifyThemWish(isGroup = false) {
  if (isGroup) {
    notifyThemWishNhom();
  } else {
    notifyThemWishCaNhan();
  }
}



// ── CẬP NHẬT (update_wish / update_group / profile) ──────────────────────────
export function notifyLuuNhom() {
  toastStore.show("Cập nhật thành công");
}

export function notifyCapNhatHoSo() {
  toastStore.show("Cập nhật hồ sơ thành công");
}

export function notifyDoiAvatar() {
  toastStore.show("Đổi ảnh đại diện thành công");
}

export function notifyDoiBanner() {
  toastStore.show("Đổi ảnh nền thành công");
}

export function notifyCompressing() {
  toastStore.show("Đang tối ưu ảnh...");
}

// ── TẠO NHÓM (create_group) ──────────────────────────────────────────────────
export function notifyTaoNhom() {
  toastStore.show("Tạo nhóm thành công");
}

// ── XÓA NHÓM (delete_group) ──────────────────────────────────────────────────
export function notifyXoaNhom() {
  toastStore.show("Xóa nhóm thành công");
}

// ── THAM GIA NHÓM (join_group) ───────────────────────────────────────────────
export function notifyThamGiaNhom() {
  toastStore.show("Tham gia nhóm thành công");
}

// ── SAO CHÉP (copy) ───────────────────────────────────────────────────────────
export function notifyCopied() {
  toastStore.show("Lấy link mời tham gia thành công");
}

// ── ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT ──────────────────────────────────────────
export function notifyDangNhap() {
  toastStore.show("Đăng nhập thành công");
}

export function notifyDangKy() {
  toastStore.show("Đăng ký thành công");
}

export function notifyLogout() {
  toastStore.show("Đăng xuất thành công");
}

// ── LỖI (error) ───────────────────────────────────────────────────────────────
export function notifyError(message = "Cập nhật thất bại") {
  toastStore.show(message, "error");
}
