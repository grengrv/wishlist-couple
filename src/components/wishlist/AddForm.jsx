import { useState } from "react";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { useConfirm } from "@context/ConfirmContext";
import { notifyThemWish, notifyError } from "@utils/notify";
import { useLanguage } from "@context/LanguageContext";

export default function AddForm({
  tenMon, setTenMon,
  ghiChu, setGhiChu,
  previewAnh,
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
  isGroup = false
}) {
  const [focusField, setFocusField] = useState(null);
  const confirm = useConfirm();
  const { t } = useLanguage();

  const handleCloseError = () => setFormError("");

  const handleThemClick = async () => {
    if (!tenMon.trim()) return;

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
      const success = await themMon();
      if (success) {
        notifyThemWish(isGroup);
      }
      // success === false hoặc undefined: lỗi đã được xử lý bên trong themMon (formError)
    } catch {
      notifyError(t("update_failed"));
    }
  };

  return (
    <div className="bg-bg-secondary/80 backdrop-blur-xl rounded-[32px] p-8 mb-12 border border-border-primary shadow-[0_20px_50px_rgba(236,72,153,0.05)] flex flex-col gap-6 max-w-2xl mx-auto w-full transition-all duration-500 hover:shadow-[0_30px_60px_rgba(236,72,153,0.08)]">

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
            <img src={previewAnh} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button
                className="bg-bg-secondary text-text-primary px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-pink-500 hover:text-white"
                onClick={e => { e.stopPropagation(); xoaAnh(); }}
              >
                {t("change_image")}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center group-hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-bg-secondary rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 text-text-muted group-hover:text-pink-500 group-hover:rotate-12 transition-all border border-border-primary/50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[2px]">{t("drop_image")}</p>
          </div>
        )}
        <input id="file-input" type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { chonAnh(e.target.files[0]); e.target.value = ""; } }} />
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            value={tenMon}
            onChange={e => setTenMon(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleThemClick()}
            onFocus={() => setFocusField("ten")}
            onBlur={() => setFocusField(null)}
            maxLength={40}
            placeholder={t("wish_placeholder")}
            className={`!rounded-2xl !bg-bg-primary/50 !border-border-primary !h-14 !font-bold focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-50 transition-all ${formError && tenMon.length < 2 ? "!border-red-300" : ""}`}
          />
          {focusField === "ten" && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-pink-400 bg-card-bg px-2 py-1 rounded-lg shadow-sm border border-border-primary animate-fade-in">
              {40 - tenMon.length}
            </span>
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
            className="!rounded-2xl !bg-bg-primary/50 !border-border-primary !font-medium focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-50 transition-all"
          />
          {focusField === "note" && (
            <span className="absolute right-4 bottom-4 text-[10px] font-black text-pink-400 bg-card-bg px-2 py-1 rounded-lg shadow-sm border border-border-primary animate-fade-in">
              {100 - ghiChu.length}
            </span>
          )}
        </div>

        <Button
          onClick={handleThemClick}
          disabled={dangTai || (isImageTooLarge && !previewAnh)}
          className="!rounded-2xl !py-4 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-500/5 hover:bg-pink-600 active:scale-95 transition-all mt-2"
        >
          {dangTai ? t("sending_to_cloud") : t("send_wish")}
        </Button>
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
    </div>
  );
}
