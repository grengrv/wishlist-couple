import { useState, useEffect } from "react";
import "./App.css";

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

  // ── Chưa đăng nhập → hiện màn hình Auth ──
  if (!user) return <Auth />;

  // ── Là admin → hiện trang Admin ──
  if (user.email === ADMIN_EMAIL) return <Admin />;

  // ── Người dùng thường → hiện wishlist ──
  return (
    <div className="app">
      <Header />

      {/* Thanh trạng thái đăng nhập */}
      <div className="admin-bar">
        {/* Avatar + Username */}
        <div
          className="user-info"
          onClick={() => !user.isAnonymous && setShowProfile(true)}
          style={{ cursor: user.isAnonymous ? "default" : "pointer" }}
        >
          {userProfile?.avatar ? (
            <img src={userProfile.avatar} alt="avatar" className="avatar-small" />
          ) : (
            <div className="avatar-initials">
              {user.isAnonymous
                ? "?"
                : (userProfile?.username?.[0] || user.email?.[0] || "?").toUpperCase()}
            </div>
          )}
          <div>
            <p className="user-name">
              {user.isAnonymous ? "Khách ẩn danh" : (userProfile?.username || user.email)}
            </p>
            {!user.isAnonymous && (
              <p className="user-edit">Chỉnh sửa hồ sơ</p>
            )}
          </div>
        </div>

        {/* Nút đăng xuất */}
        <button className="btn-logout" onClick={() => signOut(auth)}>
          {user.isAnonymous ? "Thoát" : "Đăng xuất"}
        </button>
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

      <Footer />
    </div>
  );
}

export default App;