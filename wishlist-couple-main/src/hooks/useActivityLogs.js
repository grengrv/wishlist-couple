import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export function useActivityLogs(roomId) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "activity_logs"),
      where("roomId", "==", roomId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [roomId]);

  return logs;
}
