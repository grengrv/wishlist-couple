import { useState, useEffect, lazy, Suspense } from "react";
import { requestNotificationPermission } from "@utils/pushNotification";
import { Routes, Route } from "react-router-dom";
import { auth, db } from "@config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { ConfirmProvider } from "@context/ConfirmContext";
import { PreviewProvider } from "@context/PreviewContext";
import AppToast from "@components/ui/AppToast";


import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import AuthPage from "@pages/AuthPage";
import { ADMIN_EMAIL } from "@constants";
import BottomNav from "@components/layout/BottomNav";
import PWAUpdatePrompt from "@components/pwa/PWAUpdatePrompt"
import PWAUpdater from "@components/pwa/PWAUpdater"
import Button from "@components/ui/Button";

// Lazy-loaded pages (code-split per route)
const HomePage = lazy(() => import("@pages/HomePage"));
const GroupsPage = lazy(() => import("@pages/GroupsPage"));
const GroupDetailPage = lazy(() => import("@pages/GroupDetailPage"));
const InvitePage = lazy(() => import("@pages/InvitePage"));
const AddWishPage = lazy(() => import("@pages/AddWishPage"));
const PersonalPage = lazy(() => import("@pages/PersonalPage"));
const ProfilePage = lazy(() => import("@pages/ProfilePage"));
const AdminPage = lazy(() => import("@pages/AdminPage"));
const TermsPage = lazy(() => import("@pages/TermsPage"));
const PrivacyPage = lazy(() => import("@pages/PrivacyPage"));

function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-pink-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-pink-500/10 flex items-center justify-center text-xl">
            💖
          </div>
        </div>
        <p className="text-[12px] font-black uppercase tracking-[3px] text-text-muted opacity-50">Đang tải...</p>
      </div>
    </div>
  );
}

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

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
    return <PageLoader />;
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
            <Suspense fallback={<PageLoader />}>
              {!user || (!user.emailVerified && !user.isAnonymous) ? (
                <AuthPage user={user} />
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
            </Suspense>
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
