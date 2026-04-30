import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { useConfirm } from "@context/ConfirmContext";
import { notifyThemWish, notifyError } from "@utils/notify";
import { useLanguage } from "@context/LanguageContext";

const MOOD_OPTIONS = [
  { key: "craving",   emoji: "\uD83D\uDE0D", labelKey: "mood_craving",   color: "#ec4899", bg: "#fce7f3" },
  { key: "dreaming",  emoji: "\uD83D\uDCAD", labelKey: "mood_dreaming",  color: "#8b5cf6", bg: "#ede9fe" },
  { key: "urgent",    emoji: "\uD83D\uDD25", labelKey: "mood_urgent",    color: "#f97316", bg: "#ffedd5" },
  { key: "done",      emoji: "\uD83C\uDF89", labelKey: "mood_done",      color: "#10b981", bg: "#d1fae5" },
  { key: "expensive", emoji: "\uD83D\uDCB8", labelKey: "mood_expensive", color: "#f59e0b", bg: "#fef3c7" },
  { key: "together",  emoji: "\uD83E\uDD1D", labelKey: "mood_together",  color: "#3b82f6", bg: "#dbeafe" },
];

export default function AddForm({
  tenMon, setTenMon,
  link, setLink,
  ghiChu, setGhiChu,
  mood, setMood,
  previewAnh, setPreviewAnh,
  anhBase64, setAnhBase64,
  dangTai,
  keoVao, setKeoVao,
  chonAnh,
  xoaAnh,
  themMon,
  formError,
  isImageTooLarge,
  nenAnh,
  setFormError,
  existingItems,
  isGroup = false,
  folders = [],
  selectedFolderId = null,
  onSelectFolder = () => {}
}) {
  const [focusField, setFocusField] = useState(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scraperWarning, setScraperWarning] = useState("");
  const [nameError, setNameError] = useState(false);
  const [selectedMood, setSelectedMood] = useState(mood ?? null);
  const confirm = useConfirm();
  const { t } = useLanguage();

  const handleMoodClick = (key) => {
    const next = selectedMood === key ? null : key;
    setSelectedMood(next);
    if (typeof setMood === "function") setMood(next);
  };

  const handleCloseError = () => setFormError("");

  const fetchMetadata = async (url) => {
    if (!url || !url.startsWith("http")) return;
    setIsScraping(true);
    setScraperWarning("");
    
    // Quick check for known tough sites
    if (url.includes("shopee.vn") || url.includes("lazada.vn")) {
      setScraperWarning(t("scraper_shopee_warning"));
    }

    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&prerender=true&waitFor=3000&data.price.selector=[itemprop="price"]`);
      const result = await response.json();
      if (result.status === "success") {
        let { title, description, image, price, currency } = result.data;
        
        // 0. Robust Title Extraction (Handle encoded Shopee titles etc.)
        try {
          if (title && title.includes("%")) title = decodeURIComponent(title);
        } catch (e) {}

        // Fallback title from URL if empty
        if (!title || title.length < 5) {
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split("-");
            if (pathParts.length > 2) {
              const guessedTitle = pathParts.slice(0, pathParts.length - 1).join(" ").replace(/\//g, "").trim();
              if (guessedTitle.length > 5) title = guessedTitle;
            }
          } catch (e) {}
        }

        const safeTitle = title ? title.substring(0, 40).replace(/-/g, " ").trim() : "";
        const safeDesc = description ? description.substring(0, 100).trim() : "";
        
        // Smarter price extraction (Logging only, since field is removed)
        let extractedPrice = "";
        
        // 1. Try direct price property
        if (price) {
          extractedPrice = `${price}${currency ? " " + currency : ""}`;
        } 
        // 2. Try to find in metadata if available
        else if (result.data.meta) {
          const meta = result.data.meta;
          extractedPrice = meta.price || meta["og:price:amount"] || meta["product:price:amount"] || "";
          if (extractedPrice && (meta.currency || meta["og:price:currency"])) {
            extractedPrice += ` ${meta.currency || meta["og:price:currency"]}`;
          }
        }
        
        // 3. Fallback: Regex scan in description OR title
        if (!extractedPrice && (description || title)) {
          const contentToScan = `${title} ${description}`;
          // Matches patterns like: 100.000, 100,000, 100k, 100.000đ, $100
          const priceMatch = contentToScan.match(/(\d{1,3}(?:\.\d{3})+(?:,\d+)?\s?[₫đ$€]|[$€]\s?\d+(?:\.\d+)?|\d+\s?k(?!\w))/i);
          if (priceMatch) extractedPrice = priceMatch[0];
        }

        console.log("[Scraper Debug] Found price:", extractedPrice, "from data:", result.data);

        if (safeTitle) setTenMon(safeTitle);
        if (safeDesc) setGhiChu(safeDesc);
        
        if (image?.url) {
          setMood("craving");
          setSelectedMood("craving");
          if (setPreviewAnh) setPreviewAnh(image.url);
          if (setAnhBase64) setAnhBase64(image.url);
        } else if (!scraperWarning) {
          setScraperWarning(t("scraper_warning"));
        }
      } else {
        setScraperWarning(t("scraper_warning"));
      }
    } catch (error) {
      console.error("Scraping error:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    if (setLink) setLink(val);
    if (val.startsWith("http")) {
      fetchMetadata(val);
    }
  };

  const handleThemClick = async () => {
    // Validate name
    if (!tenMon.trim()) {
      setNameError(true);
      setTimeout(() => setNameError(false), 600);
      return;
    }

    // Kiểm tra trùng lặp
    const isDuplicate = existingItems?.some(item =>
      item.ten?.trim().toLowerCase() === tenMon.trim().toLowerCase()
    );

    if (isDuplicate) {
      const isOk = await confirm({
        title: t("duplicate_title"),
        message: t("duplicate_msg", { itemName: tenMon.trim() }),
        confirmText: t("still_add"),
        cancelText: t("review_again"),
      });
      if (!isOk) return;
    }

    // Thực hiện thêm món
    try {
      const success = await themMon(selectedMood);
      if (success) {
        notifyThemWish(isGroup);
        setSelectedMood(null);
      }
    } catch {
      notifyError(t("update_failed"));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary/40 backdrop-blur-2xl rounded-[40px] p-8 mb-12 border border-white/20 dark:border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.1)] flex flex-col gap-8 max-w-2xl mx-auto w-full transition-all duration-500 hover:shadow-[0_40px_80px_rgba(236,72,153,0.12)] relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

      {/* DROP ZONE */}
      <div
        className={`
          relative group border-2 rounded-[24px] overflow-hidden transition-all duration-500
          ${previewAnh
            ? "aspect-[16/9] border-transparent shadow-inner"
            : "aspect-[16/6] border-dashed border-border-primary bg-bg-primary/50 cursor-pointer flex items-center justify-center"
          }
          ${keoVao && !previewAnh ? "!border-pink-300 !bg-bg-primary scale-[0.98]" : ""}
        `}
        onDragOver={e => { e.preventDefault(); setKeoVao(true); }}
        onDragLeave={() => setKeoVao(false)}
        onDrop={e => {
          e.preventDefault();
          setKeoVao(false);
          chonAnh(e.dataTransfer.files[0]);
        }}
        onClick={() => !previewAnh && document.getElementById("file-input").click()}
      >
        {previewAnh ? (
          <>
            <img src={previewAnh} alt="preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[2px] shadow-2xl transition-all hover:bg-rose-500 hover:text-white"
                onClick={e => { e.stopPropagation(); xoaAnh(); }}
              >
                {t("change_image")}
              </motion.button>
            </div>
          </>
        ) : (
          <div className="text-center group-hover:scale-110 transition-transform duration-500">
            <div className="w-16 h-16 bg-bg-secondary/80 rounded-[28px] flex items-center justify-center shadow-lg mx-auto mb-5 text-text-muted group-hover:text-pink-500 group-hover:rotate-[15deg] transition-all duration-500 border border-white/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[3px] opacity-60 group-hover:opacity-100 transition-opacity">{t("drop_image")}</p>
          </div>
        )}
        <input id="file-input" type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { chonAnh(e.target.files[0]); e.target.value = ""; } }} />
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-4">
        {/* PRODUCT LINK SCRAPER */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none transition-colors duration-300">
            {isScraping ? (
              <div className="w-4 h-4 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            )}
          </div>
          <Input
            value={link}
            onChange={handleUrlChange}
            onFocus={() => setFocusField("url")}
            onBlur={() => setFocusField(null)}
            placeholder={t("product_link_placeholder")}
            className="!pl-12 !rounded-[20px] !bg-bg-primary/20 !border-border-primary/40 !h-12 !text-[13px] focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-500/20 transition-all placeholder:text-text-muted/50"
          />
          {isScraping && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-[10px] font-black text-pink-500 animate-pulse uppercase tracking-[2px]">
                {t("scraping")}
              </span>
            </div>
          )}
        </div>
        
        {scraperWarning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-600 flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {scraperWarning}
          </motion.div>
        )}

        <div className="relative">
          <Input
            value={tenMon}
            onChange={e => { setTenMon(e.target.value); if (nameError) setNameError(false); }}
            onKeyDown={e => e.key === "Enter" && handleThemClick()}
            onFocus={() => setFocusField("ten")}
            onBlur={() => setFocusField(null)}
            maxLength={40}
            placeholder={t("wish_placeholder")}
            className={`!rounded-[20px] !bg-bg-primary/40 !border-border-primary/60 !h-16 !text-lg !font-bold focus:!bg-bg-secondary focus:!ring-4 focus:!ring-pink-500/10 transition-all
              ${nameError ? "!border-red-400 !ring-4 !ring-red-500/20 animate-shake" : ""}`}
          />
          {focusField === "ten" && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-pink-400 bg-card-bg px-2 py-1 rounded-lg shadow-sm border border-border-primary animate-fade-in">
              {40 - tenMon.length}
            </span>
          )}
          {nameError && (
            <p className="absolute -bottom-5 left-2 text-[10px] font-black text-red-400 animate-fade-in">
              {t("wish_name_required")}
            </p>
          )}
        </div>

        <div className="relative">
          <Input
            as="textarea"
            value={ghiChu}
            onChange={e => setGhiChu(e.target.value)}
            onFocus={() => setFocusField("note")}
            onBlur={() => setFocusField(null)}
            maxLength={100}
            placeholder={t("note_placeholder")}
            rows={3}
            className="!rounded-[20px] !bg-bg-primary/40 !border-border-primary/60 !font-medium !p-5 focus:!bg-bg-secondary focus:!ring-4 focus:!ring-pink-500/10 transition-all"
          />
          {focusField === "note" && (
            <span className="absolute right-4 bottom-4 text-[10px] font-black text-pink-400 bg-card-bg px-2 py-1 rounded-lg shadow-sm border border-border-primary animate-fade-in">
              {100 - ghiChu.length}
            </span>
          )}
        </div>

        {/* MOOD PICKER */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-black uppercase tracking-[2px] text-text-muted px-1 flex items-center gap-2">
            <span>✨</span>
            {t("mood_label")}
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m, idx) => {
              const isSelected = selectedMood === m.key;
              return (
                <motion.button
                  key={m.key}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodClick(m.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 border select-none group"
                  style={isSelected ? {
                    backgroundColor: m.color,
                    color: '#fff',
                    borderColor: m.color,
                    boxShadow: `0 8px 20px ${m.color}40`,
                  } : {
                    backgroundColor: `${m.color}10`,
                    color: m.color,
                    borderColor: `${m.color}20`,
                  }}
                >
                  <span className="text-lg leading-none group-hover:rotate-12 transition-transform">{m.emoji}</span>
                  {t(m.labelKey)}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* FOLDER SELECTOR */}
        {folders.length > 0 && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[2px] text-text-muted px-1 flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              {t("add_to_folder")}
            </label>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onSelectFolder(null)}
                className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border ${selectedFolderId === null ? "bg-text-primary text-bg-primary border-text-primary shadow-lg scale-105" : "bg-bg-primary/20 text-text-muted border-border-primary/40 hover:border-pink-300/50 hover:text-text-primary"}`}
              >
                {t("none")}
              </button>
              {folders.map(folder => (
                <button
                  type="button"
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className={`px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border ${selectedFolderId === folder.id ? "bg-text-primary text-bg-primary border-text-primary shadow-lg scale-105" : "bg-bg-primary/20 text-text-muted border-border-primary/40 hover:border-pink-300/50 hover:text-text-primary"}`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4"
        >
          <Button
            onClick={handleThemClick}
            disabled={dangTai || (isImageTooLarge && !previewAnh)}
            className="!rounded-[24px] !py-5 bg-text-primary text-bg-primary font-black text-[13px] uppercase tracking-[3px] shadow-2xl shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/40 transition-all w-full group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {dangTai ? (
                <>
                  <div className="w-5 h-5 border-3 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin"></div>
                  {t("sending_to_cloud")}
                </>
              ) : (
                <>
                  <span>{t("send_wish")}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </span>
          </Button>
        </motion.div>
      </div>

       {/* ERROR MODAL (CHỈ DÀNH CHO XỬ LÝ ẢNH QUÁ LỚN) */}
      {(isImageTooLarge || formError === t("optimizing_image")) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in" onClick={handleCloseError}>
          <div
            className="bg-card-bg rounded-[40px] w-full max-w-[380px] p-10 shadow-2xl animate-slide-up relative flex flex-col items-center text-center gap-6 border border-border-primary"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-3xl bg-bg-primary flex items-center justify-center text-pink-500 rotate-12 transition-transform hover:rotate-0 duration-500">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-primary tracking-tight">{t("oops_error")}</h3>
              <p className="text-sm text-text-muted font-bold leading-relaxed">{formError}</p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {isImageTooLarge ? (
                <>
                  <button onClick={nenAnh} className="w-full py-4 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/10">
                    {t("compress_for_me")}
                  </button>
                  <button onClick={() => { xoaAnh(); handleCloseError(); setTimeout(() => document.getElementById("file-input").click(), 0); }} className="w-full py-4 text-text-muted font-black text-xs uppercase tracking-widest hover:text-text-primary transition-all">
                    {t("pick_another")}
                  </button>
                </>
              ) : (
                <button onClick={handleCloseError} className="w-full py-4 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/10">
                  {t("got_it")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
