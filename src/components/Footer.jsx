/**
 * Footer Component
 * Chân trang với phong cách lãng mạn, hiện đại
 */
export default function Footer() {
  return (
    <footer className="relative bg-bg-secondary/50 backdrop-blur-md border-t border-border-primary/50 py-16 mt-20 overflow-hidden">
      {/* Các đốm màu trang trí phía sau (Glow effect) */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-100/10 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-100/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row justify-between gap-12 transition-all duration-500">

        {/* Brand Section */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 mb-4 group cursor-default">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-white text-sm">♥</span>
            </div>
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary tracking-tight">
              Wishifyy
            </h2>
          </div>
          <p className="text-[15px] text-text-muted leading-relaxed font-medium">
            Nơi ghi giữ những điều mơ ước, cùng nhau chinh phục từng mục tiêu nhỏ để tạo nên một hành trình hạnh phúc lớn lao.
          </p>
        </div>

        {/* Links Groups */}
        <div className="flex flex-wrap gap-12 md:gap-24">
          <div>
            <h3 className="text-xs uppercase tracking-[2px] font-black text-text-muted mb-6">Chuyên mục</h3>
            <ul className="flex flex-col gap-4">
              {['Trang chủ', 'Khám phá', 'Hỗ trợ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[15px] font-bold text-text-secondary hover:text-pink-500 transition-all flex items-center group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-pink-400 mr-0 group-hover:mr-2 transition-all"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[2px] font-black text-text-muted mb-6">Pháp lý</h3>
            <ul className="flex flex-col gap-4">
              {['Điều khoản', 'Bảo mật'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[15px] font-bold text-text-secondary hover:text-pink-500 transition-all flex items-center group">
                    <span className="w-0 group-hover:w-2 h-[2px] bg-pink-400 mr-0 group-hover:mr-2 transition-all"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Social */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full mt-16 pt-8 border-t border-border-primary/50 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500">
        <p className="text-sm font-bold text-text-muted">
          &copy; {new Date().getFullYear()} <span className="text-pink-400/80">Wishlist Couple</span>. Crafted with ♥
        </p>

        <div className="flex items-center gap-2">
          {/* Social Buttons - Dạng Circle Soft */}
          {[
            { id: 'fb', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
            { id: 'tw', path: 'M4 4l11.733 16h4.267l-11.733 -16z M4 20l6.768 -6.768' },
            { id: 'ins', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }
          ].map((social) => (
            <a
              key={social.id}
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-primary text-text-muted hover:bg-pink-500/10 hover:text-pink-500 hover:-translate-y-1 transition-all duration-300 border border-border-primary/50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={social.path}></path>
                {social.id === 'ins' && <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}