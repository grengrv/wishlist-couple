import { useState } from "react";
import { auth, db } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Auth() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (username.trim() === "") {
                    setError("Vui lòng nhập username");
                    setLoading(false);
                    return;
                }
                const result = await createUserWithEmailAndPassword(auth, email, password);

                // Lưu displayName vào Firebase Auth
                await updateProfile(result.user, { displayName: username });

                // Lưu thông tin user vào Firestore
                await setDoc(doc(db, "users", result.user.uid), {
                    username: username,
                    email: email,
                    avatar: null,
                    taoLuc: new Date()
                });
            }
        } catch (err) {
            if (err.code === "auth/invalid-credential") setError("Email hoặc mật khẩu không đúng");
            else if (err.code === "auth/email-already-in-use") setError("Email đã được sử dụng");
            else if (err.code === "auth/weak-password") setError("Mật khẩu phải ít nhất 6 ký tự");
            else if (err.code === "auth/invalid-email") setError("Email không hợp lệ");
            else setError("Có lỗi xảy ra, thử lại nhé");
        }
        setLoading(false);
    }

    async function handleAnonymous() {
        setError("");
        setLoading(true);
        try {
            await signInAnonymously(auth);
        } catch (err) {
            setError("Không thể đăng nhập ẩn danh, thử lại nhé");
        }
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-center p-6 py-10">
            <div className="bg-white rounded-[20px] border border-pink-border p-8 w-full max-w-[400px] shadow-[0_4px_24px_rgba(194,24,91,0.06)]">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-deep-red">Wishlist của chúng mình <span className="inline-block text-pink-hot animate-beat">♥</span></h1>
                    <p className="text-[13px] text-pink-soft mt-1">Những điều mơ ước cùng nhau</p>
                </div>

                <div className="flex border border-pink-border rounded-xl overflow-hidden mb-5">
                    <button
                        className={`flex-1 p-2.5 border-none bg-white text-sm cursor-pointer transition-all duration-150 ${mode === "login" ? "bg-pink-pale text-pink-brand font-semibold" : "text-pink-soft font-medium"}`}
                        onClick={() => { setMode("login"); setError(""); }}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`flex-1 p-2.5 border-none bg-white text-sm cursor-pointer transition-all duration-150 ${mode === "register" ? "bg-pink-pale text-pink-brand font-semibold" : "text-pink-soft font-medium"}`}
                        onClick={() => { setMode("register"); setError(""); }}
                    >
                        Đăng ký
                    </button>
                </div>

                <div className="flex flex-col gap-2.5">
                    {mode === "register" && (
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    )}
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    />
                    <Input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    />
                    {error && <p className="text-[13px] text-pink-brand bg-pink-pale px-3 py-2 rounded-lg text-center">{error}</p>}
                    
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
                    </Button>

                    <div className="flex items-center gap-2.5 text-pink-muted text-[13px] auth-divider-line py-1"><span>hoặc</span></div>

                    <Button variant="ghost" onClick={handleAnonymous} disabled={loading}>
                        Dùng thử không cần đăng ký
                    </Button>
                </div>
            </div>
        </div>
    );
}