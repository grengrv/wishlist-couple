import AboutSection from "../components/AboutSection";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="py-10 mx-auto w-full transition-all duration-500 flex flex-col gap-16">
      {/* Hero Section - Balanced Asymmetrical Layout */}
      <section className="relative flex flex-col md:flex-row items-center gap-10 md:gap-14 animate-fade-in group">
        {/* Cột Văn bản (60%) */}
        <div className="flex-1 text-center md:text-left order-2 md:order-1">
          <div className="inline-block px-4 py-1.5 bg-pink-pale rounded-full text-pink-brand text-[11px] font-bold uppercase tracking-widest mb-4">
            Our Shared Dreams
          </div>
          <h2 className="text-[38px] md:text-[52px] font-black text-text-base leading-[1.05] tracking-[-1.5px] mb-5">
            Mơ ước chung, <br /> 
            <span className="text-pink-brand">Hạnh phúc riêng.</span>
          </h2>
          <p className="text-[17px] text-text-sub leading-relaxed max-w-[480px] mb-9 mx-auto md:mx-0 opacity-90">
            Không gian tuyệt vời để chúng mình cùng nhau lưu giữ từng tâm tư, nguyện vọng và biến những dự định nhỏ bé thành hiện thực ngọt ngào.
          </p>
          <div className="flex items-center justify-center md:justify-start">
            <button 
              onClick={() => navigate("/personal")}
              className="px-10 py-4.5 bg-gradient-brand text-white font-bold rounded-[22px] shadow-xl shadow-pink-brand/20 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            >
              ✦ Khám phá ngay
            </button>
          </div>
        </div>

        {/* Cột Hình ảnh (48% - Khớp hoàn toàn tỷ lệ ảnh) */}
        <div className="w-full md:w-[48%] relative order-1 md:order-2">
          <div className="relative rounded-[40px] overflow-hidden shadow-[0_25px_60px_rgba(194,24,91,0.18)] aspect-video">
            <img 
              src="/home-header.png" 
              alt="Home Header" 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-1000"
            />
            {/* Soft highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-brand/5 to-transparent pointer-events-none z-20"></div>
          </div>
        </div>
      </section>

      {/* Dashboard Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
        {/* Card Cá nhân */}
        <div 
          onClick={() => navigate("/personal")}
          className="group p-8 bg-white border border-pink-border rounded-[32px] cursor-pointer hover:border-pink-brand hover:shadow-xl transition-all duration-500 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-faint/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center text-pink-brand mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="text-2xl font-black text-text-base mb-2">Không gian Cá nhân</h3>
            <p className="text-text-sub text-sm leading-relaxed mb-6">Nơi lưu giữ những mong muốn thầm kín và mục tiêu riêng của chúng mình.</p>
            <span className="text-sm font-bold text-pink-brand border-b-2 border-pink-pale group-hover:border-pink-brand transition-all pb-1">Truy cập ngay →</span>
          </div>
        </div>

        {/* Card Nhóm */}
        <div 
          onClick={() => navigate("/groups")}
          className="group p-8 bg-white border border-pink-border rounded-[32px] cursor-pointer hover:border-pink-brand hover:shadow-xl transition-all duration-500 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-faint/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center text-pink-brand mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-2xl font-black text-text-base mb-2">Nhóm & Team</h3>
            <p className="text-text-sub text-sm leading-relaxed mb-6">Cùng nhau lập kế hoạch và chinh phục các thử thách đồng đội.</p>
            <span className="text-sm font-bold text-pink-brand border-b-2 border-pink-pale group-hover:border-pink-brand transition-all pb-1">Vào sảnh Nhóm →</span>
          </div>
        </div>
      </div>

      <AboutSection />
    </div>
  );
}
