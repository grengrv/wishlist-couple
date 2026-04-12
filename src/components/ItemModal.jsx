import { useEffect } from "react";
import { formatNgay } from "../utils/formatDate";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";

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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-[20px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto relative animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 border-none text-white text-xl cursor-pointer flex items-center justify-center leading-none z-10" onClick={onClose}>×</button>
        {item.anhUrl && (
          <img src={item.anhUrl} alt={item.ten} className="w-full h-auto max-h-[500px] object-contain block bg-[#f9f0f4]" />
        )}
        <div className="p-6 flex flex-col gap-2.5">
          <h2 className="text-[22px] font-bold text-text-base break-words leading-tight">{item.ten}</h2>
          {item.ghiChu && (
            <p className="text-[15px] text-text-sub leading-[1.7] break-all whitespace-pre-wrap">{item.ghiChu}</p>
          )}
          <p className="text-xs text-pink-muted">Thêm ngày {formatNgay(item.taoLuc)}</p>
          
          <div className="flex items-center gap-2 mt-1 mb-4">
            <Avatar src={item.avatarNguoiThem} name={item.themBoi} size="sm" />
            <span className="text-xs font-semibold text-pink-brand">{item.themBoi || "Ẩn danh"}</span>
          </div>

          {/* Chỉ hiện nút xóa nếu là chủ hoặc admin */}
          {(!item.uid || item.uid === user?.uid || user?.email === adminEmail) && (
            <Button
              variant="danger"
              className="mt-1.5"
              onClick={() => onDelete(item.id)}
            >
              Xóa khỏi danh sách
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
