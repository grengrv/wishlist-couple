/**
 * AddForm component - Form thêm điều ước mới
 * Bao gồm: drop zone ảnh, input tên, textarea ghi chú, nút thêm
 */
import Button from "./ui/Button";
import Input from "./ui/Input";
export default function AddForm({
  tenMon, setTenMon,
  ghiChu, setGhiChu,
  previewAnh,
  dangTai,
  keoVao, setKeoVao,
  chonAnh,
  xoaAnh,
  themMon,
}) {
  return (
    <div className="bg-white rounded-[20px] p-7 mb-8 border border-pink-border flex flex-col gap-4">
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
          onChange={e => chonAnh(e.target.files[0])}
        />
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-2.5">
        <Input
          value={tenMon}
          onChange={e => setTenMon(e.target.value)}
          onKeyDown={e => e.key === "Enter" && themMon()}
          placeholder="Tên món đồ hoặc mục tiêu..."
        />
        <Input
          as="textarea"
          value={ghiChu}
          onChange={e => setGhiChu(e.target.value)}
          placeholder="Ghi chú, mô tả, link sản phẩm..."
          rows={3}
        />
        <Button onClick={themMon} disabled={dangTai}>
          {dangTai ? "Đang lưu..." : "✦ Thêm vào danh sách"}
        </Button>
      </div>
    </div>
  );
}
