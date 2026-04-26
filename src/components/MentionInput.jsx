import { useRef, useEffect } from "react";
import Avatar from "./ui/Avatar";
import { useMentionAutocomplete } from "../hooks/useMentionAutocomplete";
import { useLanguage } from "../context/LanguageContext";

const MAX_TAGS = 5;

export default function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  currentUsername,
  members = [],
  maxLength = 200,
  rows = 1,
  autoFocus = false,
  className = "",
}) {
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const { suggestions, isOpen, insertMention, closeSuggestions, onInputChange } =
    useMentionAutocomplete(value, onChange, currentUsername, members);

  const currentTagCount = () => {
    const matches = value.match(/@(\w+)/g);
    if (!matches) return 0;
    return new Set(matches.map(m => m.toLowerCase())).size;
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (newVal.length > maxLength) return;
    onChange(newVal);
    onInputChange(newVal);
  };

  const handleKeyDown = (e) => {
    if (isOpen) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (suggestions.length > 0) {
          const tagCount = currentTagCount();
          if (tagCount >= MAX_TAGS) { closeSuggestions(); return; }
          insertMention(suggestions[0].username);
        }
        return;
      }
      if (e.key === "Escape") { closeSuggestions(); return; }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && onSubmit) onSubmit();
    }
  };

  const handleSuggestionClick = (username) => {
    const tagCount = currentTagCount();
    if (tagCount >= MAX_TAGS) return;
    insertMention(username);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        textareaRef.current && !textareaRef.current.contains(e.target)
      ) {
        closeSuggestions();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeSuggestions]);

  return (
    <div className="relative flex-1 w-full">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t("add_comment_placeholder")}
        autoFocus={autoFocus}
        className={`w-full bg-transparent outline-none text-[14px] font-medium text-text-primary placeholder:text-text-muted placeholder:font-bold py-1.5 resize-none max-h-32 custom-scrollbar ${className}`}
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 w-full bg-bg-secondary border border-border-primary/60 rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.2)] overflow-hidden z-[200] animate-slide-up mb-1"
        >
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.18em] px-3 pt-2.5 pb-1">
            {t("tag_members")}
          </p>
          {suggestions.map((u) => (
            <button
              key={u.uid}
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(u.username); }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors group"
            >
              <Avatar src={u.avatar} name={u.username} size="sm" className="w-7 h-7 shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-black text-text-primary group-hover:text-pink-hot transition-colors">
                  @{u.username}
                </span>
                {u.displayName && u.displayName !== u.username && (
                  <span className="text-[10px] text-text-muted font-bold truncate">{u.displayName}</span>
                )}
              </div>
            </button>
          ))}
          {currentTagCount() >= MAX_TAGS && (
            <p className="text-[10px] text-pink-hot font-bold px-3 pb-2 pt-1">
              {t("max_tags_error", { count: MAX_TAGS })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
