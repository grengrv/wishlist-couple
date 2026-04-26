import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, onSnapshot,
  deleteDoc, doc, orderBy, query, updateDoc, arrayUnion, arrayRemove, getDoc,
  increment, where
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
  const [userLikes, setUserLikes] = useState(new Set());
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

    // Listen for current user's likes
    const likesQ = query(collection(db, "likes"), where("userId", "==", user.uid));
    const unsubscribeLikes = onSnapshot(likesQ, (snap) => {
        const likedIds = new Set(snap.docs.map(d => d.data().wishId).filter(Boolean));
        setUserLikes(likedIds);
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
      unsubscribeLikes();
      window.removeEventListener("paste", handlePaste);
    };
  }, [user, groupId]);

  // Decorate items with isLiked state
  const enrichedItems = useMemo(() => items.map(item => ({
    ...item,
    isLiked: userLikes.has(item.id)
  })), [items, userLikes]);

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

            // LOG ACTIVITY
            await addDoc(collection(db, "activity_logs"), {
              roomId: groupId,
              actorId: user.uid,
              actorName: userProfile?.username || user.displayName || user.email,
              actorAvatar: userProfile?.avatar || null,
              action: "create_wish",
              targetId: docRef.id,
              targetName: tenMon,
              targetRoute: `/group/${groupId}?wishId=${docRef.id}`,
              timestamp: new Date(),
              date: new Date().toISOString().split("T")[0],
              createdAt: new Date()
            });
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

  const getTargetRoute = (item) => {
    return item.groupId ? `/groups/${item.groupId}` : "/personal";
  };

  /** Thích / Bỏ thích */
  async function thichMon(item) {
    if (!user || !item) return;
    
    const wishId = item.id;
    
    // Check if user already liked
    const likesQ = query(collection(db, "likes"), where("wishId", "==", wishId), where("userId", "==", user.uid));
    const likesSnap = await getDocs(likesQ);
    const isLiked = !likesSnap.empty;

    toastStore.show(isLiked ? "Đã bỏ thích" : "Đã thích");

    try {
      if (isLiked) {
        // Remove likes
        const deletePromises = likesSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        await updateDoc(doc(db, "wishlist", wishId), { likeCount: increment(-1) });
      } else {
        // Add like
        await addDoc(collection(db, "likes"), {
          wishId: wishId,
          userId: user.uid,
          username: userProfile?.username || user.displayName || user.email || "Bạn nhỏ",
          avatar: userProfile?.avatar || null,
          createdAt: new Date()
        });
        await updateDoc(doc(db, "wishlist", wishId), { likeCount: increment(1) });

        // TRIGGER NOTIFICATION
        if (item.uid !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            userId: item.uid,
            senderId: user.uid,
            senderName: userProfile?.username || user.displayName || user.email || "Someone",
            senderAvatar: userProfile?.avatar || null,
            type: "like",
            wishId: wishId,
            wishTitle: item.ten,
            groupId: item.groupId || null,
            targetRoute: getTargetRoute(item),
            isRead: false,
            createdAt: new Date()
          });
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Lỗi khi cập nhật lượt thích.");
      return false;
    }
  }

  /** Thêm bình luận hoặc Trả lời / Like bình luận */
  async function binhLuanMon(wishId, content, targetCommentId = null, isReply = false, replyTarget = null) {
    if (!user || !content?.trim()) return;

    const item = items.find(i => i.id === wishId);
    if (!item) return;

    const MAX_TAGS = 5;
    const senderName   = userProfile?.username || user.displayName || user.email || "Someone";
    const senderAvatar = userProfile?.avatar || null;
    const targetRoute  = getTargetRoute(item);

    /**
     * Send "tag" notifications for every @mention in `text`.
     * `alreadyNotified` – Set of UIDs that already received a notification
     * in the same action, so we never double-ping.
     */
    async function sendTagNotifications(text, docId, replyId, alreadyNotified) {
      const raw = text.match(/@(\w+)/g);
      if (!raw) return;

      // Deduplicate usernames inside this content (max MAX_TAGS unique)
      const uniqueUsernames = [...new Set(raw.map(m => m.substring(1)))].slice(0, MAX_TAGS);

      for (const mentionedUsername of uniqueUsernames) {
        if (mentionedUsername.toLowerCase() === userProfile?.username?.toLowerCase()) continue; // self

        const userQ = query(collection(db, "users"), where("username", "==", mentionedUsername));
        const userSnap = await getDocs(userQ);
        if (userSnap.empty) continue;

        const targetUid = userSnap.docs[0].id;
        if (alreadyNotified.has(targetUid)) continue; // already got a notification this action
        alreadyNotified.add(targetUid);

        await addDoc(collection(db, "notifications"), {
          userId: targetUid,
          senderId: user.uid,
          senderName,
          senderAvatar,
          type: "tag",
          wishId: wishId,
          wishTitle: item.ten,
          commentId: docId,
          replyId: replyId || null,   // ← FIX: correctly set for replies
          groupId: item.groupId || null,
          targetRoute,
          isRead: false,
          createdAt: new Date()
        });
      }
    }

    try {
      if (isReply && targetCommentId) {
        // ── ADD REPLY ────────────────────────────────────────────────
        const reply = {
          wishId: wishId,
          commentId: targetCommentId,
          userId: user.uid,
          username: userProfile?.username || user.displayName || user.email || "Khách",
          avatar: senderAvatar,
          content: content.trim(),
          createdAt: new Date(),
          replyTo: replyTarget ? { userId: replyTarget.userId, username: replyTarget.username } : null
        };

        const docRef = await addDoc(collection(db, "replies"), reply);
        toastStore.show("Đã trả lời");
        await updateDoc(doc(db, "wishlist", wishId), { commentCount: increment(1) });

        // Track who already got notified this action
        const alreadyNotified = new Set([user.uid]);

        // Notify the reply target (original commenter / mentioned user)
        if (replyTarget && replyTarget.userId && replyTarget.userId !== user.uid) {
          alreadyNotified.add(replyTarget.userId);
          await addDoc(collection(db, "notifications"), {
            userId: replyTarget.userId,
            senderId: user.uid,
            senderName,
            senderAvatar,
            type: "reply",
            wishId: wishId,
            wishTitle: item.ten,
            commentId: targetCommentId,
            replyId: docRef.id,
            groupId: item.groupId || null,
            targetRoute,
            isRead: false,
            createdAt: new Date()
          });
        }

        // Send tag notifications for @mentions inside the reply
        await sendTagNotifications(content, targetCommentId, docRef.id, alreadyNotified);

      } else {
        // ── ADD TOP-LEVEL COMMENT ────────────────────────────────────
        if (content.length > 200) { notifyError("Bình luận tối đa 200 ký tự."); return; }

        const comment = {
          wishId: wishId,
          userId: user.uid,
          username: userProfile?.username || user.displayName || user.email || "Khách",
          avatar: senderAvatar,
          content: content.trim(),
          createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, "comments"), comment);
        toastStore.show("Đã thêm bình luận");
        await updateDoc(doc(db, "wishlist", wishId), { commentCount: increment(1) });

        const alreadyNotified = new Set([user.uid]);

        // Notify wish owner
        if (item.uid && item.uid !== user.uid) {
          alreadyNotified.add(item.uid);
          await addDoc(collection(db, "notifications"), {
            userId: item.uid,
            senderId: user.uid,
            senderName,
            senderAvatar,
            type: "comment",
            wishId: wishId,
            wishTitle: item.ten,
            commentId: docRef.id,
            groupId: item.groupId || null,
            targetRoute,
            isRead: false,
            createdAt: new Date()
          });
        }

        // Send tag notifications for @mentions inside the comment
        await sendTagNotifications(content, docRef.id, null, alreadyNotified);
      }
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Lỗi khi gửi bình luận.");
      return false;
    }
  }


  /** Xóa bình luận hoặc Phản hồi */
  async function xoaBinhLuan(wishId, id, isReply = false) {
    if (!user || !id) return;
    try {
      if (isReply) {
        await deleteDoc(doc(db, "replies", id));
        toastStore.show("Đã xóa phản hồi");
      } else {
        await deleteDoc(doc(db, "comments", id));
        // Also delete associated replies (could be a Cloud Function, but for now just leave them orphaned or do batch)
        toastStore.show("Đã xóa bình luận");
      }
      await updateDoc(doc(db, "wishlist", wishId), { commentCount: increment(-1) });
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Lỗi khi xóa.");
      return false;
    }
  }

  /** Thích bình luận (mới) */
  async function thichBinhLuan(targetId, type = "comment") {
    if (!user) return;
    
    const likesQ = query(collection(db, "likes"), where("targetId", "==", targetId), where("userId", "==", user.uid));
    const likesSnap = await getDocs(likesQ);
    const isLiked = !likesSnap.empty;

    try {
      if (isLiked) {
        const deletePromises = likesSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } else {
        await addDoc(collection(db, "likes"), {
          targetId: targetId,
          type: type, // comment | reply
          userId: user.uid,
          username: userProfile?.username || user.displayName || user.email || "Khách",
          avatar: userProfile?.avatar || null,
          createdAt: new Date()
        });

        // TRIGGER like_comment NOTIFICATION
        try {
          const collName = type === "reply" ? "replies" : "comments";
          const targetDoc = await getDoc(doc(db, collName, targetId));

          if (targetDoc.exists()) {
            const targetData = targetDoc.data();
            const ownerId = targetData.userId;

            // Don't self-notify
            if (ownerId && ownerId !== user.uid) {
              // Prevent duplicate: check if we already sent like_comment for this target from this sender
              const dupQ = query(
                collection(db, "notifications"),
                where("userId", "==", ownerId),
                where("senderId", "==", user.uid),
                where("type", "==", "like_comment"),
                where("commentId", "==", targetId)
              );
              const dupSnap = await getDocs(dupQ);
              if (dupSnap.empty) {
                const wishId = targetData.wishId || null;
                let targetRoute = "/personal";
                if (wishId) {
                  try {
                    const wishDoc = await getDoc(doc(db, "wishlist", wishId));
                    if (wishDoc.exists()) {
                      const wishData = wishDoc.data();
                      targetRoute = wishData.groupId ? `/groups/${wishData.groupId}` : "/personal";
                    }
                  } catch (_) {}
                }

                await addDoc(collection(db, "notifications"), {
                  userId: ownerId,
                  senderId: user.uid,
                  senderName: userProfile?.username || user.displayName || user.email || "Someone",
                  senderAvatar: userProfile?.avatar || null,
                  type: "like_comment",
                  wishId: wishId,
                  commentId: targetId,
                  targetRoute: targetRoute,
                  isRead: false,
                  createdAt: new Date()
                });
              }
            }
          }
        } catch (e) {
          console.error("Error sending like_comment notification:", e);
        }
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  return {
    // Dữ liệu
    items: enrichedItems,
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
    thichBinhLuan,
  };
}
