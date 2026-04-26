import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@hooks/useNotifications.jsx";
import NotificationDropdown from "@components/notifications/NotificationDropdown";

export default function NotificationBell({ user, variant = "desktop" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { groupedNotifications, unreadCount, markAsRead, markAllAsRead, isMuted, setIsMuted } = useNotifications(user);
  const bellRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${variant === "mobile" ? "flex flex-col items-center justify-center" : ""}`} ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={variant === "mobile" ? `
          relative flex flex-col items-center gap-1 p-2 transition-all 
          ${isOpen ? 'text-pink-hot scale-110' : 'text-text-muted hover:text-text-secondary'}
        ` : `
          relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isOpen ? 'bg-pink-hot/10 text-pink-hot' : 'bg-glass-bg text-text-muted hover:text-text-primary hover:bg-white/5'}
        `}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span className={`absolute ${variant === "mobile" ? "top-1 right-2" : "top-2 right-2"} w-3 h-3 bg-pink-hot border-2 border-bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(233,30,140,0.5)]`}></span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          notifications={groupedNotifications}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
