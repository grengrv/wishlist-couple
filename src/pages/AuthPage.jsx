import { useState, useEffect } from "react";
import { auth, db } from "@config/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { notifyDangNhap, notifyDangKy, notifyError, notifyLogout } from "@utils/notify";
import { sileo } from "sileo";

import { useLanguage } from "@context/LanguageContext";

import { signOut } from "firebase/auth";
export default function Auth({ user }) {
    const { t } = useLanguage();
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });
    const [activeTooltip, setActiveTooltip] = useState(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            notifyLogout();
        } catch (err) {
            console.error(err);
            notifyError(t("logout_failed"));
        }
    };

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
            const initTimer = setTimeout(() => setUsernameStatus({ state: "idle", message: "" }), 0);
            return () => clearTimeout(initTimer);
        }

        if (!validateUsernameFormat(username)) {
            const formatTimer = setTimeout(() => setUsernameStatus({ state: "invalid", message: t("username_invalid_format") }), 0);
            return () => clearTimeout(formatTimer);
        }

        const checkingTimer = setTimeout(() => setUsernameStatus({ state: "checking", message: t("checking_username") }), 0);

        const timer = setTimeout(async () => {
            try {
                const q = query(collection(db, "users"), where("username", "==", username.trim()));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setUsernameStatus({ state: "invalid", message: t("username_taken") });
                } else {
                    setUsernameStatus({ state: "valid", message: t("username_valid") });
                }
            } catch (err) {
                console.error(err);
                setUsernameStatus({ state: "idle", message: "" });
            }
        }, 600);

        return () => {
            clearTimeout(checkingTimer);
            clearTimeout(timer);
        };
    }, [username, mode, t]);

    // Nếu người dùng đã đăng nhập nhưng chưa xác minh email, hiển thị giao diện xác minh
    // PHẢI đặt sau các hooks để tránh lỗi "Rendered fewer hooks than expected"
    if (user && !user.emailVerified && !user.isAnonymous) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
                <div className="bg-bg-secondary w-full max-w-[460px] p-10 rounded-[40px] border border-border-primary shadow-2xl text-center animate-slide-up">
                    <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-sm">
                        <span className="animate-pulse">✉️</span>
                    </div>
                    <h2 className="text-3xl font-black text-text-primary tracking-tight mb-4">
                        {t("verify_email_title")}
                    </h2>
                    <p className="text-text-muted font-bold text-[15px] leading-relaxed mb-8">
                        {t("verify_email_msg")}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={() => window.location.reload()}
                            className="!rounded-2xl !py-4 bg-pink-500 text-white font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg active:scale-95"
                        >
                            {t("i_have_verified")}
                        </Button>
                        <Button 
                            variant="ghost"
                            onClick={async () => {
                                try {
                                    await sendEmailVerification(user);
                                    sileo.success({ title: t("verification_email_sent") });
                                } catch (e) {
                                    console.error(e);
                                    notifyError(t("resend_failed"));
                                }
                            }}
                            className="!rounded-2xl !py-4 !text-text-muted hover:!text-text-primary font-black text-[11px] uppercase tracking-widest transition-all"
                        >
                            {t("resend_verification")}
                        </Button>
                        <button 
                            onClick={handleLogout}
                            className="mt-4 text-[11px] font-black uppercase tracking-widest text-text-muted/40 hover:text-rose-500 transition-colors"
                        >
                            {t("logout")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    async function handleSubmit() {
        if (mode === "register") {
            if (!validateUsernameFormat(username)) {
                notifyError(t("username_invalid_tip"));
                return;
            }
            if (usernameStatus.state === "invalid") {
                notifyError(usernameStatus.message);
                return;
            }
            if (!validateEmail(email)) {
                notifyError(t("email_format_error"));
                return;
            }
            if (!validatePassword(password)) {
                notifyError(t("password_weak_error"));
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                notifyDangNhap();
            } else {
                if (username.trim() === "") {
                    notifyError(t("username_required"));
                    setLoading(false);
                    return;
                }
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: username });
                
                // Gửi email xác minh
                try {
                    await sendEmailVerification(result.user);
                } catch (e) {
                    console.error("Lỗi gửi email xác minh:", e);
                }

                await setDoc(doc(db, "users", result.user.uid), {
                    username: username,
                    email: email,
                    avatar: null,
                    taoLuc: new Date()
                });
                notifyDangKy();
                sileo.success({ title: t("verification_email_sent"), duration: 6000 });
            }
        } catch (err) {
            if (err.code === "auth/invalid-credential") notifyError(t("login_invalid_error"));
            else if (err.code === "auth/email-already-in-use") notifyError(t("email_in_use_error"));
            else if (err.code === "auth/weak-password") notifyError(t("password_too_short_error"));
            else if (err.code === "auth/invalid-email") notifyError(t("email_format_error"));
            else notifyError(t("general_error"));
        }
        setLoading(false);
    }
    
    async function handleGoogleSignIn() {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Check if user profile exists
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                // First time login - Create profile
                let baseUsername = user.displayName ? user.displayName.replace(/\s+/g, '_').toLowerCase() : user.email.split('@')[0];
                // Remove special chars except _
                baseUsername = baseUsername.replace(/[^a-z0-9_]/g, '');
                
                // Ensure it's unique (simplified for now - add random suffix)
                const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
                
                await setDoc(doc(db, "users", user.uid), {
                    username: uniqueUsername,
                    email: user.email,
                    avatar: user.photoURL || null,
                    taoLuc: new Date()
                });
                notifyDangKy();
            } else {
                notifyDangNhap();
            }
        } catch (err) {
            console.error("Lỗi đăng nhập Google:", err);
            if (err.code !== "auth/cancelled-popup-request") {
                notifyError(t("general_error"));
            }
        }
        setLoading(false);
    }

    async function handleForgotPassword() {
        if (!email) {
            notifyError(t("email_required"));
            return;
        }
        if (!validateEmail(email)) {
            notifyError(t("email_format_error"));
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            sileo.success({ title: t("reset_link_sent") });
        } catch (err) {
            console.error(err);
            notifyError(t("reset_error"));
        }
    }

    const toggleMode = () => {
        setMode(prev => prev === "login" ? "register" : "login");
        // Reset fields when switching
        setUsername("");
        setEmail("");
        setPassword("");
        setUsernameStatus({ state: "idle", message: "" });
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
            <div key={mode} className="bg-bg-secondary w-full max-w-[420px] p-8 md:p-10 rounded-[32px] border border-border-primary shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-slide-up relative overflow-hidden group">

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                {/* Logo / Title */}
                <div className="text-center mb-10 relative z-10">
                    <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-pink-500/10">
                        <span className="animate-beat">♥</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">
                        {mode === "login" ? t("welcome_back") : t("create_account")}
                    </h1>
                    <p className="text-text-muted font-bold mt-2 text-sm leading-relaxed">
                        {mode === "login"
                            ? t("login_subtitle")
                            : t("register_subtitle")}
                    </p>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-5 relative z-10">
                    {mode === "register" && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-1 flex justify-between items-center">
                                <span>Username</span>
                                <InfoIcon
                                    id="username"
                                    activeTooltip={activeTooltip}
                                    setActiveTooltip={setActiveTooltip}
                                    text={t("username_tip")}
                                />
                            </label>
                            <Input
                                type="text"
                                placeholder="Tên hiển thị của bạn..."
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className={`!rounded-2xl !bg-bg-primary/50 !border-border-primary !h-12 !font-bold transition-all focus:!bg-bg-secondary ${usernameStatus.state === 'invalid' ? '!border-red-400 focus:!ring-red-400/10' : ''}`}
                            />
                            {usernameStatus.message && (
                                <p className={`text-[10px] font-bold ml-1 flex items-center gap-1 ${usernameStatus.state === 'invalid' ? 'text-red-500' : 'text-green-500'}`}>
                                    <span className="text-[12px]">{usernameStatus.state === 'invalid' ? '✕' : '✓'}</span> {usernameStatus.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-1 flex justify-between items-center">
                            <span>Email</span>
                            <InfoIcon
                                id="email"
                                activeTooltip={activeTooltip}
                                setActiveTooltip={setActiveTooltip}
                                text={t("email_tip")}
                            />
                        </label>
                        <Input
                            type="email"
                            placeholder="username@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            className="!rounded-2xl !bg-bg-primary/50 !border-border-primary !h-12 !font-bold transition-all focus:!bg-bg-secondary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-1 flex justify-between items-center">
                            <span>{t("password")}</span>
                            <InfoIcon
                                id="password"
                                activeTooltip={activeTooltip}
                                setActiveTooltip={setActiveTooltip}
                                text={t("password_tip")}
                            />
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            className="!rounded-2xl !bg-bg-primary/50 !border-border-primary !h-12 !font-bold transition-all focus:!bg-bg-secondary"
                        />
                        {mode === "login" && (
                            <button
                                onClick={handleForgotPassword}
                                className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-pink-500 transition-colors ml-1 w-fit"
                            >
                                {t("forgot_password")}
                            </button>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (mode === 'register' && usernameStatus.state === 'invalid')}
                        className="!rounded-2xl !py-4 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all mt-4 shadow-none active:scale-95"
                    >
                        {loading ? t("processing") : mode === "login" ? t("login") : t("register")}
                    </Button>

                    <div className="flex items-center gap-4 my-2">
                        <div className="h-[1px] flex-1 bg-border-primary/50"></div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t("or_signin_with")}</span>
                        <div className="h-[1px] flex-1 bg-border-primary/50"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full !py-3.5 !rounded-2xl border-2 border-border-primary bg-bg-secondary hover:bg-bg-primary transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-[13px] font-black text-text-primary tracking-tight">
                            {t("google_signin")}
                        </span>
                    </button>

                    {/* Switch Mode Link */}
                    <div className="text-center mt-8 pt-8 border-t border-border-primary/50">
                            <div
                                className="text-[14px] font-bold text-text-muted inline-flex flex-col items-center gap-1 cursor-default"
                            >
                                {mode === "login" ? (
                                    <>
                                        <span>{t("no_account")}</span>
                                        <span 
                                            onClick={toggleMode}
                                            className="text-pink-500 font-black uppercase tracking-widest text-[11px] hover:text-pink-700 hover:scale-105 hover:underline transition-all cursor-pointer"
                                        >
                                            {t("register_now")}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t("has_account")}</span>
                                        <span 
                                            onClick={toggleMode}
                                            className="text-pink-500 font-black uppercase tracking-widest text-[11px] hover:text-pink-700 hover:scale-105 hover:underline transition-all cursor-pointer"
                                        >
                                            {t("back_to_login")}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}

function InfoIcon({ id, text, activeTooltip, setActiveTooltip }) {
    const isVisible = activeTooltip === id;

    return (
        <div
            className="relative cursor-help"
            onMouseEnter={() => setActiveTooltip(id)}
            onMouseLeave={() => setActiveTooltip(null)}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${isVisible ? 'text-pink-500' : 'text-text-muted/40 hover:text-pink-500'}`}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div className={`absolute bottom-full right-0 mb-2 w-48 p-3 bg-text-primary text-bg-primary text-[10px] leading-relaxed rounded-2xl transition-all duration-300 z-[100] shadow-2xl pointer-events-none ${isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}`}>
                {text}
                <div className="absolute -bottom-1 right-2 w-2 h-2 bg-text-primary rotate-45"></div>
            </div>
        </div>
    );
}
