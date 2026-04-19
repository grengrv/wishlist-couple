import { useState, useEffect, useCallback } from "react";
import { toastStore } from "./utils/toastStore";
import { auth, db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import ImageEditorModal from "./components/ImageEditorModal";
import { notifyCapNhatHoSo, notifyDoiAvatar, notifyDoiBanner, notifyError, notifyCompressing } from "./utils/notify";
import { useConfirm } from "./context/ConfirmContext";

export default function Profile({ userProfile, onClose, onUpdate, isReadOnly = false }) {
    const confirm = useConfirm();
    const [mode, setMode] = useState("view"); // "view" | "edit"

    // Safety check: ensure profile is always an object
    const profile = userProfile || {};

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
        if (mode === "view") {
            setDisplayName(userProfile?.displayName || userProfile?.username || "");
            setUsername(userProfile?.username || "");
            setBio(userProfile?.bio || "");
            setStatus(userProfile?.status || "online");
            setCustomStatus(userProfile?.customStatus || "");
            setAvatarPreview(userProfile?.avatar || null);
            setBannerPreview(userProfile?.banner || null);
        }
    }, [userProfile, mode]);

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
        bannerBase64 !== null;

    const isActiveAction = loading || mode === "edit";

    const handleRequestClose = useCallback(async () => {
        if (loading) return; // Completely disable closing while uploading

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

    // ESC Key handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleRequestClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleRequestClose]);

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

            if (trimmedUsername !== profile.username) payload.username = trimmedUsername;
            if (trimmedDisplayName !== currentDisplayName) payload.displayName = trimmedDisplayName;
            if (bio.trim() !== currentBio) payload.bio = bio.trim();
            if (status !== currentStatus) payload.status = status;
            if (customStatus.trim() !== currentCustomStatus) payload.customStatus = customStatus.trim();
            if (avatarBase64) payload.avatar = avatarBase64;
            if (bannerBase64) payload.banner = bannerBase64;

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
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString("vi-VN", { month: 'short', year: 'numeric', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-pink-900/30 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => !isActiveAction && handleRequestClose()}>
            <div className="bg-white/95 backdrop-blur-3xl w-full max-w-[380px] rounded-[40px] overflow-hidden relative shadow-[0_30px_60px_rgba(236,72,153,0.15)] animate-slide-up flex flex-col font-sans border border-white" onClick={e => e.stopPropagation()}>

                {/* BANNER */}
                <div className="relative w-full h-[140px] bg-gradient-to-br from-pink-300 via-purple-300 to-rose-300 group transition-all duration-500 overflow-hidden">
                    {/* Decorative overlay for banner */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                    {bannerPreview && <img key={bannerPreview} src={bannerPreview} alt="banner" className="w-full h-full object-cover relative z-0" />}

                    {mode === "edit" && !isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20" onClick={() => document.getElementById("banner-upload").click()}>
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg hover:bg-white text-pink-500 font-black text-xs uppercase tracking-widest transition-all">
                                Thay đổi ảnh nền
                            </div>
                        </div>
                    )}
                    {mode === "view" && !isReadOnly && (
                        <div className="absolute inset-0 cursor-pointer z-10" onClick={() => { setMode("edit"); setTimeout(() => document.getElementById("banner-upload").click(), 50); }} />
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
                    <div className="relative -mt-[60px] group z-30 shrink-0">
                        <div
                            className={`w-[120px] h-[120px] rounded-[36px] border-[6px] border-white bg-white shadow-xl overflow-hidden relative ${!isReadOnly ? 'cursor-pointer' : ''} rotate-3 group-hover:rotate-0 transition-transform duration-500`}
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
                                    {(profile?.displayName || profile?.username || "?")[0].toUpperCase()}
                                </div>
                            )}

                            {mode === "edit" && !isReadOnly && (
                                <div className="absolute inset-0 bg-pink-500/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </div>
                            )}
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-[-4px] right-[-4px] w-8 h-8 rounded-full border-[5px] border-white flex items-center justify-center shadow-md bg-white z-40 transition-colors duration-300">
                            <div className="w-full h-full rounded-full" style={{ backgroundColor: statusColors[status] || statusColors.online }}></div>
                        </div>
                        {!isReadOnly && <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={e => processImage(e.target.files[0], false)} />}
                    </div>

                    {/* USER INFO CENTERED */}
                    <div className="flex flex-col items-center text-center w-full min-w-0">
                        {mode === "view" ? (
                            <>
                                <h2 className="text-[26px] font-black text-gray-900 tracking-tight leading-tight mb-1 whitespace-normal break-words w-full px-2">
                                    {profile?.displayName || profile?.username || "Người dùng"}
                                </h2>
                                <p className="text-[15px] font-bold text-gray-400 mb-4">
                                    @{profile?.username || "user"}
                                </p>

                                {profile?.customStatus && (
                                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100/50 text-pink-500 font-bold px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 mb-6 max-w-full">
                                        <span className="text-lg shrink-0">💭</span>
                                        <span className="text-sm break-words">{profile.customStatus}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full mt-2">
                                <h3 className="text-lg font-black text-gray-800 mb-1">Đang chỉnh sửa</h3>
                                <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Cập nhật thông tin của bạn</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="px-6 pb-6">
                    {mode === "view" ? (
                        <>
                            <div className="bg-gray-50/80 border border-gray-100 rounded-[28px] p-5 mb-4 shadow-inner">
                                <h3 className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    Giới thiệu bản thân
                                </h3>
                                {userProfile?.bio ? (
                                    <p className="text-[14px] text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">{userProfile.bio}</p>
                                ) : (
                                    <p className="text-[14px] text-gray-400 italic font-medium">Chưa có thông tin giới thiệu.</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-400">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Thành viên từ</h3>
                                        <p className="text-[14px] text-gray-800 font-bold">{formatDate(userProfile?.taoLuc)}</p>
                                    </div>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <Button
                                    onClick={() => setMode("edit")}
                                    className="w-full !rounded-[20px] !bg-gray-900 !text-white hover:!bg-pink-500 !py-4 shadow-xl shadow-gray-200 transition-all font-black text-xs uppercase tracking-widest"
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tên hiển thị</label>
                                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="!bg-gray-50 !border-gray-100 !text-gray-900 !h-12 !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tên đăng nhập (Username)</label>
                                    <Input value={username} onChange={e => setUsername(e.target.value)} className="!bg-gray-50 !border-gray-100 !text-gray-900 !h-12 !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Đang làm gì thế?</label>
                                    <Input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder="Suy nghĩ gì đó..." className="!bg-gray-50 !border-gray-100 !text-gray-900 !h-12 !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Giới thiệu bản thân</label>
                                    <Input as="textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="!bg-gray-50 !border-gray-100 !text-gray-900 !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 font-medium" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Trạng thái hoạt động</label>
                                    <div className="relative">
                                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-100 text-gray-900 h-12 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-pink-100 font-bold appearance-none">
                                            <option value="online">🟢 Đang hoạt động (Online)</option>
                                            <option value="idle">🌙 Đang vắng mặt (Idle)</option>
                                            <option value="dnd">⛔ Xin đừng làm phiền (DND)</option>
                                            <option value="offline">⚫ Ẩn (Offline)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                <Button onClick={() => setMode("view")} className="!bg-gray-100 !text-white-600 hover:!bg-gray-200 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-1">
                                    Hủy
                                </Button>
                                <Button onClick={luuThongTin} disabled={loading} className="!bg-pink-500 !text-white hover:!bg-pink-600 !py-4 !rounded-[20px] font-black text-xs uppercase tracking-widest flex-[2] shadow-xl shadow-pink-200">
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
        </div>
    );
}