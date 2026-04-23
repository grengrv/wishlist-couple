import { useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";

export default function NotificationDropdown({
  notifications = [], onMarkRead, onMarkAllRead, isMuted, onToggleMute, onClose
}) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleItemClick = (n) => {
    onMarkRead(n.ids);
    onClose();

    // Use specific targetRoute if provided
    if (n.targetRoute) {
      let url = n.targetRoute;

      // Append wishId for deep linking
      if (n.wishId) {
        url += `${url.includes('?') ? '&' : '?'}wishId=${n.wishId}`;
      }
      // Append commentId for scroll-to
      const scrollTarget = n.replyId || n.commentId;
      if (scrollTarget) {
        url += `${url.includes('?') ? '&' : '?'}commentId=${scrollTarget}`;
      }

      navigate(url, { state: { commentId: scrollTarget } });
      return;
    }

    // LEGACY Fallbacks
    if (n.type === "join_group" || n.type === "added_to_group") {
      if (n.groupId) navigate(`/groups/${n.groupId}`);
      else navigate("/groups");
      return;
    }

    if (n.wishId) {
      let url = n.groupId ? `/groups/${n.groupId}?wishId=${n.wishId}` : `/personal?wishId=${n.wishId}`;
      const scrollTarget = n.replyId || n.commentId;
      if (scrollTarget) url += `&commentId=${scrollTarget}`;
      navigate(url, { state: { commentId: scrollTarget } });
      return;
    }

    navigate("/");
  };

  const formatText = (n) => {
    const sender = n.senders[0];
    let action = "";

    if (n.type === "like") action = "đã thích điều ước của bạn";
    if (n.type === "comment") action = "đã bình luận về điều ước của bạn";
    if (n.type === "reply") action = "đã trả lời bình luận của bạn";
    if (n.type === "like_comment") action = "đã thích bình luận của bạn";
    if (n.type === "tag") action = n.replyId
      ? "đã gắn thẻ bạn trong phản hồi"
      : "đã gắn thẻ bạn trong điều ước";
    if (n.type === "join_group") action = `đã tham gia nhóm "${n.groupName}" của bạn`;
    if (n.type === "post_group") action = `đã thêm điều ước mới trong "${n.groupName}"`;
    if (n.type === "added_to_group") action = `đã thêm bạn vào nhóm "${n.groupName}"`;
    if (n.type === "kicked") action = `đã mời bạn rời khỏi nhóm "${n.groupName}"`;

    if (n.count === 1) return <><span className="font-black text-text-primary">{sender}</span> {action}</>;
    if (n.count === 2) return <><span className="font-black text-text-primary">{sender}</span> và <span className="font-black text-text-primary">{n.senders[1]}</span> {action}</>;
    return (
      <>
        <span className="font-black text-text-primary">{sender}</span>, <span className="font-black text-text-primary">{n.senders[1]}</span> và <span className="font-bold text-pink-500">{n.count - 2} người khác</span> {action}
      </>
    );
  };

  const getTime = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return d.toLocaleDateString();
  };

  return (
    <div className="absolute top-[calc(100%+12px)] right-0 w-[380px] max-md:fixed max-md:left-5 max-md:right-5 max-md:w-auto bg-bg-secondary/95 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[200] overflow-hidden animate-slide-up origin-top-right">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex flex-col">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Thông báo</h3>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{unreadCount} chưa đọc</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-pink-500"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? "🔇" : "🔔"}
          </button>
          <button
            onClick={onMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-pink-hot hover:text-pink-deep transition-colors"
          >
            Đọc tất cả
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <p className="text-xs font-bold text-text-muted">Chưa có thông báo nào.<br /> Những đêm yên tĩnh cũng rất tuyệt vời.</p>
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
                  <Avatar src={n.senderAvatars[0]} name={n.senders[0]} className="w-10 h-10 rounded-xl" />
                  {!n.isRead && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-hot rounded-full border-2 border-bg-secondary"></div>}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {formatText(n)}
                    {n.wishTitle && <span className="italic opacity-60 ml-1">"{n.wishTitle}"</span>}
                  </p>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{getTime(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
