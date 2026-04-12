/**
 * Footer Component
 * Chân trang với lời chào kết thúc lãng mạn
 */
export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-border py-10 mt-12">
      <div className="max-w-[1600px] mx-auto px-[5%] md:px-[10%] w-full flex flex-col md:flex-row justify-between gap-8 transition-all duration-500">
        
        {/* Brand */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-deep-red mb-2">Wishlist ♥</h2>
          <p className="text-sm text-text-sub leading-[1.6]">
            Nơi ghi giữ những điều mơ ước, cùng nhau chinh phục từng mục tiêu nhỏ trong cuộc sống.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex gap-10">
          <div>
            <h3 className="font-semibold text-text-base mb-3 text-sm">Chuyên mục</h3>
            <ul className="flex flex-col gap-2 text-sm text-text-sub">
              <li><a href="#" className="hover:text-pink-brand transition-colors">Trang chủ</a></li>
              <li><a href="#" className="hover:text-pink-brand transition-colors">Khám phá</a></li>
              <li><a href="#" className="hover:text-pink-brand transition-colors">Hỗ trợ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-base mb-3 text-sm">Pháp lý</h3>
            <ul className="flex flex-col gap-2 text-sm text-text-sub">
              <li><a href="#" className="hover:text-pink-brand transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-pink-brand transition-colors">Bảo mật</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Social */}
      <div className="max-w-[1600px] mx-auto px-[5%] md:px-[10%] w-full mt-8 pt-6 border-t border-dashed border-pink-border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-500">
        <p className="text-xs text-text-footer">
          &copy; {new Date().getFullYear()} Wishlist Couple. Made with ♥
        </p>
        <div className="flex items-center gap-3 text-text-footer">
          {/* Facebook Icon */}
          <a href="#" className="hover:text-pink-brand transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          {/* Twitter Icon */}
          <a href="#" className="hover:text-pink-brand transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
          </a>
          {/* Insta Icon */}
          <a href="#" className="hover:text-pink-brand transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
