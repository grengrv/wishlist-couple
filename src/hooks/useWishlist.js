import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, onSnapshot,
  deleteDoc, doc, orderBy, query, updateDoc, arrayUnion, arrayRemove, getDoc
} from "firebase/firestore";
import { ADMIN_EMAIL } from "../constants";
import { notifyError } from "../utils/notify";
import { toastStore } from "../utils/toastStore";

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

    // 2. Kiểm tra kích thước (400KB cho Firestore Base64)
    if (file.size > 400 * 1024) {
      setIsImageTooLarge(true);
      setPendingFile(file);
      setFormError("Ảnh quá lớn (trên 400KB). Vui lòng chọn ảnh nhỏ hơn để lưu trữ.");
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

    try {
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

      // TRIGGER NOTIFICATION to Group Owner
      if (groupId) {
        try {
          const groupSnap = await getDoc(doc(db, "groups", groupId));
          if (groupSnap.exists()) {
            const groupData = groupSnap.data();
            if (groupData.ownerUid !== user.uid) {
              await addDoc(collection(db, "notifications"), {
                userId: groupData.ownerUid,
                senderId: user.uid,
                senderName: userProfile?.username || user.displayName || user.email || "Someone",
                senderAvatar: userProfile?.avatar || null,
                type: "post_group",
                wishId: docRef.id,
                wishTitle: tenMon,
                groupId: groupId,
                groupName: groupData.name,
                isRead: false,
                createdAt: new Date()
              });
            }
          }
        } catch (e) {
          console.error("Error sending group post notification:", e);
        }
      }

      return true;
    } catch (err) {
      notifyError("Không thể thêm món này. Thử lại sau nhé!");
      console.error(err);
      return false;
    } finally {
      setDangTai(false);
    }
  }

  /** Xóa item khỏi Firestore (chỉ chủ hoặc admin) */
  async function xoaMon(id) {
    const item = items.find(i => i.id === id);

    // Chặn nếu không phải chủ và không phải admin
    if (item?.uid && item.uid !== user.uid && user.email !== ADMIN_EMAIL) {
      notifyError("Bạn không thể xóa wishlist của người khác!");
      return false;
    }

    // OPTIMISTIC UPDATE
    const previousItems = [...items];
    setItems(prev => prev.filter(i => i.id !== id));

    try {
      await deleteDoc(doc(db, "wishlist", id));
      return true;
    } catch (err) {
      console.error(err);
      setItems(previousItems); // Rollback
      notifyError("Không thể xóa món này. Vui lòng thử lại!");
      return false;
    }
  }

  /** Thích / Bỏ thích */
  async function thichMon(item) {
    if (!user || !item) return;
    
    const wishId = item.id;
    const currentLikes = item.likes || [];
    
    // Find if already liked (handle both string IDs for legacy and objects for new structure)
    const existingLike = currentLikes.find(l => 
      typeof l === 'string' ? l === user.uid : l.id === user.uid
    );
    const isLiked = !!existingLike;
    const wishRef = doc(db, "wishlist", wishId);
    
    const likeObj = {
      id: user.uid,
      username: userProfile?.username || user.displayName || user.email || "Bạn nhỏ",
      avatar: userProfile?.avatar || null
    };

    // OPTIMISTIC UPDATE
    const previousItems = [...items];
    setItems(prev => prev.map(i => {
      if (i.id === wishId) {
        const newLikes = isLiked 
          ? (i.likes || []).filter(l => (typeof l === 'string' ? l !== user.uid : l.id !== user.uid))
          : [...(i.likes || []), likeObj];
        return { ...i, likes: newLikes };
      }
      return i;
    }));

    toastStore.show(isLiked ? "Đã bỏ thích" : "Đã thích");

    try {
      if (isLiked) {
        await updateDoc(wishRef, { 
          likes: arrayRemove(existingLike) 
        });
      } else {
        await updateDoc(wishRef, { 
          likes: arrayUnion(likeObj) 
        });

        // TRIGGER NOTIFICATION
        if (item.uid !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            userId: item.uid, // Receiver
            senderId: user.uid,
            senderName: userProfile?.username || user.displayName || user.email || "Someone",
            senderAvatar: userProfile?.avatar || null,
            type: "like",
            wishId: wishId,
            wishTitle: item.ten,
            groupId: item.groupId || null,
            isRead: false,
            createdAt: new Date()
          });
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      setItems(previousItems); // Rollback
      notifyError("Lỗi khi cập nhật lượt thích. Vui lòng thử lại!");
      return false;
    }
  }

  /** Thêm bình luận hoặc Trả lời / Like bình luận */
  async function binhLuanMon(wishId, content, targetComment = null, isSpecial = false, replyTarget = null) {
    if (!user) return;

    const wishRef = doc(db, "wishlist", wishId);
    const item = items.find(i => i.id === wishId);
    if (!item) return;

    let updatedComments = [...(item.comments || [])];

    if (isSpecial) {
      // TRƯỜNG HỢP 1: CẬP NHẬT LIKE BÌNH LUẬN (Content là null)
      if (content === null && targetComment) {
        updatedComments = updatedComments.map(c => {
          const isMatch = (c.id && c.id === targetComment.id) ||
            (c.createdAt === targetComment.createdAt && c.userId === targetComment.userId);
          return isMatch ? targetComment : c;
        });
        toastStore.show(targetComment.likes?.includes(user.uid) ? "Đã thích" : "Đã bỏ thích");
      }
      // TRƯỜNG HỢP 2: TRẢ LỜI BÌNH LUẬN
      else if (content && targetComment) {
        const reply = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.uid,
          username: userProfile?.username || user.displayName || user.email || "Khách",
          avatar: userProfile?.avatar || null,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          likes: [],
          replyTo: replyTarget ? { userId: replyTarget.userId, username: replyTarget.username } : null
        };

        updatedComments = updatedComments.map(c => {
          const isMatch = (c.id && c.id === targetComment.id) || 
                          (c.createdAt === targetComment.createdAt && c.userId === targetComment.userId);
          if (isMatch) {
            return { ...c, replies: [...(c.replies || []), reply] };
          }
          return c;
        });
        toastStore.show("Đã trả lời");

        // TRIGGER NOTIFICATION for Reply
        if (targetComment.userId !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            userId: targetComment.userId,
            senderId: user.uid,
            senderName: userProfile?.username || user.displayName || user.email || "Someone",
            senderAvatar: userProfile?.avatar || null,
            type: "reply",
            wishId: wishId,
            wishTitle: item.ten,
            commentId: targetComment.id,
            groupId: item.groupId || null,
            isRead: false,
            createdAt: new Date()
          });
        }
      }
    } else {
      // TRƯỜNG HỢP 3: BÌNH LUẬN MỚI (TOP-LEVEL)
      if (!content.trim()) return;
      if (content.length > 200) { notifyError("Bình luận tối đa 200 ký tự."); return; }

      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        username: userProfile?.username || user.displayName || user.email || "Khách",
        avatar: userProfile?.avatar || null,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
      };
      updatedComments.push(comment);
      toastStore.show("Đã thêm bình luận");

      // TRIGGER NOTIFICATION
      if (item.uid !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          userId: item.uid,
          senderId: user.uid,
          senderName: userProfile?.username || user.displayName || user.email || "Someone",
          senderAvatar: userProfile?.avatar || null,
          type: "comment",
          wishId: wishId,
          wishTitle: item.ten,
          commentId: comment.id,
          groupId: item.groupId || null,
          isRead: false,
          createdAt: new Date()
        });
      }
    }

    // OPTIMISTIC UPDATE
    const previousItems = [...items];
    setItems(prev => prev.map(i => i.id === wishId ? { ...i, comments: updatedComments } : i));

    try {
      await updateDoc(wishRef, { comments: updatedComments });
      return true;
    } catch (err) {
      console.error(err);
      setItems(previousItems);
      notifyError("Lỗi khi cập nhật bình luận.");
      return false;
    }
  }

  /** Xóa bình luận hoặc Phản hồi */
  async function xoaBinhLuan(wishId, comment, parentId = null) {
    if (!user || !comment) return;
    const wishRef = doc(db, "wishlist", wishId);
    const item = items.find(i => i.id === wishId);
    if (!item) return;

    let updatedComments = [...(item.comments || [])];

    if (parentId) {
      // XÓA PHẢN HỒI
      updatedComments = updatedComments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: (c.replies || []).filter(r => r.id !== comment.id) };
        }
        return c;
      });
      toastStore.show("Đã xóa phản hồi");
    } else {
      // XÓA BÌNH LUẬN TOP-LEVEL
      updatedComments = updatedComments.filter(c => {
        const isMatch = (c.id && c.id === comment.id) ||
          (c.createdAt === comment.createdAt && c.userId === comment.userId);
        return !isMatch;
      });
      toastStore.show("Đã xóa bình luận");
    }

    // OPTIMISTIC UPDATE
    const previousItems = [...items];
    setItems(prev => prev.map(i => i.id === wishId ? { ...i, comments: updatedComments } : i));

    try {
      await updateDoc(wishRef, { comments: updatedComments });
      return true;
    } catch (err) {
      console.error(err);
      setItems(previousItems); // Rollback
      notifyError("Lỗi khi xóa bình luận.");
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
    thichMon,
    binhLuanMon,
    xoaBinhLuan,
  };
}
