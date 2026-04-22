import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  doc, query, where, updateDoc, arrayUnion, arrayRemove, deleteDoc, getDocs, getDoc
} from "firebase/firestore";

export function useGroups(user, userProfile) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  async function taoNhom(name, description) {
    if (!name.trim() || name.length < 2) return null;
    if (name.length > 40 || (description && description.length > 100)) return null;

    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const inviteCode = generateInviteCode(); // tách ra trước

    const docRef = await addDoc(collection(db, "groups"), {
      name,
      description: description || "",
      ownerUid: user.uid,
      members: [user.uid],
      inviteCode,
      createdAt: new Date()
    });

    return { id: docRef.id, inviteCode }; // trả về cả hai
  }

  async function thamGiaNhom(groupId) {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;
    const groupData = groupSnap.data();

    await updateDoc(groupRef, {
      members: arrayUnion(user.uid)
    });

    // LOG ACTIVITY
    await addDoc(collection(db, "activity_logs"), {
      roomId: groupId,
      actorId: user.uid,
      actorName: userProfile?.username || user.displayName || user.email,
      actorAvatar: userProfile?.avatar || null,
      action: "add_member",
      targetId: user.uid,
      targetName: userProfile?.username || user.displayName || user.email,
      createdAt: new Date()
    });

    // TRIGGER NOTIFICATION to Owner
    if (groupData.ownerUid !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        userId: groupData.ownerUid,
        senderId: user.uid,
        senderName: userProfile?.username || user.displayName || user.email || "Someone",
        senderAvatar: userProfile?.avatar || null,
        type: "join_group",
        groupId: groupId,
        groupName: groupData.name,
        isRead: false,
        createdAt: new Date()
      });
    }
  }

  async function thamGiaBangMa(maMoi) {
    if (!maMoi || maMoi.length !== 6) return { error: "Mã mời phải có 6 ký tự." };

    const q = query(collection(db, "groups"), where("inviteCode", "==", maMoi.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { error: "Mã mời không tồn tại hoặc đã hết hạn." };
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;
    const groupData = groupDoc.data();

    // Nếu đã là thành viên thì chỉ cần trả về ID
    if (groupData.members?.includes(user.uid)) {
      return { id: groupId };
    }

    // Nếu chưa là thành viên thì thêm vào
    await thamGiaNhom(groupId);
    return { id: groupId };
  }

  async function suaNhom(groupId, updateData) {
    if (updateData.name && (updateData.name.length < 2 || updateData.name.length > 40)) return;
    if (updateData.description && updateData.description.length > 100) return;

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, updateData);
  }

  async function xoaNhom(groupId) {
    const groupRef = doc(db, "groups", groupId);
    await deleteDoc(groupRef);
  }

  async function kickMember(groupId, memberUid, memberName) {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;
    const gData = groupSnap.data();

    if (gData.ownerUid !== user.uid) return { error: "Bạn không có quyền thực hiện hành động này." };
    
    await updateDoc(groupRef, {
      members: arrayRemove(memberUid)
    });

    // LOG ACTIVITY
    await addDoc(collection(db, "activity_logs"), {
      roomId: groupId,
      actorId: user.uid,
      actorName: userProfile?.username || user.displayName || user.email,
      actorAvatar: userProfile?.avatar || null,
      action: "kick_member",
      targetId: memberUid,
      targetName: memberName,
      createdAt: new Date()
    });

    // NOTIFY USER
    await addDoc(collection(db, "notifications"), {
      userId: memberUid,
      senderId: user.uid,
      senderName: userProfile?.username || user.displayName || user.email,
      senderAvatar: userProfile?.avatar || null,
      type: "kicked",
      groupId: groupId,
      groupName: gData.name,
      isRead: false,
      createdAt: new Date()
    });
  }

  async function addMemberByUsername(groupId, username) {
    if (!username.trim()) return { error: "Vui lòng nhập tên người dùng." };
    
    // Find user by username
    const q = query(collection(db, "users"), where("username", "==", username.trim()));
    const snap = await getDocs(q);
    
    if (snap.empty) return { error: 404 }; // Not found
    
    const targetUser = snap.docs[0].data();
    const targetUid = snap.docs[0].id;

    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    const currentGroup = groupSnap.data();

    if (currentGroup.members.includes(targetUid)) return { error: 409 }; // Already member

    await updateDoc(groupRef, {
      members: arrayUnion(targetUid)
    });

    // LOG ACTIVITY
    await addDoc(collection(db, "activity_logs"), {
      roomId: groupId,
      actorId: user.uid,
      actorName: userProfile?.username || user.displayName || user.email,
      actorAvatar: userProfile?.avatar || null,
      action: "add_member",
      targetId: targetUid,
      targetName: username,
      createdAt: new Date()
    });

    // NOTIFY USER
    await addDoc(collection(db, "notifications"), {
      userId: targetUid,
      senderId: user.uid,
      senderName: userProfile?.username || user.displayName || user.email,
      senderAvatar: userProfile?.avatar || null,
      type: "added_to_group",
      groupId: groupId,
      groupName: currentGroup.name,
      isRead: false,
      createdAt: new Date()
    });

    return { success: true };
  }

  return { groups, taoNhom, thamGiaNhom, thamGiaBangMa, suaNhom, xoaNhom, kickMember, addMemberByUsername };
}
