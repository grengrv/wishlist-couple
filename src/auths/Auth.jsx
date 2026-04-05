import { useState } from "react";
import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";

export default function Auth() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
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

    return (
        <div className="auth-wrap">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>Wishlist của chúng mình <span className="heart">♥</span></h1>
                    <p>Những điều mơ ước cùng nhau</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => { setMode("login"); setError(""); }}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`auth-tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => { setMode("register"); setError(""); }}
                    >
                        Đăng ký
                    </button>
                </div>

                <div className="auth-form">
                    <input
                        className="inp"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    />
                    <input
                        className="inp"
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    />
                    {error && <p className="auth-error">{error}</p>}
                    <button className="btn-them" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
                    </button>
                </div>
            </div>
        </div>
    );
}