import { useState } from "react";
import "./App.css";

import { useWishlist } from "./hooks/useWishlist";
import Header from "./components/Header";
import Stats from "./components/Stats";
import AddForm from "./components/AddForm";
import WishList from "./components/WishList";
import ItemModal from "./components/ItemModal";

function App() {
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
  } = useWishlist();

  const [selectedItem, setSelectedItem] = useState(null);

  /** Xóa item và đóng modal nếu đang mở item đó */
  async function handleXoa(id) {
    await xoaMon(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  return (
    <div className="app">
      <Header />

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