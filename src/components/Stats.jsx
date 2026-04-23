import { useLanguage } from "../context/LanguageContext";

/**
 * Stats component - Phiên bản "Soft Capsule" với Icon Tối giản (Outline)
 */
export default function Stats({ items }) {
  const { t } = useLanguage();
  const statsData = [
    {
      label: t("total_wishes"),
      value: items.length,
      textColor: "text-pink-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      )
    },
    {
      label: t("with_images"),
      value: items.filter(i => i.anhUrl).length,
      textColor: "text-purple-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    },
    {
      label: t("with_notes"),
      value: items.filter(i => i.ghiChu).length,
      textColor: "text-orange-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 w-full mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="flex-1 min-w-[130px] bg-bg-secondary border border-border-primary rounded-[24px] p-5 flex items-center gap-5 transition-all duration-300 hover:shadow-[0_10px_25px_rgba(236,72,153,0.05)] hover:-translate-y-1"
        >
          {/* Icon tròn nhỏ xinh */}
          <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            {stat.icon}
          </div>

          <div className="flex flex-col">
            <span className={`text-2xl font-black ${stat.textColor} leading-none`}>
              {stat.value}
            </span>
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1.5">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}