import { useState, useEffect } from "react";
import Input from "@components/ui/Input";
import ImageEditorModal from "@components/wishlist/ImageEditorModal";
import { useLanguage } from "@context/LanguageContext";
import { useConfirm } from "@context/ConfirmContext";
import { notifyError } from "@utils/notify";

const PRESET_COLORS = [
  { name: "Hồng", value: "#ec4899" },
  { name: "Đỏ", value: "#f43f5e" },
  { name: "Cam", value: "#f97316" },
  { name: "Vàng", value: "#f59e0b" },
  { name: "Xanh lá", value: "#10b981" },
  { name: "Xanh dương", value: "#3b82f6" },
  { name: "Tím", value: "#8b5cf6" },
  { name: "Xám", value: "#64748b" },
];

export default function GroupModal({ isOpen, onClose, onSave, initialData, isEditMode }) {
  const { t } = useLanguage();
  const confirm = useConfirm();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [themeColor, setThemeColor] = useState(PRESET_COLORS[0].value);
  const [bannerUrl, setBannerUrl] = useState(null);

  // Image Editor State
  const [editorConfig, setEditorConfig] = useState({
    isOpen: false,
    imageSrc: null,
    isBanner: true,
    isGif: false,
    file: null,
  });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData?.name || "");
      setDesc(initialData?.description || "");
      setThemeColor(initialData?.themeColor || PRESET_COLORS[0].value);
      setBannerUrl(initialData?.bannerUrl || null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleClose = async () => {
    const hasUnsavedChanges = 
      name !== (initialData?.name || "") ||
      desc !== (initialData?.description || "") ||
      themeColor !== (initialData?.themeColor || PRESET_COLORS[0].value) ||
      bannerUrl !== (initialData?.bannerUrl || null);

    if (hasUnsavedChanges) {
      const isOk = await confirm({
        title: t("unsaved_changes"),
        message: t("unsaved_msg"),
        confirmText: t("discard_changes"),
        cancelText: t("stay_to_save"),
      });
      if (!isOk) return;
    }
    onClose();
  };

  const processImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notifyError(t("only_image_allowed") || "Chỉ hỗ trợ file hình ảnh.");
      return;
    }
    const isGif = file.type === "image/gif";
    if (isGif && file.size > 600 * 1024) {
      notifyError(t("gif_too_large") || "GIF quá lớn.");
      return;
    } else if (!isGif && file.size > 8 * 1024 * 1024) {
      notifyError(t("image_too_large") || "Hình ảnh quá lớn.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setEditorConfig({ isOpen: true, imageSrc: objectUrl, isBanner: true, isGif, file });
  };

  const handleSaveImage = (processedImage) => {
    setBannerUrl(processedImage);
    if (editorConfig.imageSrc && editorConfig.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(editorConfig.imageSrc);
    }
    setEditorConfig({ isOpen: false, imageSrc: null, isBanner: true, isGif: false, file: null });
  };

  const handleRemoveBanner = async () => {
    const ok = await confirm({ 
      title: t("remove_banner"), 
      content: "Bạn có chắc muốn xóa ảnh bìa này không?", 
      confirmText: t("delete"), 
      cancelText: t("cancel") 
    });
    if (ok) setBannerUrl(null);
  };

  const handleSaveGroup = () => {
    if (!name.trim()) return;
    onSave({ name, description: desc, themeColor, bannerUrl });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in" onClick={handleClose}>
        <div 
          className="bg-card-bg rounded-[40px] w-full max-w-[500px] shadow-2xl animate-slide-up flex flex-col border border-border-primary overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          {/* BANNER PREVIEW / UPLOAD AREA */}
          <div className="relative w-full h-[160px] group transition-all duration-500 overflow-hidden bg-bg-secondary" style={{ backgroundColor: `${themeColor}20` }}>
            {bannerUrl ? (
              <>
                <img src={bannerUrl} alt="Group Banner" className="w-full h-full object-cover relative z-0" />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-3">
                  <button
                    onClick={() => document.getElementById("group-banner-upload").click()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-lg border border-white/20 bg-black/40 hover:bg-black/60 transition-colors"
                    title={t("change_banner")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  </button>
                  <button
                    onClick={handleRemoveBanner}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-lg border border-white/20 bg-red-500/80 hover:bg-red-500 transition-colors"
                    title={t("remove_banner")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </button>
                </div>
              </>
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-bg-primary/50 transition-colors z-20 relative"
                onClick={() => document.getElementById("group-banner-upload").click()}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: themeColor, color: '#fff' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <span className="text-sm font-bold opacity-70" style={{ color: themeColor }}>{t("group_banner")}</span>
              </div>
            )}
            <input id="group-banner-upload" type="file" accept="image/*" className="hidden" onChange={e => processImage(e.target.files[0])} />
          </div>

          <div className="p-8 flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-black text-text-primary tracking-tight mb-2">
                {isEditMode ? t("edit_group_title") : t("create_new_group_title")}
              </h3>
              <p className="text-text-muted font-medium">
                {isEditMode ? t("edit_group_subtitle") : t("group_desc_placeholder")}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">
                  {t("group_name")}
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={40}
                  className="!bg-bg-primary !border-none !rounded-2xl focus:!bg-card-bg focus:!ring-2 transition-all"
                  style={{ '--tw-ring-color': themeColor }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">
                  {t("group_desc_input")?.replace(/\.\.\.$/, "") || "Mô tả"}
                </label>
                <Input
                  as="textarea"
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  maxLength={100}
                  className="!bg-bg-primary !border-none !rounded-2xl focus:!bg-card-bg focus:!ring-2 transition-all"
                  style={{ '--tw-ring-color': themeColor }}
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">
                  {t("group_theme_color")}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setThemeColor(color.value)}
                      className="w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none"
                      style={{
                        backgroundColor: color.value,
                        boxShadow: themeColor === color.value
                          ? `0 0 0 2px white, 0 0 0 4px ${color.value}`
                          : 'none',
                        transform: themeColor === color.value ? 'scale(1.15)' : undefined
                      }}
                      title={color.name}
                    >
                      {themeColor === color.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                  ))}

                  {/* Custom color picker */}
                  <label
                    title={t("choose_custom_color") || "Chọn màu khác"}
                    className="w-9 h-9 rounded-full border-2 border-dashed border-border-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 overflow-hidden relative"
                    style={{
                      boxShadow: !PRESET_COLORS.find(c => c.value === themeColor)
                        ? `0 0 0 2px white, 0 0 0 4px ${themeColor}`
                        : 'none',
                      backgroundColor: !PRESET_COLORS.find(c => c.value === themeColor) ? themeColor : 'transparent'
                    }}
                  >
                    {!PRESET_COLORS.find(c => c.value === themeColor) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <span className="text-text-muted text-base leading-none select-none font-bold">+</span>
                    )}
                    <input
                      type="color"
                      value={themeColor}
                      onChange={e => setThemeColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>

                {/* Preview chip */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit text-[11px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: `${themeColor}18`, color: themeColor, border: `1.5px solid ${themeColor}30` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
                  {themeColor.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-secondary transition-all"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={!name.trim()}
                style={{ backgroundColor: name.trim() ? themeColor : undefined }}
                className={`flex-[1.5] py-4 text-sm font-black text-white rounded-[22px] shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:bg-gray-400`}
              >
                {isEditMode ? t("save_changes") : t("create_group_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {editorConfig.isOpen && (
        <ImageEditorModal
          isOpen={editorConfig.isOpen}
          imageSrc={editorConfig.imageSrc}
          file={editorConfig.file}
          isBanner={editorConfig.isBanner}
          isGif={editorConfig.isGif}
          onClose={() => setEditorConfig({ ...editorConfig, isOpen: false })}
          onSave={handleSaveImage}
        />
      )}
    </>
  );
}
