import { useState, useRef, useCallback } from "react";
import { db } from "@config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import Avatar from "@components/ui/Avatar";

const HOVER_DELAY_MS = 200;

/**
 * MentionText
 *
 * Renders a string of text and converts every "@username" token into a
 * highlighted, hoverable span that shows a mini profile card on mouseover.
 *
 * Props:
 *  content   string  – raw comment/reply text
 *  className string  – extra wrapper classes
 */
export default function MentionText({ content = "", className = "" }) {
  // Split on mention tokens – keep them in the parts array
  const parts = content.split(/(@\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <MentionChip key={i} mention={part} />
        ) : (
          part
        )
      )}
    </span>
  );
}

/* ─── MentionChip ─────────────────────────────────────────────────────────── */
function MentionChip({ mention }) {
  const username = mention.substring(1); // strip "@"
  const [profile, setProfile] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const cardRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    if (profile) return; // already loaded
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("username", "==", username), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) setProfile({ uid: snap.docs[0].id, ...snap.docs[0].data() });
    } catch (_) { }
    setLoading(false);
  }, [username, profile]);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(async () => {
      await fetchProfile();
      setVisible(true);
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-pink-hot font-black cursor-pointer hover:underline decoration-pink-hot/50 transition-colors"
      >
        {mention}
      </span>

      {/* Hover profile card */}
      {visible && (
        <span
          ref={cardRef}
          className="absolute bottom-full left-0 mb-2 z-[300] animate-fade-in pointer-events-none"
          style={{ minWidth: "180px" }}
        >
          <span className="block bg-bg-secondary border border-border-primary/60 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] p-3">
            {loading ? (
              <span className="flex items-center gap-2 px-1">
                <span className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
                <span className="flex flex-col gap-1">
                  <span className="h-2.5 w-20 rounded-full bg-white/10 animate-pulse" />
                  <span className="h-2 w-14 rounded-full bg-white/10 animate-pulse" />
                </span>
              </span>
            ) : profile ? (
              <span className="flex items-center gap-2.5">
                <Avatar src={profile.avatar} name={profile.username} size="sm" className="w-9 h-9 shrink-0" />
                <span className="flex flex-col min-w-0">
                  <span className="text-[13px] font-black text-text-primary truncate">@{profile.username}</span>
                  {profile.displayName && profile.displayName !== profile.username && (
                    <span className="text-[11px] text-text-muted font-bold truncate">{profile.displayName}</span>
                  )}
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-text-muted font-bold px-1">@{username} · Không tìm thấy</span>
            )}
          </span>
          {/* Caret */}
          <span className="block w-3 h-3 bg-bg-secondary border-r border-b border-border-primary/60 rotate-45 -mt-1.5 ml-4 shadow-sm" />
        </span>
      )}
    </span>
  );
}
