import { useParams, useNavigate } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import AddForm from "../components/AddForm";

export default function AddWishPage({ user, userProfile }) {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const {
    tenMon, setTenMon, ghiChu, setGhiChu, previewAnh, dangTai, keoVao, setKeoVao, chonAnh, xoaAnh, themMon,
    formError, isImageTooLarge, nenAnh, setFormError, items
  } = useWishlist(user, userProfile, groupId);

  const handleCreate = async () => {
    const success = await themMon();
    if (success) {
      navigate(-1);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen py-10 md:py-20 max-w-4xl mx-auto w-full animate-fade-in px-6 relative">

      {/* Background Decor - Tạo chiều sâu cho trang */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-100/30 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* Top Bar: Nút quay lại tinh tế */}
      <div className="mb-12">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 py-2 px-4 rounded-full bg-bg-secondary/50 backdrop-blur-md border border-border-primary/20 text-text-secondary hover:text-pink-500 hover:bg-bg-secondary transition-all duration-300 shadow-sm"
        >
          <div className="w-6 h-6 rounded-full bg-bg-primary group-hover:bg-pink-500/10 flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Quay lại</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="mb-16 text-center">
        <div className="inline-block relative mb-4">
          <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-none">
            {groupId ? "Thêm vào nhóm" : "Thêm điều ước"} <span className="text-pink-500">mới</span>
          </h2>
        </div>
        <p className="text-text-secondary font-bold text-lg mt-4 max-w-md mx-auto leading-relaxed">
          Ghi lại những mơ ước và dự định <br className="hidden md:block" /> để chúng mình cùng nhau thực hiện.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="relative">
        <div className="relative">
          <AddForm
            tenMon={tenMon} setTenMon={setTenMon}
            ghiChu={ghiChu} setGhiChu={setGhiChu}
            previewAnh={previewAnh} dangTai={dangTai}
            keoVao={keoVao} setKeoVao={setKeoVao}
            chonAnh={chonAnh} xoaAnh={xoaAnh}
            themMon={handleCreate}
            formError={formError}
            isImageTooLarge={isImageTooLarge}
            nenAnh={nenAnh}
            setFormError={setFormError}
            existingItems={items}
            isGroup={!!groupId}
          />
        </div>
      </div>
    </div>
  );
}