/**
 * Định dạng timestamp (Firestore hoặc Date) thành chuỗi ngày tiếng Việt
 * @param {*} taoLuc - Firestore Timestamp hoặc Date object
 * @returns {string} VD: "05/04/2026"
 */
export function formatNgay(taoLuc) {
  if (!taoLuc) return "";
  const d = taoLuc.toDate ? taoLuc.toDate() : new Date(taoLuc);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
