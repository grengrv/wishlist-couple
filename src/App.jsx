import { useState, useEffect } from "react";
import { requestNotificationPermission } from "@utils/pushNotification";
import { Routes, Route } from "react-router-dom";
import { auth, db } from "@config/firebase";
import { onAuthStateChanged, signOut, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { ConfirmProvider } from "@context/ConfirmContext";
import { PreviewProvider } from "@context/PreviewContext";
import AppToast from "@components/ui/AppToast";

import ProfilePage from "@pages/ProfilePage";
import Header from "@components/layout/Header";
import { notifyLogout, notifyError } from "@utils/notify";
import Footer from "@components/layout/Footer";
import AuthPage from "@pages/AuthPage";
import AdminPage from "@pages/AdminPage";
import { ADMIN_EMAIL } from "@constants";
import BottomNav from "@components/layout/BottomNav";
import PWAUpdatePrompt from "@components/pwa/PWAUpdatePrompt"
import PWAUpdater from "@components/pwa/PWAUpdater"
import Button from "@components/ui/Button";
import { toastStore } from "@utils/toastStore";

// Pages
import HomePage from "@pages/HomePage";
import GroupsPage from "@pages/GroupsPage";
import GroupDetailPage from "@pages/GroupDetailPage";
import InvitePage from "@pages/InvitePage";
import AddWishPage from "@pages/AddWishPage";
import PersonalPage from "@pages/PersonalPage";
import TermsPage from "@pages/TermsPage";
import PrivacyPage from "@pages/PrivacyPage";

import { useLanguage } from "@context/LanguageContext";

function App() {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      notifyLogout();
    } catch (err) {
      notifyError(t("logout_failed"));
    }
  };

  // Lắng nghe trạng thái đăng nhập Firebase
  useEffect(() => {
    let unsubProfile = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setChecking(false);

      if (u && !u.isAnonymous) {
        // Request notification permission and save token
        requestNotificationPermission(u.uid);

        // Load profile từ Firestore real-time
        unsubProfile = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // User cũ chưa có profile, tạo mặc định
            setUserProfile({ username: u.displayName || u.email, avatar: null });
          }
        });
      } else {
        setUserProfile(null);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
      }
    });
    return () => {
      unsub();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Đã bỏ logic useWishlist ở App.jsx. Data fetching do các trang (HomePage, GroupDetailPage) tự xử lý.

  // ── Đang kiểm tra auth ──
  if (checking) {
    return (
      <div className="auth-wrap">
        <p style={{ color: "#c2185b" }}>{t("loading")}</p>
      </div>
    );
  }

  // ── Cấu trúc Web Component ──
  return (
    <ConfirmProvider>
      <PreviewProvider>
        <div id="app-root" className="min-h-screen flex flex-col bg-bg-primary relative">
          <AppToast />
          <Header
            user={user}
            userProfile={userProfile}
            onOpenProfile={() => setShowProfile(true)}
            onLogout={() => signOut(auth)}
          />

          <main className="flex-1 w-full max-w-[1600px] mx-auto px-[5%] md:px-[10%] flex flex-col transition-all duration-500">
            {!user ? (
              <AuthPage />
            ) : (!user.emailVerified && !user.isAnonymous) ? (
              <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
                <div className="bg-bg-secondary w-full max-w-[460px] p-10 rounded-[40px] border border-border-primary shadow-2xl text-center animate-slide-up">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-sm">
                    <span className="animate-pulse">✉️</span>
                  </div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-4">
                    {t("verify_email_title") || "Xác minh Email"}
                  </h2>
                  <p className="text-text-muted font-bold text-[15px] leading-relaxed mb-8">
                    {t("verify_email_msg") || "Bạn cần xác minh email để sử dụng ứng dụng. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) của bạn."}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => window.location.reload()}
                      className="!rounded-2xl !py-4 bg-pink-500 text-white font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg active:scale-95"
                    >
                      {t("i_have_verified") || "Tôi đã xác minh"}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await sendEmailVerification(user);
                          toastStore.show(t("verification_email_sent") || "Đã gửi lại email xác minh!");
                        } catch (e) {
                          notifyError(t("resend_failed") || "Gửi lại thất bại, vui lòng đợi một lát.");
                        }
                      }}
                      className="!rounded-2xl !py-4 !text-text-muted hover:!text-text-primary font-black text-[11px] uppercase tracking-widest transition-all"
                    >
                      {t("resend_verification") || "Gửi lại email"}
                    </Button>
                    <button 
                      onClick={handleLogout}
                      className="mt-4 text-[11px] font-black uppercase tracking-widest text-text-muted/40 hover:text-rose-500 transition-colors"
                    >
                      {t("logout") || "Đăng xuất"}
                    </button>
                  </div>
                </div>
              </div>
            ) : user.email === ADMIN_EMAIL ? (
              <AdminPage />
            ) : (
              <div className="flex-1 w-full flex flex-col">
                {/* Modal Profile dùng chung toàn app */}
                {showProfile && (
                  <ProfilePage
                    userProfile={userProfile}
                    onClose={() => setShowProfile(false)}
                    onUpdate={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
                  />
                )}

                <Routes>
                  <Route path="/" element={<HomePage user={user} userProfile={userProfile} />} />
                  <Route path="/personal" element={<PersonalPage user={user} userProfile={userProfile} />} />
                  <Route path="/groups" element={<GroupsPage user={user} userProfile={userProfile} />} />
                  <Route path="/groups/:id" element={<GroupDetailPage user={user} userProfile={userProfile} />} />
                  <Route path="/invite/:id" element={<InvitePage user={user} userProfile={userProfile} />} />
                  <Route path="/add" element={<AddWishPage user={user} userProfile={userProfile} />} />
                  <Route path="/add/:groupId" element={<AddWishPage user={user} userProfile={userProfile} />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </div>
            )}
          </main>

          <BottomNav user={user} onOpenProfile={() => setShowProfile(true)} />
          <Footer />
        </div>
        <PWAUpdater />
      </PreviewProvider>
    </ConfirmProvider>
  );
}

export default App;
