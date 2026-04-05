import { formatNgay } from "../utils/formatDate";

/**
 * WishCard component - Một item trong danh sách
 * @param {Object} item - Dữ liệu item (id, ten, ghiChu, anhUrl, taoLuc)
 * @param {Function} onClick - Mở modal xem chi tiết
 */
export default function WishCard({ item, onClick }) {
  return (
    <div className="card" onClick={() => onClick(item)}>
      {item.anhUrl && (
        <img src={item.anhUrl} alt={item.ten} className="card-img" />
      )}
      <div className="card-body">
        <h3 className="card-ten">{item.ten}</h3>
        {item.ghiChu && <p className="card-ghichu">{item.ghiChu}</p>}
        <p className="card-date">{formatNgay(item.taoLuc)}</p>
      </div>
      <div className="card-arrow">›</div>
    </div>
  );
}
