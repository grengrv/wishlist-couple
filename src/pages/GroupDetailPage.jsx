import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useWishlist } from "../hooks/useWishlist";
import Stats from "../components/Stats";
import AddForm from "../components/AddForm";
import WishList from "../components/WishList";
import ItemModal from "../components/ItemModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ADMIN_EMAIL } from "../constants";
import { useGroups } from "../hooks/useGroups";

export default function GroupDetailPage({ user, userProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { suaNhom, xoaNhom } = useGroups(user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  
  const {
    items, tenMon, setTenMon, ghiChu, setGhiChu, previewAnh, dangTai, keoVao, setKeoVao, chonAnh, xoaAnh, themMon, xoaMon
  } = useWishlist(user, userProfile, id); // pass groupId parameter!

  useEffect(() => {
    async function fetchGroup() {
       const snap = await getDoc(doc(db, "groups", id));
       if (snap.exists()) {
         const gData = snap.data();
         
         // Fetch profile avatars của các thành viên (tối đa lấy 3 người hiển thị)
         if (gData.members && gData.members.length > 0) {
           const memberDocs = await Promise.all(
             gData.members.slice(0, 3).map(uid => getDoc(doc(db, "users", uid)))
           );
           gData.memberProfiles = memberDocs
             .filter(d => d.exists())
             .map(d => d.data());
         } else {
           gData.memberProfiles = [];
         }
         
         setGroup(gData);
         setEditName(gData.name);
         setEditDesc(gData.description || "");
       } else {
         navigate("/groups"); // not found
       }
    }
    fetchGroup();
  }, [id, navigate]);

  async function handleXoa(wishId) {
    await xoaMon(wishId);
    if (selectedItem?.id === wishId) setSelectedItem(null);
  }

  async function handleLuuGroup() {
    if (!editName.trim()) return;
    await suaNhom(id, { name: editName, description: editDesc });
    setGroup(prev => ({ ...prev, name: editName, description: editDesc }));
    setIsEditing(false);
  }

  async function handleXoaGroup() {
    if (window.confirm("Bạn có chắc chắn muốn giải tán nhóm này? Toàn bộ thiết lập và lời mời sẽ bị hủy bỏ vĩnh viễn.")) {
      await xoaNhom(id);
      navigate("/groups");
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function handleInvite() {
    const inviteLink = `${window.location.origin}/invite/${id}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Đã mượn link lời mời vào Clipboard! Gửi cho đồng đội ngay nào.");
  }

  const isOwner = group?.ownerUid === user?.uid || user?.email === ADMIN_EMAIL;

  if (!group) return <p className="py-10 text-center text-pink-brand animate-pulse">Đang tải phòng...</p>;

  return (
    <div className="py-10 max-w-[680px] mx-auto w-full">
       <button onClick={() => navigate("/groups")} className="text-sm font-semibold text-pink-muted hover:text-pink-brand mb-4 flex items-center gap-1 transition-colors">
         <span className="text-lg leading-none">←</span> Quay lại danh sách
       </button>
       
       <div className="group relative flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 bg-white p-6 sm:p-8 rounded-[24px] border border-pink-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          {/* Vạch trang trí bên trái */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-brand rounded-l-[24px]"></div>
          
          <div className="flex-1 min-w-0 ml-1.5">
            {isEditing ? (
               <div className="flex flex-col gap-3 mb-4 pr-0 sm:pr-8 animate-fade-in opacity-100">
                 <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tên không gian nhóm" />
                 <Input as="textarea" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Viết vài dòng giới thiệu..." />
                 <div className="flex items-center gap-2 mt-1">
                    <Button size="sm" onClick={handleLuuGroup}>Lưu thiết lập</Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                        setIsEditing(false); setEditName(group.name); setEditDesc(group.description || "");
                    }}>Hủy bỏ</Button>
                 </div>
               </div>
            ) : (
               <>
                 <div className="flex items-center gap-3">
                   <h2 className="text-[26px] sm:text-[30px] font-bold text-deep-red tracking-tight leading-tight truncate">
                     {group.name}
                   </h2>
                   {isOwner && (
                     <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setIsEditing(true)} className="p-2 text-pink-brand hover:bg-pink-50 rounded-md transition-colors" title="Sửa tên nhóm">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                       </button>
                       <button onClick={handleXoaGroup} className="p-2 text-pink-brand hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Giải tán nhóm này">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                       </button>
                     </div>
                   )}
                 </div>
                 {group.description && (
                   <p className="mt-2 text-sm text-text-sub line-clamp-2 leading-relaxed">
                     {group.description}
                   </p>
                 )}
                 <p className="text-[11px] font-medium text-pink-muted mt-2">
                   Được tạo vào: {formatDate(group.createdAt)}
                 </p>
               </>
            )}
            
            {/* Cụm Micro-UI hiển thị thành viên */}
            <div className="flex items-center gap-2 mt-5">
               <div className="flex -space-x-2">
                 {group.memberProfiles?.map((profile, idx) => {
                   const zIndices = ['z-20', 'z-10', 'z-0'];
                   if (profile.avatar) {
                     return <img key={idx} src={profile.avatar} alt="avatar" className={`w-8 h-8 rounded-full border-2 border-white object-cover ${zIndices[idx]}`} />;
                   }
                   return (
                     <div key={idx} className={`w-8 h-8 rounded-full bg-pink-faint border-2 border-white flex items-center justify-center text-[12px] text-pink-brand font-bold ${zIndices[idx]}`}>
                       {(profile.username || "?").charAt(0).toUpperCase()}
                     </div>
                   );
                 })}
               </div>
               <span className="text-[13px] font-semibold text-pink-soft ml-1.5">
                 {group.members?.length || 1} thành viên
               </span>
            </div>
          </div>

          <Button 
            onClick={handleInvite} 
            className="shrink-0 w-full sm:w-auto h-[48px] sm:min-w-[200px] text-[15px] font-semibold shadow-[0_4px_14px_rgba(194,24,91,0.2)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(194,24,91,0.3)] transition-all duration-300 flex items-center justify-center"
          >
            <span className="flex items-center justify-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              Mời tham gia
            </span>
          </Button>
       </div>

       <Stats items={items} />

       <AddForm
         tenMon={tenMon} setTenMon={setTenMon}
         ghiChu={ghiChu} setGhiChu={setGhiChu}
         previewAnh={previewAnh} dangTai={dangTai}
         keoVao={keoVao} setKeoVao={setKeoVao}
         chonAnh={chonAnh} xoaAnh={xoaAnh}
         themMon={themMon}
       />

       <WishList items={items} onSelectItem={setSelectedItem} />

      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleXoa}
        user={user}
        adminEmail={ADMIN_EMAIL}
      />
    </div>
  );
}
