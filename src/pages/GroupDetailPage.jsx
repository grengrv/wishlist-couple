import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
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
import { useActivityLogs } from "../hooks/useActivityLogs";
import ActivityLog from "../components/ActivityLog";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";

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
  const { suaNhom, xoaNhom, kickMember, addMemberByUsername } = useGroups(user, userProfile);
  const confirm = useConfirm();
  const { t, lang } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [showMembers, setShowMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLandscapeWide, setIsLandscapeWide] = useState(false);

  useEffect(() => {
    const checkWide = () => setIsLandscapeWide(window.innerWidth >= 900 && window.matchMedia("(orientation: landscape)").matches);
    checkWide();
    window.addEventListener("resize", checkWide);
    return () => window.removeEventListener("resize", checkWide);
  }, []);

  const [loading, setLoading] = useState(true);
  const logs = useActivityLogs(id);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items, xoaMon, thichMon, binhLuanMon, xoaBinhLuan, thichBinhLuan
  } = useWishlist(user, userProfile, id);

  const [filterUserId, setFilterUserId] = useState("all");

  const filteredItems = React.useMemo(() => {
    if (filterUserId === "all") return items;
    return items.filter(item => item.uid === filterUserId);
  }, [items, filterUserId]);

  useEffect(() => {
    const wishId = searchParams.get("wishId");
    if (wishId && items.length > 0) {
      const item = items.find(i => i.id === wishId);
      if (item && selectedItem?.id !== item.id) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, items]);

  const handleCloseModal = () => {
    setSelectedItem(null);
    if (searchParams.has("wishId")) {
      searchParams.delete("wishId");
      setSearchParams(searchParams);
    }
  };

  const isEditingRef = useRef(false);
  const kickedRef = useRef(false);
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

      if (
        user &&
        gData.members &&
        !gData.members.includes(user.uid) &&
        user.email !== ADMIN_EMAIL &&
        !kickedRef.current
      ) {
        kickedRef.current = true;
        toast.error(t("access_denied"));
        setTimeout(() => {
          navigate("/groups");
        }, 1500);
        return;
      }

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
  }, [id, navigate, t]);

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
      notifyError(t("save_failed"));
    }
  }

  async function handleXoaGroup() {
    const ok = await confirm({
      title: t("disband_group_confirm"),
      message: t("disband_group_msg"),
      confirmText: t("disband"),
      cancelText: t("cancel"),
      variant: "danger",
    });
    if (!ok) return;
    try {
      await xoaNhom(id);
      notifyXoaNhom();
      navigate("/groups");
    } catch {
      notifyError(t("disband_failed"));
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function handleInvite() {
    const inviteLink = `${window.location.origin}/invite/${id}`;
    navigator.clipboard.writeText(inviteLink);
    notifyCopied();
  }

  const isOwner = group?.ownerUid === user?.uid || user?.email === ADMIN_EMAIL;

  async function handleAddMember() {
    if (!newUsername.trim()) return;
    setIsAdding(true);
    const res = await addMemberByUsername(id, newUsername);
    setIsAdding(false);

    if (res?.error === 404) toast.error(t("user_not_found"));
    else if (res?.error === 409) toast.error(t("already_member"));
    else if (res?.success) {
      toast.success(t("welcome_user", { username: newUsername }));
      setNewUsername("");
    } else {
      toast.error(t("add_member_failed"));
    }
  }

  async function handleKick(member) {
    const ok = await confirm({
      title: t("kick_member_confirm", { username: member.username }),
      message: t("kick_member_msg"),
      confirmText: t("confirm"),
      cancelText: t("cancel"),
      variant: "danger"
    });
    if (ok) {
      await kickMember(id, member.uid, member.username);
      toast.success(t("kick_success"));
    }
  }

  if (!group) return <p className="py-10 text-center text-pink-brand animate-pulse">{t("loading_room")}</p>;

  return (
    <div className="flex w-full items-start transition-all duration-500 pt-6 md:pt-10">

      {/* CỘT MAIN CONTENT */}
      <div className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMembers ? "pr-6 lg:pr-10" : "pr-0"}`}>
        <button onClick={() => navigate("/groups")} className="text-sm font-semibold text-text-muted hover:text-pink-brand mb-4 flex items-center gap-1 transition-colors">
          <span className="text-lg leading-none">←</span> {t("back_to_list")}
        </button>

        <div className="group relative flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 bg-card-bg p-6 sm:p-8 rounded-[24px] border border-border-primary shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          {/* Vạch trang trí bên trái */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-brand rounded-l-[24px]"></div>

          <div className="flex-1 min-w-0 ml-1.5 pr-0 sm:pr-[320px]">
            {isEditing ? (
              <div className="flex flex-col gap-3 mb-4 pr-0 sm:pr-8 animate-fade-in opacity-100">
                <div className="relative">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={40} placeholder={t("group_name_input")} />
                  <span className="absolute right-3 bottom-2 text-[10px] font-bold text-text-muted/40 pointer-events-none">
                    {40 - editName.length}
                  </span>
                </div>
                <div className="relative">
                  <Input as="textarea" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} maxLength={100} placeholder={t("group_desc_input")} />
                  <span className="absolute right-3 bottom-2 text-[10px] font-bold text-text-muted/40 pointer-events-none">
                    {100 - editDesc.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" onClick={handleLuuGroup}>{t("save_settings")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setIsEditing(false); setEditName(group.name); setEditDesc(group.description || "");
                  }}>{t("discard_changes")}</Button>
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
                      <button onClick={() => setIsEditing(true)} className="p-1.5 text-pink-brand hover:bg-pink-50 rounded-lg transition-colors" title={t("edit_group_name")}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                      <button onClick={handleXoaGroup} className="p-1.5 text-pink-brand hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t("disband_group_btn")}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
                {group.description && (
                  <p className="mt-2 text-sm text-text-secondary font-medium leading-relaxed break-words whitespace-pre-wrap max-w-2xl">
                    {group.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary/50 rounded-full border border-border-primary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted/60"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
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
              title={t("view_member_list")}
            >
              <div className="flex -space-x-2">
                {group.memberProfiles?.slice(0, 3).map((profile, idx) => {
                  const zIndices = ['z-20', 'z-10', 'z-0'];
                  if (profile.avatar) {
                    return <img key={idx} src={profile.avatar} alt="avatar" className={`w-8 h-8 rounded-full border-2 border-card-bg object-cover ${zIndices[idx]}`} />;
                  }
                  return (
                    <div key={idx} className={`w-8 h-8 rounded-full bg-bg-primary border-2 border-card-bg flex items-center justify-center text-[12px] text-pink-brand font-bold ${zIndices[idx]}`}>
                      {(profile.username || "?").charAt(0).toUpperCase()}
                    </div>
                  );
                })}
                {group.memberProfiles?.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-bg-primary border-2 border-card-bg flex items-center justify-center text-[10px] text-pink-500 font-bold z-0">
                    +{group.memberProfiles.length - 3}
                  </div>
                )}
              </div>
              <span className="text-[13px] font-bold text-pink-soft ml-1.5 group-hover/members:text-pink-500 transition-colors">
                {group.members?.length || 1} {t("member_count")} <span className="opacity-50 ml-1 text-[10px]">▶</span>
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
                title={t("copy_invite_tip")}
              >
                <span className="text-[9px] font-black text-pink-brand uppercase tracking-[1px] border-r border-pink-brand/10 pr-2.5">{t("invite_code_label")}</span>
                <span className="text-[13px] font-black text-pink-brand tracking-[2px]">{group.inviteCode}</span>
                <svg className="text-pink-brand/40 group-hover/code:text-pink-brand transition-all" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
            )}
            <button
              onClick={() => navigate(`/add/${id}`)}
              title={t("add_wish_tip")}
              className="w-12 h-12 rounded-2xl bg-text-primary text-bg-primary flex items-center justify-center shadow-lg shadow-pink-brand/20 hover:scale-[1.05] active:scale-[0.95] transition-all font-bold"
            >
              <span className="text-xl">✦</span>
            </button>
            <button
              onClick={handleInvite}
              title={t("invite_tip")}
              className="w-12 h-12 rounded-2xl bg-card-bg border border-border-primary text-pink-brand flex items-center justify-center shadow-sm hover:bg-card-hover transition-all shrink-0"
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

        {/* BỘ LỌC BÀI VIẾT THEO THÀNH VIÊN */}
        {group?.memberProfiles?.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
            <button
              onClick={() => setFilterUserId("all")}
              className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 ${filterUserId === "all" ? "bg-pink-hot text-white shadow-lg shadow-pink-hot/20" : "bg-card-bg border border-border-primary text-text-muted hover:border-pink-brand/30 hover:text-text-primary"}`}
            >
              <span className="font-bold text-xs uppercase tracking-widest">{t("all_items")}</span>
            </button>

            {group.memberProfiles.map(member => (
              <button
                key={member.uid}
                onClick={() => setFilterUserId(member.uid)}
                className={`flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-2xl whitespace-nowrap transition-all duration-300 ${filterUserId === member.uid ? "bg-pink-hot text-white shadow-lg shadow-pink-hot/20" : "bg-card-bg border border-border-primary text-text-secondary hover:border-pink-brand/30 hover:text-text-primary"}`}
              >
                {member.avatar ? (
                  <img src={member.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-[10px] font-bold text-pink-500">
                    {(member.displayName || member.username || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-xs">{member.displayName || member.username}</span>
              </button>
            ))}
          </motion.div>
        )}

        {filteredItems.length === 0 && filterUserId !== "all" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3 opacity-50">📭</div>
            <p className="text-sm font-bold text-text-muted italic uppercase tracking-widest">{t("no_posts_yet")}</p>
          </motion.div>
        ) : (
          <div className="w-full">
            <WishList items={filteredItems} onSelectItem={setSelectedItem} />
          </div>
        )}

        {/* NÚT TOGGLE THÀNH VIÊN GẮN CẠNH PHẢI */}
        <button
          onClick={() => setShowMembers(true)}
          title={t("members")}
          className={`fixed top-1/2 right-0 -translate-y-1/2 bg-card-bg border border-r-0 border-border-primary shadow-[-5px_0_20px_rgba(236,72,153,0.1)] pl-2 pr-1 py-4 rounded-l-2xl z-[90] text-text-muted hover:text-pink-500 hover:bg-card-hover transition-all duration-500 flex flex-col items-center gap-1 ${showMembers ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-1"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

      </div> {/* END MAIN CONTENT COLUMN */}

      {/* CỘT SIDEBAR CHỨA PANEL */}
      <div
        className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] 
        max-md:fixed max-md:inset-0 max-md:z-[150] max-md:bg-black/60 max-md:backdrop-blur-sm max-md:flex max-md:items-end
        ${showMembers ? "md:w-[300px] sm:w-[340px] opacity-100 pointer-events-auto" : "md:w-0 opacity-0 pointer-events-none"}`}
        onClick={() => setShowMembers(false)}
      >

        {/* PANEL THỰC SỰ - STICKY ĐỂ LUÔN HIỆN */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full md:w-[300px] sm:w-[340px] md:sticky md:top-28 
            max-md:h-[85vh] md:h-[calc(100vh-8rem)] bg-card-bg md:rounded-[32px] max-md:rounded-t-[32px] max-md:rounded-b-none border border-border-primary shadow-[0_20px_50px_rgba(236,72,153,0.08)] md:z-[80] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] max-md:pb-safe
            ${showMembers ? "translate-y-0 md:translate-x-0" : "max-md:translate-y-full md:translate-x-[50px]"}`}
        >
          <div className="p-6 border-b border-border-primary flex items-center justify-between bg-card-bg shrink-0">
            <div>
              <h3 className="text-[18px] font-black text-text-primary tracking-tight flex items-center gap-2">
                {t("members")}
                <span className="bg-bg-primary text-pink-500 text-[12px] px-2 py-0.5 rounded-full">{group.memberProfiles?.length || 0}</span>
              </h3>
            </div>
            <button className="w-8 h-8 rounded-xl bg-bg-primary flex items-center justify-center text-text-muted hover:bg-pink-500/10 hover:text-pink-500 transition-all" onClick={() => setShowMembers(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-bg-primary/30">

            {/* Top Section: Members */}
            <div className="flex-1 flex flex-col min-h-0 border-b border-border-primary/50 relative">

              {/* Add Member Section (Owner only) */}
              {isOwner && (
                <div className="shrink-0 p-3 border-b border-border-primary/30 bg-card-bg/50 backdrop-blur-md z-10">
                  <div className="px-3 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 px-1">{t("add_member")}</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder={t("username_placeholder")}
                        className="flex-1 bg-bg-secondary/50 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none focus:border-pink-500/50 transition-colors"
                      />
                      <button
                        onClick={handleAddMember}
                        disabled={isAdding || !newUsername.trim()}
                        className="w-10 h-10 bg-pink-hot text-white rounded-xl flex items-center justify-center shadow-lg shadow-pink-hot/20 disabled:opacity-30 active:scale-95 transition-all"
                      >
                        {isAdding ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "＋"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Member List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 px-4">{t("members_in_group")}</h4>
                  {group.memberProfiles?.length === 0 ? (
                    <p className="text-[11px] text-text-muted italic px-4">{t("no_members")}</p>
                  ) : (
                    <AnimatePresence initial={false}>
                      {group.memberProfiles?.map((member, idx) => {
                        const statusColors = { online: "#34d399", idle: "#fbbf24", dnd: "#f43f5e", offline: "#9ca3af" };
                        const isMemberOwner = member.uid === group.ownerUid;

                        return (
                          <motion.div
                            key={member.uid || idx}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 p-3 hover:bg-card-bg rounded-2xl cursor-pointer transition-colors duration-300 group/item hover:shadow-md border border-transparent hover:border-border-primary"
                            onClick={() => setSelectedUser(member)}
                          >
                            <div className="relative shrink-0">
                              {member.avatar ? (
                                <img src={member.avatar} alt="avatar" className="w-[40px] h-[40px] rounded-[14px] object-cover shadow-sm group-hover/item:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-[40px] h-[40px] rounded-[14px] bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover/item:scale-105 transition-transform duration-300">
                                  {(member.displayName || member.username || "?").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] rounded-full border-[2px] border-card-bg flex items-center justify-center bg-card-bg shadow-sm z-10 transition-colors">
                                <div className="w-full h-full rounded-full" style={{ backgroundColor: statusColors[member.status || "online"] }}></div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <div className="font-bold text-[13px] text-text-primary truncate group-hover/item:text-pink-600 transition-colors">{member.displayName || member.username}</div>
                                {isMemberOwner && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-pink-500/10 text-pink-500 rounded-md">{t("room_owner")}</span>}
                              </div>
                              <div className="text-[10px] text-text-muted font-medium truncate">@{member.username}</div>
                            </div>

                            {isOwner && member.uid !== user.uid && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleKick(member);
                                }}
                                className="opacity-0 group-hover/item:opacity-100 p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Activity Log */}
            <div className="flex-1 flex flex-col min-h-0 pt-4">
              <ActivityLog logs={logs} />
            </div>
          </div>
        </div>
      </div>

      {/* PORTALS */}
      {selectedUser && (
        <Profile
          userProfile={selectedUser}
          onClose={() => setSelectedUser(null)}
          isReadOnly={selectedUser.uid !== user?.uid}
        />
      )}

      {selectedItem && (
        <ItemModal
          item={items.find(i => i.id === selectedItem?.id) || selectedItem}
          onClose={handleCloseModal}
          onDelete={handleXoa}
          user={user}
          userProfile={userProfile}
          adminEmail={ADMIN_EMAIL}
          onLike={thichMon}
          onComment={binhLuanMon}
          onDeleteComment={xoaBinhLuan}
          onLikeComment={thichBinhLuan}
          members={group.memberProfiles}
          mode="group"
        />
      )}
    </div>
  );
}
