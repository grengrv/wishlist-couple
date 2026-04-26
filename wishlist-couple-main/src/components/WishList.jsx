import WishCard from "./WishCard";
import { useLanguage } from "../context/LanguageContext";

/**
 * WishList component - Danh sách các điều ước
 * @param {Array} items - Danh sách items
 * @param {Function} onSelectItem - Callback khi chọn item để xem modal
 */
export default function WishList({ items, onSelectItem, user }) {
  const { t } = useLanguage();
  return (
    <>
      {items.length > 0 && (
        <p className="text-[13px] font-semibold text-pink-brand uppercase tracking-[0.8px] mb-4">
          {t("list")} ({items.length})
        </p>
      )}
      <div id="wishlist-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.length === 0 && (
          <p className="col-span-full text-center text-text-muted text-sm py-12 px-4 bg-bg-secondary/50 rounded-2xl border border-dashed border-border-primary">
            {t("wishlist_empty")}
          </p>
        )}
        {items.map(item => (
          <WishCard key={item.id} item={item} onClick={onSelectItem} user={user} />
        ))}
      </div>
    </>
  );
}
