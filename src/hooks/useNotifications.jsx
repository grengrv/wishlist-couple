import { useState, useEffect, useRef } from "react";
import { db } from "@config/firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, writeBatch
} from "firebase/firestore";
import toast from "react-hot-toast";
import Avatar from "@components/ui/Avatar";
import { useLanguage } from "@context/LanguageContext";

export function useNotifications(user) {
  const { t } = useLanguage();
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
            audioRef.current.play().catch(() => { });
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
                      {n.type === 'like' ? t('liked_your_wish').replace('{{name}}', '').trim() :
                        n.type === 'comment' ? t('commented_on_wish').replace('{{name}}', '').trim() :
                          n.type === 'reply' ? t('replied_to_comment').replace('{{name}}', '').trim() :
                            n.type === 'like_comment' ? t('liked_your_comment').replace('{{name}}', '').trim() :
                              n.type === 'tag' ? (n.replyId ? t('tagged_in_reply').replace('{{name}}', '').trim() : t('tagged_in_wish').replace('{{name}}', '').trim()) :
                                n.type === 'join_group' ? t('joined_your_group', { groupName: n.groupName }).replace(n.senderName, '').trim() :
                                  n.type === 'post_group' ? t('added_wish_in_group', { groupName: n.groupName }).replace(n.senderName, '').trim() :
                                    n.type === 'added_to_group' ? t('added_you_to_group', { groupName: n.groupName }).replace(n.senderName, '').trim() :
                                      n.type === 'kicked' ? t('kicked_you_from_group', { groupName: n.groupName }).replace(n.senderName, '').trim() : 
                                        n.type === 'pin' ? t('pinnedYourWish') : t('unknown_action')}
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
    const groupMap = new Map();

    notifs.forEach(n => {
      // Group by type + wishId (or groupId as fallback)
      const groupKey = n.wishId ? n.wishId : (n.groupId ? n.groupId : 'global');
      const key = `${n.type}-${groupKey}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          ...n,
          senderIds: new Set([n.senderId]),   // track unique senderIds
          senders: [n.senderName],
          senderAvatars: [n.senderAvatar],
          ids: [n.id],
          count: 1
        });
      } else {
        const group = groupMap.get(key);
        // Only add sender info if this is a NEW unique sender
        if (!group.senderIds.has(n.senderId)) {
          group.senderIds.add(n.senderId);
          group.senders.push(n.senderName);
          group.senderAvatars.push(n.senderAvatar);
          group.count++;
        }
        // Always collect raw doc IDs (for markAsRead batch)
        group.ids.push(n.id);
        // Keep the latest createdAt
        if (new Date(n.createdAt?.toDate?.() || n.createdAt) > new Date(group.createdAt?.toDate?.() || group.createdAt)) {
          group.createdAt = n.createdAt;
        }
        // If any item is unread, mark the whole group unread
        if (!n.isRead) group.isRead = false;
      }
    });

    // Strip the non-serialisable Set before returning
    return Array.from(groupMap.values()).map(({ senderIds, ...rest }) => rest);
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
