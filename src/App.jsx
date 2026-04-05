import { useState, useEffect } from "react";
import "./App.css";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useWishlist } from "./hooks/useWishlist";
import Header from "./components/Header";
import Stats from "./components/Stats";
import AddForm from "./components/AddForm";
import WishList from "./components/WishList";
import ItemModal from "./components/ItemModal";
import Auth from "./auths/Auth";
import Admin from "./Admin/Admin";

// ← Đổi thành email của bạn để có quyền admin
const ADMIN_EMAIL = "admin@wishlist.com";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Lắng nghe trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
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
  } = useWishlist(user);

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
        <span style={{ fontSize: "13px", color: "#b0889a" }}>{user.email}</span>
        <button className="btn-logout" onClick={() => signOut(auth)}>
          Đăng xuất
        </button>
      </div>

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
      />
    </div>
  );
}

export default App;