import { useState } from "react";
import Stats from "../components/Stats";
import WishList from "../components/WishList";
import ItemModal from "../components/ItemModal";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { ADMIN_EMAIL } from "../constants";
import { notifyXoaWish } from "../utils/notify";

export default function PersonalPage({ user, userProfile }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const { items, xoaMon } = useWishlist(user, userProfile, null);

  async function handleXoa(id) {
    const ok = await xoaMon(id);
    if (ok) {
      notifyXoaWish();
    }
    // ok === false: notify đã được gọi bên trong xoaMon
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 relative overflow-hidden">

      {/* 1. Floating Profile Intro - Sạch sẽ, không còn dải thông báo hệ thống */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-20 bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(236,72,153,0.05)]">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-pink-300 to-rose-300 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <img
              src={userProfile?.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            Chào, <span className="text-pink-500">{userProfile?.username || "Bạn nhỏ"}!</span>
          </h2>
          <p className="text-gray-500 font-bold mt-2 text-lg">
            Hôm nay chúng mình sẽ cùng thực hiện điều gì đây?
          </p>
        </div>

        <button
          onClick={() => navigate("/add")}
          className="w-16 h-16 bg-gray-900 text-white rounded-[24px] shadow-lg shadow-gray-200 hover:bg-pink-600 hover:rotate-12 hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center text-3xl font-light"
        >
          ＋
        </button>
      </div>

      <Stats items={items} />

      <div className="mt-20">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-10 px-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Danh sách của bạn</h3>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-100 to-transparent"></div>
          </div>

          <div className="min-h-[400px]">
            <WishList items={items} onSelectItem={setSelectedItem} />
          </div>
        </div>
      </div>

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