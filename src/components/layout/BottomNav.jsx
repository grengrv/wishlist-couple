import { Link, useLocation } from "react-router-dom";
import NotificationBell from "@components/notifications/NotificationBell";

export default function BottomNav({ user, onOpenProfile }) {
  const { pathname } = useLocation();
  if (!user) return null;

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed bottom nav */}
      <div className="h-20 md:hidden w-full bg-transparent shrink-0" />
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-card-bg/95 backdrop-blur-xl border-t border-border-primary pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all ${pathname === "/" ? "text-pink-hot scale-110" : "text-text-muted hover:text-text-secondary"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={pathname === "/" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </Link>
          
          <Link to="/groups" className={`flex flex-col items-center gap-1 p-2 transition-all ${pathname.startsWith("/groups") ? "text-pink-hot scale-110" : "text-text-muted hover:text-text-secondary"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={pathname.startsWith("/groups") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </Link>
          
          <Link to="/add" className="flex flex-col items-center justify-center p-2 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-hot to-pink-brand rounded-full flex items-center justify-center shadow-lg shadow-pink-hot/30 text-white active:scale-95 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </Link>
          
          <NotificationBell user={user} variant="mobile" />
          
          <button onClick={onOpenProfile} className="flex flex-col items-center gap-1 p-2 text-text-muted hover:text-text-secondary transition-all active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </div>
    </>
  );
}
