/**
 * Stats component - Thống kê tổng quan
 * @param {Array} items - Danh sách wishlist items
 */
export default function Stats({ items }) {
  return (
    <div className="flex gap-2.5 mb-6">
      <div className="flex-1 bg-white border border-pink-border rounded-[14px] p-3.5 text-center">
        <div className="text-2xl font-bold text-pink-brand">{items.length}</div>
        <div className="text-xs text-pink-soft mt-[3px]">Tổng điều ước</div>
      </div>
      <div className="flex-1 bg-white border border-pink-border rounded-[14px] p-3.5 text-center">
        <div className="text-2xl font-bold text-pink-brand">{items.filter(i => i.anhUrl).length}</div>
        <div className="text-xs text-pink-soft mt-[3px]">Có hình ảnh</div>
      </div>
      <div className="flex-1 bg-white border border-pink-border rounded-[14px] p-3.5 text-center">
        <div className="text-2xl font-bold text-pink-brand">{items.filter(i => i.ghiChu).length}</div>
        <div className="text-xs text-pink-soft mt-[3px]">Có ghi chú</div>
      </div>
    </div>
  );
}
