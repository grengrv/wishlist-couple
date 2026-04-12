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
        {/* Avatar + username người thêm */}
        <div className="card-author">
          {item.avatarNguoiThem ? (
            <img src={item.avatarNguoiThem} alt="avatar" className="card-author-avatar" />
          ) : (
            <div className="card-author-initials">
              {(item.themBoi?.[0] || "?").toUpperCase()}
            </div>
          )}
          <span className="card-author-name">{item.themBoi || "Ẩn danh"}</span>
          <span className="card-date" style={{ marginLeft: "auto" }}>{formatNgay(item.taoLuc)}</span>
        </div>
      </div>
      <div className="card-arrow">›</div>
    </div>
  );
}
