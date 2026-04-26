import { useState, useEffect, useCallback, useRef } from "react";
import { auth, db } from "@config/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Button from "@components/ui/Button";
import ImageEditorModal from "@components/wishlist/ImageEditorModal";
import { toastStore } from "@utils/toastStore";
import { notifyCapNhatHoSo, notifyDoiAvatar, notifyDoiBanner, notifyError } from "@utils/notify";
import { useConfirm } from "@context/ConfirmContext";
import { useLanguage } from "@context/LanguageContext";

// Sub-components
import ProfileHeader from "./profile/ProfileHeader";
import ProfileForm from "./profile/ProfileForm";
import StatusSettings from "./profile/StatusSettings";

const PRESET_COLORS = [
    { name: "Hồng", value: "#ec4899" },
    { name: "Xanh dương", value: "#3b82f6" },
    { name: "Lục bảo", value: "#10b981" },
    { name: "Vàng cam", value: "#f59e0b" },
    { name: "Đỏ hồng", value: "#f43f5e" },
    { name: "Tím", value: "#8b5cf6" },
];

const DEFAULT_THEME = {
    backgroundColor: "#ffffff",
    color: "#ec4899"
};

const STATUS_COLORS = {
    online: "#34d399",
    idle: "#fbbf24",
    dnd: "#f43f5e",
    offline: "#9ca3af"
};

export default function Profile({ userProfile, onClose, onUpdate, isReadOnly = false }) {
    const confirm = useConfirm();
    const { t, lang } = useLanguage();
    const [mode, setMode] = useState("view"); // "view" | "edit"

    // Form state
    const [displayName, setDisplayName] = useState(userProfile?.displayName || userProfile?.username || "");
    const [username, setUsername] = useState(userProfile?.username || "");
    const [bio, setBio] = useState(userProfile?.bio || "");
    const [status, setStatus] = useState(userProfile?.status || "online");
    const [customStatus, setCustomStatus] = useState(userProfile?.customStatus || "");

    // Images
    const [avatarPreview, setAvatarPreview] = useState(userProfile?.avatar || null);
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(userProfile?.banner || null);
    const [bannerBase64, setBannerBase64] = useState(null);

    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = userProfile?.theme || {};
        return { ...DEFAULT_THEME, ...saved };
    });
    const [previewTheme, setPreviewTheme] = useState(null);
    const [selectorAnchor, setSelectorAnchor] = useState(null);
    const selectorRef = useRef(null);

    // Editor State
    const [editorConfig, setEditorConfig] = useState({
        isOpen: false,
        imageSrc: null,
        isBanner: false,
        isGif: false,
        file: null
    });

    // Sync state when userProfile changes
    useEffect(() => {
        if (mode === "view" && userProfile) {
            setDisplayName(userProfile?.displayName || userProfile?.username || "");
            setUsername(userProfile?.username || "");
            setBio(userProfile?.bio || "");
            setStatus(userProfile?.status || "online");
            setCustomStatus(userProfile?.customStatus || "");
            setAvatarPreview(userProfile?.avatar || null);
            setBannerPreview(userProfile?.banner || null);
            const saved = userProfile?.theme || {};
            setTheme({ ...DEFAULT_THEME, ...saved });
        }
    }, [userProfile, mode]);

    const hasUnsavedChanges =
        displayName !== (userProfile?.displayName || userProfile?.username || "") ||
        username !== (userProfile?.username || "") ||
        bio !== (userProfile?.bio || "") ||
        status !== (userProfile?.status || "online") ||
        customStatus !== (userProfile?.customStatus || "") ||
        avatarBase64 !== null ||
        bannerBase64 !== null ||
        JSON.stringify(theme) !== JSON.stringify(userProfile?.theme || DEFAULT_THEME);

    const isActiveAction = loading || mode === "edit";

    const handleRequestClose = useCallback(async () => {
        if (loading) return;
        if (mode === "edit" && hasUnsavedChanges) {
            const ok = await confirm({
                title: t("unsaved_exit_title"),
                message: t("unsaved_exit_msg"),
                confirmText: t("exit"),
                cancelText: t("stay"),
                variant: "danger"
            });
            if (!ok) return;
        }
        onClose();
    }, [loading, mode, hasUnsavedChanges, confirm, onClose, t]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === "Escape") handleRequestClose(); };
        const handleClickOutside = (e) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target)) {
                setSelectorAnchor(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleRequestClose]);

    if (!userProfile) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-card-bg backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-border-primary">
                    <div className="w-12 h-12 border-[5px] border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-text-primary font-black text-lg">{t("loading_profile")}</p>
                        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">{t("wait_moment")}</p>
                    </div>
                </div>
            </div>
        );
    }

    const openStatusSelector = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectorAnchor({ top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right });
    };

    function processImage(file, isBanner = false) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            notifyError(t("only_image_allowed"));
            return;
        }
        const isGif = file.type === "image/gif";
        if (isGif && file.size > 600 * 1024) {
            notifyError(t("gif_too_large"));
            return;
        } else if (!isGif && file.size > 8 * 1024 * 1024) {
            notifyError(t("image_too_large"));
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setEditorConfig({ isOpen: true, imageSrc: objectUrl, isBanner, isGif, file });
    }

    function handleSaveImage(processedImage) {
        if (editorConfig.isBanner) {
            setBannerBase64(processedImage);
            setBannerPreview(processedImage);
            toastStore.show(t("banner_applied"));
        } else {
            setAvatarBase64(processedImage);
            setAvatarPreview(processedImage);
            toastStore.show(t("avatar_applied"));
        }
        if (editorConfig.imageSrc && editorConfig.imageSrc.startsWith('blob:')) {
            URL.revokeObjectURL(editorConfig.imageSrc);
        }
        setEditorConfig({ isOpen: false, imageSrc: null, isBanner: false, isGif: false, file: null });
    }

    const handleRemoveAvatar = async (e) => {
        e.stopPropagation();
        const ok = await confirm({ title: t("remove_avatar_title"), content: t("remove_avatar_msg"), confirmText: t("remove"), cancelText: t("cancel") });
        if (ok) { setAvatarPreview(null); setAvatarBase64(""); }
    };

    const handleRemoveBanner = async (e) => {
        e.stopPropagation();
        const ok = await confirm({ title: t("remove_banner_title"), content: t("remove_banner_msg"), confirmText: t("remove"), cancelText: t("cancel") });
        if (ok) { setBannerPreview(null); setBannerBase64(""); }
    };

    async function luuThongTin() {
        const trimmedUsername = username.trim();
        const trimmedDisplayName = displayName.trim() || trimmedUsername;

        if (trimmedUsername === "") { notifyError(t("username_empty")); return; }
        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) { notifyError(t("username_length")); return; }

        const regex = /^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯ_]+$/;
        if (!regex.test(trimmedUsername)) { notifyError(t("username_special")); return; }

        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: trimmedDisplayName });
            const payload = {};
            if (trimmedUsername !== userProfile?.username) payload.username = trimmedUsername;
            if (trimmedDisplayName !== (userProfile?.displayName || userProfile?.username || "")) payload.displayName = trimmedDisplayName;
            if (bio.trim() !== (userProfile?.bio || "")) payload.bio = bio.trim();
            if (status !== (userProfile?.status || "online")) payload.status = status;
            if (customStatus.trim() !== (userProfile?.customStatus || "")) payload.customStatus = customStatus.trim();
            if (avatarBase64 !== null) payload.avatar = avatarBase64;
            if (bannerBase64 !== null) payload.banner = bannerBase64;
            if (JSON.stringify(theme) !== JSON.stringify(userProfile?.theme || DEFAULT_THEME)) payload.theme = theme;

            if (Object.keys(payload).length === 0) { setMode("view"); setLoading(false); return; }

            const userRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userRef, payload, { merge: true });

            if (onUpdate) onUpdate({ ...userProfile, ...payload });

            if (payload.avatar) notifyDoiAvatar();
            else if (payload.banner) notifyDoiBanner();
            else notifyCapNhatHoSo();

            setAvatarBase64(null); setBannerBase64(null); setMode("view");

            if (payload.username || payload.avatar) {
                const q = query(collection(db, "wishlist"), where("uid", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                const updatePromises = querySnapshot.docs.map(wishDoc => {
                    return updateDoc(wishDoc.ref, {
                        themBoi: payload.username || userProfile.username,
                        avatarNguoiThem: payload.avatar || userProfile.avatar
                    });
                });
                await Promise.all(updatePromises);
            }
        } catch (err) {
            notifyError(t("update_failed_profile"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return t("just_joined");
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: 'short', year: 'numeric', day: 'numeric' });
    };

    const activeTheme = previewTheme || theme || DEFAULT_THEME;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => !isActiveAction && handleRequestClose()}>
            <div
                style={{ backgroundColor: activeTheme?.backgroundColor }}
                className="bg-bg-secondary/95 backdrop-blur-3xl w-full max-w-[380px] rounded-[40px] overflow-hidden relative animate-slide-up flex flex-col font-sans border border-border-primary transition-all duration-500"
                onClick={e => e.stopPropagation()}
            >
                <ProfileHeader 
                    userProfile={userProfile}
                    activeTheme={activeTheme}
                    mode={mode}
                    isReadOnly={isReadOnly}
                    avatarPreview={avatarPreview}
                    bannerPreview={bannerPreview}
                    status={status}
                    statusColors={STATUS_COLORS}
                    onProcessImage={processImage}
                    onRemoveAvatar={handleRemoveAvatar}
                    onRemoveBanner={handleRemoveBanner}
                    onOpenStatusSelector={openStatusSelector}
                    onRequestClose={handleRequestClose}
                    setMode={setMode}
                    t={t}
                />

                <div className="px-6 pb-6">
                    {mode === "view" ? (
                        <>
                            <div className="backdrop-blur-xl mb-10 flex items-center justify-center text-center">
                                {userProfile?.bio ? (
                                    <p style={{ color: activeTheme?.color }} className="text-[14px] font-medium whitespace-pre-wrap leading-relaxed opacity-80">{userProfile.bio}</p>
                                ) : (
                                    <p className="text-[14px] text-text-muted italic font-medium">{t("no_bio")}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-center p-5">
                                <div className="text-center">
                                    <h3 style={{ color: activeTheme?.color }} className="text-[11px] font-black uppercase tracking-widest mb-0.5 opacity-80">{t("member_since")}</h3>
                                    <p style={{ color: activeTheme?.color }} className="text-[14px] font-bold">{formatDate(userProfile?.taoLuc)}</p>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <Button
                                    onClick={() => setMode("edit")}
                                    style={{ backgroundColor: activeTheme.color }}
                                    className="w-full !rounded-[20px] !text-white hover:opacity-90 !py-4 transition-all font-black text-xs uppercase tracking-widest border-none"
                                >
                                    {t("edit_profile_btn")}
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <ProfileForm 
                                displayName={displayName}
                                setDisplayName={setDisplayName}
                                username={username}
                                setUsername={setUsername}
                                customStatus={customStatus}
                                setCustomStatus={setCustomStatus}
                                bio={bio}
                                setBio={setBio}
                                status={status}
                                onOpenStatusSelector={openStatusSelector}
                                statusColors={STATUS_COLORS}
                                theme={theme}
                                activeTheme={activeTheme}
                                setTheme={setTheme}
                                setPreviewTheme={setPreviewTheme}
                                presetColors={PRESET_COLORS}
                                selectorAnchor={selectorAnchor}
                                t={t}
                            />

                            <div className="flex gap-3 mt-4 pt-4 border-t border-border-primary/50">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setTheme(userProfile?.theme || DEFAULT_THEME); setMode("view"); }}
                                    className="!bg-bg-primary/50 !text-text-secondary hover:!bg-bg-primary/80 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-1 border border-border-primary/50 shadow-none"
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    onClick={luuThongTin}
                                    disabled={loading}
                                    style={{ backgroundColor: activeTheme.color }}
                                    className="!text-white hover:opacity-90 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-[2] border-none shadow-none"
                                >
                                    {loading ? t("saving") : t("save_changes")}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ImageEditorModal
                isOpen={editorConfig.isOpen}
                imageSrc={editorConfig.imageSrc}
                file={editorConfig.file}
                isBanner={editorConfig.isBanner}
                isGif={editorConfig.isGif}
                onClose={() => setEditorConfig({ ...editorConfig, isOpen: false })}
                onSave={handleSaveImage}
            />

            <StatusSettings 
                isOpen={!!selectorAnchor}
                anchor={selectorAnchor}
                status={status}
                setStatus={setStatus}
                onClose={() => setSelectorAnchor(null)}
                activeTheme={activeTheme}
                statusColors={STATUS_COLORS}
                t={t}
            />
        </div>
    );
}
