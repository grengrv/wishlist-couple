import Avatar from "@components/ui/Avatar";
import MentionText from "@components/common/MentionText";

export default function CommentItem({ 
  comment, 
  user, 
  adminEmail, 
  onLike, 
  onReply, 
  onDelete, 
  onShowLikes,
  likes = [],
  highlighted = false,
  isReply = false,
  activeDropdown,
  setActiveDropdown,
  dropdownRef
}) {
  const hasLiked = likes.some(l => l.userId === user?.uid);
  const dropdownId = (isReply ? 'r-' : 'c-') + comment.id;

  return (
    <div
      id={`comment-${comment.id}`}
      className={`flex gap-3 group/comment items-start relative transition-all duration-700 rounded-2xl ${
        highlighted ? 'bg-pink-500/10 shadow-[0_0_20px_rgba(233,30,140,0.1)] ring-1 ring-pink-500/20 p-2 -m-2' : ''
      } ${isReply ? 'ml-0' : ''}`}
    >
      <div className="shrink-0">
        <Avatar src={comment.avatar} name={comment.username} size={isReply ? "xs" : "sm"} className={isReply ? "w-6 h-6" : ""} />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-black text-text-primary ${isReply ? 'text-[13px]' : 'text-[13px]'}`}>{comment.username}</span>
          <div className="text-[14px] text-text-secondary font-medium leading-relaxed break-words">
            <MentionText content={comment.content} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[10px] text-text-muted font-bold">
            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "..."}
          </span>

          <button
            onClick={() => onLike(comment.id, isReply ? "reply" : "comment")}
            className={`text-[11px] font-black transition-colors ${hasLiked ? 'text-pink-500' : 'text-text-muted hover:text-text-secondary'}`}
          >
            Thích
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-[11px] font-black text-text-muted hover:text-text-secondary"
            >
              Trả lời
            </button>
          )}
          
          {isReply && (
             <button
              onClick={() => onReply(comment.id, comment)}
              className="text-[10px] font-black text-text-muted hover:text-text-secondary"
            >
              Trả lời
            </button>
          )}

          {likes.length > 0 && (
            <button
              onClick={() => onShowLikes(isReply ? "Lượt thích phản hồi" : "Lượt thích bình luận", likes)}
              className="text-[11px] font-black text-text-muted hover:text-pink-500"
            >
              {likes.length} lượt thích
            </button>
          )}
        </div>
      </div>

      {/* Options Button */}
      {(comment.userId === user?.uid || user?.email === adminEmail) && (
        <div className="absolute right-0 top-0">
          <button
            onClick={() => setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)}
            className={`p-1 text-text-muted hover:text-text-primary transition-all rounded-full hover:bg-bg-primary flex items-center justify-center ${
              activeDropdown === dropdownId ? 'opacity-100' : 'md:opacity-0 group-hover/comment:opacity-100 opacity-100'
            }`}
          >
            <svg width={isReply ? "14" : "18"} height={isReply ? "14" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {activeDropdown === dropdownId && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 bg-bg-secondary rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-border-primary/50 p-1.5 z-[200] min-w-[120px] animate-fade-in"
            >
              <button
                onClick={() => {
                  onDelete(comment.id, isReply);
                  setActiveDropdown(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-black text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors group/delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/delete:scale-110 transition-transform">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Xóa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
