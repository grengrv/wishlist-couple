import { createPortal } from "react-dom";

export default function StatusSettings({ 
  isOpen, 
  anchor, 
  status, 
  setStatus, 
  onClose, 
  activeTheme, 
  statusColors, 
  t 
}) {
  if (!isOpen || !anchor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] md:bg-transparent bg-black/40 backdrop-blur-sm md:backdrop-blur-none flex items-end md:items-start transition-all" onClick={onClose}>
      <div
        className={`
          bg-bg-secondary/95 backdrop-blur-3xl border border-border-primary/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-2 animate-slide-up md:animate-fade-in overflow-hidden
          ${window.innerWidth < 768
            ? 'w-full rounded-t-[36px] pb-10 px-4' // Mobile bottom sheet
            : 'w-[220px] rounded-[32px] fixed' // Desktop popover
          }
        `}
        style={window.innerWidth >= 768 ? {
          top: Math.min(anchor.bottom + 8, window.innerHeight - 280),
          left: Math.min(anchor.left, window.innerWidth - 240)
        } : {}}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          {window.innerWidth < 768 && (
            <div className="w-12 h-1.5 bg-border-primary rounded-full mx-auto mt-2 mb-6" />
          )}
          {[
            { id: 'online', label: t('online'), sub: t('online_sub'), color: statusColors.online },
            { id: 'idle', label: t('idle'), sub: t('idle_sub'), color: statusColors.idle },
            { id: 'dnd', label: t('dnd'), sub: t('dnd_sub'), color: statusColors.dnd },
            { id: 'offline', label: t('offline'), sub: t('offline_sub'), color: statusColors.offline }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setStatus(opt.id);
                onClose();
              }}
              className={`flex items-center gap-4 w-full p-4 md:p-3 rounded-2xl transition-all duration-200 group ${status === opt.id ? 'bg-pink-500/10' : 'hover:bg-card-hover'}`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-4 h-4 md:w-3.5 md:h-3.5 rounded-full" style={{ backgroundColor: opt.color }} />
                {status === opt.id && (
                  <div
                    style={{ borderColor: activeTheme.color }}
                    className="absolute -inset-1.5 rounded-full border animate-ping opacity-30"
                  />
                )}
              </div>
              <div className="flex flex-col items-start text-left">
                <span
                  style={{ color: status === opt.id ? activeTheme.color : undefined }}
                  className={`text-[15px] md:text-[13px] font-black tracking-tight ${status === opt.id ? '' : 'text-text-primary'}`}
                >
                  {opt.label}
                </span>
                <span className="text-[11px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">
                  {opt.sub}
                </span>
              </div>
              {status === opt.id && (
                <div style={{ color: activeTheme.color }} className="ml-auto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
