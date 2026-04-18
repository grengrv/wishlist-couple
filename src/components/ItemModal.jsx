import { useEffect } from "react";
import { formatNgay } from "../utils/formatDate";
import Avatar from "./ui/Avatar";

export default function ItemModal({ item, onClose, onDelete, user, adminEmail }) {
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
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[500px] overflow-hidden relative shadow-[0_20px_70px_rgba(0,0,0,0.15)] animate-slide-up rounded-[32px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-gray-500 hover:text-pink-500 transition-all cursor-pointer flex items-center justify-center z-20 shadow-sm border border-gray-100"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 1. KHUNG HÌNH CỐ ĐỊNH (Không bị nhảy layout) */}
        <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
          {item.anhUrl ? (
            <img
              src={item.anhUrl}
              alt={item.ten}
              /* - object-contain: Đảm bảo hình KHÔNG bị cắt, hiện toàn bộ.
                - w-full h-full: Lấp đầy khung cố định đã thiết lập ở thẻ cha.
              */
              className="w-full h-full object-contain p-2 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
            </div>
          )}
        </div>

        {/* 2. PHẦN NỘI DUNG */}
        <div className="p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-3 tracking-tighter">
              {item.ten}
            </h2>
            {item.ghiChu && (
              <p className="text-gray-500 text-[15px] leading-relaxed font-medium">
                {item.ghiChu}
              </p>
            )}
          </div>

          {/* User Info & Action */}
          <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={item.avatarNguoiThem} name={item.themBoi} className="w-10 h-10 border-2 border-pink-50" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{item.themBoi || "Ẩn danh"}</span>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">{formatNgay(item.taoLuc)}</span>
              </div>
            </div>

            {(!item.uid || item.uid === user?.uid || user?.email === adminEmail) && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                title="Xóa điều ước"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}