/**
 * AddForm component - Form thêm điều ước mới
 * Bao gồm: drop zone ảnh, input tên, textarea ghi chú, nút thêm
 */
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
    <div className="form-box">
      <p className="form-title">Thêm điều ước mới</p>

      {/* DROP ZONE */}
      <div
        className={`drop-zone ${keoVao ? "drag-over" : ""} ${previewAnh ? "has-image" : ""}`}
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
          <div className="preview-wrap">
            <img src={previewAnh} alt="preview" className="preview-img" />
            <button
              className="remove-img"
              onClick={e => { e.stopPropagation(); xoaAnh(); }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="drop-hint">
            <div className="drop-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p>Kéo thả hoặc dán ảnh vào đây</p>
            <span>Ctrl+V · Kéo thả · Nhấn để chọn file</span>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => chonAnh(e.target.files[0])}
        />
      </div>

      {/* INPUTS */}
      <div className="inputs">
        <input
          className="inp"
          value={tenMon}
          onChange={e => setTenMon(e.target.value)}
          onKeyDown={e => e.key === "Enter" && themMon()}
          placeholder="Tên món đồ hoặc mục tiêu..."
        />
        <textarea
          className="inp"
          value={ghiChu}
          onChange={e => setGhiChu(e.target.value)}
          placeholder="Ghi chú, mô tả, link sản phẩm..."
          rows={3}
        />
        <button className="btn-them" onClick={themMon} disabled={dangTai}>
          {dangTai ? "Đang lưu..." : "✦ Thêm vào danh sách"}
        </button>
      </div>
    </div>
  );
}
