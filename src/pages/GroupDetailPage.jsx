import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
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
import { useConfirm } from "../context/ConfirmContext";
import { notifyXoaWish, notifyXoaNhom, notifyLuuNhom, notifyCopied, notifyError } from "../utils/notify";
import Profile from "../Profile";

function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function GroupDetailPage({ user, userProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { suaNhom, xoaNhom } = useGroups(user);
  const confirm = useConfirm();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    items, xoaMon, thichMon, binhLuanMon, xoaBinhLuan
  } = useWishlist(user, userProfile, id);

  const isEditingRef = useRef(false);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    let unsubGroup;
    let unsubUsers = [];

    unsubGroup = onSnapshot(doc(db, "groups", id), (snap) => {
      if (!snap.exists()) {
        navigate("/groups");
        return;
      }

      const gData = snap.data();

      // Tự động tạo inviteCode nếu nhóm cũ chưa có
      if (!gData.inviteCode) {
        const newCode = generateInviteCode();
        updateDoc(doc(db, "groups", id), { inviteCode: newCode });
        gData.inviteCode = newCode;
      }

      setGroup(prev => {
        const currentProfiles = prev?.memberProfiles || [];
        return { ...gData, memberProfiles: currentProfiles };
      });

      if (!isEditingRef.current) {
        setEditName(gData.name);
        setEditDesc(gData.description || "");
      }

      // Lắng nghe realtime profile của các thành viên
      const memberIds = gData.members || [];

      unsubUsers.forEach(unsub => unsub());
      unsubUsers = [];

      if (memberIds.length === 0) {
        setGroup(prev => ({ ...prev, memberProfiles: [] }));
      } else {
        const profilesMap = new Map();

        memberIds.forEach(uid => {
          const unsub = onSnapshot(doc(db, "users", uid), (uSnap) => {
            if (uSnap.exists()) {
              profilesMap.set(uid, { uid, ...uSnap.data() });
            } else {
              profilesMap.delete(uid);
            }

            setGroup(prev => {
              if (!prev) return prev;
              const newProfiles = prev.members.map(mUid => profilesMap.get(mUid)).filter(Boolean);
              return { ...prev, memberProfiles: newProfiles };
            });

            // Cập nhật selectedUser realtime nếu đang xem
            setSelectedUser(current => {
              if (current && current.uid === uid) {
                return profilesMap.get(uid);
              }
              return current;
            });
          });
          unsubUsers.push(unsub);
        });
      }
    });

    return () => {
      if (unsubGroup) unsubGroup();
      unsubUsers.forEach(unsub => unsub());
    };
  }, [id, navigate]);

  async function handleXoa(wishId) {
    if (selectedItem?.id === wishId) setSelectedItem(null);
    notifyXoaWish();
    await xoaMon(wishId);
  }

  async function handleLuuGroup() {
    if (!editName.trim()) return;
    try {
      await suaNhom(id, { name: editName, description: editDesc });
      setGroup(prev => ({ ...prev, name: editName, description: editDesc }));
      setIsEditing(false);
      notifyLuuNhom();
    } catch {
      notifyError("Lưu thông tin nhóm thất bại. Vui lòng thử lại!");
    }
  }

  async function handleXoaGroup() {
    const ok = await confirm({
      title: "Giải tán nhóm?",
      message: "Bạn có chắc chắn muốn giải tán nhóm này? Toàn bộ thiết lập và lời mời sẽ bị hủy bỏ vĩnh viễn.",
      confirmText: "Giải tán",
      cancelText: "Hủy bỏ",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await xoaNhom(id);
      notifyXoaNhom();
      navigate("/groups");
    } catch {
      notifyError("Giải tán nhóm thất bại. Vui lòng thử lại!");
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
    notifyCopied();
  }

  const isOwner = group?.ownerUid === user?.uid || user?.email === ADMIN_EMAIL;

  if (!group) return <p className="py-10 text-center text-pink-brand animate-pulse">Đang tải phòng...</p>;

  return (
    <div className="flex w-full items-start transition-all duration-500 pt-6 md:pt-10">

      {/* CỘT MAIN CONTENT */}
      <div className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMembers ? "pr-6 lg:pr-10" : "pr-0"}`}>
        <button onClick={() => navigate("/groups")} className="text-sm font-semibold text-pink-muted hover:text-pink-brand mb-4 flex items-center gap-1 transition-colors">
          <span className="text-lg leading-none">←</span> Quay lại danh sách
        </button>

        <div className="group relative flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 bg-white p-6 sm:p-8 rounded-[24px] border border-pink-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          {/* Vạch trang trí bên trái */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-brand rounded-l-[24px]"></div>

          <div className="flex-1 min-w-0 ml-1.5 pr-0 sm:pr-[320px]">
            {isEditing ? (
              <div className="flex flex-col gap-3 mb-4 pr-0 sm:pr-8 animate-fade-in opacity-100">
                <div className="relative">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={40} placeholder="Tên không gian nhóm" />
                  <span className="absolute right-3 bottom-2 text-[10px] font-bold text-pink-muted/40 pointer-events-none">
                    {40 - editName.length}
                  </span>
                </div>
                <div className="relative">
                  <Input as="textarea" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={100} placeholder="Viết vài dòng giới thiệu..." />
                  <span className="absolute right-3 bottom-2 text-[10px] font-bold text-pink-muted/40 pointer-events-none">
                    {100 - editDesc.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" onClick={handleLuuGroup}>Lưu thiết lập</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setIsEditing(false); setEditName(group.name); setEditDesc(group.description || "");
                  }}>Hủy bỏ</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3 mb-1">
                  <h2 className="text-[28px] sm:text-[32px] font-black text-pink-brand tracking-tight leading-tight break-words">
                    {group.name}
                  </h2>
                  {isOwner && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pb-1.5">
                      <button onClick={() => setIsEditing(true)} className="p-1.5 text-pink-brand hover:bg-pink-50 rounded-lg transition-colors" title="Sửa tên nhóm">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button onClick={handleXoaGroup} className="p-1.5 text-pink-brand hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Giải tán nhóm này">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
                {group.description && (
                  <p className="mt-2 text-sm text-text-sub font-medium opacity-80 leading-relaxed break-words whitespace-pre-wrap max-w-2xl">
                    {group.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-full border border-gray-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-pink-muted/60"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span className="text-[11px] font-bold text-pink-muted uppercase tracking-widest whitespace-nowrap">
                      {formatDate(group.createdAt)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Cụm Micro-UI hiển thị thành viên */}
            <div
              className="flex items-center gap-2 mt-5 cursor-pointer group/members hover:bg-pink-50 w-fit px-3 py-2 -ml-3 rounded-2xl transition-colors"
              onClick={() => setShowMembers(true)}
              title="Xem danh sách thành viên"
            >
              <div className="flex -space-x-2">
                {group.memberProfiles?.slice(0, 3).map((profile, idx) => {
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
                {group.memberProfiles?.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[10px] text-pink-500 font-bold z-0">
                    +{group.memberProfiles.length - 3}
                  </div>
                )}
              </div>
              <span className="text-[13px] font-bold text-pink-soft ml-1.5 group-hover/members:text-pink-500 transition-colors">
                {group.members?.length || 1} thành viên <span className="opacity-50 ml-1 text-[10px]">▶</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 sm:absolute sm:top-8 sm:right-8 mt-6 sm:mt-0">
            {isOwner && group.inviteCode && (
              <div
                onClick={() => {
                  navigator.clipboard.writeText(group.inviteCode);
                  notifyCopied();
                }}
                className="group/code flex items-center gap-2.5 px-3 py-1.5 bg-pink-pale rounded-xl border border-pink-brand/10 cursor-pointer hover:bg-pink-brand/5 hover:border-pink-brand/30 transition-all duration-300 shadow-sm h-10"
                title="Nhấn để sao chép mã mời"
              >
                <span className="text-[9px] font-black text-pink-brand uppercase tracking-[1px] border-r border-pink-brand/10 pr-2.5">Mã mời</span>
                <span className="text-[13px] font-black text-pink-brand tracking-[2px]">{group.inviteCode}</span>
                <svg className="text-pink-brand/40 group-hover/code:text-pink-brand transition-all" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
            )}
            <button
              onClick={() => navigate(`/add/${id}`)}
              title="Thêm wish"
              className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-pink-brand/20 hover:scale-[1.05] active:scale-[0.95] transition-all font-bold"
            >
              <span className="text-xl">✦</span>
            </button>
            <button
              onClick={handleInvite}
              title="Mời tham gia"
              className="w-12 h-12 rounded-2xl bg-white border border-pink-border text-pink-brand flex items-center justify-center shadow-sm hover:bg-pink-faint transition-all shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>
        </div>

        <Stats items={items} />

        <WishList items={items} onSelectItem={setSelectedItem} />

        <ItemModal
          item={items.find(i => i.id === selectedItem?.id) || selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleXoa}
          user={user}
          userProfile={userProfile}
          adminEmail={ADMIN_EMAIL}
          onLike={thichMon}
          onComment={binhLuanMon}
          onDeleteComment={xoaBinhLuan}
          members={group.memberProfiles}
        />

        {/* NÚT TOGGLE THÀNH VIÊN GẮN CẠNH PHẢI */}
        <button
          onClick={() => setShowMembers(true)}
          title="Danh sách thành viên"
          className={`fixed top-1/2 right-0 -translate-y-1/2 bg-white border border-r-0 border-pink-100 shadow-[-5px_0_20px_rgba(236,72,153,0.1)] pl-2 pr-1 py-4 rounded-l-2xl z-[90] text-pink-400 hover:text-pink-500 hover:bg-pink-50 transition-all duration-500 flex flex-col items-center gap-1 ${showMembers ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-1"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

      </div> {/* END MAIN CONTENT COLUMN */}

      {/* CỘT SIDEBAR CHỨA PANEL */}
      <div className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMembers ? "w-[300px] sm:w-[340px] opacity-100 pointer-events-auto" : "w-0 opacity-0 pointer-events-none"}`}>

        {/* PANEL THỰC SỰ - STICKY ĐỂ LUÔN HIỆN */}
        <div
          className={`w-[300px] sm:w-[340px] sticky top-28 h-[calc(100vh-8rem)] bg-white rounded-[32px] border border-pink-100 shadow-[0_20px_50px_rgba(236,72,153,0.08)] z-[80] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMembers ? "translate-x-0" : "translate-x-[50px]"}`}
        >
          <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 className="text-[18px] font-black text-gray-900 tracking-tight flex items-center gap-2">
                Thành viên
                <span className="bg-pink-100 text-pink-500 text-[12px] px-2 py-0.5 rounded-full">{group.memberProfiles?.length || 0}</span>
              </h3>
            </div>
            <button className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-pink-500 transition-all" onClick={() => setShowMembers(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 bg-gray-50/30">
            {group.memberProfiles?.map((member, idx) => {
              const statusColors = { online: "#34d399", idle: "#fbbf24", dnd: "#f43f5e", offline: "#9ca3af" };
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 hover:bg-white rounded-2xl cursor-pointer transition-all duration-300 group/item hover:shadow-[0_4px_15px_rgba(236,72,153,0.05)] border border-transparent hover:border-pink-50"
                  onClick={() => setSelectedUser(member)}
                >
                  <div className="relative shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt="avatar" className="w-[46px] h-[46px] rounded-[16px] object-cover shadow-sm group-hover/item:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-[46px] h-[46px] rounded-[16px] bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover/item:scale-105 transition-transform duration-300">
                        {(member.displayName || member.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-[14px] h-[14px] rounded-full border-[2.5px] border-white flex items-center justify-center bg-white shadow-sm z-10 transition-colors">
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: statusColors[member.status || "online"] }}></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] text-gray-900 truncate group-hover/item:text-pink-600 transition-colors">{member.displayName || member.username}</div>
                    {member.customStatus ? (
                      <div className="text-[11px] text-pink-500 font-bold truncate mt-0.5 flex items-center gap-1">
                        <span>💭</span> {member.customStatus}
                      </div>
                    ) : (
                      <div className="text-[12px] text-gray-500 font-medium truncate mt-0.5">@{member.username}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HIỂN THỊ PROFILE THÀNH VIÊN */}
      {selectedUser && (
        <Profile
          userProfile={selectedUser}
          onClose={() => setSelectedUser(null)}
          isReadOnly={selectedUser.uid !== user?.uid}
        />
      )}
    </div>
  );
}
