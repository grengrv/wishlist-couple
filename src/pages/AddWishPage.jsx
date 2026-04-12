import { useParams, useNavigate } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import AddForm from "../components/AddForm";
import toast from "react-hot-toast";

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
      toast.success("Đã ghi lại điều ước thành công! ✨");
      // Đợi một chút để người dùng thấy trạng thái hoàn tất nếu cần, hoặc navigate ngay
      navigate(-1); 
    }
  };

  return (
    <div className="py-12 max-w-3xl mx-auto w-full animate-fade-in px-5 sm:px-0">
      <button 
        onClick={() => navigate(-1)} 
        className="text-sm font-semibold text-pink-muted hover:text-pink-brand mb-8 flex items-center gap-1 transition-colors group"
      >
        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Quay lại
      </button>

      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-[36px] font-black text-pink-brand tracking-tight mb-1">
          {groupId ? "Thêm vào nhóm" : "Điều ước mới"}
        </h2>
        <p className="text-text-sub font-medium text-[16px] opacity-80">Ghi lại những mơ ước và dự định của chúng mình</p>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-[32px] p-1 sm:p-2 border border-white/50 shadow-sm">
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
        />
      </div>
    </div>
  );
}
