import AboutSection from "@components/common/AboutSection";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@context/LanguageContext";
import { useEffect, useRef, useState } from "react";

// SVG hoàn toàn mới: Wishlist / gift floating illustration
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff1f2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="100%" stopColor="#fff1f2" />
        </linearGradient>
        <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
        <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#f9a8d4" floodOpacity="0.25" />
        </filter>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#fbcfe8" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse cx="240" cy="200" rx="220" ry="180" fill="url(#bgGlow)" />

      {/* Floating dots decoration */}
      <circle cx="60" cy="80" r="5" fill="#fda4af" opacity="0.5" />
      <circle cx="420" cy="60" r="7" fill="#f9a8d4" opacity="0.4" />
      <circle cx="440" cy="320" r="4" fill="#fb7185" opacity="0.35" />
      <circle cx="30" cy="300" r="6" fill="#f472b6" opacity="0.3" />
      <circle cx="380" cy="380" r="5" fill="#ec4899" opacity="0.3" />

      {/* Main wishlist card */}
      <g filter="url(#softShadow)">
        <rect x="80" y="60" width="280" height="280" rx="28" fill="url(#cardGrad1)" />
        <rect x="80" y="60" width="280" height="280" rx="28" stroke="#fce7f3" strokeWidth="1.5" />
      </g>

      {/* Card header bar */}
      <rect x="80" y="60" width="280" height="56" rx="28" fill="url(#btnGrad)" />
      <rect x="80" y="88" width="280" height="28" fill="url(#btnGrad)" />

      {/* Header text label */}
      <rect x="108" y="80" width="90" height="16" rx="8" fill="white" opacity="0.3" />
      <rect x="108" y="80" width="56" height="16" rx="8" fill="white" opacity="0.5" />

      {/* 3 dots on header right */}
      <circle cx="330" cy="88" r="4" fill="white" opacity="0.6" />
      <circle cx="318" cy="88" r="4" fill="white" opacity="0.4" />
      <circle cx="342" cy="88" r="4" fill="white" opacity="0.6" />

      {/* Wish item rows */}
      {/* Row 1 */}
      <g>
        <rect x="100" y="136" width="240" height="52" rx="14" fill="white" opacity="0.85" />
        {/* Checkbox checked */}
        <rect x="116" y="152" width="20" height="20" rx="6" fill="url(#btnGrad)" />
        <polyline points="120,162 124,167 132,157" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Item text */}
        <rect x="148" y="154" width="100" height="8" rx="4" fill="#f9a8d4" opacity="0.7" />
        <rect x="148" y="166" width="68" height="6" rx="3" fill="#fce7f3" />
        {/* Heart */}
        <path d="M318 162 C318 159 315 156 312 158 C309 156 306 159 306 162 C306 166 312 170 312 170 C312 170 318 166 318 162Z" fill="#fb7185" />
      </g>

      {/* Row 2 */}
      <g>
        <rect x="100" y="198" width="240" height="52" rx="14" fill="white" opacity="0.85" />
        <rect x="116" y="214" width="20" height="20" rx="6" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1.5" />
        <rect x="148" y="216" width="120" height="8" rx="4" fill="#fbcfe8" opacity="0.8" />
        <rect x="148" y="228" width="80" height="6" rx="3" fill="#fce7f3" />
        <path d="M318 224 C318 221 315 218 312 220 C309 218 306 221 306 224 C306 228 312 232 312 232 C312 232 318 228 318 224Z" fill="#fda4af" opacity="0.6" />
      </g>

      {/* Row 3 */}
      <g>
        <rect x="100" y="260" width="240" height="52" rx="14" fill="white" opacity="0.85" />
        <rect x="116" y="276" width="20" height="20" rx="6" fill="url(#btnGrad)" />
        <polyline points="120,286 124,291 132,281" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="148" y="278" width="88" height="8" rx="4" fill="#f9a8d4" opacity="0.7" />
        <rect x="148" y="290" width="60" height="6" rx="3" fill="#fce7f3" />
        <path d="M318 286 C318 283 315 280 312 282 C309 280 306 283 306 286 C306 290 312 294 312 294 C312 294 318 290 318 286Z" fill="#fb7185" />
      </g>

      {/* Floating gift box - top right */}
      <g filter="url(#cardShadow)" style={{ animation: "float1 3.5s ease-in-out infinite" }}>
        <rect x="348" y="40" width="80" height="72" rx="12" fill="url(#cardGrad2)" stroke="#fce7f3" strokeWidth="1" />
        {/* Gift ribbon horizontal */}
        <rect x="348" y="68" width="80" height="12" rx="4" fill="url(#btnGrad)" opacity="0.85" />
        {/* Gift ribbon vertical */}
        <rect x="382" y="40" width="12" height="72" rx="4" fill="url(#btnGrad)" opacity="0.85" />
        {/* Bow left loop */}
        <ellipse cx="375" cy="42" rx="10" ry="7" fill="#f472b6" opacity="0.9" transform="rotate(-20 375 42)" />
        {/* Bow right loop */}
        <ellipse cx="403" cy="42" rx="10" ry="7" fill="#f472b6" opacity="0.9" transform="rotate(20 403 42)" />
        {/* Bow center */}
        <circle cx="388" cy="44" r="6" fill="#ec4899" />
        {/* Stars on gift */}
        <path d="M362 82 L363.2 85.6 L367 85.6 L364 87.8 L365.2 91.4 L362 89.2 L358.8 91.4 L360 87.8 L357 85.6 L360.8 85.6 Z" fill="#f9a8d4" opacity="0.6" />
      </g>

      {/* Floating mini heart - top left */}
      <g style={{ animation: "float2 2.8s ease-in-out infinite" }}>
        <circle cx="56" cy="150" r="28" fill="white" filter="url(#cardShadow)" opacity="0.95" />
        <path d="M56 163 C56 163 42 154 42 145 C42 140 46 136 50 137 C52 137 54 139 56 141 C58 139 60 137 62 137 C66 136 70 140 70 145 C70 154 56 163 56 163Z" fill="url(#heartGrad)" />
      </g>

      {/* Floating star badge - bottom left */}
      <g filter="url(#cardShadow)" style={{ animation: "float3 4s ease-in-out infinite" }}>
        <rect x="20" y="220" width="64" height="64" rx="18" fill="white" />
        <rect x="20" y="220" width="64" height="64" rx="18" stroke="#fce7f3" strokeWidth="1" />
        {/* Star */}
        <path d="M52 236 L54.8 244 L63 244 L56.5 249 L59 257 L52 252 L45 257 L47.5 249 L41 244 L49.2 244 Z" fill="#f9a8d4" />
        <text x="52" y="276" textAnchor="middle" fontSize="9" fill="#ec4899" fontWeight="700">NEW</text>
      </g>

      {/* Floating share badge - bottom right */}
      <g filter="url(#cardShadow)" style={{ animation: "float1 3s ease-in-out infinite 0.5s" }}>
        <rect x="390" y="300" width="72" height="72" rx="18" fill="white" />
        <rect x="390" y="300" width="72" height="72" rx="18" stroke="#fce7f3" strokeWidth="1" />
        {/* Share / group icon */}
        <circle cx="416" cy="322" r="6" fill="#fb7185" />
        <circle cx="436" cy="314" r="6" fill="#f472b6" />
        <circle cx="436" cy="334" r="6" fill="#f472b6" />
        <line x1="422" y1="320" x2="430" y2="316" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" />
        <line x1="422" y1="326" x2="430" y2="332" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" />
        <text x="426" y="356" textAnchor="middle" fontSize="9" fill="#ec4899" fontWeight="700">SHARE</text>
      </g>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </svg>
  );
}

// ------------------------------------------------------------------
// Subcomponents for effects
// ------------------------------------------------------------------

function RippleButton({ children, onClick, className }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 ${className}`}>
      {ripples.map(r => (
        <span 
          key={r.id} 
          className="ripple-effect"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {children}
    </button>
  );
}

function TiltCard({ children, onClick, className }) {
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      style={tiltStyle}
    >
      {children}
    </div>
  );
}

function AnimatedStepCard({ item, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (observer) observer.disconnect();
    }
  }, []);

  return (
    <div 
      ref={ref}
      className={`relative p-6 bg-card-bg border border-border-primary rounded-2xl hover:border-pink-300 hover:shadow-lg transition-all duration-300 group/step ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="absolute top-4 right-5 text-[11px] font-black text-border-primary/50 group-hover/step:text-pink-200 transition-colors" style={{ fontSize: "36px", lineHeight: 1 }}>
        {item.step}
      </div>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-5 border border-pink-100 group-hover/step:border-pink-300 transition-colors">
          {item.icon}
        </div>
        <h4 className="font-bold text-text-primary mb-2 text-lg">{item.title}</h4>
        <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

const testimonials = [
  { name: "Minh Anh", quote: "Giao diện siêu mượt!", avatar: "M", color: "from-pink-100 to-rose-100 text-pink-600" },
  { name: "Hoàng T.", quote: "Rất tiện lợi luôn", avatar: "H", color: "from-blue-100 to-cyan-100 text-blue-600" },
  { name: "Linh C.", quote: "Dễ thương xỉu 🥰", avatar: "L", color: "from-purple-100 to-fuchsia-100 text-purple-600" },
  { name: "Khang", quote: "Trải nghiệm tuyệt vời", avatar: "K", color: "from-emerald-100 to-teal-100 text-emerald-600" },
  { name: "Bảo Ngọc", quote: "Quá hữu ích cho cặp đôi", avatar: "B", color: "from-amber-100 to-orange-100 text-amber-600" },
  { name: "Thanh T.", quote: "Dùng thích lắm", avatar: "T", color: "from-rose-100 to-red-100 text-rose-600" },
];

function TestimonialTicker() {
  const row1 = [...testimonials, ...testimonials, ...testimonials];
  const row2 = [...testimonials.reverse(), ...testimonials, ...testimonials];

  return (
    <div className="w-full overflow-hidden py-16 relative">
      {/* Edge gradients for smooth fade */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-primary to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-primary to-transparent z-10" />
      
      <div className="flex flex-col gap-5">
        <div className="animate-marquee flex gap-5 w-max">
          {row1.map((t, i) => <TestimonialCard key={`r1-${i}`} {...t} />)}
        </div>
        <div className="animate-marquee-reverse flex gap-5 w-max">
          {row2.map((t, i) => <TestimonialCard key={`r2-${i}`} {...t} />)}
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ name, quote, avatar, color }) {
  return (
    <div className="flex items-center gap-3 bg-card-bg px-6 py-4 rounded-full border border-border-primary shadow-sm hover:border-pink-200 hover:shadow-md transition-all cursor-default shrink-0 group/testi">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-sm shadow-inner group-hover/testi:scale-110 transition-transform duration-300`}>
        {avatar}
      </div>
      <div>
        <p className="text-sm font-bold text-text-primary mb-0.5">{quote}</p>
        <p className="text-xs text-text-secondary">{name}</p>
      </div>
    </div>
  )
}

function FAB({ t }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
      <RippleButton 
        onClick={() => navigate("/personal")}
        className="group flex items-center h-14 bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 rounded-full hover:scale-105 active:scale-95 transition-all"
        title={t("add_wish") || "Thêm điều ước"}
      >
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div className="overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <span className="whitespace-nowrap pr-6 font-bold text-sm tracking-wide">
            {t("add_wish") || "Thêm mới"}
          </span>
        </div>
      </RippleButton>
    </div>
  )
}

function LiveActivityToast({ t }) {
  const activities = [
    { text: "Minh Anh vừa tạo 1 nhóm mới", icon: "✦", color: "text-pink-600", bg: "bg-pink-100" },
    { text: "Hoàng T. vừa hoàn thành 'Đi Đà Lạt'", icon: "✈️", color: "text-sky-600", bg: "bg-sky-100" },
    { text: "Linh C. vừa ghim 1 điều ước", icon: "📌", color: "text-rose-600", bg: "bg-rose-100" },
    { text: "Khang vừa thêm 1 điều ước mới", icon: "🎁", color: "text-purple-600", bg: "bg-purple-100" },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const cycle = () => {
      if (!isMounted) return;
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setCurrentIndex(prev => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 600);
    };

    timeoutId = setTimeout(() => {
      if (!isMounted) return;
      setIsVisible(true);
    }, 2500);

    const interval = setInterval(cycle, 5500);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const current = activities[currentIndex];

  return (
    <div className={`fixed bottom-6 left-6 z-40 transition-all duration-[600ms] pointer-events-none hidden md:block ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-bg-secondary/90 backdrop-blur-md border border-border-primary shadow-xl shadow-pink-500/5 rounded-full px-4 py-2.5 flex items-center gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] shadow-inner ${current.bg} ${current.color}`}>
          {current.icon}
        </div>
        <p className="text-[13px] font-bold text-text-primary pr-2 tracking-wide">
          {current.text}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="py-10 w-full transition-all duration-500 flex flex-col gap-24 relative overflow-hidden pb-32">
      
      {/* ── FAB ── */}
      <FAB t={t} />
      
      {/* ── Live Activity Toast ── */}
      <LiveActivityToast t={t} />

      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-100/60 to-rose-50/40 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-50/50 to-fuchsia-50/30 blur-3xl animate-blob" style={{ animationDelay: "-10s" }} />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col md:flex-row items-center gap-10 md:gap-16 z-10 min-h-[70vh] max-w-[1200px] mx-auto px-6 md:px-8 w-full">

        {/* Text column */}
        <div className="flex-1 text-center md:text-left order-2 md:order-1 flex flex-col justify-center">

          {/* Pill badge (Entrance: 0ms) */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 border border-pink-100 rounded-full text-pink-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm self-center md:self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            {t("home_hero_tag")}
          </div>

          {/* Headline (Entrance: 100ms) */}
          <h1 className="animate-fade-in-up [animation-delay:100ms] opacity-0 text-[38px] md:text-[54px] lg:text-[64px] font-black text-text-primary leading-[1.1] tracking-tight mb-5">
            {t("home_hero_title").includes(", ") ? (
              <>
                {t("home_hero_title").split(", ")[0]},<br />
                <span className="bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500">
                  {t("home_hero_title").split(", ")[1]}
                </span>
              </>
            ) : (
              <span className="bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500">
                {t("home_hero_title")}
              </span>
            )}
          </h1>

          {/* Subtitle (Entrance: 200ms) */}
          <p className="animate-fade-in-up [animation-delay:200ms] opacity-0 text-base md:text-lg text-text-secondary leading-relaxed max-w-[460px] mb-8 mx-auto md:mx-0">
            {t("home_hero_subtitle")}
          </p>

          {/* CTA buttons (Entrance: 300ms) */}
          <div className="animate-fade-in-up [animation-delay:300ms] opacity-0 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <RippleButton
              onClick={() => navigate("/personal")}
              className="group/btn relative px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(236,72,153,0.28)] hover:shadow-[0_12px_28px_rgb(236,72,153,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t("start_now")}
                <span className="group-hover/btn:translate-x-1 transition-transform duration-300">✦</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-300 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </RippleButton>

            <button
              onClick={() => navigate("/groups")}
              className="px-8 py-3.5 bg-transparent text-pink-500 font-bold rounded-2xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50/60 active:scale-[0.97] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
            >
              {t("explore_groups")}
            </button>
          </div>
        </div>

        {/* Illustration column (Entrance: 400ms) */}
        <div className="animate-scale-in [animation-delay:400ms] opacity-0 w-full md:w-[48%] relative order-1 md:order-2 flex items-center justify-center">
          {/* Soft Aurora radial glow instead of dashed rings */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-pink-300/30 blur-3xl animate-pulse" />
          <div className="absolute w-[240px] h-[240px] rounded-full bg-rose-400/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="relative z-10 w-full max-w-[440px] mx-auto drop-shadow-2xl">
            <HeroIllustration />
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 animate-bounce opacity-60 hidden md:block">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* ── Trust / Stats Bar ── */}
      <div className="flex flex-wrap justify-center gap-10 md:gap-24 py-8 border-y border-border-primary/50 max-w-[1000px] mx-auto w-full px-6 opacity-90 z-10 -mt-10 mb-6 bg-gradient-to-r from-transparent via-bg-secondary/30 to-transparent">
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-pink-500 to-rose-400 drop-shadow-sm">10K+</span>
          <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">{t("items") || "Điều ước"}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-sky-400 drop-shadow-sm">5K+</span>
          <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">{t("couples") || "Cặp đôi"}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-orange-400 drop-shadow-sm">4.9/5</span>
          <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">{t("rating") || "Đánh giá"}</span>
        </div>
      </div>

      {/* ── Quick Access Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 max-w-[1200px] mx-auto px-6 md:px-8 w-full">
        {/* Personal card */}
        <TiltCard
          onClick={() => navigate("/personal")}
          className="group relative p-8 bg-card-bg border border-border-primary rounded-[32px] cursor-pointer hover:border-pink-200 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-pattern-hover"
        >
          {/* Animated bg gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 via-pink-50/0 to-pink-100/0 group-hover:from-pink-50/80 group-hover:to-transparent transition-all duration-500 rounded-[32px] z-0" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/50 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700 z-0" />

          {/* Mini Preview Mock */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-x-8 group-hover:translate-x-0 z-10">
            <div className="w-28 h-7 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/60 relative overflow-hidden"><div className="absolute left-2 top-2 w-4 h-3 bg-pink-100 rounded-sm"></div></div>
            <div className="w-24 h-7 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/60 relative overflow-hidden"><div className="absolute left-2 top-2 w-4 h-3 bg-pink-100 rounded-sm"></div></div>
            <div className="w-32 h-7 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/60 relative overflow-hidden"><div className="absolute left-2 top-2 w-4 h-3 bg-pink-100 rounded-sm"></div></div>
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-pink-100/50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <path d="M16 3.5 Q18 5 16.5 7" strokeWidth="1.5" opacity="0.5" />
              </svg>
            </div>

            {/* Label pill + Count Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 rounded-full text-pink-500 text-[11px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                {t("personal_label") || "Cá nhân"}
              </div>
              <div className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary text-[11px] font-bold border border-border-primary/50">
                12 {t("items") || "Wishes"}
              </div>
            </div>

            <h3 className="text-2xl font-black text-text-primary mb-3 group-hover:text-pink-600 transition-colors duration-300">
              {t("personal_space_title")}
            </h3>
            <p className="text-text-secondary text-[15px] leading-relaxed mb-8 max-w-[70%]">
              {t("personal_space_desc")}
            </p>

            <div className="flex items-center text-sm font-bold text-pink-500 group-hover:gap-2 gap-1 transition-all duration-300">
              {t("access_now")}
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </div>
          </div>
        </TiltCard>

        {/* Groups card */}
        <TiltCard
          onClick={() => navigate("/groups")}
          className="group relative p-8 bg-card-bg border border-border-primary rounded-[32px] cursor-pointer hover:border-rose-200 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-pattern-hover"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 via-rose-50/0 to-rose-100/0 group-hover:from-rose-50/80 group-hover:to-transparent transition-all duration-500 rounded-[32px] z-0" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-100/50 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700 z-0" />

          {/* Mini Preview Mock */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex -space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-x-8 group-hover:translate-x-0 z-10">
            <div className="w-12 h-12 rounded-full border-[3px] border-white bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-sm font-black text-pink-600 shadow-md">T</div>
            <div className="w-12 h-12 rounded-full border-[3px] border-white bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-sm font-black text-rose-600 shadow-md">M</div>
            <div className="w-12 h-12 rounded-full border-[3px] border-white bg-bg-secondary flex items-center justify-center text-sm font-black text-text-secondary shadow-md">+2</div>
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm border border-rose-100/50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full text-rose-500 text-[11px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {t("group_label") || "Nhóm"}
              </div>
              <div className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary text-[11px] font-bold border border-border-primary/50">
                3 {t("folders") || "Groups"}
              </div>
            </div>

            <h3 className="text-2xl font-black text-text-primary mb-3 group-hover:text-rose-600 transition-colors duration-300">
              {t("groups_team_title")}
            </h3>
            <p className="text-text-secondary text-[15px] leading-relaxed mb-8 max-w-[70%]">
              {t("groups_team_desc")}
            </p>

            <div className="flex items-center text-sm font-bold text-rose-500 group-hover:gap-2 gap-1 transition-all duration-300">
              {t("enter_groups_hall")}
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* ── Social Proof (Testimonials) ── */}
      <div className="z-10 w-full">
        <TestimonialTicker />
      </div>

      {/* ── How it works strip ── */}
      <div className="z-10 relative mt-4 max-w-[1200px] mx-auto px-6 md:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-4">{t("how_it_works") || "Cách hoạt động"}</h2>
          <p className="text-text-secondary">{t("how_it_works_desc") || "3 bước đơn giản để biến mọi điều ước thành hiện thực"}</p>
        </div>

        {/* Connecting Line (Desktop Only) */}
        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 z-0 pointer-events-none -translate-y-6">
          <svg width="100%" height="20" preserveAspectRatio="none">
            <path d="M0,10 L2000,10" stroke="currentColor" className="text-pink-200" strokeWidth="2" strokeDasharray="8 8" />
            <path d="M0,10 L2000,10" stroke="currentColor" className="text-pink-500 animate-dash" strokeWidth="2" strokeDasharray="8 8" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: (
                <div className="relative">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 relative z-10"><path d="M12 5v14M5 12h14" /></svg>
                  <div className="absolute inset-0 bg-pink-400 rounded-full blur-md animate-pulse opacity-40"></div>
                </div>
              ),
              title: t("step1_title") || "Tạo danh sách",
              desc: t("step1_desc") || "Thêm những điều bạn muốn vào danh sách cá nhân.",
            },
            {
              step: "02",
              icon: (
                <div className="flex gap-1 animate-bounce-slow">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse delay-300"></div>
                </div>
              ),
              title: t("step2_title") || "Chia sẻ nhóm",
              desc: t("step2_desc") || "Mời bạn bè, gia đình cùng xem và tương tác.",
            },
            {
              step: "03",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500 animate-heartbeat"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              ),
              title: t("step3_title") || "Nhận điều ước",
              desc: t("step3_desc") || "Theo dõi và thực hiện những điều ước của nhau.",
            },
          ].map((item, index) => (
            <AnimatedStepCard key={item.step} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* ── Final Call to Action ── */}
      <section className="relative z-10 w-full max-w-[1000px] mx-auto mt-10 px-6 md:px-8">
        <div className="absolute inset-0 mx-6 md:mx-8 bg-gradient-to-r from-pink-500 to-rose-400 rounded-[32px] blur-xl opacity-30 animate-pulse" />
        <div className="relative p-10 md:p-14 bg-gradient-to-r from-pink-500 to-rose-400 rounded-[32px] text-center overflow-hidden border border-white/20 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 drop-shadow-sm">
            {t("ready_to_start") || "Sẵn sàng tạo danh sách?"}
          </h2>
          <p className="text-pink-50 text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-90">
            {t("ready_to_start_desc") || "Bắt đầu hoàn toàn miễn phí. Chia sẻ niềm vui và nhận về những món quà ý nghĩa nhất."}
          </p>
          <RippleButton
            onClick={() => navigate("/personal")}
            className="group relative px-10 py-4 bg-white text-pink-600 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden inline-flex"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t("start_creating") || "Tạo điều ước ngay"}
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </span>
          </RippleButton>
        </div>
      </section>

      <AboutSection />

      <style>{`
        /* Global Smooth Scroll */
        html { scroll-behavior: smooth; }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          opacity: 0;
          animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear forwards;
          pointer-events: none;
        }
        @keyframes dash {
          from { stroke-dashoffset: 16; }
          to { stroke-dashoffset: 0; }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 2s infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .bg-pattern-hover:hover {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23fce7f3' fill-opacity='0.25' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .animate-marquee, .animate-marquee-reverse {
            animation: none !important;
            transform: translateX(0) !important;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}