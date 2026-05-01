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

import { sileo } from "sileo";
import { translations } from "@utils/translations";

const getLang = () => localStorage.getItem("lang") || "vi";

function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

// ── XÓA WISH (delete_wish) ────────────────────────────────────────────────────
export function notifyXoaWish() {
  sileo.success({ title: t("delete_success") });
}

// ── THÊM WISH CÁ NHÂN (add_personal_wish) ────────────────────────────────────
export function notifyThemWishCaNhan() {
  sileo.success({ title: t("add_personal_success") });
}

// ── THÊM WISH NHÓM (add_group_wish) ──────────────────────────────────────────
export function notifyThemWishNhom() {
  sileo.success({ title: t("add_group_success") });
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
  sileo.success({ title: t("update_success") });
}

export function notifyCapNhatHoSo() {
  sileo.success({ title: t("profile_update_success") });
}

export function notifyDoiAvatar() {
  sileo.success({ title: t("avatar_update_success") });
}

export function notifyDoiBanner() {
  sileo.success({ title: t("banner_update_success") });
}

export function notifyCompressing() {
  sileo.info({ title: t("optimizing_image") });
}

// ── TẠO NHÓM (create_group) ──────────────────────────────────────────────────
export function notifyTaoNhom() {
  sileo.success({ title: t("create_group_success") });
}

// ── XÓA NHÓM (delete_group) ──────────────────────────────────────────────────
export function notifyXoaNhom() {
  sileo.success({ title: t("delete_group_success") });
}

// ── THAM GIA NHÓM (join_group) ───────────────────────────────────────────────
export function notifyThamGiaNhom() {
  sileo.success({ title: t("join_group_success") });
}

// ── RỜI NHÓM (leave_group) ────────────────────────────────────────────────
export function notifyRoiNhom() {
  sileo.success({ title: t("leave_group_success") });
}

// ── SAO CHÉP (copy) ───────────────────────────────────────────────────────────
export function notifyCopied() {
  sileo.success({ title: t("copy_success") });
}

// ── ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT ──────────────────────────────────────────
export function notifyDangNhap() {
  sileo.success({ title: t("login_success") });
}

export function notifyDangKy() {
  sileo.success({ title: t("signup_success") });
}

export function notifyLogout() {
  sileo.success({ title: t("logout_success") });
}

// ── LỖI (error) ───────────────────────────────────────────────────────────────
export function notifyError(message = t("update_failed")) {
  sileo.error({ title: message });
}
