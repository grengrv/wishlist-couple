import { useState } from "react";
import WishCard from "@components/wishlist/WishCard";
import { useLanguage } from "@context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

/**
 * WishList component - Danh sách các điều ước với hệ thống layout linh hoạt
 */
export default function WishList({ items, onSelectItem, onToggleFavorite, user }) {
  const { t } = useLanguage();
  const [layoutMode, setLayoutMode] = useState("half"); // "full" | "half" | "third"

  const gridConfig = {
    full: "grid-cols-1",
    half: "grid-cols-1 sm:grid-cols-2",
    third: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-pink-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
              {t("your_list")}
            </h3>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-[1px]">
              {items.length} {t("items")}
            </p>
          </div>
        </div>

        {/* Layout Toggle System */}
        <div className="flex items-center gap-1 bg-bg-secondary/80 backdrop-blur-md p-1.5 rounded-[20px] border border-border-primary/50 shadow-inner">
          <button
            onClick={() => setLayoutMode("full")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
              layoutMode === "full"
                ? "bg-text-primary text-bg-primary shadow-lg scale-105"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
            title={t("layout_full")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </button>
          <button
            onClick={() => setLayoutMode("half")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
              layoutMode === "half"
                ? "bg-text-primary text-bg-primary shadow-lg scale-105"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
            title={t("layout_half")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <rect x="3" y="3" width="8" height="18" rx="2" />
              <rect x="13" y="3" width="8" height="18" rx="2" />
            </svg>
          </button>
          <button
            onClick={() => setLayoutMode("third")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
              layoutMode === "third"
                ? "bg-text-primary text-bg-primary shadow-lg scale-105"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
            title={t("layout_third")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <rect x="2" y="3" width="6" height="18" rx="1.5" />
              <rect x="9" y="3" width="6" height="18" rx="1.5" />
              <rect x="16" y="3" width="6" height="18" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <motion.div 
        layout
        className={`grid gap-5 ${gridConfig[layoutMode]}`}
      >
        {items.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-bg-secondary/30 rounded-[40px] border-2 border-dashed border-border-primary/50 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-bg-primary/50 flex items-center justify-center mb-6 text-text-muted/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="text-lg font-bold text-text-muted">
              {t("wishlist_empty")}
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <WishCard 
              key={item.id} 
              item={item} 
              onClick={onSelectItem} 
              onToggleFavorite={onToggleFavorite}
              user={user}
              layoutMode={layoutMode}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
