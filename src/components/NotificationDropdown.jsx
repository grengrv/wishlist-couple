import { useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";

export default function NotificationDropdown({ 
  notifications, onMarkRead, onMarkAllRead, isMuted, onToggleMute, onClose 
}) {
  const navigate = useNavigate();

  const handleItemClick = (n) => {
    onMarkRead(n.ids);
    onClose();

    if (n.type === "join_group") {
        navigate(`/groups/${n.groupId}`);
        return;
    }

    if (n.wishId) {
        let url = "";
        if (n.groupId) {
            url = `/groups/${n.groupId}?wishId=${n.wishId}`;
        } else {
            url = `/personal?wishId=${n.wishId}`;
        }

        if (n.commentId) {
            url += `&commentId=${n.commentId}`;
        }

        navigate(url);
    }
  };

  const formatText = (n) => {
    const sender = n.senders[0];
    const others = n.count - 1;
    let action = "";
    if (n.type === "like") action = "liked your wish";
    if (n.type === "comment") action = "commented on your wish";
    if (n.type === "reply") action = "replied to your comment";
    if (n.type === "join_group") action = `joined your group "${n.groupName}"`;
    if (n.type === "post_group") action = `posted a new wish in "${n.groupName}"`;

    if (n.count === 1) return <><span className="font-black text-text-primary">{sender}</span> {action}</>;
    if (n.count === 2) return <><span className="font-black text-text-primary">{sender}</span> and <span className="font-black text-text-primary">{n.senders[1]}</span> {action}</>;
    return <><span className="font-black text-text-primary">{sender}</span>, <span className="font-black text-text-primary">{n.senders[1]}</span> and <span className="font-black text-text-primary">{others - 1} others</span> {action}</>;
  };

  const getTime = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="absolute top-[calc(100%+12px)] right-0 w-[360px] max-md:fixed max-md:left-5 max-md:right-5 max-md:w-auto bg-bg-secondary/95 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[200] overflow-hidden animate-slide-up origin-top-right">
      
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Notifications</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleMute}
            className="text-text-muted hover:text-text-primary transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-pink-hot hover:text-pink-deep transition-colors"
          >
            Mark all read
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
            <p className="text-xs font-bold text-text-muted">No notifications yet. <br/> Quiet nights are cozy too.</p>
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
