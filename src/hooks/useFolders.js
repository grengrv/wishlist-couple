import { useState, useEffect } from "react";
import { db } from "@config/firebase";
import { 
  collection, query, where, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, orderBy, serverTimestamp, getDoc 
} from "firebase/firestore";
import { notifyError } from "@utils/notify";

export function useFolders(user, userProfile = null, groupId = null) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const logActivity = async (action, targetId, targetName) => {
    if (!groupId || !user) return;
    try {
      await addDoc(collection(db, "activity_logs"), {
        roomId: groupId,
        actorId: user.uid,
        actorName: userProfile?.username || user.displayName || user.email,
        actorAvatar: userProfile?.avatar || null,
        action: action, // "create_folder" | "rename_folder" | "delete_folder"
        targetId: targetId,
        targetName: targetName,
        timestamp: new Date(),
        date: new Date().toISOString().split("T")[0],
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error logging folder activity:", e);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = groupId
      ? query(
          collection(db, "folders"),
          where("groupId", "==", groupId),
          orderBy("createdAt", "asc")
        )
      : query(
          collection(db, "folders"),
          where("uid", "==", user.uid),
          where("groupId", "==", null),
          orderBy("createdAt", "asc")
        );

    const unsubscribe = onSnapshot(q, (snap) => {
      setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Folders snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, groupId]);

  const addFolder = async (name, emoji = "📁", color = "#ec4899") => {
    if (!name.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "folders"), {
        name: name.trim(),
        emoji,
        color,
        uid: user.uid,
        groupId: groupId || null,
        createdAt: serverTimestamp()
      });
      await logActivity("create_folder", docRef.id, name.trim());
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Không thể tạo thư mục.");
      return false;
    }
  };

  const updateFolder = async (id, name, emoji, color) => {
    try {
      const updateData = { name: name.trim() };
      if (emoji) updateData.emoji = emoji;
      if (color) updateData.color = color;

      await updateDoc(doc(db, "folders", id), updateData);
      await logActivity("rename_folder", id, name.trim());
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Không thể cập nhật thư mục.");
      return false;
    }
  };

  const deleteFolder = async (id) => {
    try {
      const folderSnap = await getDoc(doc(db, "folders", id));
      const folderName = folderSnap.exists() ? folderSnap.data().name : "Unknown Folder";
      
      await deleteDoc(doc(db, "folders", id));
      await logActivity("delete_folder", id, folderName);
      return true;
    } catch (err) {
      console.error(err);
      notifyError("Không thể xóa thư mục.");
      return false;
    }
  };

  return { folders, loading, addFolder, updateFolder, deleteFolder };
}
