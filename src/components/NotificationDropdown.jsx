import { useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import { useLanguage } from "../context/LanguageContext";

export default function NotificationDropdown({
  notifications = [], onMarkRead, onMarkAllRead, isMuted, onToggleMute, onClose
}) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleItemClick = (n) => {
    onMarkRead(n.ids);
    onClose();

    let baseUrl = "";
    if (n.targetRoute) {
      baseUrl = n.targetRoute;
    } else if (n.wishId) {
      baseUrl = n.groupId ? `/groups/${n.groupId}` : `/personal`;
    }

    if (baseUrl) {
      let url = baseUrl;
      const separator = url.includes('?') ? '&' : '?';
      
      const params = [];
      if (n.wishId) params.push(`wishId=${n.wishId}`);
      
      const scrollTarget = n.replyId || n.commentId;
      if (scrollTarget) params.push(`commentId=${scrollTarget}`);
      
      // Highlight logic for pins or any wish-related click
      if (n.wishId) params.push(`highlight=true`);

      if (params.length > 0) {
        url += separator + params.join('&');
      }

      navigate(url, { state: { commentId: scrollTarget } });
      return;
    }

    if (n.type === "join_group" || n.type === "added_to_group") {
      if (n.groupId) navigate(`/groups/${n.groupId}`);
      else navigate("/groups");
      return;
    }

    navigate("/");
  };

  const formatText = (n) => {
    const senders = n.senders;
    const count = n.count;
    let key = "";

    if (n.type === "like") key = "liked_your_wish";
    if (n.type === "comment") key = "commented_on_wish";
    if (n.type === "reply") key = "replied_to_comment";
    if (n.type === "like_comment") key = "liked_your_comment";
    if (n.type === "tag") key = n.replyId ? "tagged_in_reply" : "tagged_in_wish";
    if (n.type === "join_group") key = "joined_your_group";
    if (n.type === "post_group") key = "added_wish_in_group";
    if (n.type === "added_to_group") key = "added_you_to_group";
    if (n.type === "kicked") key = "kicked_you_from_group";
    if (n.type === "pin") key = "pinnedYourWish";

    if (!key) return n.text;

    // Custom rendering for grouped senders
    if (count === 1) {
      return (
        <>
          <span className="font-black text-text-primary">{senders[0]}</span> {t(key)}
        </>
      );
    }

    if (count === 2) {
      return (
        <>
          <span className="font-black text-text-primary">{senders[0]}</span> {t("and")} <span className="font-black text-text-primary">{senders[1]}</span> {t(key)}
        </>
      );
    }

    return (
      <>
        <span className="font-black text-text-primary">{senders[0]}</span>, <span className="font-black text-text-primary">{senders[1]}</span> {t("and")} <span className="text-pink-500 font-bold">{count - 2} {t("others")}</span> {t(key)}
      </>
    );
  };

  const getTime = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const diff = (new Date() - d) / 1000;
    
    if (lang === "vi") {
      if (diff < 60) return "Vừa xong";
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    } else {
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    }
    return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <>
      <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[190]" onClick={onClose} />
      <div className="absolute top-[calc(100%+12px)] right-0 w-[380px] bg-bg-secondary/95 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[200] overflow-hidden md:animate-slide-up origin-top-right max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto max-md:w-full max-md:rounded-t-[32px] max-md:rounded-b-none max-md:h-[80vh] max-md:flex max-md:flex-col max-md:animate-slide-up-bottom max-md:pb-safe">

      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex flex-col">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">{t("notifications")}</h3>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{unreadCount} {t("unread")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-pink-500"
            title={isMuted ? t("unmute") : t("mute")}
          >
            {isMuted ? "🔇" : "🔔"}
          </button>
          <button
            onClick={onMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-pink-hot hover:text-pink-deep transition-colors"
          >
            {t("mark_all_read")}
          </button>
        </div>
      </div>

      <div className="max-h-[400px] max-md:max-h-none max-md:flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <p className="text-xs font-bold text-text-muted">
              {t("notification_empty")}<br /> 
              {t("quiet_nights")}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((n, i) => (
              <div
                key={i}
                onClick={() => handleItemClick(n)}
                className={`
                  px-6 py-4 flex gap-4 cursor-pointer transition-all hover:bg-white/5
                  ${!n.isRead ? 'bg-white/[0.03]' : ''}
                `}
              >
                <div className="relative shrink-0">
                  <div className="relative">
                    <Avatar src={n.senderAvatars[0]} name={n.senders[0]} className="w-10 h-10 rounded-xl" />
                    {n.type === "pin" && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-bg-secondary text-[10px] shadow-lg shadow-amber-500/20">
                        ⭐
                      </div>
                    )}
                  </div>
                  {!n.isRead && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-hot rounded-full border-2 border-bg-secondary"></div>}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {formatText(n)}
                    {n.wishTitle && <span className="italic opacity-60 ml-1">"{n.wishTitle}"</span>}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{getTime(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
