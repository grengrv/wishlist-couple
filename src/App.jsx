import { useState, useEffect } from "react";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, orderBy, query, getDoc
} from "firebase/firestore";
import Profile from "./Profile";

import { useWishlist } from "./hooks/useWishlist";
import Header from "./components/Header";
import Stats from "./components/Stats";
import AddForm from "./components/AddForm";
import WishList from "./components/WishList";
import ItemModal from "./components/ItemModal";
import Auth from "./auths/Auth";
import Admin from "./Admin/Admin";
import { ADMIN_EMAIL } from "./constants";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import Avatar from "./components/ui/Avatar";
import Button from "./components/ui/Button";

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

  const {
    items,
    tenMon, setTenMon,
    ghiChu, setGhiChu,
    previewAnh,
    dangTai,
    keoVao, setKeoVao,
    chonAnh,
    xoaAnh,
    themMon,
    xoaMon,
  } = useWishlist(user, userProfile);

  /** Xóa item và đóng modal nếu đang mở item đó */
  async function handleXoa(id) {
    await xoaMon(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  }

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

      <main className="flex-1 w-full max-w-[680px] mx-auto px-5 flex flex-col">
        {!user ? (
          <Auth />
        ) : user.email === ADMIN_EMAIL ? (
          <Admin />
        ) : (
          <div className="py-10">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-deep-red tracking-[-0.5px]">
                Không gian của chúng mình
              </h2>
              <p className="mt-1.5 text-sm text-pink-soft">Mảnh đất nuôi dưỡng những phép màu bé nhỏ</p>
            </div>

            {/* Modal Profile */}
            {showProfile && (
              <Profile
                userProfile={userProfile}
                onClose={() => setShowProfile(false)}
                onUpdate={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
              />
            )}

            <AboutSection />

            <Stats items={items} />

            <AddForm
              tenMon={tenMon} setTenMon={setTenMon}
              ghiChu={ghiChu} setGhiChu={setGhiChu}
              previewAnh={previewAnh}
              dangTai={dangTai}
              keoVao={keoVao} setKeoVao={setKeoVao}
              chonAnh={chonAnh}
              xoaAnh={xoaAnh}
              themMon={themMon}
            />

            <WishList items={items} onSelectItem={setSelectedItem} />

            <ItemModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onDelete={handleXoa}
              user={user}
              adminEmail={ADMIN_EMAIL}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;