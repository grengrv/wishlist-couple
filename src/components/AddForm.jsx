/**
 * AddForm component - Form thêm điều ước mới
 * Bao gồm: drop zone ảnh, input tên, textarea ghi chú, nút thêm
 */
import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useConfirm } from "../context/ConfirmContext";

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
  existingItems
}) {
  const [focusField, setFocusField] = useState(null); // 'ten' | 'note' | null

  const handleCloseError = () => {
    setFormError("");
  };

  const handleThemClick = async () => {
    if (!tenMon.trim()) return;
    
    // Kiểm tra trùng tên (Không phân biệt hoa thường và khoảng cách thừa)
    const isDuplicate = existingItems?.some(item => 
      item.ten?.trim().toLowerCase() === tenMon.trim().toLowerCase()
    );

    if (isDuplicate) {
      const isOk = await confirm({
        title: "Trùng món rồi nhé! ✨",
        message: `Bạn đã có món "${tenMon.trim()}" trong danh sách rồi, vẫn muốn thêm tiếp hả?`,
        confirmText: "Vẫn thêm luôn",
        cancelText: "Để tớ xem lại",
      });
      if (!isOk) return;
    }
    
    themMon();
  };

  return (
    <div className="bg-white rounded-[20px] p-7 mb-8 border border-pink-border flex flex-col gap-4 max-w-3xl mx-auto w-full transition-all duration-500 shadow-sm hover:shadow-md">
      <p className="text-[13px] font-semibold text-pink-brand uppercase tracking-[0.8px]">
        Thêm điều ước mới
      </p>

      {/* DROP ZONE */}
      <div
        className={`
          border-2 rounded-[14px] text-center transition-all bg-pink-faint
          ${previewAnh 
            ? "p-3 border-solid border-pink-light cursor-default" 
            : "p-8 border-dashed border-pink-light cursor-pointer text-[#d47a9a] hover:border-pink-brand hover:bg-pink-pale hover:text-pink-brand"
          }
          ${keoVao && !previewAnh ? "!border-pink-brand !bg-pink-pale !text-pink-brand" : ""}
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
          <div className="relative">
            <img src={previewAnh} alt="preview" className="w-full max-h-[220px] object-cover rounded-[10px] block" />
            <button
              className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full border-2 border-white bg-pink-brand text-white text-base cursor-pointer flex items-center justify-center leading-none shadow-[0_2px_6px_rgba(0,0,0,0.15)] z-10"
              onClick={e => { e.stopPropagation(); xoaAnh(); }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="">
            <div className="mb-2.5 opacity-70 flex justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-[13px] leading-[1.7]">Kéo thả hoặc dán ảnh vào đây</p>
            <span className="block text-[11px] mt-1 opacity-60">Ctrl+V · Kéo thả · Nhấn để chọn file</span>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            if (e.target.files?.[0]) {
              chonAnh(e.target.files[0]);
              e.target.value = ""; // Quan trọng: Reset value để có thể chọn lại cùng 1 file
            }
          }}
        />
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-3">
        {/* Tên món */}
        <div className="relative group/input">
          <Input
            value={tenMon}
            onChange={e => setTenMon(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleThemClick()}
            onFocus={() => setFocusField("ten")}
            onBlur={() => setFocusField(null)}
            maxLength={40}
            placeholder="Tên món đồ... (2-40 ký tự)"
            className={formError && tenMon.length < 2 ? "border-red-300 focus:border-red-400" : ""}
          />
          {focusField === "ten" && (
            <span className="absolute right-3.5 bottom-2.5 text-[10px] font-bold text-pink-muted/60 pointer-events-none animate-fade-in">
              {40 - tenMon.length}
            </span>
          )}
        </div>

        {/* Ghi chú */}
        <div className="relative group/input">
          <Input
            as="textarea"
            value={ghiChu}
            onChange={e => setGhiChu(e.target.value)}
            onFocus={() => setFocusField("note")}
            onBlur={() => setFocusField(null)}
            maxLength={100}
            placeholder="Ghi chú ngắn gọn... (Tối đa 100 ký tự)"
            rows={3}
          />
          {focusField === "note" && (
            <span className="absolute right-3.5 bottom-3 text-[10px] font-bold text-pink-muted/60 pointer-events-none animate-fade-in">
              {100 - ghiChu.length}
            </span>
          )}
        </div>

        {/* Popup Thông báo lỗi & Gợi ý nén ảnh */}
        {formError && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[10000] p-6 animate-fade-in" onClick={handleCloseError}>
            <div 
              className="bg-white rounded-[24px] w-full max-w-[400px] p-8 shadow-2xl animate-slide-up relative flex flex-col items-center text-center gap-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-pink-faint flex items-center justify-center text-pink-brand mb-1">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-text-base">Thông báo</h3>
                <p className="text-[14px] text-text-sub leading-relaxed">
                  {formError}
                </p>
              </div>

              {isImageTooLarge ? (
                <div className="flex flex-col gap-3 w-full mt-2">
                  <button 
                    onClick={() => { nenAnh(); }}
                    className="w-full py-3.5 bg-gradient-brand text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-pink-brand/20"
                  >
                    Đồng ý nén ảnh
                  </button>
                  <button 
                    onClick={() => { 
                      xoaAnh(); 
                      handleCloseError(); 
                      setTimeout(() => document.getElementById("file-input").click(), 0);
                    }}
                    className="w-full py-3 text-pink-brand font-bold rounded-2xl border border-pink-border hover:bg-pink-brand hover:text-white hover:border-transparent transition-all"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleCloseError}
                  className="w-full mt-2 py-3.5 bg-pink-faint text-pink-brand font-bold rounded-2xl hover:bg-pink-light/20 transition-all"
                >
                  Đã hiểu
                </button>
              )}
            </div>
          </div>
        )}

        <Button onClick={handleThemClick} disabled={dangTai || (isImageTooLarge && !previewAnh)}>
          {dangTai ? "Đang xử lý..." : "✦ Thêm vào danh sách"}
        </Button>
      </div>
    </div>
  );
}
