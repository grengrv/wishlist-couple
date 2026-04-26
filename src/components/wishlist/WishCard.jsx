import { formatNgay } from "@utils/formatDate";
import Avatar from "@components/ui/Avatar";
import { useLanguage } from "@context/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * WishCard component - Một item trong danh sách
 * @param {Object} item - Dữ liệu item (id, ten, ghiChu, anhUrl, taoLuc)
 * @param {Function} onClick - Mở modal xem chi tiết
 */
export default function WishCard({ item, onClick, onToggleFavorite, user, layoutMode = "half" }) {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  const likeCount = item.likeCount || 0;
  const commentCount = item.commentCount || 0;
  const isLiked = item.isLiked;
  const isFavorite = !!item.isFavorite;

  // full mode is horizontal-ish on desktop, vertical-ish on mobile
  // half/third modes are always vertical-ish (grid style)
  const isHorizontal = layoutMode === "full";

  // Highlight logic
  useEffect(() => {
    const highlightId = searchParams.get("wishId");
    const shouldHighlight = searchParams.get("highlight") === "true";
    if (shouldHighlight && highlightId === item.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, item.id]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(item);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative flex w-full h-full rounded-2xl border transition-all duration-500 ease-in-out cursor-pointer overflow-hidden
        ${isHorizontal ? 'flex-col sm:flex-row items-stretch' : 'flex-col shadow-sm'}
        ${isHighlighted 
          ? 'ring-4 ring-amber-400 ring-offset-4 dark:ring-offset-bg-primary scale-[1.02] z-30 shadow-2xl' 
          : ''}
        ${isFavorite 
          ? 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-500/30 shadow-[0_8px_25px_rgba(251,191,36,0.15)]' 
          : 'bg-card-bg border-border-primary hover:bg-card-hover hover:-translate-y-1 hover:shadow-lg'
        }`} 
      onClick={() => onClick(item)}
    >
      {/* Favorite Accent Bar */}
      {isFavorite && (
        <div className={`absolute left-0 bg-amber-400 dark:bg-amber-500 z-10 shadow-[2px_0_10px_rgba(251,191,36,0.3)] ${
          isHorizontal ? 'top-0 w-full sm:w-1.5 h-1 sm:h-full' : 'top-0 w-full h-1'
        }`}></div>
      )}

      {/* Image Section */}
      {item.anhUrl && (
        <div className={`shrink-0 overflow-hidden bg-bg-primary/30 flex items-center justify-center border-border-primary/50 ${
          isHorizontal ? 'w-full sm:w-[240px] h-[200px] sm:h-auto border-b sm:border-b-0 sm:border-r' : 'w-full h-[180px] border-b'
        }`}>
          <img src={item.anhUrl} alt={item.ten} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col relative">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg font-bold text-text-primary leading-tight transition-colors ${isFavorite ? 'text-amber-900 dark:text-amber-100' : ''}`}>
              {item.ten}
            </h3>
            {isFavorite && (
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-0.5">
                {t("pinned")}
              </span>
            )}
          </div>
          
          {/* Star Button - Fixed to Right */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all duration-300 z-20 flex items-center justify-center ${
              isFavorite 
                ? 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 shadow-inner' 
                : 'text-text-muted/20 dark:text-text-muted/40 hover:text-amber-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
            title={isFavorite ? t("unpin") : t("pin")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </motion.button>
        </div>

        {item.ghiChu && (
          <p className={`text-[13px] text-text-secondary leading-relaxed mb-4 opacity-80 ${isHorizontal ? 'line-clamp-4 sm:line-clamp-none' : 'line-clamp-3'}`}>
            {item.ghiChu}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto pt-2 border-t border-border-primary/20">
          {/* Social Counters */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-[12px] font-bold transition-colors ${isLiked ? 'text-rose-500' : 'text-text-muted/60'}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {likeCount}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-text-muted/60">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {commentCount}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Author Info */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-bg-secondary/50 border border-border-primary/30">
              <Avatar src={item.avatarNguoiThem} name={item.themBoi} size="xs" className="w-5 h-5 border border-white dark:border-gray-800" />
              <span className="text-[11px] font-bold text-pink-brand truncate max-w-[80px]">
                {item.themBoi || t("anonymous")}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Arrow indicator */}
      <div className={`flex items-center transition-all duration-300 transform group-hover:translate-x-1 pointer-events-none absolute bottom-4 right-4 ${
        isHorizontal ? 'opacity-100 sm:relative sm:bottom-0 sm:right-0 sm:pr-4' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </motion.div>
  );
}
