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
        <p className="list-title">Danh sách ({items.length})</p>
      )}
      <div className="list">
        {items.length === 0 && (
          <p className="empty">
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
