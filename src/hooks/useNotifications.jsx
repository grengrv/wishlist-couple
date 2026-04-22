import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { 
  collection, query, where, orderBy, onSnapshot, 
  updateDoc, doc, writeBatch 
} from "firebase/firestore";
import toast from "react-hot-toast";
import Avatar from "../components/ui/Avatar";

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"));
  const prevIds = useRef(new Set());
  const isFirstLoad = useRef(true);
  const lastSoundTime = useRef(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Update unread count
      setUnreadCount(data.filter(n => !n.isRead).length);
      
      // Detect new notifications for sound
      const currentIds = new Set(data.map(n => n.id));
      if (!isFirstLoad.current) {
        const newItems = data.filter(n => !prevIds.current.has(n.id));
        if (newItems.length > 0) {
          const now = Date.now();
          
          // Sound
          if (!isMuted && now - lastSoundTime.current > 2000) {
            audioRef.current.play().catch(() => {});
            lastSoundTime.current = now;
          }

          // Toast
          newItems.forEach(n => {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} max-w-md w-full bg-bg-secondary/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 pointer-events-auto`}>
                <Avatar src={n.senderAvatar} name={n.senderName} className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs text-text-primary font-bold">
                    {n.senderName} <span className="font-normal text-text-muted">
                      {n.type === 'like' ? 'liked your wish' : 
                       n.type === 'comment' ? 'commented on your wish' : 
                       n.type === 'reply' ? 'replied to your comment' :
                       n.type === 'join_group' ? `joined your group "${n.groupName}"` :
                       n.type === 'post_group' ? `posted a new wish in "${n.groupName}"` : 'interacted with you'}
                    </span>
                  </p>
                  {(n.wishTitle || n.groupName) && (
                    <p className="text-[11px] text-text-muted truncate italic">
                      "{n.wishTitle || n.groupName}"
                    </p>
                  )}
                </div>
              </div>
            ), { position: 'top-right', duration: 3000 });
          });
        }
      }

      setNotifications(data);
      setGroupedNotifications(groupNotifications(data));
      prevIds.current = currentIds;
      isFirstLoad.current = false;
    });

    return () => unsubscribe();
  }, [user, isMuted]);

  function groupNotifications(notifs) {
    const groups = [];
    const groupMap = new Map();

    notifs.forEach(n => {
      const groupKey = n.wishId ? n.wishId : (n.groupId ? n.groupId : 'global');
      const key = `${n.type}-${groupKey}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          ...n,
          senders: [n.senderName],
          senderAvatars: [n.senderAvatar],
          ids: [n.id],
          count: 1
        });
      } else {
        const group = groupMap.get(key);
        if (!group.senders.includes(n.senderName)) {
          group.senders.push(n.senderName);
          group.senderAvatars.push(n.senderAvatar);
        }
        group.ids.push(n.id);
        group.count++;
        // Keep the latest createdAt
        if (new Date(n.createdAt?.toDate?.() || n.createdAt) > new Date(group.createdAt?.toDate?.() || group.createdAt)) {
            group.createdAt = n.createdAt;
        }
        // If any item is unread, the group is unread
        if (!n.isRead) group.isRead = false;
      }
    });

    return Array.from(groupMap.values());
  }

  async function markAsRead(ids) {
    if (!ids || ids.length === 0) return;
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.update(doc(db, "notifications", id), { isRead: true });
    });
    await batch.commit();
  }

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, "notifications", n.id), { isRead: true });
    });
    await batch.commit();
  }

  return {
    notifications,
    groupedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMuted,
    setIsMuted
  };
}
