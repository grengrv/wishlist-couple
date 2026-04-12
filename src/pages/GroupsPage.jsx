import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useGroups } from "../hooks/useGroups";

export default function GroupsPage({ user }) {
  const { groups, taoNhom, suaNhom, xoaNhom } = useGroups(user);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, group: null });
  // Edit Modal State
  const [editModal, setEditModal] = useState({ visible: false, group: null, name: "", desc: "" });

  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  async function handleCreate() {
    if (!name.trim()) return;
    const newId = await taoNhom(name, desc);
    if (newId) {
      setShowCreate(false);
      setName("");
      setDesc("");
      navigate(`/groups/${newId}`);
    }
  }

  const handleContextMenu = (e, group) => {
    e.preventDefault();
    // Chỉ cho phép chủ sở hữu sửa/xóa
    if (group.ownerUid !== user.uid) return;
    
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      group
    });
  };

  const handleOpenEdit = () => {
    const g = contextMenu.group;
    if (!g) return;
    setEditModal({ visible: true, group: g, name: g.name, desc: g.description || "" });
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleSaveEdit = async () => {
    if (!editModal.name.trim()) return;
    await suaNhom(editModal.group.id, {
      name: editModal.name,
      description: editModal.desc
    });
    setEditModal({ visible: false, group: null, name: "", desc: "" });
  };

  const handleDelete = async () => {
    const g = contextMenu.group;
    if (!g) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${g.name}"? Hành động này không thể hoàn tác.`)) {
      await xoaNhom(g.id);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="py-10 flex flex-col w-full animate-fade-in px-4 sm:px-0 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-[34px] font-bold text-pink-brand tracking-tight">Nhóm</h2>
          <p className="text-pink-muted font-medium text-[15px] mt-1 tracking-wide">Tạo và chia sẻ wishlist cùng bạn bè</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          title={showCreate ? "Đóng form" : "Tạo nhóm mới"}
          className={`
            w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shrink-0
            ${showCreate 
              ? "bg-white border border-pink-border text-pink-brand rotate-45" 
              : "bg-gradient-brand text-white shadow-pink-brand/20 hover:scale-110 active:scale-95"
            }
          `}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-pink-border/40 flex flex-col gap-6 animate-slide-up shadow-sm mb-12">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-pink-brand text-xl">Tạo nhóm mới</h3>
            <p className="text-text-sub text-sm">Tên và mô tả ngắn cho nhóm của bạn</p>
          </div>
          <div className="flex flex-col gap-5">
            <div className="relative group">
               <Input placeholder="Tên nhóm (VD: Đi Đà Lạt 🍁)" value={name} onChange={e => setName(e.target.value)} className="bg-pink-faint/20 border-pink-border/30 focus:border-pink-brand transition-all" />
            </div>
            <div className="relative group">
               <Input as="textarea" rows={2} placeholder="Mô tả ngắn gọn..." value={desc} onChange={e => setDesc(e.target.value)} className="bg-pink-faint/20 border-pink-border/30 focus:border-pink-brand transition-all" />
            </div>
          </div>
          <div className="flex gap-4 justify-end mt-2">
            <button 
              onClick={() => setShowCreate(false)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-pink-muted hover:bg-pink-faint hover:text-pink-brand transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <button 
              onClick={handleCreate} 
              disabled={!name.trim()}
              className="w-12 h-12 rounded-xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-pink-brand/20 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border-2 border-dashed border-pink-border/40 px-6 text-center">
            <div className="w-20 h-20 bg-pink-faint/50 rounded-3xl flex items-center justify-center text-pink-brand mb-6 transition-transform hover:scale-110 duration-500 shadow-sm border border-pink-border/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-pink-brand mb-2">Bạn chưa tham gia nhóm nào</h3>
            <p className="text-pink-soft text-[15px] leading-relaxed max-w-[340px] font-medium opacity-80">
              Hãy cùng tạo một không gian riêng tư để lưu giữ<br className="hidden sm:block" /> những dự định chung của đôi mình nhé!
            </p>
          </div>
        )}
        {groups.map(g => (
          <GroupCard 
            key={g.id} 
            group={g} 
            onClick={() => navigate(`/groups/${g.id}`)} 
            onContextMenu={(e) => handleContextMenu(e, g)}
          />
        ))}
      </div>

      {/* Context Menu UI */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white rounded-2xl shadow-2xl border border-pink-border/30 py-2 w-48 z-[1000] animate-fade-in overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={handleOpenEdit}
            className="w-full px-4 py-2.5 text-sm font-semibold text-text-base hover:bg-pink-faint hover:text-pink-brand flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Chỉnh sửa
          </button>
          <div className="h-[1px] bg-pink-border/20 mx-2"></div>
          <button 
            onClick={handleDelete}
            className="w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Xóa nhóm
          </button>
        </div>
      )}

      {/* Edit Modal UI */}
      {editModal.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[10000] p-6 animate-fade-in px-4">
          <div className="bg-white rounded-[32px] w-full max-w-[480px] p-8 shadow-2xl animate-slide-up flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-pink-brand">Chỉnh sửa nhóm</h3>
              <p className="text-text-sub text-sm font-medium">Cập nhật thông tin không gian chung của bạn</p>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-pink-muted ml-1">Tên nhóm</label>
                <Input value={editModal.name} onChange={e => setEditModal({ ...editModal, name: e.target.value })} className="bg-pink-faint/20 border-pink-border/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-pink-muted ml-1">Mô tả</label>
                <Input as="textarea" rows={3} value={editModal.desc} onChange={e => setEditModal({ ...editModal, desc: e.target.value })} className="bg-pink-faint/20 border-pink-border/30" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => setEditModal({ visible: false, group: null, name: "", desc: "" })}
                className="flex-1 py-3.5 text-sm font-bold text-pink-brand bg-pink-faint rounded-2xl hover:bg-pink-light/20 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={!editModal.name.trim()}
                className="flex-[1.5] py-3.5 text-sm font-bold text-white bg-gradient-brand rounded-2xl shadow-lg shadow-pink-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, onClick, onContextMenu }) {
  const [memberProfiles, setMemberProfiles] = useState([]);

  useEffect(() => {
    async function fetchProfiles() {
      if (group.members && group.members.length > 0) {
        const docs = await Promise.all(
          group.members.slice(0, 4).map(uid => getDoc(doc(db, "users", uid)))
        );
        setMemberProfiles(docs.filter(d => d.exists()).map(d => d.data()));
      }
    }
    fetchProfiles();
  }, [group.members]);

  return (
    <div 
      className="group p-7 bg-white rounded-[28px] border border-pink-border cursor-pointer hover:border-pink-brand hover:shadow-[0_20px_40px_rgba(194,24,91,0.12)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-faint/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
      
      <div className="relative flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-black text-2xl text-text-base group-hover:text-pink-brand transition-colors break-words leading-tight flex-1 pr-2">
            {group.name}
          </h3>
          <div className="w-10 h-10 rounded-2xl bg-pink-faint flex items-center justify-center text-pink-brand shrink-0 group-hover:bg-pink-brand group-hover:text-white transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
        
        {group.description ? (
          <p className="text-[15px] text-text-sub break-all leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {group.description}
          </p>
        ) : (
          <p className="text-sm text-pink-muted italic opacity-60">Không gian riêng tư của chúng mình...</p>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-pink-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {memberProfiles.length > 0 ? (
              memberProfiles.map((p, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-[3px] border-white overflow-hidden bg-white shadow-sm transition-transform group-hover:scale-110" style={{ zIndex: 10 - i }}>
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink-faint text-[12px] font-bold text-pink-brand">
                      {p.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )
                }
                </div>
              ))
            ) : (
              <div className="w-9 h-9 rounded-full border-[3px] border-white bg-pink-faint flex items-center justify-center text-[12px] font-bold text-pink-brand shadow-sm">
                ?
              </div>
            )}
            {group.members?.length > 4 && (
              <div className="w-9 h-9 rounded-full border-[3px] border-white bg-pink-light flex items-center justify-center text-[11px] font-bold text-white z-0 shadow-sm">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-text-base leading-none">
              {group.members?.length || 1} thành viên
            </span>
            <span className="text-[11px] font-medium text-pink-soft mt-1">Sẵn sàng sẻ chia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
