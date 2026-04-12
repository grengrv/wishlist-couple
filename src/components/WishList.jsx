import WishCard from "./WishCard";

/**
 * WishList component - Danh sách các điều ước
 * @param {Array} items - Danh sách items
 * @param {Function} onSelectItem - Callback khi chọn item để xem modal
 */
export default function WishList({ items, onSelectItem }) {
  return (
    <>
      {items.length > 0 && (
        <p className="text-[13px] font-semibold text-pink-brand uppercase tracking-[0.8px] mb-4">Danh sách ({items.length})</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.length === 0 && (
          <p className="col-span-full text-center text-pink-muted text-sm py-12 px-4 bg-white rounded-2xl border border-dashed border-pink-border">
            Chưa có điều ước nào.<br />Hãy thêm điều đầu tiên nhé ♥
          </p>
        )}
        {items.map(item => (
          <WishCard key={item.id} item={item} onClick={onSelectItem} />
        ))}
      </div>
    </>
  );
}
