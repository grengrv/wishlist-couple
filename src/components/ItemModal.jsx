import { useEffect } from "react";
import { formatNgay } from "../utils/formatDate";

/**
 * ItemModal component - Modal xem chi tiết và xóa item
 * @param {Object|null} item      - Item đang được chọn (null = đóng modal)
 * @param {Function}   onClose    - Đóng modal
 * @param {Function}   onDelete   - Xóa item theo id
 * @param {Object}     user       - Firebase Auth user hiện tại
 * @param {string}     adminEmail - Email admin có quyền xóa mọi item
 */
export default function ItemModal({ item, onClose, onDelete, user, adminEmail }) {
  // Đóng modal bằng phím Escape & khóa scroll trang
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {item.anhUrl && (
          <img src={item.anhUrl} alt={item.ten} className="modal-img" />
        )}
        <div className="modal-body">
          <h2 className="modal-ten">{item.ten}</h2>
          {item.ghiChu && (
            <p className="modal-ghichu">{item.ghiChu}</p>
          )}
          <p className="modal-date">Thêm ngày {formatNgay(item.taoLuc)}</p>
          {item.themBoi && (
            <p className="modal-date" style={{ marginTop: 4, marginBottom: 8 }}>
              Bởi: {item.themBoi}
            </p>
          )}
          {/* Chỉ hiện nút xóa nếu là chủ hoặc admin */}
          {(!item.uid || item.uid === user?.uid || user?.email === adminEmail) && (
            <button
              className="modal-btn-xoa"
              onClick={() => onDelete(item.id)}
            >
              Xóa khỏi danh sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
