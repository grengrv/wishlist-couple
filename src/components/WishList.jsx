import { useState } from "react";
import WishCard from "./WishCard";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

/**
 * WishList component - Danh sách các điều ước với hệ thống layout linh hoạt
 */
export default function WishList({ items, onSelectItem, onToggleFavorite, user }) {
  const { t } = useLanguage();
  const [layoutMode, setLayoutMode] = useState("grid"); // "grid" | "list"

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
            onClick={() => setLayoutMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
              layoutMode === "grid"
                ? "bg-text-primary text-bg-primary shadow-lg scale-105"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {t("layout_grid")}
          </button>
          <button
            onClick={() => setLayoutMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
              layoutMode === "list"
                ? "bg-text-primary text-bg-primary shadow-lg scale-105"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            {t("layout_list")}
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <motion.div 
        layout
        className={
          layoutMode === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5"
        }
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
