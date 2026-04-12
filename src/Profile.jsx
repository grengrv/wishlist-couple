import { useState } from "react";
import { auth, db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";

export default function Profile({ userProfile, onClose, onUpdate }) {
    const [username, setUsername] = useState(userProfile?.username || "");
    const [avatarPreview, setAvatarPreview] = useState(userProfile?.avatar || null);
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [keoVao, setKeoVao] = useState(false);
    const [error, setError] = useState(null);

    function chonAvatar(file) {
        setError(null);
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Chỉ chấp nhận file ảnh!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
            return;
        }

        // Resize ảnh trước khi lưu
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const size = 200;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");

                // Crop hình vuông ở giữa
                const min = Math.min(img.width, img.height);
                const sx = (img.width - min) / 2;
                const sy = (img.height - min) / 2;
                ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

                const base64 = canvas.toDataURL("image/jpeg", 0.8);
                setAvatarBase64(base64);
                setAvatarPreview(base64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function luuThongTin() {
        setError(null);
        const trimmedName = username.trim();
        
        if (trimmedName === "") {
            setError("Username không được để trống.");
            return;
        }
        if (trimmedName.length < 3 || trimmedName.length > 20) {
            setError("Username phải từ 3 đến 20 ký tự.");
            return;
        }
        
        // Chỉ cho phép chữ (bao gồm tiếng Việt), số và khoảng trắng
        const regex = /^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯ_]+$/;
        if (!regex.test(trimmedName)) {
            setError("Username không được chứa ký tự đặc biệt.");
            return;
        }

        setLoading(true);

        try {
            // Cập nhật Firebase Auth
            await updateProfile(auth.currentUser, {
                displayName: username
            });

            const newAvatar = avatarBase64 || userProfile?.avatar || null;

            // Cập nhật Firestore
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                username: username,
                avatar: newAvatar
            }, { merge: true });

            // Đồng bộ sang các Post đã đăng cũ (Fan-out Update)
            const q = query(collection(db, "wishlist"), where("uid", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const updatePromises = querySnapshot.docs.map(wishDoc => {
                return updateDoc(wishDoc.ref, {
                    themBoi: username,
                    avatarNguoiThem: newAvatar
                });
            });
            await Promise.all(updatePromises);

            onUpdate({ username, avatar: newAvatar });
            setSuccess(true);
            setTimeout(() => {
                window.location.reload(); // Reload tải lại feed
            }, 1200);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-[20px] w-full max-w-[420px] max-h-[90vh] overflow-y-auto relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/40 border-none text-white text-xl cursor-pointer flex items-center justify-center leading-none z-10 transition-colors" onClick={onClose}>×</button>

                <div className="p-6 flex flex-col gap-2.5">
                    <h2 className="text-[22px] font-bold text-text-base mb-6">
                        Cập nhật thông tin
                    </h2>

                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div
                            className={`relative w-[110px] h-[110px] rounded-full cursor-pointer overflow-hidden border-[3px] border-pink-light transition-colors duration-200 group flex items-center justify-center shrink-0 ${keoVao ? "border-pink-brand" : "hover:border-pink-brand"}`}
                            onDragOver={e => { e.preventDefault(); setKeoVao(true); }}
                            onDragLeave={() => setKeoVao(false)}
                            onDrop={e => {
                                e.preventDefault();
                                setKeoVao(false);
                                chonAvatar(e.dataTransfer.files[0]);
                            }}
                            onClick={() => document.getElementById("avatar-input").click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover block" />
                            ) : (
                                <div className="w-full h-full bg-gradient-avatar text-white text-[42px] font-bold flex items-center justify-center">
                                    {userProfile?.username?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => chonAvatar(e.target.files[0])}
                            />
                        </div>
                        <p className="text-xs text-pink-soft mt-2">
                            Nhấn hoặc kéo thả ảnh để thay đổi
                        </p>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2.5">
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <Input
                            type="email"
                            value={auth.currentUser?.email || "Khách ẩn danh"}
                            disabled
                            className="!opacity-50 !cursor-not-allowed"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-[13px] font-bold p-3 rounded-xl border border-red-100 animate-shake mb-2">
                             ⚠ {error}
                        </div>
                    )}

                    <Button
                        onClick={luuThongTin}
                        disabled={loading}
                        className="mt-4"
                    >
                        {success ? "Đã lưu!" : loading ? "Đang lưu..." : "Lưu thông tin"}
                    </Button>
                </div>
            </div>
        </div>
    );
}