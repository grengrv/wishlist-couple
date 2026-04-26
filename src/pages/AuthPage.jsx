import { useState, useEffect } from "react";
import { auth, db } from "@config/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { notifyDangNhap, notifyDangKy, notifyError } from "@utils/notify";

import { useLanguage } from "@context/LanguageContext";

export default function Auth() {
    const { t } = useLanguage();
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });
    const [activeTooltip, setActiveTooltip] = useState(null);

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
            setUsernameStatus({ state: "invalid", message: t("username_invalid_format") });
            return;
        }

        setUsernameStatus({ state: "checking", message: t("checking_username") });

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

        return () => clearTimeout(timer);
    }, [username, mode]);

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
                await setDoc(doc(db, "users", result.user.uid), {
                    username: username,
                    email: email,
                    avatar: null,
                    taoLuc: new Date()
                });
                notifyDangKy();
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
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (mode === 'register' && usernameStatus.state === 'invalid')}
                        className="!rounded-2xl !py-4 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all mt-4 shadow-none active:scale-95"
                    >
                        {loading ? t("processing") : mode === "login" ? t("login") : t("register")}
                    </Button>

                    {/* Switch Mode Link */}
                    <div className="text-center mt-8 pt-8 border-t border-border-primary/50">
                        <button
                            onClick={toggleMode}
                            className="group text-[14px] font-bold text-text-muted hover:text-text-primary transition-colors inline-flex flex-col items-center gap-1"
                        >
                            {mode === "login" ? (
                                <>
                                    <span>{t("no_account")}</span>
                                    <span className="text-pink-500 font-black uppercase tracking-widest text-[11px] group-hover:scale-105 transition-transform">{t("register_now")}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t("has_account")}</span>
                                    <span className="text-pink-500 font-black uppercase tracking-widest text-[11px] group-hover:scale-105 transition-transform">{t("back_to_login")}</span>
                                </>
                            )}
                        </button>
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
