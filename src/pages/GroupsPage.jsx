import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useGroups } from "../hooks/useGroups";

export default function GroupsPage({ user }) {
  const { groups, taoNhom } = useGroups(user);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

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

  return (
    <div className="py-10 flex flex-col w-full animate-fade-in px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-[32px] font-extrabold text-deep-red tracking-tight">Quản lý Nhóm</h2>
          <p className="text-pink-soft text-sm mt-1">Nơi kết nối và chia sẻ ước muốn cùng nhau</p>
        </div>
        <Button 
          onClick={() => setShowCreate(!showCreate)}
          className="w-full sm:w-auto px-6 h-[46px] shadow-sm"
        >
          {showCreate ? "Hủy" : "+ Tạo nhóm mới"}
        </Button>
      </div>

      {showCreate && (
        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-pink-border flex flex-col gap-5 animate-slide-up shadow-sm mb-10">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-deep-red text-xl">Khởi tạo không gian mới</h3>
            <p className="text-text-sub text-sm">Đặt tên và mô tả ngắn gọn cho nhóm của bạn</p>
          </div>
          <div className="flex flex-col gap-4">
            <Input label="Tên nhóm" placeholder="VD: Đi Đà Lạt 🍁" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Mô tả" as="textarea" rows={2} placeholder="Hành trình khám phá..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Thôi</Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>Tạo ngay ✨</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
        {groups.length === 0 && !showCreate && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-dashed border-pink-border px-6 text-center">
            <div className="w-16 h-16 bg-pink-faint rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">🏠</div>
            <h3 className="text-xl font-extrabold text-deep-red">Bạn chưa tham gia nhóm nào</h3>
            <p className="text-pink-soft text-sm mt-1.5 max-w-[320px]">Hãy cùng tạo một không gian riêng tư để lưu giữ những dự định chung của đôi mình nhé!</p>
          </div>
        )}
        {groups.map(g => (
          <GroupCard key={g.id} group={g} onClick={() => navigate(`/groups/${g.id}`)} />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ group, onClick }) {
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
          <p className="text-[15px] text-text-sub line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
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
