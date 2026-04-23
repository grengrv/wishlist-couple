import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";

function formatDate(dateStr) {
  if (!dateStr) return "Chưa xác định";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return d.toLocaleDateString("vi-VN");
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getDateLabel(dateStr) {
  if (!dateStr) return "Chưa xác định";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);

  const diffTime = today - d;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";

  return formatDate(dateStr);
}

function groupLogs(logs) {
  const groups = {};
  logs.forEach(log => {
    // Determine date to use: log.date (ISO) or extract from timestamp/createdAt
    let dateStr = log.date;
    if (!dateStr) {
      const ts = log.timestamp || log.createdAt;
      if (ts) {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split("T")[0];
        }
      }
    }
    const key = dateStr || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

import { createPortal } from "react-dom";

export default function ActivityLog({ logs }) {
  const [filter, setFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, width: 0 });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const filterOptions = [
    { id: "all", label: "Tất cả", icon: "📋" },
    { id: "today", label: "Hôm nay", icon: "📅" },
    { id: "yesterday", label: "Hôm qua", icon: "🗓️" },
    { id: "7days", label: "7 ngày qua", icon: "📆" },
  ];

  // Handle dropdown positioning for Portal
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Handle resize and scroll
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          right: window.innerWidth - rect.right,
          width: rect.width
        });
      }
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // true for capturing all scroll events
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const filteredLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs.filter(log => {
      let logDateStr = log.date;
      if (!logDateStr) {
        const ts = log.timestamp || log.createdAt;
        if (ts) {
          const d = ts.toDate ? ts.toDate() : new Date(ts);
          if (!isNaN(d.getTime())) {
            logDateStr = d.toISOString().split("T")[0];
          }
        }
      }

      if (filter === "all") return true;
      if (!logDateStr) return false;

      const d = new Date(logDateStr);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));

      if (filter === "today") return diffDays === 0;
      if (filter === "yesterday") return diffDays === 1;
      if (filter === "7days") return diffDays >= 0 && diffDays <= 7;

      return true;
    });
  }, [logs, filter]);

  const groupedLogs = useMemo(() => groupLogs(filteredLogs), [filteredLogs]);
  const groupKeys = Object.keys(groupedLogs).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return b.localeCompare(a); // Descending date
  });

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

  const handleLogClick = (log) => {
    if (log.targetRoute) {
      navigate(log.targetRoute, {
        state: {
          fromLog: true,
          timestamp: log.timestamp || log.createdAt,
          date: log.date
        }
      });
    }
  };

  const activeOption = filterOptions.find(opt => opt.id === filter) || filterOptions[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: dropdownPos.top + 8,
                    right: dropdownPos.right,
                    zIndex: 9999
                  }}
                  className="w-44 bg-bg-secondary/95 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <div className="p-1.5">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setFilter(opt.id); setIsOpen(false); }}
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
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <AnimatePresence initial={false}>
          {groupKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center opacity-30">
              <div className="text-3xl mb-2">📜</div>
              <p className="text-[11px] text-text-muted font-medium italic uppercase tracking-widest leading-relaxed">
                Chưa có hoạt động nào trong mục này...
              </p>
            </div>
          ) : (
            groupKeys.map(dateKey => (
              <div key={dateKey} className="mb-6">
                <h5 className="text-[11px] font-black text-pink-brand uppercase tracking-widest mb-3 px-2 sticky top-0 bg-card-bg/90 backdrop-blur-md py-1.5 z-10 rounded-lg">
                  {getDateLabel(dateKey)}
                </h5>
                <div className="space-y-1">
                  {groupedLogs[dateKey].map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleLogClick(log)}
                      className={`group flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 border border-transparent 
                        ${log.targetRoute ? 'cursor-pointer hover:bg-white/5 hover:border-white/5' : ''}`}
                    >
                      <div className="relative shrink-0">
                        <Avatar src={log.actorAvatar} name={log.actorName} className="w-8 h-8 rounded-xl shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bg-secondary rounded-full flex items-center justify-center text-[8px] shadow-sm ring-1 ring-white/5">
                          {getActionIcon(log.action)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[12px] text-text-secondary leading-relaxed">
                          <span className="text-text-primary font-black mr-1">{log.actorName}</span>
                          {getActionText(log)}
                        </p>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 block">
                          {formatTime(log.timestamp || log.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
