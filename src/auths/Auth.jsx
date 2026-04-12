import { useState } from "react";
import { auth, db } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    updateProfile
} from "firebase/auth";
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useEffect, useCallback } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Auth() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" }); // idle, checking, valid, invalid

    // Helper: Validate Email
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };

    // Helper: Validate Password (8 chars, 1 upper, 1 number)
    const validatePassword = (pass) => {
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        return pass.length >= 8 && hasUpper && hasNumber;
    };

    // Helper: Validate Username format
    const validateUsernameFormat = (name) => {
        return /^[a-zA-Z0-9_]{3,20}$/.test(name);
    };

    // Continuous Username Check
    useEffect(() => {
        if (mode !== "register" || !username.trim()) {
            setUsernameStatus({ state: "idle", message: "" });
            return;
        }

        if (!validateUsernameFormat(username)) {
            setUsernameStatus({ state: "invalid", message: "3-20 ký tự, không dấu, không space" });
            return;
        }

        setUsernameStatus({ state: "checking", message: "Đang kiểm tra..." });
        
        const timer = setTimeout(async () => {
            try {
                const q = query(collection(db, "users"), where("username", "==", username.trim()));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setUsernameStatus({ state: "invalid", message: "Username này đã có người dùng" });
                } else {
                    setUsernameStatus({ state: "valid", message: "Username hợp lệ" });
                }
            } catch (err) {
                console.error(err);
                setUsernameStatus({ state: "idle", message: "" });
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [username, mode]);

    async function handleSubmit() {
        setError("");
        
        // Validation Checks for Register
        if (mode === "register") {
            if (!validateUsernameFormat(username)) {
                setError("Username không hợp lệ (3-20 ký tự, chữ/số/_)");
                return;
            }
            if (usernameStatus.state === "invalid") {
                setError(usernameStatus.message);
                return;
            }
            if (!validateEmail(email)) {
                setError("Email không đúng định dạng");
                return;
            }
            if (!validatePassword(password)) {
                setError("Mật khẩu yếu: Cần ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số");
                return;
            }
        }

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

                <div className="flex flex-col gap-3">
                    {mode === "register" && (
                        <div className="relative group/field h-[46px]">
                            <Input
                                type="text"
                                placeholder="Username (3-20 ký tự)"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className={`h-full ${usernameStatus.state === 'invalid' ? 'border-red-400 focus:border-red-500' : ''}`}
                            />
                            <div className="absolute right-3.5 inset-y-0 flex items-center gap-2 pointer-events-none">
                                <div className="flex items-center gap-1.5 pointer-events-auto">
                                    {usernameStatus.state === 'checking' && <div className="w-3.5 h-3.5 border-2 border-pink-light border-t-pink-brand rounded-full animate-spin"></div>}
                                    {usernameStatus.state === 'valid' && (
                                        <div className="w-4 h-4 flex items-center justify-center text-green-500 text-[11px] font-bold">✓</div>
                                    )}
                                    {usernameStatus.state === 'invalid' && (
                                        <div className="w-4 h-4 flex items-center justify-center text-red-500 text-[10px] font-bold">✕</div>
                                    )}
                                    <InfoTooltip text="3-20 ký tự. Chỉ dùng chữ cái, số và dấu gạch dưới (_). Không dùng khoảng trắng." />
                                </div>
                            </div>
                            {usernameStatus.message && (
                                <p className={`absolute top-full left-2 text-[10px] mt-0.5 font-medium ${usernameStatus.state === 'invalid' ? 'text-red-500' : 'text-green-600'}`}>
                                    {usernameStatus.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="relative group/field h-[46px] mt-1">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            className="h-full"
                        />
                        <div className="absolute right-3.5 inset-y-0 flex items-center">
                            <InfoTooltip text="Email hợp lệ (VD: example@mail.com)" />
                        </div>
                    </div>

                    <div className="relative group/field h-[46px]">
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            className="h-full"
                        />
                        <div className="absolute right-3.5 inset-y-0 flex items-center">
                            <InfoTooltip text="Tối thiểu 8 ký tự. Bao gồm ít nhất 1 chữ hoa và 1 chữ số." />
                        </div>
                    </div>

                    {error && <p className="text-[12px] font-medium text-pink-brand bg-pink-pale/60 border border-pink-border/30 px-3 py-2.5 rounded-xl text-center animate-shake">{error}</p>}
                    
                    <Button onClick={handleSubmit} disabled={loading || (mode === 'register' && usernameStatus.state === 'invalid')}>
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

// Sub-component: Info Icon with Tooltip
function InfoTooltip({ text }) {
    return (
        <div className="relative group">
            <div className="w-4 h-4 rounded-full border border-pink-border flex items-center justify-center text-[10px] text-pink-soft cursor-help hover:bg-pink-faint transition-colors">i</div>
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 bg-gray-800 text-white text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] shadow-xl pointer-events-none">
                <div className="font-bold border-b border-white/20 pb-1 mb-1 text-pink-light">Yêu cầu:</div>
                {text}
                {/* Tooltip Arrow - Overlapped to fix gap */}
                <div className="absolute -bottom-[7px] right-2 border-8 border-transparent border-t-gray-800"></div>
            </div>
        </div>
    );
}