import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { toastStore } from "./utils/toastStore";
import { auth, db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import ImageEditorModal from "./components/ImageEditorModal";
import { notifyCapNhatHoSo, notifyDoiAvatar, notifyDoiBanner, notifyError, notifyCompressing } from "./utils/notify";
import { useConfirm } from "./context/ConfirmContext";

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

export default function Profile({ userProfile, onClose, onUpdate, isReadOnly = false }) {
    const confirm = useConfirm();
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
        return {
            ...DEFAULT_THEME,
            ...saved
        };
    });
    const [previewTheme, setPreviewTheme] = useState(null);
    const [selectorAnchor, setSelectorAnchor] = useState(null); // { top, left, bottom, right }
    const selectorRef = useRef(null);

    // Editor State
    const [editorConfig, setEditorConfig] = useState({
        isOpen: false,
        imageSrc: null,
        isBanner: false,
        isGif: false,
        file: null
    });

    // Sync state when userProfile changes (Real-time updates)
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
            setTheme({
                ...DEFAULT_THEME,
                ...saved
            });
        }
    }, [userProfile, mode]);

    // Debugging
    useEffect(() => {
        if (userProfile) {
            console.log("Profile Component - userProfile:", userProfile);
        }
    }, [userProfile]);

    // Safety check: ensure profile is always an object
    const profile = userProfile || {};

    // RENDER GUARD was here, moved down

    // Status colors
    const statusColors = {
        online: "#34d399", // emerald-400
        idle: "#fbbf24", // amber-400
        dnd: "#f43f5e", // rose-500
        offline: "#9ca3af" // gray-400
    };

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
                title: "Thoát mà không lưu?",
                message: "Bạn đang thực hiện thao tác và có thay đổi chưa lưu. Bạn có chắc muốn thoát?",
                confirmText: "Thoát",
                cancelText: "Ở lại",
                variant: "danger"
            });
            if (!ok) return;
        }

        onClose();
    }, [loading, mode, hasUnsavedChanges, confirm, onClose]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleRequestClose();
            }
        };

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

    // RENDER GUARD: Show loading if data is missing
    if (!userProfile) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-card-bg backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-border-primary">
                    <div className="w-12 h-12 border-[5px] border-pink-500 border-t-transparent rounded-full animate-spin" />
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-text-primary font-black text-lg">Đang tải hồ sơ...</p>
                        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            </div>
        );
    }


    const openStatusSelector = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectorAnchor({
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        });
    };

    function processImage(file, isBanner = false) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            notifyError("Chỉ chấp nhận file ảnh!");
            return;
        }

        const isGif = file.type === "image/gif";

        // Limits for initial selection (Strict for Base64 safety)
        if (isGif && file.size > 600 * 1024) {
            notifyError("GIF quá nặng, vui lòng chọn file nhỏ hơn");
            return;
        } else if (!isGif && file.size > 8 * 1024 * 1024) {
            notifyError("Ảnh quá lớn (tối đa 8MB)");
            return;
        }

        console.log(`Original file size: ${(file.size / 1024).toFixed(2)} KB`);

        // Open editor immediately with blob URL (no heavy processing yet)
        const objectUrl = URL.createObjectURL(file);
        setEditorConfig({
            isOpen: true,
            imageSrc: objectUrl,
            isBanner,
            isGif,
            file
        });
    }

    function handleSaveImage(processedImage, originalFile = null) {
        if (editorConfig.isBanner) {
            setBannerBase64(processedImage);
            setBannerPreview(processedImage);
            toastStore.show("Đã áp dụng ảnh nền");
        } else {
            setAvatarBase64(processedImage);
            setAvatarPreview(processedImage);
            toastStore.show("Đã áp dụng ảnh đại diện");
        }
        if (editorConfig.imageSrc && editorConfig.imageSrc.startsWith('blob:')) {
            URL.revokeObjectURL(editorConfig.imageSrc);
        }
        setEditorConfig({ isOpen: false, imageSrc: null, isBanner: false, isGif: false, file: null });
    }

    const handleRemoveAvatar = async (e) => {
        e.stopPropagation();
        const ok = await confirm({
            title: "Gỡ ảnh đại diện",
            content: "Bạn có chắc muốn gỡ ảnh đại diện hiện tại?",
            confirmText: "Gỡ bỏ",
            cancelText: "Hủy"
        });
        if (ok) {
            setAvatarPreview(null);
            setAvatarBase64("");
        }
    };

    const handleRemoveBanner = async (e) => {
        e.stopPropagation();
        const ok = await confirm({
            title: "Gỡ ảnh bìa",
            content: "Bạn có chắc muốn gỡ ảnh bìa hiện tại?",
            confirmText: "Gỡ bỏ",
            cancelText: "Hủy"
        });
        if (ok) {
            setBannerPreview(null);
            setBannerBase64("");
        }
    };

    async function luuThongTin() {
        const profile = userProfile || {};
        const trimmedUsername = username.trim();
        const trimmedDisplayName = displayName.trim() || trimmedUsername;

        if (trimmedUsername === "") {
            notifyError("Username không được để trống.");
            return;
        }
        if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
            notifyError("Username phải từ 3 đến 20 ký tự.");
            return;
        }

        const regex = /^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯ_]+$/;
        if (!regex.test(trimmedUsername)) {
            notifyError("Username không được chứa ký tự đặc biệt.");
            return;
        }

        setLoading(true);

        try {
            await updateProfile(auth.currentUser, {
                displayName: trimmedDisplayName
            });

            // Construct payload containing ONLY changed fields
            const payload = {};
            const currentDisplayName = profile.displayName || profile.username || "";
            const currentBio = profile.bio || "";
            const currentStatus = profile.status || "online";
            const currentCustomStatus = profile.customStatus || "";
            const currentTheme = profile.theme || DEFAULT_THEME;

            if (trimmedUsername !== profile.username) payload.username = trimmedUsername;
            if (trimmedDisplayName !== currentDisplayName) payload.displayName = trimmedDisplayName;
            if (bio.trim() !== currentBio) payload.bio = bio.trim();
            if (status !== currentStatus) payload.status = status;
            if (customStatus.trim() !== currentCustomStatus) payload.customStatus = customStatus.trim();
            if (avatarBase64 !== null) payload.avatar = avatarBase64;
            if (bannerBase64 !== null) payload.banner = bannerBase64;
            if (JSON.stringify(theme) !== JSON.stringify(currentTheme)) payload.theme = theme;

            if (Object.keys(payload).length === 0) {
                setMode("view");
                setLoading(false);
                return;
            }

            // DEBUG & SIZE VALIDATION
            let totalB64Size = 0;
            if (payload.avatar) totalB64Size += payload.avatar.length;
            else if (userProfile?.avatar) totalB64Size += userProfile.avatar.length;

            if (payload.banner) totalB64Size += payload.banner.length;
            else if (userProfile?.banner) totalB64Size += userProfile.banner.length;

            console.log(`Estimated Base64 storage size: ${(totalB64Size / 1024).toFixed(2)} KB`);

            // Safe threshold 900KB (Base64 length)
            if (totalB64Size > 900000) {
                notifyError("Dữ liệu quá lớn (vượt giới hạn 900KB)");
                setLoading(false);
                return;
            }

            const userRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userRef, payload, { merge: true });

            // SUCCESS
            const fullUpdatedData = { ...profile, ...payload };
            if (onUpdate) onUpdate(fullUpdatedData);

            if (payload.avatar) notifyDoiAvatar();
            else if (payload.banner) notifyDoiBanner();
            else notifyCapNhatHoSo();

            setAvatarBase64(null);
            setBannerBase64(null);
            setMode("view");

            // 2. SIDE EFFECTS (Wishlist items update)
            try {
                if (payload.username || payload.avatar) {
                    const q = query(collection(db, "wishlist"), where("uid", "==", auth.currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const updatePromises = querySnapshot.docs.map(wishDoc => {
                        return updateDoc(wishDoc.ref, {
                            themBoi: payload.username || profile.username || auth.currentUser.displayName || auth.currentUser.email,
                            avatarNguoiThem: payload.avatar || profile.avatar || null
                        });
                    });
                    await Promise.all(updatePromises);
                }
            } catch (sideEffectErr) {
                console.warn("Side effect failed:", sideEffectErr);
            }

        } catch (err) {
            notifyError("Cập nhật thất bại");
            console.error("Profile Save Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "Mới tham gia";
        try {
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            if (isNaN(d.getTime())) return "Mới tham gia";
            return d.toLocaleDateString("vi-VN", { month: 'short', year: 'numeric', day: 'numeric' });
        } catch (e) {
            return "Mới tham gia";
        }
    };

    const activeTheme = previewTheme || theme || DEFAULT_THEME;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => !isActiveAction && handleRequestClose()}>
            <div
                style={{ backgroundColor: activeTheme?.backgroundColor }}
                className="bg-bg-secondary/95 backdrop-blur-3xl w-full max-w-[380px] rounded-[40px] overflow-hidden relative animate-slide-up flex flex-col font-sans border border-border-primary transition-all duration-500"
                onClick={e => e.stopPropagation()}
            >

                {/* BANNER */}
                <div className="relative w-full h-[140px] bg-gradient-to-br from-pink-300 via-purple-300 to-rose-300 group transition-all duration-500 overflow-hidden">
                    {/* Decorative overlay for banner */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                    {bannerPreview && <img key={bannerPreview} src={bannerPreview} alt="banner" className="w-full h-full object-cover relative z-0" />}

                    {mode === "edit" && !isReadOnly && (
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <button
                                onClick={() => document.getElementById("banner-upload").click()}
                                style={{ backgroundColor: `${activeTheme.color}90` }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/20"
                                title="Thay đổi ảnh bìa"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </button>
                            {bannerPreview && (
                                <button
                                    onClick={handleRemoveBanner}
                                    className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/20"
                                    title="Gỡ ảnh bìa"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            )}
                        </div>
                    )}
                    {!isReadOnly && <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={e => processImage(e.target.files[0], true)} />}

                    {/* CLOSE BTN */}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white backdrop-blur-md transition-all z-20" onClick={handleRequestClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* HEADER CONTENT: VERTICAL CENTERED LAYOUT */}
                <div className="px-6 relative flex flex-col items-center text-center gap-3 pb-2 w-full">
                    {/* AVATAR CENTERED */}
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
                                    {(profile?.displayName || profile?.username || "U")[0]?.toUpperCase() || "?"}
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
                                            onClick={handleRemoveAvatar}
                                            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all border border-white/20"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Status Dot Trigger */}
                        <div
                            className={`absolute bottom-[-3px] left-[84px] w-5.5 h-5.5 rounded-full border-[3px] border-white flex items-center justify-center bg-white z-40 transition-all duration-300 ${!isReadOnly ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
                            onClick={openStatusSelector}
                        >
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: statusColors[status] || statusColors.online }}></div>
                        </div>

                        {!isReadOnly && <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={e => processImage(e.target.files[0], false)} />}
                    </div>

                    {/* USER INFO CENTERED */}
                    <div className="flex flex-col items-center text-center w-full min-w-0">
                        {mode === "view" ? (
                            <>
                                <h2
                                    style={{ color: activeTheme?.color }}
                                    className="text-[26px] font-black tracking-tight leading-tight mb-1 whitespace-normal break-words w-full px-2"
                                >
                                    {profile?.displayName || profile?.username || "Người dùng"}
                                </h2>
                                <p
                                    style={{ color: activeTheme?.color }}
                                    className="text-[15px] font-bold mb-4 opacity-50"
                                >
                                    {profile?.username || "user"}
                                </p>

                                {profile?.customStatus && (
                                    <div
                                        style={{ color: activeTheme.color, borderColor: `${activeTheme.color}20` }}
                                        className="font-bold px-5 py-2.5 flex items-center gap-2 mb-6 max-w-full"
                                    >
                                        <span className="text-sm break-words">{profile.customStatus}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full mt-2">
                                <h3 className="text-lg font-black text-text-primary mb-1">Đang chỉnh sửa</h3>
                                <p className="text-[11px] font-bold text-text-muted mb-4 uppercase tracking-widest">Cập nhật thông tin của bạn</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="px-6 pb-6">
                    {mode === "view" ? (
                        <>
                            <div className="backdrop-blur-xl mb-10 flex items-center justify-center">
                                {userProfile?.bio ? (
                                    <p
                                        style={{ color: activeTheme?.color }}
                                        className="text-[14px] font-medium whitespace-pre-wrap leading-relaxed opacity-80"
                                    >
                                        {userProfile.bio}
                                    </p>
                                ) : (
                                    <p className="text-[14px] text-text-muted italic font-medium">Chưa có thông tin giới thiệu.</p>
                                )}
                            </div>

                            <div className="flex items-center justify-center p-5">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3
                                            style={{ color: activeTheme?.color }}
                                            className="text-[11px] font-black uppercase tracking-widest mb-0.5 opacity-80"
                                        >
                                            Thành viên từ
                                        </h3>
                                        <p className="text-[14px] font-bold flex items-center justify-center">
                                            <span style={{ color: activeTheme?.color }}>
                                                {formatDate(userProfile?.taoLuc)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <Button
                                    onClick={() => setMode("edit")}
                                    style={{ backgroundColor: activeTheme.color }}
                                    className="w-full !rounded-[20px] !text-white hover:opacity-90 !py-4 transition-all font-black text-xs uppercase tracking-widest border-none"
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">Tên hiển thị</label>
                                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">Tên đăng nhập (Username)</label>
                                    <Input value={username} onChange={e => setUsername(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">Đang làm gì thế?</label>
                                    <Input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder="Suy nghĩ gì đó..." className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !h-12 !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">Giới thiệu bản thân</label>
                                    <Input as="textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="!bg-bg-primary/50 !border-border-primary/50 !text-text-primary !rounded-2xl focus:!bg-bg-secondary focus:!ring-2 focus:!ring-pink-100 font-medium" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2 block">Trạng thái hoạt động</label>
                                    <button
                                        type="button"
                                        onClick={openStatusSelector}
                                        className="w-full bg-bg-primary border border-border-primary text-text-primary h-14 rounded-2xl px-5 flex items-center justify-between outline-none focus:ring-2 focus:ring-pink-100 font-bold transition-all hover:bg-card-bg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: statusColors[status] || statusColors.online }}></div>
                                            <span>
                                                {status === 'online' && 'Đang hoạt động'}
                                                {status === 'idle' && 'Đang vắng mặt'}
                                                {status === 'dnd' && 'Đừng làm phiền'}
                                                {status === 'offline' && 'Ngoại tuyến (Ẩn)'}
                                            </span>
                                        </div>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-text-muted transition-transform duration-300 ${selectorAnchor ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                                    </button>
                                </div>

                                {/* THEME SELECTION */}
                                <div className="pt-2">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-3 block">Giao diện hồ sơ</label>

                                    <div className="space-y-5">
                                        {/* Background Color Picker */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-[10px] font-bold text-text-muted uppercase">Màu nền hồ sơ</span>
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
                                                            Mặc định
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter">Chọn màu nền bất kỳ</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Colors */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-[10px] font-bold text-text-muted uppercase">Màu chủ đạo (Accent)</span>
                                            <div className="flex items-center gap-4 bg-bg-secondary/50 p-3 rounded-2xl border border-border-primary/50">
                                                {/* Hidden Native Picker Trigger */}
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
                                                            Mặc định
                                                        </button>
                                                    </div>

                                                    {/* Quick Presets for convenience */}
                                                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
                                                        {PRESET_COLORS.slice(0, 6).map((c) => (
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
                            </div>

                            <div className="flex gap-3 mt-4 pt-4 border-t border-border-primary/50">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setTheme(userProfile?.theme || DEFAULT_THEME);
                                        setMode("view");
                                    }}
                                    className="!bg-bg-primary/50 !text-text-secondary hover:!bg-bg-primary/80 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-1 border border-border-primary/50 shadow-none"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={luuThongTin}
                                    disabled={loading}
                                    style={{ backgroundColor: activeTheme.color }}
                                    className="!text-white hover:opacity-90 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-[2] border-none shadow-none"
                                >
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* IMAGE EDITOR MODAL */}
            <ImageEditorModal
                isOpen={editorConfig.isOpen}
                imageSrc={editorConfig.imageSrc}
                file={editorConfig.file}
                isBanner={editorConfig.isBanner}
                isGif={editorConfig.isGif}
                onClose={() => setEditorConfig({ ...editorConfig, isOpen: false })}
                onSave={handleSaveImage}
            />

            {/* PORTAL FOR STATUS SELECTOR */}
            {!isReadOnly && selectorAnchor && createPortal(
                <div className="fixed inset-0 z-[10001] md:bg-transparent bg-black/40 backdrop-blur-sm md:backdrop-blur-none flex items-end md:items-start transition-all" onClick={() => setSelectorAnchor(null)}>
                    <div
                        ref={selectorRef}
                        className={`
                            bg-bg-secondary/95 backdrop-blur-3xl border border-border-primary/50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-2 animate-slide-up md:animate-fade-in overflow-hidden
                            ${window.innerWidth < 768
                                ? 'w-full rounded-t-[36px] pb-10 px-4' // Mobile bottom sheet
                                : 'w-[220px] rounded-[32px] fixed' // Desktop popover
                            }
                        `}
                        style={window.innerWidth >= 768 ? {
                            top: Math.min(selectorAnchor.bottom + 8, window.innerHeight - 280),
                            left: Math.min(selectorAnchor.left, window.innerWidth - 240)
                        } : {}}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-1">
                            {window.innerWidth < 768 && (
                                <div className="w-12 h-1.5 bg-border-primary rounded-full mx-auto mt-2 mb-6" />
                            )}
                            {[
                                { id: 'online', label: 'Trực tuyến', sub: 'Đang hoạt động', color: statusColors.online },
                                { id: 'idle', label: 'Vắng mặt', sub: 'Đang bận xíu', color: statusColors.idle },
                                { id: 'dnd', label: 'Đừng làm phiền', sub: 'Bận rộn', color: statusColors.dnd },
                                { id: 'offline', label: 'Ngoại tuyến', sub: 'Đang ẩn mình', color: statusColors.offline }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        setStatus(opt.id);
                                        setSelectorAnchor(null);
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
            )}
        </div>
    );
}