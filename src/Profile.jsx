import { useState } from "react";
import { auth, db } from "./firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

export default function Profile({ userProfile, onClose, onUpdate }) {
    const [username, setUsername] = useState(userProfile?.username || "");
    const [avatarPreview, setAvatarPreview] = useState(userProfile?.avatar || null);
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [keoVao, setKeoVao] = useState(false);

    function chonAvatar(file) {
        if (!file || !file.type.startsWith("image/")) return;

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
        if (username.trim() === "") return;
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}
                style={{ maxWidth: "420px" }}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-body">
                    <h2 className="modal-ten" style={{ marginBottom: "1.5rem" }}>
                        Cập nhật thông tin
                    </h2>

                    {/* Avatar */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div
                            className={`avatar-upload ${keoVao ? "drag-over" : ""}`}
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
                                <img src={avatarPreview} alt="avatar" className="avatar-img-large" />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {userProfile?.username?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={e => chonAvatar(e.target.files[0])}
                            />
                        </div>
                        <p style={{ fontSize: "12px", color: "#b0889a", marginTop: "8px" }}>
                            Nhấn hoặc kéo thả ảnh để thay đổi
                        </p>
                    </div>

                    {/* Username */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input
                            className="inp"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                        <input
                            className="inp"
                            type="email"
                            value={auth.currentUser?.email || "Khách ẩn danh"}
                            disabled
                            style={{ opacity: 0.5, cursor: "not-allowed" }}
                        />
                    </div>

                    <button
                        className="btn-them"
                        onClick={luuThongTin}
                        disabled={loading}
                        style={{ marginTop: "1rem" }}
                    >
                        {success ? "Đã lưu!" : loading ? "Đang lưu..." : "Lưu thông tin"}
                    </button>
                </div>
            </div>
        </div>
    );
}