import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";

export default function Header({ user, userProfile, onOpenProfile, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Cá nhân", path: "/personal" },
    { name: "Nhóm", path: "/groups" },
  ];

  return (
    <>
      {/* MẸO: Thêm một div trống có chiều cao bằng Header để đẩy nội dung xuống, 
        tránh việc Header che mất nội dung (Hero section). 
      */}
      <div className="h-20 md:h-24 w-full bg-transparent" />

      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(236,72,153,0.08)] py-2"
          : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-[1440px] px-5 md:px-10 mx-auto">
          <div className="flex items-center justify-between transition-all duration-500">

            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3 no-underline shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white text-2xl font-bold">♥</span>
              </div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tighter">
                Wishlist
              </h1>
            </Link>

            {/* Desktop Nav - Capsule Style (No Dark Borders) */}
            {user && (
              <nav className="hidden md:flex items-center bg-white/40 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 shadow-sm">
                {navLinks.map((link) => {
                  const isActive = link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-8 py-2.5 rounded-xl text-[15px] font-bold transition-all duration-300 ${isActive
                        ? "bg-white text-pink-600 shadow-[0_4px_12px_rgba(236,72,153,0.1)] scale-[1.05]"
                        : "text-gray-500 hover:text-pink-500"
                        }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-5">
              {!user ? (
                <Button
                >
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Cải tiến Profile: To hơn, lãng mạn hơn */}
                  <div
                    className="flex items-center gap-4 p-1.5 pr-6 rounded-full bg-white/50 border border-white/80 hover:border-pink-200 hover:bg-white hover:shadow-[0_10px_30px_rgba(236,72,153,0.1)] transition-all duration-500 cursor-pointer group"
                    onClick={onOpenProfile}
                  >
                    {/* Avatar Section - Phóng lớn hơn nữa */}
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={userProfile?.avatar}
                        name={userProfile?.displayName || userProfile?.username || user.email}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full ring-2 ring-pink-100/50 transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Dot Status */}
                      <span
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-white rounded-full shadow-sm"
                        style={{
                          backgroundColor:
                            userProfile?.status === 'idle' ? '#fbbf24' :
                              userProfile?.status === 'dnd' ? '#f43f5e' :
                                userProfile?.status === 'offline' ? '#9ca3af' : '#34d399'
                        }}
                      ></span>
                    </div>

                    {/* Text Section - Căn chỉnh lại để không đè nhau */}
                    <div className="flex flex-col justify-center gap-0.5">
                      <span className="text-[16px] font-bold text-gray-800 leading-tight">
                        {user.isAnonymous ? "Khách ẩn danh" : (userProfile?.displayName || userProfile?.username || user.email?.split("@")[0])}
                      </span>
                      {/* Status text */}
                      <span className="text-[11px] text-gray-500 font-bold tracking-[1px] uppercase">
                        {userProfile?.status || "online"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
                    title="Đăng xuất"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-6 h-5">
                <span className={`absolute h-0.5 w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 top-2" : "top-0"}`} />
                <span className={`absolute h-0.5 w-full bg-current rounded-full top-2 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute h-0.5 w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 top-2" : "top-4"}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Glass Style */}
        <div className={`md:hidden absolute top-[calc(100%+12px)] left-5 right-5 transition-all duration-500 ease-[cubic-bezier(0.17,0.67,0.83,0.67)] origin-top ${isMobileMenuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}>
          <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_20px_60px_rgba(236,72,153,0.15)] p-6">
            {user && (
              <div className="space-y-2 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl font-black transition-all ${pathname === link.path
                      ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg"
                      : "text-gray-600 hover:bg-pink-50"
                      }`}
                  >
                    {link.name}
                    <span>→</span>
                  </Link>
                ))}
              </div>
            )}

            {user ? (
              <div className="flex items-center justify-between bg-pink-50/50 p-4 rounded-[24px] border border-pink-100">
                <div className="flex items-center gap-4" onClick={() => { onOpenProfile(); setIsMobileMenuOpen(false); }}>
                  <Avatar src={userProfile?.avatar} name={userProfile?.username} size="md" className="w-12 h-12 shadow-md ring-2 ring-white" />
                  <span className="font-black text-gray-800">{userProfile?.username || "Tài khoản"}</span>
                </div>
                <button onClick={onLogout} className="text-rose-500 font-black p-2 bg-white rounded-xl shadow-sm">Thoát</button>
              </div>
            ) : (
              <Button className="w-full py-5 rounded-2xl bg-pink-500 text-white font-black shadow-xl">Đăng nhập ngay</Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}