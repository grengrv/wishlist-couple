import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./ui/Avatar";

export default function ActivityLog({ logs }) {
  const [filter, setFilter] = useState("all"); // all | member | wish
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterOptions = [
    { id: "all", label: "Tất cả", icon: "📋" },
    { id: "member", label: "Thành viên", icon: "👥" },
    { id: "wish", label: "Điều ước", icon: "✦" },
  ];

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    if (filter === "member") return logs.filter(l => l.action === "add_member" || l.action === "kick_member");
    if (filter === "wish") return logs.filter(l => l.action === "create_wish");
    return logs;
  }, [logs, filter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case "add_member": return "👋";
      case "kick_member": return "🚪";
      case "create_wish": return "✦";
      default: return "📝";
    }
  };

  const getActionText = (log) => {
    switch (log.action) {
      case "add_member":
        return <>vừa thêm <span className="text-text-primary font-bold">{log.targetName}</span> vào nhóm</>;
      case "kick_member":
        return <>đã mời <span className="text-rose-500 font-bold">{log.targetName}</span> rời khỏi nhóm</>;
      case "create_wish":
        return <>vừa gửi một điều ước mới: <span className="text-pink-500 font-bold">"{log.targetName}"</span></>;
      default:
        return "đã thực hiện một hành động";
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const activeOption = filterOptions.find(opt => opt.id === filter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Custom Dropdown */}
      <div className="flex items-center justify-between px-4 mb-4 shrink-0 z-[10]">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Lịch sử hoạt động</h4>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300
              ${isOpen ? 'bg-pink-500/10 text-pink-500' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'}
            `}
          >
            <span>{activeOption.label}</span>
            <svg 
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-40 bg-bg-secondary/95 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-[50]"
              >
                <div className="p-1.5">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setFilter(opt.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all
                        ${filter === opt.id ? 'bg-pink-500/10 text-pink-500' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}
                      `}
                    >
                      <span>{opt.label}</span>
                      <span className="opacity-50">{opt.icon}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Independent Scroll Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <AnimatePresence initial={false}>
          {filteredLogs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 px-6 text-center opacity-30">
                <div className="text-3xl mb-2">📜</div>
                <p className="text-[11px] text-text-muted font-medium italic uppercase tracking-widest leading-relaxed">
                  Chưa có hoạt động nào trong mục này...
                </p>
             </div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5"
              >
                <div className="relative shrink-0">
                    <Avatar src={log.actorAvatar} name={log.actorName} className="w-8 h-8 rounded-xl shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bg-secondary rounded-full flex items-center justify-center text-[8px] shadow-sm ring-1 ring-white/5">
                        {getActionIcon(log.action)}
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    <span className="text-text-primary font-black mr-1">{log.actorName}</span>
                    {getActionText(log)}
                  </p>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 block">
                    {formatTime(log.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
