import { useState } from "react";

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mb-12 relative overflow-hidden bg-bg-secondary/60 backdrop-blur-xl rounded-3xl border border-border-primary shadow-sm transition-all duration-300 hover:shadow-md group">
      {/* Lớp nền gradient mờ ảo (Soft background blur) */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 pointer-events-none" />

      <button
        className="relative w-full px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between cursor-pointer focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          {/* Icon trái tim có hiệu ứng scale khi hover */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-primary text-pink-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-500/10">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Tiêu đề dùng gradient text */}
          <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400 text-left">
            Tại sao chúng ta cần một Wishlist?
          </h3>
        </div>

        {/* Nút mũi tên có background bao quanh */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${isOpen ? 'bg-bg-primary' : 'bg-transparent group-hover:bg-bg-primary'}`}>
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`text-pink-500 transition-transform duration-500 ease-in-out shrink-0 ${isOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>

      {/* Animation grid mở rộng + Text trượt xuống (Translate) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
            {/* Thanh line dọc bên trái giúp text gọn gàng hơn */}
            <p
              className={`text-[15px] sm:text-base leading-relaxed text-text-secondary border-l-[3px] border-border-primary pl-4 sm:pl-5 transition-all duration-500 delay-75 transform ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
            >
              Trong cuộc sống bộn bề, đôi khi chúng ta dễ dàng quên đi những mong muốn giản đơn giữa hai người. Một danh sách <strong>Wishlist</strong> sẽ như một <em>hòm thư nhỏ</em>, nơi cất giữ những ý tưởng quà tặng, những quán cà phê muốn ghé, hay những vùng đất mới chờ được khám phá.
              <br /><br />
              <span className="text-pink-600 font-medium tracking-wide">
                Hãy để đây là nơi nuôi dưỡng tình yêu qua từng mục tiêu chung. ✨
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}