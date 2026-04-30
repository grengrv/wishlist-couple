import { useLanguage } from "@context/LanguageContext";
import { motion } from "framer-motion";

const MOOD_META = {
  craving:   { emoji: "😍", color: "#ec4899", bg: "#fce7f3" },
  dreaming:  { emoji: "💭", color: "#8b5cf6", bg: "#ede9fe" },
  urgent:    { emoji: "🔥", color: "#f97316", bg: "#ffedd5" },
  done:      { emoji: "🎉", color: "#10b981", bg: "#d1fae5" },
  expensive: { emoji: "💸", color: "#f59e0b", bg: "#fef3c7" },
  together:  { emoji: "🤝", color: "#3b82f6", bg: "#dbeafe" },
};

export default function Stats({ items }) {
  const { t } = useLanguage();

  // 1. Số Wish đã hoàn thành
  const completedCount = items.filter(i => i.mood === 'done').length;

  // 2. Người đóng góp nhiều nhất
  const contributors = items.reduce((acc, item) => {
    const author = item.themBoi || t("anonymous");
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});
  
  const topContributor = Object.keys(contributors).length > 0 
    ? Object.entries(contributors).sort((a, b) => b[1] - a[1])[0][0]
    : t("no_data");

  // 3. Mood được yêu thích nhất
  const moods = items.reduce((acc, item) => {
    if (item.mood) acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});

  const popularMoodKey = Object.keys(moods).length > 0
    ? Object.entries(moods).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  
  const popularMood = popularMoodKey ? MOOD_META[popularMoodKey] : null;

  const statsData = [
    {
      label: t("total_wishes"),
      value: items.length,
      textColor: "text-pink-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      )
    },
    {
      label: t("completed_wishes"),
      value: completedCount,
      textColor: "text-emerald-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    {
      label: t("top_contributor"),
      value: topContributor,
      isText: true,
      textColor: "text-blue-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      label: t("popular_mood"),
      value: popularMood ? `${popularMood.emoji} ${t(`mood_${popularMoodKey}`)}` : t("no_data"),
      isText: true,
      textColor: "text-purple-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-10">
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-bg-secondary/40 backdrop-blur-md border border-border-primary/50 rounded-[28px] p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1 group"
        >
          <div className="w-11 h-11 bg-bg-primary/50 rounded-[18px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 border border-border-primary/30">
            {stat.icon}
          </div>

          <div className="flex flex-col">
            <span className={`text-[11px] font-black text-text-muted uppercase tracking-[2px] mb-1 opacity-70 group-hover:opacity-100 transition-opacity`}>
              {stat.label}
            </span>
            <span className={`${stat.isText ? 'text-sm' : 'text-2xl'} font-black ${stat.textColor} leading-tight line-clamp-1`}>
              {stat.value}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
