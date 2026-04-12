import { useState } from "react";

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mb-12 bg-gradient-about rounded-2xl border-l-[4px] border-pink-light overflow-hidden">
      <button 
        className="w-full px-6 py-5 flex items-center justify-between cursor-pointer focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-pink-brand text-left">Tại sao chúng ta cần một Wishlist?</h3>
        <svg 
          width="20" height="20" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-pink-brand transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Grid animation cho chiều cao linh hoạt */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm leading-[1.7] text-[#555]">
            Trong cuộc sống bộn bề, đôi khi chúng ta dễ dàng quên đi những mong muốn giản đơn 
            giữa hai người. Một danh sách Wishlist sẽ như một hòm thư nhỏ, nơi chúng ta có thể 
            cất giữ những ý tưởng quà tặng, những quán cà phê muốn ghé, hay những vùng đất mới 
            chờ được khám phá. Hãy để đây là nơi nuôi dưỡng tình yêu qua từng mục tiêu chung.
          </p>
        </div>
      </div>
    </section>
  );
}
