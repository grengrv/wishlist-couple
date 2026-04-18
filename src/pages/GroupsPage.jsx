import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useGroups } from "../hooks/useGroups";
import { useConfirm } from "../context/ConfirmContext";
import { notifyTaoNhom, notifyXoaNhom, notifyThamGiaNhom, notifyLuuNhom, notifyError } from "../utils/notify";

export default function GroupsPage({ user }) {
  const { groups, taoNhom, suaNhom, xoaNhom, thamGiaBangMa } = useGroups(user);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, group: null });
  // Edit Modal State
  const [editModal, setEditModal] = useState({ visible: false, group: null, name: "", desc: "" });

  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  // --- Logic xử lý (Giữ nguyên từ code gốc) ---
  async function handleCreate() {
    if (!name.trim()) return;
    try {
      const result = await taoNhom(name, desc);
      if (result?.id) {
        notifyTaoNhom();
        setShowCreate(false);
        setName("");
        setDesc("");
        navigate(`/groups/${result.id}`);
      } else {
        notifyError("Tạo nhóm thất bại. Tên nhóm phải từ 2–40 ký tự.");
      }
    } catch {
      notifyError("Không thể tạo nhóm. Vui lòng thử lại!");
    }
  }

  async function handleJoin() {
    setJoinError(null);
    setIsJoining(true);
    try {
      const result = await thamGiaBangMa(joinCode);
      if (result.error) {
        notifyError(result.error);
      } else {
        notifyThamGiaNhom();
        setJoinCode("");
        setShowJoin(false);
        navigate(`/groups/${result.id}`);
      }
    } catch {
      notifyError("Không thể tham gia nhóm. Vui lòng thử lại!");
    } finally {
      setIsJoining(false);
    }
  }

  const handleCloseJoin = async () => {
    if (joinCode.length > 0) {
      const isOk = await confirm({
        title: "Dừng lại chút nè!",
        message: "Bạn đang nhập dở mã mời, bạn có chắc chắn muốn thoát không?",
        confirmText: "Thoát luôn",
        cancelText: "Ở lại tiếp",
      });
      if (!isOk) return;
    }
    setShowJoin(false);
    setJoinCode("");
    setJoinError(null);
  };

  const handleCloseEdit = async () => {
    const isChanged = editModal.name !== editModal.group?.name ||
      editModal.desc !== (editModal.group?.description || "");
    if (isChanged) {
      const isOk = await confirm({
        title: "Chưa lưu thay đổi!",
        message: "Thông tin thay đổi chưa được lưu, bạn có chắc chắn muốn hủy bỏ không?",
        confirmText: "Hủy bỏ",
        cancelText: "Ở lại lưu",
      });
      if (!isOk) return;
    }
    setEditModal({ visible: false, group: null, name: "", desc: "" });
  };

  const handleContextMenu = (e, group) => {
    e.preventDefault();
    if (group.ownerUid !== user.uid) return;
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, group });
  };

  const handleOpenEdit = () => {
    const g = contextMenu.group;
    if (!g) return;
    setEditModal({ visible: true, group: g, name: g.name, desc: g.description || "" });
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleSaveEdit = async () => {
    if (!editModal.name.trim()) return;
    try {
      await suaNhom(editModal.group.id, {
        name: editModal.name,
        description: editModal.desc
      });
      setEditModal({ visible: false, group: null, name: "", desc: "" });
      notifyLuuNhom();
    } catch {
      notifyError("Lưu thông tin nhóm thất bại. Vui lòng thử lại!");
    }
  };

  const handleDelete = async () => {
    const g = contextMenu.group;
    if (!g) return;
    const isOk = await confirm({
      title: "Xóa nhóm này sao?",
      message: `Bạn có chắc chắn muốn xóa nhóm "${g.name}"?`,
      confirmText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      variant: "danger"
    });
    if (isOk) {
      try {
        await xoaNhom(g.id);
        notifyXoaNhom();
      } catch {
        notifyError("Xóa nhóm thất bại. Vui lòng thử lại!");
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="py-10 md:py-16 flex flex-col w-full animate-fade-in px-6 max-w-7xl mx-auto relative">

      {/* Glow Decor Background */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-pink-200/20 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-blue-100/20 blur-[100px] rounded-full -z-10" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Không gian <span className="text-pink-500">Nhóm .</span>
          </h2>
          <p className="text-gray-400 font-bold text-lg">Tạo hoặc tham gia không gian chung cùng bạn bè</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (showJoin) await handleCloseJoin();
              else { setShowJoin(true); setShowCreate(false); setJoinError(null); }
            }}
            className="h-14 px-6 rounded-[22px] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 text-gray-600 hover:text-pink-500 font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            <span className={showJoin ? "hidden" : "block"}>Tham gia bằng mã</span>
          </button>

          <button
            onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className={`
              w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-xl shrink-0
              ${showCreate
                ? "bg-white border border-gray-100 text-gray-400 rotate-45 shadow-none"
                : "bg-gray-900 text-white shadow-gray-900/20 hover:bg-pink-600 hover:shadow-pink-500/30 hover:-translate-y-1"
              }
            `}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Inline Create Form - Modern Glassmorphism */}
      {showCreate && (
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[35px] border border-white shadow-2xl shadow-pink-500/5 mb-12 animate-slide-up max-w-2xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black text-gray-800">Khởi tạo nhóm mới</h3>
            <div className="grid gap-4">
              <Input
                placeholder="Tên nhóm (VD: Đi Đà Lạt 🍁)"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                className="!bg-gray-50/50 !border-gray-100 !rounded-2xl !h-14 focus:!bg-white focus:!ring-2 focus:!ring-pink-100 transition-all"
              />
              <Input
                as="textarea"
                rows={2}
                placeholder="Mô tả ngắn gọn cho nhóm..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={100}
                className="!bg-gray-50/50 !border-gray-100 !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600">Hủy</button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-8 py-3 bg-gray-900 text-white font-black text-xs uppercase tracking-[2px] rounded-2xl hover:bg-pink-600 shadow-lg disabled:opacity-20 transition-all active:scale-95"
              >
                Tạo nhóm ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <p className="text-gray-400 font-bold text-lg">Chưa có nhóm nào được tạo</p>
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

      {/* Join Group Modal */}
      {showJoin && (
        <div onClick={handleCloseJoin} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-[40px] w-full max-w-[440px] p-10 shadow-2xl animate-slide-up flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Tham gia nhóm</h3>
              <p className="text-gray-400 font-medium">Nhập mã mời 6 ký tự để gia nhập</p>
            </div>
            <Input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              className="!text-center !text-4xl !font-black !tracking-[10px] !h-20 !bg-gray-50 !border-none !rounded-3xl focus:!bg-pink-50 transition-all"
            />
            <div className="flex flex-col gap-3">
              <button onClick={handleJoin} disabled={joinCode.length !== 6 || isJoining} className="w-full h-14 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95 disabled:opacity-50">
                {isJoining ? "Đang xử lý..." : "Tham gia ngay ✦"}
              </button>
              <button onClick={handleCloseJoin} className="w-full h-12 text-gray-400 font-bold hover:text-gray-600">Để sau</button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu UI */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white py-2 w-52 z-[1000] animate-fade-in overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleOpenEdit}
            className="w-full px-5 py-3 text-sm font-bold text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Chỉnh sửa
          </button>
          <div className="h-[1px] bg-gray-100 mx-2"></div>
          <button
            onClick={handleDelete}
            className="w-full px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Xóa nhóm
          </button>
        </div>
      )}

      {/* Edit Modal UI */}
      {editModal.visible && (
        <div onClick={handleCloseEdit} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-[40px] w-full max-w-[480px] p-10 shadow-2xl animate-slide-up flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Chỉnh sửa nhóm</h3>
              <p className="text-gray-400 font-medium">Cập nhật thông tin không gian chung</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Tên nhóm</label>
                <Input
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  maxLength={40}
                  className="!bg-gray-50 !border-none !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Mô tả</label>
                <Input
                  as="textarea"
                  rows={3}
                  value={editModal.desc}
                  onChange={e => setEditModal({ ...editModal, desc: e.target.value })}
                  maxLength={100}
                  className="!bg-gray-50 !border-none !rounded-2xl focus:!bg-white focus:!ring-2 focus:!ring-pink-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditModal({ visible: false, group: null, name: "", desc: "" })}
                className="flex-1 py-4 text-sm font-black text-gray-400 hover:text-gray-600 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editModal.name.trim()}
                className="flex-[1.5] py-4 text-sm font-black text-white bg-gray-900 rounded-[22px] shadow-xl shadow-gray-900/10 hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50"
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

// --- Component GroupCard: GIỮ NGUYÊN HOÀN TOÀN NHƯ CODE GỐC CỦA BẠN ---
function GroupCard({ group, onClick, onContextMenu }) {
  const [memberProfiles, setMemberProfiles] = useState([]);

  useEffect(() => {
    let unsubUsers = [];

    if (group.members && group.members.length > 0) {
      const topMembers = group.members.slice(0, 4);
      const profilesMap = new Map();

      topMembers.forEach(uid => {
        const unsub = onSnapshot(doc(db, "users", uid), (uSnap) => {
          if (uSnap.exists()) {
            profilesMap.set(uid, uSnap.data());
          } else {
            profilesMap.delete(uid);
          }

          setMemberProfiles(() => {
            return topMembers.map(mUid => profilesMap.get(mUid)).filter(Boolean);
          });
        });
        unsubUsers.push(unsub);
      });
    } else {
      setMemberProfiles([]);
    }

    return () => {
      unsubUsers.forEach(unsub => unsub());
    };
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
          <h3 className="font-black text-2xl text-text-base group-hover:text-pink-brand transition-colors line-clamp-2 leading-tight flex-1 pr-2">
            {group.name}
          </h3>
          <div className="w-10 h-10 rounded-2xl bg-pink-faint flex items-center justify-center text-pink-brand shrink-0 group-hover:bg-pink-brand group-hover:text-white transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        {group.description ? (
          <p className="text-[15px] text-text-sub line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
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