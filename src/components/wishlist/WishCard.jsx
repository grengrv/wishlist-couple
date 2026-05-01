import Avatar from "@components/ui/Avatar";
import { useLanguage } from "@context/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const MOOD_META = {
  craving:   { emoji: "\uD83D\uDE0D", labelKey: "mood_craving",   color: "#ec4899", bg: "#fce7f3" },
  dreaming:  { emoji: "\uD83D\uDCAD", labelKey: "mood_dreaming",  color: "#8b5cf6", bg: "#ede9fe" },
  urgent:    { emoji: "\uD83D\uDD25", labelKey: "mood_urgent",    color: "#f97316", bg: "#ffedd5" },
  done:      { emoji: "\uD83C\uDF89", labelKey: "mood_done",      color: "#10b981", bg: "#d1fae5" },
  expensive: { emoji: "\uD83D\uDCB8", labelKey: "mood_expensive", color: "#f59e0b", bg: "#fef3c7" },
  together:  { emoji: "\uD83E\uDD1D", labelKey: "mood_together",  color: "#3b82f6", bg: "#dbeafe" },
};

/**
 * WishCard component - Một item trong danh sách
 * @param {Object} item - Dữ liệu item (id, ten, ghiChu, anhUrl, taoLuc)
 * @param {Function} onClick - Mở modal xem chi tiết
 */
export default function WishCard({ item, onClick, onToggleFavorite, folders = [], layoutMode = "half" }) {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);

  const folder = folders.find(f => f.id === item.folderId);
  
  const likeCount = item.likeCount || 0;
  const commentCount = item.commentCount || 0;
  const isLiked = item.isLiked;
  const isFavorite = !!item.isPinned; // Use the enriched per-user pin state
  const pinCount = item.pinCount || 0;

  // full mode is horizontal-ish on desktop, vertical-ish on mobile
  // half/third modes are always vertical-ish (grid style)
  const isHorizontal = layoutMode === "full";

  // Highlight logic
  useEffect(() => {
    const highlightId = searchParams.get("wishId");
    const shouldHighlight = searchParams.get("highlight") === "true";
    if (shouldHighlight && highlightId === item.id) {
      const initialTimer = setTimeout(() => setIsHighlighted(true), 0);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => {
        clearTimeout(initialTimer);
        clearTimeout(timer);
      };
    }
  }, [searchParams, item.id]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(item);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("wishId", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={handleDragStart}
      className={`group relative flex w-full h-full rounded-2xl border transition-all duration-500 ease-in-out cursor-pointer overflow-hidden
        ${isHorizontal ? 'flex-col sm:flex-row items-stretch' : 'flex-col shadow-sm'}
        ${isHighlighted 
          ? 'ring-4 ring-amber-200 ring-offset-4 dark:ring-offset-bg-primary scale-[1.02] z-30 shadow-2xl' 
          : ''}
        ${isFavorite 
          ? 'bg-gradient-to-br from-amber-50/80 via-white to-white dark:from-amber-950/20 dark:via-bg-secondary dark:to-bg-secondary border-amber-200 dark:border-amber-500/30 shadow-[0_20px_40px_rgba(251,191,36,0.1)] dark:shadow-none' 
          : 'bg-card-bg border-border-primary hover:bg-card-hover hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]'
        }`} 
      onClick={() => onClick(item)}
    >
      {/* Favorite Accent Bar */}
      {isFavorite && (
        <div className={`absolute left-0 bg-gradient-to-b from-amber-400 to-amber-400 dark:from-amber-500 z-10 shadow-[2px_0_15px_rgba(251,191,36,0.3)] ${
          isHorizontal ? 'top-0 w-full sm:w-2 h-1 sm:h-full' : 'top-0 w-full h-1.5'
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
            <h3 className={`text-base sm:text-lg font-bold text-text-primary leading-tight transition-colors ${isFavorite ? 'text-amber-500 dark:text-amber-500' : ''}`}>
              {item.ten}
            </h3>

            {/* Metadata Row: Pinned - Mood - Link */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isFavorite && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {t("pin_count")}
                </span>
              )}
              
              {item.mood && MOOD_META[item.mood] && (() => {
                const m = MOOD_META[item.mood];
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border"
                    style={{ backgroundColor: m.bg, color: m.color, borderColor: `${m.color}30` }}
                  >
                    <span>{m.emoji}</span>
                    {t(m.labelKey)}
                  </span>
                );
              })()}

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-[10px] font-black hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  {t("view_product")}
                </a>
              )}

              {folder && (
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-bg-secondary/50 text-text-muted border-border-primary/50"
                  style={{ color: folder.color ? folder.color : undefined }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  {folder.name}
                </span>
              )}
            </div>
          </div>
          
          {/* Star Button - Fixed to Right */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className={`w-11 h-11 rounded-full transition-all duration-500 z-20 flex items-center justify-center shadow-sm ${
              isFavorite 
                ? 'text-white bg-gradient-to-tr from-amber-400 to-amber-600 shadow-[0_8px_20px_rgba(251,191,36,0.4)]' 
                : 'text-text-muted/20 dark:text-text-muted/40 bg-bg-secondary/40 border border-border-primary/50 hover:text-amber-400 hover:border-amber-300'
            }`}
            title={isFavorite ? t("unpin") : t("pin")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
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
            <div className={`flex items-center gap-1.5 text-[12px] font-bold transition-colors ${isFavorite ? 'text-amber-500' : 'text-text-muted/60'}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {pinCount}
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
