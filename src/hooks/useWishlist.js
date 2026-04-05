import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, orderBy, query
} from "firebase/firestore";

/**
 * Custom hook quản lý toàn bộ logic dữ liệu wishlist:
 * - Lấy danh sách từ Firestore (chỉ khi đã đăng nhập)
 * - Thêm / Xóa item
 * - Quản lý state form (tên, ghi chú, ảnh)
 * - Xử lý drag-drop & paste ảnh
 *
 * @param {Object|null} user - Firebase Auth user object (null = chưa đăng nhập)
 */
export function useWishlist(user) {
  const [items, setItems] = useState([]);
  const [tenMon, setTenMon] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [anhBase64, setAnhBase64] = useState(null);
  const [previewAnh, setPreviewAnh] = useState(null);
  const [dangTai, setDangTai] = useState(false);
  const [keoVao, setKeoVao] = useState(false);

  // Lấy danh sách & đăng ký paste listener khi user đăng nhập
  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  /** Đọc file ảnh và lưu dưới dạng base64 */
  function chonAnh(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAnhBase64(e.target.result);
      setPreviewAnh(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  /** Xóa ảnh đang chọn */
  function xoaAnh() {
    setAnhBase64(null);
    setPreviewAnh(null);
  }

  /** Thêm item mới vào Firestore, lưu email người thêm */
  async function themMon() {
    if (tenMon.trim() === "") return;
    setDangTai(true);

    const docRef = await addDoc(collection(db, "wishlist"), {
      ten: tenMon,
      ghiChu: ghiChu,
      anhUrl: anhBase64 || null,
      taoLuc: new Date(),
      themBoi: user?.email || null,
    });

    setItems(prev => [
      ...prev,
      {
        id: docRef.id,
        ten: tenMon,
        ghiChu,
        anhUrl: anhBase64,
        taoLuc: new Date(),
        themBoi: user?.email || null,
      },
    ]);

    setTenMon("");
    setGhiChu("");
    xoaAnh();
    setDangTai(false);
  }

  /** Xóa item khỏi Firestore */
  async function xoaMon(id) {
    await deleteDoc(doc(db, "wishlist", id));
    setItems(prev => prev.filter(item => item.id !== id));
  }

  return {
    // Dữ liệu
    items,
    // Form state
    tenMon, setTenMon,
    ghiChu, setGhiChu,
    previewAnh,
    dangTai,
    keoVao, setKeoVao,
    // Actions
    chonAnh,
    xoaAnh,
    themMon,
    xoaMon,
  };
}
