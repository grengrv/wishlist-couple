import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@components/ui/Button";
import Avatar from "@components/ui/Avatar";
import ThemeToggle from "@components/ui/ThemeToggle";
import NotificationBell from "@components/notifications/NotificationBell";
import { useLanguage } from "@context/LanguageContext";

export default function Header({ user, userProfile, onOpenProfile, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("personal"), path: "/personal" },
    { name: t("groups"), path: "/groups" },
  ];

  return (
    <>
      {/* MẸO: Thêm một div trống có chiều cao bằng Header để đẩy nội dung xuống, 
        tránh việc Header che mất nội dung (Hero section). 
      */}
      <div className="h-20 md:h-24 w-full bg-transparent" />

      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isScrolled
          ? "bg-header-bg/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(236,72,153,0.08)] py-2 border-b border-border-primary/20"
          : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-[1440px] px-5 md:px-10 mx-auto">
          <div className="flex items-center justify-between transition-all duration-500">

            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3 no-underline shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white text-2xl font-bold">♥</span>
              </div>
              <h1 className="p-0.5 text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary tracking-tighter">
                Wishifyy
              </h1>
            </Link>

            {/* Desktop Nav - Capsule Style (No Dark Borders) */}
            {user && (
              <nav className="hidden md:flex items-center bg-glass-bg backdrop-blur-sm p-1.5 rounded-2xl border border-border-primary/50 shadow-sm">
                {navLinks.map((link) => {
                  const isActive = link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-8 py-2.5 rounded-xl text-[15px] font-bold transition-all duration-300 ${isActive
                        ? "bg-bg-secondary text-pink-600 shadow-[0_4px_12px_rgba(236,72,153,0.1)] scale-[1.05]"
                        : "text-text-secondary hover:text-pink-500"
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
              <div className="flex items-center bg-glass-bg border border-border-primary/50 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setLang("vi")}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${lang === "vi" ? "bg-pink-hot text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                >
                  VI
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${lang === "en" ? "bg-pink-hot text-white shadow-lg" : "text-text-muted hover:text-text-primary"}`}
                >
                  EN
                </button>
              </div>
              <ThemeToggle />
              {!user ? (
                <div />
              ) : (
                <div className="flex items-center gap-4">
                  
                  {/* Notification Bell */}
                  <NotificationBell user={user} />

                  {/* Profile Section */}
                  <div
                    className="flex items-center gap-4 p-1.5 pr-6 rounded-full bg-glass-bg border border-border-primary/50 hover:border-pink-200 hover:bg-bg-secondary hover:shadow-[0_10px_30px_rgba(233,30,140,0.1)] transition-all duration-500 cursor-pointer group"
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
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 border-[3px] border-bg-secondary rounded-full shadow-sm"
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
                      <span className="text-[16px] font-bold text-text-primary leading-tight">
                        {userProfile?.displayName || userProfile?.username || user.email?.split("@")[0]}
                      </span>
                      {/* Status text */}
                      <span className="text-[11px] text-text-muted font-bold tracking-[1px] uppercase">
                        {t(userProfile?.status || "online")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all duration-300 group"
                    title={t("logout")}
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

          </div>
        </div>
      </header>
    </>
  );
}
