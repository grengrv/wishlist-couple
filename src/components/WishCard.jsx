import { formatNgay } from "../utils/formatDate";
import Avatar from "./ui/Avatar";

/**
 * WishCard component - Một item trong danh sách
 * @param {Object} item - Dữ liệu item (id, ten, ghiChu, anhUrl, taoLuc)
 * @param {Function} onClick - Mở modal xem chi tiết
 */
export default function WishCard({ item, onClick }) {
  return (
    <div className="bg-white rounded-2xl border border-pink-border overflow-hidden flex items-stretch relative cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(194,24,91,0.08)]" onClick={() => onClick(item)}>
      {item.anhUrl && (
        <img src={item.anhUrl} alt={item.ten} className="w-[120px] object-cover shrink-0" />
      )}
      <div className="px-4 py-3.5 pr-10 flex-1 flex flex-col justify-center gap-1.5">
        <h3 className="text-base font-semibold text-text-base leading-[1.4]">{item.ten}</h3>
        {item.ghiChu && <p className="text-[13px] text-text-light leading-[1.6]">{item.ghiChu}</p>}
        {/* Avatar + username người thêm */}
        <div className="flex items-center gap-1.5 mt-2">
          <Avatar src={item.avatarNguoiThem} name={item.themBoi} size="sm" />
          <span className="text-xs font-semibold text-pink-brand">{item.themBoi || "Ẩn danh"}</span>
          <span className="text-[11px] text-pink-muted ml-auto">{formatNgay(item.taoLuc)}</span>
        </div>
      </div>
      <div className="flex items-center pr-3.5 text-[22px] text-pink-muted shrink-0 absolute right-0 inset-y-0">›</div>
    </div>
  );
}
