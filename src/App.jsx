import { useState, useEffect } from "react";
import './App.css'
import { db } from "./firebase";
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, orderBy, query
} from "firebase/firestore";

function formatNgay(taoLuc) {
  if (!taoLuc) return "";
  const d = taoLuc.toDate ? taoLuc.toDate() : new Date(taoLuc);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function App() {
  const [items, setItems] = useState([]);
  const [tenMon, setTenMon] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [anhBase64, setAnhBase64] = useState(null);
  const [previewAnh, setPreviewAnh] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [keoVao, setKeoVao] = useState(false);

  useEffect(() => {
    async function layDanhSach() {
      const q = query(collection(db, "wishlist"), orderBy("taoLuc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
    }
    layDanhSach();

    const handlePaste = (e) => {
      const file = [...e.clipboardData.items]
        .find(i => i.type.startsWith("image/"))
        ?.getAsFile();
      if (file) chonAnh(file);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  function chonAnh(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAnhBase64(e.target.result);
      setPreviewAnh(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function xoaAnh() {
    setAnhBase64(null);
    setPreviewAnh(null);
  }

  async function themMon() {
    if (tenMon.trim() === "") return;
    setDangTai(true);

    const docRef = await addDoc(collection(db, "wishlist"), {
      ten: tenMon,
      ghiChu: ghiChu,
      anhUrl: anhBase64 || null,
      taoLuc: new Date()
    });

    setItems(prev => [...prev, {
      id: docRef.id,
      ten: tenMon,
      ghiChu,
      anhUrl: anhBase64,
      taoLuc: new Date()
    }]);

    setTenMon("");
    setGhiChu("");
    xoaAnh();
    setDangTai(false);
  }

  async function xoaMon(id) {
    await deleteDoc(doc(db, "wishlist", id));
    setItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="app">

      <div className="header">
        <h1>Wishlist của chúng mình <span className="heart">♥</span></h1>
        <p>Những điều mơ ước cùng nhauu</p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-num">{items.length}</div>
          <div className="stat-label">Tổng điều ước</div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {items.filter(i => i.anhUrl).length}
          </div>
          <div className="stat-label">Có hình ảnh</div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {items.filter(i => i.ghiChu).length}
          </div>
          <div className="stat-label">Có ghi chú</div>
        </div>
      </div>

      <div className="form-box">
        <p className="form-title">Thêm điều ước mới</p>

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
              <button className="remove-img" onClick={e => { e.stopPropagation(); xoaAnh(); }}>×</button>
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

      {items.length > 0 && <p className="list-title">Danh sách ({items.length})</p>}

      <div className="list">
        {items.length === 0 && (
          <p className="empty">Chưa có điều ước nào.<br />Hãy thêm điều đầu tiên nhé ♥</p>
        )}
        {items.map(item => (
          <div className="card" key={item.id}>
            {item.anhUrl && (
              <img src={item.anhUrl} alt={item.ten} className="card-img" />
            )}
            <div className="card-body">
              <h3 className="card-ten">{item.ten}</h3>
              {item.ghiChu && <p className="card-ghichu">{item.ghiChu}</p>}
              <p className="card-date">{formatNgay(item.taoLuc)}</p>
            </div>
            <button className="btn-xoa" onClick={() => xoaMon(item.id)}>×</button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;