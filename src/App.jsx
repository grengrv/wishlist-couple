import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Profile from "./Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Auth from "./auths/Auth";
import Admin from "./Admin/Admin";
import { ADMIN_EMAIL } from "./constants";

// Pages
import HomePage from "./pages/HomePage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import InvitePage from "./pages/InvitePage";
import AddWishPage from "./pages/AddWishPage";
import PersonalPage from "./pages/PersonalPage";

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Lắng nghe trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setChecking(false);

      if (u && !u.isAnonymous) {
        // Load profile từ Firestore
        const profileDoc = await getDoc(doc(db, "users", u.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        } else {
          // User cũ chưa có profile, tạo mặc định
          setUserProfile({ username: u.displayName || u.email, avatar: null });
        }
      }
    });
    return unsub;
  }, []);

  // Đã bỏ logic useWishlist ở App.jsx. Data fetching do các trang (HomePage, GroupDetailPage) tự xử lý.

  // ── Đang kiểm tra auth ──
  if (checking) {
    return (
      <div className="auth-wrap">
        <p style={{ color: "#c2185b" }}>Đang tải...</p>
      </div>
    );
  }

  // ── Cấu trúc Web Component ──
  return (
    <div className="min-h-screen flex flex-col bg-body-bg relative">
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
              <Route path="/groups" element={<GroupsPage user={user} />} />
              <Route path="/groups/:id" element={<GroupDetailPage user={user} userProfile={userProfile} />} />
              <Route path="/invite/:id" element={<InvitePage user={user} />} />
              <Route path="/add" element={<AddWishPage user={user} userProfile={userProfile} />} />
              <Route path="/add/:groupId" element={<AddWishPage user={user} userProfile={userProfile} />} />
            </Routes>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;