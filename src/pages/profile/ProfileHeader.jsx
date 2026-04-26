export default function ProfileHeader({ 
  userProfile, 
  user, 
  activeTheme, 
  mode, 
  isReadOnly, 
  avatarPreview, 
  bannerPreview, 
  status, 
  statusColors, 
  onProcessImage, 
  onRemoveAvatar, 
  onRemoveBanner, 
  onOpenStatusSelector, 
  onRequestClose,
  setMode,
  t 
}) {
  return (
    <>
      {/* BANNER */}
      <div className="relative w-full h-[140px] bg-gradient-to-br from-pink-300 via-purple-300 to-rose-300 group transition-all duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10" />

        {bannerPreview && <img key={bannerPreview} src={bannerPreview} alt="banner" className="w-full h-full object-cover relative z-0" />}

        {mode === "edit" && !isReadOnly && (
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button
              onClick={() => document.getElementById("banner-upload").click()}
              style={{ backgroundColor: `${activeTheme.color}90` }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/20"
              title={t("change_banner")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </button>
            {bannerPreview && (
              <button
                onClick={onRemoveBanner}
                className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/20"
                title={t("remove_banner_title")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              </button>
            )}
          </div>
        )}
        {!isReadOnly && <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={e => onProcessImage(e.target.files[0], true)} />}

        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white backdrop-blur-md transition-all z-20" onClick={onRequestClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="px-6 relative flex flex-col items-center text-center gap-3 pb-2 w-full">
        <div className="relative -mt-[60px] group z-30 shrink-0 border-1 border-white rounded-[100px]">
          <div
            className={`w-[120px] h-[120px] rounded-[100px] shadow-xl overflow-hidden relative ${!isReadOnly ? 'cursor-pointer' : ''} rotate-3 group-hover:rotate-0 transition-transform duration-500`}
            onClick={() => {
              if (isReadOnly) return;
              if (mode === "view") {
                setMode("edit");
                setTimeout(() => document.getElementById("avatar-upload").click(), 50);
              } else {
                document.getElementById("avatar-upload").click();
              }
            }}
          >
            {avatarPreview ? (
              <img key={avatarPreview} src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-pink-400 to-rose-400">
                {(userProfile?.displayName || userProfile?.username || "U")[0]?.toUpperCase() || "?"}
              </div>
            )}

            {mode === "edit" && !isReadOnly && (
              <div
                className="absolute inset-0 backdrop-blur-md rounded-full p-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); document.getElementById("avatar-upload").click(); }}
                  style={{ backgroundColor: activeTheme.color }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/20"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </button>
                {avatarPreview && (
                  <button
                    onClick={onRemoveAvatar}
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/20"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            className={`absolute bottom-[-3px] left-[84px] w-5.5 h-5.5 rounded-full border-[3px] border-white flex items-center justify-center bg-white z-40 transition-all duration-300 ${!isReadOnly ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
            onClick={onOpenStatusSelector}
          >
            <div className="w-full h-full rounded-full" style={{ backgroundColor: statusColors[status] || statusColors.online }}></div>
          </div>

          {!isReadOnly && <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={e => onProcessImage(e.target.files[0], false)} />}
        </div>

        <div className="flex flex-col items-center text-center w-full min-w-0">
          {mode === "view" ? (
            <>
              <h2
                style={{ color: activeTheme?.color }}
                className="text-[26px] font-black tracking-tight leading-tight mb-1 whitespace-normal break-words w-full px-2"
              >
                {userProfile?.displayName || userProfile?.username || t("default_user")}
              </h2>
              <p
                style={{ color: activeTheme?.color }}
                className="text-[15px] font-bold mb-4 opacity-50"
              >
                {userProfile?.username || "user"}
              </p>

              {userProfile?.customStatus && (
                <div
                  style={{ color: activeTheme.color, borderColor: `${activeTheme.color}20` }}
                  className="font-bold px-5 py-2.5 flex items-center gap-2 mb-6 max-w-full"
                >
                  <span className="text-sm break-words">{userProfile.customStatus}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full mt-2">
              <h3 className="text-lg font-black text-text-primary mb-1">{t("editing_profile")}</h3>
              <p className="text-[11px] font-bold text-text-muted mb-4 uppercase tracking-widest">{t("update_your_info")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
