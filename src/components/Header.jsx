import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";

export default function Header({ user, userProfile, onOpenProfile, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { pathname } = useLocation();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-pink-border sticky top-0 z-50">
      <div className="relative w-full px-5 md:px-8 lg:px-14 xl:px-16 mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer no-underline shrink-0">
           <h1 className="text-[20px] font-bold text-deep-red tracking-tight">Wishlist <span className="text-pink-hot inline-block animate-beat">♥</span></h1>
        </Link>

        {/* Desktop Nav - Centered Absolutely */}
        {user && (
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
             <Link to="/" className={`text-sm h-full flex items-center transition-colors border-b-2 ${pathname === '/' ? 'text-pink-brand font-semibold border-pink-brand' : 'text-text-sub font-medium border-transparent hover:text-pink-brand'}`}>Cá nhân</Link>
             <Link to="/groups" className={`text-sm h-full flex items-center transition-colors border-b-2 ${pathname.startsWith('/groups') ? 'text-pink-brand font-semibold border-pink-brand' : 'text-text-sub font-medium border-transparent hover:text-pink-brand'}`}>Nhóm</Link>
          </nav>
        )}

        {/* Desktop User / Auth - Placeholder to balance if needed, but flex-1 would be better */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
           {!user ? (
             <Button variant="outline" size="sm" onClick={() => window.scrollTo(0,0)}>Đăng nhập</Button>
           ) : (
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onOpenProfile}>
                 <Avatar src={userProfile?.avatar} name={userProfile?.username || user.email} size="sm" />
                 <span className="text-sm font-semibold text-text-base">
                   {user.isAnonymous ? "Khách ẩn danh" : (userProfile?.username || user.email?.split("@")[0])}
                 </span>
               </div>
               <div className="w-[1px] h-4 bg-pink-border"></div>
               <button onClick={onLogout} className="text-[13px] font-semibold text-pink-muted hover:text-pink-brand transition-colors">Đăng xuất</button>
             </div>
           )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-text-base p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-pink-border px-5 py-4 flex flex-col gap-4 animate-fade-in absolute w-full shadow-lg">
           {user && (
             <>
               <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium ${pathname === '/' ? 'text-pink-brand font-semibold' : 'text-text-sub'}`}>Cá nhân</Link>
               <Link to="/groups" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium ${pathname.startsWith('/groups') ? 'text-pink-brand font-semibold' : 'text-text-sub'}`}>Nhóm</Link>
               <hr className="border-pink-border border-dashed" />
             </>
           )}
           {!user ? (
             <Button variant="outline" className="w-full justify-center" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập / Đăng ký</Button>
           ) : (
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" onClick={() => { onOpenProfile(); setIsMobileMenuOpen(false); }}>
                  <Avatar src={userProfile?.avatar} name={userProfile?.username || user.email} size="sm" />
                  <span className="text-sm font-semibold text-text-base">
                    {user.isAnonymous ? "Khách ẩn danh" : (userProfile?.username || user.email?.split("@")[0])}
                  </span>
                </div>
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-semibold text-pink-brand px-3 py-1.5 border border-pink-light rounded-lg">Thoát</button>
             </div>
           )}
        </div>
      )}
    </header>
  );
}
