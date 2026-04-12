import { useState } from "react";
import AboutSection from "../components/AboutSection";
import Stats from "../components/Stats";
import AddForm from "../components/AddForm";
import WishList from "../components/WishList";
import ItemModal from "../components/ItemModal";
import { useWishlist } from "../hooks/useWishlist";
import { ADMIN_EMAIL } from "../constants";

export default function HomePage({ user, userProfile }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    items, tenMon, setTenMon, ghiChu, setGhiChu, previewAnh, dangTai, keoVao, setKeoVao, chonAnh, xoaAnh, themMon, xoaMon
  } = useWishlist(user, userProfile, null); // null = global wish

  async function handleXoa(id) {
    await xoaMon(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  return (
    <div className="py-10 max-w-[680px] mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold text-deep-red tracking-[-0.5px]">
          Không gian chung
        </h2>
        <p className="mt-1.5 text-sm text-pink-soft">Ghi lại những mơ ước và dự định của chúng mình</p>
      </div>

      <AboutSection />
      <Stats items={items} />

      <AddForm
        tenMon={tenMon} setTenMon={setTenMon}
        ghiChu={ghiChu} setGhiChu={setGhiChu}
        previewAnh={previewAnh} dangTai={dangTai}
        keoVao={keoVao} setKeoVao={setKeoVao}
        chonAnh={chonAnh} xoaAnh={xoaAnh}
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
  );
}
