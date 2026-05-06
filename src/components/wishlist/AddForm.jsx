import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { useConfirm } from "@context/ConfirmContext";
import { notifyThemWish, notifyError } from "@utils/notify";
import { useLanguage } from "@context/LanguageContext";

const MOOD_OPTIONS = [
  { key: "craving",   emoji: "😍", labelKey: "mood_craving",   color: "#ec4899", bg: "#fce7f3", darkBg: "#4a1535" },
  { key: "dreaming",  emoji: "💭", labelKey: "mood_dreaming",  color: "#8b5cf6", bg: "#ede9fe", darkBg: "#2d1b6e" },
  { key: "urgent",    emoji: "🔥", labelKey: "mood_urgent",    color: "#f97316", bg: "#ffedd5", darkBg: "#431407" },
  { key: "done",      emoji: "🎉", labelKey: "mood_done",      color: "#10b981", bg: "#d1fae5", darkBg: "#064e3b" },
  { key: "expensive", emoji: "💸", labelKey: "mood_expensive", color: "#f59e0b", bg: "#fef3c7", darkBg: "#451a03" },
  { key: "together",  emoji: "🤝", labelKey: "mood_together",  color: "#3b82f6", bg: "#dbeafe", darkBg: "#1e3a8a" },
];

/* ── Step label ─────────────────────────────── */
function StepLabel({ number, label, rightElement }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-300/40">
          <span className="text-[9px] font-black text-white">{number}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[2.5px] text-text-secondary">{label}</span>
      </div>
      {rightElement}
    </div>
  );
}

/* ── Image Dropzone ──────────────────────────── */
function ImageDropzone({ previewAnh, keoVao, setKeoVao, chonAnh, xoaAnh, t }) {
  return (
    <div
      className={`
        relative group rounded-[22px] overflow-hidden transition-all duration-500 cursor-pointer
        ${previewAnh
          ? "aspect-[16/9] border-0 shadow-xl shadow-pink-200/30"
          : `aspect-[16/7] border-2 border-dashed flex items-center justify-center
             ${keoVao
               ? "border-pink-400 bg-pink-50/80 scale-[0.985]"
               : "border-border-primary bg-bg-primary/30 hover:border-pink-300/60 hover:bg-pink-50/20"
             }`
        }
      `}
      onDragOver={e => { e.preventDefault(); setKeoVao(true); }}
      onDragLeave={() => setKeoVao(false)}
      onDrop={e => { e.preventDefault(); setKeoVao(false); chonAnh(e.dataTransfer.files[0]); }}
      onClick={() => !previewAnh && document.getElementById("file-input").click()}
    >
      {previewAnh ? (
        <>
          <img src={previewAnh} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {/* Overlay with remove */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-5">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 bg-white/95 text-rose-500 px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-[2px] shadow-xl backdrop-blur-sm hover:bg-rose-500 hover:text-white transition-all"
              onClick={e => { e.stopPropagation(); xoaAnh(); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
              {t("change_image")}
            </motion.button>
          </div>
          {/* Top-right badge */}
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            ✓ {t("image_ready")}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 transition-all duration-500 group-hover:scale-105">
          {/* Animated upload icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border
            ${keoVao
              ? "bg-pink-100 border-pink-300 text-pink-500 rotate-6 scale-110"
              : "bg-bg-secondary border-border-primary text-text-secondary group-hover:text-pink-400 group-hover:border-pink-200 group-hover:bg-pink-50"
            }`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-text-primary mb-0.5">{t("drop_image")}</p>
            <p className="text-[10px] text-text-secondary">{t("or_click_to_browse")}</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-1 relative z-20" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => document.getElementById("file-input").click()}
              className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border-primary text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-pink-500 hover:border-pink-200 transition-colors shadow-sm"
            >
              {t("choose_file")}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("camera-input").click()}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-[10px] font-bold uppercase tracking-wider text-pink-600 active:bg-pink-100 transition-colors shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {t("take_photo")}
            </button>
          </div>
        </div>
      )}
      <input id="file-input" type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) { chonAnh(e.target.files[0]); e.target.value = ""; } }} />
      <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { if (e.target.files?.[0]) { chonAnh(e.target.files[0]); e.target.value = ""; } }} />
    </div>
  );
}

/* ── Mood Grid ───────────────────────────────── */
function MoodGrid({ selectedMood, onMoodClick, t }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MOOD_OPTIONS.map((m, idx) => {
        const isSelected = selectedMood === m.key;
        return (
          <motion.button
            key={m.key}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, type: "spring", stiffness: 300 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoodClick(m.key)}
            className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-center transition-all duration-300 border overflow-hidden"
            style={isSelected ? {
              backgroundColor: m.color,
              borderColor: m.color,
              boxShadow: `0 6px 18px ${m.color}45`,
            } : {
              backgroundColor: `${m.color}0d`,
              borderColor: `${m.color}22`,
            }}
          >
            {/* Glow bg when selected */}
            {isSelected && (
              <div className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(circle at 50% 0%, white 0%, transparent 70%)` }} />
            )}
            <span className="text-2xl leading-none relative z-10">{m.emoji}</span>
            <span
              className="text-[10px] font-black uppercase tracking-wide relative z-10 leading-tight"
              style={{ color: isSelected ? "#fff" : m.color }}
            >
              {t(m.labelKey)}
            </span>
            {/* Tooltip on hover */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-md z-20">
              {t(`mood_${m.key}_desc`) || `Cảm giác ${t(m.labelKey)?.toLowerCase()}`}
            </div>
            
            {isSelected && (
              <motion.div
                layoutId="mood-check"
                className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-white/30 rounded-full flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Folder Selector ─────────────────────────── */
function FolderSelector({ folders, selectedFolderId, onSelectFolder, onCreateFolder, t }) {
  if (!folders.length && !onCreateFolder) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
          selectedFolderId === null
            ? "bg-text-primary text-bg-primary border-text-primary shadow-md"
            : "bg-bg-primary/20 text-text-secondary border-border-primary/40 hover:border-pink-200 hover:text-text-primary"
        }`}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        {t("none")}
      </button>
      {folders.map(folder => (
        <button
          type="button"
          key={folder.id}
          onClick={() => onSelectFolder(folder.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
            selectedFolderId === folder.id
              ? "bg-text-primary text-bg-primary border-text-primary shadow-md"
              : "bg-bg-primary/20 text-text-secondary border-border-primary/40 hover:border-pink-200 hover:text-text-primary"
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          {folder.name}
          {folder.items?.length > 0 && (
            <span className="ml-1 bg-black/10 px-1.5 rounded-md text-[9px]">{folder.items.length}</span>
          )}
        </button>
      ))}
      {onCreateFolder && (
        <button
          type="button"
          onClick={onCreateFolder}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border bg-bg-primary/10 border-dashed border-border-primary hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 text-text-muted"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t("create_folder")}
        </button>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────── */
export default function AddForm({
  tenMon, setTenMon,
  link, setLink,
  ghiChu, setGhiChu,
  mood, setMood,
  previewAnh, setPreviewAnh,
  // eslint-disable-next-line no-unused-vars
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
  onSelectFolder = () => {},
  onCreateFolder
}) {
  const [focusField, setFocusField] = useState(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scraperWarning, setScraperWarning] = useState("");
  const [nameError, setNameError] = useState(false);
  const [selectedMood, setSelectedMood] = useState(mood ?? null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const confirm = useConfirm();
  const { t } = useLanguage();

  // Keyboard shortcut Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleThemClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tenMon, selectedMood, dangTai]);

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
    let cleanUrl = url;
    try {
      const u = new URL(url);
      ["itm_campaign","itm_medium","itm_source","spid","utm_source","utm_medium","utm_campaign","utm_term","utm_content"]
        .forEach(p => u.searchParams.delete(p));
      cleanUrl = u.toString();
    } catch (e) { console.error(e); }

    if (cleanUrl.includes("shopee.vn") || cleanUrl.includes("lazada.vn")) {
      setScraperWarning(t("scraper_shopee_warning"));
    }

    const tryScrape = async (targetUrl, usePrerender = true) => {
      const endpoint = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}${usePrerender ? "&prerender=true&waitFor=3000" : ""}&data.price.selector=[itemprop="price"]`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    };

    try {
      let result;
      try { result = await tryScrape(cleanUrl, true); }
      catch (err) { console.warn("[Scraper] Prerender failed", err); result = await tryScrape(cleanUrl, false); }

      if (result.status === "success") {
        let { title, description, image } = result.data;
        try { if (title?.includes("%")) title = decodeURIComponent(title); } catch (e) { console.error(e); }
        if (!title || title.length < 5) {
          try {
            const urlObj = new URL(cleanUrl);
            const pathParts = urlObj.pathname.split("-");
            if (pathParts.length > 2) {
              const guessed = pathParts.slice(0, pathParts.length - 1).join(" ").replace(/\//g, "").trim();
              if (guessed.length > 5) title = guessed;
            }
          } catch (e) { console.error(e); }
        }
        const safeTitle = title ? title.substring(0, 40).replace(/-/g, " ").trim() : "";
        const safeDesc = description ? description.substring(0, 100).trim() : "";
        if (safeTitle) setTenMon(safeTitle);
        if (safeDesc) setGhiChu(safeDesc);
        if (image?.url) {
          setMood("craving"); setSelectedMood("craving");
          if (setPreviewAnh) setPreviewAnh(image.url);
          if (setAnhBase64) setAnhBase64(image.url);
        } else if (!scraperWarning) {
          setScraperWarning(t("scraper_warning"));
        }
      } else { setScraperWarning(t("scraper_warning")); }
    } catch (error) { console.error("Scraping error:", error); }
    finally { setIsScraping(false); }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    if (setLink) setLink(val);
    if (val.startsWith("http")) fetchMetadata(val);
  };

  const handleThemClick = async () => {
    if (!tenMon.trim()) {
      setNameError(true);
      setTimeout(() => setNameError(false), 600);
      setFocusField("ten");
      return;
    }
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
    try {
      const success = await themMon(selectedMood);
      if (success) { 
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          notifyThemWish(isGroup); 
          setSelectedMood(null);
        }, 1200);
      }
    } catch { notifyError(t("update_failed")); }
  };

  const handleAiSuggest = async () => {
    if (!tenMon.trim()) {
      setNameError(true);
      setTimeout(() => setNameError(false), 600);
      setFocusField("ten");
      return;
    }
    
    setIsAiLoading(true);
    setGhiChu("");
    
    try {
      const prompt = `${t("ai_prompt")} ${tenMon}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "dummy",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 60,
          messages: [{ role: "user", content: prompt }]
        })
      });

      let text = "";
      if (!res.ok) {
        text = t("ai_fallback_note");
      } else {
        const data = await res.json();
        text = data.content[0].text.replace(/^["']|["']$/g, '').trim();
      }

      let i = 0;
      setGhiChu("");
      const interval = setInterval(() => {
        setGhiChu(prev => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
      
    } catch (error) {
      console.error(error);
      const fallback = t("ai_fallback_note");
      let i = 0;
      setGhiChu("");
      const interval = setInterval(() => {
        setGhiChu(prev => prev + fallback.charAt(i));
        i++;
        if (i >= fallback.length) clearInterval(interval);
      }, 30);
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeMood = MOOD_OPTIONS.find(m => m.key === selectedMood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="relative max-w-2xl mx-auto w-full mb-12"
    >
      {/* Card shell */}
      <div className="bg-bg-secondary/50 backdrop-blur-2xl rounded-[36px] border border-white/20 dark:border-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.08)] overflow-hidden">

        {/* Top accent bar — changes color with mood */}
        <div
          className="h-1 w-full transition-all duration-500"
          style={{ background: activeMood ? `linear-gradient(90deg, ${activeMood.color}, ${activeMood.color}80)` : "linear-gradient(90deg, #ec4899, #fb7185)" }}
        />

        <div className="p-7 flex flex-col gap-7">

          {/* ── STEP 1: Image ── */}
          <div>
            <StepLabel number="1" label={t("step_image")} />
            <ImageDropzone
              previewAnh={previewAnh}
              keoVao={keoVao}
              setKeoVao={setKeoVao}
              chonAnh={chonAnh}
              xoaAnh={xoaAnh}
              t={t}
            />
          </div>

          {/* ── STEP 2: Link scraper ── */}
          <div>
            <StepLabel number="2" label={t("step_link")} />
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
                {isScraping ? (
                  <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-500 rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={focusField === "url" ? "#ec4899" : "currentColor"} strokeWidth="2.5" className="text-text-secondary transition-colors">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                )}
              </div>
              <Input
                value={link}
                onChange={handleUrlChange}
                onFocus={() => setFocusField("url")}
                onBlur={() => setFocusField(null)}
                placeholder={t("product_link_placeholder")}
                className="!pl-11 !rounded-[16px] !bg-bg-primary/30 !border-border-primary/50 !h-11 !text-[13px] focus:!bg-bg-primary focus:!ring-2 focus:!ring-pink-400/20 transition-all placeholder:text-text-secondary/40"
              />

            </div>

            {/* Scraping Status & URL Chip */}
            <AnimatePresence mode="wait">
              {isScraping ? (
                <motion.div
                  key="scraping"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 ml-2 flex items-center gap-2"
                >
                  <div className="flex gap-0.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1 h-3 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-[1.5px]">{t("scraping")}</span>
                </motion.div>
              ) : link && !scraperWarning ? (
                <motion.div
                  key="chip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 ml-2 flex items-center gap-1.5"
                >
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${new URL(link).hostname}`} 
                    alt="favicon" 
                    className="w-3.5 h-3.5 rounded-sm"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{new URL(link).hostname}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {scraperWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex items-start gap-2 px-4 py-2.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p className="text-[11px] font-bold text-amber-700 leading-snug">{scraperWarning}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── STEP 3: Name ── */}
          <div>
            <StepLabel number="3" label={t("step_name")} />
            <div className="relative">
              <Input
                value={tenMon}
                onChange={e => { setTenMon(e.target.value); if (nameError) setNameError(false); }}
                onKeyDown={e => e.key === "Enter" && handleThemClick()}
                onFocus={() => setFocusField("ten")}
                onBlur={() => setFocusField(null)}
                maxLength={40}
                placeholder={t("wish_placeholder")}
                className={`!rounded-[16px] !bg-bg-primary/30 !border-border-primary/50 !h-14 !text-lg !font-medium
                  focus:!bg-bg-primary focus:!ring-2 focus:!ring-pink-400/25 transition-all
                  ${nameError ? "!border-rose-400 !ring-2 !ring-rose-400/25 animate-shake" : ""}`}
              />
              {/* Char counter */}
              <AnimatePresence>
                {focusField === "ten" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border bg-card-bg border-border-primary"
                    style={{ color: tenMon.length > 32 ? "#f43f5e" : "#ec4899" }}
                  >
                    {40 - tenMon.length}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Error */}
              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-5 left-1 text-[10px] font-black text-rose-500 flex items-center gap-1"
                  >
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="6" cy="6" r="5"/><line x1="6" y1="4" x2="6" y2="6"/><line x1="6" y1="8" x2="6" y2="8.5"/></svg>
                    {t("wish_name_required")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── STEP 4: Note ── */}
          <div className={!tenMon ? "opacity-40 transition-opacity duration-300" : "transition-opacity duration-300"}>
            <StepLabel 
              number="4" 
              label={t("step_note")} 
              rightElement={
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading || !tenMon}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-[9px] font-black uppercase tracking-wider hover:bg-purple-100 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isAiLoading ? (
                    <div className="w-2.5 h-2.5 border-2 border-purple-400/30 border-t-purple-600 rounded-full animate-spin" />
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                  )}
                  {t("ai_suggest")}
                </button>
              }
            />
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
                className="!rounded-[16px] !bg-bg-primary/30 !border-border-primary/50 !font-medium !p-4 focus:!bg-bg-primary focus:!ring-2 focus:!ring-pink-400/20 transition-all resize-none"
              />
              <AnimatePresence>
                {focusField === "note" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 bottom-3 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border bg-card-bg border-border-primary"
                    style={{ color: ghiChu.length > 80 ? "#f43f5e" : "#ec4899" }}
                  >
                    {100 - ghiChu.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── STEP 5: Mood ── */}
          <div className={!tenMon ? "opacity-40 transition-opacity duration-300" : "transition-opacity duration-300"}>
            <StepLabel number="5" label={t("mood_label")} />
            <MoodGrid selectedMood={selectedMood} onMoodClick={handleMoodClick} t={t} />
          </div>

          {/* ── STEP 6: Folder (conditional) ── */}
          {(folders.length > 0 || onCreateFolder) && (
            <div className={!tenMon ? "opacity-40 transition-opacity duration-300" : "transition-opacity duration-300"}>
              <StepLabel number="6" label={t("add_to_folder")} />
              <FolderSelector
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                onCreateFolder={onCreateFolder}
                t={t}
              />
            </div>
          )}

          {/* ── Submit ── */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
          >
            <button
              onClick={handleThemClick}
              disabled={dangTai || (isImageTooLarge && !previewAnh)}
              className="relative w-full py-4 rounded-[18px] font-black text-[13px] uppercase tracking-[3px] overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: activeMood
                  ? `linear-gradient(135deg, ${activeMood.color}, ${activeMood.color}cc)`
                  : "linear-gradient(135deg, #ec4899, #fb7185)",
                boxShadow: `0 8px 24px ${activeMood?.color ?? "#ec4899"}35`,
                color: "#fff",
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

              <span className="relative z-10 flex items-center justify-center gap-3">
                {submitSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{t("success")}</span>
                  </motion.div>
                ) : dangTai ? (
                  <>
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    {t("sending_to_cloud")}
                  </>
                ) : (
                  <>
                    <span>{activeMood?.emoji}</span>
                    <span>{t("send_wish")}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </span>
              
              {/* Keyboard shortcut hint */}
              {!dangTai && !submitSuccess && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded text-white">⌘</span>
                  <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded text-white">↵</span>
                </div>
              )}
            </button>
          </motion.div>

        </div>
      </div>

      {/* ── Error Modal ── */}
      <AnimatePresence>
        {(isImageTooLarge || formError === t("optimizing_image")) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[10000] p-6"
            onClick={handleCloseError}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="bg-card-bg rounded-[36px] w-full max-w-[360px] p-9 shadow-2xl relative flex flex-col items-center text-center gap-5 border border-border-primary"
              onClick={e => e.stopPropagation()}
            >
              {/* Close X */}
              <button
                onClick={handleCloseError}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1l10 10M11 1L1 11"/></svg>
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-text-primary tracking-tight">{t("oops_error")}</h3>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">{formError}</p>
              </div>

              <div className="flex flex-col gap-2.5 w-full pt-1">
                {isImageTooLarge ? (
                  <>
                    <button
                      onClick={nenAnh}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-[11px] uppercase tracking-[2px] rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-300/30"
                    >
                      {t("compress_for_me")}
                    </button>
                    <button
                      onClick={() => { xoaAnh(); handleCloseError(); setTimeout(() => document.getElementById("file-input").click(), 0); }}
                      className="w-full py-3 text-text-secondary font-bold text-[11px] uppercase tracking-[2px] hover:text-text-primary transition-all"
                    >
                      {t("pick_another")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseError}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-[11px] uppercase tracking-[2px] rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-300/30"
                  >
                    {t("got_it")}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}