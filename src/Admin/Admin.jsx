import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { formatNgay } from "../utils/formatDate";

/**
 * Admin component - Trang quản trị dành cho email admin
 * Xem toàn bộ danh sách wishlist và có thể xóa từng item
 */
export default function Admin() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function layDuLieu() {
            const q = query(collection(db, "wishlist"), orderBy("taoLuc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setItems(data);
            setLoading(false);
        }
        layDuLieu();
    }, []);

    async function xoaMon(id) {
        await deleteDoc(doc(db, "wishlist", id));
        setItems(prev => prev.filter(i => i.id !== id));
    }

    return (
        <div className="app">
            <div className="header">
                <h1>Trang Admin <span className="heart">♥</span></h1>
                <p>{auth.currentUser?.email}</p>
            </div>

            <div className="admin-bar">
                <span>{items.length} mục trong wishlist</span>
                <button className="btn-logout" onClick={() => signOut(auth)}>
                    Đăng xuất
                </button>
            </div>

            {loading && <p className="empty">Đang tải dữ liệu...</p>}

            <div className="list">
                {!loading && items.length === 0 && (
                    <p className="empty">Chưa có điều ước nào.<br />Hãy thêm điều đầu tiên nhé ♥</p>
                )}
                {items.map(item => (
                    <div className="card" key={item.id}>
                        {item.anhUrl && <img src={item.anhUrl} alt={item.ten} className="card-img" />}
                        <div className="card-body">
                            <h3 className="card-ten">{item.ten}</h3>
                            {item.ghiChu && <p className="card-ghichu">{item.ghiChu}</p>}
                            <p className="card-date">{formatNgay(item.taoLuc)}</p>
                            {item.themBoi && (
                                <p className="card-date" style={{ marginTop: 2 }}>Bởi: {item.themBoi}</p>
                            )}
                        </div>
                        <button className="btn-xoa" onClick={() => xoaMon(item.id)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}