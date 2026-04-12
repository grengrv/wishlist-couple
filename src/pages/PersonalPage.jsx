import { useState } from "react";
import Stats from "../components/Stats";
import WishList from "../components/WishList";
import ItemModal from "../components/ItemModal";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { ADMIN_EMAIL } from "../constants";

export default function PersonalPage({ user, userProfile }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    items, xoaMon
  } = useWishlist(user, userProfile, null); // null = global wish

  async function handleXoa(id) {
    await xoaMon(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  return (
    <div className="py-10 mx-auto w-full animate-fade-in transition-all duration-500">
      {/* Header section cho trang Cá nhân */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[36px] font-black text-pink-brand tracking-tight mb-1">Cá nhân</h2>
          <p className="text-text-sub font-medium text-[16px] opacity-80">Danh sách ước nguyện của riêng chúng mình</p>
        </div>
        <button 
          onClick={() => navigate("/add")}
          className="px-8 h-12 bg-gradient-brand text-white font-bold rounded-2xl shadow-xl shadow-pink-brand/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">✦</span> Thêm điều mới
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="mb-10">
        <Stats items={items} />
      </div>

      {/* Danh sách điều ước dạng Grid (đã tối ưu trong WishList component) */}
      <WishList items={items} onSelectItem={setSelectedItem} />

      {/* Modal chi tiết item */}
      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleXoa}
        user={user}
        adminEmail={ADMIN_EMAIL}
      />
    </div>
  );
}
