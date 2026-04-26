export default function ThemeSettings({ 
  theme, 
  activeTheme, 
  setTheme, 
  setPreviewTheme, 
  presetColors, 
  t 
}) {
  return (
    <div className="pt-2">
      <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-3 block">{t("profile_theme")}</label>

      <div className="space-y-5">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-text-muted uppercase">{t("bg_color_label")}</span>
          <div className="flex items-center gap-4 bg-bg-secondary/50 p-3 rounded-2xl border border-border-primary/50">
            <div className="relative group">
              <div
                style={{ backgroundColor: activeTheme.backgroundColor }}
                className="w-12 h-12 rounded-xl shadow-lg cursor-pointer border-2 border-border-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 overflow-hidden"
                onClick={() => document.getElementById('bg-color-picker').click()}
              >
                <div className="absolute inset-0 opacity-10 bg-black/10" />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" /><path d="M12 7v5l3 3" /></svg>
              </div>
              <input
                id="bg-color-picker"
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                onInput={(e) => setPreviewTheme({ ...theme, backgroundColor: e.target.value })}
                onBlur={() => setPreviewTheme(null)}
              />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-text-primary tracking-tight uppercase">{activeTheme.backgroundColor}</span>
                <button
                  className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:opacity-70 transition-opacity"
                  onClick={() => setTheme({ ...theme, backgroundColor: "#ffffff" })}
                >
                  {t("default")}
                </button>
              </div>
              <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter">{t("any_bg_color")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-text-muted uppercase">{t("accent_color_label")}</span>
          <div className="flex items-center gap-4 bg-bg-secondary/50 p-3 rounded-2xl border border-border-primary/50">
            <div className="relative group">
              <div
                style={{ backgroundColor: activeTheme.color }}
                className="w-12 h-12 rounded-xl shadow-lg cursor-pointer border-2 border-border-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                onClick={() => document.getElementById('accent-color-picker').click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>
              </div>
              <input
                id="accent-color-picker"
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={theme.color}
                onChange={(e) => setTheme({ ...theme, color: e.target.value })}
                onInput={(e) => setPreviewTheme({ ...theme, color: e.target.value })}
                onBlur={() => setPreviewTheme(null)}
              />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-text-primary tracking-tight uppercase">{activeTheme.color}</span>
                <button
                  className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:opacity-70 transition-opacity"
                  onClick={() => setTheme({ ...theme, color: "#ec4899" })}
                >
                  {t("default")}
                </button>
              </div>

              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
                {presetColors.map((c) => (
                  <button
                    key={c.name}
                    style={{ backgroundColor: c.value }}
                    className={`w-6 h-6 rounded-lg shrink-0 border border-white/50 transition-all ${theme.color === c.value ? 'scale-110 shadow-sm border-white' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                    onClick={() => setTheme({ ...theme, color: c.value })}
                    onMouseEnter={() => setPreviewTheme({ ...theme, color: c.value })}
                    onMouseLeave={() => setPreviewTheme(null)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
