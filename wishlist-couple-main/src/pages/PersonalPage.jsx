import { useState } from "react";
import Stats from "../components/Stats";
import WishList from "../components/WishList";
import ItemModal from "../components/ItemModal";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { useEffect } from "react";
import { ADMIN_EMAIL } from "../constants";
import { notifyXoaWish } from "../utils/notify";
import { useLanguage } from "../context/LanguageContext";

export default function PersonalPage({ user, userProfile }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const { items, xoaMon, thichMon, binhLuanMon, xoaBinhLuan, thichBinhLuan, toggleFavorite } = useWishlist(user, userProfile, null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const wishId = searchParams.get("wishId");
    if (wishId && items.length > 0) {
      const item = items.find(i => i.id === wishId);
      if (item && selectedItem?.id !== item.id) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, items]);

  async function handleXoa(id) {
    if (selectedItem?.id === id) setSelectedItem(null);
    notifyXoaWish();
    await xoaMon(id);
  }

  const handleCloseModal = () => {
    setSelectedItem(null);
    if (searchParams.has("wishId")) {
      searchParams.delete("wishId");
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 relative overflow-hidden">

      {/* 1. Floating Profile Intro - Sạch sẽ, không còn dải thông báo hệ thống */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-20 bg-card-bg/40 backdrop-blur-md p-8 rounded-[40px] border border-border-primary/60 shadow-[0_20px_50px_rgba(236,72,153,0.05)]">
        <div className="relative group">
          <div className="absolute -inset-2 from-pink-300 to-rose-300 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-card-bg shadow-xl">
            <img
              src={userProfile?.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight">
            {t("hello")}, <span className="text-pink-500">{userProfile?.username || t("default_friend")}!</span>
          </h2>
          <p className="text-text-secondary font-bold mt-2 text-lg">
            {t("personal_subtitle")}
          </p>
        </div>

        <button
          onClick={() => navigate("/add")}
          className="w-16 h-16 bg-text-primary text-bg-primary rounded-[24px] hover:bg-pink-600 hover:rotate-12 hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center text-3xl font-light"
        >
          ＋
        </button>
      </div>

      <Stats items={items} />

      <div className="mt-20">
        <div className="lg:col-span-2">

          <div className="min-h-[400px]">
            <WishList items={items} onSelectItem={setSelectedItem} onToggleFavorite={toggleFavorite} />
          </div>
        </div>
      </div>

      <ItemModal
        item={items.find(i => i.id === selectedItem?.id) || selectedItem}
        onClose={handleCloseModal}
        onDelete={handleXoa}
        user={user}
        userProfile={userProfile}
        adminEmail={ADMIN_EMAIL}
        onLike={thichMon}
        onComment={binhLuanMon}
        onDeleteComment={xoaBinhLuan}
        onLikeComment={thichBinhLuan}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}