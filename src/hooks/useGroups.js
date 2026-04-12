import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  doc, query, where, updateDoc, arrayUnion, deleteDoc, getDocs
} from "firebase/firestore";

export function useGroups(user) {
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

    // Sinh mã mời ngẫu nhiên 6 ký tự (Chữ in hoa và Số)
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    const docRef = await addDoc(collection(db, "groups"), {
      name,
      description: description || "",
      ownerUid: user.uid,
      members: [user.uid],
      inviteCode: generateInviteCode(),
      createdAt: new Date()
    });
    return docRef.id;
  }

  async function thamGiaNhom(groupId) {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(user.uid)
    });
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

  return { groups, taoNhom, thamGiaNhom, thamGiaBangMa, suaNhom, xoaNhom };
}
