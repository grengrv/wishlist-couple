import { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { formatNgay } from "../utils/formatDate";
import Avatar from "./ui/Avatar";
import { notifyError } from "../utils/notify";
import ConfirmModal from "./ui/ConfirmModal";

const COMMON_EMOJIS = [
  "❤️", "✨", "🔥", "🎁", "🍰", "🎈", "🌸", "⭐",
  "😊", "😍", "🥰", "🥳", "🙌", "👍", "🍕", "🍔"
];

export default function ItemModal({ item, onClose, onDelete, user, userProfile, adminEmail, onLike, onComment, onDeleteComment, members = [] }) {
  const [comment, setComment] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null); // { item: obj, parentId: string|null }
  const [activeDropdown, setActiveDropdown] = useState(null); // unique ID string
  const [replyingTo, setReplyingTo] = useState(null); // ID of the comment being replied to
  const [replyText, setReplyText] = useState("");
  const [replyTargetUser, setReplyTargetUser] = useState(null); // { userId, username }
  const [showLikesModal, setShowLikesModal] = useState(null); // { title: string, users: array }
  const [searchParams] = useSearchParams();
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);

  // Merge members with current user's profile to ensure we can always identify them in likes
  const allPossibleMembers = [...members];
  const userInMembers = members.some(m => m.uid === user?.uid);
  if (!userInMembers && userProfile && user) {
    allPossibleMembers.push({ uid: user.uid, ...userProfile });
  }

  const scrollRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const dropdownRef = useRef(null);

  const likes = item?.likes || [];
  const comments = item?.comments || [];
  const isLiked = likes.some(l => typeof l === 'string' ? l === user?.uid : l.id === user?.uid);

  // Auto-scroll to bottom or specific comment
  useEffect(() => {
    const commentId = searchParams.get("commentId");
    if (commentId && comments.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`comment-${commentId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedCommentId(commentId);
          setTimeout(() => setHighlightedCommentId(null), 3000);
        }
      }, 500);
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments, item, searchParams]);

  // Handle ESC and body scroll lock
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [item, onClose]);

  // Close emoji picker and dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!item) return null;

  const isAuthorOrAdmin = !item.uid || item.uid === user?.uid || user?.email === adminEmail;

  const handleEmojiSelect = (emoji) => {
    setComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      onDeleteComment(item.id, commentToDelete.item, commentToDelete.parentId);
      setCommentToDelete(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 md:p-10 animate-fade-in"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 md:top-6 md:right-8 text-white/70 hover:text-white transition-colors z-[10000]"
          onClick={onClose}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div
          className="bg-bg-secondary w-full max-w-[1100px] h-full md:h-[90vh] overflow-hidden relative shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-slide-up rounded-none md:rounded-2xl md:rounded-r-3xl flex flex-col md:flex-row border border-border-primary/30"
          onClick={e => e.stopPropagation()}
        >

          {/* LEFT PANEL: IMAGE */}
          <div className="w-full md:w-[60%] lg:w-[65%] bg-black flex items-center justify-center relative group min-h-[350px] md:min-h-0 overflow-hidden shrink-0">
            {item.anhUrl ? (
              <img
                src={item.anhUrl}
                alt={item.ten}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-[3px] opacity-30 text-text-muted">No Image Preview</span>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: CONTENT */}
          <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col bg-bg-secondary flex-1 min-h-0 border-l border-border-primary/50">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-border-primary/50 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar src={item.avatarNguoiThem} name={item.themBoi} className="w-9 h-9 border border-border-primary/30" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-text-primary leading-tight">{item.themBoi || "Ẩn danh"}</span>
                  <span className="text-[11px] text-text-muted font-bold">Wish Author</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isAuthorOrAdmin && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-text-muted hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10 flex items-center justify-center"
                    title="Xóa điều ước"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* BODY: CAPTION & COMMENTS */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar bg-bg-secondary">

              {/* CAPTION */}
              <div className="p-4 flex gap-3 border-b border-border-primary/30">
                <div className="shrink-0">
                  <Avatar src={item.avatarNguoiThem} name={item.themBoi} className="w-9 h-9" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="text-[14px] leading-[1.5]">
                    <span className="font-black text-text-primary mr-2">{item.themBoi || "Ẩn danh"}</span>
                    <span className="font-black text-pink-500 text-lg block md:inline mb-1 md:mb-0">{item.ten}</span>
                  </div>
                  {item.ghiChu && (
                    <p className="text-[14px] text-text-secondary font-medium whitespace-pre-wrap">
                      {item.ghiChu}
                    </p>
                  )}
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-wider mt-2">
                    {formatNgay(item.taoLuc)}
                  </span>
                </div>
              </div>

              {/* COMMENTS */}
              <div className="p-4 space-y-5">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p className="text-xs font-black uppercase tracking-widest text-center">Hãy là người đầu tiên<br />bình luận...</p>
                  </div>
                ) : (
                  comments.map((c, idx) => (
                    <div 
                      key={idx} 
                      id={`comment-${c.id}`}
                      className={`space-y-4 transition-all duration-700 rounded-2xl ${highlightedCommentId === c.id ? 'bg-pink-500/10 shadow-[0_0_20px_rgba(233,30,140,0.1)] ring-1 ring-pink-500/20 p-2 -m-2' : ''}`}
                    >
                      {/* Main Comment */}
                      <div className="flex gap-3 group/comment items-start relative">
                        <div className="shrink-0">
                          <Avatar src={c.avatar} name={c.username} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[13px] font-black text-text-primary">{c.username}</span>
                            <div className="text-[14px] text-text-secondary font-medium leading-relaxed break-words">
                              {c.content.split(/(@\w+)/g).map((part, i) =>
                                part.startsWith('@') ? <span key={i} className="text-pink-500 font-black cursor-pointer hover:underline">{part}</span> : part
                              )}
                            </div>
                          </div>

                          {/* Comment Actions */}
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="text-[10px] text-text-muted font-bold">
                              {new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <button
                              onClick={() => {
                                const currentLikes = c.likes || [];
                                const hasLiked = currentLikes.includes(user?.uid);
                                const newLikes = hasLiked
                                  ? currentLikes.filter(id => id !== user?.uid)
                                  : [...currentLikes, user?.uid];

                                // Call parent onComment with updated data (assuming backend handles nested updates)
                                onComment(item.id, null, { ...c, likes: newLikes }, true);
                              }}
                              className={`text-[11px] font-black transition-colors ${c.likes?.includes(user?.uid) ? 'text-pink-500' : 'text-text-muted hover:text-text-secondary'}`}
                            >
                              Thích
                            </button>

                            <button
                              onClick={() => {
                                setReplyingTo(replyingTo === c.id ? null : c.id);
                                setReplyText("");
                                setReplyTargetUser(null);
                              }}
                              className="text-[11px] font-black text-text-muted hover:text-text-secondary"
                            >
                              Trả lời
                            </button>

                            {c.likes?.length > 0 && (
                              <button
                                onClick={() => {
                                  const likeUsers = allPossibleMembers.filter(m => c.likes.includes(m.uid));
                                  setShowLikesModal({ title: "Lượt thích bình luận", users: likeUsers });
                                }}
                                className="text-[11px] font-black text-text-muted hover:text-pink-500"
                              >
                                {c.likes.length} lượt thích
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comment Options Button */}
                        {(c.userId === user?.uid || user?.email === adminEmail) && (
                          <div className="absolute right-0 top-0">
                            <button
                              onClick={() => {
                                const dropdownId = `c-${c.id}`;
                                setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
                              }}
                              className={`p-1 text-text-muted hover:text-text-primary transition-all rounded-full hover:bg-bg-primary flex items-center justify-center ${activeDropdown === `c-${c.id}` ? 'opacity-100' : 'md:opacity-0 group-hover/comment:opacity-100 opacity-100'}`}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdown === `c-${c.id}` && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-1 bg-bg-secondary rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-border-primary/50 p-1.5 z-[200] min-w-[120px] animate-fade-in"
                              >
                                <button
                                  onClick={() => {
                                    setCommentToDelete({ item: c, parentId: null });
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

                      {/* Replies List */}
                      {c.replies?.length > 0 && (
                        <div className="ml-10 space-y-4 border-l-2 border-border-primary pl-4 mt-2">
                          {c.replies.map((reply, ridx) => {
                            const rDropdownId = `r-${c.id}-${reply.id}`;
                            return (
                              <div key={ridx} className="flex gap-3 items-start group/reply relative">
                                <div className="shrink-0">
                                  <Avatar src={reply.avatar} name={reply.username} size="xs" className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="text-[13px] leading-relaxed">
                                    <span className="font-black text-text-primary mr-2">{reply.username}</span>
                                    <span className="text-text-secondary font-medium break-words">
                                      {reply.content.split(/(@\w+)/g).map((part, i) =>
                                        part.startsWith('@') ? <span key={i} className="text-pink-500 font-black">{part}</span> : part
                                      )}
                                    </span>
                                  </div>

                                  {/* Reply Actions */}
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[10px] text-text-muted font-bold">
                                      {new Date(reply.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    <button
                                      onClick={() => {
                                        const currentLikes = reply.likes || [];
                                        const hasLiked = currentLikes.includes(user?.uid);
                                        const newLikes = hasLiked
                                          ? currentLikes.filter(id => id !== user?.uid)
                                          : [...currentLikes, user?.uid];

                                        // Update reply inside parent comment
                                        const updatedReplies = c.replies.map(r => r.id === reply.id ? { ...r, likes: newLikes } : r);
                                        onComment(item.id, null, { ...c, replies: updatedReplies }, true);
                                      }}
                                      className={`text-[10px] font-black transition-colors ${reply.likes?.includes(user?.uid) ? 'text-pink-500' : 'text-text-muted hover:text-text-secondary'}`}
                                    >
                                      Thích
                                    </button>

                                    <button
                                      onClick={() => {
                                        setReplyingTo(c.id);
                                        setReplyText(`@${reply.username} `);
                                        setReplyTargetUser({ userId: reply.userId, username: reply.username });
                                      }}
                                      className="text-[10px] font-black text-text-muted hover:text-text-secondary"
                                    >
                                      Trả lời
                                    </button>

                                    {reply.likes?.length > 0 && (
                                      <button
                                        onClick={() => {
                                          const likeUsers = allPossibleMembers.filter(m => reply.likes.includes(m.uid));
                                          setShowLikesModal({ title: "Lượt thích phản hồi", users: likeUsers });
                                        }}
                                        className="text-[10px] font-black text-text-muted hover:text-pink-500"
                                      >
                                        {reply.likes.length} lượt thích
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Reply Options */}
                                {(reply.userId === user?.uid || user?.email === adminEmail) && (
                                  <div className="absolute right-0 top-0">
                                    <button
                                      onClick={() => setActiveDropdown(activeDropdown === rDropdownId ? null : rDropdownId)}
                                      className={`p-1 text-text-muted hover:text-text-primary transition-all rounded-full hover:bg-bg-primary flex items-center justify-center ${activeDropdown === rDropdownId ? 'opacity-100' : 'md:opacity-0 group-hover/reply:opacity-100 opacity-100'}`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="19" cy="12" r="1"></circle>
                                        <circle cx="5" cy="12" r="1"></circle>
                                      </svg>
                                    </button>

                                    {activeDropdown === rDropdownId && (
                                      <div
                                        ref={dropdownRef}
                                        className="absolute right-0 top-full mt-1 bg-bg-secondary rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-border-primary/50 p-1 z-[200] min-w-[100px] animate-fade-in"
                                      >
                                        <button
                                          onClick={() => {
                                            setCommentToDelete({ item: reply, parentId: c.id });
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-black text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors group/delete"
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                          })}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === c.id && (
                        <div className="ml-10 mt-2 flex items-center gap-3 animate-fade-in bg-bg-primary/50 p-2 rounded-xl border border-border-primary/50">
                          <Avatar src={userProfile?.avatar} name={userProfile?.username} size="xs" className="w-6 h-6" />
                          <input
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && replyText.trim()) {
                                onComment(item.id, replyText, c, true, replyTargetUser);
                                setReplyText("");
                                setReplyingTo(null);
                                setReplyTargetUser(null);
                              }
                            }}
                            placeholder={`Trả lời ${c.username}...`}
                            className="flex-1 bg-transparent outline-none text-[13px] font-medium placeholder:text-text-muted"
                          />
                          <button
                            disabled={!replyText.trim()}
                            onClick={() => {
                              onComment(item.id, replyText, c, true, replyTargetUser);
                              setReplyText("");
                              setReplyingTo(null);
                              setReplyTargetUser(null);
                            }}
                            className="text-[12px] font-black text-pink-500 disabled:opacity-30"
                          >
                            Gửi
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* FOOTER: ACTIONS & INPUT */}
            <div className="shrink-0 border-t border-border-primary/50 bg-bg-secondary">

              {/* LIKE & STATS */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (!isLiked) setIsAnimatingLike(true);
                        onLike(item);
                        setTimeout(() => setIsAnimatingLike(false), 450);
                      }}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 bg-bg-primary hover:bg-rose-500/10 active:scale-90 ${isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-text-primary'} ${isAnimatingLike ? 'animate-like-pop' : ''}`}
                    >
                      <svg
                        width="24" height="24" viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke={isLiked ? "currentColor" : "var(--text-primary)"}
                        strokeWidth="2.5"
                        className="block"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.02 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-5.78z"></path>
                      </svg>
                    </button>
                    <button className="w-11 h-11 rounded-full flex items-center justify-center bg-bg-primary hover:bg-bg-secondary hover:border-border-primary border border-transparent text-text-primary transition-all active:scale-95">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="block">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="relative group/likes w-fit">
                  <span className="text-[14px] font-black text-text-primary cursor-default">
                    {likes.length.toLocaleString('vi-VN')} lượt thích
                  </span>

                  {/* LIKE TOOLTIP */}
                  {likes.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/likes:block z-50 animate-slide-up">
                      <div className="bg-bg-secondary backdrop-blur-md text-text-primary p-3 rounded-2xl shadow-2xl min-w-[150px] max-w-[250px] border border-border-primary">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-text-muted">Được thích bởi</p>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                          {likes.map((l, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Avatar src={typeof l === 'string' ? null : l.avatar} name={typeof l === 'string' ? "Ẩn danh" : l.username} size="xs" className="w-5 h-5" />
                              <span className="text-[12px] font-bold truncate">
                                {typeof l === 'string' ? "Thành viên" : l.username}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-bg-secondary rotate-45 -mt-1.5 ml-4 border-r border-b border-border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* COMMENT INPUT */}
              <div className="p-4 border-t border-border-primary/50 relative">
                {/* Mentions Popup */}
                {showMentions && members.length > 0 && (
                  <div className="absolute bottom-full left-0 w-full bg-bg-secondary border-t border-border-primary shadow-2xl p-2 z-[100] max-h-[200px] overflow-y-auto custom-scrollbar animate-slide-up">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest p-2 mb-1">Nhắc tên thành viên</p>
                    {members.filter(m => m.username.toLowerCase().includes(mentionFilter.toLowerCase())).map(m => (
                      <button
                        key={m.uid}
                        onClick={() => {
                          const lastAt = comment.lastIndexOf('@');
                          const before = comment.substring(0, lastAt);
                          setComment(before + '@' + m.username + ' ');
                          setShowMentions(false);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-bg-primary rounded-xl transition-all group"
                      >
                        <Avatar src={m.avatar} name={m.username} size="sm" className="group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col items-start">
                          <span className="text-[13px] font-black text-text-primary">@{m.username}</span>
                          <span className="text-[11px] text-text-muted font-bold">{m.displayName || m.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full left-4 mb-2 bg-bg-secondary rounded-2xl shadow-2xl border border-border-primary p-3 z-[101] grid grid-cols-4 gap-2 animate-slide-up">
                    {COMMON_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-10 h-10 flex items-center justify-center text-xl hover:bg-bg-primary rounded-xl transition-colors active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`shrink-0 text-gray-400 hover:text-pink-500 transition-colors ${showEmojiPicker ? 'text-pink-500' : ''}`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  </button>
                  <div className="flex-1">
                    <textarea
                      rows="1"
                      value={comment}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length > 200) return;
                        setComment(val);

                        const lastAt = val.lastIndexOf('@');
                        if (lastAt !== -1 && lastAt >= val.length - 20) {
                          const textAfterAt = val.substring(lastAt + 1);
                          if (!textAfterAt.includes(' ')) {
                            setShowMentions(true);
                            setMentionFilter(textAfterAt);
                          } else {
                            setShowMentions(false);
                          }
                        } else {
                          setShowMentions(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (comment.trim()) {
                            onComment(item.id, comment, comments[comments.length - 1]);
                            setComment("");
                          }
                        }
                      }}
                      placeholder="Thêm bình luận..."
                      className="w-full bg-transparent outline-none text-[14px] font-medium text-text-primary placeholder:text-text-muted placeholder:font-bold py-1.5 resize-none max-h-32 custom-scrollbar"
                    />
                  </div>
                  <button
                    disabled={!comment.trim()}
                    onClick={() => {
                      onComment(item.id, comment, comments[comments.length - 1]);
                      setComment("");
                    }}
                    className="text-[14px] font-black text-pink-500 hover:text-pink-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Delete Confirmation */}
      <ConfirmModal
        isOpen={!!commentToDelete}
        title="Xóa bình luận?"
        message="Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác."
        confirmText="Xóa bình luận"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />

      {/* Likes User Modal */}
      {showLikesModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-fade-in"
          onClick={() => setShowLikesModal(null)}
        >
          <div
            className="bg-bg-secondary w-full max-w-[360px] rounded-[32px] overflow-hidden shadow-2xl animate-slide-up border border-border-primary"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border-primary/50 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-text-primary tracking-tight">{showLikesModal.title}</h3>
              <button onClick={() => setShowLikesModal(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {showLikesModal.users.length === 0 ? (
                <div className="py-10 text-center opacity-30">
                  <p className="text-xs font-black uppercase tracking-widest">Chưa có lượt thích nào</p>
                </div>
              ) : (
                showLikesModal.users.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-bg-primary rounded-2xl transition-all">
                    <Avatar src={u.avatar} name={u.username} size="md" className="w-10 h-10 shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-black text-text-primary">{u.username}</span>
                      <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">{u.displayName || u.username}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}