import Input from "@components/ui/Input";
import ThemeSettings from "./ThemeSettings";

export default function ProfileForm({ 
  displayName, 
  setDisplayName, 
  username, 
  setUsername, 
  customStatus, 
  setCustomStatus, 
  bio, 
  setBio, 
  status, 
  onOpenStatusSelector, 
  statusColors, 
  theme, 
  activeTheme, 
  setTheme, 
  setPreviewTheme, 
  presetColors, 
  selectorAnchor,
  t 
}) {
  return (
    <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">{t("display_name")}</label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
        </div>
        <div>
          <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">{t("username_label")}</label>
          <Input value={username} onChange={e => setUsername(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
        </div>
        <div>
          <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">{t("what_are_you_doing")}</label>
          <Input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder={t("thinking_placeholder")} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
        </div>
        <div>
          <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">{t("bio_label")}</label>
          <Input as="textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-medium" />
        </div>
        <div>
          <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">{t("active_status")}</label>
          <button
            type="button"
            onClick={onOpenStatusSelector}
            className="w-full bg-bg-primary border border-border-primary text-text-primary h-14 rounded-2xl px-5 flex items-center justify-between outline-none focus:ring-2 focus:ring-pink-100 font-bold transition-all hover:bg-card-bg"
          >
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: statusColors[status] || statusColors.online }}></div>
              <span>
                {status === 'online' && t("status_online")}
                {status === 'idle' && t("status_idle")}
                {status === 'dnd' && t("status_dnd")}
                {status === 'offline' && t("status_offline")}
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-text-muted transition-transform duration-300 ${selectorAnchor ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>

        <ThemeSettings 
          theme={theme}
          activeTheme={activeTheme}
          setTheme={setTheme}
          setPreviewTheme={setPreviewTheme}
          presetColors={presetColors}
          t={t}
        />
      </div>
    </div>
  );
}
