/**
 * Stats component - Thống kê tổng quan
 * @param {Array} items - Danh sách wishlist items
 */
export default function Stats({ items }) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-num">{items.length}</div>
        <div className="stat-label">Tổng điều ước</div>
      </div>
      <div className="stat">
        <div className="stat-num">{items.filter(i => i.anhUrl).length}</div>
        <div className="stat-label">Có hình ảnh</div>
      </div>
      <div className="stat">
        <div className="stat-num">{items.filter(i => i.ghiChu).length}</div>
        <div className="stat-label">Có ghi chú</div>
      </div>
    </div>
  );
}
