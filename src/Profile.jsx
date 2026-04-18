import { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import ImageEditorModal from "./components/ImageEditorModal";
import { notifyCapNhatHoSo, notifyDoiAvatar, notifyDoiBanner, notifyError } from "./utils/notify";

export default function Profile({ userProfile, onClose, onUpdate, isReadOnly = false }) {
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
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(userProfile?.banner || null);
    const [bannerBase64, setBannerBase64] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

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

    function processImage(file, isBanner = false) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            notifyError("Chỉ chấp nhận file ảnh!");
            return;
        }

        const isGif = file.type === "image/gif";
        
        // Optimized limits for Storage usage
        if (isGif && file.size > 2 * 1024 * 1024) {
            notifyError("Ảnh GIF quá lớn! Vui lòng chọn ảnh dưới 2MB.");
            return;
        } else if (!isGif && file.size > 10 * 1024 * 1024) {
            notifyError("Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setEditorConfig({
                isOpen: true,
                imageSrc: e.target.result,
                isBanner,
                isGif,
                file
            });
        };
        reader.readAsDataURL(file);
    }

    function handleSaveImage(processedImage, originalFile = null) {
        if (editorConfig.isBanner) {
            setBannerBase64(processedImage);
            setBannerPreview(processedImage);
            setBannerFile(originalFile);
            notifyDoiBanner();
        } else {
            setAvatarBase64(processedImage);
            setAvatarPreview(processedImage);
            setAvatarFile(originalFile);
            notifyDoiAvatar();
        }
        setEditorConfig({ isOpen: false, imageSrc: null, isBanner: false, isGif: false, file: null });
    }

    async function luuThongTin() {
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

            let finalAvatar = userProfile?.avatar || null;
            let finalBanner = userProfile?.banner || null;
            const now = Date.now();

            if (avatarBase64) {
                const avatarRef = ref(storage, `avatars/${auth.currentUser.uid}`);
                if (avatarFile) {
                    // Upload original GIF file
                    await uploadBytes(avatarRef, avatarFile);
                } else {
                    await uploadString(avatarRef, avatarBase64, 'data_url');
                }
                const downloadUrl = await getDownloadURL(avatarRef);
                // Append timestamp to prevent caching
                finalAvatar = downloadUrl.includes('?') 
                    ? `${downloadUrl}&t=${now}` 
                    : `${downloadUrl}?t=${now}`;
            }

            if (bannerBase64) {
                const bannerRef = ref(storage, `banners/${auth.currentUser.uid}`);
                if (bannerFile) {
                    // Upload original GIF file
                    await uploadBytes(bannerRef, bannerFile);
                } else {
                    await uploadString(bannerRef, bannerBase64, 'data_url');
                }
                const downloadUrl = await getDownloadURL(bannerRef);
                // Append timestamp to prevent caching
                finalBanner = downloadUrl.includes('?') 
                    ? `${downloadUrl}&t=${now}` 
                    : `${downloadUrl}?t=${now}`;
            }

            const updatedData = {
                username: trimmedUsername,
                displayName: trimmedDisplayName,
                bio: bio.trim(),
                status,
                customStatus: customStatus.trim(),
                avatar: finalAvatar,
                banner: finalBanner
            };

            await setDoc(doc(db, "users", auth.currentUser.uid), updatedData, { merge: true });

            if (trimmedUsername !== userProfile?.username || finalAvatar !== userProfile?.avatar) {
                const q = query(collection(db, "wishlist"), where("uid", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                const updatePromises = querySnapshot.docs.map(wishDoc => {
                    return updateDoc(wishDoc.ref, {
                        themBoi: trimmedUsername,
                        avatarNguoiThem: finalAvatar
                    });
                });
                await Promise.all(updatePromises);
            }

            if (onUpdate) onUpdate(updatedData);
            notifyCapNhatHoSo();
            setMode("view");
        } catch (err) {
            notifyError("Cập nhật thông tin thất bại");
            console.error(err);
        }
        setLoading(false);
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return "Mới tham gia";
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString("vi-VN", { month: 'short', year: 'numeric', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-pink-900/30 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={onClose}>
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
                    {!isReadOnly && <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={e => processImage(e.target.files[0], true)} />}

                    {/* CLOSE BTN */}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white backdrop-blur-md transition-all z-20" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* AVATAR CENTERED */}
                <div className="px-6 relative flex flex-col items-center pb-2">
                    <div className="relative -mt-[60px] group mb-4 z-30">
                        <div className={`w-[120px] h-[120px] rounded-[36px] border-[6px] border-white bg-white shadow-xl overflow-hidden relative ${!isReadOnly ? 'cursor-pointer' : ''} rotate-3 group-hover:rotate-0 transition-transform duration-500`} onClick={() => !isReadOnly && mode === "edit" && document.getElementById("avatar-upload").click()}>
                            {avatarPreview ? (
                                <img key={avatarPreview} src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-pink-400 to-rose-400">
                                    {(userProfile?.displayName || userProfile?.username || "?")[0].toUpperCase()}
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

                    {/* NAMES & STATUS PILL */}
                    {mode === "view" && (
                        <div className="flex flex-col items-center text-center w-full">
                            <h2 className="text-[26px] font-black text-gray-900 tracking-tight leading-none mb-1">
                                {userProfile?.displayName || userProfile?.username}
                            </h2>
                            <p className="text-[15px] font-bold text-gray-400 mb-4">
                                @{userProfile?.username}
                            </p>

                            {userProfile?.customStatus && (
                                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100/50 text-pink-500 font-bold px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 mb-6 max-w-full">
                                    <span className="text-lg">💭</span>
                                    <span className="truncate">{userProfile.customStatus}</span>
                                </div>
                            )}
                        </div>
                    )}
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