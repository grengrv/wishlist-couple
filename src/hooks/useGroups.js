import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  doc, query, where, updateDoc, arrayUnion, deleteDoc
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
    
    const docRef = await addDoc(collection(db, "groups"), {
      name,
      description: description || "",
      ownerUid: user.uid,
      members: [user.uid],
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

  return { groups, taoNhom, thamGiaNhom, suaNhom, xoaNhom };
}
