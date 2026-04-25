import { useState, useEffect } from "react";
import { requestNotificationPermission } from "./utils/pushNotification";
import { Routes, Route } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { ConfirmProvider } from "./context/ConfirmContext";
import AppToast from "./components/ui/AppToast";

import Profile from "./Profile";
import Header from "./components/Header";
import { notifyLogout, notifyError } from "./utils/notify";
import Footer from "./components/Footer";
import Auth from "./auths/Auth";
import Admin from "./Admin/Admin";
import { ADMIN_EMAIL } from "./constants";
import BottomNav from "./components/BottomNav";
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import PWAUpdater from './components/PWAUpdater'

// Pages
import HomePage from "./pages/HomePage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import InvitePage from "./pages/InvitePage";
import AddWishPage from "./pages/AddWishPage";
import PersonalPage from "./pages/PersonalPage";

import { useLanguage } from "./context/LanguageContext";

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
            <Auth />
          ) : user.email === ADMIN_EMAIL ? (
            <Admin />
          ) : (
            <div className="flex-1 w-full flex flex-col">
              {/* Modal Profile dùng chung toàn app */}
              {showProfile && (
                <Profile
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
              </Routes>
            </div>
          )}
        </main>

        <BottomNav user={user} onOpenProfile={() => setShowProfile(true)} />
        <Footer />
      </div>
      <PWAUpdater />
    </ConfirmProvider>
  );
}

export default App;