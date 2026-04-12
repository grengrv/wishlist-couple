import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, onSnapshot,
  deleteDoc, doc, orderBy, query
} from "firebase/firestore";
import { ADMIN_EMAIL } from "../constants";

/**
 * Custom hook quản lý toàn bộ logic dữ liệu wishlist:
 * - Lấy danh sách từ Firestore (chỉ khi đã đăng nhập)
 * - Thêm / Xóa item
 * - Quản lý state form (tên, ghi chú, ảnh)
 * - Xử lý drag-drop & paste ảnh
 *
 * @param {Object|null} user - Firebase Auth user object (null = chưa đăng nhập)
 * @param {Object|null} userProfile - Profile user
 * @param {string|null} groupId - ID nhóm để lấy/lưu wish. Bỏ qua nếu là Public
 */
export function useWishlist(user, userProfile, groupId = null) {
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

    const q = query(collection(db, "wishlist"), orderBy("taoLuc", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Phân tách Wish theo Nhóm hoặc Cá nhân
      if (groupId) {
        data = data.filter(i => i.groupId === groupId);
      } else {
        // Không gian cá nhân -> Chỉ lấy wish của chính user này tạo ra và không thuộc nhóm nào
        data = data.filter(i => !i.groupId && i.uid === user.uid);
      }

      setItems(data);
    });

    const handlePaste = (e) => {
      const file = [...e.clipboardData.items]
        .find(i => i.type.startsWith("image/"))
        ?.getAsFile();
      if (file) chonAnh(file);
    };
    window.addEventListener("paste", handlePaste);
    
    return () => {
      unsubscribeSnapshot();
      window.removeEventListener("paste", handlePaste);
    };
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
      uid: user.uid,
      themBoi: userProfile?.username || user.email || "Khách ẩn danh",
      avatarNguoiThem: userProfile?.avatar || null,
      groupId: groupId || null
    });
    
    setTenMon("");
    setGhiChu("");
    xoaAnh();
    setDangTai(false);
  }

  /** Xóa item khỏi Firestore (chỉ chủ hoặc admin) */
  async function xoaMon(id) {
    const item = items.find(i => i.id === id);

    // Chặn nếu không phải chủ và không phải admin
    if (item?.uid && item.uid !== user.uid && user.email !== ADMIN_EMAIL) {
      alert("Bạn không thể xóa wishlist của người khác!");
      return;
    }

    await deleteDoc(doc(db, "wishlist", id));
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
