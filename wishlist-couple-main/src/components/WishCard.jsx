import { formatNgay } from "../utils/formatDate";
import Avatar from "./ui/Avatar";
import { useLanguage } from "../context/LanguageContext";

/**
 * WishCard component - Một item trong danh sách
 * @param {Object} item - Dữ liệu item (id, ten, ghiChu, anhUrl, taoLuc)
 * @param {Function} onClick - Mở modal xem chi tiết
 */
export default function WishCard({ item, onClick, user }) {
  const { t } = useLanguage();
  const likeCount = item.likeCount || 0;
  const commentCount = item.commentCount || 0;
  const isLiked = item.isLiked;

  return (
    <div className="bg-card-bg rounded-2xl border border-border-primary overflow-hidden flex items-stretch relative cursor-pointer transition-all duration-200 hover:bg-card-hover hover:-translate-y-1 hover:shadow-lg" onClick={() => onClick(item)}>
      {item.anhUrl && (
        <img src={item.anhUrl} alt={item.ten} className="w-[120px] object-cover shrink-0" />
      )}
      <div className="px-4 py-3.5 pr-10 flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <h3 className="text-base font-semibold text-text-primary leading-[1.4] truncate">{item.ten}</h3>
        {item.ghiChu && <p className="text-[13px] text-text-secondary leading-[1.6] line-clamp-2">{item.ghiChu}</p>}

        {/* Social Counters */}
        <div className="flex items-center gap-3 mt-1">
          <div className={`flex items-center gap-1 text-[11px] font-bold ${isLiked ? 'text-rose-500' : 'text-text-muted'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {likeCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {commentCount}
          </div>
        </div>

        {/* Avatar + username người thêm */}
        <div className="flex items-center gap-1.5 mt-2 min-w-0">
          <Avatar src={item.avatarNguoiThem} name={item.themBoi} size="sm" />
          <span className="text-xs font-semibold text-pink-brand truncate">{item.themBoi || t("anonymous")}</span>
          <span className="text-[11px] text-text-muted ml-auto shrink-0">{formatNgay(item.taoLuc)}</span>
        </div>
      </div>
      <div className="flex items-center pr-3.5 text-[22px] text-text-muted shrink-0 absolute right-0 inset-y-0">›</div>
    </div>
  );
}
