import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useGroups } from "../hooks/useGroups";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function InvitePage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { thamGiaNhom } = useGroups(user);
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState("loading");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    async function fetchGroup() {
      const snap = await getDoc(doc(db, "groups", id));
      if (snap.exists()) {
        const gData = snap.data();
        setGroup(gData);
        // Kiểm tra xem đã là thành viên chưa
        if (gData.members?.includes(user?.uid)) {
          navigate(`/groups/${id}`);
        } else {
          setStatus("ready");
        }
      } else {
        setStatus("not_found");
      }
    }
    if (user) fetchGroup();
  }, [id, user, navigate]);

  async function handleJoin() {
    setJoinError(null);

    // Nếu nhóm có mã mời, bắt buộc phải khớp
    if (group.inviteCode) {
      if (inviteCodeInput.trim().toUpperCase() !== group.inviteCode.toUpperCase()) {
        setJoinError("Mã mời không chính xác. Vui lòng kiểm tra lại!");
        return;
      }
    }

    setStatus("joining");
    await thamGiaNhom(id);
    navigate(`/groups/${id}`);
  }

  return (
    <div className="py-20 flex flex-col items-center max-w-[400px] mx-auto text-center px-5">
      {status === "loading" && <p className="text-pink-brand animate-pulse font-medium">Đang định vị lời mời...</p>}
      {status === "not_found" && <p className="text-[15px] text-pink-brand font-medium bg-red-50 p-4 rounded-2xl border border-red-100">Nhóm không tồn tại hoặc đã bị giải tán mất rồi.</p>}

      {status === "ready" && group && (
        <div className="bg-white p-8 rounded-[32px] border border-pink-border w-full flex flex-col items-center shadow-[0_20px_50px_rgba(194,24,91,0.1)] animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-pink-faint flex items-center justify-center text-pink-brand text-3xl mb-6 shadow-sm border border-pink-border/30">✨</div>
          <h2 className="text-2xl font-black text-text-base mb-2">Lời mời tham dự</h2>
          <p className="text-sm text-text-sub mb-4 font-medium opacity-80">Bạn vừa được gửi một vé tham gia không gian:</p>
          <h3 className="text-xl font-black text-pink-brand mb-8 px-4 py-2 bg-pink-faint/30 rounded-xl inline-block">"{group.name}"</h3>

          <div className="w-full flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold uppercase tracking-widest text-pink-muted ml-1">Nhập Mã Mời (6 ký tự)</label>
              <Input
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value.slice(0, 6))}
                placeholder="Ví dụ: ABC123"
                className="text-center font-black tracking-[4px] text-lg uppercase"
              />
              {joinError && <p className="text-[12px] font-bold text-red-500 mt-1 ml-1 animate-shake">⚠ {joinError}</p>}
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="ghost" className="flex-1 font-bold" onClick={() => navigate("/")}>Từ chối</Button>
            <Button
              className="flex-1 font-bold"
              onClick={handleJoin}
              disabled={inviteCodeInput.length !== 6}
            >
              Tham gia ngay
            </Button>
          </div>
        </div>
      )}

      {status === "joining" && <p className="text-pink-brand animate-pulse font-bold">Đang chuẩn bị chỗ ngồi, đợi xíu nha...</p>}
    </div>
  );
}
