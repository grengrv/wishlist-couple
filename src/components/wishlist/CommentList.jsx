import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

export default function CommentList({
  comments,
  replies,
  socialLikes,
  user,
  userProfile,
  adminEmail,
  members,
  highlightedCommentId,
  activeDropdown,
  setActiveDropdown,
  dropdownRef,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  replyTargetUser,
  setReplyTargetUser,
  onLikeComment,
  onDeleteComment,
  onComment,
  onShowLikes,
  wishId
}) {
  const getLikesForTarget = (targetId) => socialLikes.filter(l => l.targetId === targetId);

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-30">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p className="text-xs font-black uppercase tracking-widest text-center">Hãy là người đầu tiên<br />bình luận...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {comments.map((c) => {
        const commentLikes = getLikesForTarget(c.id);
        const commentReplies = replies.filter(r => r.commentId === c.id);

        return (
          <div key={c.id} className="space-y-4">
            <CommentItem
              comment={c}
              user={user}
              adminEmail={adminEmail}
              onLike={onLikeComment}
              onReply={(id) => {
                setReplyingTo(replyingTo === id ? null : id);
                setReplyText("");
                setReplyTargetUser(null);
              }}
              onDelete={(id, isReply) => onDeleteComment(id, isReply)}
              onShowLikes={onShowLikes}
              likes={commentLikes}
              highlighted={highlightedCommentId === c.id}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownRef={dropdownRef}
            />

            {/* Replies List */}
            {commentReplies.length > 0 && (
              <div className="ml-10 space-y-4 border-l-2 border-border-primary pl-4 mt-2">
                {commentReplies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    user={user}
                    adminEmail={adminEmail}
                    onLike={onLikeComment}
                    onReply={(id, target) => {
                      setReplyingTo(c.id);
                      setReplyText(`@${target.username} `);
                      setReplyTargetUser({ userId: target.userId, username: target.username });
                    }}
                    onDelete={(id, isReply) => onDeleteComment(id, isReply)}
                    onShowLikes={onShowLikes}
                    likes={getLikesForTarget(reply.id)}
                    highlighted={highlightedCommentId === reply.id}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownRef={dropdownRef}
                  />
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === c.id && (
              <div className="ml-10 mt-2 animate-fade-in bg-bg-primary/50 p-2 rounded-xl border border-border-primary/50">
                <CommentInput
                  value={replyText}
                  onChange={setReplyText}
                  onSubmit={() => {
                    if (replyText.trim()) {
                      onComment(wishId, replyText, c.id, true, replyTargetUser);
                      setReplyText("");
                      setReplyingTo(null);
                      setReplyTargetUser(null);
                    }
                  }}
                  placeholder={`Trả lời ${c.username}...`}
                  userProfile={userProfile}
                  members={members}
                  autoFocus
                  className="text-[13px]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
