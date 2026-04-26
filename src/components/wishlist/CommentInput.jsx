import Avatar from "@components/ui/Avatar";
import MentionInput from "@components/common/MentionInput";

export default function CommentInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder, 
  userProfile, 
  members, 
  autoFocus = false,
  className = "",
  showEmojiToggle = false,
  onEmojiToggle = null,
  showEmojiPicker = false
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showEmojiToggle && (
        <button
          onClick={onEmojiToggle}
          className={`shrink-0 text-gray-400 hover:text-pink-500 transition-colors ${showEmojiPicker ? 'text-pink-500' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
      )}
      
      {!showEmojiToggle && (
        <Avatar src={userProfile?.avatar} name={userProfile?.username} size="xs" className="w-6 h-6" />
      )}

      <MentionInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        currentUsername={userProfile?.username}
        members={members}
        maxLength={200}
        autoFocus={autoFocus}
      />

      <button
        disabled={!value.trim()}
        onClick={onSubmit}
        className="text-[14px] font-black text-pink-500 hover:text-pink-600 disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0"
      >
        {showEmojiToggle ? "Đăng" : "Gửi"}
      </button>
    </div>
  );
}
