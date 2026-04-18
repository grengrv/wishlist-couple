import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, onSnapshot,
  deleteDoc, doc, orderBy, query
} from "firebase/firestore";
import { ADMIN_EMAIL } from "../constants";
import { notifyError } from "../utils/notify";

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
  const [formError, setFormError] = useState("");
  const [isImageTooLarge, setIsImageTooLarge] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

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
    if (!file) return;
    setFormError("");
    setIsImageTooLarge(false);
    setPendingFile(null);

    // 1. Kiểm tra định dạng
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      notifyError("Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP hoặc GIF.");
      return;
    }

    // 2. Kiểm tra kích thước (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setIsImageTooLarge(true);
      setPendingFile(file);
      setFormError("Ảnh quá lớn (trên 5MB) không thể lưu trữ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAnhBase64(e.target.result);
      setPreviewAnh(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  /** Xử lý nén ảnh bằng Canvas */
  async function nenAnh() {
    if (!pendingFile) return;
    setDangTai(true);
    setFormError("Đang nén ảnh...");

    try {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(pendingFile);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1280; // Resize to max 1280px width
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compress to 70% quality
          };
        };
      });

      setAnhBase64(dataUrl);
      setPreviewAnh(dataUrl);
      setIsImageTooLarge(false);
      setPendingFile(null);
      setFormError("");
    } catch (err) {
      notifyError("Lỗi khi nén ảnh. Thử chọn ảnh khác nhé.");
    } finally {
      setDangTai(false);
    }
  }

  /** Xóa ảnh đang chọn và reset trạng thái lỗi ảnh */
  function xoaAnh() {
    setAnhBase64(null);
    setPreviewAnh(null);
    setIsImageTooLarge(false);
    setPendingFile(null);
    if (formError.includes("Ảnh")) setFormError("");
  }

  /** Thêm item mới vào Firestore, lưu email người thêm */
  async function themMon() {
    setFormError("");
    if (tenMon.trim().length < 2) {
      notifyError("Tên món phải có ít nhất 2 ký tự.");
      return;
    }
    if (tenMon.length > 40) {
      notifyError("Tên món không được quá 40 ký tự.");
      return;
    }
    if (ghiChu.length > 100) {
      notifyError("Ghi chú tối đa 100 ký tự.");
      return;
    }

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
    return true;
  }

  /** Xóa item khỏi Firestore (chỉ chủ hoặc admin) */
  async function xoaMon(id) {
    const item = items.find(i => i.id === id);

    // Chặn nếu không phải chủ và không phải admin
    if (item?.uid && item.uid !== user.uid && user.email !== ADMIN_EMAIL) {
      notifyError("Bạn không thể xóa wishlist của người khác!");
      return false;
    }

    try {
      await deleteDoc(doc(db, "wishlist", id));
      return true;
    } catch {
      notifyError("Không thể xóa món này. Vui lòng thử lại!");
      return false;
    }
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
    formError,
    isImageTooLarge,
    setFormError,
    // Actions
    chonAnh,
    xoaAnh,
    themMon,
    xoaMon,
    nenAnh,
  };
}
