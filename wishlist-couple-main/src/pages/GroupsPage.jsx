import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useGroups } from "../hooks/useGroups";
import { useConfirm } from "../context/ConfirmContext";
import { notifyTaoNhom, notifyXoaNhom, notifyThamGiaNhom, notifyLuuNhom, notifyError } from "../utils/notify";
import { useLanguage } from "../context/LanguageContext";

export default function GroupsPage({ user, userProfile }) {
  const { groups, taoNhom, suaNhom, xoaNhom, thamGiaBangMa } = useGroups(user, userProfile);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { t } = useLanguage();
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
        notifyError(t("update_failed"));
      }
    } catch {
      notifyError(t("update_failed"));
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
      notifyError(t("update_failed"));
    } finally {
      setIsJoining(false);
    }
  }

  const handleCloseJoin = async () => {
    if (joinCode.length > 0) {
      const isOk = await confirm({
        title: t("wait_a_minute"),
        message: t("exit_confirm_join"),
        confirmText: t("exit_now"),
        cancelText: t("stay_here"),
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
        title: t("unsaved_changes"),
        message: t("unsaved_msg"),
        confirmText: t("discard_changes"),
        cancelText: t("stay_to_save"),
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
      notifyError(t("update_failed"));
    }
  };

  const handleDelete = async () => {
    const g = contextMenu.group;
    if (!g) return;
    const isOk = await confirm({
      title: t("delete_group_confirm"),
      message: t("delete_group_msg", { groupName: g.name }),
      confirmText: t("delete_permanently"),
      cancelText: t("cancel"),
      variant: "danger"
    });
    if (isOk) {
      try {
        await xoaNhom(g.id);
        notifyXoaNhom();
      } catch {
        notifyError(t("update_failed"));
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
          <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter mb-2">
            {t("groups_title").split(" ").map((w, i) => i === t("groups_title").split(" ").length - 2 ? <span key={i} className="text-pink-500">{w} </span> : w + " ")}
          </h2>
          <p className="text-text-secondary font-bold text-lg">{t("groups_subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              if (showJoin) await handleCloseJoin();
              else { setShowJoin(true); setShowCreate(false); setJoinError(null); }
            }}
            className="h-14 px-6 rounded-[22px] bg-card-bg border border-border-primary shadow-sm hover:shadow-md hover:border-pink-200 text-text-secondary hover:text-pink-500 font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            <span className={showJoin ? "hidden" : "block"}>{t("join_with_code")}</span>
          </button>

          <button
            onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className={`
              w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-xl shrink-0
              ${showCreate
                ? "bg-card-bg border border-border-primary text-text-muted rotate-45 shadow-none"
                : "bg-text-primary text-bg-primary shadow-pink-500/10 hover:bg-pink-600 hover:shadow-pink-500/30 hover:-translate-y-1"
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
        <div className="bg-card-bg/70 backdrop-blur-xl p-8 rounded-[35px] border border-border-primary shadow-2xl shadow-pink-500/5 mb-12 animate-slide-up max-w-2xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black text-text-primary">{t("create_new_group_title")}</h3>
            <div className="grid gap-4">
              <Input
                placeholder={t("group_name_placeholder")}
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                className="!bg-bg-primary/50 !border-border-primary !rounded-2xl !h-14 focus:!bg-card-bg focus:!ring-2 focus:!ring-pink-100 transition-all"
              />
              <Input
                as="textarea"
                rows={2}
                placeholder={t("group_desc_placeholder")}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={100}
                className="!bg-bg-primary/50 !border-border-primary !rounded-2xl focus:!bg-card-bg focus:!ring-2 focus:!ring-pink-100 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-6 py-2 font-bold text-text-muted hover:text-text-secondary">{t("cancel")}</button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-8 py-3 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-[2px] rounded-2xl hover:bg-pink-600 shadow-lg disabled:opacity-20 transition-all active:scale-95"
              >
                {t("create_group_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-bg-primary/50 rounded-[40px] border-2 border-dashed border-border-primary text-center">
            <div className="w-20 h-20 bg-card-bg rounded-3xl shadow-sm flex items-center justify-center text-text-muted mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <p className="text-text-muted font-bold text-lg">{t("no_groups_yet")}</p>
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
        <div onClick={handleCloseJoin} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in">
          <div onClick={e => e.stopPropagation()} className="bg-card-bg rounded-[40px] w-full max-w-[440px] p-10 shadow-2xl animate-slide-up flex flex-col gap-8 border border-border-primary">
            <div className="text-center">
              <h3 className="text-3xl font-black text-text-primary tracking-tight mb-2">{t("join_group_title")}</h3>
              <p className="text-text-muted font-medium">{t("join_group_subtitle")}</p>
            </div>
            <Input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              className="!text-center !text-4xl !font-black !tracking-[10px] !h-20 !bg-bg-primary !border-none !rounded-3xl focus:!bg-pink-50 transition-all"
            />
            <div className="flex flex-col gap-3">
              <button onClick={handleJoin} disabled={joinCode.length !== 6 || isJoining} className="w-full h-14 bg-text-primary text-bg-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/10 active:scale-95 disabled:opacity-50">
                {isJoining ? t("processing") : t("join_now")}
              </button>
              <button onClick={handleCloseJoin} className="w-full h-12 text-text-muted font-bold hover:text-text-secondary">{t("later")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu UI */}
      {contextMenu.visible && (
        <div
          className="fixed bg-card-bg/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-border-primary py-2 w-52 z-[1000] animate-fade-in overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleOpenEdit}
            className="w-full px-5 py-3 text-sm font-bold text-text-secondary hover:bg-pink-500/10 hover:text-pink-600 flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            {t("edit_group")}
          </button>
          <div className="h-[1px] bg-border-primary mx-2"></div>
          <button
            onClick={handleDelete}
            className="w-full px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            {t("delete_group_btn")}
          </button>
        </div>
      )}

      {/* Edit Modal UI */}
      {editModal.visible && (
        <div onClick={handleCloseEdit} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-6 animate-fade-in">
          <div onClick={e => e.stopPropagation()} className="bg-card-bg rounded-[40px] w-full max-w-[480px] p-10 shadow-2xl animate-slide-up flex flex-col gap-8 border border-border-primary">
            <div className="text-center">
              <h3 className="text-3xl font-black text-text-primary tracking-tight mb-2">{t("edit_group_title")}</h3>
              <p className="text-text-muted font-medium">{t("edit_group_subtitle")}</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">{t("group_name_placeholder").split(" (")[0]}</label>
                <Input
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  maxLength={40}
                  className="!bg-bg-primary !border-none !rounded-2xl focus:!bg-card-bg focus:!ring-2 focus:!ring-pink-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">{t("description")}</label>
                <Input
                  as="textarea"
                  rows={3}
                  value={editModal.desc}
                  onChange={e => setEditModal({ ...editModal, desc: e.target.value })}
                  maxLength={100}
                  className="!bg-bg-primary !border-none !rounded-2xl focus:!bg-card-bg focus:!ring-2 focus:!ring-pink-100 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditModal({ visible: false, group: null, name: "", desc: "" })}
                className="flex-1 py-4 text-sm font-black text-text-muted hover:text-text-secondary transition-all"
              >
                {t("discard_changes")}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editModal.name.trim()}
                className="flex-[1.5] py-4 text-sm font-black text-bg-primary bg-text-primary rounded-[22px] shadow-xl shadow-pink-500/10 hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {t("save_changes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, onClick, onContextMenu }) {
  const { t } = useLanguage();
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
      className="group p-7 bg-card-bg rounded-[28px] border border-border-primary cursor-pointer hover:bg-card-hover hover:border-pink-brand hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-faint/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>

      <div className="relative flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-black text-2xl text-text-primary group-hover:text-pink-brand transition-colors line-clamp-2 leading-tight flex-1 pr-2">
            {group.name}
          </h3>
          <div className="w-10 h-10 rounded-2xl bg-bg-primary flex items-center justify-center text-pink-brand shrink-0 group-hover:bg-pink-brand group-hover:text-white transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        {group.description ? (
          <p className="text-[15px] text-text-secondary line-clamp-2 leading-relaxed group-hover:text-text-primary transition-colors">
            {group.description}
          </p>
        ) : (
          <p className="text-sm text-pink-muted italic opacity-60">{t("private_space")}</p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border-primary/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {memberProfiles.length > 0 ? (
              memberProfiles.map((p, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-[3px] border-card-bg overflow-hidden bg-card-bg shadow-sm transition-transform group-hover:scale-110" style={{ zIndex: 10 - i }}>
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-primary text-[12px] font-bold text-pink-brand">
                      {p.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )
                  }
                </div>
              ))
            ) : (
              <div className="w-9 h-9 rounded-full border-[3px] border-card-bg bg-bg-primary flex items-center justify-center text-[12px] font-bold text-pink-brand shadow-sm">
                ?
              </div>
            )}
            {group.members?.length > 4 && (
              <div className="w-9 h-9 rounded-full border-[3px] border-card-bg bg-pink-light flex items-center justify-center text-[11px] font-bold text-white z-0 shadow-sm">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-text-primary leading-none">
              {group.members?.length || 1} {t("member_count")}
            </span>
            <span className="text-[11px] font-medium text-pink-soft mt-1">{t("ready_to_share")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}