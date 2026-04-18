import AboutSection from "../components/AboutSection";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="py-10 mx-auto w-full transition-all duration-500 flex flex-col gap-20 relative overflow-hidden">

      {/* Background Glow trang trí (Làm mờ không gian) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-rose-300/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      {/* Hero Section - Hiện đại và Cân bằng hơn */}
      <section className="relative flex flex-col md:flex-row items-center gap-12 md:gap-16 animate-fade-in group z-10">

        {/* Cột Văn bản */}
        <div className="flex-1 text-center md:text-left order-2 md:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50/80 border border-pink-100 rounded-full text-pink-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span>✨</span> Our Shared Dreams
          </div>

          <h2 className="text-[40px] md:text-[56px] font-black text-gray-800 leading-[1.1] tracking-tight mb-6">
            Mơ ước chung, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
              Hạnh phúc riêng.
            </span>
          </h2>

          <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-[480px] mb-10 mx-auto md:mx-0">
            Không gian tuyệt vời để chúng mình cùng nhau lưu giữ từng tâm tư, nguyện vọng và biến những dự định nhỏ bé thành hiện thực ngọt ngào.
          </p>

          {/* Sửa lại UX: Một nút Primary, một nút Secondary */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate("/personal")}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgb(236,72,153,0.45)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              Bắt đầu ngay
            </button>
            <button
              onClick={() => navigate("/groups")}
              className="px-8 py-4 bg-white text-pink-500 font-bold rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50 active:scale-[0.97] transition-all duration-300 cursor-pointer"
            >
              Khám phá Nhóm
            </button>
          </div>
        </div>

        {/* Cột Hình ảnh - Thêm hiệu ứng lơ lửng và Frame sáng tạo */}
        <div className="w-full md:w-[50%] relative order-1 md:order-2">
          {/* Khung trang trí phía sau ảnh */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-rose-100 rounded-[40px] transform rotate-3 scale-105 opacity-50 transition-transform duration-700 group-hover:rotate-6"></div>

          <div className="relative rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(236,72,153,0.15)] aspect-[4/3] bg-white border-4 border-white">
            <img
              src="/home-header.png"
              alt="Home Header"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Lớp phủ mờ giúp ảnh deep hơn */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent pointer-events-none mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* Dashboard Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 z-10">

        {/* Card Cá nhân */}
        <div
          onClick={() => navigate("/personal")}
          className="group p-8 bg-white border border-gray-100 rounded-[32px] cursor-pointer hover:border-pink-300 hover:shadow-[0_15px_40px_rgb(236,72,153,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
        >
          {/* Lớp nền hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 to-pink-50/0 group-hover:from-pink-50/50 group-hover:to-transparent transition-colors duration-500"></div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-pink-100/60 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:bg-pink-100 transition-colors duration-300 shadow-sm">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">Không gian Cá nhân</h3>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-6 line-clamp-2">Nơi lưu giữ những mong muốn thầm kín và mục tiêu riêng của chúng mình.</p>

            <div className="flex items-center text-sm font-bold text-pink-500">
              Truy cập ngay
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-2">→</span>
            </div>
          </div>
        </div>

        {/* Card Nhóm */}
        <div
          onClick={() => navigate("/groups")}
          className="group p-8 bg-white border border-gray-100 rounded-[32px] cursor-pointer hover:border-rose-300 hover:shadow-[0_15px_40px_rgb(244,63,94,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 to-rose-50/0 group-hover:from-rose-50/50 group-hover:to-transparent transition-colors duration-500"></div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:bg-rose-100 transition-colors duration-300 shadow-sm">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-rose-500 transition-colors">Nhóm & Team</h3>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-6 line-clamp-2">Cùng nhau lập kế hoạch và chinh phục các thử thách đồng đội một cách dễ dàng.</p>

            <div className="flex items-center text-sm font-bold text-rose-500">
              Vào sảnh Nhóm
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-2">→</span>
            </div>
          </div>
        </div>
      </div>

      <AboutSection />
    </div>
  );
}